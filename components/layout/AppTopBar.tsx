"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { authClient } from "@/lib/auth-client";
import { ThemeModeIcon } from "@/components/ui/ThemeModeIcon";
import { cn } from "@/lib/utils";
import type { ReadingFont, ThemeMode } from "@/types/history";

interface AppTopBarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  loading?: boolean;
}

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Reading", value: "reading" },
];

function getNextTheme(mode: ThemeMode): ThemeMode {
  if (mode === "light") {
    return "dark";
  }

  if (mode === "dark") {
    return "reading";
  }

  return "light";
}

const NAVIGATION_REVEAL_DELAY_MS = 140;
const NAVIGATION_MIN_VISIBLE_MS = 320;

export function AppTopBar({
  onToggleSidebar,
  sidebarOpen = false,
  loading = false,
}: AppTopBarProps) {
  const pathname = usePathname();
  const { state, setFont, setTheme } = useStudyHistory();
  const { data: sessionData, isPending } = authClient.useSession();
  const [hidden, setHidden] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const lastScrollYRef = useRef(0);
  const navigationStartedAtRef = useRef<number | null>(null);
  const navigationRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextFont: ReadingFont = state.preferences.font === "outfit" ? "serif" : "outfit";
  const isAuthenticated = !isPending && Boolean(sessionData?.user?.id);
  const isAdmin = sessionData?.user?.role === "admin";
  const nextTheme = getNextTheme(state.preferences.theme);
  const showLoadingLine = loading || isNavigating;

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

  useEffect(() => {
    if (navigationRevealTimerRef.current) {
      clearTimeout(navigationRevealTimerRef.current);
      navigationRevealTimerRef.current = null;
    }

    if (!isNavigating) {
      navigationStartedAtRef.current = null;
      return;
    }

    const startedAt = navigationStartedAtRef.current;
    const elapsed = startedAt ? Date.now() - startedAt : 0;
    const remaining = Math.max(0, NAVIGATION_MIN_VISIBLE_MS - elapsed);

    if (navigationResetTimerRef.current) {
      clearTimeout(navigationResetTimerRef.current);
    }

    navigationResetTimerRef.current = setTimeout(() => {
      setIsNavigating(false);
      navigationStartedAtRef.current = null;
      navigationResetTimerRef.current = null;
    }, remaining);

    return () => {
      if (navigationResetTimerRef.current) {
        clearTimeout(navigationResetTimerRef.current);
        navigationResetTimerRef.current = null;
      }
    };
  }, [pathname]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (
        nextUrl.origin !== currentUrl.origin ||
        (nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search &&
          nextUrl.hash === currentUrl.hash)
      ) {
        return;
      }

      navigationStartedAtRef.current = Date.now();
      if (navigationRevealTimerRef.current) {
        clearTimeout(navigationRevealTimerRef.current);
      }
      navigationRevealTimerRef.current = setTimeout(() => {
        setIsNavigating(true);
        navigationRevealTimerRef.current = null;
      }, NAVIGATION_REVEAL_DELAY_MS);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      if (navigationRevealTimerRef.current) {
        clearTimeout(navigationRevealTimerRef.current);
        navigationRevealTimerRef.current = null;
      }
      if (navigationResetTimerRef.current) {
        clearTimeout(navigationResetTimerRef.current);
        navigationResetTimerRef.current = null;
      }
    };
  }, []);

  return (
    <header
      className={cn(
        "relative sticky top-0 z-40 overflow-hidden border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md transition-transform duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="button-secondary inline-flex h-11 w-11 items-center justify-center text-lg"
            aria-label={sidebarOpen ? "Hide navigation panel" : "Show navigation panel"}
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
          <nav className="hidden items-center gap-2 text-sm text-[var(--muted)] md:flex">
            <Link className="rounded-full px-3 py-2 transition hover:bg-[var(--accent-soft)]" href="/">
              Home
            </Link>
            <Link
              className="rounded-full px-3 py-2 transition hover:bg-[var(--accent-soft)]"
              href="/library"
            >
              Library
            </Link>
            {!isAuthenticated ? (
              <Link
                className="rounded-full px-3 py-2 transition hover:bg-[var(--accent-soft)]"
                href="/login"
              >
                Login
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                className="rounded-full px-3 py-2 transition hover:bg-[var(--accent-soft)]"
                href="/admin"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="hidden rounded-full px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--accent-soft)] md:inline-flex"
          >
            Settings
          </Link>

          <button
            type="button"
            onClick={() => setFont(nextFont)}
            className="button-secondary inline-flex h-11 w-11 items-center justify-center rounded-full"
            aria-label={`Switch font to ${nextFont === "serif" ? "serif" : "sans"} mode`}
            title={`Switch font to ${nextFont === "serif" ? "serif" : "sans"} mode`}
          >
            <span
              aria-hidden="true"
              className="text-xl font-semibold leading-none text-[var(--foreground)]"
              style={{
                fontFamily:
                  state.preferences.font === "serif" ? "var(--font-serif)" : "var(--font-sans)",
              }}
            >
              F
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            className="button-secondary inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            aria-label={`Switch display mode to ${nextTheme}`}
            title={`Switch display mode to ${nextTheme}`}
          >
            <ThemeModeIcon mode={state.preferences.theme} />
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] p-1 shadow-panel md:flex">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
                  state.preferences.theme === option.value
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]",
                )}
                aria-label={option.label}
                title={option.label}
                aria-pressed={state.preferences.theme === option.value}
              >
                <ThemeModeIcon mode={option.value} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] overflow-hidden">
        {showLoadingLine ? (
          <motion.div
            className="h-full w-1/2 bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] opacity-80"
            initial={{ x: "-60%" }}
            animate={{ x: "220%" }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "easeInOut" }}
            style={{
              boxShadow: "0 0 10px color-mix(in srgb, var(--accent) 42%, transparent)",
            }}
          />
        ) : null}
      </div>
    </header>
  );
}
