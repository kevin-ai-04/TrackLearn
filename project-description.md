# TrackLearn Project Description

## Purpose

TrackLearn is a MongoDB-backed study platform built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Auth.js, and markdown tooling.

The app now supports three product areas:

- a public study catalog
- a signed-in private user library for custom content
- an admin moderation dashboard for publication requests

The repository `data/subjects` directory is no longer the live runtime source of truth. It is the seed/import source for the public catalog.

## Runtime Architecture

### Public content

Public subjects, modules, and materials are read through [lib/content.ts](<lib/content.ts>).

At runtime:

1. If MongoDB is configured, public catalog reads come from MongoDB.
2. If MongoDB is not configured, public pages fall back to filesystem seed data through [lib/fs-content.ts](<lib/fs-content.ts>).

This fallback is mainly for local resilience. The intended production path is MongoDB-backed content.

### Authentication

Auth is configured in [auth.ts](<auth.ts>) using:

- Auth.js / NextAuth
- Google provider
- MongoDB adapter

Supporting files:

- [app/api/auth/[...nextauth]/route.ts](<app/api/auth/[...nextauth]/route.ts>)
- [lib/auth-helpers.ts](<lib/auth-helpers.ts>)
- [types/next-auth.d.ts](<types/next-auth.d.ts>)

User roles are stored on Mongo `users` documents with:

- `role: "user" | "admin"`

### Private content and moderation

Private content creation, review submission, approval, rejection, and unpublish logic lives in:

- [lib/content-management.ts](<lib/content-management.ts>)

This file is the main mutation layer for:

- private subject CRUD
- private entry CRUD
- markdown upload/paste parsing
- publication request creation
- admin review decisions
- creation/updating of public copies
- unpublishing public records

### Progress sync

Study-state helpers remain in:

- [lib/history.ts](<lib/history.ts>)
- [hooks/useStudyHistory.ts](<hooks/useStudyHistory.ts>)
- [types/history.ts](<types/history.ts>)

But the persistence model changed:

- guests use browser-local persistence
- signed-in users load/save through [app/api/user-progress/route.ts](<app/api/user-progress/route.ts>)
- Mongo persistence helpers live in [lib/user-progress-store.ts](<lib/user-progress-store.ts>)

The provider still applies theme/font on the client, but signed-in state is account-backed and merged once from local state on first login.

## Mongo Collections

Application data uses these collections:

- `users`
- `accounts`
- `sessions`
- `verificationTokens`
- `subjects`
- `entries`
- `publicationRequests`
- `userProgress`

### `subjects`

Represents both public and private subjects.

Important fields:

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
- timestamps and review metadata

### `entries`

Represents both modules and materials.

Important fields:

- `subjectId`
- `kind: "module" | "material"`
- `title`
- `slug`
- `description`
- `order`
- `markdown`
- `headings`
- `visibility`
- `status`
- `ownerUserId`
- `linkedPublicEntryId`
- `sourceEntryId`
- `publishedEntryId`
- timestamps and review metadata

### `publicationRequests`

Represents moderation requests for private content becoming public or updating public copies.

Important fields:

- `requesterUserId`
- `reviewerUserId`
- `subjectId`
- `entryId`
- `requestType`
- `status`
- `reviewNotes`
- `snapshot`
- timestamps

### `userProgress`

Stores the normalized `StudyHistoryState` per user.

Important fields:

- `userId`
- `state`
- `migratedFromLocalAt`
- `updatedAt`

## Routes and Responsibilities

### Public pages

- [app/(site)/page.tsx](<app/(site)/page.tsx>) - homepage
- [app/(site)/[subject]/page.tsx](<app/(site)/[subject]/page.tsx>) - public subject overview
- [app/(site)/[subject]/[module]/page.tsx](<app/(site)/[subject]/[module]/page.tsx>) - public module page
- [app/(site)/[subject]/materials/[material]/page.tsx](<app/(site)/[subject]/materials/[material]/page.tsx>) - public material page

All public content routes are now dynamic server-rendered pages, not static filesystem-generated routes.

Public module/material pages also surface user-linked private notes when the viewer is signed in.

### Auth and account pages

