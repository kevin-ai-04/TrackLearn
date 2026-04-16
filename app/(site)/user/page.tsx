import { AppShell } from "@/components/layout/AppShell";
import { UserDashboard } from "@/components/history/UserDashboard";
import { getNavigationTree } from "@/lib/content";

export default async function UserPage() {
  const subjects = await getNavigationTree();

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="User - Progress & Preferences"
      currentPathHint="Everything on this page is stored locally in browser persistence."
    >
      <UserDashboard subjects={subjects} />
    </AppShell>
  );
}
