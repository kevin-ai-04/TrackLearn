import { AppShell } from "@/components/layout/AppShell";
import { UserDashboard } from "@/components/history/UserDashboard";
import { requireUser } from "@/lib/auth-helpers";
import { getNavigationTree } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function UserPage() {
  const viewer = await requireUser();
  const subjects = await getNavigationTree(viewer);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="User - Progress & Preferences"
      currentPathHint="Signed-in progress syncs to your account, while guest browsing still uses local persistence."
    >
      <UserDashboard subjects={subjects} />
    </AppShell>
  );
}
