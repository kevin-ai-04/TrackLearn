import { AppShell } from "@/components/layout/AppShell";
import { UserDashboard } from "@/components/history/UserDashboard";
import { getViewer } from "@/lib/auth-helpers";
import { getNavigationTree } from "@/lib/content";

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
      <UserDashboard subjects={subjects} />
    </AppShell>
  );
}
