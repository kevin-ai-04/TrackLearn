import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";

interface ContentViewerProps {
  content: string;
}

export function ContentViewer({ content }: ContentViewerProps) {
  return (
    <article className="panel rounded-[2rem] p-6 sm:p-8 lg:p-10">
      <MarkdownRenderer content={content} />
    </article>
  );
}
