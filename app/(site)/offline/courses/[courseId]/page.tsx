import { OfflineCourseShell } from "@/components/offline/OfflineCourseShell";

interface OfflineCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function OfflineCoursePage({ params }: OfflineCoursePageProps) {
  const { courseId } = await params;

  return <OfflineCourseShell courseId={courseId} view={{ kind: "overview" }} />;
}
