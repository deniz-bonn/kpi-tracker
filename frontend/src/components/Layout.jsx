import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '../utils/api';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/neukunden', label: 'Neukunden NK', icon: '🟢' },
  { to: '/bestandskunden', label: 'Bestandskunden BK', icon: '🔵' },
  { to: '/verlaengerungen', label: 'Verlängerungen VL', icon: '🔄' },
  { to: '/auswertung', label: 'KPI Auswertung', icon: '📋' },
  { to: '/kpi-mitarbeiter', label: 'KPI Mitarbeiter', icon: '📈' },
  { to: '/mitarbeiter', label: 'Mitarbeiter', icon: '👥' },
  { to: '/einstellungen', label: 'Einstellungen', icon: '⚙️' },
];

export default function Layout() {
  const [company, setCompany] = useState('');
  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: companiesApi.list });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#2d2e30] border-r border-[#444] flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-[#444]">
          <span className="text-sm font-bold text-white tracking-wide">KPI Tracker</span>
        </div>

        {/* Company filter */}
        <div className="px-3 py-3 border-b border-[#444]">
          <select
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full bg-[#3c3c3c] border border-[#555] text-gray-200 text-xs rounded px-2 py-1.5"
          >
            <option value="">Alle Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-[#3c3c3c] hover:text-gray-100'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet context={{ company, setCompany, companies }} />
      </main>
    </div>
  );
}
