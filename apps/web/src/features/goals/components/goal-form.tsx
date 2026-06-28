import { useState, type FormEvent } from 'react';
import type { GoalDto, GoalHorizon, GoalStatus } from '@daily-hub/shared';
import { useCreateGoal, useUpdateGoal } from '../hooks';
import { HORIZON_OPTIONS, STATUS_OPTIONS } from '../labels';

interface Props {
  /** Quando presente, edita a meta; caso contrário, cria. */
  goal?: GoalDto;
  /** Meta-pai pré-selecionada (ao criar uma sub-meta). */
  defaultParentId?: string;
  /** Metas que podem ser pai (exclui a própria e suas sub-metas). */
  parentOptions: { id: string; title: string }[];
  onClose: () => void;
}

export function GoalForm({ goal, defaultParentId, parentOptions, onClose }: Props) {
  const isEdit = Boolean(goal);
  const [title, setTitle] = useState(goal?.title ?? '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [horizon, setHorizon] = useState<GoalHorizon>(goal?.horizon ?? 'MEDIUM');
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? 'TODO');
  const [progress, setProgress] = useState(goal?.progress ?? 0);
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '');
  const [parentId, setParentId] = useState(goal?.parentId ?? defaultParentId ?? '');

  const create = useCreateGoal();
  const update = useUpdateGoal();
  const pending = create.isPending || update.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const onSuccess = () => onClose();
    if (isEdit && goal) {
      update.mutate(
        {
          id: goal.id,
          input: {
            title: trimmed,
            description: description.trim() || null,
            horizon,
            status,
            progress,
            targetDate: targetDate || null,
            parentId: parentId || null,
          },
        },
        { onSuccess },
      );
    } else {
      create.mutate(
        {
          title: trimmed,
          description: description.trim() || undefined,
          horizon,
          status,
          progress,
          targetDate: targetDate || undefined,
          parentId: parentId || undefined,
        },
        { onSuccess },
      );
    }
  };

  const field =
    'rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:border-primary';

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da meta"
        aria-label="Título"
        autoFocus
        className={field}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (opcional)"
        aria-label="Descrição"
        rows={2}
        className={field}
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={horizon}
          onChange={(e) => setHorizon(e.target.value as GoalHorizon)}
          aria-label="Horizonte"
          className={field}
        >
          {HORIZON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as GoalStatus)}
          aria-label="Status"
          className={field}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          aria-label="Meta-pai"
          className={field}
        >
          <option value="">Sem meta-pai</option>
          {parentOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex flex-1 items-center gap-2 text-sm text-muted">
          Progresso
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            aria-label="Progresso"
            className="flex-1 accent-primary"
          />
          <span className="w-10 text-right font-mono text-xs">{progress}%</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          Prazo
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            aria-label="Data-alvo"
            className={field}
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-sm text-muted hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isEdit ? 'Salvar' : 'Criar meta'}
        </button>
      </div>
    </form>
  );
}
