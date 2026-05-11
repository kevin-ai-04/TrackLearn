import { AppShell } from "@/components/layout/AppShell";
import { UserDashboard } from "@/components/history/UserDashboard";
import { getViewer } from "@/lib/auth-helpers";
import { getUserCourseSubjectIds, listSelectedPublicSubjects } from "@/lib/course-library";
import { getNavigationTree } from "@/lib/content";
import { getUserAccountProfile } from "@/lib/user-profile-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const viewer = await getViewer();
  const [subjects, selectedCourseIds, profile] = await Promise.all([
    getNavigationTree(viewer),
    getUserCourseSubjectIds(viewer.userId),
    viewer.userId ? getUserAccountProfile(viewer.userId) : Promise.resolve(null),
  ]);
  const selectedPublicSubjects = viewer.userId
    ? await listSelectedPublicSubjects(viewer.userId, subjects, selectedCourseIds)
    : [];
  const username = profile?.username ?? viewer.name ?? "Learner";

  return (
    <AppShell
      subjects={selectedPublicSubjects}
      currentPathLabel="Home"
      currentPathHint="Your study progress, course completion, and recent activity."
    >
      <div className="space-y-4">
        <section className="panel rounded-xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Home
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome Back, {username}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Resume your recent modules and review progress across vour courses.
          </p>
        </section>

        <UserDashboard subjects={selectedPublicSubjects} />
      </div>
    </AppShell>
  );
}
