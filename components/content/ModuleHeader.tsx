"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { formatDateTime } from "@/lib/utils";
import type { ModuleContent } from "@/types/content";

interface ModuleHeaderProps {
  subjectSlug: string;
  moduleSlug: string;
  subjectTitle: string;
  moduleTitle: string;
  description?: string;
  previousModule?: ModuleContent | null;
  nextModule?: ModuleContent | null;
}

export function ModuleHeader({
  subjectSlug,
  moduleSlug,
  subjectTitle,
  moduleTitle,
  description,
  previousModule,
  nextModule,
}: ModuleHeaderProps) {
  const { hydrated, getModuleRecord, markVisited, setDone, setNeedsRevision } = useStudyHistory();
  const hasMarkedVisit = useRef(false);
  const record = hydrated ? getModuleRecord(subjectSlug, moduleSlug) : undefined;

  useEffect(() => {
    if (!hydrated || hasMarkedVisit.current) {
      return;
    }

    hasMarkedVisit.current = true;
    markVisited({
      subjectSlug,
      moduleSlug,
      subjectTitle,
      moduleTitle,
    });
  }, [hydrated, markVisited, moduleSlug, moduleTitle, subjectSlug, subjectTitle]);

  return (
    <section className="panel mb-4 overflow-hidden rounded-[2rem] p-6 sm:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <Link href="/" className="transition hover:text-[var(--foreground)]">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${subjectSlug}`} className="transition hover:text-[var(--foreground)]">
              {subjectTitle}
            </Link>
            <span>/</span>
            <span className="text-[var(--foreground)]">{moduleTitle}</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{moduleTitle}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">{description}</p>
          ) : null}
          <p className="mt-4 text-sm text-[var(--muted)]">
            Last visit: {record?.lastVisitedAt ? formatDateTime(record.lastVisitedAt) : "First visit"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() =>
              setDone({
                subjectSlug,
                moduleSlug,
                subjectTitle,
                moduleTitle,
              })
            }
            className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${
              record?.done
                ? "bg-emerald-500 text-white"
                : "button-secondary text-[var(--foreground)]"
            }`}
          >
            {record?.done ? "Marked Done" : "Mark as Done"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() =>
              setNeedsRevision({
                subjectSlug,
                moduleSlug,
                subjectTitle,
                moduleTitle,
              })
            }
            className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${
              record?.needsRevision
                ? "bg-amber-500 text-slate-950"
                : "button-secondary text-[var(--foreground)]"
            }`}
          >
            {record?.needsRevision ? "Needs Revision" : "Flag Revision"}
          </motion.button>
        </div>
      </div>

      {(previousModule || nextModule) && (
        <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
          {previousModule ? (
            <Link
              href={previousModule.href}
              className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 transition hover:border-[var(--accent)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Previous
              </p>
              <p className="mt-2 font-semibold">{previousModule.title}</p>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextModule ? (
            <Link
              href={nextModule.href}
              className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4 text-left transition hover:border-[var(--accent)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Next
              </p>
              <p className="mt-2 font-semibold">{nextModule.title}</p>
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}
