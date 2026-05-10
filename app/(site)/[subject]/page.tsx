import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SubjectOverviewSections } from "@/components/subject/SubjectOverviewSections";
import {
  createPrivateCourseCopyAction,
  syncPrivateCourseCopyAction,
} from "@/app/(site)/library/actions";
import { requireUser } from "@/lib/auth-helpers";
import {
  getUserCourseSubjectIds,
  getUserPrivateSubjectForPublicSubject,
  listSelectedPublicSubjects,
} from "@/lib/course-library";
import { getNavigationTree, getSubjectBySlug } from "@/lib/content";
import { formatCount } from "@/lib/utils";

interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function SubjectPage({ params }: SubjectPageProps) {
  const resolvedParams = await params;
  const viewer = await requireUser();
  const [subjects, subject, selectedCourseIds] = await Promise.all([
    getNavigationTree(viewer),
    getSubjectBySlug(resolvedParams.subject, viewer),
    getUserCourseSubjectIds(viewer.userId),
  ]);

  if (!subject) {
    notFound();
  }

  const isInLibrary = selectedCourseIds.includes(subject.id);

  if (!isInLibrary) {
    redirect(`/explore?course=${subject.slug}`);
  }

  const [privateCopy, selectedSubjects] = await Promise.all([
    getUserPrivateSubjectForPublicSubject(viewer.userId!, subject.id),
    listSelectedPublicSubjects(viewer.userId!, subjects, selectedCourseIds),
  ]);
  const publicIsAhead = privateCopy?.updatedAt
    ? new Date(subject.updatedAt ?? 0).getTime() > new Date(privateCopy.updatedAt).getTime()
    : false;

  return (
    <AppShell
      subjects={selectedSubjects}
      currentSubjectSlug={subject.slug}
      currentPathLabel={`${subject.title} - Subject Overview`}
      currentPathHint={subject.description}
    >
      <div className="space-y-4">
        <section className="panel rounded-xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Subject Overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{subject.title}</h1>
          {subject.description ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {subject.description}
            </p>
          ) : null}
          <p className="mt-5 text-sm text-[var(--muted)]">
            This subject contains {formatCount(subject.materials.length, "material")} and{" "}
            {formatCount(subject.modules.length, "module")} in the shared catalog.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {privateCopy ? (
              <>
                <a
                  href={`/library/subjects/${privateCopy.id}`}
                  className="button-primary px-4 py-3 text-sm font-semibold"
                >
                  Edit Private Copy
                </a>
                {publicIsAhead ? (
                  <form action={syncPrivateCourseCopyAction}>
                    <input type="hidden" name="privateSubjectId" value={privateCopy.id} />
                    <button type="submit" className="button-secondary px-4 py-3 text-sm font-semibold">
                      {privateCopy.hasPrivateChanges ? "Update From Public Version" : "Sync Latest Public Version"}
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <form action={createPrivateCourseCopyAction}>
                <input type="hidden" name="subjectId" value={subject.id} />
                <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
                  Edit Course
                </button>
              </form>
            )}
          </div>
        </section>

        <SubjectOverviewSections
          subjectSlug={subject.slug}
          materials={subject.materials}
          modules={subject.modules}
        />
      </div>
    </AppShell>
  );
}
