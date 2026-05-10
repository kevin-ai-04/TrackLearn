import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CourseCatalog } from "@/components/library/CourseCatalog";
import { getViewer } from "@/lib/auth-helpers";
import { getUserCourseSubjectIds } from "@/lib/course-library";
import { getNavigationTree } from "@/lib/content";

export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: Promise<{
    added?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const viewer = await getViewer();
  const resolvedSearchParams = await searchParams;
  const [subjects, selectedCourseIds] = await Promise.all([
    getNavigationTree(viewer),
    getUserCourseSubjectIds(viewer.userId),
  ]);
  const addedCourse = subjects.find((subject) => subject.id === resolvedSearchParams.added);

  return (
    <AppShell
      subjects={subjects}
      currentPathLabel="Explore"
      currentPathHint="Browse the public course catalog and add courses to your library."
    >
      <div className="space-y-4">
        {addedCourse ? (
          <div className="fixed right-4 top-20 z-50 max-w-sm rounded-lg border border-emerald-300/70 bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-panel">
            Course added to library.
          </div>
        ) : null}

        <section className="panel rounded-xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Explore
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Find courses before adding them to your library.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
                Anyone can browse the catalog overview. Adding a course to your library requires
                sign-in, and course content opens from your selected library.
              </p>
            </div>
            <Link
              href={viewer.isAuthenticated ? "/library/manage?tab=subject" : "/login"}
              className="button-primary inline-flex shrink-0 px-4 py-3 text-sm font-semibold"
            >
              New Submission
            </Link>
          </div>
        </section>

        <CourseCatalog
          courses={subjects}
          selectedCourseIds={selectedCourseIds}
          mode="explore"
        />
      </div>
    </AppShell>
  );
}
