import { useState, type FormEvent } from 'react';
import type { ContactDto } from '@daily-hub/shared';
import { useCreateContact, useUpdateContact } from '../hooks';

interface Props {
  /** Quando presente, edita o contato; caso contrário, cria. */
  contact?: ContactDto;
  onClose: () => void;
}

export function ContactForm({ contact, onClose }: Props) {
  const isEdit = Boolean(contact);
  const [name, setName] = useState(contact?.name ?? '');
  const [email, setEmail] = useState(contact?.email ?? '');
  const [phone, setPhone] = useState(contact?.phone ?? '');
  const [company, setCompany] = useState(contact?.company ?? '');
  const [notes, setNotes] = useState(contact?.notes ?? '');

  const create = useCreateContact();
  const update = useUpdateContact();
  const pending = create.isPending || update.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const onSuccess = () => onClose();
    if (isEdit && contact) {
      update.mutate(
        {
          id: contact.id,
          input: {
            name: trimmed,
            email: email.trim() || null,
            phone: phone.trim() || null,
            company: company.trim() || null,
            notes: notes.trim() || null,
          },
        },
        { onSuccess },
      );
    } else {
      create.mutate(
        {
          name: trimmed,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          notes: notes.trim() || undefined,
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
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        aria-label="Nome"
        autoFocus
        className={field}
      />
      <div className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          aria-label="E-mail"
          className={`${field} flex-1`}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone"
          aria-label="Telefone"
          className={`${field} flex-1`}
        />
      </div>
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Empresa"
        aria-label="Empresa"
        className={field}
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Observações (opcional)"
        aria-label="Observações"
        rows={2}
        className={field}
      />
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
          disabled={pending || !name.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isEdit ? 'Salvar' : 'Adicionar contato'}
        </button>
      </div>
    </form>
  );
}
