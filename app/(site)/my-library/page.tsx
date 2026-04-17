import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { createEntryAction, createSubjectAction } from "@/app/(site)/my-library/actions";
import { requireUser } from "@/lib/auth-helpers";
import { getNavigationTree, listUserLibrary } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function MyLibraryPage() {
  const viewer = await requireUser();
  const [subjects, library] = await Promise.all([
    getNavigationTree(viewer),
    listUserLibrary(viewer.userId!),
  ]);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="My Library"
      currentPathHint="Create private content, attach notes to public modules, and submit drafts for admin review."
    >
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            My Library
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Private subjects, modules, materials, and publication requests.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            All content you create starts private. You can attach companion notes to public study
            pages, or build full private subjects and submit them when they are ready for review.
          </p>
        </section>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Create Subject
            </p>
            <form action={createSubjectAction} className="mt-5 space-y-3">
              <input name="title" className="field" placeholder="Private subject title" required />
              <input name="slug" className="field" placeholder="Optional custom slug" />
              <input
                name="order"
                className="field"
                inputMode="numeric"
                placeholder="Optional order"
              />
              <textarea
                name="description"
                className="field min-h-32"
                placeholder="Short description"
              />
              <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
                Create Private Subject
              </button>
            </form>
          </section>

          <section className="panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Create Entry
            </p>
            <form action={createEntryAction} className="mt-5 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="title" className="field" placeholder="Module or material title" required />
                <select name="kind" className="field" defaultValue="module">
                  <option value="module">Module</option>
                  <option value="material">Material</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="slug" className="field" placeholder="Optional custom slug" />
                <input
                  name="order"
                  className="field"
                  inputMode="numeric"
                  placeholder="Optional order"
                />
              </div>
              <select name="subjectId" className="field" required defaultValue="">
                <option value="" disabled>
                  Choose a parent subject
                </option>
                {library.ownedSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    Private: {subject.title}
                  </option>
                ))}
                {library.publicSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    Public: {subject.title}
                  </option>
                ))}
              </select>
              <input
                name="description"
                className="field"
                placeholder="Short description"
              />
              <select name="linkedPublicEntryId" className="field" defaultValue="">
                <option value="">Optional companion note target</option>
                {library.publicEntries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.subjectTitle} / {entry.title}
                  </option>
                ))}
              </select>
              <textarea
                name="markdown"
                className="field min-h-56 font-mono text-sm"
                placeholder="Paste markdown content"
              />
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="markdownFile">
                  Or upload a Markdown file
                </label>
                <input
                  id="markdownFile"
                  name="markdownFile"
                  className="field"
                  type="file"
                  accept=".md,.markdown,text/markdown"
                />
              </div>
              <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
                Create Private Entry
              </button>
            </form>
          </section>
        </div>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Private Subjects
                </p>
                <span className="text-xs text-[var(--muted)]">{library.ownedSubjects.length} total</span>
              </div>
              <div className="mt-4 space-y-3">
                {library.ownedSubjects.length ? (
                  library.ownedSubjects.map((subject) => (
                    <Link
                      key={subject.id}
                      href={`/my-library/subjects/${subject.id}`}
                      className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{subject.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">{subject.description ?? "No description yet."}</p>
                        </div>
                        <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                          {subject.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    No private subjects yet.
                  </div>
                )}
              </div>
            </section>

            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Private Entries
                </p>
                <span className="text-xs text-[var(--muted)]">{library.ownedEntries.length} total</span>
              </div>
              <div className="mt-4 space-y-3">
                {library.ownedEntries.length ? (
                  library.ownedEntries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/my-library/entries/${entry.id}`}
                      className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{entry.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {entry.subjectTitle} · {entry.kind}
                          </p>
                        </div>
                        <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                          {entry.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    No private modules or materials yet.
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
      </div>
    </AppShell>
  );
}
