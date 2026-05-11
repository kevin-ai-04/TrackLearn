import { OfflineCourseShell } from "@/components/offline/OfflineCourseShell";

interface OfflineMaterialPageProps {
  params: Promise<{
    courseId: string;
    material: string;
  }>;
}

export default async function OfflineMaterialPage({ params }: OfflineMaterialPageProps) {
  const { courseId, material } = await params;

  return <OfflineCourseShell courseId={courseId} view={{ kind: "material", materialSlug: material }} />;
}
