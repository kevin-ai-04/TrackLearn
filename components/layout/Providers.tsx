"use client";

import { PropsWithChildren } from "react";
import { StudyHistoryProvider } from "@/hooks/useStudyHistory";
import { ServiceWorkerRegistration } from "@/components/offline/ServiceWorkerRegistration";

export function Providers({ children }: PropsWithChildren) {
  return (
    <StudyHistoryProvider>
      <ServiceWorkerRegistration />
      {children}
    </StudyHistoryProvider>
  );
}
