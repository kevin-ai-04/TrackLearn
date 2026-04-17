"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useFormStatus } from "react-dom";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import type { EntryContent } from "@/types/content";

interface AdminEntryEditorProps {
  entry: EntryContent;
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
}

const MIN_PANE_HEIGHT = 320;
const MAX_PANE_HEIGHT = 1200;
const DEFAULT_PANE_HEIGHT = 640;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-primary px-4 py-3 text-sm font-semibold" disabled={pending}>
      {pending ? "Saving..." : "Submit Changes"}
    </button>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTotalLines(markdown: string) {
  return Math.max(markdown.split("\n").length, 1);
}

function getLineNumberFromIndex(markdown: string, index: number) {
  return markdown.slice(0, index).split("\n").length;
}

function getLineRange(markdown: string, lineNumber: number) {
  const lines = markdown.split("\n");
  const safeLineNumber = clamp(lineNumber, 1, lines.length);
  let start = 0;

  for (let index = 0; index < safeLineNumber - 1; index += 1) {
    start += lines[index].length + 1;
  }

  return {
    end: start + lines[safeLineNumber - 1].length,
    start,
  };
}

export function AdminEntryEditor({ entry, action, cancelHref }: AdminEntryEditorProps) {
  const [markdown, setMarkdown] = useState(entry.content);
  const [paneHeight, setPaneHeight] = useState(DEFAULT_PANE_HEIGHT);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragStateRef = useRef<{ pointerId: number; startHeight: number; startY: number } | null>(null);

  const totalLines = getTotalLines(markdown);

  useEffect(() => {
    if (!activeLine) {
      return;
    }

    setActiveLine(clamp(activeLine, 1, totalLines));
  }, [activeLine, totalLines]);

  const updatePaneHeight = (nextHeight: number) => {
    setPaneHeight(clamp(nextHeight, MIN_PANE_HEIGHT, MAX_PANE_HEIGHT));
  };

  const findPreviewSourceElement = (lineNumber: number) => {
    const preview = previewRef.current;

    if (!preview) {
      return null;
    }

    const sourceElements = Array.from(
      preview.querySelectorAll<HTMLElement>("[data-source-start][data-source-end]"),
    );

    return (
      sourceElements.find((element) => {
        const start = Number(element.dataset.sourceStart);
        const end = Number(element.dataset.sourceEnd);
        return lineNumber >= start && lineNumber <= end;
      }) ?? null
    );
  };

  const focusTextareaLine = (lineNumber: number) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const nextLine = clamp(lineNumber, 1, totalLines);
    const range = getLineRange(markdown, nextLine);
    const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight) || 28;

    textarea.focus();
    textarea.setSelectionRange(range.start, range.end);
    textarea.scrollTop = Math.max(0, (nextLine - 1) * lineHeight - textarea.clientHeight / 2 + lineHeight / 2);
  };

  const focusPreviewLine = (lineNumber: number) => {
    const previewElement = findPreviewSourceElement(lineNumber);

    if (!previewElement) {
      return;
    }

    previewElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const getPreviewLineFromEvent = (event: React.MouseEvent<HTMLDivElement>) => {
    const eventTarget = event.target;

    if (!(eventTarget instanceof HTMLElement)) {
      return null;
    }

    const sourceElement = eventTarget.closest<HTMLElement>("[data-source-start][data-source-end]");

    if (!sourceElement) {
      return null;
    }

    const startLine = Number(sourceElement.dataset.sourceStart);
    const endLine = Number(sourceElement.dataset.sourceEnd);

    if (!Number.isFinite(startLine) || !Number.isFinite(endLine)) {
      return null;
    }

    if (endLine <= startLine) {
      return startLine;
    }

    const rect = sourceElement.getBoundingClientRect();
    const progress = rect.height > 0 ? clamp((event.clientY - rect.top) / rect.height, 0, 1) : 0;
    return startLine + Math.round(progress * (endLine - startLine));
  };

  const syncToLine = (lineNumber: number, source: "textarea" | "preview") => {
    const nextLine = clamp(lineNumber, 1, totalLines);
    setActiveLine(nextLine);

    if (source === "textarea") {
      focusPreviewLine(nextLine);
      return;
    }

    focusTextareaLine(nextLine);
    window.requestAnimationFrame(() => {
      focusPreviewLine(nextLine);
    });
  };

  const handleTextareaDoubleClick = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    syncToLine(getLineNumberFromIndex(markdown, textarea.selectionStart), "textarea");
  };

  const handlePreviewDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const lineNumber = getPreviewLineFromEvent(event);

    if (!lineNumber) {
      return;
    }

    syncToLine(lineNumber, "preview");
  };

  const stopDragging = () => {
    dragStateRef.current = null;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    updatePaneHeight(dragState.startHeight + (event.clientY - dragState.startY));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragStateRef.current = {
      pointerId: event.pointerId,
      startHeight: paneHeight,
      startY: event.clientY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return (
    <section className="panel rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Edit Public Entry
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{entry.title}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {entry.subjectTitle} / {entry.kind}
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
              <span className="text-xs text-[var(--muted)]">
                {totalLines} lines / {markdown.length} characters
              </span>
            </div>
            <textarea
              id="admin-entry-markdown"
              ref={textareaRef}
              name="markdown"
              className="field resize-none overflow-auto font-mono text-sm leading-7"
              style={{ height: `${paneHeight}px` }}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              onDoubleClick={handleTextareaDoubleClick}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Live Preview</p>
              <span className="text-xs text-[var(--muted)]">Double-click maps by raw source line</span>
            </div>
            <div
              ref={previewRef}
              className="panel overflow-auto rounded-[1.5rem]"
              style={{ height: `${paneHeight}px` }}
              onDoubleClick={handlePreviewDoubleClick}
            >
              <div className="p-6 sm:p-8">
                <MarkdownRenderer activeSourceLine={activeLine} content={markdown} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Resize editor panes"
            className="button-secondary h-3 flex-1 cursor-row-resize rounded-full px-0 py-0"
            style={{ touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onLostPointerCapture={stopDragging}
          />
          <span className="text-xs text-[var(--muted)]">{paneHeight}px shared height</span>
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
