"use client";

import { ThemeModeIcon } from "@/components/ui/ThemeModeIcon";
import { useStudyHistory } from "@/hooks/useStudyHistory";
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
  const { state, setFont, setTheme } = useStudyHistory();

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
    </section>
  );
}
