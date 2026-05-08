import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentViewer } from "@/components/content/ContentViewer";
import { ModuleHeader } from "@/components/content/ModuleHeader";
import { AppShell } from "@/components/layout/AppShell";
<<<<<<< Updated upstream
import { getViewer } from "@/lib/auth-helpers";
=======
import { requireUser } from "@/lib/auth-helpers";
import { getUserCourseSubjectIds, listSelectedPublicSubjects } from "@/lib/course-library";
>>>>>>> Stashed changes
import { getModuleBySlugs, getNavigationTree } from "@/lib/content";

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

      </div>
    </AppShell>
  );
}
