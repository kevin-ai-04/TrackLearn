# TrackLearn Project Description

## Cross-Chat Reuse Instructions

This file is the compact project handoff for new coding-agent chat instances. Read it first to recover the current architecture, access model, workflow rules, and the non-obvious project decisions that are easy to miss when only scanning files.

When maintaining this file in future chats:

- keep durable project behavior, access rules, workflow semantics, and important repo entry points
- prefer concise bullets over long narrative sections
- remove duplicated detail that can be rediscovered quickly from the route tree, schema definitions, or UI code
- keep non-obvious product constraints even if they look unusual in code
- update stale paths, route names, and behavior notes when implementation changes
- do not turn this into a changelog; describe the current system only

## What This Project Is

TrackLearn is a Next.js App Router study platform with three active surfaces:

- public study content
- optional account features for personal content and synced progress
- an admin moderation dashboard for publishing user content

MongoDB is the primary backend. The `data/subjects` directory is used for seeding the public catalog and as a runtime fallback only when MongoDB is not configured.

## Runtime Model

### Public catalog

- Public subjects, modules, and materials are read through `lib/content.ts`.
- If `MONGODB_URI` is configured, public catalog reads come from MongoDB.
- If MongoDB is not configured, public catalog reads fall back to `lib/fs-content.ts`.

### Auth and roles

- Auth is configured in `auth.ts` with Better Auth, Google, and the MongoDB adapter.
- User roles are stored on `users.role`.
- Supported roles are `"user"` and `"admin"`.
- Auth user records can also store an optional unique `username` for the user's custom profile handle.
- `/login` should present an explicit role choice before starting Google OAuth.
- The selected login role should be written to MongoDB on `user.role` as part of sign-in so evaluators can switch between scenarios.
- Signed-in users should also be able to switch between `user` and `admin` from `/settings` for testing.
- Signed-in users can view account details and add, change, or clear their custom username from `/settings`.
- Signing in is optional for browsing and settings.
- `/explore` is public and shows the full public course catalog overview.
- `/library` requires login and shows only public courses the user added from Explore plus the signed-in user's personal subjects.
- Course content routes require login and require the public course to be in the user's library.
- `/library/manage` requires login.
- `/library/subjects/[subjectId]` requires login.
- `/library/entries/[entryId]` requires login.
- `/admin` requires an authenticated admin user.

### Evaluation-mode access

- This project is intentionally not designed for open public self-service use.
- The current target is controlled evaluator access.
- Admin self-selection on the login screen is intentional for testing both user and admin flows in the same deployed environment.
- If the product is later opened to public users, this role-selection behavior should be removed or replaced with a protected admin assignment flow.

### Personal content

Logged-in users can create:

- personal subjects
- personal modules
- personal materials

All user-created content starts with `visibility: "private"` and is treated in the UI as personal content.

### Moderated publishing

- Users can submit personal subjects or entries for review.
- Submission creates a `publicationRequests` document with a snapshot of the submitted content.
- Admin approval creates or updates a separate public copy.
- The original personal record remains the author-owned working copy.
- Later edits to the personal source do not change the live public copy until a new review is approved.

### Study progress

- Guests use local browser persistence.
- Signed-in users load and save progress through `/api/user-progress`.
- Remote progress is stored in MongoDB in `userProgress`.
- On first authenticated load, local progress is merged into the account once if remote progress has not already been migrated.

## Main Routes

- Public browsing lives under `app/(site)` and includes home, settings, login, library, and dynamic public study routes.
- Home intentionally hides Recent Activity and Subjects for now; those sections are commented out in the home dashboard and should be reimplemented later after the Explore/Library split settles.
- `/explore` is the public catalog overview and add-to-library surface.
- `/user` redirects to `/settings`.
- Personal management routes live under `/library/manage`, `/library/subjects/[subjectId]`, and `/library/entries/[entryId]`.
- `/admin` is the moderation and public catalog management surface.

## Core Data Model

### Application collections

- `subjects`
- `entries`
- `publicationRequests`
- `userCourseLibrary`
- `userProgress`

### `subjects`

Represents both public and personal subjects.

Important fields:

