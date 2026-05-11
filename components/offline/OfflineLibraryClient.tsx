"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listDownloadedCourses, removeDownloadedCourse } from "@/lib/offline-courses";
import { formatCount } from "@/lib/utils";
import type { DownloadedCourseRecord } from "@/types/offline";

export function OfflineLibraryClient() {
  const [courses, setCourses] = useState<DownloadedCourseRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);

    const updateOnlineStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
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
  }

  return (
    <div className="space-y-4">
      <section className="panel rounded-xl p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {online ? "Offline Library" : "Downloaded Courses"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Downloaded courses
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              These courses are stored on this device for offline reading.
            </p>
          </div>
          {online ? (
            <Link href="/library" className="button-secondary shrink-0 px-4 py-3 text-sm font-semibold">
              Back To Library
            </Link>
          ) : null}
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
              <Link
                href={`/library/offline/${record.subject.id}`}
                className="button-primary px-4 py-3 text-sm font-semibold"
              >
                Open
              </Link>
              <button
                type="button"
                onClick={() => removeCourse(record.subject.id)}
                className="button-secondary px-4 py-3 text-sm font-semibold"
              >
                Remove Download
              </button>
            </div>
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
