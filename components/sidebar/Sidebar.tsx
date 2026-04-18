"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { ModuleList } from "@/components/sidebar/ModuleList";
import { SubjectList } from "@/components/sidebar/SubjectList";
import { NavigationTree } from "@/components/toc/NavigationTree";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { HeadingItem, SubjectSummary } from "@/types/content";

interface SidebarProps {
  subjects: SubjectSummary[];
  currentSubjectSlug?: string;
  currentModuleSlug?: string;
  currentMaterialSlug?: string;
  currentPathLabel: string;
  currentPathHint?: string;
  headings: HeadingItem[];
  navigationPlacement?: "top" | "bottom";
}

export function Sidebar({
  subjects,
  currentSubjectSlug,
  currentModuleSlug,
  currentMaterialSlug,
  currentPathLabel,
  currentPathHint,
  headings,
  navigationPlacement = "bottom",
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
      <div className="mt-3 flex flex-wrap gap-2">
        {primaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-semibold transition",
              isActiveLink(item.href)
                ? "bg-[var(--accent)] text-white"
                : "button-secondary text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        {secondaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex rounded-full px-3 py-2 text-sm font-semibold transition",
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

        {navigationPlacement === "bottom" ? navigationCard : null}
      </section>

      {headings.length ? (
        <section className="panel overflow-y-auto rounded-[2rem] p-5">
          <NavigationTree headings={headings} />
        </section>
      ) : null}
    </div>
  );
}
