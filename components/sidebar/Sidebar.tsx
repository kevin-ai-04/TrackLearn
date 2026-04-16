"use client";

import { HistoryPanel } from "@/components/history/HistoryPanel";
import { ModuleList } from "@/components/sidebar/ModuleList";
import { SubjectList } from "@/components/sidebar/SubjectList";
import { NavigationTree } from "@/components/toc/NavigationTree";
import { cn } from "@/lib/utils";
import type { HeadingItem, SubjectSummary } from "@/types/content";

interface SidebarProps {
  subjects: SubjectSummary[];
  currentSubjectSlug?: string;
  currentModuleSlug?: string;
  currentMaterialSlug?: string;
  currentPathLabel: string;
  currentPathHint?: string;
  headings: HeadingItem[];
}

export function Sidebar({
  subjects,
  currentSubjectSlug,
  currentModuleSlug,
  currentMaterialSlug,
  currentPathLabel,
  currentPathHint,
  headings,
}: SidebarProps) {
  const currentSubject = subjects.find((subject) => subject.slug === currentSubjectSlug);

  return (
    <div
      className={cn(
        "grid h-full gap-4",
        headings.length ? "lg:grid-rows-[minmax(0,1fr)_minmax(240px,0.85fr)]" : "",
      )}
    >
      <section className="panel flex min-h-0 flex-col gap-5 overflow-hidden rounded-[2rem] p-5">
        <div className="rounded-[1.5rem] bg-[var(--panel-alt)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Current Path
          </p>
          <p className="mt-2 text-lg font-semibold leading-tight">{currentPathLabel}</p>
          {currentPathHint ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{currentPathHint}</p>
          ) : null}
        </div>

        <SubjectList subjects={subjects} activeSubjectSlug={currentSubjectSlug} />

        {currentSubject ? (
          <div className="min-h-0 overflow-y-auto pr-1">
            <ModuleList
              subjectSlug={currentSubject.slug}
              materials={currentSubject.materials}
              modules={currentSubject.modules}
              activeModuleSlug={currentModuleSlug}
              activeMaterialSlug={currentMaterialSlug}
            />
          </div>
        ) : null}

        <HistoryPanel subjects={subjects} />
      </section>

      {headings.length ? (
        <section className="panel overflow-y-auto rounded-[2rem] p-5">
          <NavigationTree headings={headings} />
        </section>
      ) : null}
    </div>
  );
}
