"use client";

import { useEffect, useRef, useState } from "react";
import { ContentViewer } from "@/components/content/ContentViewer";
import { useAppConnectivity } from "@/hooks/useAppConnectivity";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { listDownloadedCourses, removeDownloadedCourse } from "@/lib/offline-courses";
import { formatCount } from "@/lib/utils";
import type { MaterialContent, ModuleContent } from "@/types/content";
import type { DownloadedCourseRecord } from "@/types/offline";

interface OfflineSelection {
  subjectId: string;
  kind?: "modules" | "materials";
  slug?: string;
}

type OfflineEntry = MaterialContent | ModuleContent;

function courseHash(subjectId: string, kind?: "modules" | "materials", slug?: string) {
  return `#course=${[subjectId, kind, slug].filter(Boolean).join("/")}`;
}

function readSelectionFromHash(): OfflineSelection | null {
  return readSelectionFromUrl(window.location.href);
}

function readSelectionFromUrl(href: string): OfflineSelection | null {
  const url = new URL(href, window.location.href);
  const value = url.hash.replace(/^#course=/, "");

  if (!value || value === url.hash) {
    return null;
  }

  const [subjectId, kind, slug] = value.split("/");

  if (!subjectId) {
    return null;
  }

  return {
    subjectId,
    kind: kind === "modules" || kind === "materials" ? kind : undefined,
    slug,
  };
}

export function OfflineLibraryClient() {
  const connectivity = useAppConnectivity();
  const { hydrated, getModuleRecord, markVisited, setDone, setNeedsRevision } = useStudyHistory();
  const [courses, setCourses] = useState<DownloadedCourseRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selection, setSelection] = useState<OfflineSelection | null>(null);
  const [pendingRemovalSubjectId, setPendingRemovalSubjectId] = useState<string | null>(null);
  const visitedModuleKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const updateSelection = () => setSelection(readSelectionFromHash());

    updateSelection();
    window.addEventListener("hashchange", updateSelection);
    window.addEventListener("popstate", updateSelection);

    return () => {
      window.removeEventListener("hashchange", updateSelection);
      window.removeEventListener("popstate", updateSelection);
    };
  }, []);

  useEffect(() => {
    const handleCourseHashClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      const href = anchor?.getAttribute("href");

      if (!anchor || !href || !href.includes("#course=")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);

      if (nextUrl.pathname !== window.location.pathname) {
        return;
      }

      event.preventDefault();
      window.history.pushState(null, "", nextUrl);
      setSelection(readSelectionFromUrl(nextUrl.href));
    };

    document.addEventListener("click", handleCourseHashClick, true);

    return () => {
      document.removeEventListener("click", handleCourseHashClick, true);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void listDownloadedCourses()
      .then((records) => {
        if (!cancelled) {
          setCourses(records);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function removeCourse(subjectId: string) {
    await removeDownloadedCourse(subjectId);
    setCourses((current) => current.filter((course) => course.subject.id !== subjectId));
    setPendingRemovalSubjectId(null);

    if (selection?.subjectId === subjectId) {
      window.location.hash = "";
      setSelection(null);
    }
  }

  const selectedRecord = selection
    ? courses.find((course) => course.subject.id === selection.subjectId) ?? null
    : null;
  const selectedSubject = selectedRecord?.subject ?? null;
  const selectedModule =
    selectedSubject && selection?.kind === "modules" && selection.slug
      ? selectedSubject.modules.find((item) => item.slug === selection.slug) ?? null
      : null;

  useEffect(() => {
    if (!hydrated || !selectedSubject || !selectedModule) {
      return;
    }

    const moduleKey = `${selectedSubject.routeSegment}::${selectedModule.slug}`;

    if (visitedModuleKeyRef.current === moduleKey) {
      return;
    }

    visitedModuleKeyRef.current = moduleKey;
    markVisited({
      subjectSlug: selectedSubject.routeSegment,
      moduleSlug: selectedModule.slug,
      subjectTitle: selectedSubject.title,
      moduleTitle: selectedModule.title,
    });
  }, [hydrated, markVisited, selectedModule, selectedSubject]);

  function openSelection(nextSelection: OfflineSelection) {
    window.history.pushState(
      null,
      "",
      `/library/offline${courseHash(nextSelection.subjectId, nextSelection.kind, nextSelection.slug)}`,
    );
    setSelection(nextSelection);
  }

  function closeSelection() {
    window.history.pushState(null, "", "/library/offline");
    setSelection(null);
  }

  if (selectedRecord) {
    const subject = selectedRecord.subject;
    const offlineModules = subject.modules;
    const offlineMaterials = subject.materials;
    const module = selectedModule;
    const material =
      selection?.kind === "materials" && selection.slug
        ? offlineMaterials.find((item) => item.slug === selection.slug) ?? null
        : null;

    if (module) {
      const currentIndex = offlineModules.findIndex((item) => item.slug === module.slug);
      const record = hydrated ? getModuleRecord(subject.routeSegment, module.slug) : undefined;

      return (
        <div className="space-y-4">
          <button type="button" onClick={closeSelection} className="button-secondary inline-flex px-4 py-3 text-sm font-semibold">
            Downloaded Courses
          </button>
          <section className="panel mb-4 overflow-hidden rounded-xl p-6 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                  <button type="button" onClick={() => openSelection({ subjectId: subject.id })} className="transition hover:text-[var(--foreground)]">
                    {subject.title}
                  </button>
                  <span>/</span>
                  <span className="text-[var(--foreground)]">{module.title}</span>
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{module.title}</h1>
                {module.description ? (
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{module.description}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <button
                  type="button"
                  onClick={() =>
                    setDone({
                      subjectSlug: subject.routeSegment,
                      moduleSlug: module.slug,
                      subjectTitle: subject.title,
                      moduleTitle: module.title,
                    })
                  }
                  className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                    record?.done ? "bg-emerald-500 text-white" : "button-secondary text-[var(--foreground)]"
                  }`}
                >
                  {record?.done ? "Marked Done" : "Mark as Done"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNeedsRevision({
                      subjectSlug: subject.routeSegment,
                      moduleSlug: module.slug,
                      subjectTitle: subject.title,
                      moduleTitle: module.title,
                    })
                  }
                  className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                    record?.needsRevision
                      ? "bg-amber-500 text-slate-950"
                      : "button-secondary text-[var(--foreground)]"
                  }`}
                >
                  {record?.needsRevision ? "Needs Revision" : "Flag Revision"}
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
              {currentIndex > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    openSelection({ subjectId: subject.id, kind: "modules", slug: offlineModules[currentIndex - 1].slug })
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel-alt)] p-4 text-left transition hover:border-[var(--accent)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Previous</p>
                  <p className="mt-2 font-semibold">{offlineModules[currentIndex - 1].title}</p>
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}
              {currentIndex < offlineModules.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    openSelection({ subjectId: subject.id, kind: "modules", slug: offlineModules[currentIndex + 1].slug })
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel-alt)] p-4 text-left transition hover:border-[var(--accent)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Next</p>
                  <p className="mt-2 font-semibold">{offlineModules[currentIndex + 1].title}</p>
                </button>
              ) : null}
            </div>
          </section>
          <ContentViewer content={module.content} />
        </div>
      );
    }

    if (material) {
      return (
        <div className="space-y-4">
          <button type="button" onClick={closeSelection} className="button-secondary inline-flex px-4 py-3 text-sm font-semibold">
            Downloaded Courses
          </button>
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
      );
    }

    return (
      <div className="space-y-4">
        <button type="button" onClick={closeSelection} className="button-secondary inline-flex px-4 py-3 text-sm font-semibold">
          Downloaded Courses
        </button>
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

        {offlineMaterials.length ? (
          <OfflineEntryGrid
            label="Materials"
            countLabel={formatCount(offlineMaterials.length, "material")}
            entries={offlineMaterials}
            onOpen={(entry) => openSelection({ subjectId: subject.id, kind: "materials", slug: entry.slug })}
          />
        ) : null}
        <OfflineEntryGrid
          label="Modules"
          countLabel={formatCount(offlineModules.length, "module")}
          entries={offlineModules}
          onOpen={(entry) => openSelection({ subjectId: subject.id, kind: "modules", slug: entry.slug })}
          moduleSubjectSlug={subject.routeSegment}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="panel rounded-xl p-6 sm:p-8">
        <div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {connectivity === "online" ? "Offline Library" : "Downloaded Courses"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Downloaded courses
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              These courses are stored on this device for offline reading.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {courses.map((record) => (
          <article key={record.subject.id} className="panel rounded-xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Downloaded
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{record.subject.title}</h2>
              </div>
              <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                Offline
              </span>
            </div>
            {record.subject.description ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {record.subject.description}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span>{formatCount(record.subject.modules.length, "module")}</span>
              <span>&bull;</span>
              <span>{formatCount(record.subject.materials.length, "material")}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openSelection({ subjectId: record.subject.id })}
                className="button-primary px-4 py-3 text-sm font-semibold"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() =>
                  pendingRemovalSubjectId === record.subject.id
                    ? removeCourse(record.subject.id)
                    : setPendingRemovalSubjectId(record.subject.id)
                }
                className={`px-4 py-3 text-sm font-semibold ${
                  pendingRemovalSubjectId === record.subject.id
                    ? "rounded-full bg-rose-600 text-white hover:bg-rose-700"
                    : "button-secondary"
                }`}
              >
                {pendingRemovalSubjectId === record.subject.id
                  ? "Confirm Remove"
                  : "Remove Download"}
              </button>
              {pendingRemovalSubjectId === record.subject.id ? (
                <button
                  type="button"
                  onClick={() => setPendingRemovalSubjectId(null)}
                  className="button-secondary px-4 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {pendingRemovalSubjectId === record.subject.id ? (
              <p className="mt-3 text-sm text-rose-600">
                This deletes the downloaded course files from this device. Synced progress is kept.
              </p>
            ) : null}
          </article>
        ))}
      </section>

      {loaded && !courses.length ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)]">
          No downloaded courses are stored on this device.
        </div>
      ) : null}
    </div>
  );
}

