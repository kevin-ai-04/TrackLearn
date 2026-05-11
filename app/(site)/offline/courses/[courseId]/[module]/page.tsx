import { OfflineCourseShell } from "@/components/offline/OfflineCourseShell";

interface OfflineModulePageProps {
  params: Promise<{
    courseId: string;
    module: string;
  }>;
}

export default async function OfflineModulePage({ params }: OfflineModulePageProps) {
  const { courseId, module } = await params;

  return <OfflineCourseShell courseId={courseId} view={{ kind: "module", moduleSlug: module }} />;
}
