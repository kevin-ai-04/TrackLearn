import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth-helpers";
import { isCourseInUserLibrary } from "@/lib/course-library";
import { getPublicSubjectContentById } from "@/lib/content";

interface OfflineCourseRouteContext {
  params: Promise<{
    subjectId: string;
  }>;
}

export async function GET(_request: Request, { params }: OfflineCourseRouteContext) {
  const viewer = await getViewer();

  if (!viewer.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId } = await params;
  const isInLibrary = await isCourseInUserLibrary(viewer.userId!, subjectId);

  if (!isInLibrary) {
    return NextResponse.json({ error: "Course is not in your library." }, { status: 403 });
  }

  const subject = await getPublicSubjectContentById(subjectId);

  if (!subject) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json({
    subject,
    downloadedAt: new Date().toISOString(),
    contentUpdatedAt: subject.updatedAt ?? null,
  });
}
