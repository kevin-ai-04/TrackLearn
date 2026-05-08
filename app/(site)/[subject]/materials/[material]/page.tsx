import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentViewer } from "@/components/content/ContentViewer";
import { AppShell } from "@/components/layout/AppShell";
<<<<<<< Updated upstream
import { getViewer } from "@/lib/auth-helpers";
=======
import { requireUser } from "@/lib/auth-helpers";
import { getUserCourseSubjectIds, listSelectedPublicSubjects } from "@/lib/course-library";
>>>>>>> Stashed changes
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
  const viewer = await getViewer();
  const [subjects, materialResult] = await Promise.all([
    getNavigationTree(),
    getMaterialBySlugs(resolvedParams.subject, resolvedParams.material, viewer),
  ]);

  if (!materialResult) {
    notFound();
  }

  const { subject, material } = materialResult;
<<<<<<< Updated upstream

=======
  const selectedCourseIds = await getUserCourseSubjectIds(viewer.userId!);
  const isInLibrary = selectedCourseIds.includes(subject.id);

  if (!isInLibrary) {
    redirect(`/explore?course=${subject.slug}`);
  }

  const selectedSubjects = await listSelectedPublicSubjects(viewer.userId!, subjects, selectedCourseIds);
>>>>>>> Stashed changes

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

      </div>
    </AppShell>
  );
}
