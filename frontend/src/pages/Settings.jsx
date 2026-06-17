import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, targetsApi, adminApi, auditApi, employeesApi, featureFlagsApi } from '../utils/api';
import { currentMonat } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ROLE_OPTS = [
  { value: 'superadmin',       label: 'Super Admin' },
  { value: 'admin',            label: 'Admin' },
  { value: 'vertriebsleitung', label: 'Vertriebsleitung' },
  { value: 'nk_vertrieb',      label: 'NK-Vertrieb' },
  { value: 'bk_vertrieb',      label: 'BK-Vertrieb' },
  { value: 'backoffice',       label: 'Backoffice' },
];
const ROLE_LABELS = { superadmin:'Super Admin', admin:'Admin', vertriebsleitung:'Vertriebsleitung', nk_vertrieb:'NK-Vertrieb', bk_vertrieb:'BK-Vertrieb', backoffice:'Backoffice' };

// ── Zugriffssteuerung (superadmin only) ────────────────────────────────────
const CONTROLLED_FEATURES = [
  { key: 'kpi_beta', label: 'KPI Mitarbeiter Beta', desc: 'Beta-Dashboard mit täglichem Activity-Tracking' },
];
const CONTROLLABLE_ROLES = [
  { value: 'admin',            label: 'Admin' },
  { value: 'vertriebsleitung', label: 'Vertriebsleitung' },
  { value: 'backoffice',       label: 'Backoffice' },
  { value: 'bk_vertrieb',      label: 'BK-Vertrieb' },
  { value: 'nk_vertrieb',      label: 'NK-Vertrieb' },
];

