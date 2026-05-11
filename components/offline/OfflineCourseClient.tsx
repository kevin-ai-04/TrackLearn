"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ContentViewer } from "@/components/content/ContentViewer";
import { ModuleHeader } from "@/components/content/ModuleHeader";
import { AppShell } from "@/components/layout/AppShell";
import { SubjectOverviewSections } from "@/components/subject/SubjectOverviewSections";
import { getDownloadedCourse } from "@/lib/offline-courses";
import { formatCount } from "@/lib/utils";
import type {
  MaterialContent,
  MaterialSummary,
  ModuleContent,
  ModuleSummary,
  SubjectContent,
  SubjectSummary,
} from "@/types/content";
import type { DownloadedCourseRecord } from "@/types/offline";

interface OfflineCourseClientProps {
  subjectId: string;
  segments: string[];
}

function moduleHref(subjectId: string, moduleSlug: string) {
  return `/library/offline/${subjectId}/modules/${moduleSlug}`;
}

function materialHref(subjectId: string, materialSlug: string) {
  return `/library/offline/${subjectId}/materials/${materialSlug}`;
}

function toModuleSummary(subjectId: string, module: ModuleContent): ModuleSummary {
  return {
    ...module,
    href: moduleHref(subjectId, module.slug),
  };
}

function toMaterialSummary(subjectId: string, material: MaterialContent): MaterialSummary {
  return {
    ...material,
    href: materialHref(subjectId, material.slug),
  };
}

function toOfflineSubject(subject: SubjectContent): SubjectSummary {
  return {
    ...subject,
    href: `/library/offline/${subject.id}`,
    modules: subject.modules.map((module) => toModuleSummary(subject.id, module)),
    materials: subject.materials.map((material) => toMaterialSummary(subject.id, material)),
  };
}

function toOfflineModule(subjectId: string, module: ModuleContent): ModuleContent {
  return {
    ...module,
    href: moduleHref(subjectId, module.slug),
  };
}

function toOfflineMaterial(subjectId: string, material: MaterialContent): MaterialContent {
  return {
    ...material,
    href: materialHref(subjectId, material.slug),
  };
}

export function OfflineCourseClient({ subjectId, segments }: OfflineCourseClientProps) {
  const [record, setRecord] = useState<DownloadedCourseRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getDownloadedCourse(subjectId)
      .then((downloaded) => {
        if (!cancelled) {
          setRecord(downloaded ?? null);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecord(null);
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  const offlineSubject = useMemo(
    () => (record ? toOfflineSubject(record.subject) : null),
    [record],
  );

  if (!loaded) {
    return (
      <AppShell subjects={[]} currentPathLabel="Downloaded Course" loading>
        <div className="panel rounded-xl p-6 text-sm text-[var(--muted)]">
          Loading downloaded course...
        </div>
      </AppShell>
    );
  }

  if (!record || !offlineSubject) {
    return (
      <AppShell subjects={[]} currentPathLabel="Downloaded Course">
        <div className="panel rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Course is not downloaded</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Download this course from your library before opening it offline.
          </p>
          <Link href="/library/offline" className="button-primary mt-5 inline-flex px-4 py-3 text-sm font-semibold">
            Downloaded Courses
          </Link>
        </div>
      </AppShell>
    );
  }

  const subject = record.subject;
  const kind = segments[0];
  const slug = segments[1];
  const offlineModules = subject.modules.map((module) => toOfflineModule(subject.id, module));
  const offlineMaterials = subject.materials.map((material) => toOfflineMaterial(subject.id, material));
  const module = kind === "modules" && slug
    ? offlineModules.find((item) => item.slug === slug) ?? null
    : null;
  const material = kind === "materials" && slug
    ? offlineMaterials.find((item) => item.slug === slug) ?? null
    : null;

  if (module) {
    const currentIndex = offlineModules.findIndex((item) => item.slug === module.slug);

    return (
      <AppShell
        subjects={[offlineSubject]}
        currentSubjectSlug={subject.routeSegment}
        currentModuleSlug={module.slug}
        currentPathLabel={`${subject.title} - ${module.title}`}
        currentPathHint={module.description}
        headings={module.headings}
      >
        <div className="space-y-4">
          <ModuleHeader
            subjectSlug={subject.routeSegment}
            moduleSlug={module.slug}
            subjectTitle={subject.title}
            moduleTitle={module.title}
            description={module.description}
            previousModule={currentIndex > 0 ? offlineModules[currentIndex - 1] : null}
            nextModule={currentIndex < offlineModules.length - 1 ? offlineModules[currentIndex + 1] : null}
            subjectHref={`/library/offline/${subject.id}`}
          />
          <ContentViewer content={module.content} />
        </div>
      </AppShell>
    );
  }

  if (material) {
    return (
      <AppShell
        subjects={[offlineSubject]}
        currentSubjectSlug={subject.routeSegment}
        currentMaterialSlug={material.slug}
        currentPathLabel={`${subject.title} - ${material.title}`}
        currentPathHint={material.description}
        headings={material.headings}
      >
        <div className="space-y-4">
          <section className="panel rounded-xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Material
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

  return (
    <AppShell
      subjects={[offlineSubject]}
      currentSubjectSlug={subject.routeSegment}
      currentPathLabel={`${subject.title} - Downloaded Course`}
      currentPathHint={subject.description}
    >
      <div className="space-y-4">
        <section className="panel rounded-xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Downloaded Course
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{subject.title}</h1>
          {subject.description ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {subject.description}
            </p>
          ) : null}
          <p className="mt-5 text-sm text-[var(--muted)]">
            This downloaded copy contains {formatCount(subject.materials.length, "material")} and{" "}
            {formatCount(subject.modules.length, "module")}.
          </p>
        </section>

        <SubjectOverviewSections
          subjectSlug={subject.routeSegment}
          materials={offlineSubject.materials}
          modules={offlineSubject.modules}
        />
      </div>
    </AppShell>
  );
}
