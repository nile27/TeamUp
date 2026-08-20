import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// 포트폴리오 등 사용자가 작성한 마크다운을 일관된 스타일로 렌더링.
// react-markdown은 React 엘리먼트로 렌더링해서 dangerouslySetInnerHTML 없이 안전함.
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("space-y-3 text-[15px] leading-relaxed text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold mt-4 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mt-4 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mt-3 first:mt-0">{children}</h3>,
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="rounded-lg bg-muted p-3 overflow-x-auto text-sm">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">{children}</blockquote>
          ),
          hr: () => <hr className="border-border" />,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-border px-2 py-1 text-left font-medium">{children}</th>,
          td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
