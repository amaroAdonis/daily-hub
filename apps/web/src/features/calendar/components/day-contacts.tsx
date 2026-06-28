import { Users } from 'lucide-react';
import { ConnectionsButton } from '../../integration/components/connections-button';
import { useDayDetail } from '../hooks';

/**
 * "Pessoas do dia": contatos vinculados (via EntityLink) às atividades do dia.
 * Some quando não há nenhum, para não poluir o dashboard.
 */
export function DayContacts({ day }: { day: string }) {
  const { data } = useDayDetail(day);
  const contacts = data?.contacts ?? [];

  if (contacts.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Users size={16} strokeWidth={2} aria-hidden="true" />
        Pessoas do dia
      </h4>
      <ul className="flex flex-col gap-2">
        {contacts.map((contact) => (
          <li key={contact.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{contact.name}</p>
              {(contact.company ?? contact.email) && (
                <p className="truncate text-xs text-muted">{contact.company ?? contact.email}</p>
              )}
            </div>
            <ConnectionsButton
              type="CONTACT"
              id={contact.id}
              title={contact.name}
              className="shrink-0 text-xs text-muted hover:text-primary"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
