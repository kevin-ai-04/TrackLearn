import "server-only";

import { ObjectId } from "mongodb";
import { extractMarkdownHeadings } from "@/lib/markdown";
import { ensureAppIndexes, getDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import { normalizeRouteSegment } from "@/lib/utils";
import type { EntryKind, PublicationRequestType } from "@/types/content";
import type {
  EntryDocument,
  PublicationRequestDocument,
  SubjectDocument,
} from "@/types/database";

function assertDatabaseConfigured() {
  if (!isDatabaseConfigured()) {
    throw new Error("MongoDB is not configured.");
  }
}

function parseOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseRequiredText(value: FormDataEntryValue | null, label: string) {
  const parsed = parseOptionalText(value);

  if (!parsed) {
    throw new Error(`${label} is required.`);
  }

  return parsed;
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

async function readMarkdownFromForm(formData: FormData) {
  const text = parseOptionalText(formData.get("markdown"));
  const file = formData.get("markdownFile");

  if (file instanceof File && file.size > 0) {
    const extension = file.name.toLowerCase().split(".").pop();

    if (extension !== "md" && extension !== "markdown" && file.type && !file.type.includes("markdown")) {
      throw new Error("Only Markdown uploads are supported.");
    }

    const content = (await file.text()).trim();

    if (!content) {
      throw new Error("Uploaded Markdown file is empty.");
    }

    if (content.length > 200_000) {
      throw new Error("Uploaded Markdown file is too large.");
    }

    return content;
  }

  if (!text) {
    throw new Error("Markdown content is required.");
  }

  if (text.length > 200_000) {
    throw new Error("Markdown content is too large.");
  }

  return text;
}

async function getSubjectById(subjectId: string) {
  const db = await getDatabase();
  return db.collection<SubjectDocument>("subjects").findOne({
    _id: new ObjectId(subjectId),
  });
}

async function getEntryById(entryId: string) {
  const db = await getDatabase();
  return db.collection<EntryDocument>("entries").findOne({
    _id: new ObjectId(entryId),
  });
}

async function assertWritableSubject(userId: string, subjectId: string) {
  const subject = await getSubjectById(subjectId);

  if (!subject) {
    throw new Error("Subject not found.");
  }

  if (subject.visibility === "private" && subject.ownerUserId !== userId) {
    throw new Error("You do not have access to that subject.");
  }

  return subject;
}

async function assertOwnedSubject(userId: string, subjectId: string) {
  const subject = await getSubjectById(subjectId);

  if (!subject || subject.ownerUserId !== userId || subject.visibility !== "private") {
    throw new Error("Private subject not found.");
  }

  return subject;
}

async function assertOwnedEntry(userId: string, entryId: string) {
  const entry = await getEntryById(entryId);

  if (!entry || entry.ownerUserId !== userId || entry.visibility !== "private") {
    throw new Error("Private entry not found.");
  }

  return entry;
}

async function assertPublicEntry(entryId: string) {
  const entry = await getEntryById(entryId);

  if (!entry || entry.visibility !== "public") {
    throw new Error("Public entry not found.");
  }

  return entry;
}

function getReviewResetFields<T extends { publishedEntryId?: string | null; publishedSubjectId?: string | null }>(
  document: T,
) {
  if (document.publishedEntryId || document.publishedSubjectId) {
    return {
      status: "draft" as const,
      reviewNotes: null,
    };
  }

  return {};
}

function getPublicEntryPath(subjectSlug: string, kind: EntryKind, entrySlug: string) {
  return kind === "module"
    ? `/${subjectSlug}/${entrySlug}`
    : `/${subjectSlug}/materials/${entrySlug}`;
}

export async function createSubjectForUser(userId: string, formData: FormData) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const now = new Date().toISOString();

  const title = parseRequiredText(formData.get("title"), "Subject title");
  const slug = normalizeRouteSegment(parseOptionalText(formData.get("slug")) ?? title);
  const description = parseOptionalText(formData.get("description"));
  const order = parseOptionalNumber(formData.get("order"));

  const result = await db
    .collection<Omit<SubjectDocument, "_id"> & { _id?: ObjectId }>("subjects")
    .insertOne({
      title,
      slug,
      description,
      order,
      visibility: "private",
      status: "draft",
      ownerUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

  return result.insertedId.toHexString();
}

export async function updateSubjectForUser(userId: string, subjectId: string, formData: FormData) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const subject = await assertOwnedSubject(userId, subjectId);
  const now = new Date().toISOString();

  const title = parseRequiredText(formData.get("title"), "Subject title");
  const slug = normalizeRouteSegment(parseOptionalText(formData.get("slug")) ?? title);
  const description = parseOptionalText(formData.get("description"));
  const order = parseOptionalNumber(formData.get("order"));

  await db.collection<SubjectDocument>("subjects").updateOne(
    { _id: subject._id },
    {
      $set: {
        title,
        slug,
        description,
        order,
        updatedAt: now,
        ...getReviewResetFields(subject),
      },
    },
  );
}

export async function deleteSubjectForUser(userId: string, subjectId: string) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const subject = await assertOwnedSubject(userId, subjectId);

  await db.collection<EntryDocument>("entries").deleteMany({
    ownerUserId: userId,
    visibility: "private",
    subjectId: subject._id.toHexString(),
  });
  await db.collection<SubjectDocument>("subjects").deleteOne({
    _id: subject._id,
  });
}

export async function createEntryForUser(userId: string, formData: FormData) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const now = new Date().toISOString();

  const subjectId = parseRequiredText(formData.get("subjectId"), "Subject");
  const kind = parseRequiredText(formData.get("kind"), "Entry kind") as EntryKind;
  const subject = await assertWritableSubject(userId, subjectId);
  const title = parseRequiredText(formData.get("title"), "Entry title");
  const slug = normalizeRouteSegment(parseOptionalText(formData.get("slug")) ?? title);
  const description = parseOptionalText(formData.get("description"));
  const order = parseOptionalNumber(formData.get("order"));
  const markdown = await readMarkdownFromForm(formData);
  const linkedPublicEntryId = parseOptionalText(formData.get("linkedPublicEntryId")) ?? null;

  const result = await db
    .collection<Omit<EntryDocument, "_id"> & { _id?: ObjectId }>("entries")
    .insertOne({
      subjectId: subject._id.toHexString(),
      kind,
      title,
      slug,
      description,
      order,
      markdown,
      headings: extractMarkdownHeadings(markdown),
      visibility: "private",
      status: "draft",
      ownerUserId: userId,
      linkedPublicEntryId,
      createdAt: now,
      updatedAt: now,
    });

  return result.insertedId.toHexString();
}

