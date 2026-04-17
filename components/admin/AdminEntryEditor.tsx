"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import type { EntryContent } from "@/types/content";

interface AdminEntryEditorProps {
  entry: EntryContent;
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold" disabled={pending}>
      {pending ? "Saving..." : "Submit Changes"}
    </button>
  );
}

export function AdminEntryEditor({ entry, action, cancelHref }: AdminEntryEditorProps) {
  const [markdown, setMarkdown] = useState(entry.content);

  return (
    <section className="panel rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Edit Public Entry
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{entry.title}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {entry.subjectTitle} · {entry.kind}
          </p>
        </div>
        <Link href={cancelHref} className="button-secondary px-4 py-3 text-sm font-semibold">
          Back To Admin
        </Link>
      </div>

      <form action={action} className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="title" className="field" defaultValue={entry.title} required />
          <input name="slug" className="field" defaultValue={entry.slug} required />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select name="kind" className="field" defaultValue={entry.kind}>
            <option value="module">Module</option>
            <option value="material">Material</option>
          </select>
          <input
            name="order"
            className="field"
            inputMode="numeric"
            defaultValue={entry.order ?? ""}
            placeholder="Optional order"
          />
        </div>

        <input
          name="description"
          className="field"
          defaultValue={entry.description ?? ""}
          placeholder="Short description"
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold" htmlFor="admin-entry-markdown">
                Raw Markdown
              </label>
              <span className="text-xs text-[var(--muted)]">{markdown.length} characters</span>
            </div>
            <textarea
              id="admin-entry-markdown"
              name="markdown"
              className="field min-h-[32rem] font-mono text-sm leading-7"
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Live Preview</p>
              <span className="text-xs text-[var(--muted)]">Computed locally</span>
            </div>
            <div className="panel min-h-[32rem] rounded-[1.5rem] p-6 sm:p-8">
              <MarkdownRenderer content={markdown} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SubmitButton />
          <Link href={cancelHref} className="button-secondary px-4 py-3 text-sm font-semibold">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
