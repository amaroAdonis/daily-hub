import { useState, type FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import type { CreateEventInput, EventDto } from '@daily-hub/shared';
import { useCreateEvent, useUpdateEvent } from '../hooks';
import {
  RECURRENCE_OPTIONS,
  presetToRule,
  ruleToPreset,
  type RecurrencePreset,
} from '../recurrence';

const REMINDERS: { value: string; label: string }[] = [
  { value: '', label: 'Sem lembrete' },
  { value: '10', label: '10 min antes' },
  { value: '30', label: '30 min antes' },
  { value: '60', label: '1 hora antes' },
  { value: '1440', label: '1 dia antes' },
];

/** Combina dia (`YYYY-MM-DD`) e hora (`HH:mm`) locais num instante ISO (UTC). */
const toIso = (day: string, time: string) => new Date(`${day}T${time}`).toISOString();

interface Props {
  /** Dia pré-selecionado ao criar. */
  defaultDate: string;
  /** Quando presente, o formulário edita o compromisso (série inteira). */
  event?: EventDto;
  onClose: () => void;
}

export function EventForm({ defaultDate, event, onClose }: Props) {
  const isEdit = Boolean(event);
  const start = event ? parseISO(event.startsAt) : null;
  const end = event ? parseISO(event.endsAt) : null;

  const [title, setTitle] = useState(event?.title ?? '');
  const [day, setDay] = useState(start ? format(start, 'yyyy-MM-dd') : defaultDate);
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [startTime, setStartTime] = useState(start ? format(start, 'HH:mm') : '09:00');
  const [endTime, setEndTime] = useState(end ? format(end, 'HH:mm') : '10:00');
  const [location, setLocation] = useState(event?.location ?? '');
  const [meetingUrl, setMeetingUrl] = useState(event?.meetingUrl ?? '');
  const [recurrence, setRecurrence] = useState<RecurrencePreset>(
    ruleToPreset(event?.recurrence ?? null),
  );
  const [reminder, setReminder] = useState(
    event?.reminderMin != null ? String(event.reminderMin) : '',
  );

  const create = useCreateEvent();
  const update = useUpdateEvent();
  const pending = create.isPending || update.isPending;

  const submit = (formEvent: FormEvent) => {
    formEvent.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const payload: CreateEventInput = {
      title: trimmed,
      startsAt: allDay ? toIso(day, '00:00') : toIso(day, startTime),
      endsAt: allDay ? toIso(day, '23:59') : toIso(day, endTime),
      allDay,
      location: location.trim() || undefined,
      meetingUrl: meetingUrl.trim() || undefined,
      recurrence: presetToRule(recurrence) ?? undefined,
      reminderMin: reminder ? Number(reminder) : undefined,
    };

    const onSuccess = () => onClose();
    if (isEdit && event) update.mutate({ id: event.id, input: payload }, { onSuccess });
    else create.mutate(payload, { onSuccess });
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
        placeholder="Título do compromisso"
        aria-label="Título"
        autoFocus
        className={field}
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          aria-label="Data"
          className={field}
        />
        {!allDay && (
          <>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              aria-label="Início"
              className={field}
            />
            <span className="text-muted">–</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-label="Fim"
              className={field}
            />
          </>
        )}
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
          Dia inteiro
        </label>
      </div>

      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Local (opcional)"
        aria-label="Local"
        className={field}
      />

      <input
        type="url"
        value={meetingUrl}
        onChange={(e) => setMeetingUrl(e.target.value)}
        placeholder="Link da reunião (opcional)"
        aria-label="Link da reunião"
        className={field}
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as RecurrencePreset)}
          aria-label="Recorrência"
          className={field}
        >
          {RECURRENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          aria-label="Lembrete"
          className={field}
        >
          {REMINDERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
          {isEdit ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
}