- [app/(site)/login/page.tsx](<app/(site)/login/page.tsx>) - Google login entry
- [app/(site)/user/page.tsx](<app/(site)/user/page.tsx>) - signed-in dashboard
- [app/(site)/my-library/page.tsx](<app/(site)/my-library/page.tsx>) - library overview
- [app/(site)/my-library/subjects/[subjectId]/page.tsx](<app/(site)/my-library/subjects/[subjectId]/page.tsx>) - subject editor
- [app/(site)/my-library/entries/[entryId]/page.tsx](<app/(site)/my-library/entries/[entryId]/page.tsx>) - entry editor

### Admin pages

- [app/(site)/admin/page.tsx](<app/(site)/admin/page.tsx>) - moderation dashboard
- [app/(site)/admin/actions.ts](<app/(site)/admin/actions.ts>) - review and unpublish server actions

## Content Reading Layer

[lib/content.ts](<lib/content.ts>) is the runtime repository layer.

Key responsibilities:

- fetch public navigation tree
- fetch public subject/module/material content
- fetch owned private subjects/entries
- fetch linked private notes for a signed-in user
- list publication requests
- list published catalog items for admins

Important behavior:

- it uses MongoDB when configured
- it falls back to [lib/fs-content.ts](<lib/fs-content.ts>) for public seed content only
- it maps Mongo documents into the shared `types/content.ts` shapes consumed by the UI

## Filesystem Seed Layer

[lib/fs-content.ts](<lib/fs-content.ts>) preserves the original filesystem parsing logic.

It is now used for:

- local public-content fallback when MongoDB is missing
- seed/import parity with `data/subjects`

The Mongo seed script is:

- [scripts/seed-mongodb.mjs](<scripts/seed-mongodb.mjs>)

That script:

1. reads `data/subjects`
2. parses subject/module/material metadata
3. reads markdown
4. extracts heading metadata
5. upserts public `subjects` and `entries` into MongoDB

## UI Composition

The main shell remains [components/layout/AppShell.tsx](<components/layout/AppShell.tsx>).

Supporting pieces:

- [components/layout/AppTopBar.tsx](<components/layout/AppTopBar.tsx>) now includes auth-aware navigation and sign-out
- [components/layout/Providers.tsx](<components/layout/Providers.tsx>) now wraps both `SessionProvider` and `StudyHistoryProvider`
- [components/content/ModuleHeader.tsx](<components/content/ModuleHeader.tsx>) still owns visit/done/revision interactions
- [components/content/ContentViewer.tsx](<components/content/ContentViewer.tsx>) still renders markdown

## Study History Behavior

The current behavior is:

- `StudyHistoryProvider` hydrates from browser-local state first
- if the user is authenticated, it loads remote progress from `/api/user-progress`
- if no prior remote migration happened, it merges the initial local state into the account once
- later changes debounce-save back to the server
- local persistence is still maintained for resilience and guest mode

This means UI components should keep using `useStudyHistory()` instead of bypassing the provider.

## Important Constraints

- Public content is intended to be Mongo-backed.
- Private content is private by default.
- Approved content becomes a separate public copy.
- User edits after approval do not auto-update public records.
- A new review cycle is required after post-approval edits.
- Markdown uploads are text-only in v1.
- No object storage layer exists yet for binary assets.

## Environment Requirements

Required env vars for full functionality:

- `MONGODB_URI`
- `MONGODB_DB` optional, defaults to `tracklearn`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Without MongoDB:

- public browsing still works via filesystem fallback
- auth, private library, moderation, and remote progress sync do not

## Files to Read First

If another coding agent needs fast orientation, start with:

1. [project-description.md](<project-description.md>)
2. [auth.ts](<auth.ts>)
3. [lib/content.ts](<lib/content.ts>)
4. [lib/content-management.ts](<lib/content-management.ts>)
5. [hooks/useStudyHistory.ts](<hooks/useStudyHistory.ts>)
6. [app/(site)/my-library/page.tsx](<app/(site)/my-library/page.tsx>)
7. [app/(site)/admin/page.tsx](<app/(site)/admin/page.tsx>)

## Current Status

The implemented scaffold now includes:

- Mongo-backed public content reads
- Google auth with Mongo adapter
- role-based admin access
- private subject and entry authoring
- markdown paste/upload for private entries
- companion notes linked to public entries
- publication request workflow
- admin moderation dashboard
- signed-in progress sync with guest local fallback
- seed import from `data/subjects`
