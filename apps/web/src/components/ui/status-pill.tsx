import { NEXT_STATUS, PROGRESS_STATUS, type ProgressStatus } from '../../lib/status';

/** Pílula de status clicável: mostra o estágio e cicla para o próximo ao clicar. */
export function StatusPill({
  status,
  onChange,
  className = '',
}: {
  status: ProgressStatus;
  onChange: (next: ProgressStatus) => void;
  className?: string;
}) {
  const meta = PROGRESS_STATUS[status];
  return (
    <button
      type="button"
      onClick={() => onChange(NEXT_STATUS[status])}
      title={`${meta.label} — clique para avançar`}
      aria-label={`Status: ${meta.label}. Avançar`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${meta.pill} ${className}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </button>
  );
}