export async function updateEntryForUser(userId: string, entryId: string, formData: FormData) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const entry = await assertOwnedEntry(userId, entryId);
  const subjectId = parseRequiredText(formData.get("subjectId"), "Subject");
  const subject = await assertWritableSubject(userId, subjectId);
  const now = new Date().toISOString();

  const title = parseRequiredText(formData.get("title"), "Entry title");
  const slug = normalizeRouteSegment(parseOptionalText(formData.get("slug")) ?? title);
  const description = parseOptionalText(formData.get("description"));
  const order = parseOptionalNumber(formData.get("order"));
  const markdown = await readMarkdownFromForm(formData);
  const linkedPublicEntryId = parseOptionalText(formData.get("linkedPublicEntryId")) ?? null;

  await db.collection<EntryDocument>("entries").updateOne(
    { _id: entry._id },
    {
      $set: {
        subjectId: subject._id.toHexString(),
        kind: parseRequiredText(formData.get("kind"), "Entry kind") as EntryKind,
        title,
        slug,
        description,
        order,
        markdown,
        headings: extractMarkdownHeadings(markdown),
        linkedPublicEntryId,
        updatedAt: now,
        ...getReviewResetFields(entry),
      },
    },
  );
}

export async function deleteEntryForUser(userId: string, entryId: string) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const entry = await assertOwnedEntry(userId, entryId);

  await db.collection<EntryDocument>("entries").deleteOne({
    _id: entry._id,
  });
}

