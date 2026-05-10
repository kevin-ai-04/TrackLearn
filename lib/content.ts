import "server-only";

import { ObjectId } from "mongodb";
import { cache } from "react";
import { unstable_cache as nextCache, unstable_noStore as noStore } from "next/cache";
import { ensureAppIndexes, getDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import {
  getFilesystemContentTree,
  getFilesystemMaterialBySlugs,
  getFilesystemModuleBySlugs,
  getFilesystemNavigationTree,
  getFilesystemSubjectBySlug,
} from "@/lib/fs-content";
import { buildSubjectHref, buildSubjectRouteSegment, normalizeRouteSegment } from "@/lib/utils";
import type { Viewer } from "@/lib/auth-helpers";
import type {
  ContentMeta,
  EntryContent,
  EntrySummary,
  MaterialContent,
  MaterialSummary,
  ModuleContent,
  ModuleSummary,
  PublicationRequestSummary,
  SubjectContent,
  SubjectSummary,
  UserLibraryData,
} from "@/types/content";
import type {
  AuthUserDocument,
  EntryDocument,
  PublicationRequestDocument,
  SubjectDocument,
} from "@/types/database";

function sortByOrderThenTitle<T extends ContentMeta>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.title.localeCompare(right.title);
  });
}

function mapEntrySummary(entry: EntryDocument, subject: SubjectDocument): EntrySummary {
  const subjectId = subject._id.toHexString();
  const subjectRouteSegment = buildSubjectRouteSegment(subject.slug, subjectId);
  const base = {
    id: entry._id.toHexString(),
    title: entry.title,
    order: entry.order,
    description: entry.description,
    slug: entry.slug,
    subjectId,
    subjectSlug: subject.slug,
    subjectRouteSegment,
    subjectTitle: subject.title,
    headings: entry.headings,
    href:
      entry.kind === "module"
        ? `/${subjectRouteSegment}/${entry.slug}`
        : `/${subjectRouteSegment}/materials/${entry.slug}`,
    visibility: entry.visibility,
    status: entry.status,
    ownerUserId: entry.ownerUserId,
    sourceEntryId: entry.sourceEntryId,
    linkedPublicEntryId: entry.linkedPublicEntryId,
    publishedEntryId: entry.publishedEntryId,
    publishedFromRequestId: entry.publishedFromRequestId,
    publishedAt: entry.publishedAt,
    lastSubmittedAt: entry.lastSubmittedAt,
    lastReviewedAt: entry.lastReviewedAt,
    reviewNotes: entry.reviewNotes,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };

  if (entry.kind === "module") {
    return {
      ...base,
      kind: "module",
    } satisfies ModuleSummary;
  }

  return {
    ...base,
    kind: "material",
  } satisfies MaterialSummary;
}

function mapEntryContent(entry: EntryDocument, subject: SubjectDocument): EntryContent {
  const summary = mapEntrySummary(entry, subject);

  if (summary.kind === "module") {
    return {
      ...summary,
      content: entry.markdown,
    } satisfies ModuleContent;
  }

  return {
    ...summary,
    content: entry.markdown,
  } satisfies MaterialContent;
}

