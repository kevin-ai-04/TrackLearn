import type { ObjectId } from "mongodb";
import type {
  ContentStatus,
  ContentVisibility,
  EntryKind,
  HeadingItem,
  PublicationRequestStatus,
  PublicationRequestType,
  UserRole,
} from "@/types/content";
import type { StudyHistoryState } from "@/types/history";

export interface SubjectDocument {
  _id: ObjectId;
  title: string;
  slug: string;
  description?: string;
  order?: number;
  visibility: ContentVisibility;
  status: ContentStatus;
  ownerUserId: string | null;
  sourceSubjectId?: string | null;
  publishedSubjectId?: string | null;
  publishedFromRequestId?: string | null;
  publishedAt?: string | null;
  lastSubmittedAt?: string | null;
  lastReviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EntryDocument {
  _id: ObjectId;
  subjectId: string;
  kind: EntryKind;
  title: string;
  slug: string;
  description?: string;
  order?: number;
  markdown: string;
  headings: HeadingItem[];
  visibility: ContentVisibility;
  status: ContentStatus;
  ownerUserId: string | null;
  sourceEntryId?: string | null;
  linkedPublicEntryId?: string | null;
  publishedEntryId?: string | null;
  publishedFromRequestId?: string | null;
  publishedAt?: string | null;
  lastSubmittedAt?: string | null;
  lastReviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationRequestDocument {
  _id: ObjectId;
  requesterUserId: string;
  reviewerUserId?: string | null;
  subjectId?: string | null;
  entryId?: string | null;
  requestType: PublicationRequestType;
  status: PublicationRequestStatus;
  reviewNotes?: string | null;
  snapshot: {
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
  };
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
}

export interface UserProgressDocument {
  _id?: ObjectId;
  userId: string;
  state: StudyHistoryState;
  migratedFromLocalAt?: string | null;
  updatedAt: string;
}

export interface AuthUserDocument {
  _id: ObjectId;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
