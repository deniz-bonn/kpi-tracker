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

export default function KpiMitarbeiter() {
  const { company } = useOutletContext();
  const [monat, setMonat] = useState(currentMonat());
  const [showAllMonths, setShowAllMonths] = useState(false);

  const params = {
    ...(company && { company_id: company }),
    ...(showAllMonths
      ? { year: monat.split('-')[0] }
      : { monat }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['kpis-employees', params],
    queryFn: () => kpisApi.employees(params),
    staleTime: 0,
    refetchOnMount: 'always',
  });

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
        <div className="space-y-5">
          {/* NK */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Neukunden (NK)
            </h2>
            <div className="space-y-3">
              <EmpTable title="Closer — Abschlussquote & AE" rows={data?.nk_closer} showAE color="blue" />
              <EmpTable title="Opener — Terminierungsquote" rows={data?.nk_opener} color="blue" />
              <EmpTable title="Setter — Setting-Quote" rows={data?.nk_setter} color="blue" />
            </div>
          </div>

          {/* BK */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              Bestandskunden (BK)
            </h2>
            <EmpTable title="KAM — Abschlussquote & AE" rows={data?.bk_kam} showAE color="green" />
          </div>

          {/* VL */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
              Verlängerungen (VL)
            </h2>
            <EmpTable title="KAM — Verlängerungsquote & AE" rows={data?.vl_kam} showAE color="purple" />
          </div>
        </div>
      )}
    </div>
  );
}