export async function updatePublicEntryAsAdmin(entryId: string, formData: FormData) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const entry = await assertPublicEntry(entryId);
  const subject = await getSubjectById(entry.subjectId);

  if (!subject || subject.visibility !== "public") {
    throw new Error("Parent public subject not found.");
  }

  const now = new Date().toISOString();
  const title = parseRequiredText(formData.get("title"), "Entry title");
  const slug = normalizeRouteSegment(parseOptionalText(formData.get("slug")) ?? title);
  const description = parseOptionalText(formData.get("description"));
  const order = parseOptionalNumber(formData.get("order"));
  const markdown = parseRequiredText(formData.get("markdown"), "Markdown content");
  const kind = parseRequiredText(formData.get("kind"), "Entry kind") as EntryKind;

  await db.collection<EntryDocument>("entries").updateOne(
    { _id: entry._id },
    {
      $set: {
        kind,
        title,
        slug,
        description,
        order,
        markdown,
        headings: extractMarkdownHeadings(markdown),
        updatedAt: now,
      },
    },
  );

  return {
    subjectSlug: subject.slug,
    previousPath: getPublicEntryPath(subject.slug, entry.kind, entry.slug),
    nextPath: getPublicEntryPath(subject.slug, kind, slug),
  };
}

async function createPublicationRequest(
  request: Omit<PublicationRequestDocument, "_id">,
) {
  const db = await getDatabase();
  const result = await db
    .collection<Omit<PublicationRequestDocument, "_id"> & { _id?: ObjectId }>("publicationRequests")
    .insertOne(request);
  return result.insertedId.toHexString();
}

export async function submitSubjectForReview(userId: string, subjectId: string) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const subject = await assertOwnedSubject(userId, subjectId);
  const now = new Date().toISOString();

  const requestType: PublicationRequestType = subject.publishedSubjectId
    ? "update_published_content"
    : "create_public_subject";

  const requestId = await createPublicationRequest({
    requesterUserId: userId,
    subjectId,
    requestType,
    status: "pending",
    snapshot: {
      title: subject.title,
      slug: subject.slug,
      description: subject.description,
      order: subject.order,
      subjectId,
      subjectTitle: subject.title,
      subjectSlug: subject.slug,
    },
    createdAt: now,
    updatedAt: now,
  });

  await db.collection<SubjectDocument>("subjects").updateOne(
    { _id: subject._id },
    {
      $set: {
        status: "pending_review",
        lastSubmittedAt: now,
        reviewNotes: null,
        updatedAt: now,
      },
    },
  );

  return requestId;
}

export async function submitEntryForReview(userId: string, entryId: string) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const entry = await assertOwnedEntry(userId, entryId);
  const subject = await getSubjectById(entry.subjectId);

  if (!subject) {
    throw new Error("Parent subject was not found.");
  }

  const now = new Date().toISOString();
  const requestType: PublicationRequestType = entry.publishedEntryId
    ? "update_published_content"
    : "create_public_entry";

  const requestId = await createPublicationRequest({
    requesterUserId: userId,
    entryId,
    subjectId: subject._id.toHexString(),
    requestType,
    status: "pending",
    snapshot: {
      kind: entry.kind,
      title: entry.title,
      slug: entry.slug,
      description: entry.description,
      order: entry.order,
      markdown: entry.markdown,
      headings: entry.headings,
      subjectId: subject._id.toHexString(),
      subjectTitle: subject.title,
      subjectSlug: subject.slug,
      linkedPublicEntryId: entry.linkedPublicEntryId ?? null,
    },
    createdAt: now,
    updatedAt: now,
  });

  await db.collection<EntryDocument>("entries").updateOne(
    { _id: entry._id },
    {
      $set: {
        status: "pending_review",
        lastSubmittedAt: now,
        reviewNotes: null,
        updatedAt: now,
      },
    },
  );

  return requestId;
}

