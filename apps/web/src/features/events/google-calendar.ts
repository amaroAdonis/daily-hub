import type { EventOccurrence } from '@daily-hub/shared';

/** ISO → formato compacto UTC do Google Calendar (`YYYYMMDDTHHMMSSZ`). */
function toGoogleStamp(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** ISO → `YYYYMMDD` (UTC), para eventos de dia inteiro. */
function toGoogleDate(iso: string, addDays = 0): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + addDays);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Monta a URL de "adicionar ao Google Agenda" (template, sem OAuth) para uma
 * ocorrência. Eventos de dia inteiro usam o intervalo de datas (fim exclusivo);
 * o link da reunião, quando houver, entra nos detalhes.
 */
export function googleCalendarUrl(occurrence: EventOccurrence): string {
  const dates = occurrence.allDay
    ? `${toGoogleDate(occurrence.start)}/${toGoogleDate(occurrence.end, 1)}`
    : `${toGoogleStamp(occurrence.start)}/${toGoogleStamp(occurrence.end)}`;

  const details = [occurrence.description, occurrence.meetingUrl].filter(Boolean).join('\n\n');

  const params = new URLSearchParams({ action: 'TEMPLATE', text: occurrence.title, dates });
  if (details) params.set('details', details);
  if (occurrence.location) params.set('location', occurrence.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
