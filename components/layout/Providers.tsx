"use client";

import { PropsWithChildren } from "react";
import { StudyHistoryProvider } from "@/hooks/useStudyHistory";

export function Providers({ children }: PropsWithChildren) {
  return (
    <StudyHistoryProvider>{children}</StudyHistoryProvider>
  );
}
