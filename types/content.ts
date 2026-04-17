export type UserRole = "user" | "admin";
export type ContentVisibility = "public" | "private";
export type ContentStatus = "draft" | "pending_review" | "published" | "changes_requested";
export type EntryKind = "module" | "material";
export type PublicationRequestStatus = "pending" | "approved" | "rejected";
export type PublicationRequestType =
  | "create_public_subject"
  | "create_public_entry"
  | "update_published_content";

export interface ContentMeta {
  title: string;
  order?: number;
  description?: string;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

export interface ContentOwnership {
  visibility: ContentVisibility;
  status: ContentStatus;
  ownerUserId?: string | null;
  sourceSubjectId?: string | null;
  sourceEntryId?: string | null;
  linkedPublicEntryId?: string | null;
  publishedSubjectId?: string | null;
  publishedEntryId?: string | null;
  publishedFromRequestId?: string | null;
  publishedAt?: string | null;
  lastSubmittedAt?: string | null;
  lastReviewedAt?: string | null;
  reviewNotes?: string | null;
}

export interface SubjectSummary extends ContentMeta, ContentOwnership {
  id: string;
  slug: string;
  href: string;
  materials: MaterialSummary[];
  modules: ModuleSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectContent extends Omit<SubjectSummary, "materials" | "modules"> {
  materials: MaterialContent[];
  modules: ModuleContent[];
}

export interface EntrySummaryBase extends ContentMeta, ContentOwnership {
  id: string;
  kind: EntryKind;
  slug: string;
  subjectId: string;
  subjectSlug: string;
  subjectTitle: string;
  headings: HeadingItem[];
  href: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleSummary extends EntrySummaryBase {
  kind: "module";
}

export interface ModuleContent extends ModuleSummary {
  content: string;
}

export interface MaterialSummary extends EntrySummaryBase {
  kind: "material";
}

export interface MaterialContent extends MaterialSummary {
  content: string;
}

export type EntrySummary = ModuleSummary | MaterialSummary;
export type EntryContent = ModuleContent | MaterialContent;

export interface PublicationRequestSnapshot {
  kind?: EntryKind;
  title: string;
  slug: string;
  description?: string;
  order?: number;
  markdown?: string;
  headings?: HeadingItem[];
  subjectId?: string;
  subjectTitle?: string;
  subjectSlug?: string;
  linkedPublicEntryId?: string | null;
}

export interface PublicationRequestSummary {
  id: string;
  requestType: PublicationRequestType;
  status: PublicationRequestStatus;
  requesterUserId: string;
  requesterName?: string | null;
  requesterEmail?: string | null;
  reviewerUserId?: string | null;
  subjectId?: string | null;
  entryId?: string | null;
  reviewNotes?: string | null;
  snapshot: PublicationRequestSnapshot;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
}

export interface UserLibraryData {
  ownedSubjects: SubjectSummary[];
  ownedEntries: EntrySummary[];
  publicSubjects: SubjectSummary[];
  publicEntries: EntrySummary[];
  publicationRequests: PublicationRequestSummary[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
