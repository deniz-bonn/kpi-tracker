import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auswertungApi } from '../utils/api';
import { formatEuro } from '../utils/format';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function DealList({ deals }) {
  if (!deals || deals.length === 0) {
    return <p className="text-xs text-gray-600 italic px-1">—</p>;
  }
  return (
    <div className="space-y-0.5">
      {deals.map((d, i) => (
        <div key={i} className="flex items-center justify-between gap-2 text-xs">
          <span className="text-gray-300 truncate">{d.kunde}</span>
          <span className="text-white font-medium whitespace-nowrap shrink-0">{formatEuro(d.ae_wert)}</span>
        </div>
      ))}
    </div>
  );
}

function LocationCol({ title, deals, color, total }) {
  const sum = deals.reduce((s, d) => s + d.ae_wert, 0);
  return (
    <div className={`rounded border ${color} bg-gray-900/60 flex flex-col`}>
      <div className={`px-2 py-1.5 border-b ${color} flex items-center justify-between`}>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">{title}</span>
        {sum > 0 && <span className="text-xs text-white font-bold">{formatEuro(sum)}</span>}
      </div>
      <div className="px-2 py-1.5 flex-1">
        <DealList deals={deals} />
      </div>
    </div>
  );
}

function MonthSection({ row, isExpanded, onToggle, isCurrent }) {
  const monthIdx = parseInt(row.monat.split('-')[1]) - 1;
  const year = row.monat.split('-')[0];
  const gesamt = row.nk.gesamt + row.bk.gesamt + row.vl.gesamt;
  const hasData = gesamt > 0;

  return (
    <div className={`rounded-xl border overflow-hidden ${isCurrent ? 'border-blue-600/50' : 'border-gray-800'}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          isCurrent ? 'bg-blue-950/40 hover:bg-blue-950/60' : hasData ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-900/30'
        }`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className={`text-sm font-bold min-w-[120px] ${isCurrent ? 'text-blue-300' : hasData ? 'text-white' : 'text-gray-600'}`}>
            {MONTH_NAMES[monthIdx]} {year}
            {isCurrent && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">Aktuell</span>}
          </span>
          {hasData ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-blue-400">NK: <span className="font-semibold text-blue-300">{formatEuro(row.nk.gesamt)}</span></span>
              <span className="text-gray-600">·</span>
              <span className="text-green-400">BK: <span className="font-semibold text-green-300">{formatEuro(row.bk.gesamt)}</span></span>
              <span className="text-gray-600">·</span>
              <span className="text-purple-400">VL: <span className="font-semibold text-purple-300">{formatEuro(row.vl.gesamt)}</span></span>
              <span className="text-gray-600">·</span>
              <span className="text-white font-bold">Gesamt: {formatEuro(gesamt)}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-600 italic">Keine gewonnenen Deals</span>
          )}
        </div>
        <span className="text-gray-500 text-xs ml-4">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Inhalt */}
      {isExpanded && hasData && (
        <div className="p-4 bg-gray-950 space-y-5 border-t border-gray-800">

          {/* NK */}
          {row.nk.gesamt > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Auftragseingang Neukunden NK</h3>
                <span className="text-xs text-blue-300 font-bold">Gesamt: {formatEuro(row.nk.gesamt)}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <LocationCol title="Bonn" deals={row.nk.bonn} color="border-blue-900/50" />
                <LocationCol title="Braunschweig" deals={row.nk.braunschweig} color="border-blue-900/50" />
                <LocationCol title="Österreich" deals={row.nk.oesterreich} color="border-blue-900/50" />
                <LocationCol title="Schweiz" deals={row.nk.schweiz} color="border-blue-900/50" />
              </div>
            </div>
          )}

          {/* BK */}
          {row.bk.gesamt > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider">Auftragseingang Bestandskunden BK</h3>
                <span className="text-xs text-green-300 font-bold">Gesamt: {formatEuro(row.bk.gesamt)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <LocationCol title="Deutschland" deals={row.bk.deutschland} color="border-green-900/50" />
                <LocationCol title="Österreich" deals={row.bk.oesterreich} color="border-green-900/50" />
                <LocationCol title="Schweiz" deals={row.bk.schweiz} color="border-green-900/50" />
              </div>
            </div>
          )}

          {/* VL */}
          {row.vl.gesamt > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Auftragseingang Verlängerungen VL</h3>
                <span className="text-xs text-purple-300 font-bold">Gesamt: {formatEuro(row.vl.gesamt)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <LocationCol title="Deutschland" deals={row.vl.deutschland} color="border-purple-900/50" />
                <LocationCol title="Österreich" deals={row.vl.oesterreich} color="border-purple-900/50" />
                <LocationCol title="Schweiz" deals={row.vl.schweiz} color="border-purple-900/50" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Auftragseingang() {
  const { company } = useOutletContext();
  const currentYear = new Date().getFullYear();
  const currentMonat = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [year, setYear] = useState(String(currentYear));
  const [expanded, setExpanded] = useState(new Set([currentMonat]));

  const years = Array.from({ length: 4 }, (_, i) => String(currentYear - 2 + i));
  const params = { year, ...(company && { company_id: company }) };

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['auftragseingang', params],
    queryFn: () => auswertungApi.auftragseingang(params),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const toggle = (monat) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(monat) ? next.delete(monat) : next.add(monat);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(rows.filter(r => r.nk.gesamt + r.bk.gesamt + r.vl.gesamt > 0).map(r => r.monat)));
  const collapseAll = () => setExpanded(new Set());

  const jahresGesamt = rows.reduce((s, r) => s + r.nk.gesamt + r.bk.gesamt + r.vl.gesamt, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Auftragseingang</h1>
          {jahresGesamt > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">Jahresgesamt {year}: {formatEuro(jahresGesamt)}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-2 py-1">Alle aufklappen</button>
          <button onClick={collapseAll} className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-2 py-1">Alle zuklappen</button>
          <select value={year} onChange={e => setYear(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded px-3 py-1.5">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Monats-Sektionen */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Lade...</div>
      ) : (
        <div className="space-y-2">
          {rows.map(row => (
            <MonthSection
              key={row.monat}
              row={row}
              isExpanded={expanded.has(row.monat)}
              onToggle={() => toggle(row.monat)}
              isCurrent={row.monat === currentMonat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
