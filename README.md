# TrackLearn

TrackLearn is a study platform for browsing learning content, tracking progress, and building your own private study library.

It supports two usage modes:

- Browse the public course catalog overview without signing in
- Sign in to add courses to your library, read course content, save progress, create private subjects and notes, and submit content for review

Currently hosted at [TrackLearn](https://tracklearn.vercel.app/)

## Overview

TrackLearn is designed around a shared learning library plus personal study space.

- Explore public courses before adding them to your library
- Search and filter available courses
- Build a signed-in library from selected public courses
- Continue where you left off with progress tracking
- Mark modules as done or flag them for revision
- Choose your reading theme and font
- Create your own personal subjects, modules, and materials
- Paste Markdown or upload `.md` files for personal content
- Submit personal content for publication review
- Review and moderate submissions from the admin dashboard

## Main Features

### Public learning experience

- Explore page anyone can browse as a course catalog overview
- Search and filter controls on Explore and Library
- Signed-in Library page containing only selected courses plus personal subjects
- Subject overview pages for selected courses
- Module and material pages with clean reading layouts for signed-in users
- Sidebar navigation for moving between subjects, modules, and materials
- Table of contents navigation for long Markdown pages

### Study tracking

- Progress tracking for courses in a signed-in user's library
- "Mark as Done" and "Flag Revision" actions on modules
- Guest progress saved in the browser
- Account sync for signed-in users

### Personal workspace

- Create private subjects
- Add private modules and materials
- Paste Markdown directly or upload Markdown files
- Keep personal work private until you are ready
- Submit content for review when you want it published
- Create a private editable copy of a public course from its subject overview
- Sync a private copy from the latest public version when the public course is newer

### Admin tools

- Review pending publication requests
- Approve, reject, or request changes
- Compare submitted updates with the current public version
- Edit or unpublish public content

## UI Overview

### Home dashboard

The home page is a centered landing view with a TrackLearn hero, Explore Courses call to action, and feature cards. Recent Activity and Subjects are hidden for now and are planned for later reimplementation.

![Home](images/Home.png)

### Explore

The Explore page is the public catalog overview. Users can search and filter available courses. Clicking "Add To Library" requires sign-in; after a signed-in add, a non-intrusive confirmation appears and the course becomes available from Library.

### Library

The Library page requires sign-in. It shows selected public courses from Explore and the user's personal subjects, with search and filtering controls for both areas.

### Study reader

Subject, module, and material pages are built for reading after a course has been added to the signed-in user's library. Users can move through content with the sidebar, use the table of contents on longer pages, and track study progress from the module header.

![Reader](images/Reader_UI.gif)

#### Mobile View
![Mobile View](images/mobile_reader.png)

### Personal workspace

The Manage page is where signed-in users create subjects, add entries, upload Markdown, and monitor publication requests.

### Settings and progress

The Settings page includes theme selection, font selection, import/export for progress, reset controls, and synced account state when logged in.

### Admin dashboard

Admins can review submissions, inspect snapshots, edit public entries, and manage the public catalog from one place.


## Access levels

TrackLearn expands in three layers of access. Each level includes the capabilities of the previous one.

### Guest

Available without authentication:

- Home page
- Explore catalog overview
- Settings page
- Theme and font preferences

### Signed in as User

Unlocks the following features:

- Add courses from Explore to Library
- Read selected course content
- Synced progress and preferences
- Search and filter selected Library courses
- Personal subject creation
- Personal module and material creation
- Markdown paste and `.md` upload for personal entries
- Private edits to public courses
- Publication request workflow

### Signed in as Admin

Allows the following:

- Admin dashboard access
- Publication review and moderation
- Public catalog editing and unpublishing tools

## Setup

### Local run (basic setup)

1. Install [Node.js LTS](https://nodejs.org/).
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

The app will still load public study content from `data/subjects` even if MongoDB is not configured.

### Full application setup

This configuration enables authentication, personal content management, moderation, and synced progress.

#### Requirements

- Node.js LTS
- A MongoDB Atlas database
- A Google OAuth app

#### Step 1: Install dependencies

```bash
npm install
```

#### Step 2: Configure environment variables

Create a file named `.env.local` in the project root and copy the values from `.env.example`.

Example:

```env
MONGODB_URI=
MONGODB_DB=tracklearn
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

Notes:

- `AUTH_SECRET` should be a long random string
- `BETTER_AUTH_URL` should stay `http://localhost:3000` for local development
- `MONGODB_DB` can stay as `tracklearn` unless you want a different database name

To generate an auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 3: Seed the catalog

```bash
npm run seed:mongodb
```

This imports the public subjects, modules, and materials from `data/subjects` into MongoDB.

#### Step 4: Run the app

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Application Flow

### Guest mode

1. Open the home page
2. Open `/explore`
3. Browse, search, and filter available course overviews
4. Sign in when adding a course to Library or opening course content

### Authenticated users

1. Open `/login`
2. Choose a role
3. Sign in with Google
4. Open `/explore`
5. Add courses to Library
6. Open `/library` to view selected courses and personal subjects
7. Edit private copies or create personal subjects and entries
8. Submit content for review when ready

### Admin mode

1. Sign in as admin
2. Open `/admin`
3. Review pending publication requests
4. Approve, reject, edit, or unpublish content


## Tech Stack

TrackLearn is built with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Better Auth
- MongoDB

## Notes

- This project supports guest catalog browsing and signed-in course libraries
- Public content can come from MongoDB or from the local `data/subjects` fallback
- The current login flow includes role selection for evaluation and testing purposes
