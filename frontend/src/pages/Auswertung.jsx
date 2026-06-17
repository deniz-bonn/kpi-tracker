import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auswertungApi, employeesApi } from '../utils/api';
import { formatEuro, currentMonat } from '../utils/format';

// ── Tab config ───────────────────────────────────────────────────────────────
const TAB_CFG = {
  nk: {
    label:      'Neukunden NK',
    headerBg:   'bg-blue-700',
    bodyBg:     'bg-blue-50',
    border:     'border-blue-200',
    accent:     'text-blue-600',
    cardBorder: 'border-blue-100',
    empHeader:  'Nach Closer',
  },
  bk: {
    label:      'Bestandskunden BK',
    headerBg:   'bg-green-700',
    bodyBg:     'bg-green-50',
    border:     'border-green-200',
    accent:     'text-green-600',
    cardBorder: 'border-green-100',
    empHeader:  'Nach Account Manager',
  },
  vl: {
    label:      'Verlängerungen VL',
    headerBg:   'bg-purple-700',
    bodyBg:     'bg-purple-50',
    border:     'border-purple-200',
    accent:     'text-purple-600',
    cardBorder: 'border-purple-100',
    empHeader:  'Nach Account Manager',
  },
};

// ── Gesamt compact block ─────────────────────────────────────────────────────
function GestaltBlock({ kpis, tab }) {
  if (!kpis) return null;
  const isNK = tab === 'nk';
  const c    = TAB_CFG[tab];

  const M = ({ label, val, green, red }) => (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <span className={`text-[10px] uppercase font-medium ${c.accent}`}>{label}</span>
      <span className={`text-base font-bold ${green ? 'text-green-700' : red ? 'text-red-600' : 'text-gray-900'}`}>
        {val ?? '—'}
      </span>
    </div>
  );

  const sep = `border-t border-black/10`;

  return (
    <div className={`rounded-xl border ${c.border} overflow-hidden`}>
      <div className={`${c.headerBg} px-4 py-2`}>
        <span className="text-xs font-bold text-white uppercase tracking-wider">Gesamt — {c.label}</span>
      </div>
      <div className={`${c.bodyBg} px-4 py-4 space-y-4`}>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <M label="Angebote"  val={kpis.total} />
          <M label="Gewonnen"  val={kpis.gewonnen} green />
          <M label="Verloren"  val={kpis.verloren} red />
          {isNK ? (
            <>
              <M label="In Verhandlung" val={kpis.in_verhandlung} />
              <M label="Closing Call 2" val={kpis.in_closing2} />
            </>
          ) : (
            <M label="Offen" val={kpis.offen} />
          )}
          <M label="Quote" val={kpis.quote_angebote != null ? `${kpis.quote_angebote}%` : null} />
        </div>
        <div className={`flex flex-wrap gap-x-8 gap-y-3 ${sep} pt-3`}>
          <M label="AE-Wert"       val={kpis.ae_summe != null           ? formatEuro(kpis.ae_summe)           : null} />
          <M label="Angebotswert"  val={kpis.angebotswert_gesamt != null ? formatEuro(kpis.angebotswert_gesamt) : null} />
          <M label="Wert offen"    val={kpis.wert_offen != null          ? formatEuro(kpis.wert_offen)          : null} />
          <M label="Quote (Wert)"  val={kpis.quote_wert != null          ? `${kpis.quote_wert}%`               : null} />
        </div>
        {isNK && (
          <div className={`flex flex-wrap gap-x-8 gap-y-3 ${sep} pt-3`}>
            <M label="Cold Calling"  val={kpis.gewonnen_cc} />
            <M label="Mail-Inbound" val={kpis.gewonnen_mail} />
            <M label="Fax-Inbound"  val={kpis.gewonnen_fax} />
            <M label="Mit AV"      val={kpis.quote_mit_av != null ? `${kpis.quote_mit_av}%` : null} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Employee compact card ────────────────────────────────────────────────────
function EmpCard({ emp, tab }) {
  const isNK = tab === 'nk';

  const MetricItem = ({ label, val, green, red, bold, pill }) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] text-gray-400 uppercase font-medium tracking-wide text-center">{label}</span>
      {pill ? (
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
          (val || 0) >= 60 ? 'bg-green-100 text-green-700' :
          (val || 0) >= 40 ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>{val != null ? `${val}%` : '—'}</span>
      ) : (
        <span className={`text-sm font-bold ${
          green ? 'text-green-700' : red ? 'text-red-600' : bold ? 'text-gray-900' : 'text-gray-700'
        }`}>
          {val ?? '—'}
        </span>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-[#2d2e30] px-4 py-2.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-white truncate">{emp.name}</span>
        {emp.standort && (
          <span className="text-[10px] text-gray-400 bg-[#444] px-2 py-0.5 rounded shrink-0">{emp.standort}</span>
        )}
      </div>
      <div className="px-3 py-3 space-y-3 bg-white">
        {/* Row 1: deal counts + quote */}
        <div className="flex items-start justify-between gap-1">
          <MetricItem label="Erstellt"  val={emp.total}      bold />
          <MetricItem label="Gewonnen"  val={emp.gewonnen}   green />
          <MetricItem label="Verloren"  val={emp.verloren}   red />
          {isNK
            ? <MetricItem label="Verhandl." val={emp.in_verhandlung} />
            : <MetricItem label="Offen"     val={emp.offen} />
          }
          <MetricItem label="Quote" val={emp.quote_angebote} pill />
        </div>
        {/* Row 2: financial */}
        <div className="flex items-start justify-between gap-1 border-t border-gray-100 pt-2.5">
          <MetricItem label="AE-Wert"     val={emp.ae_summe            != null ? formatEuro(emp.ae_summe)            : null} bold />
          <MetricItem label="A-Wert ges." val={emp.angebotswert_gesamt != null ? formatEuro(emp.angebotswert_gesamt) : null} />
          <MetricItem label="Wert offen"  val={emp.wert_offen          != null ? formatEuro(emp.wert_offen)          : null} />
          <MetricItem label="Wert-Quote"  val={emp.quote_wert          != null ? `${emp.quote_wert}%`               : null} />
        </div>
        {/* Row 3: NK-specific */}
        {isNK && (
          <div className="flex items-start justify-between gap-1 border-t border-gray-100 pt-2.5">
            <MetricItem label="Cold Calling"  val={emp.gewonnen_cc} />
            <MetricItem label="Mail-Inbound" val={emp.gewonnen_mail} />
            <MetricItem label="Fax-Inbound"  val={emp.gewonnen_fax} />
            <MetricItem label="Closing 2" val={emp.in_closing2} />
            <MetricItem label="Mit AV"    val={emp.quote_mit_av != null ? `${emp.quote_mit_av}%` : null} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Auswertung() {
  const { company } = useOutletContext();
  const [monat, setMonat]             = useState(currentMonat());
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [standort, setStandort]       = useState('');
  const [closerId, setCloserId]       = useState('');
  const [kamId,    setKamId]          = useState('');
  const [tab, setTab]                 = useState('nk');

  const baseParams = {
    ...(company && { company_id: company }),
    ...(!showAllMonths && { monat }),
    ...(standort && { standort }),
  };

  const nkParams = { ...baseParams, ...(closerId && { closer_id: closerId }) };
  const bkParams = { ...baseParams, ...(kamId    && { kam_id:    kamId    }) };

  const { data: nkData } = useQuery({
    queryKey: ['auswertung-nk', nkParams],
    queryFn:  () => auswertungApi.nk(nkParams),
    staleTime: 0, refetchOnMount: 'always',
  });
  const { data: bkData } = useQuery({
    queryKey: ['auswertung-bk', bkParams],
    queryFn:  () => auswertungApi.bk(bkParams),
    staleTime: 0, refetchOnMount: 'always',
  });
  const { data: vlData } = useQuery({
    queryKey: ['auswertung-vl', bkParams],
    queryFn:  () => auswertungApi.vl(bkParams),
    staleTime: 0, refetchOnMount: 'always',
  });
  const { data: standorte = [] } = useQuery({
    queryKey: ['standorte'],
    queryFn:  auswertungApi.standorte,
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn:  () => employeesApi.list(),
  });

  const closer = employees.filter(e => ['NKV-Closer', 'Multi'].includes(e.rolle));
  const kams   = employees.filter(e => ['KAM',        'Multi'].includes(e.rolle));

  const activeData     = tab === 'nk' ? nkData : tab === 'bk' ? bkData : vlData;
  const mitarbeiterKey = tab === 'nk' ? 'nach_closer' : 'nach_kam';
  const c              = TAB_CFG[tab];

  return (
    <div className="space-y-5">
      {/* ── Header + Filter ─────────────────────────────────────────── */}
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

      {/* ── Tabs ────────────────────────────────────────────────────── */}
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

      {/* ── Gesamt ──────────────────────────────────────────────────── */}
      {activeData?.gesamt && (
        <GestaltBlock kpis={activeData.gesamt} tab={tab} />
      )}

      {/* ── Pro Mitarbeiter ─────────────────────────────────────────── */}
      {activeData?.[mitarbeiterKey]?.length > 0 && (
        <div>
          <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="bg-[#2d2e30] px-4 py-2.5">
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">{c.empHeader}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeData[mitarbeiterKey].map(emp => (
              <EmpCard key={emp.id} emp={emp} tab={tab} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
