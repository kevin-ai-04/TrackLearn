"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { AppTopBar } from "@/components/layout/AppTopBar";
import type { HeadingItem, SubjectSummary } from "@/types/content";

const DESKTOP_SIDEBAR_OPEN_STORAGE_KEY = "tracklearn:desktop-sidebar-open";

const MobileSidebar = dynamic(
  () => import("@/components/mobile/MobileSidebar").then((mod) => mod.MobileSidebar),
  { ssr: false },
);

const Sidebar = dynamic(
  () => import("@/components/sidebar/Sidebar").then((mod) => mod.Sidebar),
  {
    loading: () => (
      <div className="panel h-full animate-pulse rounded-[2rem] p-5">
        <div className="space-y-4">
          <div className="h-20 rounded-[1.5rem] bg-[var(--panel-alt)]" />
          <div className="h-40 rounded-[1.5rem] bg-[var(--panel-alt)]" />
          <div className="h-28 rounded-[1.5rem] bg-[var(--panel-alt)]" />
        </div>
      </div>
    ),
  },
);

interface AppShellProps {
  subjects: SubjectSummary[];
  currentSubjectSlug?: string;
  currentModuleSlug?: string;
  currentMaterialSlug?: string;
  currentPathLabel: string;
  currentPathHint?: string;
  headings?: HeadingItem[];
  loading?: boolean;
  children: ReactNode;
}

export function AppShell({
  subjects,
  currentSubjectSlug,
  currentModuleSlug,
  currentMaterialSlug,
  currentPathLabel,
  currentPathHint,
  headings = [],
  loading = false,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      setIsDesktop(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(DESKTOP_SIDEBAR_OPEN_STORAGE_KEY);
      setSidebarOpen(storedValue === "true");
    } catch {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    try {
      window.localStorage.setItem(DESKTOP_SIDEBAR_OPEN_STORAGE_KEY, String(sidebarOpen));
    } catch {
      // Ignore storage errors and keep the current-session preference in memory.
    }
  }, [isDesktop, sidebarOpen]);

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    setSidebarOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    if (!currentModuleSlug && !currentMaterialSlug) {
      return;
    }

    setSidebarOpen(true);
  }, [isDesktop, currentModuleSlug, currentMaterialSlug]);

  const desktopSidebarVisible = isDesktop && sidebarOpen;

  return (
    <div className="min-h-screen">
      <AppTopBar
        onToggleSidebar={() => setSidebarOpen((current) => !current)}
        sidebarOpen={sidebarOpen}
        loading={loading}
      />

      <MobileSidebar
        open={sidebarOpen && !isDesktop}
        onClose={() => setSidebarOpen(false)}
        subjects={subjects}
        currentSubjectSlug={currentSubjectSlug}
        currentModuleSlug={currentModuleSlug}
        currentMaterialSlug={currentMaterialSlug}
        currentPathLabel={currentPathLabel}
        currentPathHint={currentPathHint}
        headings={headings}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-6 md:py-6">
        <div
          className={`grid gap-4 transition-[grid-template-columns,gap] duration-300 ${
            desktopSidebarVisible ? "lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6" : ""
          }`}
        >
          {desktopSidebarVisible ? (
            <aside id="navigation-panel" className="hidden lg:block">
              <div className="sticky top-[5.75rem] h-[calc(100vh-7rem)]">
                <Sidebar
                  subjects={subjects}
                  currentSubjectSlug={currentSubjectSlug}
                  currentModuleSlug={currentModuleSlug}
                  currentMaterialSlug={currentMaterialSlug}
                  currentPathLabel={currentPathLabel}
                  currentPathHint={currentPathHint}
                  headings={headings}
                />
              </div>
            </aside>
          ) : null}

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
