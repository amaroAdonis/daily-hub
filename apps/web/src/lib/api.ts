import { getToken, notifyUnauthorized } from './auth-token';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

/** Cliente HTTP mínimo. Cada feature criará suas funções tipadas sobre ele. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });
  // 401 com token presente = sessão expirada/inválida → desloga.
  // (Falha de login/cadastro não tem token, logo não dispara o logout global.)
  if (res.status === 401 && token) {
    notifyUnauthorized();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? 'Erro na requisição');
  }
  // Respostas sem corpo (ex.: 204 No Content) não têm JSON a desserializar.
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
}

export const getHealth = () => api<HealthStatus>('/health');
