import Link from "next/link";

function CommunityLibraryIcon() {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true">
      <path d="M20 29c11 0 20 4 28 12 8-8 17-12 28-12v42c-11 0-20 4-28 12-8-8-17-12-28-12V29Z" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M48 41v42M30 41c6 1 11 3 16 7M30 53c6 1 11 3 16 7M66 41c-6 1-11 3-16 7M66 53c-6 1-11 3-16 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="25" cy="19" r="5" fill="currentColor" />
      <circle cx="48" cy="17" r="5" fill="currentColor" />
      <circle cx="71" cy="19" r="5" fill="currentColor" />
    </svg>
  );
}

function SyncProgressIcon() {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true">
      <rect x="34" y="24" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="14" y="50" width="18" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="64" y="54" width="24" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M28 31a28 28 0 0 0-11 14M64 30a28 28 0 0 1 15 17M61 75a28 28 0 0 1-28-1" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="m17 45-6-1 4-5M79 47l5 5-7 2M33 74l-5-5 7-2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OfflineSupportIcon() {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true">
      <rect x="20" y="18" width="40" height="58" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M40 30v25M30 48l10 10 10-10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 34h16l10 10v34H56V34Z" fill="var(--panel)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M72 35v12h10M62 56h13M62 66h13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const features = [
  {
    title: "Community Library",
    description: "Discover a diverse, community-curated collection of courses and personalized learning paths to study from.",
    icon: <CommunityLibraryIcon />,
  },
  {
    title: "Sync Progress",
    description: "Track achievements seamlessly and pick up right where you left off, across your devices.",
    icon: <SyncProgressIcon />,
  },
  {
    title: "Offline Support",
    description: "View chosen courses without an internet connection.",
    icon: <OfflineSupportIcon />,
  },
];

export function HomeDashboard() {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <section className="flex min-h-[52vh] items-center justify-center bg-accent px-4 pb-16 pt-28 text-center text-white md:min-h-[58vh]">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            TrackLearn
          </h1>
          <p className="mt-8 text-3xl font-medium text-white sm:text-5xl">Learning Simplified</p>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">
            Your curated platform for seamless knowledge discovery and skill acquisition.
          </p>
          <Link
            href="/explore"
            className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--accent-strong)] shadow-panel transition hover:-translate-y-0.5 hover:bg-[var(--surface-alt)]"
          >
            Explore Courses <span aria-hidden="true" className="ml-2">-&gt;</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Features
          </p>
        </div>
        <div className="mt-7 grid justify-center gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="panel flex min-h-64 flex-col rounded-lg p-6 text-center md:text-left"
            >
              <h2 className="text-2xl font-semibold">{feature.title}</h2>
              <div className="mx-auto mt-5 text-[var(--foreground)] md:mx-0">{feature.icon}</div>
              <p className="mt-auto pt-5 text-sm leading-6 text-[var(--muted)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/*
        Recent Activity and Subjects are intentionally hidden on the home page for now.
        They remain candidates for a later reimplementation after the Explore/Library split.
      */}
    </div>
  );
}
