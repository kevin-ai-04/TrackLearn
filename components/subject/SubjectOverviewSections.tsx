"use client";

import Link from "next/link";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { formatCount } from "@/lib/utils";
import type { MaterialSummary, ModuleSummary } from "@/types/content";

interface SubjectOverviewSectionsProps {
  subjectSlug: string;
  materials: MaterialSummary[];
  modules: ModuleSummary[];
}

function StatusBadges({
  done,
  needsRevision,
}: {
  done?: boolean;
  needsRevision?: boolean;
}) {
  if (!done && !needsRevision) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {done ? (
        <span className="status-pill bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          Done
        </span>
      ) : null}
      {needsRevision ? (
        <span className="status-pill bg-amber-500/18 text-amber-700 dark:text-amber-200">
          Revise
        </span>
      ) : null}
    </div>
  );
}

export function SubjectOverviewSections({
  subjectSlug,
  materials,
  modules,
}: SubjectOverviewSectionsProps) {
  const { hydrated, getModuleRecord } = useStudyHistory();

  return (
    <>
      {materials.length ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Materials
            </p>
            <span className="text-xs text-[var(--muted)]">
              {formatCount(materials.length, "material")}
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {materials.map((material) => (
              <Link
                key={material.slug}
                href={material.href}
                className="panel rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Material
                  </p>
                  <div className="min-h-6 shrink-0" />
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{material.title}</h2>
                {material.description ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{material.description}</p>
                ) : null}
                <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>{formatCount(material.headings.length, "section")}</span>
                  <span>Open material</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Modules
          </p>
          <span className="text-xs text-[var(--muted)]">{formatCount(modules.length, "module")}</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {modules.map((module) => {
            const record = hydrated ? getModuleRecord(subjectSlug, module.slug) : undefined;

            return (
              <Link
                key={module.slug}
                href={module.href}
                className="panel rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Module
                  </p>
                  <StatusBadges
                    done={record?.done}
                    needsRevision={record?.needsRevision}
                  />
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{module.title}</h2>
                {module.description ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{module.description}</p>
                ) : null}
                <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>{formatCount(module.headings.length, "section")}</span>
                  <span>Open module</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
