"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addCourseToLibraryAction,
  removeCourseFromLibraryAction,
} from "@/app/(site)/library/actions";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { formatCount } from "@/lib/utils";
import type { SubjectSummary } from "@/types/content";

type CatalogMode = "explore" | "library";
type FilterValue = "all" | "modules" | "materials" | "selected" | "available";

interface CourseCatalogProps {
  courses: SubjectSummary[];
  selectedCourseIds?: string[];
  mode: CatalogMode;
}

const filters: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "All" },
  { value: "modules", label: "Modules" },
  { value: "materials", label: "Materials" },
  { value: "selected", label: "In Library" },
  { value: "available", label: "Not Added" },
];

export function CourseCatalog({
  courses,
  selectedCourseIds = [],
  mode,
}: CourseCatalogProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [enablePromptCourseId, setEnablePromptCourseId] = useState<string | null>(null);
  const {
    enabled,
    hydrated,
    isOnline,
    setEnabled,
    downloadCourse,
    removeDownload,
    getDownloadStatus,
    getDownloadedCourse,
  } = useOfflineSupport();
  const selectedCourseIdSet = useMemo(() => new Set(selectedCourseIds), [selectedCourseIds]);

  const visibleCourses = courses.filter((course) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      course.title.toLowerCase().includes(normalizedQuery) ||
      (course.description ?? "").toLowerCase().includes(normalizedQuery);
    const isSelected = selectedCourseIdSet.has(course.id);

    if (!matchesQuery) {
      return false;
    }

    if (filter === "modules") {
      return course.modules.length > 0;
    }

    if (filter === "materials") {
      return course.materials.length > 0;
    }

    if (filter === "selected") {
      return isSelected;
    }

    if (filter === "available") {
      return !isSelected;
    }

    return true;
  });

  async function handleDownload(courseId: string) {
    if (!enabled) {
      setEnablePromptCourseId(courseId);
      return;
    }

    await downloadCourse(courseId, "public");
  }

  async function handleEnableAndDownload() {
    if (!enablePromptCourseId) {
      return;
    }

    const courseId = enablePromptCourseId;
    setEnablePromptCourseId(null);
    await setEnabled(true);
    await downloadCourse(courseId, "public");
  }

  return (
    <section className="space-y-5">
      {enablePromptCourseId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Offline Support
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Enable offline downloads?</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Offline support stores downloaded courses in this browser so they can be opened
              without a network connection.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleEnableAndDownload}
                className="button-primary px-4 py-3 text-sm font-semibold"
              >
                Enable and Download
              </button>
              <button
                type="button"
                onClick={() => setEnablePromptCourseId(null)}
                className="button-secondary px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="panel rounded-lg p-4">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
          <label className="sr-only" htmlFor={`${mode}-course-search`}>
            Search courses
          </label>
          <input
            id={`${mode}-course-search`}
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses"
            type="search"
          />
          <label className="sr-only" htmlFor={`${mode}-course-filter`}>
            Filter courses
          </label>
          <select
            id={`${mode}-course-filter`}
            className="field"
            value={filter}
            onChange={(event) => setFilter(event.target.value as FilterValue)}
          >
            {filters
              .filter((option) => mode === "explore" || option.value !== "available")
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleCourses.map((course) => {
          const isSelected = selectedCourseIdSet.has(course.id);
          const downloadedCourse = getDownloadedCourse(course.id);
          const updateAvailable =
            Boolean(downloadedCourse && course.updatedAt) &&
            new Date(course.updatedAt!).getTime() > new Date(downloadedCourse!.contentUpdatedAt).getTime();

          return (
            <article key={course.id} className="panel rounded-lg p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">{course.title}</h2>
                </div>
                {isSelected ? (
                  <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    In Library
                  </span>
                ) : null}
              </div>
              {course.description ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{course.description}</p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span>{formatCount(course.modules.length, "module")}</span>
                <span>&bull;</span>
                <span>{formatCount(course.materials.length, "material")}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {mode === "library" ? (
                  <Link href={course.href} prefetch={false} className="button-primary px-4 py-3 text-sm font-semibold">
                    View Course
                  </Link>
                ) : null}

                {mode === "library" ? (
                  getDownloadStatus(course.id) === "downloaded" ? (
                    <>
                      {updateAvailable ? (
                        <button
                          type="button"
                          disabled={!isOnline || getDownloadStatus(course.id) === "downloading"}
                          onClick={() => downloadCourse(course.id, "public")}
                          className="button-secondary px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Update Download
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeDownload(course.id)}
                        className="button-secondary px-4 py-3 text-sm font-semibold"
                      >
                        Remove Download
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={!hydrated || !isOnline || getDownloadStatus(course.id) === "downloading"}
                      onClick={() => handleDownload(course.id)}
                      className="button-secondary px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {getDownloadStatus(course.id) === "downloading"
                        ? "Downloading"
                        : getDownloadStatus(course.id) === "error"
                          ? "Retry Download"
                          : "Download"}
                    </button>
                  )
                ) : null}

                {mode === "explore" ? (
                  <form action={addCourseToLibraryAction}>
                    <input type="hidden" name="subjectId" value={course.id} />
                    <button
                      type="submit"
                      className={`px-4 py-3 text-sm font-semibold ${
                        isSelected ? "button-secondary" : "button-primary"
                      }`}
                    >
                      {isSelected ? "Added" : "Add To Library"}
                    </button>
                  </form>
                ) : (
                  <form
                    action={removeCourseFromLibraryAction}
                    onSubmit={() => {
                      if (
                        getDownloadStatus(course.id) === "downloaded" &&
                        window.confirm("Remove the downloaded copy from this device too?")
                      ) {
                        void removeDownload(course.id);
                      }
                    }}
                  >
                    <input type="hidden" name="subjectId" value={course.id} />
                    <button type="submit" className="button-secondary px-4 py-3 text-sm font-semibold">
                      Remove
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!visibleCourses.length ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)]">
          No courses match the current search and filter.
        </div>
      ) : null}
    </section>
  );
}
