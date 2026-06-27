import { useState, type FormEvent } from 'react';
import type { Priority } from '@daily-hub/shared';
import { useCreateTask } from '../hooks';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
];

/** Formulário enxuto para adicionar uma tarefa ao dia informado. */
export function TaskComposer({ date }: { date: string }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const create = useCreateTask();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    create.mutate({ title: trimmed, date, priority }, { onSuccess: () => setTitle('') });
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Adicionar tarefa para hoje…"
        aria-label="Título da tarefa"
        className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus-visible:border-primary"
      />
      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value as Priority)}
        aria-label="Prioridade"
        className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus-visible:border-primary"
      >
        {PRIORITIES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={create.isPending || !title.trim()}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Adicionar
      </button>
    </form>
  );
}
