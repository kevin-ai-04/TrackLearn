"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { formatCount, formatDateTime } from "@/lib/utils";
import type { SubjectSummary } from "@/types/content";

const HistoryPanel = dynamic(
  () => import("@/components/history/HistoryPanel").then((mod) => mod.HistoryPanel),
  {
    loading: () => (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        Loading recent study activity...
      </div>
    ),
  },
);

interface UserDashboardProps {
  subjects: SubjectSummary[];
}

export function UserDashboard({ subjects }: UserDashboardProps) {
  const { state } = useStudyHistory();

  const subjectMetrics = subjects.map((subject) => {
    const records = subject.modules.map((module) => state.modules[`${subject.routeSegment}::${module.slug}`]);
    const lastVisitedAt =
      records
        .map((record) => record?.lastVisitedAt)
        .filter((value): value is string => Boolean(value))
        .sort((left, right) => right.localeCompare(left))[0] ?? null;

    return {
      subjectSlug: subject.slug,
      subjectRouteSegment: subject.routeSegment,
      subjectHref: subject.href,
      subjectTitle: subject.title,
      totalModules: subject.modules.length,
      completedModules: records.filter((record) => record?.done).length,
      needsRevisionModules: records.filter((record) => record?.needsRevision).length,
      visitedModules: records.filter((record) => record?.visited).length,
      lastVisitedAt,
    };
  });

  const selectedCourseRecords = subjects.flatMap((subject) =>
    subject.modules.flatMap((module) => {
      const record = state.modules[`${subject.routeSegment}::${module.slug}`];
      return record ? [record] : [];
    }),
  );

  const summary = {
    totalTracked: selectedCourseRecords.length,
    completed: selectedCourseRecords.filter((record) => record.done).length,
    needsRevision: selectedCourseRecords.filter((record) => record.needsRevision).length,
  };

  return (
    <div className="space-y-4">
      <section className="panel rounded-xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Study Progress
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Keep track of what is done and what needs another pass.
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-[var(--panel-alt)] p-4">
            <p className="text-sm text-[var(--muted)]">Tracked modules</p>
            <p className="mt-2 text-3xl font-semibold">{summary.totalTracked}</p>
          </div>
          <div className="rounded-lg bg-[var(--panel-alt)] p-4">
            <p className="text-sm text-[var(--muted)]">Done</p>
            <p className="mt-2 text-3xl font-semibold">{summary.completed}</p>
          </div>
          <div className="rounded-lg bg-[var(--panel-alt)] p-4">
            <p className="text-sm text-[var(--muted)]">Need revision</p>
            <p className="mt-2 text-3xl font-semibold">{summary.needsRevision}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {subjectMetrics.length ? (
            subjectMetrics.map((subject, index) => (
              <motion.div
                key={subject.subjectRouteSegment}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
              >
                <Link
                  href={subject.subjectHref}
                  className="panel block rounded-xl p-6 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{subject.subjectTitle}</h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Last activity: {formatDateTime(subject.lastVisitedAt)}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="rounded-md bg-[var(--panel-alt)] px-3 py-3">
                        <p className="text-[var(--muted)]">Visited</p>
                        <p className="mt-1 text-xl font-semibold">{subject.visitedModules}</p>
                      </div>
                      <div className="rounded-md bg-[var(--panel-alt)] px-3 py-3">
                        <p className="text-[var(--muted)]">Done</p>
                        <p className="mt-1 text-xl font-semibold">{subject.completedModules}</p>
                      </div>
                      <div className="rounded-md bg-[var(--panel-alt)] px-3 py-3">
                        <p className="text-[var(--muted)]">Revision Flags</p>
                        <p className="mt-1 text-xl font-semibold">{subject.needsRevisionModules}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--panel-alt)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all"
                      style={{
                        width: `${subject.totalModules ? (subject.completedModules / subject.totalModules) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {subject.completedModules} of {formatCount(subject.totalModules, "module")} completed
                  </p>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)]">
              Add courses to your library and their progress will appear here.
            </div>
          )}
        </div>

        <section className="panel rounded-xl p-6">
          <HistoryPanel subjects={subjects} limit={10} title="Recent Study Activity" />
        </section>
      </section>
    </div>
  );
}
