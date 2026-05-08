import { notFound, redirect } from "next/navigation";
import { ContentViewer } from "@/components/content/ContentViewer";
import { ModuleHeader } from "@/components/content/ModuleHeader";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth-helpers";
import { getUserCourseSubjectIds, listSelectedPublicSubjects } from "@/lib/course-library";
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
  const viewer = await requireUser();
  const [subjects, moduleResult, selectedCourseIds] = await Promise.all([
    getNavigationTree(viewer),
    getModuleBySlugs(resolvedParams.subject, resolvedParams.module, viewer),
    getUserCourseSubjectIds(viewer.userId),
  ]);

  if (!moduleResult) {
    notFound();
  }

  const { subject, module, previousModule, nextModule } = moduleResult;
  const isInLibrary = selectedCourseIds.includes(subject.id);

  if (!isInLibrary) {
    redirect(`/explore?course=${subject.slug}`);
  }

  const selectedSubjects = await listSelectedPublicSubjects(viewer.userId!, subjects, selectedCourseIds);

  return (
    <AppShell
      subjects={selectedSubjects}
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
