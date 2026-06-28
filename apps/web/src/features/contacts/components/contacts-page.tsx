import { useState } from 'react';
import { Users } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { useContacts } from '../hooks';
import { ContactCard } from './contact-card';
import { ContactForm } from './contact-form';

export function ContactsPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const trimmed = search.trim();
  const { data: contacts, isLoading, isError } = useContacts(trimmed ? { search: trimmed } : {});

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou empresa…"
          aria-label="Buscar contatos"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none placeholder:text-muted focus-visible:border-primary sm:w-72"
        />
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="w-full shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 sm:w-auto"
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

      {isLoading && (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="status"
          aria-label="Carregando"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}
      {isError && (
        <p className="text-sm text-danger">
          Não foi possível carregar os contatos. Suba a API e o Postgres.
        </p>
      )}
      {!isLoading && !isError && contacts?.length === 0 && !creating && (
        <EmptyState
          icon={Users}
          title={trimmed ? 'Nenhum contato encontrado' : 'Nenhum contato ainda'}
          description={
            trimmed ? `Nada para “${trimmed}”.` : 'Adicione as pessoas com quem você se conecta.'
          }
          action={
            !trimmed ? (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
              >
                Novo contato
              </button>
            ) : undefined
          }
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contacts?.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
}
