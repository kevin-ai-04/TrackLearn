"use client";

import type { ReactNode } from "react";
import { DownloadedCoursesView } from "@/components/offline/DownloadedCoursesView";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";

interface LibraryOfflineGateProps {
  children: ReactNode;
}

export function LibraryOfflineGate({ children }: LibraryOfflineGateProps) {
  const { hydrated, isOnline } = useOfflineSupport();

  if (hydrated && !isOnline) {
    return <DownloadedCoursesView />;
  }

  return children;
}
