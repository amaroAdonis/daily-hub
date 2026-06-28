/** Placeholder de carregamento. Respeita prefers-reduced-motion (CSS base). */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-border/60 ${className}`} aria-hidden="true" />
  );
}

/** Lista de linhas-esqueleto, para áreas de espera mais longas. */
export function SkeletonList({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`} role="status" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