function mapSubjectContent(subject: SubjectDocument, entries: EntryDocument[]): SubjectContent {
  const subjectId = subject._id.toHexString();
  const routeSegment = buildSubjectRouteSegment(subject.slug, subjectId);
  const modules = sortByOrderThenTitle(
    entries
      .filter((entry) => entry.kind === "module")
      .map((entry) => mapEntryContent(entry, subject) as ModuleContent),
  );
  const materials = sortByOrderThenTitle(
    entries
      .filter((entry) => entry.kind === "material")
      .map((entry) => mapEntryContent(entry, subject) as MaterialContent),
  );

  return {
    id: subjectId,
    title: subject.title,
    order: subject.order,
    description: subject.description,
    slug: subject.slug,
    routeSegment,
    href: buildSubjectHref(subject.slug, subjectId),
    materials,
    modules,
    visibility: subject.visibility,
    status: subject.status,
    ownerUserId: subject.ownerUserId,
    sourceSubjectId: subject.sourceSubjectId,
    publishedSubjectId: subject.publishedSubjectId,
    publishedFromRequestId: subject.publishedFromRequestId,
    publishedAt: subject.publishedAt,
    lastSubmittedAt: subject.lastSubmittedAt,
    lastReviewedAt: subject.lastReviewedAt,
    reviewNotes: subject.reviewNotes,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

function groupEntriesBySubjectId(entries: EntryDocument[]) {
  const groupedEntries = new Map<string, EntryDocument[]>();

  for (const entry of entries) {
    const subjectEntries = groupedEntries.get(entry.subjectId);

    if (subjectEntries) {
      subjectEntries.push(entry);
    } else {
      groupedEntries.set(entry.subjectId, [entry]);
    }
  }

  return groupedEntries;
}

function toSubjectSummary(subject: SubjectContent): SubjectSummary {
  return {
    id: subject.id,
    title: subject.title,
    order: subject.order,
    description: subject.description,
    slug: subject.slug,
    routeSegment: subject.routeSegment,
    href: subject.href,
    materials: subject.materials,
    modules: subject.modules,
    visibility: subject.visibility,
    status: subject.status,
    ownerUserId: subject.ownerUserId,
    sourceSubjectId: subject.sourceSubjectId,
    publishedSubjectId: subject.publishedSubjectId,
    publishedFromRequestId: subject.publishedFromRequestId,
    publishedAt: subject.publishedAt,
    lastSubmittedAt: subject.lastSubmittedAt,
    lastReviewedAt: subject.lastReviewedAt,
    reviewNotes: subject.reviewNotes,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

async function loadPublicContentTreeFromDatabase() {
  await ensureAppIndexes();

  const db = await getDatabase();
  const subjects = await db.collection<SubjectDocument>("subjects").find({
    visibility: "public",
  }).toArray();

  const subjectIds = subjects.map((subject) => subject._id.toHexString());
  const entries = subjectIds.length
    ? await db.collection<EntryDocument>("entries").find({
        visibility: "public",
        subjectId: {
          $in: subjectIds,
        },
      }).toArray()
    : [];
  const entriesBySubjectId = groupEntriesBySubjectId(entries);

  return sortByOrderThenTitle(
    subjects.map((subject) =>
      mapSubjectContent(
        subject,
        entriesBySubjectId.get(subject._id.toHexString()) ?? [],
      ),
    ),
  );
}

const getCachedPublicContentTreeFromDatabase = nextCache(
  loadPublicContentTreeFromDatabase,
  ["tracklearn-public-content-tree"],
  {
    revalidate: 300,
    tags: ["tracklearn-public-content"],
  },
);

const getPublicContentTree = cache(async () => {
  if (!isDatabaseConfigured()) {
    return getFilesystemContentTree();
  }

  return getCachedPublicContentTreeFromDatabase();
});

export async function getContentTree(viewer?: Viewer) {
  const content = await getPublicContentTree();
  return content.map(toSubjectSummary);
}

export async function getNavigationTree(viewer?: Viewer) {
  return getContentTree(viewer);
}

export async function getSubjectBySlug(subjectSlug: string, viewer?: Viewer) {
  if (!isDatabaseConfigured()) {
    return getFilesystemSubjectBySlug(subjectSlug);
  }

  const subjects = await getPublicContentTree();
  const normalizedRouteSegment = normalizeRouteSegment(subjectSlug);
  const routeMatch =
    subjects.find((subject) => subject.routeSegment === normalizedRouteSegment) ?? null;

  if (routeMatch) {
    return routeMatch;
  }

  const slugMatches = subjects.filter((subject) => subject.slug === normalizedRouteSegment);
  return slugMatches.length === 1 ? slugMatches[0] : null;
}

export async function getModuleBySlugs(subjectSlug: string, moduleSlug: string, viewer?: Viewer) {
  noStore();

  if (!isDatabaseConfigured()) {
    return getFilesystemModuleBySlugs(subjectSlug, moduleSlug);
  }

  const subject = await getSubjectBySlug(subjectSlug, viewer);

  if (!subject) {
    return null;
  }

  const normalizedModuleSlug = normalizeRouteSegment(moduleSlug);
  const module = subject.modules.find((item) => item.slug === normalizedModuleSlug) ?? null;

  if (!module) {
    return null;
  }

  const currentIndex = subject.modules.findIndex((item) => item.slug === normalizedModuleSlug);

  return {
    subject,
    module,
    previousModule: currentIndex > 0 ? subject.modules[currentIndex - 1] : null,
    nextModule: currentIndex < subject.modules.length - 1 ? subject.modules[currentIndex + 1] : null,
  };
}

export async function getMaterialBySlugs(subjectSlug: string, materialSlug: string, viewer?: Viewer) {
  noStore();

  if (!isDatabaseConfigured()) {
    return getFilesystemMaterialBySlugs(subjectSlug, materialSlug);
  }

  const subject = await getSubjectBySlug(subjectSlug, viewer);

  if (!subject) {
    return null;
  }

  const normalizedMaterialSlug = normalizeRouteSegment(materialSlug);
  const material = subject.materials.find((item) => item.slug === normalizedMaterialSlug) ?? null;

  if (!material) {
    return null;
  }

  return {
    subject,
    material,
  };
}

async function getSubjectsByIds(subjectIds: string[]) {
  if (!subjectIds.length) {
    return [];
  }

  await ensureAppIndexes();
  const db = await getDatabase();

  return db.collection<SubjectDocument>("subjects").find({
    _id: {
      $in: subjectIds.map((subjectId) => new ObjectId(subjectId)),
    },
  }).toArray();
}

async function getUsersByIds(userIds: string[]) {
  if (!userIds.length || !isDatabaseConfigured()) {
    return [];
  }

  const db = await getDatabase();
  return db.collection<AuthUserDocument>("user").find({
    _id: {
      $in: userIds.map((userId) => new ObjectId(userId)),
    },
  }).toArray();
}

function mapPublicationRequest(
  request: PublicationRequestDocument,
  users: AuthUserDocument[],
): PublicationRequestSummary {
  const requester = users.find((user) => user._id.toHexString() === request.requesterUserId);

  return {
    id: request._id.toHexString(),
    requestType: request.requestType,
    status: request.status,
    requesterUserId: request.requesterUserId,
    requesterName: requester?.name ?? null,
    requesterEmail: requester?.email ?? null,
    reviewerUserId: request.reviewerUserId,
    subjectId: request.subjectId,
    entryId: request.entryId,
    reviewNotes: request.reviewNotes,
    snapshot: request.snapshot,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    reviewedAt: request.reviewedAt,
  };
}

export async function listUserLibrary(userId?: string | null): Promise<UserLibraryData> {
  noStore();

  if (!userId) {
    return {
      ownedSubjects: [],
      ownedEntries: [],
      publicSubjects: await getNavigationTree(),
      publicEntries: [],
      publicationRequests: [],
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      ownedSubjects: [],
      ownedEntries: [],
      publicSubjects: await getNavigationTree(),
      publicEntries: [],
      publicationRequests: [],
    };
  }

  await ensureAppIndexes();
  const db = await getDatabase();

  const [ownedSubjectDocs, publicSubjectDocs, ownedEntryDocs, publicEntryDocs, requestDocs] =
    await Promise.all([
      db.collection<SubjectDocument>("subjects").find({
        ownerUserId: userId,
        visibility: "private",
      }).toArray(),
      db.collection<SubjectDocument>("subjects").find({
        visibility: "public",
      }).toArray(),
      db.collection<EntryDocument>("entries").find({
        ownerUserId: userId,
        visibility: "private",
      }).toArray(),
      db.collection<EntryDocument>("entries").find({
        visibility: "public",
      }).toArray(),
      db.collection<PublicationRequestDocument>("publicationRequests").find({
        requesterUserId: userId,
      }).sort({ createdAt: -1 }).toArray(),
    ]);

  const subjectDocsById = new Map(
    [...ownedSubjectDocs, ...publicSubjectDocs].map((subject) => [subject._id.toHexString(), subject]),
  );
  const ownedEntriesBySubjectId = groupEntriesBySubjectId(ownedEntryDocs);
  const publicEntriesBySubjectId = groupEntriesBySubjectId(publicEntryDocs);

  const ownedSubjects = sortByOrderThenTitle(
    ownedSubjectDocs.map((subject) =>
      toSubjectSummary(
        mapSubjectContent(
          subject,
          ownedEntriesBySubjectId.get(subject._id.toHexString()) ?? [],
        ),
      ),
    ),
  );

  const publicSubjects = sortByOrderThenTitle(
    publicSubjectDocs.map((subject) =>
      toSubjectSummary(
        mapSubjectContent(
          subject,
          publicEntriesBySubjectId.get(subject._id.toHexString()) ?? [],
        ),
      ),
    ),
  );

  const ownedEntries = sortByOrderThenTitle(
    ownedEntryDocs.flatMap((entry) => {
      const subject = subjectDocsById.get(entry.subjectId);
      return subject ? [mapEntrySummary(entry, subject)] : [];
    }),
  );

  const publicEntries = sortByOrderThenTitle(
    publicEntryDocs.flatMap((entry) => {
      const subject = subjectDocsById.get(entry.subjectId);
      return subject ? [mapEntrySummary(entry, subject)] : [];
    }),
  );

  const users = await getUsersByIds([userId]);

  return {
    ownedSubjects,
    ownedEntries,
    publicSubjects,
    publicEntries,
    publicationRequests: requestDocs.map((request) => mapPublicationRequest(request, users)),
  };
}

export async function getOwnedSubjectById(userId: string, subjectId: string) {
  noStore();

  if (!isDatabaseConfigured()) {
    return null;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const subject = await db.collection<SubjectDocument>("subjects").findOne({
    _id: new ObjectId(subjectId),
    ownerUserId: userId,
    visibility: "private",
  });

  if (!subject) {
    return null;
  }

  const entries = await db.collection<EntryDocument>("entries").find({
    ownerUserId: userId,
    visibility: "private",
    subjectId,
  }).toArray();

  return mapSubjectContent(subject, entries);
}

export async function getOwnedEntryById(userId: string, entryId: string) {
  noStore();

  if (!isDatabaseConfigured()) {
    return null;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const entry = await db.collection<EntryDocument>("entries").findOne({
    _id: new ObjectId(entryId),
    ownerUserId: userId,
    visibility: "private",
  });

  if (!entry) {
    return null;
  }

  const subject = await db.collection<SubjectDocument>("subjects").findOne({
    _id: new ObjectId(entry.subjectId),
  });

  if (!subject) {
    return null;
  }

  return mapEntryContent(entry, subject);
}

export async function getSubjectByIdForAdmin(subjectId: string) {
  noStore();

  if (!isDatabaseConfigured() || !subjectId) {
    return null;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const subject = await db.collection<SubjectDocument>("subjects").findOne({
    _id: new ObjectId(subjectId),
  });

  if (!subject) {
    return null;
  }

  const entries = await db.collection<EntryDocument>("entries").find({
    subjectId,
    visibility: subject.visibility,
  }).toArray();

  return mapSubjectContent(subject, entries);
}

export async function getEntryByIdForAdmin(entryId: string) {
  noStore();

  if (!isDatabaseConfigured() || !entryId) {
    return null;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const entry = await db.collection<EntryDocument>("entries").findOne({
    _id: new ObjectId(entryId),
  });

  if (!entry) {
    return null;
  }

  const subject = await db.collection<SubjectDocument>("subjects").findOne({
    _id: new ObjectId(entry.subjectId),
  });

  if (!subject) {
    return null;
  }

  return mapEntryContent(entry, subject);
}

export async function getPublicEntryById(entryId: string) {
  noStore();

  if (!isDatabaseConfigured()) {
    return null;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const entry = await db.collection<EntryDocument>("entries").findOne({
    _id: new ObjectId(entryId),
    visibility: "public",
  });

  if (!entry) {
    return null;
  }

  const subject = await db.collection<SubjectDocument>("subjects").findOne({
    _id: new ObjectId(entry.subjectId),
    visibility: "public",
  });

  if (!subject) {
    return null;
  }

  return mapEntryContent(entry, subject);
}

export async function getUserLinkedEntries(userId: string, publicEntryId: string) {
  noStore();

  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const entries = await db.collection<EntryDocument>("entries").find({
    ownerUserId: userId,
    visibility: "private",
    linkedPublicEntryId: publicEntryId,
  }).toArray();
  const subjects = await getSubjectsByIds([...new Set(entries.map((entry) => entry.subjectId))]);
  const subjectById = new Map(subjects.map((subject) => [subject._id.toHexString(), subject]));

  return sortByOrderThenTitle(
    entries.flatMap((entry) => {
      const subject = subjectById.get(entry.subjectId);
      return subject ? [mapEntrySummary(entry, subject)] : [];
    }),
  );
}

export async function listPublicationRequests(
  filters: {
    status?: string;
    requestType?: string;
    requesterUserId?: string;
  } = {},
) {
  noStore();

  if (!isDatabaseConfigured()) {
    return [];
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const query: Record<string, string> = {};

  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }

  if (filters.requestType && filters.requestType !== "all") {
    query.requestType = filters.requestType;
  }

  if (filters.requesterUserId) {
    query.requesterUserId = filters.requesterUserId;
  }

  const requests = await db.collection<PublicationRequestDocument>("publicationRequests").find(query).sort({
    createdAt: -1,
  }).toArray();

  const users = await getUsersByIds(
    [
      ...new Set(
        requests
          .flatMap((request) => [request.requesterUserId, request.reviewerUserId ?? ""])
          .filter(Boolean),
      ),
    ],
  );

  return requests.map((request) => mapPublicationRequest(request, users));
}

export async function getPublicationRequestById(requestId: string) {
  noStore();

  if (!isDatabaseConfigured()) {
    return null;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const request = await db.collection<PublicationRequestDocument>("publicationRequests").findOne({
    _id: new ObjectId(requestId),
  });

  if (!request) {
    return null;
  }

  const users = await getUsersByIds(
    [request.requesterUserId, request.reviewerUserId ?? ""].filter(Boolean),
  );

  return mapPublicationRequest(request, users);
}

export async function listPublishedCatalog() {
  noStore();

  if (!isDatabaseConfigured()) {
    return {
      subjects: await getNavigationTree(),
      entries: [],
    };
  }

  const subjects = await getNavigationTree();
  return {
    subjects,
    entries: sortByOrderThenTitle(subjects.flatMap((subject) => [...subject.modules, ...subject.materials])),
  };
}

export async function getAllModuleParams() {
  const subjects = await getNavigationTree();

  return subjects.flatMap((subject) =>
    subject.modules.map((module) => ({
      subject: subject.routeSegment,
      module: module.slug,
    })),
  );
}

export async function getAllMaterialParams() {
  const subjects = await getNavigationTree();

  return subjects.flatMap((subject) =>
    subject.materials.map((material) => ({
      subject: subject.routeSegment,
      material: material.slug,
    })),
  );
}
