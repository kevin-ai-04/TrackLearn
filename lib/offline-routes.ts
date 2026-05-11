import type { OfflineCourseSnapshot } from "@/types/offline";

export function getOfflineCourseHref(course: Pick<OfflineCourseSnapshot, "id">) {
  return `/offline/courses/${course.id}`;
}

export function getOfflineModuleHref(course: Pick<OfflineCourseSnapshot, "id">, moduleSlug: string) {
  return `/offline/courses/${course.id}/${moduleSlug}`;
}

export function getOfflineMaterialHref(course: Pick<OfflineCourseSnapshot, "id">, materialSlug: string) {
  return `/offline/courses/${course.id}/materials/${materialSlug}`;
}

export function getOfflineRoutesForCourse(course: OfflineCourseSnapshot) {
  return [
    getOfflineCourseHref(course),
    ...course.modules.map((module) => getOfflineModuleHref(course, module.slug)),
    ...course.materials.map((material) => getOfflineMaterialHref(course, material.slug)),
  ];
}
