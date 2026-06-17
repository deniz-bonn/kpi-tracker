import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { kpisApi } from '../utils/api';
import { formatEuro, currentMonat } from '../utils/format';

function EmpTable({ title, rows, showAE = false, color = 'blue' }) {
  const headerColors = { blue: 'text-blue-400', green: 'text-green-400', purple: 'text-purple-400', amber: 'text-amber-400' };
  if (!rows?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-[#2d2e30] px-4 py-2.5 border-b border-[#444]">
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${headerColors[color]}`}>{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-[#3a3a3a] text-gray-300 text-xs">
          <tr>
            <th className="px-4 py-2 text-left">Mitarbeiter</th>
            <th className="px-3 py-2 text-center">Erstellt</th>
            <th className="px-3 py-2 text-center text-green-400">Gewonnen</th>
            <th className="px-3 py-2 text-center text-red-400">Verloren</th>
            <th className="px-3 py-2 text-center text-amber-400">Offen</th>
            <th className="px-3 py-2 text-center">Quote</th>
            {showAE && <th className="px-3 py-2 text-right">AE-Wert</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-2.5 text-gray-900 font-medium">{r.name}</td>
              <td className="px-3 py-2.5 text-center text-gray-600">{r.total}</td>
              <td className="px-3 py-2.5 text-center text-green-600 font-semibold">{r.gewonnen}</td>
              <td className="px-3 py-2.5 text-center text-red-600">{r.verloren}</td>
              <td className="px-3 py-2.5 text-center text-amber-600">{r.offen}</td>
              <td className="px-3 py-2.5 text-center">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  r.quote >= 60 ? 'bg-green-100 text-green-700' :
                  r.quote >= 40 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {r.quote}%
                </span>
              </td>
              {showAE && (
                <td className="px-3 py-2.5 text-right text-gray-900 font-semibold">{formatEuro(r.ae_summe)}</td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-gray-200 bg-gray-50">
          <tr>
            <td className="px-4 py-2 text-gray-500 text-xs">Gesamt</td>
            <td className="px-3 py-2 text-center text-gray-600 text-xs">{rows.reduce((s,r)=>s+r.total,0)}</td>
            <td className="px-3 py-2 text-center text-green-600 text-xs font-semibold">{rows.reduce((s,r)=>s+r.gewonnen,0)}</td>
            <td className="px-3 py-2 text-center text-red-600 text-xs">{rows.reduce((s,r)=>s+r.verloren,0)}</td>
            <td className="px-3 py-2 text-center text-amber-600 text-xs">{rows.reduce((s,r)=>s+r.offen,0)}</td>
            <td className="px-3 py-2 text-center text-xs">
              {(() => {
                const t = rows.reduce((s,r)=>s+r.total,0);
                const g = rows.reduce((s,r)=>s+r.gewonnen,0);
                return t > 0 ? `${Math.round(g/t*100)}%` : '—';
              })()}
            </td>
            {showAE && (
              <td className="px-3 py-2 text-right text-gray-900 text-xs font-bold">
                {formatEuro(rows.reduce((s,r)=>s+r.ae_summe,0))}
              </td>
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SectionSummary({ rows, showAE, color }) {
  if (!rows?.length) return null;
  const total    = rows.reduce((s, r) => s + r.total, 0);
  const gewonnen = rows.reduce((s, r) => s + r.gewonnen, 0);
  const verloren = rows.reduce((s, r) => s + r.verloren, 0);
  const quote    = total > 0 ? Math.round(gewonnen / total * 100) : 0;
  const ae       = rows.reduce((s, r) => s + (r.ae_summe || 0), 0);

  const c = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-900',   label: 'text-blue-600' },
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-900',  label: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', label: 'text-purple-600' },
  }[color];

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} px-4 py-2.5 flex flex-wrap gap-x-8 gap-y-1.5`}>
      <span className={`text-xs ${c.label}`}>Erstellt: <strong className={c.text}>{total}</strong></span>
      <span className={`text-xs ${c.label}`}>Gewonnen: <strong className="text-green-700">{gewonnen}</strong></span>
      <span className={`text-xs ${c.label}`}>Verloren: <strong className="text-red-600">{verloren}</strong></span>
      <span className={`text-xs ${c.label}`}>Quote: <strong className={c.text}>{quote}%</strong></span>
      {showAE && ae > 0 && (
        <span className={`text-xs ${c.label}`}>AE: <strong className={c.text}>{formatEuro(ae)}</strong></span>
      )}
    </div>
  );
}

const SECTION_HEADER = {
  blue:   'bg-blue-700',
  green:  'bg-green-700',
  purple: 'bg-purple-700',
};

export default function KpiMitarbeiter() {
  const { company } = useOutletContext();
  const [monat, setMonat] = useState(currentMonat());
  const [showAllMonths, setShowAllMonths] = useState(false);

  const params = {
    ...(company && { company_id: company }),
    ...(showAllMonths ? { year: monat.split('-')[0] } : { monat }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['kpis-employees', params],
    queryFn: () => kpisApi.employees(params),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const hasNK = data?.nk_closer?.length || data?.nk_opener?.length || data?.nk_setter?.length;
  const hasBK = data?.bk_kam?.length;
  const hasVL = data?.vl_kam?.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">KPIs nach Mitarbeiter</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showAllMonths} onChange={e => setShowAllMonths(e.target.checked)} className="accent-blue-500" />
            Ganzes Jahr {monat.split('-')[0]}
          </label>
          {!showAllMonths && (
            <input type="month" value={monat} onChange={e => setMonat(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Lade...</div>
      ) : (
        <div className="space-y-7">

          {/* ── NK ──────────────────────────────────────── */}
          {hasNK ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 ${SECTION_HEADER.blue} rounded-lg`}>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Neukunden NK</span>
                </div>
              </div>
              <SectionSummary rows={data?.nk_closer} showAE color="blue" />
              <EmpTable title="Closer — Abschlussquote & AE" rows={data?.nk_closer} showAE color="blue" />
              <EmpTable title="Opener — Terminierungsquote"  rows={data?.nk_opener}        color="blue" />
              <EmpTable title="Setter — Setting-Quote"       rows={data?.nk_setter}        color="blue" />
            </div>
          ) : null}

          {/* ── BK ──────────────────────────────────────── */}
          {hasBK ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 ${SECTION_HEADER.green} rounded-lg`}>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Bestandskunden BK</span>
                </div>
              </div>
              <SectionSummary rows={data?.bk_kam} showAE color="green" />
              <EmpTable title="KAM — Abschlussquote & AE" rows={data?.bk_kam} showAE color="green" />
            </div>
          ) : null}

          {/* ── VL ──────────────────────────────────────── */}
          {hasVL ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 ${SECTION_HEADER.purple} rounded-lg`}>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Verlängerungen VL</span>
                </div>
              </div>
              <SectionSummary rows={data?.vl_kam} showAE color="purple" />
              <EmpTable title="KAM — Verlängerungsquote & AE" rows={data?.vl_kam} showAE color="purple" />
            </div>
          ) : null}

          {!hasNK && !hasBK && !hasVL && (
            <div className="text-gray-400 text-sm py-8 text-center">Keine Daten für diesen Zeitraum.</div>
          )}
        </div>
      )}
    </div>
  );
}
