import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentViewer } from "@/components/content/ContentViewer";
import { ModuleHeader } from "@/components/content/ModuleHeader";
import { AppShell } from "@/components/layout/AppShell";
import { getViewer } from "@/lib/auth-helpers";
import { getModuleBySlugs, getNavigationTree, getUserLinkedEntries } from "@/lib/content";

interface ModulePageProps {
  params: Promise<{
    subject: string;
    module: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: ModulePageProps) {
  const resolvedParams = await params;
  const viewer = await getViewer();
  const [subjects, moduleResult] = await Promise.all([
    getNavigationTree(),
    getModuleBySlugs(resolvedParams.subject, resolvedParams.module, viewer),
  ]);

  if (!moduleResult) {
    notFound();
  }

  const { subject, module, previousModule, nextModule } = moduleResult;
  const linkedEntries = viewer.userId ? await getUserLinkedEntries(viewer.userId, module.id) : [];

  return (
    <AppShell
      subjects={subjects}
      currentSubjectSlug={subject.slug}
      currentModuleSlug={module.slug}
      currentPathLabel={`${subject.title} - ${module.title}`}
      currentPathHint={module.description}
      headings={module.headings}
    >
      <div className="space-y-4">
        <ModuleHeader
          subjectSlug={subject.slug}
          moduleSlug={module.slug}
          subjectTitle={subject.title}
          moduleTitle={module.title}
          description={module.description}
          previousModule={previousModule}
          nextModule={nextModule}
        />
        <ContentViewer content={module.content} />
        {viewer.userId ? (
          <section className="panel rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Your Private Notes
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Add or revise private companion notes for this module from your library.
                </p>
              </div>
              <Link href="/my-library" className="button-secondary px-4 py-3 text-sm font-semibold">
                Open My Library
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {linkedEntries.length ? (
                linkedEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/my-library/entries/${entry.id}`}
                    className="block rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
                  >
                    <p className="font-semibold">{entry.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{entry.kind}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                  No private notes linked to this module yet.
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
