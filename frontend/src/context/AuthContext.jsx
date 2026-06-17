import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { featureFlagsApi } from '../utils/api';

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
  const [token, setToken]         = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]          = useState(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? parseJwt(t) : null;
  });
  const [loading, setLoading]     = useState(false);
  const [featureFlags, setFeatureFlags] = useState(null); // null = not yet loaded

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

  // Fetch feature flags whenever user changes
  useEffect(() => {
    if (!user) { setFeatureFlags(null); return; }
    featureFlagsApi.list()
      .then(flags => setFeatureFlags(flags))
      .catch(() => setFeatureFlags({})); // on error: empty flags = no extra access
  }, [user?.id]);

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
    setFeatureFlags(null);
  }, []);

  const refreshFeatureFlags = useCallback(() => {
    if (!user) return;
    featureFlagsApi.list()
      .then(flags => setFeatureFlags(flags))
      .catch(() => {});
  }, [user?.id]);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin      = user?.role === 'admin' || isSuperAdmin;
  const isBackoffice = user?.role === 'backoffice';
  const isVertriebsleitung = user?.role === 'vertriebsleitung';
  const canSeeNK     = ['admin','superadmin','nk_vertrieb','bk_vertrieb','backoffice','vertriebsleitung'].includes(user?.role);
  const canSeeBK     = ['admin','superadmin','bk_vertrieb','backoffice','vertriebsleitung'].includes(user?.role);
  const canSeeVL     = ['admin','superadmin','bk_vertrieb','backoffice','vertriebsleitung'].includes(user?.role);
  const canSeeAdmin  = isAdmin;
  const canSeeAll    = isAdmin || isBackoffice || isVertriebsleitung;
  // superadmin always has access; others need featureFlags loaded + role listed
  const canSeeKpiBeta = isSuperAdmin || (
    featureFlags !== null && (featureFlags['kpi_beta'] || []).includes(user?.role)
  );

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, loading,
      isSuperAdmin, isAdmin, isBackoffice, isVertriebsleitung,
      canSeeNK, canSeeBK, canSeeVL, canSeeAdmin, canSeeAll,
      canSeeKpiBeta, featureFlags, refreshFeatureFlags,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
