import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ManageComposer } from "@/components/library/ManageComposer";
import { requireUser } from "@/lib/auth-helpers";
import { getNavigationTree, listUserLibrary } from "@/lib/content";
import { formatContentStatus } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ManagePageProps {
  searchParams: Promise<{
    saved?: string;
  }>;
}

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const viewer = await requireUser();
  const resolvedSearchParams = await searchParams;
  const [subjects, library] = await Promise.all([
    getNavigationTree(viewer),
    listUserLibrary(viewer.userId),
  ]);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Manage"
      currentPathHint="Create, edit, and submit your personal subjects and entries from one place."
    >
      <div className="space-y-4">
        {resolvedSearchParams.saved === "entry" ? (
          <section className="rounded-[1.6rem] border border-emerald-300/60 bg-emerald-100/70 p-4 text-sm text-emerald-900">
            Entry saved. You are back in Manage.
          </section>
        ) : null}

        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Manage
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Your personal subject workspace.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
                Manage personal subjects, create entries, and track publication requests separately
                from the public browsing view.
              </p>
            </div>
            <Link href="/library" className="button-secondary px-4 py-3 text-sm font-semibold">
              Back To Library
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Personal subjects</p>
              <p className="mt-2 text-3xl font-semibold">{library.ownedSubjects.length}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Personal entries</p>
              <p className="mt-2 text-3xl font-semibold">{library.ownedEntries.length}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Publication requests</p>
              <p className="mt-2 text-3xl font-semibold">{library.publicationRequests.length}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Personal Subjects
                </p>
                <span className="text-xs text-[var(--muted)]">{library.ownedSubjects.length} total</span>
              </div>
              <div className="mt-4 space-y-3">
                {library.ownedSubjects.length ? (
                  library.ownedSubjects.map((subject) => (
                    <Link
                      key={subject.id}
                      href={`/library/subjects/${subject.id}`}
                      className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{subject.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {subject.description ?? "No description yet."}
                          </p>
                        </div>
                        <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                          {formatContentStatus(subject.status)}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    No personal subjects yet.
                  </div>
                )}
              </div>
            </section>

            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Personal Entries
                </p>
                <span className="text-xs text-[var(--muted)]">{library.ownedEntries.length} total</span>
              </div>
              <div className="mt-4 space-y-3">
                {library.ownedEntries.length ? (
                  library.ownedEntries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/library/entries/${entry.id}`}
                      className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{entry.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {entry.subjectTitle} / {entry.kind}
                          </p>
                        </div>
                        <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                          {formatContentStatus(entry.status)}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    No personal modules or materials yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Publication Requests
              </p>
              <span className="text-xs text-[var(--muted)]">{library.publicationRequests.length} total</span>
            </div>
            <div className="mt-4 space-y-3">
              {library.publicationRequests.length ? (
                library.publicationRequests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{request.snapshot.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {request.requestType.replaceAll("_", " ")}
                        </p>
                      </div>
                      <span className="status-pill bg-sky-500/15 text-sky-700">
                        {request.status}
                      </span>
                    </div>
                    {request.reviewNotes ? (
                      <p className="mt-3 text-sm text-[var(--muted)]">{request.reviewNotes}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                  No review requests submitted yet.
                </div>
              )}
            </div>
          </section>
        </section>

        <ManageComposer
          ownedSubjects={library.ownedSubjects}
          publicSubjects={library.publicSubjects}
        />
      </div>
    </AppShell>
  );
}
