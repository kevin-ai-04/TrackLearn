import GithubSlugger from "github-slugger";
import { h } from "hastscript";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified, type PluggableList } from "unified";
import { visit } from "unist-util-visit";
import type { HeadingItem } from "@/types/content";

function extractText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  if ("value" in value && typeof value.value === "string") {
    return value.value;
  }

  if ("children" in value && Array.isArray(value.children)) {
    return value.children.map((child) => extractText(child)).join("");
  }

  return "";
}

export function extractMarkdownHeadings(markdown: string): HeadingItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: HeadingItem[] = [];

  visit(tree, "heading", (node) => {
    const level = node.depth;
    if (level < 1 || level > 3) {
      return;
    }

    const text = extractText(node).trim();
    if (!text) {
      return;
    }

    headings.push({
      id: slugger.slug(text),
      text,
      level: level as 1 | 2 | 3,
    });
  });

  return headings;
}

export const markdownRemarkPlugins: PluggableList = [remarkGfm];
export const markdownRehypePlugins: PluggableList = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to section",
      },
      content: h("span", { className: "anchor-glyph" }, "#"),
    },
  ] as const,
];
