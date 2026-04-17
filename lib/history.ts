import type {
  ImportMode,
  ImportValidationResult,
  ModuleHistoryRecord,
  ModuleReference,
  ReadingFont,
  StudyHistoryState,
  ThemeMode,
} from "@/types/history";
import { normalizeRouteSegment } from "@/lib/utils";

const STORAGE_KEY = "tracklearn.study-history.v1";
const HISTORY_VERSION = 1 as const;
const MAX_RECENT_ACTIVITY = 24;

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "reading";
}

function isReadingFont(value: unknown): value is ReadingFont {
  return value === "outfit" || value === "serif";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function createEmptyHistoryState(): StudyHistoryState {
  return {
    version: HISTORY_VERSION,
    preferences: {
      theme: "light",
      font: "outfit",
    },
    modules: {},
    recentActivity: [],
  };
}

export function getModuleKey(subjectSlug: string, moduleSlug: string) {
  return `${subjectSlug}::${normalizeRouteSegment(moduleSlug)}`;
}

function normalizeModuleRecord(value: unknown): ModuleHistoryRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.subjectSlug !== "string" || typeof value.moduleSlug !== "string") {
    return null;
  }

  return {
    subjectSlug: value.subjectSlug,
    moduleSlug: normalizeRouteSegment(value.moduleSlug),
    subjectTitle: typeof value.subjectTitle === "string" ? value.subjectTitle : undefined,
    moduleTitle: typeof value.moduleTitle === "string" ? value.moduleTitle : undefined,
    visited: Boolean(value.visited),
    visitCount: typeof value.visitCount === "number" && value.visitCount >= 0 ? value.visitCount : 0,
    lastVisitedAt: typeof value.lastVisitedAt === "string" ? value.lastVisitedAt : null,
    done: Boolean(value.done),
    needsRevision: Boolean(value.needsRevision),
  };
}

export function normalizeHistoryState(value: unknown): StudyHistoryState {
  const fallback = createEmptyHistoryState();

  if (!isRecord(value)) {
    return fallback;
  }

  const preferences = isRecord(value.preferences) ? value.preferences : {};
  const modules = isRecord(value.modules) ? value.modules : {};
  const recentActivity = Array.isArray(value.recentActivity) ? value.recentActivity : [];

  return {
    version: HISTORY_VERSION,
    preferences: {
      theme: isThemeMode(preferences.theme) ? preferences.theme : fallback.preferences.theme,
      font: isReadingFont(preferences.font) ? preferences.font : fallback.preferences.font,
    },
    modules: Object.fromEntries(
      Object.entries(modules)
        .map(([key, item]) => [key, normalizeModuleRecord(item)] as const)
        .filter((entry): entry is [string, ModuleHistoryRecord] => Boolean(entry[1])),
    ),
    recentActivity: recentActivity
      .filter(isRecord)
      .map((item) => ({
        subjectSlug: typeof item.subjectSlug === "string" ? item.subjectSlug : "",
        moduleSlug:
          typeof item.moduleSlug === "string" ? normalizeRouteSegment(item.moduleSlug) : "",
        subjectTitle: typeof item.subjectTitle === "string" ? item.subjectTitle : undefined,
        moduleTitle: typeof item.moduleTitle === "string" ? item.moduleTitle : undefined,
        visitedAt: typeof item.visitedAt === "string" ? item.visitedAt : "",
      }))
      .filter((item) => item.subjectSlug && item.moduleSlug && item.visitedAt)
      .slice(0, MAX_RECENT_ACTIVITY),
  };
}

export function loadHistoryState(): StudyHistoryState {
  if (typeof window === "undefined") {
    return createEmptyHistoryState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizeHistoryState(JSON.parse(raw));
    }
  } catch {
    // Ignore invalid local storage state and continue with defaults.
  }

  return createEmptyHistoryState();
}

export function persistHistoryState(state: StudyHistoryState) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeHistoryState(state);
  const serialized = JSON.stringify(normalized);

  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore persistence errors.
  }
}

function mergeRecentActivity(existing: StudyHistoryState["recentActivity"], incoming: StudyHistoryState["recentActivity"]) {
  return [...incoming, ...existing]
    .filter((item, index, collection) => {
      const key = `${item.subjectSlug}::${item.moduleSlug}`;
      return collection.findIndex((candidate) => `${candidate.subjectSlug}::${candidate.moduleSlug}` === key) === index;
    })
    .sort((left, right) => right.visitedAt.localeCompare(left.visitedAt))
    .slice(0, MAX_RECENT_ACTIVITY);
}

