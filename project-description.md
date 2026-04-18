# TrackLearn Project Description

## What This Project Is

TrackLearn is a Next.js App Router study platform with three active surfaces:

- public study content
- optional account features for private content and synced progress
- an admin moderation dashboard for publishing user content

MongoDB is the primary backend. The `data/subjects` directory is used for seeding the public catalog and as a runtime fallback only when MongoDB is not configured.

## Runtime Model

### Public catalog

- Public subjects, modules, and materials are read through `lib/content.ts`.
- If `MONGODB_URI` is configured, public catalog reads come from MongoDB.
- If MongoDB is not configured, public catalog reads fall back to `lib/fs-content.ts`.
- Public routes are server-rendered and dynamic.
- Route transitions under `app/(site)` expose a loading fallback with a thin teal progress line under the top bar when the next page is still resolving.
- Non-critical client panels such as sidebar utilities, recent activity panels, and import/export dialogs are lazy-loaded to reduce the initial client bundle.

### Auth and roles

- Auth is configured in `auth.ts` with Better Auth, Google, and the MongoDB adapter.
- User roles are stored on `users.role`.
- Supported roles are `"user"` and `"admin"`.
- `/login` should present an explicit role choice before starting Google OAuth.
- The selected login role should be written to MongoDB on `user.role` as part of sign-in so evaluators can switch between scenarios.
- Signed-in users should also be able to switch between `user` and `admin` from `/settings` for testing.
- Signing in is optional for browsing and settings.
- `/my-library` requires login.
- `/admin` requires an authenticated admin user.

### Evaluation-mode access

- This project is intentionally not designed for open public self-service use.
- The current target is controlled evaluator access.
- Admin self-selection on the login screen is intentional for testing both user and admin flows in the same deployed environment.
- If the product is later opened to public users, this role-selection behavior should be removed or replaced with a protected admin assignment flow.

### Private content

Logged-in users can create:

- private subjects
- private modules
- private materials

All user-created content starts private.

### Moderated publishing

- Users can submit private subjects or entries for review.
- Submission creates a `publicationRequests` document with a snapshot of the submitted content.
- Admin approval creates or updates a separate public copy.
- The original private record remains the author-owned working copy.
- Later edits to the private source do not change the live public copy until a new review is approved.

### Study progress

- Guests use local browser persistence.
- Signed-in users load and save progress through `/api/user-progress`.
- Remote progress is stored in MongoDB in `userProgress`.
- On first authenticated load, local progress is merged into the account once if remote progress has not already been migrated.

## Main Routes

### Public

- `/` home page
- `/settings` public settings and progress page, plus signed-in role switching for evaluator scenarios
- `/login` sign-in page with role selection for Google OAuth
- `/:subject` public subject page
- `/:subject/:module` public module page
- `/:subject/materials/:material` public material page

### Compatibility

- `/user` redirects to `/settings`

### Auth-required

- `/my-library` private library overview and creation forms
- `/my-library/subjects/[subjectId]` private subject editor
- `/my-library/entries/[entryId]` private entry editor

### Admin-required

- `/admin` moderation dashboard and public catalog management

## Core Data Model

### Better Auth collections

- `user`
- `account`
- `session`
- `verification`

### Application collections

- `subjects`
- `entries`
- `publicationRequests`
- `userProgress`

### `subjects`

Represents both public and private subjects.

Key fields:

- `title`
- `slug`
- `description`
- `order`
- `visibility`
- `status`
- `ownerUserId`
- `sourceSubjectId`
- `publishedSubjectId`
- `publishedFromRequestId`
- `publishedAt`
- `lastSubmittedAt`
- `lastReviewedAt`
- `reviewNotes`

### `entries`

Represents both modules and materials.

Key fields:

- `subjectId`
- `kind`
- `title`
- `slug`
- `description`
- `order`
- `markdown`
- `headings`
- `visibility`
- `status`
- `ownerUserId`
- `sourceEntryId`
- `publishedEntryId`
- `publishedFromRequestId`
- `publishedAt`
- `lastSubmittedAt`
- `lastReviewedAt`
- `reviewNotes`

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

Key fields:

- `userId`
- `state`
- `migratedFromLocalAt`
- `updatedAt`

## Content and Access Rules

### Visibility

- Public catalog content is readable by anyone.
- Private content is readable only by its owner.

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

- A private subject can be submitted for publication.
- A private entry can be submitted for publication.
- Approval publishes a separate public record, not the same private record flipped to public.
- Unpublishing removes the public copy and resets the private source back to draft.

## Important Server Modules

### `auth.ts`

- Better Auth setup
- Google social provider
- MongoDB adapter using Better Auth's default Mongo collection names
- `getSession()` helper for route handlers and server components

### `lib/auth-client.ts`

- Better Auth React client
- client-side session hook
- typed role field inference

### `lib/auth-helpers.ts`

- `getViewer()`
- `requireUser()`
- `requireAdmin()`

### `lib/content.ts`

Read-only repository layer for:

- public navigation tree
- subject/module/material lookup
- user library reads
- publication request listing
- published catalog listing

### `lib/content-management.ts`

Write layer for:

- creating, editing, and deleting private subjects
- creating, editing, and deleting private entries
- markdown text and file ingestion
- submission for review
- admin review decisions
- public copy creation and updates
- unpublish actions

### `lib/mongodb.ts`

- MongoDB client creation
- database access
- app index creation
- environment capability checks

### `lib/user-progress-store.ts`

- load and save helpers for `userProgress`

### `hooks/useStudyHistory.ts`

Client-side progress state source of truth for the UI:

- local hydration
- remote sync for authenticated users
- one-time local-to-remote merge
- theme and font preference application

## API and Server Action Entry Points

### Route handlers

- `app/api/auth/[...all]/route.ts`
- `app/api/user-progress/route.ts`

### User library server actions

- `app/(site)/my-library/actions.ts`

### Admin server actions

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
- login, private library, admin moderation, and remote progress sync do not work

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
10. `app/(site)/my-library/page.tsx`
11. `app/(site)/admin/page.tsx`
