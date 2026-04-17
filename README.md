# TrackLearn

TrackLearn is a filesystem-first study app built with Next.js. It turns folders of markdown notes into a browsable learning workspace with subject pages, module pages, reference materials, a table of contents, and browser-local progress tracking.

The core idea is simple: add or edit content inside `data/subjects`, and the app discovers routes, navigation, headings, and page structure automatically at build time.

## Features

- Filesystem-driven content model with no CMS or database
- Static subject, module, and material routes generated from the `data` directory
- Markdown rendering with GitHub Flavored Markdown support
- Automatic heading extraction for in-page table of contents navigation
- Subject overview pages that group modules and materials
- Local study tracking for visited modules, done state, and revision flags
- User dashboard for progress metrics, theme selection, and reading font preference
- Import/export support for study state as JSON text or CSV
- Responsive layout with desktop sidebar and mobile drawer

## How It Works

TrackLearn reads all study content from `data/subjects` during build time. Each subject can contain:

- `modules`: primary learning pages that are tracked in study progress
- `materials`: supporting reference pages such as question banks, summaries, or external-resource collections

Routes are based on folder names, and items are sorted by `order` first, then by `title`.

## Project Structure

```text
data/
  subjects/
    your-subject/
      meta.json
      modules/
        your-module/
          meta.json
          content.md
      materials/
        your-material/
          meta.json
          content.md
```

Important app routes:

- `/` - home dashboard
- `/user` - local progress and preferences dashboard
- `/:subject` - subject overview
- `/:subject/:module` - module page
- `/:subject/materials/:material` - material page

## Installation

Prerequisites:

- Node.js LTS
- npm

Install dependencies:

```bash
npm install
```

Environment variables:

- None required for the current project setup

## Running Locally

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Production commands:

```bash
npm run build
npm start
```

Type-check the project:

```bash
npm run typecheck
```

## Authoring Content

TrackLearn is designed so that most content work happens inside `data/subjects`.

### 1. Create a subject

Create a folder under `data/subjects` and add `meta.json`:

```json
{
  "title": "Database Management Systems",
  "order": 1,
  "description": "Notes, modules, and revision material for DBMS."
}
```

Required field:

- `title`

Optional fields:

- `order`
- `description`

### 2. Add a module

Create a folder inside `modules` with `meta.json` and `content.md`:

```json
{
  "title": "Module 1 - Relational Model",
  "order": 1,
  "description": "Core notes for the relational model."
}
```

```md
# Relational Model

## Core Concepts

- Relations
- Tuples
- Attributes

## Keys

Explain super keys, candidate keys, and primary keys here.
```

Modules are the pages that TrackLearn uses for progress tracking.

### 3. Add a material

Create a folder inside `materials` with `meta.json` and `content.md`:

```json
{
  "title": "Previous Year Questions",
  "order": 1,
  "description": "Collected questions and revision priorities."
}
```

```md
# Previous Year Questions

## Frequently Repeated Topics

- Normalization
- Transactions
- Indexing
```

Materials are rendered like modules, but they are intended for supporting references rather than tracked lesson progress.

## Content Guidelines

- Use lowercase kebab-case folder names for clean routes
- Keep `title` human-readable inside `meta.json`
- Use `order` to control display order
- Use `#`, `##`, and `###` headings if you want them to appear in the table of contents
- External links in markdown open in a new tab
- GitHub Flavored Markdown is supported, including tables, lists, and task-style formatting

## Usage

### Studying

1. Open the home page to browse available subjects.
2. Open a subject to see its modules and materials.
3. Open a module to read content and navigate by heading.
4. Mark modules as done or needing revision.
5. Return later and continue from recent activity.

### Progress and Preferences

Open `/user` to:

- view progress summaries
- switch theme mode
- switch reading font
- export study state as text or CSV
- import saved study state with merge or replace behavior
- reset local browser state

## Data and Privacy

TrackLearn does not require authentication, a backend, or a database for study progress. User progress and preferences are stored locally in the browser using `localStorage`, with a small cookie-backed snapshot used as a backup.

That means:

- progress is local to the browser/device unless exported
- exporting is the intended way to move progress between devices
- repository content stays separate from personal study state

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm start` - run the production server
- `npm run typecheck` - run TypeScript checks

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Markdown
- Remark / Rehype tooling

## Included Sample Content

The repository already includes example subjects and notes under `data/subjects`, so you can run the project immediately and use those files as templates for your own content.