export function mergeHistoryStates(
  baseState: StudyHistoryState,
  incomingState: StudyHistoryState,
  mode: ImportMode,
): StudyHistoryState {
  const normalizedIncoming = normalizeHistoryState(incomingState);
  if (mode === "replace") {
    return normalizedIncoming;
  }

  const mergedModules = { ...baseState.modules };

  Object.entries(normalizedIncoming.modules).forEach(([key, incomingRecord]) => {
    const current = mergedModules[key];

    if (!current) {
      mergedModules[key] = incomingRecord;
      return;
    }

    mergedModules[key] = {
      ...current,
      ...incomingRecord,
      visited: current.visited || incomingRecord.visited,
      visitCount: Math.max(current.visitCount, incomingRecord.visitCount),
      lastVisitedAt:
        !current.lastVisitedAt || (incomingRecord.lastVisitedAt && incomingRecord.lastVisitedAt > current.lastVisitedAt)
          ? incomingRecord.lastVisitedAt
          : current.lastVisitedAt,
      done: current.done || incomingRecord.done,
      needsRevision: current.needsRevision || incomingRecord.needsRevision,
    };
  });

  return {
    version: HISTORY_VERSION,
    preferences: {
      theme: normalizedIncoming.preferences.theme ?? baseState.preferences.theme,
      font: normalizedIncoming.preferences.font ?? baseState.preferences.font,
    },
    modules: mergedModules,
    recentActivity: mergeRecentActivity(baseState.recentActivity, normalizedIncoming.recentActivity),
  };
}

export function updateModuleVisit(state: StudyHistoryState, moduleRef: ModuleReference) {
  const normalizedModuleSlug = normalizeRouteSegment(moduleRef.moduleSlug);
  const key = getModuleKey(moduleRef.subjectSlug, normalizedModuleSlug);
  const now = new Date().toISOString();
  const current = state.modules[key];

  return {
    ...state,
    modules: {
      ...state.modules,
      [key]: {
        subjectSlug: moduleRef.subjectSlug,
        moduleSlug: normalizedModuleSlug,
        subjectTitle: moduleRef.subjectTitle ?? current?.subjectTitle,
        moduleTitle: moduleRef.moduleTitle ?? current?.moduleTitle,
        visited: true,
        visitCount: (current?.visitCount ?? 0) + 1,
        lastVisitedAt: now,
        done: current?.done ?? false,
        needsRevision: current?.needsRevision ?? false,
      },
    },
    recentActivity: mergeRecentActivity(state.recentActivity, [
      {
        subjectSlug: moduleRef.subjectSlug,
        moduleSlug: normalizedModuleSlug,
        subjectTitle: moduleRef.subjectTitle,
        moduleTitle: moduleRef.moduleTitle,
        visitedAt: now,
      },
    ]),
  };
}

function updateModuleRecord(
  state: StudyHistoryState,
  moduleRef: ModuleReference,
  updater: (record: ModuleHistoryRecord) => ModuleHistoryRecord,
) {
  const normalizedModuleSlug = normalizeRouteSegment(moduleRef.moduleSlug);
  const key = getModuleKey(moduleRef.subjectSlug, normalizedModuleSlug);
  const existing =
    state.modules[key] ??
    ({
      subjectSlug: moduleRef.subjectSlug,
      moduleSlug: normalizedModuleSlug,
      subjectTitle: moduleRef.subjectTitle,
      moduleTitle: moduleRef.moduleTitle,
      visited: false,
      visitCount: 0,
      lastVisitedAt: null,
      done: false,
      needsRevision: false,
    } satisfies ModuleHistoryRecord);

  return {
    ...state,
    modules: {
      ...state.modules,
      [key]: updater(existing),
    },
  };
}

export function setModuleDone(state: StudyHistoryState, moduleRef: ModuleReference, value?: boolean) {
  return updateModuleRecord(state, moduleRef, (record) => ({
    ...record,
    done: typeof value === "boolean" ? value : !record.done,
  }));
}

export function setModuleNeedsRevision(
  state: StudyHistoryState,
  moduleRef: ModuleReference,
  value?: boolean,
) {
  return updateModuleRecord(state, moduleRef, (record) => ({
    ...record,
    needsRevision: typeof value === "boolean" ? value : !record.needsRevision,
  }));
}

export function setThemePreference(state: StudyHistoryState, theme: ThemeMode) {
  return {
    ...state,
    preferences: {
      ...state.preferences,
      theme,
    },
  };
}

export function setFontPreference(state: StudyHistoryState, font: ReadingFont) {
  return {
    ...state,
    preferences: {
      ...state.preferences,
      font,
    },
  };
}

export function exportHistoryAsText(state: StudyHistoryState) {
  return JSON.stringify(
    {
      format: "tracklearn-progress/v1",
      exportedAt: new Date().toISOString(),
      data: state,
    },
    null,
    2,
  );
}

export function parseTextImport(raw: string): ImportValidationResult {
  if (!raw.trim()) {
    return {
      valid: false,
      message: "Paste an exported progress string before importing.",
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const data = isRecord(parsed) && "data" in parsed ? parsed.data : parsed;
    const state = normalizeHistoryState(data);

    return {
      valid: true,
      message: `Loaded ${Object.keys(state.modules).length} module records from the text export.`,
      state,
    };
  } catch {
    return {
      valid: false,
      message: "The pasted text export is not valid JSON.",
    };
  }
}
