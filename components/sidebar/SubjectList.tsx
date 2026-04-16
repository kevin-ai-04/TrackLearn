"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SubjectSummary } from "@/types/content";

interface SubjectListProps {
  subjects: SubjectSummary[];
  activeSubjectSlug?: string;
}

export function SubjectList({ subjects, activeSubjectSlug }: SubjectListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        Subjects
      </p>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <Link
            key={subject.slug}
            href={`/${subject.slug}`}
            className={cn(
              "rounded-full border px-3 py-2 text-sm font-medium transition",
              activeSubjectSlug === subject.slug
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]",
            )}
          >
            {subject.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
