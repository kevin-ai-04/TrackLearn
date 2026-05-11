"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  clearDownloadedCourses,
  getOfflineSupportEnabled,
  listDownloadedCourses,
  removeDownloadedCourse,
  saveDownloadedCourse,
  setOfflineSupportEnabled,
} from "@/lib/offline-storage";
import {
  cacheOfflineRoutesForCourse,
  removeOfflineRoutesForCourse,
} from "@/lib/offline-route-cache";
import type { OfflineCourseSnapshot, OfflineCourseSource } from "@/types/offline";

type DownloadStatus = "idle" | "downloading" | "downloaded" | "error";

interface OfflineSupportContextValue {
  enabled: boolean;
  hydrated: boolean;
  isOnline: boolean;
  courses: OfflineCourseSnapshot[];
  downloadedIds: string[];
  setEnabled: (enabled: boolean) => Promise<void>;
  refreshDownloads: () => Promise<void>;
  downloadCourse: (courseId: string, source: OfflineCourseSource) => Promise<void>;
  removeDownload: (courseId: string) => Promise<void>;
  clearDownloads: () => Promise<void>;
  getDownloadStatus: (courseId: string) => DownloadStatus;
  getDownloadedCourse: (courseId: string) => OfflineCourseSnapshot | undefined;
}

const OfflineSupportContext = createContext<OfflineSupportContextValue | null>(null);

export function OfflineSupportProvider({ children }: PropsWithChildren) {
  const [enabled, setEnabledState] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [courses, setCourses] = useState<OfflineCourseSnapshot[]>([]);
  const [activeDownloads, setActiveDownloads] = useState<Set<string>>(new Set());
  const [failedDownloads, setFailedDownloads] = useState<Set<string>>(new Set());

  const refreshDownloads = useCallback(async () => {
    setCourses(await listDownloadedCourses());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const [storedEnabled, storedCourses] = await Promise.all([
        getOfflineSupportEnabled(),
        listDownloadedCourses(),
      ]);

      if (cancelled) {
        return;
      }

      setEnabledState(storedEnabled);
      setCourses(storedCourses);
      setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
      setHydrated(true);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const downloadedIds = useMemo(() => courses.map((course) => course.id), [courses]);
  const downloadedIdSet = useMemo(() => new Set(downloadedIds), [downloadedIds]);

  const setEnabled = useCallback(async (nextEnabled: boolean) => {
    await setOfflineSupportEnabled(nextEnabled);
    setEnabledState(nextEnabled);
  }, []);

  const downloadCourse = useCallback(
    async (courseId: string, source: OfflineCourseSource) => {
      setActiveDownloads((current) => new Set(current).add(courseId));
      setFailedDownloads((current) => {
        const next = new Set(current);
        next.delete(courseId);
        return next;
      });

      try {
        const response = await fetch(`/api/offline/courses/${courseId}?source=${source}`, {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Failed to download course.");
        }

        const snapshot = (await response.json()) as OfflineCourseSnapshot;
        await saveDownloadedCourse(snapshot);
        await cacheOfflineRoutesForCourse(snapshot);
        await refreshDownloads();
      } catch {
        setFailedDownloads((current) => new Set(current).add(courseId));
      } finally {
        setActiveDownloads((current) => {
          const next = new Set(current);
          next.delete(courseId);
          return next;
        });
      }
    },
    [refreshDownloads],
  );

  const removeDownload = useCallback(
    async (courseId: string) => {
      const course = courses.find((item) => item.id === courseId);
      await removeDownloadedCourse(courseId);
      if (course) {
        await removeOfflineRoutesForCourse(course);
      }
      await refreshDownloads();
    },
    [courses, refreshDownloads],
  );

  const clearDownloads = useCallback(async () => {
    await Promise.all(courses.map((course) => removeOfflineRoutesForCourse(course)));
    await clearDownloadedCourses();
    await refreshDownloads();
  }, [courses, refreshDownloads]);

  const getDownloadStatus = useCallback(
    (courseId: string): DownloadStatus => {
      if (activeDownloads.has(courseId)) {
        return "downloading";
      }

      if (downloadedIdSet.has(courseId)) {
        return "downloaded";
      }

      if (failedDownloads.has(courseId)) {
        return "error";
      }

      return "idle";
    },
    [activeDownloads, downloadedIdSet, failedDownloads],
  );

  const getDownloadedCourse = useCallback(
    (courseId: string) => courses.find((course) => course.id === courseId),
    [courses],
  );

  return createElement(
    OfflineSupportContext.Provider,
    {
      value: {
        enabled,
        hydrated,
        isOnline,
        courses,
        downloadedIds,
        setEnabled,
        refreshDownloads,
        downloadCourse,
        removeDownload,
        clearDownloads,
        getDownloadStatus,
        getDownloadedCourse,
      },
    },
    children,
  );
}

export function useOfflineSupport() {
  const context = useContext(OfflineSupportContext);

  if (!context) {
    throw new Error("useOfflineSupport must be used within OfflineSupportProvider.");
  }

  return context;
}
