"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HeadingItem } from "@/types/content";

interface NavigationTreeProps {
  headings: HeadingItem[];
  onHeadingSelect?: (id: string) => void;
}

interface TocNode {
  id: string;
  text: string;
  level: number;
  children: TocNode[];
}

function buildOutline(headings: HeadingItem[]): TocNode[] {
  const root: TocNode = {
    id: "__root__",
    text: "Root",
    level: 0,
    children: [],
  };
  const stack = [root];

  headings.forEach((heading) => {
    const node: TocNode = {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      children: [],
    };

    while (stack.length > 1 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });

  return root.children;
}

function collectExpandableIds(nodes: TocNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.children.length ? [node.id] : []),
    ...collectExpandableIds(node.children),
  ]);
}

function findPathToNode(nodes: TocNode[], activeId: string | null): string[] {
  if (!activeId) {
    return [];
  }

  for (const node of nodes) {
    if (node.id === activeId) {
      return [node.id];
    }

    const childPath = findPathToNode(node.children, activeId);
    if (childPath.length) {
      return [node.id, ...childPath];
    }
  }

  return [];
}

function containsActiveNode(node: TocNode, activeId: string | null): boolean {
  if (!activeId) {
    return false;
  }

  return node.children.some((child) => child.id === activeId || containsActiveNode(child, activeId));
}

export function NavigationTree({ headings, onHeadingSelect }: NavigationTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const outline = useMemo(() => buildOutline(headings), [headings]);
  const [expandedIds, setExpandedIds] = useState<string[]>(() => collectExpandableIds(outline));

  useEffect(() => {
    setActiveId(headings[0]?.id ?? null);
  }, [headings]);

  useEffect(() => {
    setExpandedIds(collectExpandableIds(outline));
  }, [outline]);

  useEffect(() => {
    if (!headings.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        if (visibleEntries[0]?.target.id) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 1],
      },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    const activePath = findPathToNode(outline, activeId);
    if (!activePath.length) {
      return;
    }

    setExpandedIds((current) => Array.from(new Set([...current, ...activePath])));
  }, [activeId, outline]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const scrollToHeading = (id: string) => {
    if (onHeadingSelect) {
      onHeadingSelect(id);
      setActiveId(id);
      return;
    }

    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (!headings.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Navigation Tree
        </p>
        <span className="text-xs text-[var(--muted)]">{headings.length} sections</span>
      </div>

      <div className="space-y-1">
        {outline.map((node) => (
          <NavigationBranch
            key={node.id}
            node={node}
            depth={0}
            activeId={activeId}
            expandedIds={expandedIds}
            onToggle={toggleExpanded}
            onSelect={scrollToHeading}
          />
        ))}
      </div>
    </div>
  );
}

interface NavigationBranchProps {
  node: TocNode;
  depth: number;
  activeId: string | null;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

function NavigationBranch({
  node,
  depth,
  activeId,
  expandedIds,
  onToggle,
  onSelect,
}: NavigationBranchProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isActive = node.id === activeId;
  const inActiveBranch = isActive || containsActiveNode(node, activeId);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl transition",
          inActiveBranch ? "bg-[var(--accent-soft)]/50" : "hover:bg-[var(--panel-alt)]/70",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
            aria-expanded={isExpanded}
            className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <span
              className={cn(
                "text-xs transition-transform",
                isExpanded ? "rotate-90 text-[var(--accent-strong)]" : "",
              )}
            >
              {">"}
            </span>
          </button>
        ) : (
          <span className="ml-1 h-8 w-8 shrink-0" aria-hidden="true" />
        )}

        <motion.button
          type="button"
          onClick={() => onSelect(node.id)}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex-1 rounded-2xl px-3 py-2 text-left text-sm transition",
            isActive
              ? "text-[var(--accent-strong)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
          style={{ paddingLeft: `${depth * 0.65 + 0.75}rem` }}
        >
          {node.text}
        </motion.button>
      </div>

      {hasChildren && isExpanded ? (
        <div className="ml-4 space-y-1 border-l border-[var(--border)]/80 pl-2">
          {node.children.map((child) => (
            <NavigationBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
