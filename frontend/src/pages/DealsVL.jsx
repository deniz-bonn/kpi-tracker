import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, employeesApi, exportApi } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { formatEuro, currentMonat } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTS = ['Offen', 'Gewonnen', 'Verloren'];
const STANDORTE   = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];

const DIENSTLEISTUNGEN_VL = ['RaaS Kontingente','RaaS Kleinkunde Laufzeit','Karriereseite','Karriereseite Wartung','Social-Media','Glaubenssätze','Media-Day','Website','Sonstiges'];
const ABGERECHNET_OPTS = ['Nein', 'Ja', 'On Hold'];

// ── KPI-Block (Gesamt oder pro KAM) ─────────────────────────────────────────
// VL-spezifische Metriken: Anstehende, Möglicher AE, Realisiert, Kündigungen, Churn-Rate
function KpiBlock({ title, kpis, highlight = false }) {
  const churnColor = kpis.churn_rate > 70 ? 'text-red-600' :
                     kpis.churn_rate > 40 ? 'text-amber-600' : 'text-green-600';

  const rows = [
    { label: 'Anstehende Verlängerungen',  val: kpis.total,              hi: true },
    { label: 'Möglicher AE',               val: formatEuro(kpis.moeglicher_ae) },
    { label: 'Realisierte Verlängerungen', val: kpis.gewonnen,           hi: true },
    { label: 'Realisierter AE',            val: formatEuro(kpis.ae_summe) },
    { label: 'Kündigungen',                val: kpis.verloren,           hi: true },
    { label: 'Verlorener AE',              val: formatEuro(kpis.verlorener_ae) },
    { label: 'Churn-Rate',                 val: kpis.churn_rate.toFixed(2), color: churnColor, hi: true },
    { label: 'Abgerechnet (gew. Deals)',   val: `${kpis.abgerechnet_ja} (${kpis.abgerechnet_quote}%)` },
  ];

  return (
    <div className={`rounded-lg border overflow-hidden ${highlight ? 'border-purple-400' : 'border-gray-200'}`}>
      <div className={`px-3 py-2 border-b ${highlight ? 'bg-purple-700 border-purple-600' : 'bg-[#2d2e30] border-[#444]'}`}>
        <span className={`text-xs font-bold uppercase tracking-wide ${highlight ? 'text-white' : 'text-white'}`}>
          {title}
        </span>
      </div>
      <table className="w-full text-xs">
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={i} className={r.hi ? 'bg-gray-100' : 'hover:bg-gray-50'}>
              <td className="px-3 py-1.5 text-gray-600">{r.label}</td>
              <td className={`px-3 py-1.5 text-right font-bold ${r.color || (r.hi ? 'text-gray-900' : 'text-gray-700')}`}>
                {r.val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── KPIs aus einem Deal-Array berechnen ──────────────────────────────────────
function calcKpis(deals) {
  const gew  = deals.filter(d => d.status === 'Gewonnen');
  const verl = deals.filter(d => d.status === 'Verloren');
  const n    = deals.length;
  return {
    total:            n,
    gewonnen:         gew.length,
    verloren:         verl.length,
    moeglicher_ae:    deals.reduce((s, d) => s + (Number(d.angebotswert) || 0), 0),
    ae_summe:         gew.reduce((s, d)   => s + (Number(d.ae_wert)      || 0), 0),
    verlorener_ae:    verl.reduce((s, d)  => s + (Number(d.ae_wert) || Number(d.angebotswert) || 0), 0),
    churn_rate:       n > 0 ? ((n - gew.length) / n) * 100 : 0,
    abgerechnet_ja:   gew.filter(d => d.abgerechnet === 'Ja').length,
    abgerechnet_quote: gew.length > 0 ? (gew.filter(d => d.abgerechnet === 'Ja').length / gew.length * 100).toFixed(1) : '0.0',
  };
}

// ── Hauptkomponente ──────────────────────────────────────────────────────────
export default function DealsVL() {
  const { company, companies } = useOutletContext();
  const { canSeeAll } = useAuth();
  const qc = useQueryClient();
  const [monat, setMonat]                = useState(currentMonat());
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [modal, setModal]                = useState(null);
  const [showKpis, setShowKpis]          = useState(true);

  const [filterKam,      setFilterKam]      = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterStandort, setFilterStandort] = useState('');

  const params = { ...(company && { company_id: company }), ...(!showAllMonths && { monat }) };
  const { data: deals = [] } = useQuery({
    queryKey: ['deals-vl', params], queryFn: () => dealsApi.vl.list(params),
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'], queryFn: () => employeesApi.list(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['deals-vl'] });
    qc.invalidateQueries({ queryKey: ['kpis-overview'] });
    qc.invalidateQueries({ queryKey: ['kpis-monthly'] });
    qc.invalidateQueries({ queryKey: ['kpis-employees'] });
    qc.invalidateQueries({ queryKey: ['kpis-dashboard'] });
    qc.invalidateQueries({ queryKey: ['auftragseingang'] });
  };

  const createMut = useMutation({ mutationFn: dealsApi.vl.create, onSuccess: () => { invalidate(); setModal(null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => dealsApi.vl.update(id, data), onSuccess: () => { invalidate(); setModal(null); } });
  const deleteMut = useMutation({ mutationFn: dealsApi.vl.delete, onSuccess: invalidate });

  const compOpts   = companies.map(c => ({ value: c.id, label: c.name }));
  const kamList    = employees.filter(e => e.rolle === 'KAM');
  const kamOptions = kamList.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));

  const fields = [
    { name: 'datum',                 label: 'Datum',                   type: 'date',   required: true, readOnly: modal?.mode === 'edit' },
    { name: 'monat',                 label: 'Monat (YYYY-MM)',                         required: true },
    { name: 'company_id',            label: 'Company',                 type: 'select', options: compOpts, required: true },
    { name: 'kunde',                 label: 'Kunde',                                   required: true },
    { name: 'dienstleistung',        label: 'Dienstleistung',          type: 'select', options: DIENSTLEISTUNGEN_VL, required: f => f.status === 'Gewonnen' },
    ...(canSeeAll ? [{ name: 'kam_id', label: 'Account Manager', type: 'select', options: kamOptions }] : []),
    { name: 'angebotswert',          label: 'Möglicher AE (€)',        type: 'number', required: true },
    { name: 'ae_wert',               label: 'Realisierter AE (€)',     type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'laufzeit_monate',       label: 'Neue Laufzeit (Monate)',  type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'wie_vielt_verlaengerung', label: 'Wievielte Verlängerung', type: 'number' },
    { name: 'status',                label: 'Status',                  type: 'select', options: STATUS_OPTS, required: true },
    { name: 'abgerechnet',           label: 'Abgerechnet',             type: 'select', options: ABGERECHNET_OPTS },
    { name: 'kommentar',             label: 'Kommentar',               type: 'textarea' },
  ];

  const handleSave = (form) => {
    const data = { ...form, monat: form.monat || monat, company_id: form.company_id || company || null };
    if (modal.mode === 'create') createMut.mutate(data);
    else updateMut.mutate({ id: modal.data.id, data });
  };

  // Gefilterte Deals
  const filtered = useMemo(() => deals.filter(d =>
    (!filterKam      || String(d.kam_id)   === filterKam) &&
    (!filterStatus   || d.status           === filterStatus) &&
    (!filterStandort || d.kam_standort     === filterStandort)
  ), [deals, filterKam, filterStatus, filterStandort]);

  // Gesamt-KPIs
  const gesamtKpis = useMemo(() => calcKpis(filtered), [filtered]);

  // KPIs pro KAM — alle KAMs (des aktiven Standort-Filters) immer anzeigen, auch ohne Deals im Zeitraum
  const kamKpis = useMemo(() => {
    const m = {};
    // KAMs vorinitialisieren — bei Standort-/KAM-Filter entsprechend einschränken
    employees
      .filter(e => e.rolle === 'KAM')
      .filter(e => !filterStandort || e.standort === filterStandort)
      .filter(e => !filterKam      || String(e.id) === filterKam)
      .forEach(e => { m[e.id] = { id: e.id, name: e.name, deals: [] }; });
    // Gefilterte Deals zuordnen
    filtered.forEach(d => {
      if (!d.kam_id) return;
      if (!m[d.kam_id]) m[d.kam_id] = { id: d.kam_id, name: d.kam_name, deals: [] };
      m[d.kam_id].deals.push(d);
    });
    return Object.values(m)
      .map(k => ({ ...k, kpis: calcKpis(k.deals) }))
      .sort((a, b) => b.kpis.total - a.kpis.total);
  }, [filtered, employees]);

  const sel = "bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5";
  const hasFilters = filterKam || filterStatus || filterStandort;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Verlängerungen (VL)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filtered.length} anstehend · {gesamtKpis.gewonnen} realisiert · {gesamtKpis.verloren} Kündigungen · Churn-Rate: {gesamtKpis.churn_rate.toFixed(2)}%
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowKpis(v => !v)}
            className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1">
            {showKpis ? '▲ KPIs ausblenden' : '▼ KPIs einblenden'}
          </button>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showAllMonths} onChange={e => setShowAllMonths(e.target.checked)} className="accent-blue-500" />
            Alle Monate
          </label>
          {!showAllMonths && (
            <input type="month" value={monat} onChange={e => setMonat(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          )}
          <button
            onClick={() => exportApi.download('vl.csv', 'verlaengerungen.csv', { ...(company && { company_id: company }), ...(!showAllMonths && { monat }) })}
            className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-600 text-sm rounded">
            ↓ CSV
          </button>
          <button onClick={() => setModal({ mode: 'create', data: { status: 'Offen', datum: new Date().toISOString().slice(0,10), monat } })}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">
            + Neue Verlängerung
          </button>
        </div>
      </div>

      {/* Filter-Leiste */}
      <div className="flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <span className="text-xs text-gray-500 mr-1">Filter:</span>
        <select value={filterStandort} onChange={e => setFilterStandort(e.target.value)} className={sel}>
          <option value="">Alle Standorte</option>
          {STANDORTE.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterKam} onChange={e => setFilterKam(e.target.value)} className={sel}>
          <option value="">Alle Account Manager</option>
          {kamList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={sel}>
          <option value="">Alle Status</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setFilterKam(''); setFilterStatus(''); setFilterStandort(''); }}
            className="text-xs text-gray-500 hover:text-white ml-1">✕ Zurücksetzen</button>
        )}
      </div>

      {/* KPI-Block */}
      {showKpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <KpiBlock title="Gesamt" kpis={gesamtKpis} highlight />
          {kamKpis.map(k => (
            <KpiBlock key={k.id} title={k.name} kpis={k.kpis} />
          ))}
        </div>
      )}

      {/* Deals-Tabelle */}
      <div className="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#2d2e30] text-gray-300 text-xs uppercase">
            <tr>
              {['Datum','Kunde','Account Manager','Dienstleistung','Mögl. AE','Real. AE','Laufzeit','Verl. #','Status','Abgerechnet','Notiz',''].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-8 text-gray-400">Keine Deals gefunden</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className={`hover:bg-gray-50 ${d.status === 'Verloren' ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.datum?.slice(0,10)}</td>
                <td className="px-3 py-2 text-gray-900 font-medium">{d.kunde}</td>
                <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                  {d.kam_name || '—'}
                  {d.kam_standort && <span className="ml-1 text-gray-400">({d.kam_standort})</span>}
                </td>
                <td className="px-3 py-2 text-gray-600">{d.dienstleistung || '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.angebotswert ? formatEuro(d.angebotswert) : '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.ae_wert ? formatEuro(d.ae_wert) : '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.laufzeit_monate ? `${d.laufzeit_monate}M` : '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.wie_vielt_verlaengerung ? `${d.wie_vielt_verlaengerung}x` : '—'}</td>
                <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {d.abgerechnet
                    ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${d.abgerechnet === 'Ja' ? 'bg-green-100 text-green-700' : d.abgerechnet === 'On Hold' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{d.abgerechnet}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2 max-w-[200px]">
                  {d.kommentar
                    ? <span className="text-gray-600 text-xs" title={d.kommentar}>
                        {d.kommentar.length > 60 ? d.kommentar.slice(0, 60) + '…' : d.kommentar}
                      </span>
                    : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ mode: 'edit', data: d })} className="text-gray-400 hover:text-blue-600 text-xs">Bearbeiten</button>
                    <button onClick={() => { if (confirm('Löschen?')) deleteMut.mutate(d.id); }} className="text-gray-400 hover:text-red-600 text-xs">Löschen</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <DealModal title={modal.mode === 'create' ? 'Neue Verlängerung' : 'Verlängerung bearbeiten'}
          fields={fields} initial={modal.data} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