async function ensurePublicSubjectCopy(
  db: Awaited<ReturnType<typeof getDatabase>>,
  sourceSubject: SubjectDocument,
  requestId: string,
  now: string,
) {
  if (sourceSubject.visibility === "public") {
    return sourceSubject._id.toHexString();
  }

  if (sourceSubject.publishedSubjectId) {
    await db.collection<SubjectDocument>("subjects").updateOne(
      { _id: new ObjectId(sourceSubject.publishedSubjectId) },
      {
        $set: {
          title: sourceSubject.title,
          slug: sourceSubject.slug,
          description: sourceSubject.description,
          order: sourceSubject.order,
          status: "published",
          ownerUserId: sourceSubject.ownerUserId,
          sourceSubjectId: sourceSubject._id.toHexString(),
          updatedAt: now,
        },
      },
    );

    return sourceSubject.publishedSubjectId;
  }

  const result = await db
    .collection<Omit<SubjectDocument, "_id"> & { _id?: ObjectId }>("subjects")
    .insertOne({
      title: sourceSubject.title,
      slug: sourceSubject.slug,
      description: sourceSubject.description,
      order: sourceSubject.order,
      visibility: "public",
      status: "published",
      ownerUserId: sourceSubject.ownerUserId,
      sourceSubjectId: sourceSubject._id.toHexString(),
      publishedFromRequestId: requestId,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

  await db.collection<SubjectDocument>("subjects").updateOne(
    { _id: sourceSubject._id },
    {
      $set: {
        status: "published",
        publishedSubjectId: result.insertedId.toHexString(),
        publishedFromRequestId: requestId,
        publishedAt: now,
        lastReviewedAt: now,
        updatedAt: now,
      },
    },
  );

  return result.insertedId.toHexString();
}

async function approveSubjectRequest(
  db: Awaited<ReturnType<typeof getDatabase>>,
  request: PublicationRequestDocument,
  subject: SubjectDocument,
  now: string,
) {
  const publicSubjectId = await ensurePublicSubjectCopy(db, subject, request._id.toHexString(), now);

  await db.collection<SubjectDocument>("subjects").updateOne(
    { _id: subject._id },
    {
      $set: {
        status: "published",
        publishedSubjectId: publicSubjectId,
        publishedFromRequestId: request._id.toHexString(),
        publishedAt: subject.publishedAt ?? now,
        lastReviewedAt: now,
        reviewNotes: request.reviewNotes ?? null,
        updatedAt: now,
      },
    },
  );
}

async function approveEntryRequest(
  db: Awaited<ReturnType<typeof getDatabase>>,
  request: PublicationRequestDocument,
  entry: EntryDocument,
  now: string,
) {
  const sourceSubject = await getSubjectById(entry.subjectId);

  if (!sourceSubject) {
    throw new Error("Entry subject not found.");
  }

  const publicSubjectId = await ensurePublicSubjectCopy(
    db,
    sourceSubject,
    request._id.toHexString(),
    now,
  );

  if (entry.publishedEntryId) {
    await db.collection<EntryDocument>("entries").updateOne(
      { _id: new ObjectId(entry.publishedEntryId) },
      {
        $set: {
          subjectId: publicSubjectId,
          kind: entry.kind,
          title: entry.title,
          slug: entry.slug,
          description: entry.description,
          order: entry.order,
          markdown: entry.markdown,
          headings: entry.headings,
          visibility: "public",
          status: "published",
          ownerUserId: entry.ownerUserId,
          sourceEntryId: entry._id.toHexString(),
          updatedAt: now,
        },
      },
    );
  } else {
    const result = await db
      .collection<Omit<EntryDocument, "_id"> & { _id?: ObjectId }>("entries")
      .insertOne({
        subjectId: publicSubjectId,
        kind: entry.kind,
        title: entry.title,
        slug: entry.slug,
        description: entry.description,
        order: entry.order,
        markdown: entry.markdown,
        headings: entry.headings,
        visibility: "public",
        status: "published",
        ownerUserId: entry.ownerUserId,
        sourceEntryId: entry._id.toHexString(),
        publishedFromRequestId: request._id.toHexString(),
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });

    await db.collection<EntryDocument>("entries").updateOne(
      { _id: entry._id },
      {
        $set: {
          publishedEntryId: result.insertedId.toHexString(),
        },
      },
    );
  }

  await db.collection<EntryDocument>("entries").updateOne(
    { _id: entry._id },
    {
      $set: {
        status: "published",
        publishedFromRequestId: request._id.toHexString(),
        publishedAt: entry.publishedAt ?? now,
        lastReviewedAt: now,
        reviewNotes: request.reviewNotes ?? null,
        updatedAt: now,
      },
    },
  );
}

export async function reviewPublicationRequest(options: {
  adminUserId: string;
  requestId: string;
  decision: "approve" | "reject";
  reviewNotes?: string;
}) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();
  const request = await db.collection<PublicationRequestDocument>("publicationRequests").findOne({
    _id: new ObjectId(options.requestId),
  });

  if (!request) {
    throw new Error("Publication request not found.");
  }

  const now = new Date().toISOString();
  const normalizedNotes = options.reviewNotes?.trim() || null;

  await db.collection<PublicationRequestDocument>("publicationRequests").updateOne(
    { _id: request._id },
    {
      $set: {
        status: options.decision === "approve" ? "approved" : "rejected",
        reviewerUserId: options.adminUserId,
        reviewNotes: normalizedNotes,
        reviewedAt: now,
        updatedAt: now,
      },
    },
  );

  if (request.subjectId && !request.entryId) {
    const subject = await getSubjectById(request.subjectId);

    if (subject && subject.visibility === "private") {
      if (options.decision === "approve") {
        await approveSubjectRequest(
          db,
          {
            ...request,
            reviewNotes: normalizedNotes,
          },
          subject,
          now,
        );
      } else {
        await db.collection<SubjectDocument>("subjects").updateOne(
          { _id: subject._id },
          {
            $set: {
              status: "changes_requested",
              reviewNotes: normalizedNotes,
              lastReviewedAt: now,
              updatedAt: now,
            },
          },
        );
      }
    }
  }

  if (request.entryId) {
    const entry = await getEntryById(request.entryId);

    if (entry && entry.visibility === "private") {
      if (options.decision === "approve") {
        await approveEntryRequest(
          db,
          {
            ...request,
            reviewNotes: normalizedNotes,
          },
          entry,
          now,
        );
      } else {
        await db.collection<EntryDocument>("entries").updateOne(
          { _id: entry._id },
          {
            $set: {
              status: "changes_requested",
              reviewNotes: normalizedNotes,
              lastReviewedAt: now,
              updatedAt: now,
            },
          },
        );
      }
    }
  }
}

export async function unpublishPublicContent(options: {
  subjectId?: string;
  entryId?: string;
}) {
  assertDatabaseConfigured();
  await ensureAppIndexes();
  const db = await getDatabase();

  if (options.entryId) {
    const entry = await getEntryById(options.entryId);

    if (!entry || entry.visibility !== "public") {
      throw new Error("Public entry not found.");
    }

    await db.collection<EntryDocument>("entries").deleteOne({ _id: entry._id });

    if (entry.sourceEntryId) {
      await db.collection<EntryDocument>("entries").updateOne(
        { _id: new ObjectId(entry.sourceEntryId) },
        {
          $set: {
            publishedEntryId: null,
            status: "draft",
            updatedAt: new Date().toISOString(),
          },
        },
      );
    }

    return;
  }

  if (options.subjectId) {
    const subject = await getSubjectById(options.subjectId);

    if (!subject || subject.visibility !== "public") {
      throw new Error("Public subject not found.");
    }

    const publicEntries = await db.collection<EntryDocument>("entries").find({
      subjectId: subject._id.toHexString(),
      visibility: "public",
    }).toArray();

    await db.collection<EntryDocument>("entries").deleteMany({
      subjectId: subject._id.toHexString(),
      visibility: "public",
    });
    await db.collection<SubjectDocument>("subjects").deleteOne({
      _id: subject._id,
    });

    if (subject.sourceSubjectId) {
      await db.collection<SubjectDocument>("subjects").updateOne(
        { _id: new ObjectId(subject.sourceSubjectId) },
        {
          $set: {
            publishedSubjectId: null,
            status: "draft",
            updatedAt: new Date().toISOString(),
          },
        },
      );
    }

    const sourceEntryIds = publicEntries
      .map((entry) => entry.sourceEntryId)
      .filter((entryId): entryId is string => Boolean(entryId));

    if (sourceEntryIds.length) {
      await db.collection<EntryDocument>("entries").updateMany(
        {
          _id: {
            $in: sourceEntryIds.map((entryId) => new ObjectId(entryId)),
          },
        },
        {
          $set: {
            publishedEntryId: null,
            status: "draft",
            updatedAt: new Date().toISOString(),
          },
        },
      );
    }
  }
}
