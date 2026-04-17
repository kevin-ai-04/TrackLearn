import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { markdownRehypePlugins, markdownRemarkPlugins } from "@/lib/markdown";

interface MarkdownRendererProps {
  activeSourceLine?: number | null;
  content: string;
}

interface SourceNodeLike {
  position?: {
    end?: {
      line?: number;
    };
    start?: {
      line?: number;
    };
  };
}

function getSourceLineProps(node: SourceNodeLike | undefined, activeSourceLine?: number | null, className?: string) {
  const startLine = node?.position?.start?.line;
  const endLine = node?.position?.end?.line ?? startLine;
  const classes = [className];

  if (
    activeSourceLine &&
    typeof startLine === "number" &&
    typeof endLine === "number" &&
    activeSourceLine >= startLine &&
    activeSourceLine <= endLine
  ) {
    classes.push("markdown-source-active");
  }

  return {
    className: classes.filter(Boolean).join(" "),
    "data-source-end": typeof endLine === "number" ? endLine : undefined,
    "data-source-start": typeof startLine === "number" ? startLine : undefined,
  };
}

function renderBlock<TagProps extends { children?: ReactNode; className?: string; node?: SourceNodeLike }>(
  Tag: "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "li" | "ol" | "p" | "pre" | "table" | "ul",
  props: TagProps,
  activeSourceLine?: number | null,
) {
  const { children, className, node, ...rest } = props;

  return (
    <Tag {...rest} {...getSourceLineProps(node, activeSourceLine, className)}>
      {children}
    </Tag>
  );
}

export function MarkdownRenderer({ activeSourceLine, content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={{
          blockquote(props) {
            return renderBlock("blockquote", props, activeSourceLine);
          },
          h1(props) {
            return renderBlock("h1", props, activeSourceLine);
          },
          h2(props) {
            return renderBlock("h2", props, activeSourceLine);
          },
          h3(props) {
            return renderBlock("h3", props, activeSourceLine);
          },
          h4(props) {
            return renderBlock("h4", props, activeSourceLine);
          },
          h5(props) {
            return renderBlock("h5", props, activeSourceLine);
          },
          h6(props) {
            return renderBlock("h6", props, activeSourceLine);
          },
          li(props) {
            return renderBlock("li", props, activeSourceLine);
          },
          ol(props) {
            return renderBlock("ol", props, activeSourceLine);
          },
          p(props) {
            return renderBlock("p", props, activeSourceLine);
          },
          pre(props) {
            return renderBlock("pre", props, activeSourceLine);
          },
          table(props) {
            return renderBlock("table", props, activeSourceLine);
          },
          ul(props) {
            return renderBlock("ul", props, activeSourceLine);
          },
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
