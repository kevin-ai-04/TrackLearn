"use client";

import { useEffect, useState } from "react";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import {
  getDownloadedCourse,
  removeDownloadedCourse,
  saveDownloadedCourse,
} from "@/lib/offline-courses";
import type { SubjectSummary } from "@/types/content";
import type { DownloadedCourseRecord } from "@/types/offline";

interface CourseDownloadButtonProps {
  course: SubjectSummary;
}

export function CourseDownloadButton({ course }: CourseDownloadButtonProps) {
  const { state, setOfflineSupport } = useStudyHistory();
  const [downloaded, setDownloaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getDownloadedCourse(course.id)
      .then((record) => {
        if (!cancelled) {
          setDownloaded(Boolean(record));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDownloaded(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [course.id]);

  async function downloadCourse(forceEnabled = false) {
    if (!forceEnabled && !state.preferences.offlineSupport) {
      setPromptOpen(true);
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/offline-courses/${course.id}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to download this course.");
      }

      const record = (await response.json()) as DownloadedCourseRecord;
      await saveDownloadedCourse(record);
      setDownloaded(true);
      setMessage("Downloaded");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Download failed.");
    } finally {
      setPending(false);
    }
  }

  async function removeDownload() {
    setPending(true);
    setMessage(null);

    try {
      await removeDownloadedCourse(course.id);
      setDownloaded(false);
      setMessage("Removed download");
    } catch {
      setMessage("Unable to remove download.");
    } finally {
      setPending(false);
    }
  }

  async function enableAndDownload() {
    setOfflineSupport(true);
    setPromptOpen(false);
    await downloadCourse(true);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={downloaded ? removeDownload : () => downloadCourse()}
        disabled={pending}
        className="button-secondary px-4 py-3 text-sm font-semibold"
      >
        {pending ? "Working..." : downloaded ? "Remove Download" : "Download"}
      </button>

      {message ? <p className="mt-2 text-xs text-[var(--muted)]">{message}</p> : null}

      {promptOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xl">
          <p className="text-sm font-semibold">Enable offline support?</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Downloads are available after offline support is turned on in settings.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={enableAndDownload}
              className="button-primary px-3 py-2 text-sm font-semibold"
            >
              Enable
            </button>
            <button
              type="button"
              onClick={() => setPromptOpen(false)}
              className="button-secondary px-3 py-2 text-sm font-semibold"
            >
              Not Now
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
