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
  const [featureFlags, setFeatureFlags] = useState(null); // null = not yet loaded (feature -> [role])
  const [userFeatures, setUserFeatures] = useState([]);   // Features, für die DIESER User einzeln freigeschaltet ist

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

  // Fetch feature flags whenever user changes. Response: { flags, userFeatures }.
  useEffect(() => {
    if (!user) { setFeatureFlags(null); setUserFeatures([]); return; }
    featureFlagsApi.list()
      .then(data => { setFeatureFlags(data?.flags || {}); setUserFeatures(data?.userFeatures || []); })
      .catch(() => { setFeatureFlags({}); setUserFeatures([]); }); // on error: no extra access
  }, [user?.id]);

  // Heartbeat: keep last_seen fresh while the tab is open
  useEffect(() => {
    if (!user) return;
    const ping = () => axios.post('/api/auth/ping').catch(() => {});
    ping();
    const id = setInterval(ping, 30_000);
    return () => clearInterval(id);
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
      .then(data => { setFeatureFlags(data?.flags || {}); setUserFeatures(data?.userFeatures || []); })
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
  // Zentraler Feature-Check (spiegelt requireFeature im Backend): Zugriff über die Rolle
  // ODER über eine personenscharfe Einzel-Freischaltung (userFeatures). Additiv, kein Deny.
  const roleHasFeature = (key) => featureFlags !== null && (featureFlags[key] || []).includes(user?.role);
  const userHasFeature = (key) => (userFeatures || []).includes(key);
  // superadmin always has access; others: Rolle freigeschaltet ODER einzeln freigeschaltet
  const canSeeKpiBeta = isSuperAdmin || roleHasFeature('kpi_beta') || userHasFeature('kpi_beta');
  // admins always see backup; other roles depend on the feature flag / individual grant
  const canSeeBackup = isAdmin || roleHasFeature('backup') || userHasFeature('backup');
  // Bestenliste (Beta): out-of-the-box nur Superadmin; weitere via Rolle oder Einzel-Freischaltung.
  const canSeeBestenliste = isSuperAdmin || roleHasFeature('bestenliste') || userHasFeature('bestenliste');
  // Provisionen (Beta): out-of-the-box nur Superadmin; weitere via Rolle oder Einzel-Freischaltung.
  const canSeeProvisionen = isSuperAdmin || roleHasFeature('provisionen') || userHasFeature('provisionen');
  // Show Rates (Close): out-of-the-box nur Superadmin; weitere via Rolle oder Einzel-Freischaltung.
  const canSeeShowRates = isSuperAdmin || roleHasFeature('show_rates_close') || userHasFeature('show_rates_close');
  // Admin-Sicht der Provisionen (Gesamtübersicht/Abschluss): zusätzlich Rolle Admin/Vertriebsleitung.
  const canSeeProvisionenAdmin = canSeeProvisionen && (isAdmin || isVertriebsleitung);

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, loading,
      isSuperAdmin, isAdmin, isBackoffice, isVertriebsleitung,
      canSeeNK, canSeeBK, canSeeVL, canSeeAdmin, canSeeAll,
      canSeeKpiBeta, canSeeBackup, canSeeBestenliste,
      canSeeProvisionen, canSeeProvisionenAdmin, canSeeShowRates, featureFlags, userFeatures, refreshFeatureFlags,
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
