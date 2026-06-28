/**
 * Status de progresso comum a tarefas e compromissos (e base do futuro Kanban):
 * A fazer → Em andamento → Concluído. Rótulos e cores num só lugar.
 */
export type ProgressStatus = 'TODO' | 'DOING' | 'DONE';

export const PROGRESS_STATUS: Record<ProgressStatus, { label: string; pill: string; dot: string }> =
  {
    TODO: { label: 'A fazer', pill: 'bg-slate-400/10 text-slate-600', dot: 'bg-slate-400' },
    DOING: { label: 'Em andamento', pill: 'bg-amber-500/10 text-amber-700', dot: 'bg-amber-500' },
    DONE: { label: 'Concluído', pill: 'bg-emerald-500/10 text-emerald-700', dot: 'bg-emerald-500' },
  };

/** Próximo estágio ao clicar a pílula (cicla). */
export const NEXT_STATUS: Record<ProgressStatus, ProgressStatus> = {
  TODO: 'DOING',
  DOING: 'DONE',
  DONE: 'TODO',
};

/** Cores do toast por status (mesma família das pílulas: slate/amber/emerald). */
export const STATUS_TOAST: Record<
  ProgressStatus,
  { background: string; color: string; border: string }
> = {
  TODO: { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' },
  DOING: { background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' },
  DONE: { background: '#ecfdf5', color: '#047857', border: '1px solid #6ee7b7' },
};
