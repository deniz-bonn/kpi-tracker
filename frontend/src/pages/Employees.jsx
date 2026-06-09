import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../utils/api';

const ROLLEN = ['KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi'];
const STANDORTE = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];

export default function Employees() {
  const { company, companies } = useOutletContext();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', company_id: company || '', rolle: '', standort: '' });
  const [editId, setEditId] = useState(null);

  const params = { all: 1, ...(company && { company_id: company }) };
  const { data: employees = [] } = useQuery({ queryKey: ['employees', params], queryFn: () => employeesApi.list(params) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['employees'] });
  const createMut = useMutation({ mutationFn: employeesApi.create, onSuccess: () => { invalidate(); setForm({ name: '', company_id: '', rolle: '', standort: '' }); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => employeesApi.update(id, data), onSuccess: () => { invalidate(); setEditId(null); } });
  const toggleMut = useMutation({ mutationFn: ({ id, aktiv }) => employeesApi.update(id, { aktiv }), onSuccess: invalidate });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Mitarbeiter</h1>

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
              <button type="button" onClick={() => { setEditId(null); setForm({ name: '', company_id: '', rolle: '', standort: '' }); }}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded">
                Abbrechen
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2d2e30] text-gray-300 text-xs uppercase">
            <tr>
              {['Name','Company','Rolle','Standort','Status',''].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(e => (
              <tr key={e.id} className={`hover:bg-gray-50 ${!e.aktiv ? 'opacity-50' : ''}`}>
                <td className="px-3 py-2 text-gray-900 font-medium">{e.name}</td>
                <td className="px-3 py-2 text-gray-600">{e.company_name}</td>
                <td className="px-3 py-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{e.rolle}</span>
                </td>
                <td className="px-3 py-2 text-gray-500 text-xs">{e.standort || '—'}</td>
                <td className="px-3 py-2">
                  <span className={`text-xs ${e.aktiv ? 'text-green-400' : 'text-gray-400'}`}>
                    {e.aktiv ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditId(e.id); setForm({ name: e.name, company_id: e.company_id, rolle: e.rolle, standort: e.standort || '' }); }}
                      className="text-gray-400 hover:text-blue-600 text-xs">Bearbeiten</button>
                    <button onClick={() => toggleMut.mutate({ id: e.id, aktiv: e.aktiv ? 0 : 1 })}
                      className="text-gray-400 hover:text-amber-600 text-xs">
                      {e.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
