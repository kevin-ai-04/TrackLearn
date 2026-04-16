"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { MobileSidebar } from "@/components/mobile/MobileSidebar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import type { HeadingItem, SubjectSummary } from "@/types/content";

const DESKTOP_SIDEBAR_OPEN_STORAGE_KEY = "tracklearn:desktop-sidebar-open";

interface AppShellProps {
  subjects: SubjectSummary[];
  currentSubjectSlug?: string;
  currentModuleSlug?: string;
  currentMaterialSlug?: string;
  currentPathLabel: string;
  currentPathHint?: string;
  headings?: HeadingItem[];
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
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop, currentSubjectSlug, currentModuleSlug, currentMaterialSlug]);

  const desktopSidebarVisible = isDesktop && sidebarOpen;

  return (
    <div className="min-h-screen">
      <AppTopBar
        onToggleSidebar={() => setSidebarOpen((current) => !current)}
        sidebarOpen={sidebarOpen}
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
