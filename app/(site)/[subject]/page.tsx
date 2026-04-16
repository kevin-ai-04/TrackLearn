import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SubjectOverviewSections } from "@/components/subject/SubjectOverviewSections";
import { getNavigationTree, getSubjectBySlug } from "@/lib/content";
import { formatCount } from "@/lib/utils";

interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

export async function generateStaticParams() {
  const subjects = await getNavigationTree();
  return subjects.map((subject) => ({ subject: subject.slug }));
}

export const dynamicParams = false;

export default async function SubjectPage({ params }: SubjectPageProps) {
  const resolvedParams = await params;
  const [subjects, subject] = await Promise.all([
    getNavigationTree(),
    getSubjectBySlug(resolvedParams.subject),
  ]);

  if (!subject) {
    notFound();
  }

  return (
    <AppShell
      subjects={subjects}
      currentSubjectSlug={subject.slug}
      currentPathLabel={`${subject.title} - Subject Overview`}
      currentPathHint={subject.description}
    >
      <div className="space-y-4">
        <section className="panel rounded-[2rem] p-6 sm:p-8">
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
            {formatCount(subject.modules.length, "module")} discovered from the filesystem.
          </p>
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
