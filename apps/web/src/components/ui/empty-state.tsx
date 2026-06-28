import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Estado vazio com personalidade: ícone, título, descrição e ação opcional. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-muted">
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
