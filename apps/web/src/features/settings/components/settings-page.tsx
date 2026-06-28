import { useState, type FormEvent, type ReactNode } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    update.mutate(
      {
        name: name.trim(),
        occupation: occupation.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      },
      {
        onSuccess: () => setSaved(true),
        onError: (err) => setError(err instanceof Error ? err.message : 'Não foi possível salvar.'),
      },
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-4">
        <Avatar name={name || user.name} src={avatarUrl.trim() || null} size={72} />
        <div>
          <p className="font-display text-lg font-semibold">{name || user.name}</p>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
      </div>

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

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success" role="status">
            Perfil salvo.
          </p>
        )}

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
