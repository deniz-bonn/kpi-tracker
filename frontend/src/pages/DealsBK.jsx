import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, employeesApi } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { formatEuro, currentMonat } from '../utils/format';

const STATUS_OPTS = ['Offen', 'Gewonnen', 'Verloren'];
const STANDORTE   = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];

const DIENSTLEISTUNGEN_BK = ['RaaS Kontingente','RaaS Kleinkunde Laufzeit','Karriereseite','Karriereseite Wartung','Social-Media','Glaubenssätze','Media-Day','Website','Sonstiges'];
const AUTO_VL_OPTS = ['Ja', 'Nein'];
const ABGERECHNET_OPTS = ['Nein', 'Ja', 'On Hold'];

// ── KPI-Block (Gesamt oder pro KAM) ─────────────────────────────────────────
function KpiBlock({ title, kpis, highlight = false }) {
  const rows = [
    { label: 'Angebote insgesamt',                   val: kpis.total,              hi: true },
    { label: 'Angebote realisiert',                  val: kpis.gewonnen },
    { label: 'Angebote nicht realisiert',            val: kpis.verloren },
    { label: 'Realisierungsquote nach Angeboten',    val: `${kpis.quote_angebote}%`, hi: true },
    { label: 'Realisierung Angebotswert',            val: formatEuro(kpis.ae_summe) },
    { label: 'Realisierungsquote nach Angebotswert', val: `${kpis.quote_wert}%` },
    { label: 'Angebotswert insgesamt',               val: formatEuro(kpis.angebotswert_gesamt), hi: true },
    { label: 'Wert offene Angebote',                 val: formatEuro(kpis.wert_offen) },
    { label: 'Auto-Verlängerung (gew. Deals)', val: `${kpis.auto_verlaengerung} (${kpis.auto_verlaengerung_quote}%)` },
    { label: 'Abgerechnet (gew. Deals)',        val: `${kpis.abgerechnet_ja} (${kpis.abgerechnet_quote}%)` },
  ];

  return (
    <div className={`rounded-lg border overflow-hidden ${highlight ? 'border-green-400' : 'border-gray-200'}`}>
      <div className={`px-3 py-2 border-b ${highlight ? 'bg-green-700 border-green-600' : 'bg-[#2d2e30] border-[#444]'}`}>
        <span className={`text-xs font-bold uppercase tracking-wide ${highlight ? 'text-white' : 'text-white'}`}>
          {title}
        </span>
      </div>
      <table className="w-full text-xs">
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={i} className={r.hi ? 'bg-gray-100' : 'hover:bg-gray-50'}>
              <td className="px-3 py-1.5 text-gray-600">{r.label}</td>
              <td className={`px-3 py-1.5 text-right font-bold ${r.hi ? 'text-gray-900' : 'text-gray-700'}`}>{r.val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── KPIs aus einem Deal-Array berechnen ──────────────────────────────────────
function calcKpis(deals) {
  const gew = deals.filter(d => d.status === 'Gewonnen');
  const ae  = gew.reduce((s, d) => s + (Number(d.ae_wert)       || 0), 0);
  const agw = deals.reduce((s, d) => s + (Number(d.angebotswert) || 0), 0);
  const n   = deals.length;
  const autoJ = gew.filter(d => d.automatische_verlaengerung === 'Ja').length;
  const abgJ  = gew.filter(d => d.abgerechnet === 'Ja').length;
  return {
    total:               n,
    gewonnen:            gew.length,
    verloren:            deals.filter(d => d.status === 'Verloren').length,
    ae_summe:            ae,
    angebotswert_gesamt: agw,
    wert_offen:          deals.filter(d => !['Gewonnen','Verloren'].includes(d.status))
                           .reduce((s, d) => s + (Number(d.angebotswert) || 0), 0),
    quote_angebote:      n > 0 ? (gew.length / n * 100).toFixed(2) : '0.00',
    quote_wert:          agw > 0 ? (ae / agw * 100).toFixed(2) : '0.00',
    auto_verlaengerung:       autoJ,
    auto_verlaengerung_quote: gew.length > 0 ? (autoJ / gew.length * 100).toFixed(1) : '0.0',
    abgerechnet_ja:           abgJ,
    abgerechnet_quote:        gew.length > 0 ? (abgJ / gew.length * 100).toFixed(1) : '0.0',
  };
}

// ── Hauptkomponente ──────────────────────────────────────────────────────────
export default function DealsBK() {
  const { company, companies } = useOutletContext();
  const qc = useQueryClient();
  const [monat, setMonat]               = useState(currentMonat());
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [modal, setModal]               = useState(null);
  const [showKpis, setShowKpis]         = useState(true);

  const [filterKam,      setFilterKam]      = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterStandort, setFilterStandort] = useState('');

  const params = { ...(company && { company_id: company }), ...(!showAllMonths && { monat }) };
  const { data: deals = [] } = useQuery({
    queryKey: ['deals-bk', params], queryFn: () => dealsApi.bk.list(params),
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'], queryFn: () => employeesApi.list(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['deals-bk'] });
    qc.invalidateQueries({ queryKey: ['kpis-overview'] });
    qc.invalidateQueries({ queryKey: ['kpis-monthly'] });
    qc.invalidateQueries({ queryKey: ['kpis-employees'] });
    qc.invalidateQueries({ queryKey: ['kpis-dashboard'] });
    qc.invalidateQueries({ queryKey: ['auftragseingang'] });
  };

  const createMut = useMutation({ mutationFn: dealsApi.bk.create, onSuccess: () => { invalidate(); setModal(null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => dealsApi.bk.update(id, data), onSuccess: () => { invalidate(); setModal(null); } });
  const deleteMut = useMutation({ mutationFn: dealsApi.bk.delete, onSuccess: invalidate });

  const compOpts   = companies.map(c => ({ value: c.id, label: c.name }));
  const kamList    = employees.filter(e => e.rolle === 'KAM');
  const kamOptions = kamList.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));

  const fields = [
    { name: 'datum',          label: 'Datum',             type: 'date',   required: true },
    { name: 'monat',          label: 'Monat (YYYY-MM)',                   required: true },
    { name: 'company_id',     label: 'Company',           type: 'select', options: compOpts, required: true },
    { name: 'kunde',          label: 'Kunde',                             required: true },
    { name: 'angebotsnummer', label: 'Angebotsnummer' },
    { name: 'dienstleistung', label: 'Dienstleistung',    type: 'select', options: DIENSTLEISTUNGEN_BK },
    { name: 'kam_id',         label: 'KAM',               type: 'select', options: kamOptions },
    { name: 'angebotswert',   label: 'Angebotswert (€)',  type: 'number', required: true },
    { name: 'ae_wert',        label: 'AE-Wert (€)',       type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'laufzeit_monate',label: 'Laufzeit (Monate)', type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'automatische_verlaengerung', label: 'Automatische Verlängerung', type: 'select', options: AUTO_VL_OPTS, required: true },
    { name: 'status',         label: 'Status',            type: 'select', options: STATUS_OPTS, required: true },
    { name: 'abgerechnet',    label: 'Abgerechnet',       type: 'select', options: ABGERECHNET_OPTS },
    { name: 'kommentar',      label: 'Kommentar',         type: 'textarea' },
  ];

  const handleSave = (form) => {
    const data = { ...form, monat: form.monat || monat, company_id: form.company_id || company || null };
    if (modal.mode === 'create') createMut.mutate(data);
    else updateMut.mutate({ id: modal.data.id, data });
  };

  // Gefilterte Deals
  const filtered = useMemo(() => deals.filter(d =>
    (!filterKam      || String(d.kam_id)    === filterKam) &&
    (!filterStatus   || d.status            === filterStatus) &&
    (!filterStandort || d.kam_standort      === filterStandort)
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
      .sort((a, b) => b.kpis.ae_summe - a.kpis.ae_summe);
  }, [filtered, employees]);

  const sel = "bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5";
  const hasFilters = filterKam || filterStatus || filterStandort;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Bestandskunden (BK)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filtered.length} Angebote · {gesamtKpis.gewonnen} gewonnen · {gesamtKpis.quote_angebote}% · {formatEuro(gesamtKpis.ae_summe)} AE
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
          <button onClick={() => setModal({ mode: 'create', data: { status: 'Offen', datum: new Date().toISOString().slice(0,10), monat } })}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">
            + Neuer Deal
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
          <option value="">Alle KAMs</option>
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
          {/* Gesamt */}
          <KpiBlock title="Gesamt" kpis={gesamtKpis} highlight />
          {/* Pro KAM */}
          {kamKpis.map(k => (
            <KpiBlock key={k.id} title={k.name} kpis={k.kpis} />
          ))}
        </div>
      )}

      {/* Deals-Tabelle */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2d2e30] text-gray-300 text-xs uppercase">
            <tr>
              {['Datum','Kunde','KAM','Dienstleistung','Angebotswert','AE-Wert','Laufzeit','Status','Auto-VL','Abgerechnet','Notiz',''].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-8 text-gray-400">Keine Deals gefunden</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
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
                <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {d.automatische_verlaengerung
                    ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${d.automatische_verlaengerung === 'Ja' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{d.automatische_verlaengerung}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {d.abgerechnet
                    ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${d.abgerechnet === 'Ja' ? 'bg-green-100 text-green-700' : d.abgerechnet === 'On Hold' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{d.abgerechnet}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2 max-w-[220px]">
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
        <DealModal title={modal.mode === 'create' ? 'Neuer BK-Deal' : 'BK-Deal bearbeiten'}
          fields={fields} initial={modal.data} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
