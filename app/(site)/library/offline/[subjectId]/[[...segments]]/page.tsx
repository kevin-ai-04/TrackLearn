import { OfflineCourseClient } from "@/components/offline/OfflineCourseClient";

interface OfflineCoursePageProps {
  params: Promise<{
    subjectId: string;
    segments?: string[];
  }>;
}

export default async function OfflineCoursePage({ params }: OfflineCoursePageProps) {
  const resolvedParams = await params;

  return (
    <OfflineCourseClient
      subjectId={resolvedParams.subjectId}
      segments={resolvedParams.segments ?? []}
    />
  );
}
