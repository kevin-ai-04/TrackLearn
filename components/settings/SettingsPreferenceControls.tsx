"use client";

import { useState } from "react";
import { ThemeModeIcon } from "@/components/ui/ThemeModeIcon";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { warmOfflineAppCache } from "@/lib/offline-app-cache";
import { clearDownloadedCourses } from "@/lib/offline-courses";
import type { ReadingFont, ThemeMode } from "@/types/history";

const themeOptions: Array<{ label: string; value: ThemeMode; description: string }> = [
  { label: "Light", value: "light", description: "Bright interface for regular study sessions." },
  { label: "Dark", value: "dark", description: "Low-light interface with reduced glare." },
  { label: "Reading", value: "reading", description: "Warm page colors for longer reading." },
];

const fontOptions: Array<{ label: string; value: ReadingFont; description: string }> = [
  { label: "Outfit", value: "outfit", description: "Clean sans font for dashboard and notes." },
  { label: "Source Serif 4", value: "serif", description: "Serif font for long-form study material." },
];

export function SettingsPreferenceControls() {
  const { state, setFont, setOfflineSupport, setTheme } = useStudyHistory();
  const [offlineConfirmation, setOfflineConfirmation] = useState<"enable" | "disable" | null>(null);
  const [offlinePending, setOfflinePending] = useState(false);

  async function confirmOfflinePreference() {
    if (!offlineConfirmation) {
      return;
    }

    setOfflinePending(true);

    try {
      if (offlineConfirmation === "disable") {
        await clearDownloadedCourses();
        setOfflineSupport(false);
      } else {
        setOfflineSupport(true);
        try {
          await warmOfflineAppCache();
        } catch {
          // Offline Support can still be enabled; the app shell is cached again during downloads.
        }
      }

      setOfflineConfirmation(null);
    } finally {
      setOfflinePending(false);
    }
  }

  return (
    <section className="panel mb-4 rounded-xl p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        Display
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Reading appearance
      </h2>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <p className="text-sm font-semibold">Display mode</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {themeOptions.map((option) => {
              const selected = state.preferences.theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={selected}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--panel-alt)] hover:border-[var(--accent)]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                        selected
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--panel)] text-[var(--muted)]"
                      }`}
                    >
                      <ThemeModeIcon mode={option.value} />
                    </span>
                    <span className="font-semibold">{option.label}</span>
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Reading font</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {fontOptions.map((option) => {
              const selected = state.preferences.font === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFont(option.value)}
                  aria-pressed={selected}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--panel-alt)] hover:border-[var(--accent)]"
                  }`}
                >
                  <span
                    className="block text-2xl font-semibold"
                    style={{
                      fontFamily:
                        option.value === "serif" ? "var(--font-serif)" : "var(--font-sans)",
                    }}
                  >
                    {option.label}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--panel-alt)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Offline support</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Allow courses in your library to be downloaded for offline reading.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.preferences.offlineSupport}
            onClick={() =>
              setOfflineConfirmation(state.preferences.offlineSupport ? "disable" : "enable")
            }
            className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
              state.preferences.offlineSupport
                ? "border-[var(--accent)] bg-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--panel)]"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                state.preferences.offlineSupport ? "left-7" : "left-1"
              }`}
            />
            <span className="sr-only">
              {state.preferences.offlineSupport ? "Disable offline support" : "Enable offline support"}
            </span>
          </button>
        </div>

        {offlineConfirmation ? (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
            <p className="text-sm font-semibold">
              {offlineConfirmation === "enable"
                ? "Enable offline support?"
                : "Disable offline support?"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {offlineConfirmation === "enable"
                ? "Downloaded courses will be saved in this browser's local device storage so they can be opened when the network is unavailable."
                : "Disabling offline support will delete downloaded course files from this browser. Your synced study progress is kept, but course content will need to be downloaded again."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmOfflinePreference}
                disabled={offlinePending}
                className="button-primary px-3 py-2 text-sm font-semibold"
              >
                {offlinePending
                  ? "Working..."
                  : offlineConfirmation === "enable"
                    ? "Enable"
                    : "Disable And Delete Downloads"}
              </button>
              <button
                type="button"
                onClick={() => setOfflineConfirmation(null)}
                disabled={offlinePending}
                className="button-secondary px-3 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
