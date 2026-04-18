# TrackLearn

TrackLearn is a Next.js study platform with:

- a public study catalog backed by MongoDB
- Google sign-in via Better Auth
- personal subject management for custom subjects, modules, and materials
- admin moderation for publishing personal content into the shared catalog
- synced signed-in progress with guest local fallback


## Features

- Public subject, module, and material browsing
- Markdown rendering with heading extraction and table of contents navigation
- Google authentication with Better Auth and Mongo-backed sessions
- Public library at `/library` plus signed-in management at `/library/manage`
- Markdown paste and `.md` upload for personal entries
- Publication request workflow with admin approval/rejection
- Admin dashboard for moderation and public catalog management
- Synced signed-in progress, preferences, and recent activity
- Guest browsing with browser-local study state fallback

## Routes

- `/` - home dashboard
- `/login` - Google sign-in
- `/user` - signed-in progress and preferences dashboard
- `/library` - public subject library with signed-in personal subject cards
- `/library/manage` - personal subjects, entries, and publication requests
- `/library/subjects/:subjectId` - personal subject editor
- `/library/entries/:entryId` - personal entry editor
- `/admin` - admin-only moderation dashboard
- `/:subject` - public subject overview
- `/:subject/:module` - public module page
- `/:subject/materials/:material` - public material page

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Better Auth
- MongoDB Atlas + MongoDB Node driver
- React Markdown + Remark / Rehype tooling

## Local Setup

Prerequisites:

- Node.js LTS
- npm
- MongoDB Atlas database
- Google OAuth app credentials

Install dependencies:

```bash
npm install
```

Required environment variables:

```bash
MONGODB_URI=
MONGODB_DB=tracklearn
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
BETTER_AUTH_URL=
```

Recommended first-time catalog seed:

```bash
npm run seed:mongodb
```

Run locally:

```bash
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run build
```

## Content Model

### Public catalog

The shared catalog is stored in MongoDB using:

- `subjects`
- `entries`

Public entries are either:

- imported from `data/subjects` via the seed script
- approved copies of user-submitted personal content

### Personal user content

Signed-in users can create:

- personal subjects
- personal modules
- personal materials

All user-created content starts private in storage and is treated as personal content in the UI until an admin approves a publication request.

### Moderation

Publication requests are stored in `publicationRequests`.

Admins can:

- review pending submissions
- approve or reject with notes
- publish approved copies into the shared catalog
- unpublish public subjects or entries

Approved public content is stored as a separate public copy. Later edits to the user’s private draft require a new review cycle before public updates go live.

## Progress and Preferences

TrackLearn supports two modes:

- Guest mode: progress and preferences stay in browser storage
- Signed-in mode: progress and preferences sync to MongoDB

On first login, existing browser-local history is merged into the account-backed state once.

## Seeding From `/data`

The `data/subjects` directory is used as the seed source for public content.

Seed command:

```bash
npm run seed:mongodb
```

That script:

- reads subjects, modules, and materials from `data/subjects`
- extracts markdown headings
- upserts public records into MongoDB
- preserves route slugs for the shared catalog

## Admin Role

User roles live in MongoDB on the `user` collection.

To promote an account to admin, update that user document and set:

```json
{
  "role": "admin"
}
```

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run typecheck` - run TypeScript checks
- `npm run seed:mongodb` - import `data/subjects` into MongoDB as public catalog content
