import "server-only";

import { createEmptyHistoryState, mergeHistoryStates, normalizeHistoryState } from "@/lib/history";
import { ensureAppIndexes, getDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import type { UserProgressDocument } from "@/types/database";
import type { StudyHistoryState } from "@/types/history";

export async function getUserProgress(userId: string) {
  if (!isDatabaseConfigured()) {
    return {
      state: createEmptyHistoryState(),
      migratedFromLocalAt: null,
      updatedAt: null,
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
      updatedAt: null,
    };
  }

  return {
    state: normalizeHistoryState(record.state),
    migratedFromLocalAt: record.migratedFromLocalAt ?? null,
    updatedAt: record.updatedAt,
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

  const existing = await db.collection<UserProgressDocument>("userProgress").findOne({
    userId: options.userId,
  });
  const nextState = existing
    ? mergeHistoryStates(normalizeHistoryState(existing.state), normalizeHistoryState(options.state), "merge")
    : normalizeHistoryState(options.state);

  await db.collection<UserProgressDocument>("userProgress").updateOne(
    {
      userId: options.userId,
    },
    {
      $set: {
        userId: options.userId,
        state: nextState,
        migratedFromLocalAt: options.migratedFromLocalAt ?? null,
        updatedAt: now,
      },
    },
    {
      upsert: true,
    },
  );

  return {
    state: nextState,
    migratedFromLocalAt: options.migratedFromLocalAt ?? null,
    updatedAt: now,
  };
}
