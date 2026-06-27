import { useState } from 'react';
import { useContacts } from '../hooks';
import { ContactCard } from './contact-card';
import { ContactForm } from './contact-form';

export function ContactsPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const trimmed = search.trim();
  const { data: contacts, isLoading, isError } = useContacts(trimmed ? { search: trimmed } : {});

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou empresa…"
          aria-label="Buscar contatos"
          className="w-72 max-w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none placeholder:text-muted focus-visible:border-primary"
        />
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            Novo contato
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-4">
          <ContactForm onClose={() => setCreating(false)} />
        </div>
      )}

      {isLoading && <p className="text-sm text-muted">Carregando…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Não foi possível carregar os contatos. Suba a API e o Postgres.
        </p>
      )}
      {!isLoading && !isError && contacts?.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          {trimmed ? 'Nenhum contato encontrado.' : 'Nenhum contato ainda. Adicione o primeiro.'}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {contacts?.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
}
