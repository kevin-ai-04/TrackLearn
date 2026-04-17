import ReactMarkdown from "react-markdown";
import { markdownRehypePlugins, markdownRemarkPlugins } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={{
          a({ href, children, className, ...props }) {
            const isExternal = Boolean(href?.startsWith("http"));
            const isHeadingAnchor = className?.includes("heading-anchor");
            const classes = [className];

            if (!isHeadingAnchor) {
              classes.push(
                "text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-4",
              );
            }

            return (
              <a
                {...props}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className={classes.filter(Boolean).join(" ")}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
