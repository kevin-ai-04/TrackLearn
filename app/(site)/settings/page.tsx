import { AppShell } from "@/components/layout/AppShell";
import { AccountProfileSettings } from "@/components/settings/AccountProfileSettings";
import { SettingsPreferenceControls } from "@/components/settings/SettingsPreferenceControls";
import { SettingsAccountActions } from "@/components/settings/SettingsAccountActions";
import { RoleSwitchAutoRefresh } from "@/components/settings/RoleSwitchAutoRefresh";
import { ProgressDataControls } from "@/components/settings/ProgressDataControls";
import { userRoleOptions } from "@/lib/auth-roles";
import { getViewer } from "@/lib/auth-helpers";
import { getNavigationTree } from "@/lib/content";
import { getUserAccountProfile } from "@/lib/user-profile-store";
import { updateViewerRole } from "./actions";

export const dynamic = "force-dynamic";

function formatAccountDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

export default async function SettingsPage() {
  const viewer = await getViewer();
  const [subjects, profile] = await Promise.all([
    getNavigationTree(viewer),
    viewer.userId ? getUserAccountProfile(viewer.userId) : Promise.resolve(null),
  ]);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Settings"
      currentPathHint="Theme, reading preferences, account profile, and progress data controls."
    >
      <>
        <RoleSwitchAutoRefresh />
        <SettingsPreferenceControls />

        {viewer.isAuthenticated ? (
          <AccountProfileSettings
            profile={{
              name: profile?.name ?? viewer.name ?? null,
              username: profile?.username ?? null,
              email: profile?.email ?? viewer.email ?? null,
              emailVerified: profile?.emailVerified ?? false,
              role: profile?.role ?? viewer.role,
              joinedAtLabel: formatAccountDate(profile?.joinedAt),
              updatedAtLabel: formatAccountDate(profile?.updatedAt),
            }}
          />
        ) : null}

        {viewer.isAuthenticated ? (
          <section className="panel mb-4 rounded-xl p-6 sm:p-8">
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
                    className={`rounded-lg border p-5 ${
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

            <SettingsAccountActions isAdmin={viewer.role === "admin"} />
          </section>
        ) : null}

        <ProgressDataControls />
      </>
    </AppShell>
  );
}
