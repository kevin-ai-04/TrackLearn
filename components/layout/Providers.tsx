"use client";

import { PropsWithChildren } from "react";
import { StudyHistoryProvider } from "@/hooks/useStudyHistory";
import { ConnectivityRefreshPrompt } from "@/components/offline/ConnectivityRefreshPrompt";
import { ServiceWorkerRegistration } from "@/components/offline/ServiceWorkerRegistration";

export function Providers({ children }: PropsWithChildren) {
  return (
    <StudyHistoryProvider>
      <ServiceWorkerRegistration />
      <ConnectivityRefreshPrompt />
      {children}
    </StudyHistoryProvider>
  );
}
