import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';
import type { PublicUser } from '../api/types';

interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api.me().then(setUser).catch(() => clearToken()).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const res = await api.register(email, password, displayName);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore network errors on logout
    }
    clearToken();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
