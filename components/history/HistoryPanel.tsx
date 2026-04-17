"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { formatDateTime, normalizeRouteSegment } from "@/lib/utils";
import type { SubjectSummary } from "@/types/content";

interface HistoryPanelProps {
  subjects: SubjectSummary[];
  limit?: number;
  title?: string;
}

function resolveTitles(subjects: SubjectSummary[], subjectSlug: string, moduleSlug: string) {
  const subject = subjects.find((item) => item.slug === subjectSlug);
  const normalizedModuleSlug = normalizeRouteSegment(moduleSlug);
  const module = subject?.modules.find((item) => item.slug === normalizedModuleSlug);

  return {
    subjectTitle: subject?.title ?? subjectSlug,
    moduleTitle: module?.title ?? moduleSlug,
  };
}

export function HistoryPanel({
  subjects,
  limit = 5,
  title = "Recent Activity",
}: HistoryPanelProps) {
  const { hydrated, state } = useStudyHistory();
  const recentItems = state.recentActivity.slice(0, limit);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          {title}
        </p>
        <span className="text-xs text-[var(--muted)]">{recentItems.length} tracked</span>
      </div>

      {!hydrated ? (
        <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          Loading study history...
        </div>
      ) : recentItems.length ? (
        <div className="space-y-2">
          {recentItems.map((item, index) => {
            const resolved = resolveTitles(subjects, item.subjectSlug, item.moduleSlug);
            const normalizedModuleSlug = normalizeRouteSegment(item.moduleSlug);

            return (
              <motion.div
                key={`${item.subjectSlug}-${item.moduleSlug}-${item.visitedAt}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
              >
                <Link
                  href={`/${item.subjectSlug}/${normalizedModuleSlug}`}
                  className="block rounded-[1.3rem] border border-[var(--border)] bg-[var(--panel)] p-3 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--panel-alt)]"
                >
                  <p className="text-sm font-semibold">{resolved.moduleTitle}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{resolved.subjectTitle}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {formatDateTime(item.visitedAt)}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          Open a module and it will appear here for quick continuation.
        </div>
      )}
    </div>
  );
}
