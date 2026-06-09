import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kpisApi, monthlyTargetsApi, auswertungApi } from '../utils/api';
import { formatEuro } from '../utils/format';

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTH_NAMES_LONG = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

// ── Shared helper cells ───────────────────────────────────────────────────────
// dark=true  → heller Text für dunkle Zeilen (GESAMT-Zeile)
// dark=false → dunkler Text für helle Datenzeilen (Standard)
function EuroCell({ value, bold = false, dark = false }) {
  if (!value) return <span className={dark ? 'text-gray-400' : 'text-gray-300'}>—</span>;
  if (dark) return <span className={bold ? 'text-white font-bold' : 'text-gray-200'}>{formatEuro(value)}</span>;
  return <span className={bold ? 'text-gray-900 font-bold' : 'text-gray-700'}>{formatEuro(value)}</span>;
}

function PctCell({ value, dark = false }) {
  if (!value) return <span className={dark ? 'text-gray-400' : 'text-gray-300'}>—</span>;
  return <span className={dark ? 'text-gray-300' : 'text-gray-600'}>{value.toFixed(2).replace('.', ',')}%</span>;
}

function DiffCell({ value, dark = false }) {
  if (value === null || value === undefined) return <span className={dark ? 'text-gray-400' : 'text-gray-300'}>—</span>;
  if (value >= 0) return <span className={dark ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold'}>+{formatEuro(value)}</span>;
  return <span className={dark ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold'}>{formatEuro(value)}</span>;
}

// NK cell: shows AE value + count of won deals below it
function NkCell({ ae, anz, dark = false }) {
  if (!ae && !anz) return <span className={dark ? 'text-gray-400' : 'text-gray-300'}>—</span>;
  return (
    <div className="flex flex-col gap-0.5 leading-none">
      {ae ? <span className={dark ? 'text-gray-200' : 'text-gray-700'}>{formatEuro(ae)}</span> : <span className={dark ? 'text-gray-400' : 'text-gray-300'}>—</span>}
      {anz > 0 && <span className="text-[10px] text-blue-400">{anz} NK</span>}
    </div>
  );
}

// ── Auftragseingang sub-components ────────────────────────────────────────────
function DealList({ deals, showDienstleistung = false }) {
  if (!deals || deals.length === 0) {
    return <p className="text-xs text-gray-400 italic px-1">—</p>;
  }
  return (
    <div className="space-y-1">
      {deals.map((d, i) => (
        <div key={i} className="flex items-start justify-between gap-2 text-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-gray-700 truncate">{d.kunde}</span>
            {showDienstleistung && d.dienstleistung && (
              <span className="text-[10px] text-green-600 font-medium">{d.dienstleistung}</span>
            )}
            {d.datum && (
              <span className="text-gray-400 text-[10px]">
                {d.datum.slice(0, 10).split('-').reverse().join('.')}
              </span>
            )}
          </div>
          <span className="text-gray-900 font-medium whitespace-nowrap shrink-0">{formatEuro(d.ae_wert)}</span>
        </div>
      ))}
    </div>
  );
}

function LocationCol({ title, deals, color, showDienstleistung = false }) {
  const sum = deals.reduce((s, d) => s + d.ae_wert, 0);
  return (
    <div className="rounded border border-gray-200 bg-white flex flex-col">
      <div className="px-2 py-1.5 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</span>
        {sum > 0 && <span className="text-xs text-gray-800 font-bold">{formatEuro(sum)}</span>}
      </div>
      <div className="px-2 py-1.5 flex-1">
        <DealList deals={deals} showDienstleistung={showDienstleistung} />
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
    <div className={`rounded-xl border overflow-hidden ${isCurrent ? 'border-blue-400' : 'border-gray-200'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          isCurrent ? 'bg-blue-50 hover:bg-blue-100' : hasData ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className={`text-sm font-bold min-w-[120px] ${isCurrent ? 'text-blue-700' : hasData ? 'text-gray-800' : 'text-gray-400'}`}>
            {MONTH_NAMES_LONG[monthIdx]} {year}
            {isCurrent && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">Aktuell</span>}
          </span>
          {hasData ? (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-blue-600">NK: <span className="font-semibold text-blue-700">{formatEuro(row.nk.gesamt)}</span></span>
              <span className="text-gray-400">·</span>
              <span className="text-green-600">BK: <span className="font-semibold text-green-700">{formatEuro(row.bk.gesamt)}</span></span>
              <span className="text-gray-400">·</span>
              <span className="text-purple-600">VL: <span className="font-semibold text-purple-700">{formatEuro(row.vl.gesamt)}</span></span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-800 font-bold">Gesamt: {formatEuro(gesamt)}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Keine gewonnenen Deals</span>
          )}
        </div>
        <span className="text-gray-400 text-xs ml-4">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && hasData && (
        <div className="p-4 bg-gray-50 space-y-5 border-t border-gray-200">
          {row.nk.gesamt > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Auftragseingang Neukunden NK</h3>
                <span className="text-xs text-blue-600 font-bold">Gesamt: {formatEuro(row.nk.gesamt)}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <LocationCol title="Bonn" deals={row.nk.bonn} color="border-blue-900/50" />
                <LocationCol title="Braunschweig" deals={row.nk.braunschweig} color="border-blue-900/50" />
                <LocationCol title="Österreich" deals={row.nk.oesterreich} color="border-blue-900/50" />
                <LocationCol title="Schweiz" deals={row.nk.schweiz} color="border-blue-900/50" />
              </div>
            </div>
          )}
          {row.bk.gesamt > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider">Auftragseingang Bestandskunden BK</h3>
                <span className="text-xs text-green-600 font-bold">Gesamt: {formatEuro(row.bk.gesamt)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <LocationCol title="Deutschland" deals={row.bk.deutschland} color="border-green-900/50" showDienstleistung />
                <LocationCol title="Österreich" deals={row.bk.oesterreich} color="border-green-900/50" showDienstleistung />
                <LocationCol title="Schweiz" deals={row.bk.schweiz} color="border-green-900/50" showDienstleistung />
              </div>
            </div>
          )}
          {row.vl.gesamt > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Auftragseingang Verlängerungen VL</h3>
                <span className="text-xs text-purple-600 font-bold">Gesamt: {formatEuro(row.vl.gesamt)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <LocationCol title="Deutschland" deals={row.vl.deutschland} color="border-purple-900/50" showDienstleistung />
                <LocationCol title="Österreich" deals={row.vl.oesterreich} color="border-purple-900/50" showDienstleistung />
                <LocationCol title="Schweiz" deals={row.vl.schweiz} color="border-purple-900/50" showDienstleistung />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { company } = useOutletContext();
  const qc = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentMonat = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [year, setYear] = useState(String(currentYear));
  const [editZiel, setEditZiel] = useState(null);
  const [expanded, setExpanded] = useState(new Set([currentMonat]));

  const years = Array.from({ length: 4 }, (_, i) => String(currentYear - 2 + i));

  const params = { year, ...(company && { company_id: company }) };

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['kpis-dashboard', params],
    queryFn: () => kpisApi.dashboard(params),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: aeRows = [], isLoading: aeLoading } = useQuery({
    queryKey: ['auftragseingang', params],
    queryFn: () => auswertungApi.auftragseingang(params),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const zielMut = useMutation({
    mutationFn: monthlyTargetsApi.upsert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kpis-dashboard'] }),
  });

  const saveZiel = () => {
    if (!editZiel) return;
    const val = parseFloat(String(editZiel.value).replace(',', '.')) || 0;
    zielMut.mutate({ monat: editZiel.monat, ziel_gesamt: val });
    setEditZiel(null);
  };

  const toggle = (monat) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(monat) ? next.delete(monat) : next.add(monat);
      return next;
    });
  };

  const expandAll  = () => setExpanded(new Set(aeRows.filter(r => r.nk.gesamt + r.bk.gesamt + r.vl.gesamt > 0).map(r => r.monat)));
  const collapseAll = () => setExpanded(new Set());

  // Jahressummen (Übersichtstabelle)
  const sum = (key) => rows.reduce((s, r) => s + (r[key] || 0), 0);
  const totals = {
    nk_bonn: sum('nk_bonn'), nk_bs: sum('nk_bs'), nk_at: sum('nk_at'), nk_ch: sum('nk_ch'), nk_gesamt: sum('nk_gesamt'),
    nk_bonn_anz: sum('nk_bonn_anz'), nk_bs_anz: sum('nk_bs_anz'), nk_at_anz: sum('nk_at_anz'), nk_ch_anz: sum('nk_ch_anz'), nk_gesamt_anz: sum('nk_gesamt_anz'),
    bk_de: sum('bk_de'), bk_at: sum('bk_at'), bk_ch: sum('bk_ch'), bk_gesamt: sum('bk_gesamt'),
    vl_de: sum('vl_de'), vl_at: sum('vl_at'), vl_ch: sum('vl_ch'), vl_gesamt: sum('vl_gesamt'),
    gesamt: sum('gesamt'), ziel: sum('ziel'),
  };
  totals.nk_anteil = totals.gesamt > 0 ? Math.round((totals.nk_gesamt / totals.gesamt) * 10000) / 100 : 0;
  totals.bk_anteil = totals.gesamt > 0 ? Math.round((totals.bk_gesamt / totals.gesamt) * 10000) / 100 : 0;
  totals.vl_anteil = totals.gesamt > 0 ? Math.round((totals.vl_gesamt / totals.gesamt) * 10000) / 100 : 0;
  // Differenz = Summe der Einzel-Differenzen (nur Monate MIT definiertem Ziel)
  // Nicht: gesamt - ziel (würde Monate ohne Ziel verfälschen)
  const rowsWithDiff = rows.filter(r => r.differenz !== null && r.differenz !== undefined);
  totals.differenz = rowsWithDiff.length > 0 ? rowsWithDiff.reduce((s, r) => s + r.differenz, 0) : null;

  const jahresGesamt = aeRows.reduce((s, r) => s + r.nk.gesamt + r.bk.gesamt + r.vl.gesamt, 0);

  const th = "px-2.5 py-2 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap";
  const td = "px-2.5 py-2 text-xs whitespace-nowrap";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* ── Monatliche Übersichtstabelle ── */}
      <div className="rounded-xl border border-gray-200 overflow-auto">
        <table className="text-sm" style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            {/* Gruppen-Header */}
            <tr className="bg-[#2d2e30] border-b border-[#444]">
              <th className={`${th} text-gray-300 sticky left-0 bg-[#2d2e30] z-10 min-w-[90px]`} rowSpan={2}>Monat</th>
              <th colSpan={6} className={`${th} text-blue-300 border-l border-[#444] text-center`}>Neukunden NK</th>
              <th colSpan={5} className={`${th} text-green-300 border-l border-[#444] text-center`}>Bestandskunden BK</th>
              <th colSpan={5} className={`${th} text-purple-300 border-l border-[#444] text-center`}>Verlängerungen VL</th>
              <th className={`${th} text-white border-l border-[#444]`} rowSpan={2}>Umsatz Gesamt</th>
              <th className={`${th} text-amber-300 border-l border-[#444]`} rowSpan={2}>Ziel</th>
              <th className={`${th} text-white border-l border-[#444]`} rowSpan={2}>Differenz</th>
            </tr>
            <tr className="bg-[#3a3a3a] border-b border-[#444] text-gray-400 text-xs">
              <th className={`${th} border-l border-[#444]`}>Bonn</th>
              <th className={th}>Braunschweig</th>
              <th className={th}>Österreich</th>
              <th className={th}>Schweiz</th>
              <th className={`${th} text-gray-300`}>Gesamt</th>
              <th className={`${th} text-gray-300`}>Anteil</th>
              <th className={`${th} border-l border-[#444]`}>BN+BS</th>
              <th className={th}>Österreich</th>
              <th className={th}>Schweiz</th>
              <th className={`${th} text-gray-300`}>Gesamt</th>
              <th className={`${th} text-gray-300`}>Anteil</th>
              <th className={`${th} border-l border-[#444]`}>Deutschland</th>
              <th className={th}>Österreich</th>
              <th className={th}>Schweiz</th>
              <th className={`${th} text-gray-300`}>Gesamt</th>
              <th className={`${th} text-gray-300`}>Anteil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={19} className="text-center py-10 text-gray-500">Lade...</td></tr>
            ) : rows.map((row) => {
              const monthIdx = parseInt(row.monat.split('-')[1]) - 1;
              const isCurrent = row.monat === currentMonat;
              const hasData = row.gesamt > 0;

              return (
                <tr
                  key={row.monat}
                  className={`transition-colors ${
                    isCurrent ? 'bg-blue-50' : hasData ? 'hover:bg-gray-50' : 'opacity-40'
                  }`}
                >
                  {/* Monat */}
                  <td className={`${td} font-semibold sticky left-0 z-10 ${isCurrent ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'}`}>
                    {MONTH_NAMES[monthIdx]}-{year.slice(2)}
                    {isCurrent && <span className="ml-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded text-[10px]">●</span>}
                  </td>

                  {/* NK – AE + Anzahl in einer Zelle */}
                  <td className={`${td} border-l border-gray-200`}><NkCell ae={row.nk_bonn} anz={row.nk_bonn_anz} /></td>
                  <td className={td}><NkCell ae={row.nk_bs} anz={row.nk_bs_anz} /></td>
                  <td className={td}><NkCell ae={row.nk_at} anz={row.nk_at_anz} /></td>
                  <td className={td}><NkCell ae={row.nk_ch} anz={row.nk_ch_anz} /></td>
                  <td className={`${td}`}>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="text-blue-600 font-medium">{row.nk_gesamt ? formatEuro(row.nk_gesamt) : <span className="text-gray-300">—</span>}</span>
                      {row.nk_gesamt_anz > 0 && <span className="text-[10px] text-blue-500">{row.nk_gesamt_anz} NK</span>}
                    </div>
                  </td>
                  <td className={td}><PctCell value={row.nk_anteil} /></td>

                  {/* BK */}
                  <td className={`${td} border-l border-gray-200`}><EuroCell value={row.bk_de} /></td>
                  <td className={td}><EuroCell value={row.bk_at} /></td>
                  <td className={td}><EuroCell value={row.bk_ch} /></td>
                  <td className={`${td} text-green-600 font-medium`}><EuroCell value={row.bk_gesamt} /></td>
                  <td className={td}><PctCell value={row.bk_anteil} /></td>

                  {/* VL */}
                  <td className={`${td} border-l border-gray-200`}><EuroCell value={row.vl_de} /></td>
                  <td className={td}><EuroCell value={row.vl_at} /></td>
                  <td className={td}><EuroCell value={row.vl_ch} /></td>
                  <td className={`${td} text-purple-600 font-medium`}><EuroCell value={row.vl_gesamt} /></td>
                  <td className={td}><PctCell value={row.vl_anteil} /></td>

                  {/* Gesamt */}
                  <td className={`${td} border-l border-gray-200`}>
                    <EuroCell value={row.gesamt} bold />
                  </td>

                  {/* Ziel – inline editierbar */}
                  <td className={`${td} border-l border-gray-200`}>
                    {editZiel?.monat === row.monat ? (
                      <input
                        type="number"
                        value={editZiel.value}
                        onChange={e => setEditZiel(z => ({ ...z, value: e.target.value }))}
                        onBlur={saveZiel}
                        onKeyDown={e => { if (e.key === 'Enter') saveZiel(); if (e.key === 'Escape') setEditZiel(null); }}
                        autoFocus
                        className="w-28 bg-white border border-blue-500 text-gray-800 text-xs rounded px-2 py-0.5"
                      />
                    ) : (
                      <span
                        onClick={() => setEditZiel({ monat: row.monat, value: row.ziel || '' })}
                        className={`cursor-pointer ${row.ziel ? 'text-amber-600' : 'text-gray-300 italic hover:text-gray-500'}`}
                        title="Klicken zum Eintragen"
                      >
                        {row.ziel ? formatEuro(row.ziel) : '+ Ziel'}
                      </span>
                    )}
                  </td>

                  {/* Differenz */}
                  <td className={`${td} border-l border-gray-200`}>
                    <DiffCell value={row.differenz} />
                  </td>
                </tr>
              );
            })}

            {/* Summen-Zeile — alle Werte weiß, nur Differenz grün/rot */}
            <tr className="bg-[#2d2e30] border-t-2 border-[#444] font-bold text-xs text-white">
              <td className="px-2.5 py-2.5 text-white uppercase tracking-wide sticky left-0 bg-[#2d2e30] z-10">GESAMT</td>
              {/* NK Standorte */}
              <td className={`${td} border-l border-[#444]`}>
                {totals.nk_bonn ? <div className="flex flex-col gap-0.5 leading-none"><span className="text-white">{formatEuro(totals.nk_bonn)}</span>{totals.nk_bonn_anz > 0 && <span className="text-[10px] text-gray-300">{totals.nk_bonn_anz} NK</span>}</div> : <span className="text-gray-500">—</span>}
              </td>
              <td className={td}>
                {totals.nk_bs ? <div className="flex flex-col gap-0.5 leading-none"><span className="text-white">{formatEuro(totals.nk_bs)}</span>{totals.nk_bs_anz > 0 && <span className="text-[10px] text-gray-300">{totals.nk_bs_anz} NK</span>}</div> : <span className="text-gray-500">—</span>}
              </td>
              <td className={td}>
                {totals.nk_at ? <div className="flex flex-col gap-0.5 leading-none"><span className="text-white">{formatEuro(totals.nk_at)}</span>{totals.nk_at_anz > 0 && <span className="text-[10px] text-gray-300">{totals.nk_at_anz} NK</span>}</div> : <span className="text-gray-500">—</span>}
              </td>
              <td className={td}>
                {totals.nk_ch ? <div className="flex flex-col gap-0.5 leading-none"><span className="text-white">{formatEuro(totals.nk_ch)}</span>{totals.nk_ch_anz > 0 && <span className="text-[10px] text-gray-300">{totals.nk_ch_anz} NK</span>}</div> : <span className="text-gray-500">—</span>}
              </td>
              {/* NK Gesamt */}
              <td className={td}>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-white">{totals.nk_gesamt ? formatEuro(totals.nk_gesamt) : <span className="text-gray-500">—</span>}</span>
                  {totals.nk_gesamt_anz > 0 && <span className="text-[10px] text-gray-300">{totals.nk_gesamt_anz} NK</span>}
                </div>
              </td>
              <td className={td}><span className="text-white">{totals.nk_anteil ? `${totals.nk_anteil.toFixed(2).replace('.', ',')}%` : <span className="text-gray-500">—</span>}</span></td>
              {/* BK */}
              <td className={`${td} border-l border-[#444]`}><span className="text-white">{totals.bk_de ? formatEuro(totals.bk_de) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.bk_at ? formatEuro(totals.bk_at) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.bk_ch ? formatEuro(totals.bk_ch) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.bk_gesamt ? formatEuro(totals.bk_gesamt) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.bk_anteil ? `${totals.bk_anteil.toFixed(2).replace('.', ',')}%` : <span className="text-gray-500">—</span>}</span></td>
              {/* VL */}
              <td className={`${td} border-l border-[#444]`}><span className="text-white">{totals.vl_de ? formatEuro(totals.vl_de) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.vl_at ? formatEuro(totals.vl_at) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.vl_ch ? formatEuro(totals.vl_ch) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.vl_gesamt ? formatEuro(totals.vl_gesamt) : <span className="text-gray-500">—</span>}</span></td>
              <td className={td}><span className="text-white">{totals.vl_anteil ? `${totals.vl_anteil.toFixed(2).replace('.', ',')}%` : <span className="text-gray-500">—</span>}</span></td>
              {/* Gesamt + Ziel + Differenz */}
              <td className={`${td} border-l border-[#444]`}><span className="text-white">{totals.gesamt ? formatEuro(totals.gesamt) : '—'}</span></td>
              <td className={`${td} border-l border-[#444]`}><span className="text-amber-300">{totals.ziel ? formatEuro(totals.ziel) : <span className="text-gray-500">—</span>}</span></td>
              <td className={`${td} border-l border-[#444]`}><DiffCell value={totals.differenz} dark /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 -mt-3">
        💡 Ziel-Spalte: auf eine Zelle klicken → Zahl eingeben → Enter · NK-Zellen zeigen Auftragsvolumen + Anzahl gewonnener Neukunden
      </p>

      {/* ── Auftragseingang ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-800">Auftragseingang</h2>
            {jahresGesamt > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">Jahresgesamt {year}: {formatEuro(jahresGesamt)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={expandAll}  className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1">Alle aufklappen</button>
            <button onClick={collapseAll} className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1">Alle zuklappen</button>
          </div>
        </div>

        {aeLoading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Lade...</div>
        ) : (
          <div className="space-y-2">
            {aeRows.map(row => (
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
    </div>
  );
}
