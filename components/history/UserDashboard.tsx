"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeModeIcon } from "@/components/ui/ThemeModeIcon";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { formatCount, formatDateTime } from "@/lib/utils";
import type { SubjectSummary } from "@/types/content";
import type { ReadingFont, ThemeMode } from "@/types/history";

const HistoryPanel = dynamic(
  () => import("@/components/history/HistoryPanel").then((mod) => mod.HistoryPanel),
  {
    loading: () => (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        Loading recent study activity...
      </div>
    ),
  },
);

const ImportExportDialog = dynamic(
  () => import("@/components/history/ImportExportDialog").then((mod) => mod.ImportExportDialog),
  { ssr: false },
);

interface UserDashboardProps {
  subjects: SubjectSummary[];
}

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Reading", value: "reading" },
];

const fontOptions: Array<{ label: string; value: ReadingFont; description: string }> = [
  { label: "Outfit", value: "outfit", description: "Default modern interface font." },
  { label: "Source Serif 4", value: "serif", description: "Long-form reading font." },
];

export function UserDashboard({ subjects }: UserDashboardProps) {
  const { hydrated, isAuthenticated, state, syncStatus, setFont, setTheme, resetState } = useStudyHistory();
  const [dialogMode, setDialogMode] = useState<"import" | "export" | null>(null);
  const [isResetPending, setIsResetPending] = useState(false);

  const subjectMetrics = subjects.map((subject) => {
    const records = subject.modules.map((module) => state.modules[`${subject.slug}::${module.slug}`]);
    const lastVisitedAt =
      records
        .map((record) => record?.lastVisitedAt)
        .filter((value): value is string => Boolean(value))
        .sort((left, right) => right.localeCompare(left))[0] ?? null;

    return {
      subjectSlug: subject.slug,
      subjectTitle: subject.title,
      totalModules: subject.modules.length,
      completedModules: records.filter((record) => record?.done).length,
      needsRevisionModules: records.filter((record) => record?.needsRevision).length,
      visitedModules: records.filter((record) => record?.visited).length,
      lastVisitedAt,
    };
  });

  const summary = {
    totalTracked: Object.keys(state.modules).length,
    completed: Object.values(state.modules).filter((record) => record.done).length,
    needsRevision: Object.values(state.modules).filter((record) => record.needsRevision).length,
  };

  const handleResetClick = () => {
    if (!isResetPending) {
      setIsResetPending(true);
      return;
    }

    resetState();
    setIsResetPending(false);
  };

  return (
    <>
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Reading preferences, study progress, and optional account sync.
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
            You can use TrackLearn without logging in. Guest progress stays in the browser, while
            signing in adds account sync, private notes, custom content, and moderation workflows.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Tracked modules</p>
              <p className="mt-2 text-3xl font-semibold">{summary.totalTracked}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Done</p>
              <p className="mt-2 text-3xl font-semibold">{summary.completed}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Need revision</p>
              <p className="mt-2 text-3xl font-semibold">{summary.needsRevision}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {isAuthenticated ? "Account sync is enabled." : "Login to sync data across all devices."}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {isAuthenticated
                    ? "Your progress and preferences can sync to your account, and personal subject tools are available."
                    : "Keep using local settings, or sign in when you want synced progress and personal content tools."}
                </p>
              </div>
              {!isAuthenticated ? (
                <Link href="/login" className="button-primary px-4 py-3 text-sm font-semibold">
                  Go To Login
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Preferences
            </p>
            <h2 className="mt-2 text-xl font-semibold">Reading setup</h2>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-semibold">Theme mode</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        state.preferences.theme === option.value
                          ? "bg-[var(--accent)] text-white"
                          : "button-secondary text-[var(--foreground)]"
                      }`}
                    >
                      <ThemeModeIcon mode={option.value} className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">Reading font</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {fontOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFont(option.value)}
                      className={`rounded-[1.4rem] border p-4 text-left transition ${
                        state.preferences.font === option.value
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[var(--panel-alt)] hover:border-[var(--accent)]"
                      }`}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Data Controls
            </p>
            <h2 className="mt-2 text-xl font-semibold">Import or export progress</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Text export preserves preferences, recent activity, and per-module state in a single
              portable snapshot.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsResetPending(false);
                  setDialogMode("export");
                }}
                className="button-primary px-4 py-3 text-sm font-semibold"
              >
                Export Progress
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResetPending(false);
                  setDialogMode("import");
                }}
                className="button-secondary px-4 py-3 text-sm font-semibold"
              >
                Import Progress
              </button>
              <button
                type="button"
                onClick={handleResetClick}
                className={`px-4 py-3 text-sm font-semibold transition ${
                  isResetPending ? "rounded-full bg-rose-600 text-white hover:bg-rose-700" : "button-secondary"
                }`}
              >
                {isResetPending ? "Confirm Reset Local State" : "Reset Local State"}
              </button>
              {isResetPending ? (
                <button
                  type="button"
                  onClick={() => setIsResetPending(false)}
                  className="button-secondary px-4 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            {isResetPending ? (
              <p className="mt-4 text-sm text-rose-600">
                Resetting will clear all saved progress and preferences from this browser.
              </p>
            ) : null}

            <p className="mt-5 text-sm text-[var(--muted)]">
              Storage status:{" "}
              {!hydrated
                ? "Hydrating study state..."
                : isAuthenticated
                  ? syncStatus === "error"
                    ? "Signed in, but sync failed."
                    : syncStatus === "syncing"
                      ? "Syncing account state..."
                      : "Connected to account sync."
                  : "Using browser-local state."}
            </p>
          </section>
        </div>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            {subjectMetrics.map((subject, index) => (
              <motion.article
                key={subject.subjectSlug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
                className="panel rounded-[2rem] p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                      Subject Progress
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{subject.subjectTitle}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Last activity: {formatDateTime(subject.lastVisitedAt)}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-[1.2rem] bg-[var(--panel-alt)] px-3 py-3">
                      <p className="text-[var(--muted)]">Visited</p>
                      <p className="mt-1 text-xl font-semibold">{subject.visitedModules}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[var(--panel-alt)] px-3 py-3">
                      <p className="text-[var(--muted)]">Done</p>
                      <p className="mt-1 text-xl font-semibold">{subject.completedModules}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[var(--panel-alt)] px-3 py-3">
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
              </motion.article>
            ))}
          </div>

          <section className="panel rounded-[2rem] p-6">
            <HistoryPanel subjects={subjects} limit={10} title="Recent Study Activity" />
          </section>
        </section>
      </div>

      <ImportExportDialog
        open={dialogMode === "export"}
        mode="export"
        onClose={() => setDialogMode(null)}
      />
      <ImportExportDialog
        open={dialogMode === "import"}
        mode="import"
        onClose={() => setDialogMode(null)}
      />
    </>
  );
}
