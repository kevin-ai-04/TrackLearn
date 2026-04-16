# TrackLearn Project Description

## Purpose

TrackLearn is a filesystem-driven study and documentation app built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and markdown tooling. The application is designed so that new content can be added by editing only the `/data` directory. No CMS, database, or server-side user storage is required.

## Content Structure

The content model is strict and follows this hierarchy:

```text
/data
  /subjects
    /[subjectSlug]
      meta.json
      /materials
        /[materialSlug]
          meta.json
          content.md
      /modules
        /[moduleSlug]
          meta.json
          content.md
```

### Subject metadata

Each subject must contain `meta.json` with at least:

- `title`

Optional fields:

- `order`
- `description`

### Module metadata

Each module must contain `meta.json` with at least:

- `title`

Optional fields:

- `order`
- `description`

Each module must also contain `content.md`.

### Material metadata

Each material must contain `meta.json` with at least:

- `title`

Optional fields:

- `order`
- `description`

Each material must also contain `content.md`.

The filesystem itself defines the route structure and content tree. No `.txt` index files are used.

## Build-Time Content Loading

The build-time content pipeline lives in [lib/content.ts](<lib/content.ts>).

### What it does

1. Reads `data/subjects`.
2. Discovers all subject folders.
3. Reads each subject `meta.json`.
4. Reads each material folder under `materials`.
5. Reads each material `meta.json` and `content.md`.
6. Reads each module folder under `modules`.
7. Reads each module `meta.json` and `content.md`.
8. Extracts h1-h3 headings from markdown.
9. Sorts subjects, materials, and modules by `order`, then by `title`.
10. Produces a normalized content tree used by the app.

### Returned model

The loader returns typed `SubjectContent`, `MaterialContent`, and `ModuleContent` objects from [types/content.ts](<types/content.ts>). Each material and module includes:

- subject and item slugs
- titles and descriptions
- raw markdown content
- extracted heading metadata
- resolved href

`getAllModuleParams()` is used by the module route to statically pre-render every module page.
`getAllMaterialParams()` is used by the material route to statically pre-render every material page.

## Markdown Rendering and TOC

Markdown helpers live in [lib/markdown.ts](<lib/markdown.ts>).

### Markdown flow

1. Raw markdown is read at build time.
2. Headings are parsed from the markdown AST with `remark-parse` and `unist-util-visit`.
3. Heading IDs are generated with `github-slugger` so they stay aligned with `rehype-slug`.
4. The module page renders markdown with `react-markdown`, `remark-gfm`, `rehype-slug`, and `rehype-autolink-headings`.

### TOC flow

- The module page passes extracted heading data into the sidebar.
- [components/toc/TableOfContents.tsx](<components/toc/TableOfContents.tsx>) groups headings by level and renders a navigation tree.
- Clicking a TOC item scrolls smoothly to the target section.
- An `IntersectionObserver` powers scroll spy and highlights the active section.

## Routing and Rendering

### Pages

- Homepage: [app/(site)/page.tsx](<app/(site)/page.tsx>)
- User dashboard: [app/(site)/user/page.tsx](<app/(site)/user/page.tsx>)
- Subject overview: [app/(site)/[subject]/page.tsx](<app/(site)/[subject]/page.tsx>)
- Material page: [app/(site)/[subject]/materials/[material]/page.tsx](<app/(site)/[subject]/materials/[material]/page.tsx>)
- Module page: [app/(site)/[subject]/[module]/page.tsx](<app/(site)/[subject]/[module]/page.tsx>)

### Rendering model

- Content discovery happens on the server at build time.
- Subject and module pages use static generation.
- Interactive UI pieces are isolated into client components.
- The markdown viewer itself remains lightweight and receives already-loaded content.

## Layout and UI Composition

The main shell is [components/layout/AppShell.tsx](<components/layout/AppShell.tsx>).

### Shell responsibilities

- renders the sticky top bar
- manages desktop vs mobile sidebar behavior
- drives page transition animation
- passes subject/module context to the sidebar

### Sidebar responsibilities

[components/sidebar/Sidebar.tsx](<components/sidebar/Sidebar.tsx>) owns the left column layout:

- top-left compact path header
- subject switcher
- current subject module list
- recent history panel
- bottom-left table of contents panel

The mobile version is [components/mobile/MobileSidebar.tsx](<components/mobile/MobileSidebar.tsx>) and uses Framer Motion for the slide-in drawer.

### Content view responsibilities

- [components/content/ModuleHeader.tsx](<components/content/ModuleHeader.tsx>) shows breadcrumbs, module metadata, done toggle, need-revision toggle, and previous/next navigation.
- [components/content/ContentViewer.tsx](<components/content/ContentViewer.tsx>) renders markdown with readable typography and anchor-enabled headings.

## User Data, Preferences, and History

The local study-state system is split between:

- [lib/history.ts](<lib/history.ts>)
- [hooks/useStudyHistory.ts](<hooks/useStudyHistory.ts>)
- [types/history.ts](<types/history.ts>)

### Stored data

The persisted state includes:

- theme preference
- reading font preference
- per-module visited flag
- visit count
- last visited timestamp
- done flag
- need revision flag
- recent activity list

### Persistence strategy

- Primary persistence uses `localStorage`.
- A cookie-backed JSON snapshot is also written for browser-local backup compatibility.
- The provider restores state on the client after hydration and applies `data-theme` and `data-font` attributes to the document root.

### Main state operations

`lib/history.ts` contains pure helpers for:

- loading persisted state
- normalizing imported or stored data
- marking module visits
- toggling done / need revision
- updating theme and font preferences
- exporting text and CSV
- importing and merging or replacing state

`useStudyHistory` wraps those helpers in a React context so UI components can read and update state without duplicating storage logic.

## Import / Export Flow

[components/history/ImportExportDialog.tsx](<components/history/ImportExportDialog.tsx>) handles client-side import/export UX.

### Export

- Text export serializes the full state as readable JSON.
- CSV export serializes per-module progress rows with:
  - `subject_slug`
  - `module_slug`
  - `visited`
  - `last_visited_timestamp`
  - `done`
  - `need_revision`

### Import

- Text import parses the JSON export and restores full state.
- CSV import parses module rows and restores module-level progress data.
- Merge and replace behaviors are supported.
- CSV merge intentionally preserves existing preferences because CSV does not carry theme/font data.

## Homepage and User Dashboard

### Homepage

[components/home/HomeDashboard.tsx](<components/home/HomeDashboard.tsx>) provides:

- subject discovery overview
- recent work continuation
- subject entry cards
- local history preview

### User dashboard

[components/history/UserDashboard.tsx](<components/history/UserDashboard.tsx>) provides:

- aggregate progress summary
- subject-by-subject metrics
- theme selection
- font selection
- import/export actions
- recent activity view

## Design Decisions

### Why filesystem-first

The user wanted new content to require only `/data` edits. The architecture keeps content ownership separate from UI logic and removes the need for a content backend.

### Why static generation

Subjects and modules are deterministic from the repository contents, so static generation is the simplest and most scalable choice. It also keeps runtime logic light.

### Why client-only local history

Progress, preferences, and revision flags are explicitly user-local. Keeping them in browser persistence avoids authentication, server storage, and privacy complexity.

### Why separate server and client layers

Build-time content loading and static routing belong on the server side. Progress tracking, theme switching, TOC highlighting, and import/export are inherently interactive and remain client-side.

## Files to Read First

If another coding agent needs fast orientation, start with these files:

1. [project-description.md](<project-description.md>)
2. [lib/content.ts](<lib/content.ts>)
3. [lib/history.ts](<lib/history.ts>)
4. [hooks/useStudyHistory.ts](<hooks/useStudyHistory.ts>)
5. [components/layout/AppShell.tsx](<components/layout/AppShell.tsx>)
6. [app/(site)/[subject]/[module]/page.tsx](<app/(site)/[subject]/[module]/page.tsx>)

## Current Status

At this stage, the scaffold includes:

- a complete content directory structure with sample subjects and modules
- a build-time filesystem loader
- static subject and module routes
- a responsive two-column documentation layout
- a mobile drawer sidebar
- markdown rendering with heading anchors
- TOC extraction and scroll spy
- local progress and preference persistence
- import/export support for text and CSV
- a dedicated user dashboard
