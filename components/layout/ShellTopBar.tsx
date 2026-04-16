"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/types/history";

interface ShellTopBarProps {
  onOpenSidebar?: () => void;
  onCloseSidebar?: () => void;
  sidebarOpen?: boolean;
}

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Reading", value: "reading" },
];

export function ShellTopBar({
  onOpenSidebar,
  onCloseSidebar,
  sidebarOpen = false,
}: ShellTopBarProps) {
  const { state, setTheme } = useStudyHistory();
  const [hidden, setHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (sidebarOpen || currentScrollY < 24) {
        setHidden(false);
      } else if (scrollDelta > 6 && currentScrollY > 96) {
        setHidden(true);
      } else if (scrollDelta < -6) {
        setHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sidebarOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md transition-transform duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={sidebarOpen ? onCloseSidebar : onOpenSidebar}
            className="button-secondary inline-flex h-11 w-11 items-center justify-center text-lg"
            aria-label={sidebarOpen ? "Close navigation panel" : "Open navigation panel"}
            aria-expanded={sidebarOpen}
            aria-controls="navigation-panel"
          >
            <span aria-hidden="true" className="relative block h-4 w-4">
              {sidebarOpen ? (
                <>
                  <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                  <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                </>
              ) : (
                <>
                  <span className="absolute left-0 top-0.5 h-0.5 w-4 rounded-full bg-current" />
                  <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 rounded-full bg-current" />
                  <span className="absolute left-0 bottom-0.5 h-0.5 w-4 rounded-full bg-current" />
                </>
              )}
            </span>
          </button>
          <Link href="/" className="text-lg font-semibold tracking-tight">
            TrackLearn
          </Link>
          <nav className="hidden items-center gap-2 text-sm text-[var(--muted)] sm:flex">
            <Link className="rounded-full px-3 py-2 transition hover:bg-[var(--accent-soft)]" href="/">
              Home
            </Link>
            <Link className="rounded-full px-3 py-2 transition hover:bg-[var(--accent-soft)]" href="/user">
              User
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] p-1 shadow-panel">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm",
                state.preferences.theme === option.value
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]",
              )}
              aria-pressed={state.preferences.theme === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
