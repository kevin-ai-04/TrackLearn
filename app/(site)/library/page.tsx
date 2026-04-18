import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getViewer } from "@/lib/auth-helpers";
import { getNavigationTree, listUserLibrary } from "@/lib/content";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const viewer = await getViewer();
  const [subjects, library] = await Promise.all([
    getNavigationTree(viewer),
    listUserLibrary(viewer.userId),
  ]);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Library"
      currentPathHint="Browse the public catalog, then sign in when you want to manage personal subjects."
    >
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Library
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Public subjects, with your personal subjects below.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            The library is open to everyone. Browse the shared subject catalog here, then sign in
            when you want to create and manage your own personal subjects.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Public subjects</p>
              <p className="mt-2 text-3xl font-semibold">{library.publicSubjects.length}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Personal subjects</p>
              <p className="mt-2 text-3xl font-semibold">{library.ownedSubjects.length}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Personal entries</p>
              <p className="mt-2 text-3xl font-semibold">{library.ownedEntries.length}</p>
            </div>
          </div>
        </section>

        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Public Subjects
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Explore the full catalog</h2>
            </div>
            <p className="text-sm text-[var(--muted)]">{library.publicSubjects.length} total</p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {library.publicSubjects.map((subject) => (
              <article key={subject.id} className="panel rounded-[2rem] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Subject
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{subject.title}</h3>
                {subject.description ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{subject.description}</p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                  <span>{formatCount(subject.materials.length, "material")}</span>
                  <span>&bull;</span>
                  <span>{formatCount(subject.modules.length, "module")}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={subject.href} className="button-secondary px-4 py-3 text-sm font-semibold">
                    Explore Subject
                  </Link>
                  {subject.modules[0] ? (
                    <Link
                      href={subject.modules[0].href}
                      className="button-primary px-4 py-3 text-sm font-semibold"
                    >
                      Open First Module
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        {!viewer.isAuthenticated ? (
          <section className="panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Personal Subjects
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Sign in to create and manage your own subjects</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Your personal subjects, entries, and publication requests are available after you sign
              in. The public library above stays open either way.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/login" className="button-primary px-4 py-3 text-sm font-semibold">
                Sign In To Manage Personal Subjects
              </Link>
            </div>
          </section>
        ) : null}

        {viewer.isAuthenticated ? (
          <section className="panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Personal Subjects
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Your personal subject space</h2>
              </div>
              <p className="text-sm text-[var(--muted)]">{library.ownedSubjects.length} total</p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {library.ownedSubjects.length ? (
                library.ownedSubjects.map((subject) => (
                  <article key={subject.id} className="panel rounded-[2rem] p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                          Personal Subject
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold">{subject.title}</h3>
                      </div>
                      <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                        {subject.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    {subject.description ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{subject.description}</p>
                    ) : null}
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                      <span>{formatCount(subject.materials.length, "material")}</span>
                      <span>&bull;</span>
                      <span>{formatCount(subject.modules.length, "module")}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/library/subjects/${subject.id}`}
                        className="button-primary px-4 py-3 text-sm font-semibold"
                      >
                        Open Subject
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)] lg:col-span-2">
                  No personal subjects yet. Use Manage at the bottom of the page to create your first one.
                </div>
              )}
            </div>
          </section>
        ) : null}

        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Manage
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Create, edit, and submit your personal work</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Publication requests, subject creation, and entry creation now live in a separate manage
            view so the main library can stay focused on browsing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {viewer.isAuthenticated ? (
              <Link href="/library/manage" className="button-primary px-4 py-3 text-sm font-semibold">
                Manage
              </Link>
            ) : (
              <Link href="/login" className="button-primary px-4 py-3 text-sm font-semibold">
                Sign In To Manage
              </Link>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
