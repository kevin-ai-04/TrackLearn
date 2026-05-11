"use client";

import Link from "next/link";
import { useState } from "react";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
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
  const [enablePromptSubjectId, setEnablePromptSubjectId] = useState<string | null>(null);
  const {
    enabled,
    hydrated,
    isOnline,
    setEnabled,
    downloadCourse,
    removeDownload,
    getDownloadStatus,
    getDownloadedCourse,
  } = useOfflineSupport();

  const visibleSubjects = subjects.filter((subject) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      subject.title.toLowerCase().includes(normalizedQuery) ||
      (subject.description ?? "").toLowerCase().includes(normalizedQuery);
    const matchesStatus = status === "all" || subject.status === status;

    return matchesQuery && matchesStatus;
  });

  async function handleDownload(subjectId: string) {
    if (!enabled) {
      setEnablePromptSubjectId(subjectId);
      return;
    }

    await downloadCourse(subjectId, "personal");
  }

  async function handleEnableAndDownload() {
    if (!enablePromptSubjectId) {
      return;
    }

    const subjectId = enablePromptSubjectId;
    setEnablePromptSubjectId(null);
    await setEnabled(true);
    await downloadCourse(subjectId, "personal");
  }

  return (
    <section className="space-y-5">
      {enablePromptSubjectId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Offline Support
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Enable offline downloads?</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Personal courses are stored on this device for read-only offline study.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleEnableAndDownload}
                className="button-primary px-4 py-3 text-sm font-semibold"
              >
                Enable and Download
              </button>
              <button
                type="button"
                onClick={() => setEnablePromptSubjectId(null)}
                className="button-secondary px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="panel rounded-lg p-4">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
          <label className="sr-only" htmlFor="personal-subject-search">
            Search personal courses
          </label>
          <input
            id="personal-subject-search"
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search personal courses"
            type="search"
          />
          <label className="sr-only" htmlFor="personal-subject-status">
            Filter personal courses
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
        {visibleSubjects.map((subject) => {
          const downloadedSubject = getDownloadedCourse(subject.id);
          const updateAvailable =
            Boolean(downloadedSubject && subject.updatedAt) &&
            new Date(subject.updatedAt!).getTime() > new Date(downloadedSubject!.contentUpdatedAt).getTime();

          return (
          <article key={subject.id} className="panel rounded-lg p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold">{subject.title}</h3>
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
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/library/subjects/${subject.id}`}
                prefetch={false}
                className="button-primary inline-flex px-4 py-3 text-sm font-semibold"
              >
                Open Course
              </Link>
              {getDownloadStatus(subject.id) === "downloaded" ? (
                <>
                  {updateAvailable ? (
                    <button
                      type="button"
                      disabled={!isOnline || getDownloadStatus(subject.id) === "downloading"}
                      onClick={() => downloadCourse(subject.id, "personal")}
                      className="button-secondary px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Update Download
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeDownload(subject.id)}
                    className="button-secondary px-4 py-3 text-sm font-semibold"
                  >
                    Remove Download
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={!hydrated || !isOnline || getDownloadStatus(subject.id) === "downloading"}
                  onClick={() => handleDownload(subject.id)}
                  className="button-secondary px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {getDownloadStatus(subject.id) === "downloading"
                    ? "Downloading"
                    : getDownloadStatus(subject.id) === "error"
                      ? "Retry Download"
                      : "Download"}
                </button>
              )}
            </div>
          </article>
          );
        })}
      </div>

      {!visibleSubjects.length ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)]">
          No personal courses match the current search and filter.
        </div>
      ) : null}
    </section>
  );
}
