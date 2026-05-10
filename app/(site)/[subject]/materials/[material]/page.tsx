import { notFound, redirect } from "next/navigation";
import { ContentViewer } from "@/components/content/ContentViewer";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth-helpers";
import { getUserCourseSubjectIds, listSelectedPublicSubjects } from "@/lib/course-library";
import { getMaterialBySlugs, getNavigationTree } from "@/lib/content";

interface MaterialPageProps {
  params: Promise<{
    subject: string;
    material: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function MaterialPage({ params }: MaterialPageProps) {
  const resolvedParams = await params;
  const viewer = await requireUser();
  const [subjects, materialResult, selectedCourseIds] = await Promise.all([
    getNavigationTree(viewer),
    getMaterialBySlugs(resolvedParams.subject, resolvedParams.material, viewer),
    getUserCourseSubjectIds(viewer.userId),
  ]);

  if (!materialResult) {
    notFound();
  }

  const { subject, material } = materialResult;
  const isInLibrary = selectedCourseIds.includes(subject.id);

  if (!isInLibrary) {
    redirect(`/explore?course=${subject.slug}`);
  }

  const selectedSubjects = await listSelectedPublicSubjects(viewer.userId!, subjects, selectedCourseIds);

  return (
    <AppShell
      subjects={selectedSubjects}
      currentSubjectSlug={subject.slug}
      currentMaterialSlug={material.slug}
      currentPathLabel={`${subject.title} - ${material.title}`}
      currentPathHint={material.description}
      headings={material.headings}
    >
      <div className="space-y-4">
        <section className="panel rounded-xl p-6 sm:p-8">
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

      </div>
    </AppShell>
  );
}
