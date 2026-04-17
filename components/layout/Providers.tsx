"use client";

import { PropsWithChildren } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { StudyHistoryProvider } from "@/hooks/useStudyHistory";

interface ProvidersProps extends PropsWithChildren {
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <StudyHistoryProvider>{children}</StudyHistoryProvider>
    </SessionProvider>
  );
}