function OfflineEntryGrid({
  label,
  countLabel,
  entries,
  onOpen,
  moduleSubjectSlug,
}: {
  label: string;
  countLabel: string;
  entries: OfflineEntry[];
  onOpen: (entry: OfflineEntry) => void;
  moduleSubjectSlug?: string;
}) {
  const { hydrated, getModuleRecord } = useStudyHistory();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          {label}
        </p>
        <span className="text-xs text-[var(--muted)]">{countLabel}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((entry) => {
          const record =
            entry.kind === "module" && moduleSubjectSlug && hydrated
              ? getModuleRecord(moduleSubjectSlug, entry.slug)
              : undefined;

          return (
            <button
              key={entry.slug}
              type="button"
              onClick={() => onOpen(entry)}
              className="panel rounded-xl p-6 text-left transition hover:-translate-y-1 hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  {entry.kind === "module" ? "Module" : "Material"}
                </p>
                {record?.done || record?.needsRevision ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {record.done ? (
                      <span className="status-pill bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                        Done
                      </span>
                    ) : null}
                    {record.needsRevision ? (
                      <span className="status-pill bg-amber-500/18 text-amber-700 dark:text-amber-200">
                        Revise
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <h2 className="mt-3 text-2xl font-semibold">{entry.title}</h2>
              {entry.description ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{entry.description}</p>
              ) : null}
              <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>{formatCount(entry.headings.length, "section")}</span>
                <span>{entry.kind === "module" ? "Open module" : "Open material"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
