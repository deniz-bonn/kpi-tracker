import { useState, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, employeesApi, exportApi } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { formatEuro, currentMonat } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTS = ['Offen', 'Gewonnen', 'Verloren'];
const STANDORTE   = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];

const DIENSTLEISTUNGEN_VL = ['RaaS Kontingente','RaaS Kleinkunde Laufzeit','Kontingent (Alt)','Karriereseite','Karriereseite Wartung','Social-Media','Glaubenssätze','Media-Day','Website','Sonstiges'];
const ABGERECHNET_OPTS = ['Nein', 'Ja', 'On Hold'];

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
  const [importResult,   setImportResult]   = useState(null);
  const importFileRef = useRef(null);

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
  const importCsvMut = useMutation({
    mutationFn: (payload) => dealsApi.vl.importCsv(payload),
    onSuccess: (result) => { setImportResult(result); invalidate(); },
  });

  const parseCSVRow = (line) => {
    const result = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
      else cur += c;
    }
    result.push(cur);
    return result.map(s => s.trim().replace(/^"|"$/g, ''));
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0]; if (!file) return; e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target.result || '').replace(/^﻿/, '').replace(/\r/g, '');
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { alert('Keine Daten in der Datei.'); return; }
      const hdrs = parseCSVRow(lines[0]);
      const idx = (h) => hdrs.findIndex(x => x.trim() === h);
      const rows = lines.slice(1).map(line => {
        const c = parseCSVRow(line);
        return {
          kunde:                  c[idx('Kunde')] || null,
          dienstleistung:         c[idx('Dienstleistung')] || null,
          datum:                  c[idx('Datum')] || null,
          auslaufend_am:          c[idx('Auslaufend am')] || null,
          wie_vielt_verlaengerung: c[idx('Wievielte Verlängerung')] || null,
          kam_name:               c[idx('Account Manager')] || null,
          angebotswert:           c[idx('Angebotswert')] || null,
          laufzeit_monate:        c[idx('Laufzeit Monate')] || null,
        };
      }).filter(r => r.kunde);
      if (rows.length === 0) { alert('Keine gültigen Zeilen gefunden.'); return; }
      if (!confirm(`${rows.length} Verlängerungen importieren?`)) return;
      importCsvMut.mutate({ rows, company_id: company || 1 });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const compOpts   = companies.map(c => ({ value: c.id, label: c.name }));
  const kamList    = employees.filter(e => ['KAM', 'Closer-KAM'].includes(e.rolle));
  const kamOptions = kamList.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));

  const fields = [
    { name: 'datum',                 label: 'Datum der Vertragsverlängerung', type: 'date', required: true, readOnly: modal?.mode === 'edit' },
    { name: 'monat',                 label: 'Monat (YYYY-MM)',                         required: true },
    { name: 'company_id',            label: 'Company',                 type: 'select', options: compOpts, required: true },
    { name: 'kunde',                 label: 'Kunde',                                   required: true },
    { name: 'kundennummer',          label: 'HubSpot ID' },
    { name: 'vertragsnummer',        label: 'Vertragsnummer' },
    { name: 'vertragsbeginn',        label: 'Vertragsbeginn',          type: 'date' },
    { name: 'ende_laufzeit',         label: 'Ende der Laufzeit',       type: 'date' },
    { name: 'ende_kuendigungsfrist', label: 'Ende der Kündigungsfrist', type: 'date' },
    { name: 'dienstleistung',        label: 'Dienstleistung',          type: 'select', options: DIENSTLEISTUNGEN_VL, required: f => f.status === 'Gewonnen' },
    ...(canSeeAll ? [{ name: 'kam_id', label: 'Account Manager', type: 'select', options: kamOptions }] : []),
    { name: 'angebotswert',          label: 'Möglicher AE (€)',        type: 'number', required: true },
    { name: 'ae_wert',               label: 'Realisierter AE (€)',     type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'laufzeit_monate',       label: 'Neue Laufzeit (Monate)',  type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'wie_vielt_verlaengerung', label: 'Wievielte Verlängerung', type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'status',                label: 'Status',                  type: 'select', options: STATUS_OPTS, required: true },
    { name: 'weitergeben_an_vertrieb', label: 'Weitergeben an Vertrieb?', type: 'select', options: ['Ja', 'Nein'], show: f => f.status === 'Verloren', required: f => f.status === 'Verloren', hint: 'Ja = Kunde erscheint im Kündigungen-Tab als Up-Sale Potenzial' },
    { name: 'gekuendigt_am',         label: 'Gekündigt am',            type: 'date',   show: f => f.status === 'Verloren', required: f => f.status === 'Verloren' },
    { name: 'auslaufend_am',         label: 'Auslaufend am',           type: 'date',   show: f => f.status === 'Verloren', required: f => f.status === 'Verloren' },
    { name: 'ansprechpartner',       label: 'Ansprechpartner kundenseitig', show: f => f.status === 'Verloren', required: f => f.weitergeben_an_vertrieb === 'Ja' },
    { name: 'telefon',               label: 'Telefonnummer',                show: f => f.status === 'Verloren', required: f => f.weitergeben_an_vertrieb === 'Ja' },
    { name: 'email_kontakt',         label: 'E-Mail Adresse',               show: f => f.status === 'Verloren', required: f => f.weitergeben_an_vertrieb === 'Ja' },
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
      .filter(e => ['KAM', 'Closer-KAM'].includes(e.rolle))
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
          <button onClick={() => importFileRef.current?.click()} disabled={importCsvMut.isPending}
            className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-600 text-sm rounded disabled:opacity-50">
            ↑ {importCsvMut.isPending ? 'Importiere…' : 'CSV Import'}
          </button>
          <input ref={importFileRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
          <button onClick={() => setModal({ mode: 'create', data: { status: 'Offen', datum: new Date().toISOString().slice(0,10), monat } })}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">
            + Neue Verlängerung
          </button>
        </div>
      </div>

      {/* Import-Ergebnis */}
      {importResult && (
        <div className={`rounded-lg border px-4 py-2.5 text-xs flex items-center justify-between ${
          importResult.errors?.length > 0 ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-green-300 bg-green-50 text-green-700'
        }`}>
          <span>
            {importResult.created} Verlängerungen importiert
            {importResult.errors?.length > 0 && ` · ${importResult.errors.length} Fehler: ${importResult.errors.join(', ')}`}
          </span>
          <button onClick={() => setImportResult(null)} className="ml-4 text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

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
        <div className="space-y-3">
          {/* Gesamt — kompakte Kennzahlen-Leiste */}
          <div className="rounded-lg border border-purple-300 overflow-hidden">
            <div className="px-3 py-2 bg-purple-700 border-b border-purple-600">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Gesamt-KPIs</span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 px-4 py-3 bg-purple-50">
              {[
                ['Anstehend',      gesamtKpis.total],
                ['Realisiert',     gesamtKpis.gewonnen],
                ['Kündigungen',    gesamtKpis.verloren],
                ['Churn-Rate',     `${gesamtKpis.churn_rate.toFixed(2)}%`],
                ['Möglicher AE',   formatEuro(gesamtKpis.moeglicher_ae)],
                ['Realisierter AE',formatEuro(gesamtKpis.ae_summe)],
                ['Verlorener AE',  formatEuro(gesamtKpis.verlorener_ae)],
                ['Abgerechnet',    `${gesamtKpis.abgerechnet_ja} (${gesamtKpis.abgerechnet_quote}%)`],
              ].map(([label, val]) => (
                <div key={label} className="text-xs">
                  <div className="text-gray-500 mb-0.5">{label}</div>
                  <div className={`font-bold ${label === 'Churn-Rate'
                    ? (gesamtKpis.churn_rate > 70 ? 'text-red-600' : gesamtKpis.churn_rate > 40 ? 'text-amber-600' : 'text-green-600')
                    : 'text-gray-900'}`}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro KAM — kompakte Vergleichstabelle */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 bg-[#2d2e30] border-b border-[#444]">
              <span className="text-xs font-bold text-white uppercase tracking-wide">KPIs nach Account Manager</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <th className="px-3 py-2 text-left">Account Manager</th>
                    <th className="px-3 py-2 text-right">Anstehend</th>
                    <th className="px-3 py-2 text-right">Realisiert</th>
                    <th className="px-3 py-2 text-right">Kündigungen</th>
                    <th className="px-3 py-2 text-right">Churn-Rate</th>
                    <th className="px-3 py-2 text-right">Möglicher AE</th>
                    <th className="px-3 py-2 text-right">Realisierter AE</th>
                    <th className="px-3 py-2 text-right">Verlorener AE</th>
                    <th className="px-3 py-2 text-right">Abgerechnet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kamKpis.length === 0
                    ? <tr><td colSpan={9} className="px-3 py-4 text-center text-gray-400">Keine Daten</td></tr>
                    : kamKpis.map(k => {
                        const cr = k.kpis.churn_rate;
                        const churnCls = cr > 70 ? 'text-red-600' : cr > 40 ? 'text-amber-600' : 'text-green-600';
                        return (
                          <tr key={k.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap">{k.name}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{k.kpis.total}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{k.kpis.gewonnen}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{k.kpis.verloren}</td>
                            <td className={`px-3 py-2 text-right font-bold ${churnCls}`}>
                              {cr.toFixed(2)}%
                            </td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">{formatEuro(k.kpis.moeglicher_ae)}</td>
                            <td className="px-3 py-2 text-right font-bold text-gray-900 whitespace-nowrap">{formatEuro(k.kpis.ae_summe)}</td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">{formatEuro(k.kpis.verlorener_ae)}</td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">{k.kpis.abgerechnet_ja} ({k.kpis.abgerechnet_quote}%)</td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>
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