function AccessControlSection() {
  const { refreshFeatureFlags } = useAuth();
  const qc = useQueryClient();
  const [localFlags, setLocalFlags] = useState({});
  const [savedOk,    setSavedOk]    = useState(null);

  const { data: flags = {}, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn:  featureFlagsApi.list,
  });

  useEffect(() => { setLocalFlags(flags); }, [flags]);

  const saveMut = useMutation({
    mutationFn: ({ feature, roles }) => featureFlagsApi.update(feature, roles),
    onSuccess: (_, { feature }) => {
      qc.invalidateQueries({ queryKey: ['feature-flags'] });
      refreshFeatureFlags();
      setSavedOk(feature);
      setTimeout(() => setSavedOk(null), 2000);
    },
  });

  const toggle = (feature, role) => {
    setLocalFlags(prev => {
      const cur = prev[feature] || [];
      return { ...prev, [feature]: cur.includes(role) ? cur.filter(r => r !== role) : [...cur, role] };
    });
  };

  if (isLoading) return <div className="text-sm text-gray-400 py-4">Lade...</div>;

  return (
    <div className="space-y-4">
      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded px-3 py-2">
        Superadmin hat immer vollen Zugang — unabhängig von diesen Einstellungen.
      </div>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-[#2d2e30] px-4 py-3 border-b border-[#444]">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Feature-Zugänge nach Rolle</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Funktion</th>
              {CONTROLLABLE_ROLES.map(r => (
                <th key={r.value} className="px-3 py-2.5 text-center text-xs text-gray-500 font-medium">{r.label}</th>
              ))}
              <th className="px-4 py-2.5 w-28"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CONTROLLED_FEATURES.map(feat => (
              <tr key={feat.key} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-800">{feat.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{feat.desc}</div>
                </td>
                {CONTROLLABLE_ROLES.map(role => (
                  <td key={role.value} className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={(localFlags[feat.key] || []).includes(role.value)}
                      onChange={() => toggle(feat.key, role.value)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => saveMut.mutate({ feature: feat.key, roles: localFlags[feat.key] || [] })}
                    disabled={saveMut.isPending}
                    className={`text-xs px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                      savedOk === feat.key
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {savedOk === feat.key ? '✓ Gespeichert' : 'Speichern'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ACTION_LABELS = { create: 'Erstellt', update: 'Bearbeitet', delete: 'Gelöscht', undo: 'Rückgängig' };
const ACTION_COLORS = { create:'text-green-600', update:'text-blue-600', delete:'text-red-600', undo:'text-amber-600' };

export default function Settings() {
  const { user: me, isAdmin, isSuperAdmin } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState(() => isSuperAdmin ? 'access' : isAdmin ? 'users' : 'password');

  // ── Password change ───────────────────────────────────────────────────────
  const [pwForm, setPwForm]   = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwMsg,  setPwMsg]    = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.new_password !== pwForm.confirm) { setPwMsg({ err: 'Passwörter stimmen nicht überein' }); return; }
    if (pwForm.new_password.length < 8) { setPwMsg({ err: 'Mindestens 8 Zeichen' }); return; }
    try {
      await axios.post('/api/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwMsg({ ok: 'Passwort geändert!' });
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwMsg({ err: err.response?.data?.error || 'Fehler' });
    }
  };

  // ── Company + Targets (admin only) ──────────────────────────────────────
  const [companyForm, setCompanyForm] = useState({ name: '', standort: '' });
  const [targetForm,  setTargetForm]  = useState({ company_id: '', monat: currentMonat(), nk_ziel: '', bk_ziel: '', vl_ziel: '' });

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: companiesApi.list });
  const { data: targets   = [] } = useQuery({ queryKey: ['targets'],   queryFn: () => targetsApi.list({}) });

  const createCompany = useMutation({ mutationFn: companiesApi.create, onSuccess: () => { qc.invalidateQueries({queryKey:['companies']}); setCompanyForm({name:'',standort:''}); } });
  const upsertTarget  = useMutation({ mutationFn: targetsApi.upsert,   onSuccess: () => { qc.invalidateQueries({queryKey:['targets']}); } });

  // ── User management (admin only) ──────────────────────────────────────────
  const [userForm,    setUserForm]   = useState({ email: '', name: '', role: 'nk_vertrieb', employee_id: '' });
  const [userMsg,     setUserMsg]    = useState(null);
  const [inviteLink,  setInviteLink] = useState(null);
  const [editUser,    setEditUser]   = useState(null);
  const [resetPwId,   setResetPwId]  = useState(null);
  const [resetPwVal,  setResetPwVal] = useState('');

  const { data: users     = [] } = useQuery({ queryKey: ['admin-users'], queryFn: adminApi.listUsers, enabled: isAdmin });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'],   queryFn: () => employeesApi.list() });

  const createUser = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: (data) => {
      qc.invalidateQueries({queryKey:['admin-users']});
      setUserForm({ email:'', name:'', role:'nk_vertrieb', employee_id:'' });
      if (data.invite_link) {
        setInviteLink(data.invite_link);
        setUserMsg({ ok: 'Benutzer angelegt. Kein SMTP konfiguriert — Link unten kopieren und manuell verschicken.' });
      } else {
        setInviteLink(null);
        setUserMsg({ ok: 'Einladungs-E-Mail wurde gesendet!' });
      }
    },
    onError: (err) => setUserMsg({ err: err.response?.data?.error || 'Fehler' }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({queryKey:['admin-users']}); setEditUser(null); },
  });

  const resetUserPw = async (id) => {
    if (!resetPwVal || resetPwVal.length < 8) { alert('Mindestens 8 Zeichen'); return; }
    await adminApi.resetPassword(id, resetPwVal);
    setResetPwId(null);
    setResetPwVal('');
    alert('Passwort zurückgesetzt!');
  };

  const resendInvite = async (id) => {
    const data = await adminApi.resendInvite(id);
    if (data.invite_link) {
      setInviteLink(data.invite_link);
      setUserMsg({ ok: 'Neuer Link generiert. Kein SMTP konfiguriert — Link unten kopieren und manuell verschicken.' });
    } else {
      setInviteLink(null);
      setUserMsg({ ok: 'Neue Einladungs-E-Mail wurde gesendet!' });
    }
  };

  // ── KPI visibility (superadmin only) ─────────────────────────────────────
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees-all'],
    queryFn: () => employeesApi.list({ all: 1 }),
    enabled: isSuperAdmin && tab === 'kpi_visibility',
  });

  const kpiVisibilityMut = useMutation({
    mutationFn: ({ id, show_in_kpi }) => employeesApi.update(id, { show_in_kpi }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees-all'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  // ── Online users (superadmin only) ───────────────────────────────────────
  const { data: onlineUsers = [], dataUpdatedAt: onlineUpdatedAt } = useQuery({
    queryKey: ['online-users'],
    queryFn: adminApi.onlineUsers,
    enabled: isSuperAdmin && tab === 'online',
    refetchInterval: 15_000,
  });

  // ── Audit log (admin only) ────────────────────────────────────────────────
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'], queryFn: () => auditApi.list({ limit: 50 }), enabled: isAdmin && tab === 'audit',
  });

  const undoAudit = useMutation({
    mutationFn: (id) => auditApi.undo(id),
    onSuccess: () => { qc.invalidateQueries({queryKey:['audit-logs']}); qc.invalidateQueries({queryKey:['deals-nk']}); qc.invalidateQueries({queryKey:['deals-bk']}); qc.invalidateQueries({queryKey:['deals-vl']}); },
  });

  const TABS = [
    ...(isSuperAdmin ? [
      { id: 'access',         label: 'Zugriffssteuerung' },
      { id: 'kpi_visibility', label: 'KPI-Mitarbeiter' },
      { id: 'online',         label: 'Online' },
    ] : []),
    ...(isAdmin ? [
      { id: 'users',     label: 'Benutzer' },
      { id: 'companies', label: 'Companies' },
      { id: 'targets',   label: 'Monatsziele' },
      { id: 'audit',     label: 'Änderungslog' },
    ] : []),
    { id: 'password', label: 'Passwort' },
  ];

  const inp = "w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5";

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-800">Einstellungen</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Zugriffssteuerung ─────────────────────────────────── */}
      {tab === 'access' && isSuperAdmin && <AccessControlSection />}

      {/* ── TAB: Benutzer ──────────────────────────────────────────── */}
      {tab === 'users' && isAdmin && (
        <div className="space-y-6">
          {/* Create user */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Neuen Benutzer einladen</h2>
            {userMsg && (
              <div className={`text-xs rounded px-3 py-2 mb-3 ${userMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {userMsg.ok || userMsg.err}
              </div>
            )}
            {inviteLink && (
              <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-amber-800">Einladungslink (manuell versenden)</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(inviteLink); }}
                    className="text-xs text-amber-700 hover:text-amber-900 border border-amber-300 rounded px-2 py-0.5 bg-white hover:bg-amber-100"
                  >
                    Kopieren
                  </button>
                </div>
                <div className="text-xs text-amber-900 break-all font-mono bg-white border border-amber-200 rounded px-2 py-1.5 select-all">
                  {inviteLink}
                </div>
                <p className="text-[11px] text-amber-700 mt-1.5">
                  Tipp: SMTP-Zugangsdaten in Railway unter Variables konfigurieren (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL), damit Einladungen automatisch per E-Mail versendet werden.
                </p>
              </div>
            )}
            <form onSubmit={e => { e.preventDefault(); createUser.mutate(userForm); }} className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">E-Mail *</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm(f=>({...f,email:e.target.value}))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Name *</label>
                <input required value={userForm.name} onChange={e => setUserForm(f=>({...f,name:e.target.value}))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Rolle *</label>
                <select required value={userForm.role} onChange={e => setUserForm(f=>({...f,role:e.target.value}))} className={inp}>
                  {ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Mitarbeiter verknüpfen</label>
                <select value={userForm.employee_id} onChange={e => setUserForm(f=>({...f,employee_id:e.target.value}))} className={inp}>
                  <option value="">— keiner —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <button type="submit" disabled={createUser.isPending}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">
                  Einladung senden
                </button>
              </div>
            </form>
          </section>

          {/* User list */}
          <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Alle Benutzer</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {users.map(u => (
                <div key={u.id} className="px-5 py-3">
                  {editUser?.id === u.id ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Name</label>
                        <input value={editUser.name} onChange={e => setEditUser(f=>({...f,name:e.target.value}))} className={inp} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Rolle</label>
                        <select value={editUser.role} onChange={e => setEditUser(f=>({...f,role:e.target.value}))} className={inp}>
                          {ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Mitarbeiter</label>
                        <select value={editUser.employee_id || ''} onChange={e => setEditUser(f=>({...f,employee_id:e.target.value}))} className={inp}>
                          <option value="">— keiner —</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Status</label>
                        <select value={editUser.active ? '1' : '0'} onChange={e => setEditUser(f=>({...f,active:e.target.value==='1'}))} className={inp}>
                          <option value="1">Aktiv</option>
                          <option value="0">Deaktiviert</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button onClick={() => updateUser.mutate({ id: u.id, data: { name: editUser.name, role: editUser.role, employee_id: editUser.employee_id || null, active: editUser.active } })}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded">Speichern</button>
                        <button onClick={() => setEditUser(null)} className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded">Abbrechen</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{u.name}</span>
                          {!u.active && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Deaktiviert</span>}
                          {u.invite_token && <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">Einladung ausstehend</span>}
                        </div>
                        <p className="text-xs text-gray-500">{u.email} · {ROLE_LABELS[u.role]} {u.employee_name && `· ${u.employee_name}`}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {u.invite_token && (
                          <button onClick={() => resendInvite(u.id)} className="text-xs text-blue-600 hover:underline px-2 py-1">Neu senden</button>
                        )}
                        {resetPwId === u.id ? (
                          <div className="flex gap-1">
                            <input type="password" placeholder="Neues PW" value={resetPwVal} onChange={e => setResetPwVal(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-xs w-28" />
                            <button onClick={() => resetUserPw(u.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">OK</button>
                            <button onClick={() => { setResetPwId(null); setResetPwVal(''); }} className="text-xs text-gray-400 px-1">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setResetPwId(u.id)} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1">PW setzen</button>
                        )}
                        <button onClick={() => setEditUser({...u})} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1">Bearbeiten</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── TAB: Companies ─────────────────────────────────────────── */}
      {tab === 'companies' && isAdmin && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Companies verwalten</h2>
          <form onSubmit={e => { e.preventDefault(); createCompany.mutate(companyForm); }} className="flex gap-3 mb-4">
            <input required placeholder="Name" value={companyForm.name} onChange={e => setCompanyForm(f=>({...f,name:e.target.value}))} className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
            <input placeholder="Standort" value={companyForm.standort} onChange={e => setCompanyForm(f=>({...f,standort:e.target.value}))} className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">Hinzufügen</button>
          </form>
          <div className="space-y-2">
            {companies.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <div>
                  <span className="text-gray-800 text-sm font-medium">{c.name}</span>
                  {c.standort && <span className="text-gray-500 text-xs ml-2">{c.standort}</span>}
                </div>
                <span className={`text-xs ${c.aktiv ? 'text-green-500' : 'text-gray-400'}`}>{c.aktiv ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB: Monatsziele ───────────────────────────────────────── */}
      {tab === 'targets' && isAdmin && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monatsziele setzen</h2>
          <form onSubmit={e => { e.preventDefault(); upsertTarget.mutate(targetForm); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Company</label>
                <select required value={targetForm.company_id} onChange={e => setTargetForm(f=>({...f,company_id:e.target.value}))} className={inp}>
                  <option value="">Wählen</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Monat</label>
                <input type="month" required value={targetForm.monat} onChange={e => setTargetForm(f=>({...f,monat:e.target.value}))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">NK-Ziel (€)</label>
                <input type="number" value={targetForm.nk_ziel} onChange={e => setTargetForm(f=>({...f,nk_ziel:e.target.value}))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">BK-Ziel (€)</label>
                <input type="number" value={targetForm.bk_ziel} onChange={e => setTargetForm(f=>({...f,bk_ziel:e.target.value}))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">VL-Ziel (€)</label>
                <input type="number" value={targetForm.vl_ziel} onChange={e => setTargetForm(f=>({...f,vl_ziel:e.target.value}))} className={inp} />
              </div>
            </div>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">Ziel speichern</button>
          </form>
          {targets.length > 0 && (
            <div className="mt-4 space-y-2">
              {targets.slice(0, 10).map(t => (
                <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
                  <span className="text-gray-700">{t.company_name} · {t.monat}</span>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>NK: <span className="text-gray-800">{t.nk_ziel ? `€${Number(t.nk_ziel).toLocaleString('de-DE')}` : '—'}</span></span>
                    <span>BK: <span className="text-gray-800">{t.bk_ziel ? `€${Number(t.bk_ziel).toLocaleString('de-DE')}` : '—'}</span></span>
                    <span>VL: <span className="text-gray-800">{t.vl_ziel ? `€${Number(t.vl_ziel).toLocaleString('de-DE')}` : '—'}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── TAB: KPI-Mitarbeiter Sichtbarkeit ─────────────────────── */}
      {tab === 'kpi_visibility' && isSuperAdmin && (
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">KPI-Mitarbeiter Sichtbarkeit</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Legt fest, welche Mitarbeiter in „KPI Mitarbeiter" und „KPI Mitarbeiter Beta" erfasst werden.
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {allEmployees.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-gray-400">Lade...</div>
            )}
            {allEmployees.map(emp => {
              const visible = emp.show_in_kpi !== 0 && emp.show_in_kpi !== false;
              return (
                <div key={emp.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className={`text-sm font-medium ${emp.aktiv ? 'text-gray-800' : 'text-gray-400'}`}>{emp.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{emp.rolle} · {emp.company_name}</span>
                    {!emp.aktiv && (
                      <span className="ml-2 text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Inaktiv</span>
                    )}
                  </div>
                  <button
                    onClick={() => kpiVisibilityMut.mutate({ id: emp.id, show_in_kpi: visible ? 0 : 1 })}
                    disabled={kpiVisibilityMut.isPending}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded border font-medium transition-colors disabled:opacity-50 ${
                      visible
                        ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {visible ? '✓ Erfasst' : 'Ausgeblendet'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── TAB: Online ────────────────────────────────────────────── */}
      {tab === 'online' && isSuperAdmin && (
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              <h2 className="text-sm font-semibold text-gray-700">
                Gerade online — {onlineUsers.length} {onlineUsers.length === 1 ? 'Benutzer' : 'Benutzer'}
              </h2>
            </div>
            <span className="text-xs text-gray-400">
              Aktualisiert alle 15 Sek. · Schwellenwert: 3 Min.
            </span>
          </div>
          {onlineUsers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              Keine aktiven Benutzer im Moment.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {onlineUsers.map(u => {
                const seenAgo = onlineUpdatedAt && u.last_seen
                  ? Math.round((onlineUpdatedAt - new Date(u.last_seen).getTime()) / 1000)
                  : null;
                return (
                  <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email} · {ROLE_LABELS[u.role] || u.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                      {seenAgo !== null && seenAgo < 60
                        ? `vor ${seenAgo}s`
                        : seenAgo !== null
                        ? `vor ${Math.round(seenAgo / 60)}m`
                        : 'aktiv'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── TAB: Änderungslog ──────────────────────────────────────── */}
      {tab === 'audit' && isAdmin && (
        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Änderungsprotokoll (letzte 50)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Zeit</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Benutzer</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Aktion</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Typ</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">ID</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">{new Date(log.created_at).toLocaleString('de-DE')}</td>
                    <td className="px-4 py-2 text-gray-700">{log.user_name || '—'}</td>
                    <td className={`px-4 py-2 font-medium ${ACTION_COLORS[log.action] || 'text-gray-600'}`}>{ACTION_LABELS[log.action] || log.action}</td>
                    <td className="px-4 py-2 text-gray-600 uppercase">{log.entity_type}</td>
                    <td className="px-4 py-2 text-gray-500">#{log.entity_id}</td>
                    <td className="px-4 py-2">
                      {log.action === 'update' && log.old_data && (
                        <button onClick={() => { if(confirm('Änderung rückgängig machen?')) undoAudit.mutate(log.id); }}
                          className="text-xs text-amber-600 hover:text-amber-800 hover:underline">↩ Rückgängig</button>
                      )}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Keine Einträge</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── TAB: Passwort ──────────────────────────────────────────── */}
      {tab === 'password' && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 max-w-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Passwort ändern</h2>
          {pwMsg && (
            <div className={`text-xs rounded px-3 py-2 mb-3 ${pwMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {pwMsg.ok || pwMsg.err}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Aktuelles Passwort</label>
              <input type="password" required value={pwForm.current_password} onChange={e => setPwForm(f=>({...f,current_password:e.target.value}))} className={inp} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Neues Passwort</label>
              <input type="password" required value={pwForm.new_password} onChange={e => setPwForm(f=>({...f,new_password:e.target.value}))} className={inp} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Passwort wiederholen</label>
              <input type="password" required value={pwForm.confirm} onChange={e => setPwForm(f=>({...f,confirm:e.target.value}))} className={inp} />
            </div>
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">Passwort ändern</button>
          </form>
        </section>
      )}
    </div>
  );
}
