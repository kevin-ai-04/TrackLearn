import { HomeDashboard } from "@/components/home/HomeDashboard";
import { AppShell } from "@/components/layout/AppShell";
import { getNavigationTree } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const subjects = await getNavigationTree();

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Knowledge Base"
      currentPathHint="Public content is served from the shared catalog, with /data/subjects retained as the seed source."
    >
      <HomeDashboard subjects={subjects} />
    </AppShell>
  );
}
