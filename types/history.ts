export type ThemeMode = "light" | "dark" | "reading";
export type ReadingFont = "outfit" | "serif";
export type ImportMode = "merge" | "replace";

export interface UserPreferences {
  theme: ThemeMode;
  font: ReadingFont;
}

export interface ModuleHistoryRecord {
  subjectSlug: string;
  moduleSlug: string;
  subjectTitle?: string;
  moduleTitle?: string;
  visited: boolean;
  visitCount: number;
  lastVisitedAt: string | null;
  done: boolean;
  needsRevision: boolean;
}

export interface RecentActivityEntry {
  subjectSlug: string;
  moduleSlug: string;
  subjectTitle?: string;
  moduleTitle?: string;
  visitedAt: string;
}

export interface StudyHistoryState {
  version: 1;
  preferences: UserPreferences;
  modules: Record<string, ModuleHistoryRecord>;
  recentActivity: RecentActivityEntry[];
}

export interface ImportValidationResult {
  valid: boolean;
  message: string;
  state?: StudyHistoryState;
}

export interface SubjectProgressSummary {
  subjectSlug: string;
  subjectTitle: string;
  totalModules: number;
  completedModules: number;
  needsRevisionModules: number;
  visitedModules: number;
  lastVisitedAt: string | null;
}

export interface ModuleReference {
  subjectSlug: string;
  moduleSlug: string;
  subjectTitle?: string;
  moduleTitle?: string;
}

export interface StudyHistoryContextValue {
  hydrated: boolean;
  state: StudyHistoryState;
  markVisited: (moduleRef: ModuleReference) => void;
  setDone: (moduleRef: ModuleReference, value?: boolean) => void;
  setNeedsRevision: (moduleRef: ModuleReference, value?: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setFont: (font: ReadingFont) => void;
  getModuleRecord: (subjectSlug: string, moduleSlug: string) => ModuleHistoryRecord | undefined;
  exportText: () => string;
  exportCsv: () => string;
  importText: (raw: string, mode: ImportMode) => ImportValidationResult;
  importCsv: (raw: string, mode: ImportMode) => ImportValidationResult;
  resetState: () => void;
}
