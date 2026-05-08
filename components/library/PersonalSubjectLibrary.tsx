"use client";

import Link from "next/link";
import { useState } from "react";
import { formatContentStatus, formatCount } from "@/lib/utils";
import type { ContentStatus, SubjectSummary } from "@/types/content";

type StatusFilter = "all" | ContentStatus;

interface PersonalSubjectLibraryProps {
  subjects: SubjectSummary[];
}

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "changes_requested", label: "Changes Requested" },
];

export function PersonalSubjectLibrary({ subjects }: PersonalSubjectLibraryProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const visibleSubjects = subjects.filter((subject) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      subject.title.toLowerCase().includes(normalizedQuery) ||
      (subject.description ?? "").toLowerCase().includes(normalizedQuery);
    const matchesStatus = status === "all" || subject.status === status;

    return matchesQuery && matchesStatus;
  });

  return (
    <section className="space-y-5">
      <div className="panel rounded-[1.5rem] p-4">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
          <label className="sr-only" htmlFor="personal-subject-search">
            Search personal subjects
          </label>
          <input
            id="personal-subject-search"
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search personal subjects"
            type="search"
          />
          <label className="sr-only" htmlFor="personal-subject-status">
            Filter personal subjects
          </label>
          <select
            id="personal-subject-status"
            className="field"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
          >
            {statusFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleSubjects.map((subject) => (
          <article key={subject.id} className="panel rounded-[1.5rem] p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Personal Subject
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{subject.title}</h3>
              </div>
              <span className="status-pill bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                {formatContentStatus(subject.status)}
              </span>
            </div>
            {subject.description ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{subject.description}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span>{formatCount(subject.modules.length, "module")}</span>
              <span>&bull;</span>
              <span>{formatCount(subject.materials.length, "material")}</span>
            </div>
            <div className="mt-5">
              <Link
                href={`/library/subjects/${subject.id}`}
                className="button-primary inline-flex px-4 py-3 text-sm font-semibold"
              >
                Open Subject
              </Link>
            </div>
          </article>
        ))}
      </div>

      {!visibleSubjects.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)]">
          No personal subjects match the current search and filter.
        </div>
      ) : null}
    </section>
  );
}
