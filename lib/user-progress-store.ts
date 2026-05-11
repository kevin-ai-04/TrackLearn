import "server-only";

import { createEmptyHistoryState, getModuleKey, normalizeHistoryState } from "@/lib/history";
import { ensureAppIndexes, getDatabase, isDatabaseConfigured } from "@/lib/mongodb";
import type { UserProgressDocument } from "@/types/database";
import type { StudyHistoryState } from "@/types/history";
import type { OfflineProgressMutation } from "@/types/offline";

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

function applyProgressMutationsToState(
  state: StudyHistoryState,
  mutations: OfflineProgressMutation[],
) {
  const nextState = normalizeHistoryState(state);

  for (const mutation of [...mutations].sort((left, right) =>
    left.clientCreatedAt.localeCompare(right.clientCreatedAt),
  )) {
    const moduleRef = mutation.moduleRef;
    const key = getModuleKey(moduleRef.subjectSlug, moduleRef.moduleSlug);
    const current = nextState.modules[key] ?? {
      subjectSlug: moduleRef.subjectSlug,
      moduleSlug: moduleRef.moduleSlug,
      subjectTitle: moduleRef.subjectTitle,
      moduleTitle: moduleRef.moduleTitle,
      visited: false,
      visitCount: 0,
      lastVisitedAt: null,
      done: false,
      doneUpdatedAt: null,
      needsRevision: false,
      needsRevisionUpdatedAt: null,
    };

    if (mutation.type === "visit") {
      nextState.modules[key] = {
        ...current,
        subjectTitle: moduleRef.subjectTitle ?? current.subjectTitle,
        moduleTitle: moduleRef.moduleTitle ?? current.moduleTitle,
        visited: true,
        visitCount: current.visitCount + Math.max(1, mutation.visitDelta ?? 1),
        lastVisitedAt:
          !current.lastVisitedAt || mutation.clientCreatedAt > current.lastVisitedAt
            ? mutation.clientCreatedAt
            : current.lastVisitedAt,
      };

      nextState.recentActivity = [
        {
          subjectSlug: moduleRef.subjectSlug,
          moduleSlug: moduleRef.moduleSlug,
          subjectTitle: moduleRef.subjectTitle,
          moduleTitle: moduleRef.moduleTitle,
          visitedAt: mutation.clientCreatedAt,
        },
        ...nextState.recentActivity,
      ]
        .filter((item, index, collection) => {
          const itemKey = `${item.subjectSlug}::${item.moduleSlug}`;
          return collection.findIndex((candidate) => `${candidate.subjectSlug}::${candidate.moduleSlug}` === itemKey) === index;
        })
        .sort((left, right) => right.visitedAt.localeCompare(left.visitedAt))
        .slice(0, 24);
      continue;
    }

    if (mutation.type === "done") {
      if (current.doneUpdatedAt && mutation.clientCreatedAt < current.doneUpdatedAt) {
        continue;
      }

      nextState.modules[key] = {
        ...current,
        subjectTitle: moduleRef.subjectTitle ?? current.subjectTitle,
        moduleTitle: moduleRef.moduleTitle ?? current.moduleTitle,
        done: Boolean(mutation.value),
        doneUpdatedAt: mutation.clientCreatedAt,
      };
      continue;
    }

    if (mutation.type === "needsRevision") {
      if (
        current.needsRevisionUpdatedAt &&
        mutation.clientCreatedAt < current.needsRevisionUpdatedAt
      ) {
        continue;
      }

      nextState.modules[key] = {
        ...current,
        subjectTitle: moduleRef.subjectTitle ?? current.subjectTitle,
        moduleTitle: moduleRef.moduleTitle ?? current.moduleTitle,
        needsRevision: Boolean(mutation.value),
        needsRevisionUpdatedAt: mutation.clientCreatedAt,
      };
    }
  }

  return normalizeHistoryState(nextState);
}

export async function syncUserProgressMutations(options: {
  userId: string;
  mutations: OfflineProgressMutation[];
}) {
  const current = await getUserProgress(options.userId);
  const state = applyProgressMutationsToState(current.state, options.mutations);

  await saveUserProgress({
    userId: options.userId,
    state,
    migratedFromLocalAt: current.migratedFromLocalAt,
  });

  return {
    state,
    migratedFromLocalAt: current.migratedFromLocalAt,
    appliedMutationIds: options.mutations.map((mutation) => mutation.id),
  };
}
