import { HomeDashboard } from "@/components/home/HomeDashboard";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { getViewer } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const viewer = await getViewer();

  return (
    <>
      <AppTopBar variant="home" />
      <HomeDashboard isAuthenticated={viewer.isAuthenticated} />
    </>
  );
}
