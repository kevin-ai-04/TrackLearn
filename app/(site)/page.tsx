import { HomeDashboard } from "@/components/home/HomeDashboard";
import { AppTopBar } from "@/components/layout/AppTopBar";

export default function HomePage() {
  return (
    <>
      <AppTopBar variant="home" />
      <HomeDashboard />
    </>
  );
}
