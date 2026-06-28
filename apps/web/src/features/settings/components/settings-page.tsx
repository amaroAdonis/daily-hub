import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/auth';
import { Avatar } from '../../../components/ui/avatar';
import { useUpdateProfile } from '../hooks';

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus-visible:border-primary disabled:bg-bg disabled:text-muted';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

/** Tela de perfil: nome, ocupação e avatar (e-mail é somente leitura). */
export function SettingsPage() {
  const { user } = useAuth();
  const update = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? '');
  const [occupation, setOccupation] = useState(user?.occupation ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');

  if (!user) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    update.mutate(
      {
        name: name.trim(),
        occupation: occupation.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      },
      // Erros são tratados pelo toaster global (MutationCache).
      { onSuccess: () => toast.success('Perfil salvo.') },
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[110rem] gap-8 lg:grid-cols-[22rem_minmax(0,32rem)]">
      <aside className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center shadow-card lg:sticky lg:top-6 lg:self-start">
        <Avatar name={name || user.name} src={avatarUrl.trim() || null} size={112} />
        <div>
          <p className="font-display text-lg font-semibold">{name || user.name}</p>
          <p className="text-sm text-muted">{user.email}</p>
          {(occupation || user.occupation) && (
            <p className="mt-1 text-sm text-muted">{occupation || user.occupation}</p>
          )}
        </div>
      </aside>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field label="E-mail" hint="O e-mail de acesso não pode ser alterado por aqui.">
          <input className={inputClass} value={user.email} disabled />
        </Field>

        <Field label="Ocupação">
          <input
            className={inputClass}
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="Ex.: Desenvolvedor(a) fullstack"
          />
        </Field>

        <Field
          label="URL do avatar"
          hint="Cole o link de uma imagem. Em branco, usamos suas iniciais."
        >
          <input
            className={inputClass}
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>

        <div>
          <button
            type="submit"
            disabled={update.isPending}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {update.isPending ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
