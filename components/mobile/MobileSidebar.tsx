"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar/Sidebar";
import type { HeadingItem, SubjectSummary } from "@/types/content";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  subjects: SubjectSummary[];
  currentSubjectSlug?: string;
  currentModuleSlug?: string;
  currentMaterialSlug?: string;
  currentPathLabel: string;
  currentPathHint?: string;
  headings: HeadingItem[];
}

export function MobileSidebar({
  open,
  onClose,
  subjects,
  currentSubjectSlug,
  currentModuleSlug,
  currentMaterialSlug,
  currentPathLabel,
  currentPathHint,
  headings,
}: MobileSidebarProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation panel"
            className="fixed inset-0 z-40 bg-slate-950/42 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            id="navigation-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-[min(92vw,26rem)] border-r border-[var(--border)] bg-[var(--surface)] px-3 pb-3 pt-20 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
          >
            <div className="h-full overflow-hidden rounded-[2rem]">
              <Sidebar
                subjects={subjects}
                currentSubjectSlug={currentSubjectSlug}
                currentModuleSlug={currentModuleSlug}
                currentMaterialSlug={currentMaterialSlug}
                currentPathLabel={currentPathLabel}
                currentPathHint={currentPathHint}
                headings={headings}
              />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
