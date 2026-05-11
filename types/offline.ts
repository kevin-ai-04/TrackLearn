import type {
  HeadingItem,
  MaterialContent,
  ModuleContent,
  SubjectSummary,
} from "@/types/content";
import type { ModuleReference } from "@/types/history";

export type OfflineCourseSource = "public" | "personal";
export type OfflineProgressMutationType = "visit" | "done" | "needsRevision";

export interface OfflineCourseEntry {
  id: string;
  kind: "module" | "material";
  title: string;
  slug: string;
  description?: string;
  order?: number;
  headings: HeadingItem[];
  href: string;
  content: string;
  updatedAt?: string;
}

export interface OfflineCourseSnapshot {
  schemaVersion: 1;
  source: OfflineCourseSource;
  id: string;
  title: string;
  slug: string;
  routeSegment: string;
  href: string;
  description?: string;
  order?: number;
  modules: OfflineCourseEntry[];
  materials: OfflineCourseEntry[];
  downloadedAt: string;
  contentUpdatedAt: string;
  serverUpdatedAt?: string;
}

export interface OfflineProgressMutation {
  id: string;
  schemaVersion: 1;
  deviceId: string;
  type: OfflineProgressMutationType;
  moduleRef: ModuleReference;
  clientCreatedAt: string;
  visitDelta?: number;
  value?: boolean;
}

export interface OfflineSupportSnapshot {
  enabled: boolean;
  courses: OfflineCourseSnapshot[];
  downloadedIds: string[];
}

export type DownloadableCourse = SubjectSummary & {
  source: OfflineCourseSource;
};

export type OfflineModuleContent = Omit<ModuleContent, "subjectId" | "subjectSlug" | "subjectRouteSegment" | "subjectTitle" | "visibility" | "status">;
export type OfflineMaterialContent = Omit<MaterialContent, "subjectId" | "subjectSlug" | "subjectRouteSegment" | "subjectTitle" | "visibility" | "status">;
