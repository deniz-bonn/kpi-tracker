import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, targetsApi } from '../utils/api';
import { currentMonat } from '../utils/format';

export default function Settings() {
  const qc = useQueryClient();
  const [companyForm, setCompanyForm] = useState({ name: '', standort: '' });
  const [targetForm, setTargetForm] = useState({ company_id: '', monat: currentMonat(), nk_ziel: '', bk_ziel: '', vl_ziel: '' });

  const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: companiesApi.list });
  const { data: targets = [] } = useQuery({ queryKey: ['targets'], queryFn: () => targetsApi.list({}) });

  const invalidateCompanies = () => qc.invalidateQueries({ queryKey: ['companies'] });
  const invalidateTargets = () => qc.invalidateQueries({ queryKey: ['targets'] });

  const createCompany = useMutation({ mutationFn: companiesApi.create, onSuccess: () => { invalidateCompanies(); setCompanyForm({ name: '', standort: '' }); } });
  const upsertTarget = useMutation({ mutationFn: targetsApi.upsert, onSuccess: () => { invalidateTargets(); } });

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">Einstellungen</h1>

      {/* Companies */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Companies verwalten</h2>
        <form onSubmit={e => { e.preventDefault(); createCompany.mutate(companyForm); }} className="flex gap-3 mb-4">
          <input required placeholder="Name" value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))}
            className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          <input placeholder="Standort" value={companyForm.standort} onChange={e => setCompanyForm(f => ({ ...f, standort: e.target.value }))}
            className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">Hinzufügen</button>
        </form>
        <div className="space-y-2">
          {companies.map(c => (
            <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
              <div>
                <span className="text-gray-800 text-sm font-medium">{c.name}</span>
                {c.standort && <span className="text-gray-500 text-xs ml-2">{c.standort}</span>}
              </div>
              <span className={`text-xs ${c.aktiv ? 'text-green-400' : 'text-gray-400'}`}>{c.aktiv ? 'Aktiv' : 'Inaktiv'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Monatsziele */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Monatsziele setzen</h2>
        <form onSubmit={e => { e.preventDefault(); upsertTarget.mutate(targetForm); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Company</label>
              <select required value={targetForm.company_id} onChange={e => setTargetForm(f => ({ ...f, company_id: e.target.value }))}
                className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5">
                <option value="">Wählen</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Monat</label>
              <input type="month" required value={targetForm.monat} onChange={e => setTargetForm(f => ({ ...f, monat: e.target.value }))}
                className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">NK-Ziel (€)</label>
              <input type="number" value={targetForm.nk_ziel} onChange={e => setTargetForm(f => ({ ...f, nk_ziel: e.target.value }))}
                className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">BK-Ziel (€)</label>
              <input type="number" value={targetForm.bk_ziel} onChange={e => setTargetForm(f => ({ ...f, bk_ziel: e.target.value }))}
                className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">VL-Ziel (€)</label>
              <input type="number" value={targetForm.vl_ziel} onChange={e => setTargetForm(f => ({ ...f, vl_ziel: e.target.value }))}
                className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
            </div>
          </div>
          <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">Ziel speichern</button>
        </form>

        {/* Targets Übersicht */}
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
    </div>
  );
}
