"use client";

import { PropsWithChildren } from "react";
import { OfflineSupportProvider } from "@/hooks/useOfflineSupport";
import { StudyHistoryProvider } from "@/hooks/useStudyHistory";
import { ServiceWorkerRegistrar } from "@/components/layout/ServiceWorkerRegistrar";

export function Providers({ children }: PropsWithChildren) {
  return (
    <OfflineSupportProvider>
      <ServiceWorkerRegistrar />
      <StudyHistoryProvider>{children}</StudyHistoryProvider>
    </OfflineSupportProvider>
  );
}
