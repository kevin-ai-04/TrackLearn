"use client";

import { useState } from "react";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";

export function OfflineSupportSettings() {
  const {
    enabled,
    hydrated,
    courses,
    setEnabled,
    clearDownloads,
  } = useOfflineSupport();
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);
    try {
      await setEnabled(!enabled);
    } finally {
      setBusy(false);
    }
  }

  async function handleClearDownloads() {
    if (!window.confirm("Remove all downloaded courses from this device?")) {
      return;
    }

    setBusy(true);
    try {
      await clearDownloads();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel mb-4 rounded-xl p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        Offline
      </p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Offline support
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Store selected public courses and personal courses on this device for read-only study
            when the network is unavailable. Progress made offline syncs after reconnecting.
          </p>
        </div>
        <button
          type="button"
          disabled={!hydrated || busy}
          onClick={handleToggle}
          aria-pressed={enabled}
          className={`shrink-0 px-4 py-3 text-sm font-semibold ${
            enabled ? "button-primary" : "button-secondary"
          }`}
        >
          {enabled ? "Enabled" : "Enable Offline"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[var(--panel-alt)] p-4">
          <p className="text-sm text-[var(--muted)]">Downloaded courses</p>
          <p className="mt-2 text-3xl font-semibold">{hydrated ? courses.length : 0}</p>
        </div>
        <div className="rounded-lg bg-[var(--panel-alt)] p-4">
          <p className="text-sm text-[var(--muted)]">Storage location</p>
          <p className="mt-2 text-base font-semibold">This browser on this device</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!hydrated || busy || !courses.length}
          onClick={handleClearDownloads}
          className="button-secondary px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear Downloads
        </button>
      </div>
    </section>
  );
}
