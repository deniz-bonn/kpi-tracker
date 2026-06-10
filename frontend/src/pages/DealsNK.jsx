import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, employeesApi } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { formatEuro, currentMonat } from '../utils/format';

const QUELLEN = ['Cold Calling', 'Mail', 'Fax', 'Ad', 'Empfehlung', 'Follow Up', 'Inbound', 'Leadhandy', 'Post'];
const STATUS_OPTS = ['Offen', 'Gewonnen', 'Verloren', 'In Verhandlung', 'In Closing Call 2'];
const STANDORTE = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];

const DIENSTLEISTUNGEN_NK = ['RaaS', 'RaaS Kleinkunde', 'Performance Recruiting'];
const AUTO_VL_OPTS = ['Ja', 'Nein'];
const ABGERECHNET_OPTS = ['Nein', 'Ja', 'On Hold'];

// ── KPI-Zusammenfassung ──────────────────────────────────────────────────────
function KpiBlock({ kpis }) {
  const rows = [
    { label: 'Angebote insgesamt', val: kpis.total, hi: true },
    { label: 'Angebote realisiert', val: kpis.gewonnen },
    { label: 'Angebote nicht realisiert', val: kpis.verloren },
    { label: 'Angebote in Verhandlung', val: kpis.in_verhandlung },
    { label: 'Angebote in Closing Call 2', val: kpis.in_closing2 },
    { label: 'Realisierungsquote nach Angeboten', val: `${kpis.quote_angebote}%`, hi: true },
    { label: 'Realisierung Angebotswert', val: formatEuro(kpis.ae_summe) },
    { label: 'Realisierungsquote nach Angebotswert', val: `${kpis.quote_wert}%` },
    { label: 'Angebotswert insgesamt', val: formatEuro(kpis.angebotswert_gesamt), hi: true },
    { label: 'Wert offener Angebote', val: formatEuro(kpis.wert_offen) },
    { label: 'Angebote realisiert Cold Calling', val: kpis.gewonnen_cc },
    { label: 'Angebote realisiert Mail', val: kpis.gewonnen_mail },
    { label: 'Angebote realisiert Fax', val: kpis.gewonnen_fax },
    { label: 'Realisierte Angebote mit AV in %', val: `${kpis.quote_mit_av}%`, hi: true },
    { label: 'Auto-Verlängerung (gew. Deals)', val: `${kpis.auto_verlaengerung} (${kpis.auto_verlaengerung_quote}%)` },
    { label: 'Abgerechnet (gew. Deals)',        val: `${kpis.abgerechnet_ja} (${kpis.abgerechnet_quote}%)` },
  ];
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 bg-[#2d2e30] border-b border-[#444]">
        <span className="text-xs font-bold text-white uppercase tracking-wide">Gesamt-KPIs</span>
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

// ── Setter-Tabelle ────────────────────────────────────────────────────────────
function SetterBlock({ stats }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 bg-[#2d2e30] border-b border-[#444]">
        <span className="text-xs font-bold text-white uppercase tracking-wide">Abschlussquote nach Setter (Closing → Close)</span>
      </div>
      <table className="w-full text-xs">
        <tbody className="divide-y divide-gray-100">
          {stats.length === 0
            ? <tr><td colSpan={2} className="px-3 py-4 text-center text-gray-400">Keine Daten</td></tr>
            : stats.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-1.5 text-gray-600 font-medium">{s.name}</td>
                <td className={`px-3 py-1.5 text-right font-bold ${parseFloat(s.quote) >= 30 ? 'text-green-600' : parseFloat(s.quote) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {s.quote}%
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ── Closer-Tabelle (Google-Sheet-Stil: 2 Zeilen pro Closer) ──────────────────
function CloserBlock({ stats }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 bg-[#2d2e30] border-b border-[#444]">
        <span className="text-xs font-bold text-white uppercase tracking-wide">Angebote & Abschlussquote nach Closer</span>
      </div>
      <table className="w-full text-xs">
        <tbody className="divide-y divide-gray-100">
          {stats.length === 0
            ? <tr><td colSpan={2} className="px-3 py-4 text-center text-gray-400">Keine Daten</td></tr>
            : stats.map((c, i) => (
              <tbody key={i} className="divide-y divide-gray-100">
                <tr className="bg-white">
                  <td className="px-3 py-1 text-gray-600">{c.name} Angebote insgesamt</td>
                  <td className="px-3 py-1 text-right font-bold text-gray-900">{c.total}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-1 text-gray-600">{c.name} Abschlussquote</td>
                  <td className={`px-3 py-1 text-right font-bold ${parseFloat(c.quote) >= 30 ? 'text-green-600' : parseFloat(c.quote) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {c.quote}%
                  </td>
                </tr>
              </tbody>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────
export default function DealsNK() {
  const { company, companies } = useOutletContext();
  const qc = useQueryClient();
  const [monat, setMonat] = useState(currentMonat());
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [modal, setModal] = useState(null);
  const [showKpis, setShowKpis] = useState(true);

  const [filterQuelle, setFilterQuelle]     = useState('');
  const [filterCloser, setFilterCloser]     = useState('');
  const [filterOpener, setFilterOpener]     = useState('');
  const [filterSetter, setFilterSetter]     = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterStandort, setFilterStandort] = useState('');

  const params = { ...(company && { company_id: company }), ...(!showAllMonths && { monat }) };
  const { data: deals = [] } = useQuery({
    queryKey: ['deals-nk', params], queryFn: () => dealsApi.nk.list(params),
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'], queryFn: () => employeesApi.list(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['deals-nk'] });
    qc.invalidateQueries({ queryKey: ['kpis-overview'] });
    qc.invalidateQueries({ queryKey: ['kpis-monthly'] });
    qc.invalidateQueries({ queryKey: ['kpis-employees'] });
    qc.invalidateQueries({ queryKey: ['kpis-dashboard'] });
    qc.invalidateQueries({ queryKey: ['auftragseingang'] });
  };

  const createMut = useMutation({ mutationFn: dealsApi.nk.create, onSuccess: () => { invalidate(); setModal(null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => dealsApi.nk.update(id, data), onSuccess: () => { invalidate(); setModal(null); } });
  const deleteMut = useMutation({ mutationFn: dealsApi.nk.delete, onSuccess: invalidate });

  const empOptions  = employees.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));
  const compOpts    = companies.map(c => ({ value: c.id, label: c.name }));
  const closerList  = employees.filter(e => ['NKV-Closer', 'Multi'].includes(e.rolle));
  const openerList  = employees.filter(e => ['Opener', 'Multi'].includes(e.rolle));
  const setterList  = employees.filter(e => ['Setter', 'Multi'].includes(e.rolle));
  const closerOptions = closerList.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));
  const openerOptions = openerList.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));
  const setterOptions = setterList.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));

  const fields = [
    { name: 'datum',          label: 'Datum',                    type: 'date',   required: true },
    { name: 'monat',          label: 'Monat (YYYY-MM)',                           required: true },
    { name: 'company_id',     label: 'Company',                  type: 'select', options: compOpts, required: true },
    { name: 'kunde',          label: 'Kunde',                                     required: true },
    { name: 'angebotsnummer', label: 'Angebotsnummer' },
    { name: 'dienstleistung', label: 'Dienstleistung',            type: 'select', options: DIENSTLEISTUNGEN_NK },
    { name: 'closer_id',      label: 'Closer',                   type: 'select', options: closerOptions },
    { name: 'opener_id',      label: 'Opener',                   type: 'select', options: openerOptions },
    { name: 'setter_id',      label: 'Setter',                   type: 'select', options: setterOptions },
    { name: 'quelle',         label: 'Quelle',                   type: 'select', options: QUELLEN },
    { name: 'angebotswert',   label: 'Angebotswert (€)',          type: 'number', required: true },
    { name: 'ae_wert',        label: 'AE-Wert (€)',               type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'laufzeit_monate',label: 'Laufzeit (Monate)',          type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'automatische_verlaengerung', label: 'Automatische Verlängerung', type: 'select', options: AUTO_VL_OPTS, required: true },
    { name: 'status',         label: 'Status',                   type: 'select', options: STATUS_OPTS, required: true },
    { name: 'abgerechnet',    label: 'Abgerechnet',               type: 'select', options: ABGERECHNET_OPTS },
    { name: 'kommentar',      label: 'Kommentar',                 type: 'textarea' },
  ];

  const handleSave = (form) => {
    const data = { ...form, monat: form.monat || monat, company_id: form.company_id || company || null };
    if (modal.mode === 'create') createMut.mutate(data);
    else updateMut.mutate({ id: modal.data.id, data });
  };

  // Gefilterte Deals
  const filtered = useMemo(() => deals.filter(d =>
    (!filterQuelle   || d.quelle          === filterQuelle) &&
    (!filterCloser   || String(d.closer_id) === filterCloser) &&
    (!filterOpener   || String(d.opener_id) === filterOpener) &&
    (!filterSetter   || String(d.setter_id) === filterSetter) &&
    (!filterStatus   || d.status           === filterStatus) &&
    (!filterStandort || d.closer_standort  === filterStandort)
  ), [deals, filterQuelle, filterCloser, filterOpener, filterSetter, filterStatus, filterStandort]);

  // KPIs aus gefilterten Deals
  const kpis = useMemo(() => {
    const gew = filtered.filter(d => d.status === 'Gewonnen');
    const ae  = gew.reduce((s, d) => s + (Number(d.ae_wert)      || 0), 0);
    const agw = filtered.reduce((s, d) => s + (Number(d.angebotswert) || 0), 0);
    const n   = filtered.length;
    const autoJ = gew.filter(d => d.automatische_verlaengerung === 'Ja').length;
    const abgJ  = gew.filter(d => d.abgerechnet === 'Ja').length;
    return {
      total:                  n,
      gewonnen:               gew.length,
      verloren:               filtered.filter(d => d.status === 'Verloren').length,
      in_verhandlung:         filtered.filter(d => d.status === 'In Verhandlung').length,
      in_closing2:            filtered.filter(d => d.status === 'In Closing Call 2').length,
      ae_summe:               ae,
      angebotswert_gesamt:    agw,
      wert_offen:             filtered.filter(d => !['Gewonnen','Verloren'].includes(d.status))
                                .reduce((s, d) => s + (Number(d.angebotswert) || 0), 0),
      gewonnen_cc:            gew.filter(d => d.quelle === 'Cold Calling').length,
      gewonnen_mail:          gew.filter(d => d.quelle === 'Mail').length,
      gewonnen_fax:           gew.filter(d => d.quelle === 'Fax').length,
      quote_angebote:         n > 0 ? (gew.length / n * 100).toFixed(2) : '0.00',
      quote_wert:             agw > 0 ? (ae / agw * 100).toFixed(2) : '0.00',
      quote_mit_av:           gew.length > 0
                                ? (gew.filter(d => Number(d.ae_wert) > 0).length / gew.length * 100).toFixed(2)
                                : '0.00',
      auto_verlaengerung:       autoJ,
      auto_verlaengerung_quote: gew.length > 0 ? (autoJ / gew.length * 100).toFixed(1) : '0.0',
      abgerechnet_ja:           abgJ,
      abgerechnet_quote:        gew.length > 0 ? (abgJ / gew.length * 100).toFixed(1) : '0.0',
    };
  }, [filtered]);

  // Setter-Statistiken
  const setterStats = useMemo(() => {
    const m = {};
    filtered.forEach(d => {
      if (!d.setter_id) return;
      if (!m[d.setter_id]) m[d.setter_id] = { name: d.setter_name, total: 0, gewonnen: 0 };
      m[d.setter_id].total++;
      if (d.status === 'Gewonnen') m[d.setter_id].gewonnen++;
    });
    return Object.values(m)
      .map(s => ({ ...s, quote: s.total > 0 ? (s.gewonnen / s.total * 100).toFixed(2) : '0.00' }))
      .sort((a, b) => parseFloat(b.quote) - parseFloat(a.quote));
  }, [filtered]);

  // Closer-Statistiken
  const closerStats = useMemo(() => {
    const m = {};
    filtered.forEach(d => {
      if (!d.closer_id) return;
      if (!m[d.closer_id]) m[d.closer_id] = { name: d.closer_name, total: 0, gewonnen: 0 };
      m[d.closer_id].total++;
      if (d.status === 'Gewonnen') m[d.closer_id].gewonnen++;
    });
    return Object.values(m)
      .map(c => ({ ...c, quote: c.total > 0 ? (c.gewonnen / c.total * 100).toFixed(2) : '0.00' }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const sel = "bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5";
  const hasFilters = filterQuelle || filterCloser || filterOpener || filterSetter || filterStatus || filterStandort;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Neukunden (NK)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filtered.length} Angebote · {kpis.gewonnen} gewonnen · {kpis.quote_angebote}% · {formatEuro(kpis.ae_summe)} AE
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
            onClick={() => setModal({ mode: 'create', data: { status: 'Offen', datum: new Date().toISOString().slice(0,10), monat } })}
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
        <select value={filterQuelle} onChange={e => setFilterQuelle(e.target.value)} className={sel}>
          <option value="">Alle Quellen</option>
          {QUELLEN.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
        <select value={filterCloser} onChange={e => setFilterCloser(e.target.value)} className={sel}>
          <option value="">Alle Closer</option>
          {closerList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={filterOpener} onChange={e => setFilterOpener(e.target.value)} className={sel}>
          <option value="">Alle Opener</option>
          {openerList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={filterSetter} onChange={e => setFilterSetter(e.target.value)} className={sel}>
          <option value="">Alle Setter</option>
          {setterList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={sel}>
          <option value="">Alle Status</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setFilterQuelle(''); setFilterCloser(''); setFilterOpener('');
            setFilterSetter(''); setFilterStatus(''); setFilterStandort(''); }}
            className="text-xs text-gray-500 hover:text-white ml-1">✕ Zurücksetzen</button>
        )}
      </div>

      {/* KPI-Block (ein-/ausblendbar) */}
      {showKpis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <KpiBlock kpis={kpis} />
          <SetterBlock stats={setterStats} />
          <CloserBlock stats={closerStats} />
        </div>
      )}

      {/* Deals-Tabelle */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2d2e30] text-gray-300 text-xs uppercase">
            <tr>
              {['Datum','Kunde','Quelle','Closer','Opener','Setter','Angebotswert','AE-Wert','Status','Auto-VL','Abgerechnet','Notiz',''].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={13} className="text-center py-8 text-gray-400">Keine Deals gefunden</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.datum?.slice(0,10)}</td>
                <td className="px-3 py-2 text-gray-900 font-medium">{d.kunde}</td>
                <td className="px-3 py-2 text-gray-600">{d.quelle || '—'}</td>
                <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                  {d.closer_name || '—'}
                  {d.closer_standort && <span className="ml-1 text-gray-400">({d.closer_standort})</span>}
                </td>
                <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">{d.opener_name || '—'}</td>
                <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">{d.setter_name || '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.angebotswert ? formatEuro(d.angebotswert) : '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.ae_wert ? formatEuro(d.ae_wert) : '—'}</td>
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
        <DealModal
          title={modal.mode === 'create' ? 'Neuer NK-Deal' : 'NK-Deal bearbeiten'}
          fields={fields} initial={modal.data} onSave={handleSave} onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
