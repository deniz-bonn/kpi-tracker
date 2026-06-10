import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'kpi_token';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]    = useState(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? parseJwt(t) : null;
  });
  const [loading, setLoading] = useState(false);

  // Keep axios default header in sync
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Auto-logout on JWT expiry
  useEffect(() => {
    if (!token) return;
    const payload = parseJwt(token);
    if (!payload?.exp) return;
    const msLeft = payload.exp * 1000 - Date.now();
    if (msLeft <= 0) { logout(); return; }
    const timer = setTimeout(logout, msLeft);
    return () => clearTimeout(timer);
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem(TOKEN_KEY, t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin      = user?.role === 'admin';
  const isBackoffice = user?.role === 'backoffice';
  const canSeeNK     = ['admin','nk_vertrieb','bk_vertrieb','backoffice'].includes(user?.role);
  const canSeeBK     = ['admin','bk_vertrieb','backoffice'].includes(user?.role);
  const canSeeVL     = ['admin','bk_vertrieb','backoffice'].includes(user?.role);
  const canSeeAdmin  = isAdmin;
  const canSeeAll    = isAdmin || isBackoffice;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin, isBackoffice, canSeeNK, canSeeBK, canSeeVL, canSeeAdmin, canSeeAll }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
