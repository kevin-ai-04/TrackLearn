import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  deleteSubjectAction,
  submitSubjectAction,
  updateSubjectAction,
} from "@/app/(site)/my-library/actions";
import { requireUser } from "@/lib/auth-helpers";
import { getNavigationTree, getOwnedSubjectById } from "@/lib/content";

export const dynamic = "force-dynamic";

interface SubjectEditorPageProps {
  params: Promise<{
    subjectId: string;
  }>;
}

export default async function SubjectEditorPage({ params }: SubjectEditorPageProps) {
  const viewer = await requireUser();
  const resolvedParams = await params;
  const [subjects, subject] = await Promise.all([
    getNavigationTree(viewer),
    getOwnedSubjectById(viewer.userId!, resolvedParams.subjectId),
  ]);

  if (!subject) {
    notFound();
  }

  const boundUpdateSubjectAction = updateSubjectAction.bind(null, subject.id);
  const boundDeleteSubjectAction = deleteSubjectAction.bind(null, subject.id);
  const boundSubmitSubjectAction = submitSubjectAction.bind(null, subject.id);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel={`My Library - ${subject.title}`}
      currentPathHint="Edit your private subject metadata and submit it for publication when ready."
    >
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Subject Editor
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{subject.title}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Status: {subject.status.replaceAll("_", " ")}
          </p>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <form action={boundUpdateSubjectAction} className="space-y-3">
            <input name="title" className="field" defaultValue={subject.title} required />
            <input name="slug" className="field" defaultValue={subject.slug} />
            <input
              name="order"
              className="field"
              inputMode="numeric"
              defaultValue={subject.order ?? ""}
              placeholder="Optional order"
            />
            <textarea
              name="description"
              className="field min-h-32"
              defaultValue={subject.description ?? ""}
            />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
                Save Subject
              </button>
              <button formAction={boundSubmitSubjectAction} className="button-secondary px-4 py-3 text-sm font-semibold">
                Request Public Approval
              </button>
              <button formAction={boundDeleteSubjectAction} className="button-secondary px-4 py-3 text-sm font-semibold">
                Delete Subject
              </button>
            </div>
          </form>
        </section>

        <section className="panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Entries In This Subject
            </p>
            <span className="text-xs text-[var(--muted)]">
              {subject.modules.length + subject.materials.length} total
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {[...subject.modules, ...subject.materials].map((entry) => (
              <Link
                key={entry.id}
                href={`/my-library/entries/${entry.id}`}
                className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{entry.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{entry.kind}</p>
                  </div>
                  <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    {entry.status.replaceAll("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
