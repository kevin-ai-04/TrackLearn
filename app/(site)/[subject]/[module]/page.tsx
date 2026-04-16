import { notFound } from "next/navigation";
import { ContentViewer } from "@/components/content/ContentViewer";
import { ModuleHeader } from "@/components/content/ModuleHeader";
import { AppShell } from "@/components/layout/AppShell";
import { getAllModuleParams, getModuleBySlugs, getNavigationTree } from "@/lib/content";

interface ModulePageProps {
  params: Promise<{
    subject: string;
    module: string;
  }>;
}

export async function generateStaticParams() {
  return getAllModuleParams();
}

export const dynamicParams = false;

export default async function ModulePage({ params }: ModulePageProps) {
  const resolvedParams = await params;
  const [subjects, moduleResult] = await Promise.all([
    getNavigationTree(),
    getModuleBySlugs(resolvedParams.subject, resolvedParams.module),
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
