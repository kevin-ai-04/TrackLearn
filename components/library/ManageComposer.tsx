"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createEntryAction, createSubjectAction } from "@/app/(site)/library/actions";
import type { SubjectSummary } from "@/types/content";

type ComposerTab = "subject" | "entry";

interface ManageComposerProps {
  ownedSubjects: SubjectSummary[];
  publicSubjects: SubjectSummary[];
}

export function ManageComposer({ ownedSubjects, publicSubjects }: ManageComposerProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "entry" ? "entry" : "subject";
  const initialSubjectId = searchParams.get("subjectId") ?? "";
  const [activeTab, setActiveTab] = useState<ComposerTab>(initialTab);

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Create
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Add a personal subject or entry</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("subject")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "subject" ? "button-primary" : "button-secondary"
            }`}
          >
            Create Subject
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("entry")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "entry" ? "button-primary" : "button-secondary"
            }`}
          >
            Create Entry
          </button>
        </div>
      </div>

      {activeTab === "subject" ? (
        <div className="mt-6">
          <p className="text-sm leading-6 text-[var(--muted)]">
            Start a new personal subject. You can build it out and submit it later when it is ready.
          </p>
          <form action={createSubjectAction} className="mt-5 space-y-3">
            <input name="title" className="field" placeholder="Personal subject title" required />
            <input
              name="order"
              className="field"
              inputMode="numeric"
              placeholder="Optional order"
            />
            <textarea
              name="description"
              className="field min-h-32"
              placeholder="Short description"
            />
            <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
              Create Personal Subject
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm leading-6 text-[var(--muted)]">
            Add a module or material under one of your personal subjects, or attach one to a public subject.
          </p>
          <form action={createEntryAction} className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="title" className="field" placeholder="Module or material title" required />
              <select name="kind" className="field" defaultValue="module">
                <option value="module">Module</option>
                <option value="material">Material</option>
              </select>
            </div>
            <input
              name="order"
              className="field"
              inputMode="numeric"
              placeholder="Optional order"
            />
            <select
              name="subjectId"
              className="field"
              required
              defaultValue={ownedSubjects.some((subject) => subject.id === initialSubjectId) ? initialSubjectId : ""}
            >
              <option value="" disabled>
                Choose a parent subject
              </option>
              {ownedSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  Personal: {subject.title}
                </option>
              ))}
              {publicSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  Public: {subject.title}
                </option>
              ))}
            </select>
            <input
              name="description"
              className="field"
              placeholder="Short description"
            />
            <textarea
              name="markdown"
              className="field min-h-56 font-mono text-sm"
              placeholder="Paste markdown content"
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="markdownFile">
                Or upload a Markdown file
              </label>
              <input
                id="markdownFile"
                name="markdownFile"
                className="field"
                type="file"
                accept=".md,.markdown,text/markdown"
              />
            </div>
            <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold">
              Create Entry
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
