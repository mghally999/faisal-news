'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAccessToken, setUnauthorizedHandler } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const triedHydrate = useRef(false);

  useEffect(() => {
    if (triedHydrate.current) return;
    triedHydrate.current = true;
    (async () => {
      try {
        const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });
        if (refreshed.ok) {
          const body = await refreshed.json();
          setAccessToken(body.data.accessToken);
          const me = await api.get('/api/auth/me');
          setUser(me.user);
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setAccessToken(null);
    });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await api.post('/api/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ email, password, name }) => {
    const data = await api.post('/api/auth/register', { email, password, name });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setAccessToken(null);
    setUser(null);
    router.push('/');
  }, [router]);

  const value = useMemo(() => ({ user, ready, login, register, logout }), [user, ready, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
