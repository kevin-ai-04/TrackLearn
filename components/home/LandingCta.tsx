"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function LandingCta() {
  const { data: sessionData, isPending } = authClient.useSession();
  const isAuthenticated = Boolean(sessionData?.user?.id);

  if (isPending) {
    return (
      <div className="mt-8 flex h-12 items-center justify-center" aria-hidden="true">
        <div className="h-11 w-40 animate-pulse rounded-full bg-white/25" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Link
        href="/home"
        className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--accent-strong)] shadow-panel transition hover:-translate-y-0.5 hover:bg-[var(--surface-alt)]"
      >
        Start Learning <span aria-hidden="true" className="ml-2">-&gt;</span>
      </Link>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/login"
        className="inline-flex rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/60 transition hover:-translate-y-0.5 hover:bg-white/25"
      >
        Sign In <span aria-hidden="true" className="ml-2">-&gt;</span>
      </Link>
      <Link
        href="/explore"
        className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--accent-strong)] shadow-panel transition hover:-translate-y-0.5 hover:bg-[var(--surface-alt)]"
      >
        Explore Courses <span aria-hidden="true" className="ml-2">-&gt;</span>
      </Link>
    </div>
  );
}
