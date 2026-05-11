"use client";

import Link from "next/link";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { formatCount } from "@/lib/utils";

export function DownloadedCoursesView() {
  const { courses, hydrated } = useOfflineSupport();

  return (
    <div className="space-y-4">
      <section className="panel rounded-xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Offline
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Downloaded Courses
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
          These courses are stored on this device and can be opened without a network connection.
          Personal courses open in read-only mode offline.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {courses.map((course) => (
          <article key={course.id} className="panel rounded-lg p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-semibold">{course.title}</h2>
              <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                {course.source === "personal" ? "Personal" : "Public"}
              </span>
            </div>
            {course.description ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{course.description}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span>{formatCount(course.modules.length, "module")}</span>
              <span>&bull;</span>
              <span>{formatCount(course.materials.length, "material")}</span>
            </div>
            <Link
              href={`/offline/courses/${course.id}`}
              className="button-primary mt-5 inline-flex px-4 py-3 text-sm font-semibold"
            >
              Open Download
            </Link>
          </article>
        ))}
      </section>

      {hydrated && !courses.length ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)]">
          No courses are downloaded on this device yet. Reconnect and download courses from Library.
        </div>
      ) : null}
    </div>
  );
}
