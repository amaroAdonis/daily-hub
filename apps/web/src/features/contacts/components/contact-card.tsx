import { useState } from 'react';
import type { ContactDto } from '@daily-hub/shared';
import { useDeleteContact } from '../hooks';
import { ContactForm } from './contact-form';
import { ConnectionsButton } from '../../integration/components/connections-button';

export function ContactCard({ contact }: { contact: ContactDto }) {
  const [editing, setEditing] = useState(false);
  const remove = useDeleteContact();

  if (editing) {
    return <ContactForm contact={contact} onClose={() => setEditing(false)} />;
  }

  const initial = contact.name.trim().charAt(0).toUpperCase();

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display font-semibold">{contact.name}</h3>
          {contact.company && <p className="truncate text-sm text-muted">{contact.company}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1 text-sm">
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="truncate text-primary hover:underline">
            {contact.email}
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="truncate text-ink hover:underline">
            {contact.phone}
          </a>
        )}
        {contact.notes && <p className="mt-1 text-sm text-muted">{contact.notes}</p>}
      </div>

      <div className="mt-3 flex justify-end gap-2 text-xs text-muted">
        <button type="button" onClick={() => setEditing(true)} className="hover:text-primary">
          Editar
        </button>
        <ConnectionsButton type="CONTACT" id={contact.id} title={contact.name} />
        <button
          type="button"
          onClick={() => remove.mutate(contact.id)}
          disabled={remove.isPending}
          className="hover:text-danger"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}
