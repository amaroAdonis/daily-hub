const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

/** Cliente HTTP mínimo. Cada feature criará suas funções tipadas sobre ele. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
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
