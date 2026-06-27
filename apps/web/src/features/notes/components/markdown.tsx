import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';

/**
 * Render seguro de Markdown (react-markdown ignora HTML embutido por padrão).
 * Estilizado com classes Tailwind, alinhado aos tokens de design.
 */
const components: Components = {
  h1: ({ children }) => <h1 className="mt-3 font-display text-lg font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-3 font-display text-base font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-2 font-display text-sm font-semibold">{children}</h3>,
  p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-1.5 list-disc pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 list-decimal pl-5">{children}</ol>,
  li: ({ children }) => <li className="my-0.5">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-muted">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-bg px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-bg p-3 font-mono text-xs">{children}</pre>
  ),
  hr: () => <hr className="my-3 border-border" />,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};

export function NoteMarkdown({ content }: { content: string }) {
  return (
    <div className="text-sm text-ink">
      <Markdown components={components}>{content}</Markdown>
    </div>
  );
}
