"use client";

import Link from "next/link";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { cn, formatDateTime, normalizeRouteSegment } from "@/lib/utils";
import type { MaterialSummary, ModuleSummary } from "@/types/content";

interface ModuleListProps {
  subjectSlug: string;
  materials: MaterialSummary[];
  modules: ModuleSummary[];
  activeModuleSlug?: string;
  activeMaterialSlug?: string;
}

export function ModuleList({
  subjectSlug,
  materials,
  modules,
  activeModuleSlug,
  activeMaterialSlug,
}: ModuleListProps) {
  const { hydrated, getModuleRecord, state } = useStudyHistory();
  const recentKeys = new Set(
    state.recentActivity
      .slice(0, 6)
      .map((item) => `${item.subjectSlug}::${normalizeRouteSegment(item.moduleSlug)}`),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Materials & Modules
        </p>
        <span className="text-xs text-[var(--muted)]">{materials.length + modules.length} total</span>
      </div>

      <div className="space-y-2">
        {materials.length ? (
          <div className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Materials
            </p>
            {materials.map((material) => (
              <Link
                key={material.slug}
                href={material.href}
                className={cn(
                  "block rounded-[1.3rem] border p-3 transition",
                  activeMaterialSlug === material.slug
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--panel)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--panel-alt)]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{material.title}</p>
                    {material.description ? (
                      <p className="mt-1 text-sm text-[var(--muted)]">{material.description}</p>
                    ) : null}
                  </div>
                  <span className="status-pill bg-sky-500/15 text-sky-700 dark:text-sky-200">
                    Material
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">Open external resources</p>
              </Link>
            ))}
          </div>
        ) : null}

        {modules.map((module) => {
          const record = hydrated ? getModuleRecord(subjectSlug, module.slug) : undefined;
          const isRecent = recentKeys.has(`${subjectSlug}::${module.slug}`);

          return (
            <Link
              key={module.slug}
              href={`/${subjectSlug}/${module.slug}`}
              className={cn(
                "block rounded-[1.3rem] border p-3 transition",
                activeModuleSlug === module.slug
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--panel)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--panel-alt)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{module.title}</p>
                  {module.description ? (
                    <p className="mt-1 text-sm text-[var(--muted)]">{module.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  <span className="status-pill bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                    Module
                  </span>
                  {record?.done ? (
                    <span className="status-pill bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                      Done
                    </span>
                  ) : null}
                  {record?.needsRevision ? (
                    <span className="status-pill bg-amber-500/18 text-amber-700 dark:text-amber-200">
                      Revise
                    </span>
                  ) : null}
                  {isRecent ? (
                    <span className="status-pill bg-sky-500/15 text-sky-700 dark:text-sky-200">
                      Recent
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">
                {record?.lastVisitedAt ? formatDateTime(record.lastVisitedAt) : "Not opened yet"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
