"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModuleList } from "@/components/sidebar/ModuleList";
import { SubjectList } from "@/components/sidebar/SubjectList";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { HeadingItem, SubjectSummary } from "@/types/content";

const HistoryPanel = dynamic(
  () => import("@/components/history/HistoryPanel").then((mod) => mod.HistoryPanel),
  {
    loading: () => (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        Loading activity...
      </div>
    ),
  },
);

const NavigationTree = dynamic(
  () => import("@/components/toc/NavigationTree").then((mod) => mod.NavigationTree),
  {
    loading: () => (
      <div className="space-y-3 animate-pulse">
        <div className="h-3 w-24 rounded-full bg-[var(--panel-alt)]" />
        <div className="h-4 w-full rounded-full bg-[var(--panel-alt)]" />
        <div className="h-4 w-5/6 rounded-full bg-[var(--panel-alt)]" />
        <div className="h-4 w-2/3 rounded-full bg-[var(--panel-alt)]" />
      </div>
    ),
  },
);

interface SidebarProps {
  subjects: SubjectSummary[];
  currentSubjectSlug?: string;
  currentModuleSlug?: string;
  currentMaterialSlug?: string;
  currentPathLabel: string;
  currentPathHint?: string;
  headings: HeadingItem[];
  navigationPlacement?: "top" | "none";
}

export function Sidebar({
  subjects,
  currentSubjectSlug,
  currentModuleSlug,
  currentMaterialSlug,
  currentPathLabel,
  currentPathHint,
  headings,
  navigationPlacement = "none",
}: SidebarProps) {
  const pathname = usePathname();
  const { data: sessionData, isPending } = authClient.useSession();
  const currentSubject = subjects.find((subject) => subject.slug === currentSubjectSlug);
  const isAuthenticated = !isPending && Boolean(sessionData?.user?.id);
  const isAdmin = sessionData?.user?.role === "admin";

  const primaryLinks = [
    { href: "/", label: "Home" },
    ...(isAuthenticated ? [{ href: "/my-library", label: "My Library" }] : [{ href: "/login", label: "Login" }]),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const secondaryLinks = [{ href: "/settings", label: "Settings" }];

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navigationCard = (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-alt)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        Navigate
      </p>
      <div className="mt-4 grid gap-2.5">
        {primaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-11 items-center justify-between rounded-[1rem] px-4 py-3 text-sm font-semibold transition",
              isActiveLink(item.href)
                ? "bg-[var(--accent)] text-white"
                : "button-secondary text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        {secondaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-between rounded-[1rem] px-4 py-3 text-sm font-semibold transition",
              isActiveLink(item.href)
                ? "bg-[var(--accent)] text-white"
                : "button-secondary text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div
      className={cn(
        "grid h-full gap-4",
        headings.length ? "lg:grid-rows-[minmax(0,1fr)_minmax(240px,0.85fr)]" : "",
      )}
    >
      <section className="panel flex min-h-0 flex-col gap-5 overflow-hidden rounded-[2rem] p-5">
        {navigationPlacement === "top" ? navigationCard : null}

        <div className="rounded-[1.5rem] bg-[var(--panel-alt)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Current Path
          </p>
          <p className="mt-2 text-lg font-semibold leading-tight">{currentPathLabel}</p>
          {currentPathHint ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{currentPathHint}</p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          <SubjectList subjects={subjects} activeSubjectSlug={currentSubjectSlug} />
          {currentSubject ? (
            <ModuleList
              subjectSlug={currentSubject.slug}
              materials={currentSubject.materials}
              modules={currentSubject.modules}
              activeModuleSlug={currentModuleSlug}
              activeMaterialSlug={currentMaterialSlug}
            />
          ) : null}
          <HistoryPanel subjects={subjects} />
        </div>
      </section>

      {headings.length ? (
        <section className="panel overflow-y-auto rounded-[2rem] p-5">
          <NavigationTree headings={headings} />
        </section>
      ) : null}
    </div>
  );
}
