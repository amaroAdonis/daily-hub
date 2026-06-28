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
