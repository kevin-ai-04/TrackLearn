import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getNavigationTree, getSubjectBySlug } from "@/lib/content";

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
            This subject contains {subject.materials.length} materials and {subject.modules.length} modules discovered from the filesystem.
          </p>
        </section>

        {subject.materials.length ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Materials
              </p>
              <span className="text-xs text-[var(--muted)]">{subject.materials.length} total</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {subject.materials.map((material) => (
                <Link
                  key={material.slug}
                  href={material.href}
                  className="panel rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Material
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">{material.title}</h2>
                  {material.description ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {material.description}
                    </p>
                  ) : null}
                  <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
                    <span>{material.headings.length} sections</span>
                    <span>Open material</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Modules
            </p>
            <span className="text-xs text-[var(--muted)]">{subject.modules.length} total</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {subject.modules.map((module) => (
              <Link
                key={module.slug}
                href={module.href}
                className="panel rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Module
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{module.title}</h2>
                {module.description ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{module.description}</p>
                ) : null}
                <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>{module.headings.length} sections</span>
                  <span>Open module</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
