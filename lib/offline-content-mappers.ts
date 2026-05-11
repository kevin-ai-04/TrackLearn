import type {
  MaterialContent,
  MaterialSummary,
  ModuleContent,
  ModuleSummary,
  SubjectSummary,
} from "@/types/content";
import type { OfflineCourseEntry, OfflineCourseSnapshot } from "@/types/offline";

function offlineEntryHref(courseId: string, entry: OfflineCourseEntry) {
  return entry.kind === "module"
    ? `/offline/courses/${courseId}/${entry.slug}`
    : `/offline/courses/${courseId}/materials/${entry.slug}`;
}

export function mapOfflineCourseToSubjectSummary(course: OfflineCourseSnapshot): SubjectSummary {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    routeSegment: course.routeSegment,
    href: `/offline/courses/${course.id}`,
    description: course.description,
    order: course.order,
    visibility: course.source === "personal" ? "private" : "public",
    status: course.source === "personal" ? "draft" : "published",
    ownerUserId: null,
    modules: course.modules.map((module) => mapOfflineModule(course, module)),
    materials: course.materials.map((material) => mapOfflineMaterial(course, material)),
    updatedAt: course.serverUpdatedAt,
  };
}

export function mapOfflineModule(
  course: OfflineCourseSnapshot,
  module: OfflineCourseEntry,
): ModuleContent {
  return {
    id: module.id,
    kind: "module",
    title: module.title,
    slug: module.slug,
    description: module.description,
    order: module.order,
    subjectId: course.id,
    subjectSlug: course.slug,
    subjectRouteSegment: course.routeSegment,
    subjectTitle: course.title,
    headings: module.headings,
    href: offlineEntryHref(course.id, module),
    content: module.content,
    visibility: course.source === "personal" ? "private" : "public",
    status: course.source === "personal" ? "draft" : "published",
    ownerUserId: null,
    updatedAt: module.updatedAt,
  };
}

export function mapOfflineMaterial(
  course: OfflineCourseSnapshot,
  material: OfflineCourseEntry,
): MaterialContent {
  return {
    id: material.id,
    kind: "material",
    title: material.title,
    slug: material.slug,
    description: material.description,
    order: material.order,
    subjectId: course.id,
    subjectSlug: course.slug,
    subjectRouteSegment: course.routeSegment,
    subjectTitle: course.title,
    headings: material.headings,
    href: offlineEntryHref(course.id, material),
    content: material.content,
    visibility: course.source === "personal" ? "private" : "public",
    status: course.source === "personal" ? "draft" : "published",
    ownerUserId: null,
    updatedAt: material.updatedAt,
  };
}

export function mapOfflineModules(course: OfflineCourseSnapshot): ModuleSummary[] {
  return course.modules.map((module) => mapOfflineModule(course, module));
}

export function mapOfflineMaterials(course: OfflineCourseSnapshot): MaterialSummary[] {
  return course.materials.map((material) => mapOfflineMaterial(course, material));
}
