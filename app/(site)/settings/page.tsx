import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { UserDashboard } from "@/components/history/UserDashboard";
import { RoleSwitchAutoRefresh } from "@/components/settings/RoleSwitchAutoRefresh";
import { userRoleOptions } from "@/lib/auth-roles";
import { getViewer } from "@/lib/auth-helpers";
import { getNavigationTree } from "@/lib/content";
import { updateViewerRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const viewer = await getViewer();
  const subjects = await getNavigationTree(viewer);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Settings"
      currentPathHint="Theme, reading preferences, and study progress are available to everyone. Signing in enables optional account sync and private content tools."
    >
      <>
        <RoleSwitchAutoRefresh />

        {viewer.isAuthenticated ? (
          <section className="panel mb-4 rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Role Switch Menu
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Current role: {viewer.role === "admin" ? "Admin" : "User"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              This build allows role switching so reviewers can test both account paths without manual
              database edits. Changing the role updates the MongoDB user record used by auth and route
              access checks.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {userRoleOptions.map((roleOption) => {
                const isCurrentRole = viewer.role === roleOption.value;

                return (
                  <form
                    key={roleOption.value}
                    action={updateViewerRole.bind(null, roleOption.value)}
                    className={`rounded-[1.5rem] border p-5 ${
                      isCurrentRole
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-[var(--panel-alt)]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                      {roleOption.label}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {roleOption.description}
                    </p>
                    <button
                      type="submit"
                      disabled={isCurrentRole}
                      className={`mt-5 w-full px-4 py-3 text-sm font-semibold ${
                        isCurrentRole ? "button-secondary cursor-default opacity-70" : "button-primary"
                      }`}
                    >
                      {isCurrentRole ? "Current Role" : `Switch To ${roleOption.label}`}
                    </button>
                  </form>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/my-library" className="button-secondary px-4 py-3 font-semibold">
                Open My Library
              </Link>
              {viewer.role === "admin" ? (
                <Link href="/admin" className="button-secondary px-4 py-3 font-semibold">
                  Open Admin Dashboard
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        <UserDashboard subjects={subjects} />
      </>
    </AppShell>
  );
}
