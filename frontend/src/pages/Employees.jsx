import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../utils/api';

const ROLLEN = ['KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi', 'Closer-KAM', 'Account Manager'];
const STANDORTE = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];

export default function Employees() {
  const { company, companies } = useOutletContext();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', company_id: company || '', rolle: '', standort: '', bk_gruppe: '' });
  const [editId, setEditId] = useState(null);
  const [showInaktiv, setShowInaktiv] = useState(false);
  const [dupWarn, setDupWarn] = useState(null); // { data, existing:[…], message } — Dubletten-Warnung beim Anlegen

  const params = { all: 1, ...(company && { company_id: company }) };
  const { data: employees = [] } = useQuery({ queryKey: ['employees', params], queryFn: () => employeesApi.list(params) });

  const emptyForm = { name: '', company_id: '', rolle: '', standort: '', bk_gruppe: '' };
  const invalidate = () => qc.invalidateQueries({ queryKey: ['employees'] });
  const createMut = useMutation({
    mutationFn: employeesApi.create,
    onSuccess: () => { invalidate(); setForm(emptyForm); setDupWarn(null); },
    onError: (err, variables) => {
      const d = err?.response?.data;
      // Härtung: Backend meldet 409 bei normalisiert gleichem Namen (auch inaktiv) -> Warnung anzeigen.
      if (err?.response?.status === 409 && d?.error === 'duplicate_name') setDupWarn({ data: variables, existing: d.existing || [], message: d.message });
      else alert(d?.message || d?.error || 'Fehler beim Anlegen');
    },
  });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => employeesApi.update(id, data), onSuccess: () => { invalidate(); setEditId(null); } });
  const toggleMut = useMutation({
    mutationFn: ({ id, aktiv, confirm }) => employeesApi.update(id, { aktiv, ...(confirm ? { confirm: true } : {}) }),
    onSuccess: invalidate,
    onError: (err, variables) => {
      const d = err?.response?.data;
      // Härtung: Backend meldet 409, wenn an dem MA noch Deals hängen -> mit Anzahl rückfragen, dann bestätigt wiederholen.
      if (err?.response?.status === 409 && d?.error === 'has_deals') {
        if (window.confirm(d.message)) toggleMut.mutate({ id: variables.id, aktiv: 0, confirm: true });
      } else alert(d?.message || d?.error || 'Fehler beim Aktualisieren');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // bk_gruppe nur fuer Multi mitschicken; sonst leeren (Gruppe ergibt sich dann aus der Rolle).
    const data = { ...form, bk_gruppe: form.rolle === 'Multi' ? form.bk_gruppe : '' };
    if (editId) updateMut.mutate({ id: editId, data });
    else { setDupWarn(null); createMut.mutate(data); }
  };
  // „Trotzdem neu anlegen" — Dubletten-Warnung bewusst übergehen.
  const proceedCreate = () => { if (dupWarn) createMut.mutate({ ...dupWarn.data, confirm: true }); };
  // „Reaktivieren statt neu anlegen" — bestehenden (inaktiven) Datensatz wieder aktiv setzen.
  const reactivateExisting = (id) => { toggleMut.mutate({ id, aktiv: 1 }); setDupWarn(null); setForm(emptyForm); };

  const aktive   = employees.filter(e => e.aktiv);
  const inaktive = employees.filter(e => !e.aktiv);

  const EmpRow = ({ e }) => (
    <tr key={e.id} className="hover:bg-gray-50">
      <td className="px-3 py-2 text-gray-900 font-medium">{e.name}</td>
      <td className="px-3 py-2 text-gray-600">{e.company_name}</td>
      <td className="px-3 py-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {e.rolle}{e.rolle === 'Multi' && e.bk_gruppe ? ` → ${e.bk_gruppe.toUpperCase()}` : ''}
        </span>
      </td>
      <td className="px-3 py-2 text-gray-500 text-xs">{e.standort || '—'}</td>
      <td className="px-3 py-2">
        <span className={`text-xs ${e.aktiv ? 'text-green-500' : 'text-gray-400'}`}>
          {e.aktiv ? 'Aktiv' : 'Inaktiv'}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-2">
          <button onClick={() => { setEditId(e.id); setForm({ name: e.name, company_id: e.company_id, rolle: e.rolle, standort: e.standort || '', bk_gruppe: e.bk_gruppe || '' }); }}
            className="text-gray-400 hover:text-blue-600 text-xs">Bearbeiten</button>
          <button onClick={() => toggleMut.mutate({ id: e.id, aktiv: e.aktiv ? 0 : 1 })}
            className="text-gray-400 hover:text-amber-600 text-xs">
            {e.aktiv ? 'Deaktivieren' : 'Aktivieren'}
          </button>
        </div>
      </td>
    </tr>
  );

  const THead = () => (
    <thead className="bg-[#2d2e30] text-gray-300 text-xs uppercase">
      <tr>
        {['Name','Company','Rolle','Standort','Status',''].map(h => (
          <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">Mitarbeiter</h1>
        {inaktive.length > 0 && (
          <button
            onClick={() => setShowInaktiv(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${
              showInaktiv
                ? 'bg-gray-200 border-gray-300 text-gray-700'
                : 'bg-white border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            <span>{showInaktiv ? '▲' : '▼'}</span>
            {inaktive.length} Inaktive {showInaktiv ? 'ausblenden' : 'anzeigen'}
          </button>
        )}
      </div>

      {/* Dubletten-Warnung beim Anlegen (Härtung gegen Fälle wie #55/#70) */}
      {dupWarn && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-amber-800">⚠️ Möglicher Dubletten-Mitarbeiter</div>
              <p className="text-xs text-amber-700 mt-0.5">{dupWarn.message}</p>
            </div>
            <button onClick={() => setDupWarn(null)} className="text-amber-500 hover:text-amber-700 text-xs">✕</button>
          </div>
          <div className="mt-3 space-y-1">
            {dupWarn.existing.map(x => (
              <div key={x.id} className="flex items-center justify-between gap-3 rounded border border-amber-200 bg-white px-3 py-1.5 text-xs">
                <span className="text-gray-700">
                  #{x.id} · <span className="font-medium">{x.name}</span> · {x.rolle}{x.standort ? ` · ${x.standort}` : ''} ·{' '}
                  <span className={x.aktiv ? 'text-green-600' : 'text-gray-400'}>{x.aktiv ? 'aktiv' : 'inaktiv'}</span>
                </span>
                {!x.aktiv && (
                  <button onClick={() => reactivateExisting(x.id)}
                    className="px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-white">Reaktivieren</button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={proceedCreate} className="px-3 py-1.5 text-xs rounded border border-amber-400 text-amber-800 hover:bg-amber-100">Trotzdem neu anlegen</button>
            <button onClick={() => setDupWarn(null)} className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-500 hover:bg-gray-50">Abbrechen</button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{editId ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}</h2>
        <div className="grid grid-cols-5 gap-3">
          <input required placeholder="Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          <select required value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5">
            <option value="">Company wählen</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select required value={form.rolle} onChange={e => setForm(f => ({ ...f, rolle: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5">
            <option value="">Rolle wählen</option>
            {ROLLEN.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={form.standort || ''} onChange={e => setForm(f => ({ ...f, standort: e.target.value }))}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5">
            <option value="">Standort wählen</option>
            {STANDORTE.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-3 py-1.5">
              {editId ? 'Speichern' : 'Hinzufügen'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ name: '', company_id: '', rolle: '', standort: '', bk_gruppe: '' }); }}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded">
                Abbrechen
              </button>
            )}
          </div>
        </div>
        {form.rolle === 'Multi' && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <label className="text-xs font-medium text-gray-600">BK-Auftragseingang zählt als:</label>
            <select value={form.bk_gruppe || ''} onChange={e => setForm(f => ({ ...f, bk_gruppe: e.target.value }))}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5">
              <option value="">— keine Zuordnung</option>
              <option value="kam">Key Account Manager</option>
              <option value="am">Account Manager</option>
            </select>
            <span className="text-[11px] text-gray-400">nur für Rolle „Multi" — bestimmt die Gruppe im Bestandskunden-Vergleich (KAM vs. AM)</span>
          </div>
        )}
      </form>

      {/* Aktive Mitarbeiter */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <THead />
          <tbody className="divide-y divide-gray-100">
            {aktive.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400 text-xs">Keine aktiven Mitarbeiter</td></tr>
            ) : aktive.map(e => <EmpRow key={e.id} e={e} />)}
          </tbody>
        </table>
      </div>

      {/* Archiv — Inaktive */}
      {showInaktiv && inaktive.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden opacity-70">
          <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Archiv — Inaktive Mitarbeiter</span>
          </div>
          <table className="w-full text-sm">
            <THead />
            <tbody className="divide-y divide-gray-100 bg-gray-50">
              {inaktive.map(e => <EmpRow key={e.id} e={e} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
