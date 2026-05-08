import "server-only";

import { ObjectId } from "mongodb";
import { ensureAppIndexes, getDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import type { SubjectSummary } from "@/types/content";
import type { EntryDocument, SubjectDocument, UserCourseLibraryDocument } from "@/types/database";

function sortByOrderThenTitle<T extends { order?: number; title: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.title.localeCompare(right.title);
  });
}

export async function getUserCourseSubjectIds(userId?: string | null) {
  if (!userId || !isDatabaseConfigured()) {
    return [];
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const items = await db.collection<UserCourseLibraryDocument>("userCourseLibrary").find({
    userId,
  }).toArray();

  return items.map((item) => item.publicSubjectId);
}

export async function addCourseToUserLibrary(userId: string, publicSubjectId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const subject = await db.collection<SubjectDocument>("subjects").findOne({
    _id: new ObjectId(publicSubjectId),
    visibility: "public",
  });

  if (!subject) {
    throw new Error("Public subject not found.");
  }

  const now = new Date().toISOString();
  await db.collection<UserCourseLibraryDocument>("userCourseLibrary").updateOne(
    {
      userId,
      publicSubjectId,
    },
    {
      $set: {
        updatedAt: now,
      },
      $setOnInsert: {
        userId,
        publicSubjectId,
        addedAt: now,
      },
    },
    { upsert: true },
  );
}

export async function removeCourseFromUserLibrary(userId: string, publicSubjectId: string) {
  if (!isDatabaseConfigured()) {
    return;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  await db.collection<UserCourseLibraryDocument>("userCourseLibrary").deleteOne({
    userId,
    publicSubjectId,
  });
}

export async function isCourseInUserLibrary(userId: string, publicSubjectId: string) {
  if (!isDatabaseConfigured()) {
    return false;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const item = await db.collection<UserCourseLibraryDocument>("userCourseLibrary").findOne({
    userId,
    publicSubjectId,
  });

  return Boolean(item);
}

export async function getUserPrivateSubjectForPublicSubject(userId: string, publicSubjectId: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const subject = await db.collection<SubjectDocument>("subjects").findOne({
    ownerUserId: userId,
    visibility: "private",
    publishedSubjectId: publicSubjectId,
  });

  if (!subject) {
    return null;
  }

  const entries = await db.collection<EntryDocument>("entries").find({
    ownerUserId: userId,
    visibility: "private",
    subjectId: subject._id.toHexString(),
  }).toArray();

  return {
    id: subject._id.toHexString(),
    title: subject.title,
    status: subject.status,
    updatedAt: subject.updatedAt,
    hasPrivateChanges:
      subject.updatedAt !== subject.createdAt ||
      entries.some((entry) => entry.updatedAt !== entry.createdAt),
  };
}

export async function listSelectedPublicSubjects(
  userId: string,
  publicSubjects: SubjectSummary[],
) {
  const selectedIds = await getUserCourseSubjectIds(userId);
  const selectedIdSet = new Set(selectedIds);

  return sortByOrderThenTitle(publicSubjects.filter((subject) => selectedIdSet.has(subject.id)));
}
