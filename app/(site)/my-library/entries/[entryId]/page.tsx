import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  deleteEntryAction,
  submitEntryAction,
  updateEntryAction,
} from "@/app/(site)/my-library/actions";
import { requireUser } from "@/lib/auth-helpers";
import { getNavigationTree, getOwnedEntryById, listUserLibrary } from "@/lib/content";

export const dynamic = "force-dynamic";

interface EntryEditorPageProps {
  params: Promise<{
    entryId: string;
  }>;
}

export default async function EntryEditorPage({ params }: EntryEditorPageProps) {
  const viewer = await requireUser();
  const resolvedParams = await params;
  const [subjects, entry, library] = await Promise.all([
    getNavigationTree(viewer),
    getOwnedEntryById(viewer.userId!, resolvedParams.entryId),
    listUserLibrary(viewer.userId!),
  ]);

  if (!entry) {
    notFound();
  }

  const boundUpdateEntryAction = updateEntryAction.bind(null, entry.id);
  const boundDeleteEntryAction = deleteEntryAction.bind(null, entry.id);
  const boundSubmitEntryAction = submitEntryAction.bind(null, entry.id);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel={`My Library - ${entry.title}`}
      currentPathHint="Edit private markdown content, rework companion notes, and submit updates for review."
    >
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Entry Editor
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{entry.title}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {entry.subjectTitle} · {entry.kind} · {entry.status.replaceAll("_", " ")}
          </p>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <form action={boundUpdateEntryAction} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="title" className="field" defaultValue={entry.title} required />
              <select name="kind" className="field" defaultValue={entry.kind}>
                <option value="module">Module</option>
                <option value="material">Material</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="slug" className="field" defaultValue={entry.slug} />
              <input
                name="order"
                className="field"
                inputMode="numeric"
                defaultValue={entry.order ?? ""}
                placeholder="Optional order"
              />
            </div>
            <select name="subjectId" className="field" defaultValue={entry.subjectId}>
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
              defaultValue={entry.description ?? ""}
              placeholder="Short description"
            />
            <select
              name="linkedPublicEntryId"
              className="field"
              defaultValue={entry.linkedPublicEntryId ?? ""}
            >
              <option value="">No linked public page</option>
              {library.publicEntries.map((publicEntry) => (
                <option key={publicEntry.id} value={publicEntry.id}>
                  {publicEntry.subjectTitle} / {publicEntry.title}
                </option>
              ))}
            </select>
            <textarea
              name="markdown"
              className="field min-h-72 font-mono text-sm"
              defaultValue={entry.content}
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="markdownFile">
                Replace content from Markdown file
              </label>
              <input
                id="markdownFile"
                name="markdownFile"
                className="field"
                type="file"
                accept=".md,.markdown,text/markdown"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
                Save Entry
              </button>
              <button formAction={boundSubmitEntryAction} className="button-secondary px-4 py-3 text-sm font-semibold">
                Request Public Approval
              </button>
              <button formAction={boundDeleteEntryAction} className="button-secondary px-4 py-3 text-sm font-semibold">
                Delete Entry
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
