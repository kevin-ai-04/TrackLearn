import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentViewer } from "@/components/content/ContentViewer";
import { AppShell } from "@/components/layout/AppShell";
import { getViewer } from "@/lib/auth-helpers";
import { getMaterialBySlugs, getNavigationTree, getUserLinkedEntries } from "@/lib/content";

interface MaterialPageProps {
  params: Promise<{
    subject: string;
    material: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function MaterialPage({ params }: MaterialPageProps) {
  const resolvedParams = await params;
  const viewer = await getViewer();
  const [subjects, materialResult] = await Promise.all([
    getNavigationTree(),
    getMaterialBySlugs(resolvedParams.subject, resolvedParams.material, viewer),
  ]);

  if (!materialResult) {
    notFound();
  }

  const { subject, material } = materialResult;
  const linkedEntries = viewer.userId ? await getUserLinkedEntries(viewer.userId, material.id) : [];

  return (
    <AppShell
      subjects={subjects}
      currentSubjectSlug={subject.slug}
      currentMaterialSlug={material.slug}
      currentPathLabel={`${subject.title} - ${material.title}`}
      currentPathHint={material.description}
      headings={material.headings}
    >
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Material
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {material.title}
          </h1>
          {material.description ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {material.description}
            </p>
          ) : null}
          <p className="mt-5 text-sm text-[var(--muted)]">
            External links in this material open in a new tab.
          </p>
        </section>

        <ContentViewer content={material.content} />
        {viewer.userId ? (
          <section className="panel rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Your Private Notes
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Keep private companion notes for this material in your library.
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
                  No private notes linked to this material yet.
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
