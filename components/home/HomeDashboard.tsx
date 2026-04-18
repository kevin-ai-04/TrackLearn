"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { formatCount, normalizeRouteSegment } from "@/lib/utils";
import type { SubjectSummary } from "@/types/content";

const HistoryPanel = dynamic(
  () => import("@/components/history/HistoryPanel").then((mod) => mod.HistoryPanel),
  {
    loading: () => (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        Loading recent activity...
      </div>
    ),
  },
);

interface HomeDashboardProps {
  subjects: SubjectSummary[];
}

export function HomeDashboard({ subjects }: HomeDashboardProps) {
  const { hydrated, isAuthenticated, state } = useStudyHistory();
  const latestVisit = hydrated ? state.recentActivity[0] : null;
  const latestModule = latestVisit
    ? subjects
        .find((subject) => subject.slug === latestVisit.subjectSlug)
        ?.modules.find((module) => module.slug === normalizeRouteSegment(latestVisit.moduleSlug))
    : null;

  return (
    <div className="space-y-4">
      <section className="panel overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              TrackLearn
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              TrackLearn
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              Browse the shared study catalog, keep your progress synced when signed in, and build
              private subjects or notes in your library.
            </p>

            {latestVisit && latestModule ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={latestModule.href}
                  className="button-primary px-4 py-3 text-sm font-semibold"
                >
                  Continue {latestModule.title}
                </Link>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel-alt)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Continue Reading
            </p>
            {latestVisit && latestModule ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold">{latestModule.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{latestModule.subjectTitle}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Pick up from the last module you visited, with status and recent history already
                  restored from {isAuthenticated ? "your synced account state." : "local browser storage."}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                No recent module yet. Open a subject below and the app will start tracking your
                progress {isAuthenticated ? "on your account." : "locally on this device."}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 lg:grid-cols-2">
          {subjects.map((subject, index) => {
            const completedCount = subject.modules.filter(
              (module) => state.modules[`${subject.slug}::${module.slug}`]?.done,
            ).length;
            const totalModules = subject.modules.length;
            const completionPercentage = totalModules
              ? Math.round((completedCount / totalModules) * 100)
              : 0;

            return (
              <motion.article
                key={subject.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.22 }}
                className="panel rounded-[2rem] p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Subject
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{subject.title}</h2>
                {subject.description ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{subject.description}</p>
                ) : null}
                <div className="mt-5 flex items-center gap-3 text-sm text-[var(--muted)]">
                  <span>{formatCount(subject.materials.length, "material")}</span>
                  <span>&bull;</span>
                  <span>{formatCount(totalModules, "module")}</span>
                  <span>&bull;</span>
                  <span>{completionPercentage}% complete</span>
                </div>

                <div className="mt-5">
                  <div className="h-3 overflow-hidden rounded-full bg-[var(--panel-alt)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {completedCount} of {formatCount(totalModules, "module")} done
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/${subject.slug}`} className="button-secondary px-4 py-3 text-sm font-semibold">
                    Explore Subject
                  </Link>
                  {subject.modules[0] ? (
                    <Link
                      href={subject.modules[0].href}
                      className="button-primary px-4 py-3 text-sm font-semibold"
                    >
                      Open First Module
                    </Link>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>

        <section className="panel rounded-[2rem] p-6">
          <HistoryPanel subjects={subjects} limit={8} />
        </section>
      </section>
    </div>
  );
}
