import type { SubjectContent } from "@/types/content";

export interface DownloadedCourseRecord {
  subject: SubjectContent;
  downloadedAt: string;
  contentUpdatedAt: string | null;
}
