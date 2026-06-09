import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auswertungApi, employeesApi } from '../utils/api';
import { formatEuro, currentMonat } from '../utils/format';

// Eine KPI-Zeile
function KpiRow({ label, value, highlight = false, isPercent = false, isEuro = false }) {
  return (
    <tr className={highlight ? 'bg-gray-100' : 'hover:bg-gray-50'}>
      <td className="px-4 py-2 text-sm text-gray-600">{label}</td>
      <td className={`px-4 py-2 text-sm text-right font-semibold ${highlight ? 'text-gray-900' : 'text-gray-700'}`}>
        {value == null ? '—' : isEuro ? formatEuro(value) : isPercent ? `${value}%` : value}
      </td>
    </tr>
  );
}

// KPI-Block für einen Mitarbeiter oder Gesamt
function KpiBlock({ title, kpis, isNK = false, isHighlighted = false }) {
  if (!kpis) return null;
  return (
    <div className={`rounded-lg border overflow-hidden ${isHighlighted ? 'border-blue-400' : 'border-gray-200'}`}>
      <div className={`px-4 py-2.5 bg-[#2d2e30] border-b border-[#444]`}>
        <span className={`text-xs font-bold uppercase tracking-wider text-white`}>
          {title}
        </span>
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-gray-100">
          <KpiRow label="Angebote insgesamt" value={kpis.total} highlight />
          <KpiRow label="Angebote realisiert" value={kpis.gewonnen} />
          <KpiRow label="Angebote nicht realisiert" value={kpis.verloren} />
          {isNK ? (
            <>
              <KpiRow label="Angebote in Verhandlung" value={kpis.in_verhandlung} />
              <KpiRow label="Angebote in Closing Call 2" value={kpis.in_closing2} />
            </>
          ) : (
            <KpiRow label="Angebote offen" value={kpis.offen} />
          )}
          <KpiRow label="Realisierungsquote nach Angeboten" value={kpis.quote_angebote} isPercent highlight />
          <KpiRow label="Realisierung Angebotswert" value={kpis.ae_summe} isEuro />
          <KpiRow label="Realisierungsquote nach Angebotswert" value={kpis.quote_wert} isPercent />
          <KpiRow label="Angebotswert insgesamt" value={kpis.angebotswert_gesamt} isEuro highlight />
          <KpiRow label="Wert offener Angebote" value={kpis.wert_offen} isEuro />
          {isNK && (
            <>
              <KpiRow label="Angebote realisiert Cold Calling" value={kpis.gewonnen_cc} />
              <KpiRow label="Angebote realisiert Mail" value={kpis.gewonnen_mail} />
              <KpiRow label="Angebote realisiert Fax" value={kpis.gewonnen_fax} />
              <KpiRow label="Realisierte Angebote mit AV in %" value={kpis.quote_mit_av} isPercent highlight />
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Auswertung() {
  const { company } = useOutletContext();
  const [monat, setMonat] = useState(currentMonat());
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [standort, setStandort] = useState('');
  const [closerId, setCloserId] = useState('');
  const [kamId, setKamId] = useState('');
  const [tab, setTab] = useState('nk');

  const baseParams = {
    ...(company && { company_id: company }),
    ...(!showAllMonths && { monat }),
    ...(standort && { standort }),
  };

  const nkParams = { ...baseParams, ...(closerId && { closer_id: closerId }) };
  const bkParams = { ...baseParams, ...(kamId && { kam_id: kamId }) };

  const { data: nkData } = useQuery({
    queryKey: ['auswertung-nk', nkParams],
    queryFn: () => auswertungApi.nk(nkParams),
    staleTime: 0, refetchOnMount: 'always',
  });

  const { data: bkData } = useQuery({
    queryKey: ['auswertung-bk', bkParams],
    queryFn: () => auswertungApi.bk(bkParams),
    staleTime: 0, refetchOnMount: 'always',
  });

  const { data: vlData } = useQuery({
    queryKey: ['auswertung-vl', bkParams],
    queryFn: () => auswertungApi.vl(bkParams),
    staleTime: 0, refetchOnMount: 'always',
  });

  const { data: standorte = [] } = useQuery({
    queryKey: ['standorte'],
    queryFn: auswertungApi.standorte,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
  });

  const closer = employees.filter(e => ['NKV-Closer', 'Multi'].includes(e.rolle));
  const kams = employees.filter(e => ['KAM', 'Multi'].includes(e.rolle));

  const activeData = tab === 'nk' ? nkData : tab === 'bk' ? bkData : vlData;
  const isNK = tab === 'nk';
  const mitarbeiterKey = isNK ? 'nach_closer' : 'nach_kam';

  return (
    <div className="space-y-5">
      {/* Header + Filter */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-xl font-bold text-gray-800">KPI Auswertung</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showAllMonths} onChange={e => setShowAllMonths(e.target.checked)} className="accent-blue-500" />
            Alle Monate
          </label>
          {!showAllMonths && (
            <input type="month" value={monat} onChange={e => setMonat(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5" />
          )}
          <select value={standort} onChange={e => setStandort(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5">
            <option value="">Alle Standorte</option>
            {standorte.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {tab === 'nk' && (
            <select value={closerId} onChange={e => setCloserId(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5">
              <option value="">Alle Closer</option>
              {closer.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          {(tab === 'bk' || tab === 'vl') && (
            <select value={kamId} onChange={e => setKamId(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5">
              <option value="">Alle KAMs</option>
              {kams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[['nk','Neukunden NK'],['bk','Bestandskunden BK'],['vl','Verlängerungen VL']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              tab === key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Gesamt-Block */}
      {activeData?.gesamt && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gesamt</h2>
          <div className="max-w-sm">
            <KpiBlock title="Gesamt" kpis={activeData.gesamt} isNK={isNK} isHighlighted />
          </div>
        </div>
      )}

      {/* Pro Mitarbeiter */}
      {activeData?.[mitarbeiterKey]?.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {isNK ? 'Nach Closer' : 'Nach Account Manager'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeData[mitarbeiterKey].map(emp => (
              <KpiBlock
                key={emp.id}
                title={`${emp.name}${emp.standort ? ` · ${emp.standort}` : ''}`}
                kpis={emp}
                isNK={isNK}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
