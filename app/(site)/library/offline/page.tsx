import { AppShell } from "@/components/layout/AppShell";
import { OfflineLibraryClient } from "@/components/offline/OfflineLibraryClient";

export default function OfflineLibraryPage() {
  return (
    <AppShell
      subjects={[]}
      currentPathLabel="Downloaded Courses"
      currentPathHint="Courses stored on this device for offline reading."
    >
      <OfflineLibraryClient />
    </AppShell>
  );
}
