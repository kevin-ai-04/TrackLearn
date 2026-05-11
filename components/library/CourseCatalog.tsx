"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addCourseToLibraryAction,
  removeCourseFromLibraryAction,
} from "@/app/(site)/library/actions";
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

  return (
    <section className="space-y-5">
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
                  <Link href={course.href} className="button-primary px-4 py-3 text-sm font-semibold">
                    View Course
                  </Link>
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
                  <form action={removeCourseFromLibraryAction}>
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
