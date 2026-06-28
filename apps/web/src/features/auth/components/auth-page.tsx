import { useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '../../../contexts/auth';

type Mode = 'login' | 'register';

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus-visible:border-primary';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

/** Primeira tela do produto: entrar ou criar conta. */
export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setMode(isRegister ? 'login' : 'register');
    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/dailyhub-logo.png"
            alt="DailyHub"
            className="mx-auto h-14 w-auto"
            width={900}
            height={263}
          />
          <p className="mt-3 text-sm text-muted">Sua agenda pessoal, centrada no dia.</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="font-display text-xl font-semibold">
            {isRegister ? 'Criar conta' : 'Entrar'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isRegister ? 'Comece a organizar seus dias.' : 'Bem-vindo de volta.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            {isRegister && (
              <Field label="Nome">
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como devemos te chamar?"
                  autoComplete="name"
                  required
                />
              </Field>
            )}
            <Field label="E-mail">
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Senha">
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? 'Ao menos 8 caracteres' : 'Sua senha'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </Field>

            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Aguarde…' : isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            {isRegister ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-primary hover:underline"
            >
              {isRegister ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
