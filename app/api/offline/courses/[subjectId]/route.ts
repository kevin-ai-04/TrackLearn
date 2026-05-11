import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import {
  getUserCourseSubjectIds,
} from "@/lib/course-library";
import {
  getNavigationTree,
  getOwnedSubjectById,
  getSubjectBySlug,
} from "@/lib/content";
import type { MaterialContent, ModuleContent, SubjectContent } from "@/types/content";
import type { OfflineCourseSnapshot, OfflineCourseSource } from "@/types/offline";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    subjectId: string;
  }>;
}

function getLatestUpdatedAt(subject: SubjectContent) {
  return [
    subject.updatedAt,
    ...subject.modules.map((module) => module.updatedAt),
    ...subject.materials.map((material) => material.updatedAt),
  ]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? new Date().toISOString();
}

function mapEntry(
  entry: ModuleContent | MaterialContent,
  routeSegment: string,
) {
  return {
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    slug: entry.slug,
    description: entry.description,
    order: entry.order,
    headings: entry.headings,
    href:
      entry.kind === "module"
        ? `/${routeSegment}/${entry.slug}`
        : `/${routeSegment}/materials/${entry.slug}`,
    content: entry.content,
    updatedAt: entry.updatedAt,
  };
}

function toOfflineSnapshot(
  subject: SubjectContent,
  source: OfflineCourseSource,
): OfflineCourseSnapshot {
  const contentUpdatedAt = getLatestUpdatedAt(subject);

  return {
    schemaVersion: 1,
    source,
    id: subject.id,
    title: subject.title,
    slug: subject.slug,
    routeSegment: subject.routeSegment,
    href: subject.href,
    offlineHref: `/offline/courses/${subject.id}`,
    description: subject.description,
    order: subject.order,
    modules: subject.modules.map((module) => mapEntry(module, subject.routeSegment)),
    materials: subject.materials.map((material) => mapEntry(material, subject.routeSegment)),
    downloadedAt: new Date().toISOString(),
    contentUpdatedAt,
    serverUpdatedAt: subject.updatedAt,
  };
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getSession(request.headers);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId } = await context.params;
  const url = new URL(request.url);
  const requestedSource = url.searchParams.get("source");

  if (requestedSource === "personal") {
    const subject = await getOwnedSubjectById(session.user.id, subjectId);

    if (!subject) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    return NextResponse.json(toOfflineSnapshot(subject, "personal"));
  }

  const [subjects, selectedCourseIds] = await Promise.all([
    getNavigationTree(),
    getUserCourseSubjectIds(session.user.id),
  ]);
  const summary = subjects.find((subject) => subject.id === subjectId);

  if (!summary || !selectedCourseIds.includes(subjectId)) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const subject = await getSubjectBySlug(summary.routeSegment);

  if (!subject) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json(toOfflineSnapshot(subject, "public"));
}
