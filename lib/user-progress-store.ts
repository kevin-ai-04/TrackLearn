import "server-only";

import { createEmptyHistoryState, normalizeHistoryState } from "@/lib/history";
import { ensureAppIndexes, getDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import type { UserProgressDocument } from "@/types/database";
import type { StudyHistoryState } from "@/types/history";

export async function getUserProgress(userId: string) {
  if (!isDatabaseConfigured()) {
    return {
      state: createEmptyHistoryState(),
      migratedFromLocalAt: null,
    };
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const record = await db.collection<UserProgressDocument>("userProgress").findOne({
    userId,
  });

  if (!record) {
    return {
      state: createEmptyHistoryState(),
      migratedFromLocalAt: null,
    };
  }

  return {
    state: normalizeHistoryState(record.state),
    migratedFromLocalAt: record.migratedFromLocalAt ?? null,
  };
}

export async function saveUserProgress(options: {
  userId: string;
  state: StudyHistoryState;
  migratedFromLocalAt?: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return;
  }

  await ensureAppIndexes();
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.collection<UserProgressDocument>("userProgress").updateOne(
    {
      userId: options.userId,
    },
    {
      $set: {
        userId: options.userId,
        state: normalizeHistoryState(options.state),
        migratedFromLocalAt: options.migratedFromLocalAt ?? null,
        updatedAt: now,
      },
    },
    {
      upsert: true,
    },
  );
}
