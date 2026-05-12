import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CourseCatalog } from "@/components/library/CourseCatalog";
import { PersonalSubjectLibrary } from "@/components/library/PersonalSubjectLibrary";
import { requireUser } from "@/lib/auth-helpers";
import { getUserCourseSubjectIds, listSelectedPublicSubjects } from "@/lib/course-library";
import { getNavigationTree, listUserLibrary } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const viewer = await requireUser();
  const [subjects, library, selectedCourseIds] = await Promise.all([
    getNavigationTree(viewer),
    listUserLibrary(viewer.userId),
    getUserCourseSubjectIds(viewer.userId),
  ]);
  const selectedPublicSubjects = await listSelectedPublicSubjects(
    viewer.userId!,
    library.publicSubjects,
    selectedCourseIds,
  );

  return (
    <AppShell
      subjects={selectedPublicSubjects}
      currentPathLabel="Library"
      currentPathHint="Your selected public courses and personal courses."
    >
      <div className="space-y-4">
        <section className="panel rounded-xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Library
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Your selected courses and personal courses.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
                Courses appear here after you add them from Explore. Personal courses remain here
                for editing, submission, and private study.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/offline" className="button-secondary inline-flex px-4 py-3 text-sm font-semibold">
                Downloaded Courses
              </Link>
              <Link href="/explore" className="button-primary inline-flex px-4 py-3 text-sm font-semibold">
                Explore Courses
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Selected courses</p>
              <p className="mt-2 text-3xl font-semibold">{selectedPublicSubjects.length}</p>
            </div>
            <div className="rounded-lg bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Personal courses</p>
              <p className="mt-2 text-3xl font-semibold">{library.ownedSubjects.length}</p>
            </div>
            <div className="rounded-lg bg-[var(--panel-alt)] p-4">
              <p className="text-sm text-[var(--muted)]">Personal entries</p>
              <p className="mt-2 text-3xl font-semibold">{library.ownedEntries.length}</p>
            </div>
          </div>
        </section>

        <section className="panel rounded-xl p-6 sm:p-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Selected Courses
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Public courses in your library</h2>
            </div>
            <span className="text-sm text-[var(--muted)]">{selectedPublicSubjects.length} total</span>
          </div>
          {selectedPublicSubjects.length ? (
            <CourseCatalog
              courses={selectedPublicSubjects}
              selectedCourseIds={selectedCourseIds}
              mode="library"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--panel-alt)] p-6 text-sm text-[var(--muted)]">
              Your library has no selected public courses yet. Add courses from Explore.
            </div>
          )}
        </section>

        <section className="panel rounded-xl p-6 sm:p-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Personal Courses
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Your private and submitted work</h2>
            </div>
            <Link href="/library/manage?tab=subject" className="button-secondary px-4 py-3 text-sm font-semibold">
              New Personal Course
            </Link>
          </div>
          <PersonalSubjectLibrary subjects={library.ownedSubjects} />
        </section>
      </div>
    </AppShell>
  );
}
