"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useStudyHistory } from "@/hooks/useStudyHistory";

const ImportExportDialog = dynamic(
  () => import("@/components/history/ImportExportDialog").then((mod) => mod.ImportExportDialog),
  { ssr: false },
);

export function ProgressDataControls() {
  const { hydrated, isAuthenticated, syncStatus, resetState } = useStudyHistory();
  const [dialogMode, setDialogMode] = useState<"import" | "export" | null>(null);
  const [isResetPending, setIsResetPending] = useState(false);

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
      <section className="panel mb-4 rounded-xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Data Controls
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Import or export progress
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Text export preserves preferences, recent activity, and per-module state in a
              portable snapshot.
            </p>
          </div>
          {!isAuthenticated ? (
            <Link href="/login" className="button-primary px-4 py-3 text-sm font-semibold">
              Sign In
            </Link>
          ) : null}
        </div>

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