- `visibility`, `status`, and `ownerUserId` control access and lifecycle
- `sourceSubjectId`, `publishedSubjectId`, and `publishedFromRequestId` link private working copies to public copies and review events
- `publishedAt`, `lastSubmittedAt`, `lastReviewedAt`, and `reviewNotes` track publication history

### `entries`

Represents both public and personal modules and materials.

Important fields:

- `subjectId` and `kind` tie each entry to a subject and distinguish modules from materials
- `markdown` and `headings` store rendered study content structure
- `visibility`, `status`, and `ownerUserId` control access and lifecycle
- `sourceEntryId`, `publishedEntryId`, and `publishedFromRequestId` link private working copies to public copies and review events
- `publishedAt`, `lastSubmittedAt`, `lastReviewedAt`, and `reviewNotes` track publication history

### `publicationRequests`

Tracks review workflow for publishing or updating public content.

Key fields:

- `requesterUserId`
- `reviewerUserId`
- `subjectId`
- `entryId`
- `requestType`
- `status`
- `reviewNotes`
- `snapshot`
- `reviewedAt`

### `userProgress`

Stores account-backed study state.

Important fields:

- `userId` and `state`
- `migratedFromLocalAt` supports the one-time local-to-remote merge flow
- `updatedAt` tracks the last synced write

### `userCourseLibrary`

Stores signed-in users' selected public courses.

Important fields:

- `userId` and `publicSubjectId` form the account/course membership
- `addedAt` and `updatedAt` support library sorting and future sync workflows

## Content and Access Rules

### Visibility

- Public catalog content is readable by anyone.
- Personal content is readable only by its owner.

### Status values

- `draft`
- `pending_review`
- `published`
- `changes_requested`

### Request status values

- `pending`
- `approved`
- `rejected`

### Publishing rules

- A personal subject can be submitted for publication.
- A personal entry can be submitted for publication.
- Approval publishes a separate public record, not the same private record flipped to public.
- Unpublishing removes the public copy and resets the private source back to draft.

## Important Server Modules

- `auth.ts`: Better Auth setup, Google provider integration, MongoDB adapter, and `getSession()`
- `lib/auth-client.ts`: Better Auth React client and typed client-side session access
- `lib/auth-helpers.ts`: `getViewer()`, `requireUser()`, and `requireAdmin()`
- `lib/user-profile-store.ts`: reads auth account profile data and validates/persists custom usernames
- `lib/content.ts`: read layer for the public catalog, dynamic study lookups, user library reads, and publication request listing
- `lib/content-management.ts`: write layer for personal content CRUD, ingestion, review submission, admin review decisions, public copy updates, and unpublish flows
- `lib/mongodb.ts`: MongoDB client, database access, indexes, and environment capability checks
- `lib/user-progress-store.ts`: load and save helpers for `userProgress`
- `hooks/useStudyHistory.ts`: client progress state, local hydration, remote sync, migration, and theme/font preference application

## API and Action Entry Points

- `app/api/auth/[...all]/route.ts`
- `app/api/user-progress/route.ts`
- `app/(site)/library/actions.ts`
- `app/(site)/admin/actions.ts`

## Seed and Fallback Content

### Seed source

- `data/subjects`

### Seed script

- `scripts/seed-mongodb.mjs`

The seed script reads `data/subjects`, parses metadata and markdown, extracts headings, and upserts public `subjects` and `entries` into MongoDB.

## Environment Requirements

Full functionality requires:

- `MONGODB_URI`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Optional:

- `MONGODB_DB` defaults to `tracklearn`
- `BETTER_AUTH_URL` is recommended for stable OAuth callback and redirect handling

Behavior without MongoDB:

- public catalog still works through filesystem fallback
- login, personal management, admin moderation, and remote progress sync do not work

## Files to Read First

For fast orientation, open these in order:

1. `project-description.md`
2. `auth.ts`
3. `lib/auth-client.ts`
4. `lib/auth-helpers.ts`
5. `lib/content.ts`
6. `lib/content-management.ts`
7. `lib/mongodb.ts`
8. `hooks/useStudyHistory.ts`
9. `app/(site)/settings/page.tsx`
10. `app/(site)/library/page.tsx`
11. `app/(site)/library/manage/page.tsx`
12. `app/(site)/admin/page.tsx`
