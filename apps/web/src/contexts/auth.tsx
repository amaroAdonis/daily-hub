import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { LoginInput, RegisterInput, UserDto } from '@daily-hub/shared';
import { clearToken, getToken, onUnauthorized, setToken } from '../lib/auth-token';
import * as authApi from '../features/auth/api';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: UserDto | null;
  status: Status;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  /** Atualiza o usuário no contexto (ex.: após salvar o perfil). */
  setUser: (user: UserDto) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Hidrata a sessão a partir do token salvo (se houver).
  useEffect(() => {
    if (!getToken()) {
      setStatus('unauthenticated');
      return;
    }
    authApi
      .getMe()
      .then((u) => {
        setUser(u);
        setStatus('authenticated');
      })
      .catch(() => {
        clearToken();
        setUser(null);
        setStatus('unauthenticated');
      });
  }, []);

  // Qualquer 401 de sessão expirada encerra a sessão local.
  useEffect(() => {
    onUnauthorized(() => logout());
  }, [logout]);

  const login = useCallback(async (input: LoginInput) => {
    const res = await authApi.login(input);
    setToken(res.token);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await authApi.register(input);
    setToken(res.token);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
