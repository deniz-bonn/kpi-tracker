import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ALL_NAV = [
  { to: '/dashboard',           label: 'Dashboard',            icon: '📊', roles: ['admin','superadmin','nk_vertrieb','bk_vertrieb','backoffice'] },
  { to: '/neukunden',           label: 'Neukunden NK',          icon: '🟢', roles: ['admin','superadmin','nk_vertrieb','bk_vertrieb','backoffice'] },
  { to: '/bestandskunden',      label: 'Bestandskunden BK',     icon: '🔵', roles: ['admin','superadmin','bk_vertrieb','backoffice'] },
  { to: '/verlaengerungen',     label: 'Verlängerungen VL',     icon: '🔄', roles: ['admin','superadmin','bk_vertrieb','backoffice'] },
  { to: '/kuendigungen',        label: 'Kündigungen',            icon: '⚠️',  roles: ['admin','superadmin','bk_vertrieb','backoffice'] },
  { to: '/auswertung',          label: 'KPI Auswertung',        icon: '📋', roles: ['admin','superadmin','backoffice'] },
  { to: '/kpi-mitarbeiter',     label: 'KPI Mitarbeiter',       icon: '📈', roles: ['admin','superadmin','backoffice'] },
  { to: '/kpi-mitarbeiter-beta',label: 'KPI Mitarbeiter Beta',  icon: '🧪', feature: 'kpi_beta' },
  { to: '/mitarbeiter',         label: 'Mitarbeiter',           icon: '👥', roles: ['admin','superadmin','backoffice'] },
  { to: '/einstellungen',       label: 'Einstellungen',         icon: '⚙️',  roles: ['admin','superadmin','nk_vertrieb','bk_vertrieb','backoffice'] },
];

const ROLE_LABELS = {
  superadmin:  'Super Admin',
  admin:       'Admin',
  nk_vertrieb: 'NK-Vertrieb',
  bk_vertrieb: 'BK-Vertrieb',
  backoffice:  'Backoffice',
};

export default function Layout() {
  const { user, logout, canSeeKpiBeta } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany]     = useState('');
  const [sidebarOpen, setSidebar] = useState(false);
  const { data: companies = [] }  = useQuery({ queryKey: ['companies'], queryFn: companiesApi.list });

  const nav = ALL_NAV.filter(n => {
    if (n.feature === 'kpi_beta') return canSeeKpiBeta;
    return n.roles.includes(user?.role);
  });
  const close = () => setSidebar(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Mobile overlay ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={close} />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-[#2d2e30] border-r border-[#444]
        flex flex-col shrink-0 transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo + Close */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#444]">
          <span className="text-sm font-bold text-white tracking-wide">KPI Tracker</span>
          <button onClick={close} className="md:hidden text-gray-400 hover:text-white text-xl leading-none p-1">✕</button>
        </div>

        {/* Company filter */}
        <div className="px-3 py-3 border-b border-[#444]">
          <select value={company} onChange={e => { setCompany(e.target.value); close(); }}
            className="w-full bg-[#3c3c3c] border border-[#555] text-gray-200 text-xs rounded px-2 py-2">
            <option value="">Alle Companies</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#3c3c3c] hover:text-gray-100'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-[#444] px-3 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-left text-xs text-gray-400 hover:text-red-400 px-2 py-1.5 rounded hover:bg-[#3c3c3c] transition-colors">
            ← Abmelden
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#2d2e30] border-b border-[#444] shrink-0 z-30">
          <button onClick={() => setSidebar(true)}
            className="text-white text-2xl leading-none p-1 -ml-1" aria-label="Menü öffnen">☰</button>
          <span className="text-sm font-bold text-white flex-1">KPI Tracker</span>
          <select value={company} onChange={e => setCompany(e.target.value)}
            className="bg-[#3c3c3c] border border-[#555] text-gray-200 text-xs rounded px-2 py-1.5 max-w-[120px]">
            <option value="">Alle</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            <Outlet context={{ company, setCompany, companies }} />
          </div>
        </main>
      </div>
    </div>
  );
}
