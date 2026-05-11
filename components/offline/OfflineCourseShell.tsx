"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ContentViewer } from "@/components/content/ContentViewer";
import { ModuleHeader } from "@/components/content/ModuleHeader";
import { AppShell } from "@/components/layout/AppShell";
import { SubjectOverviewSections } from "@/components/subject/SubjectOverviewSections";
import { getDownloadedCourse } from "@/lib/offline-storage";
import {
  mapOfflineCourseToSubjectSummary,
  mapOfflineMaterial,
  mapOfflineMaterials,
  mapOfflineModule,
  mapOfflineModules,
} from "@/lib/offline-content-mappers";
import { formatCount } from "@/lib/utils";
import type { OfflineCourseSnapshot } from "@/types/offline";

type OfflineCourseView =
  | { kind: "overview" }
  | { kind: "module"; moduleSlug: string }
  | { kind: "material"; materialSlug: string };

interface OfflineCourseShellProps {
  courseId: string;
  view: OfflineCourseView;
}

function OfflineUnavailable() {
  return (
    <AppShell
      subjects={[]}
      currentPathLabel="Offline content unavailable"
      currentPathHint="This course was not downloaded on this device."
    >
      <section className="panel rounded-xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Offline
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Course not downloaded
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Reconnect and download this course from Library before opening it offline.
        </p>
        <Link href="/library" className="button-primary mt-6 inline-flex px-4 py-3 text-sm font-semibold">
          Back To Library
        </Link>
      </section>
    </AppShell>
  );
}

export function OfflineCourseShell({ courseId, view }: OfflineCourseShellProps) {
  const [course, setCourse] = useState<OfflineCourseSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      const downloadedCourse = await getDownloadedCourse(courseId);

      if (!cancelled) {
        setCourse(downloadedCourse ?? null);
        setLoaded(true);
      }
    }

    void loadCourse();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const subjects = useMemo(
    () => (course ? [mapOfflineCourseToSubjectSummary(course)] : []),
    [course],
  );

  if (!loaded) {
    return (
      <AppShell subjects={[]} currentPathLabel="Loading offline course" loading>
        <section className="panel rounded-xl p-6 sm:p-8">
          <div className="h-6 w-40 animate-pulse rounded bg-[var(--panel-alt)]" />
          <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-[var(--panel-alt)]" />
        </section>
      </AppShell>
    );
  }

  if (!course) {
    return <OfflineUnavailable />;
  }

  if (view.kind === "overview") {
    return (
      <AppShell
        subjects={subjects}
        currentSubjectSlug={course.routeSegment}
        currentPathLabel={`${course.title} - Offline Course Overview`}
        currentPathHint={course.description}
      >
        <div className="space-y-4">
          <section className="panel rounded-xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {course.source === "personal" ? "Offline Personal Course" : "Offline Course"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {course.title}
            </h1>
            {course.description ? (
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
                {course.description}
              </p>
            ) : null}
            <p className="mt-5 text-sm text-[var(--muted)]">
              This download contains {formatCount(course.materials.length, "material")} and{" "}
              {formatCount(course.modules.length, "module")}.
            </p>
            {course.source === "personal" ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Personal courses are read-only while offline.
              </p>
            ) : null}
          </section>

          <SubjectOverviewSections
            subjectSlug={course.routeSegment}
            materials={mapOfflineMaterials(course)}
            modules={mapOfflineModules(course)}
          />
        </div>
      </AppShell>
    );
  }

  if (view.kind === "module") {
    const moduleIndex = course.modules.findIndex((item) => item.slug === view.moduleSlug);
    const module = moduleIndex >= 0 ? mapOfflineModule(course, course.modules[moduleIndex]) : null;
    const previousModule = moduleIndex > 0 ? mapOfflineModule(course, course.modules[moduleIndex - 1]) : null;
    const nextModule =
      moduleIndex >= 0 && moduleIndex < course.modules.length - 1
        ? mapOfflineModule(course, course.modules[moduleIndex + 1])
        : null;

    if (!module) {
      return <OfflineUnavailable />;
    }

    return (
      <AppShell
        subjects={subjects}
        currentSubjectSlug={course.routeSegment}
        currentModuleSlug={module.slug}
        currentPathLabel={`${course.title} - ${module.title}`}
        currentPathHint={module.description}
        headings={module.headings}
      >
        <ModuleHeader
          subjectSlug={course.routeSegment}
          moduleSlug={module.slug}
          subjectTitle={course.title}
          moduleTitle={module.title}
          description={module.description}
          previousModule={previousModule}
          nextModule={nextModule}
        />
        <ContentViewer content={module.content} />
      </AppShell>
    );
  }

  const materialEntry = course.materials.find((item) => item.slug === view.materialSlug);
  const material = materialEntry ? mapOfflineMaterial(course, materialEntry) : null;

  if (!material) {
    return <OfflineUnavailable />;
  }

  return (
    <AppShell
      subjects={subjects}
      currentSubjectSlug={course.routeSegment}
      currentMaterialSlug={material.slug}
      currentPathLabel={`${course.title} - ${material.title}`}
      currentPathHint={material.description}
      headings={material.headings}
    >
      <div className="space-y-4">
        <section className="panel rounded-xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Offline Material
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {material.title}
          </h1>
          {material.description ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {material.description}
            </p>
          ) : null}
        </section>
        <ContentViewer content={material.content} />
      </div>
    </AppShell>
  );
}
