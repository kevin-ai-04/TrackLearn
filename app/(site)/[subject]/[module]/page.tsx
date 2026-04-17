import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentViewer } from "@/components/content/ContentViewer";
import { ModuleHeader } from "@/components/content/ModuleHeader";
import { AppShell } from "@/components/layout/AppShell";
import { getViewer } from "@/lib/auth-helpers";
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
