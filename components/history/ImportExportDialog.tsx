"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStudyHistory } from "@/hooks/useStudyHistory";
import { cn } from "@/lib/utils";
import type { ImportMode } from "@/types/history";

interface ImportExportDialogProps {
  open: boolean;
  mode: "import" | "export";
  onClose: () => void;
}

export function ImportExportDialog({ open, mode, onClose }: ImportExportDialogProps) {
  const { exportText, importText } = useStudyHistory();
  const [textInput, setTextInput] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setFeedback(null);
      setCopied(false);
    }
  }, [open]);

  const textExport = exportText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textExport);
      setCopied(true);
      setFeedback("Text export copied to the clipboard.");
    } catch {
      setFeedback("Clipboard access failed. Copy the text manually.");
    }
  };

  const runTextImport = () => {
    const result = importText(textInput, importMode);
    setFeedback(result.message);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-slate-950/45"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close dialog"
          />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 top-1/2 z-[60] mx-auto w-full max-w-3xl -translate-y-1/2"
            role="dialog"
            aria-modal="true"
            aria-label={mode === "export" ? "Export progress" : "Import progress"}
          >
            <div className="panel max-h-[85vh] overflow-y-auto rounded-[2rem] p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    {mode === "export" ? "Export Progress" : "Import Progress"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {mode === "export"
                      ? "Move your study state anywhere."
                      : "Restore or merge study state from pasted data."}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="button-secondary inline-flex h-11 w-11 items-center justify-center text-lg"
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </div>

              {mode === "export" ? (
                <div className="mt-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={handleCopy} className="button-primary px-4 py-3 text-sm font-semibold">
                        {copied ? "Copied" : "Copy Text Export"}
                      </button>
                    </div>
                    <textarea readOnly value={textExport} className="field min-h-56 font-mono text-xs" />
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {(["merge", "replace"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setImportMode(option)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold transition",
                          importMode === option
                            ? "bg-[var(--accent)] text-white"
                            : "button-secondary text-[var(--foreground)]",
                        )}
                      >
                        {option === "merge" ? "Merge import" : "Replace local state"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold" htmlFor="text-import">
                      Text export
                    </label>
                    <textarea
                      id="text-import"
                      value={textInput}
                      onChange={(event) => setTextInput(event.target.value)}
                      placeholder="Paste the JSON text export here"
                      className="field min-h-44 font-mono text-xs"
                    />
                    <button type="button" onClick={runTextImport} className="button-primary px-4 py-3 text-sm font-semibold">
                      Import Text Data
                    </button>
                  </div>
                </div>
              )}

              {feedback ? (
                <div className="mt-5 rounded-[1.25rem] border border-[var(--border)] bg-[var(--panel-alt)] px-4 py-3 text-sm text-[var(--muted)]">
                  {feedback}
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
