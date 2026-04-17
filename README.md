# TrackLearn

TrackLearn is a Next.js study platform with:

- a public study catalog backed by MongoDB
- Google sign-in via Auth.js
- private user libraries for custom subjects, modules, materials, and companion notes
- admin moderation for publishing private content into the shared catalog
- synced signed-in progress with guest local fallback

The repository `data/subjects` folder is still the seed source for the public catalog, but the live app now serves content through a Mongo-backed runtime layer.

## Features

- Public subject, module, and material browsing
- Markdown rendering with heading extraction and table of contents navigation
- Google authentication with Mongo-backed sessions
- Private user library at `/my-library`
- Markdown paste and `.md` upload for private entries
- Companion private notes linked to public modules/materials
- Publication request workflow with admin approval/rejection
- Admin dashboard for moderation and public catalog management
- Synced signed-in progress, preferences, and recent activity
- Guest browsing with browser-local study state fallback

## Routes

- `/` - home dashboard
- `/login` - Google sign-in
- `/user` - signed-in progress and preferences dashboard
- `/my-library` - private subjects, entries, and publication requests
- `/my-library/subjects/:subjectId` - private subject editor
- `/my-library/entries/:entryId` - private entry editor
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
- Auth.js / NextAuth v5 beta
- MongoDB Atlas + MongoDB Node driver
- `@auth/mongodb-adapter`
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
- approved copies of user-submitted private content

### Private user content

Signed-in users can create:

- private subjects
- private modules
- private materials
- private companion notes linked to public entries

All user-created content starts private and stays private until an admin approves a publication request.

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

User roles live in MongoDB on the `users` collection.

To promote an account to admin in v1, update that user document and set:

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

## Notes

- If MongoDB is not configured, public browsing falls back to the repository seed content.
- Auth, private libraries, admin moderation, and synced progress require MongoDB.
- Markdown-only uploads are supported in v1. Images and large attachments are out of scope for now.
