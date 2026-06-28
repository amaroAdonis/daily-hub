/**
 * Persistência do token JWT (localStorage) e canal para reagir a respostas 401.
 * Mantido fora do `lib/api` para evitar dependência circular com o AuthContext.
 */
const TOKEN_KEY = 'daily-hub.token';

let unauthorizedHandler: (() => void) | null = null;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Registra o que fazer quando uma sessão existente expira (401 com token). */
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}
