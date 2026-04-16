import { HomeDashboard } from "@/components/home/HomeDashboard";
import { AppShell } from "@/components/layout/AppShell";
import { getNavigationTree } from "@/lib/content";

export default async function HomePage() {
  const subjects = await getNavigationTree();

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Knowledge Base"
      currentPathHint="Content is loaded directly from /data/subjects at build time."
    >
      <HomeDashboard subjects={subjects} />
    </AppShell>
  );
}
