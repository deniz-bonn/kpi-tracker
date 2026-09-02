import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, employeesApi } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { formatEuro, formatMoney, companyCurrency, isDealCompanyActive, isAeCounted, currentMonat, periodLabel, periodFileSuffix } from '../utils/format';
import { celebrateWin, shouldCelebrate } from '../components/Celebration';

// AE-Euro-Betrag fuer Umsatz-Summen, 0 wenn der AE (noch) nicht getrackt wird (ae_ab_monat-Gate).
// Nur fuer realisierten AE (ae_summe); verlorener_ae bleibt ungegated (mögliches Volumen).
const aeEur = d => isAeCounted(d) ? (Number(d.ae_wert_eur ?? d.ae_wert) || 0) : 0;
import { useAuth } from '../context/AuthContext';
import { ROLLE_GRUPPE_LABEL, gruppeVonEmp, KAM_ROLLEN, PERSONEN_GRUPPEN } from '../utils/rollen';

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
    moeglicher_ae:    deals.reduce((s, d) => s + (Number(d.angebotswert_eur ?? d.angebotswert) || 0), 0),
    ae_summe:         gew.reduce((s, d)   => s + aeEur(d), 0),
    verlorener_ae:    verl.reduce((s, d)  => s + (Number(d.ae_wert_eur ?? d.ae_wert) || Number(d.angebotswert_eur ?? d.angebotswert) || 0), 0),
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
  const [zeitMode, setZeitMode]          = useState('monat'); // 'monat' | 'zeitraum' | 'alle'
  const [vonMonat, setVonMonat]          = useState(currentMonat());
  const [bisMonat, setBisMonat]          = useState(currentMonat());
  const [modal, setModal]                = useState(null);
  const [showKpis, setShowKpis]          = useState(true);
  const [showChurn, setShowChurn]        = useState(false);
  const [showVergleich, setShowVergleich] = useState(false); // KAM-vs-AM-Block, standardmaessig eingeklappt

  const [filterKam,      setFilterKam]      = useState('');
  const [filterRolle,    setFilterRolle]    = useState(''); // '' | 'kam' | 'am' (Rolle des Deal-KAMs)
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterStandort, setFilterStandort] = useState('');
  const [importResult,   setImportResult]   = useState(null);
  const importFileRef = useRef(null);

  // Nur im Monats-Modus serverseitig filtern; Zeitraum/Alle laden alles (Zeitraum filtert clientseitig)
  const params = { ...(company && { company_id: company }), ...(zeitMode === 'monat' && { monat }) };
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

  const maybeCelebrate = (row, prevStatus) => {
    if (shouldCelebrate(row?.status, prevStatus)) {
      celebrateWin({ kunde: row.kunde, betrag: Number(row.ae_wert) || 0, currency: companyCurrency(companies, row.company_id) });
    }
  };
  const createMut = useMutation({ mutationFn: dealsApi.vl.create, onSuccess: (row) => { invalidate(); setModal(null); maybeCelebrate(row, null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => dealsApi.vl.update(id, data), onSuccess: (row, vars) => { invalidate(); setModal(null); maybeCelebrate(row, vars?.prevStatus); } });
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
  // Deal-Formular: als KAM waehlbar sind alle VL-verantwortlichen Rollen (inkl. Account Manager/Multi).
  const kamList    = employees.filter(e => KAM_ROLLEN.includes(e.rolle));
  const kamOptions = kamList.map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));
  // Deal-KAM -> Gruppe ('kam' | 'am' | null) aus dem aktuellen Mitarbeiter-Datensatz (Rolle + bk_gruppe).
  const empById = useMemo(() => Object.fromEntries(employees.map(e => [String(e.id), e])), [employees]);
  const gruppeVonDeal = useCallback((d) => gruppeVonEmp(empById[String(d.kam_id)]), [empById]);
  // Erfassungswährung nach aktiver Company (CHF bei Risem, sonst €)
  const curSym = companyCurrency(companies, company) === 'CHF' ? 'CHF' : '€';

  const fields = [
    // Datum nachträglich ändern: nur Admin/Superadmin. Ändert NICHT den Berichtsmonat
    // (Feld "monat") und nicht die AE-Buchung (die hängt an gewonnen_monat).
    { name: 'datum',                 label: 'Datum der Vertragsverlängerung', type: 'date', required: true },
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
    { name: 'angebotswert',          label: `Möglicher AE (${curSym})`,        type: 'number', required: true },
    { name: 'ae_wert',               label: `Realisierter AE (${curSym})`,     type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'laufzeit_monate',       label: 'Neue Laufzeit (Monate)',  type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'wie_vielt_verlaengerung', label: 'Wievielte Verlängerung', type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'status',                label: 'Status',                  type: 'select', options: STATUS_OPTS, required: true },
    {
      name:     'gewonnen_datum',
      label:    'Realisiert am',
      type:     'date',
      hint:     'Datum, an dem die Verlängerung realisiert wurde — steuert den AE-Monat',
      show:     f => f.status === 'Gewonnen',
      required: f => f.status === 'Gewonnen',
      // Vorbelegung mit dem Kündigungsdatum (bucht AE im Kündigungsmonat, s. Regel), sonst heute.
      autoFill: (form, changedKey) =>
        changedKey === 'status' && form.status === 'Gewonnen' && !form.gewonnen_datum
          ? ((form.ende_kuendigungsfrist || '').slice(0, 10) || new Date().toISOString().slice(0, 10))
          : undefined,
    },
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
    else updateMut.mutate({ id: modal.data.id, data, prevStatus: modal.data.status });
  };

  // listDeals treibt die Liste (auch noch-nicht-aktive Companies); filtered = nur aktive, treibt Stats.
  const listDeals = useMemo(() => deals.filter(d =>
    (!filterKam      || String(d.kam_id)   === filterKam) &&
    (!filterRolle    || gruppeVonDeal(d)   === filterRolle) &&
    (!filterStatus   || d.status           === filterStatus) &&
    (!filterStandort || d.kam_standort     === filterStandort) &&
    (zeitMode !== 'zeitraum' || ((d.monat || '').trim() >= vonMonat && (d.monat || '').trim() <= bisMonat))
  ), [deals, filterKam, filterRolle, gruppeVonDeal, filterStatus, filterStandort, zeitMode, vonMonat, bisMonat]);
  const filtered = useMemo(() => listDeals.filter(isDealCompanyActive), [listDeals]);

  // Gesamt-KPIs
  const gesamtKpis = useMemo(() => calcKpis(filtered), [filtered]);

  // Personen-Filter-Dropdown: alle Mitarbeiter, die im geladenen Zeit-Scope als Deal-KAM vorkommen
  // (unabhaengig von der Rolle -> auch Account Manager & Ex-Rollen-Traeger mit historischen Deals),
  // nie Personen ohne Deals. Bei aktivem Rollen-Filter auf dessen Gruppe eingeschraenkt. Alphabetisch.
  const personenImScope = useMemo(() => {
    const zeitOk = d => zeitMode !== 'zeitraum' || ((d.monat || '').trim() >= vonMonat && (d.monat || '').trim() <= bisMonat);
    const byId = new Map();
    for (const d of deals) {
      if (!d.kam_id || !zeitOk(d)) continue;
      const id = String(d.kam_id);
      if (!byId.has(id)) { const e = empById[id]; byId.set(id, { id, name: e?.name || d.kam_name || `#${id}`, gruppe: gruppeVonEmp(e) }); }
    }
    let list = [...byId.values()];
    if (filterRolle) list = list.filter(p => p.gruppe === filterRolle);
    return list.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [deals, empById, filterRolle, zeitMode, vonMonat, bisMonat]);

  // Faellt die gewaehlte Person aus dem Dropdown (z. B. nach Rollen-Filter-Wechsel) -> Auswahl loeschen.
  useEffect(() => {
    if (filterKam && !personenImScope.some(p => p.id === filterKam)) setFilterKam('');
  }, [personenImScope, filterKam]);

  // KPIs pro KAM — alle KAMs (des aktiven Standort-Filters) immer anzeigen, auch ohne Deals im Zeitraum
  const kamKpis = useMemo(() => {
    const m = {};
    // KAMs vorinitialisieren — bei Standort-/KAM-Filter entsprechend einschränken
    employees
      // Ohne Rollen-Filter wie bisher (alle VL-Rollen); mit Rollen-Filter genau die gewaehlte Gruppe
      // (inkl. Multi mit passender Gruppen-Zuordnung).
      .filter(e => filterRolle ? gruppeVonEmp(e) === filterRolle : KAM_ROLLEN.includes(e.rolle))
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
  }, [filtered, employees, filterRolle, filterStandort, filterKam]);

  // Churn-Rate aufgeschlüsselt nach Verlängerungs-Nummer (1., 2., 3. …)
  const churnByNr = useMemo(() => {
    const m = {};
    filtered.forEach(d => {
      const raw = Number(d.wie_vielt_verlaengerung) || 0;
      const nr = raw >= 1 ? raw : 0; // 0 = ohne Angabe; ungültige Werte (z.B. -2) ebenfalls
      (m[nr] = m[nr] || []).push(d);
    });
    return Object.entries(m)
      .map(([nr, ds]) => {
        const k = calcKpis(ds);
        return { nr: Number(nr), ...k, offen: k.total - k.gewonnen - k.verloren };
      })
      .sort((a, b) => (a.nr || 999) - (b.nr || 999));
  }, [filtered]);

  // ── Kompakt-Vergleich KAM vs. AM ─────────────────────────────────────────────
  // Basis: respektiert Zeitmodus + Standort, IGNORIERT den Rollen-Filter (zeigt immer beide Gruppen)
  // sowie Status- und Personen-Filter — ein Status-Filter wuerde die Aufteilung
  // Gewonnen/Verloren/Offen trivial verzerren. Bei Einzelpersonen-Scope ausgeblendet. (BK-Muster)
  const vergleich = useMemo(() => {
    const basis = deals.filter(d =>
      (!filterStandort || d.kam_standort === filterStandort) &&
      (zeitMode !== 'zeitraum' || ((d.monat || '').trim() >= vonMonat && (d.monat || '').trim() <= bisMonat))
    ).filter(isDealCompanyActive);
    const build = g => {
      const ds = basis.filter(d => gruppeVonDeal(d) === g);
      const k = calcKpis(ds);
      const entschieden = k.gewonnen + k.verloren;
      // "Aktive Gruppenmitglieder" = Personen mit mindestens einem VL-Deal im Scope. Bewusst NICHT
      // zusaetzlich auf employees.aktiv gefiltert: sonst zaehlte der AE eines deaktivierten
      // Mitarbeiters mit, sein Kopf aber nicht -> verzerrter Pro-Kopf-Wert.
      const koepfe = new Set(ds.filter(d => d.kam_id).map(d => String(d.kam_id))).size;
      return {
        total: k.total, gewonnen: k.gewonnen, verloren: k.verloren,
        offen: k.total - k.gewonnen - k.verloren,
        quote: entschieden > 0 ? (k.gewonnen / entschieden * 100) : null,   // n/d wenn nichts entschieden
        ae: k.ae_summe, personen: koepfe,
        aePerKopf: koepfe > 0 ? k.ae_summe / koepfe : null,
      };
    };
    const ohneRolle = new Set(basis.filter(d => d.kam_id && !gruppeVonDeal(d)).map(d => String(d.kam_id))).size;
    return { kam: build('kam'), am: build('am'), ohneRolle };
  }, [deals, gruppeVonDeal, filterStandort, zeitMode, vonMonat, bisMonat]);
  // Bei Einzelpersonen-Filter ist ein Gruppenvergleich sinnlos -> ausblenden.
  const vergleichSichtbar = !filterKam;

  // Aktive Filter kompakt (Kopfzeile) + Dateinamen-Suffix (CSV).
  const filterSummary = [
    filterStandort && `Standort: ${filterStandort}`,
    filterRolle && `Rolle: ${ROLLE_GRUPPE_LABEL[filterRolle]}`,
    filterKam && `Mitarbeiter: ${(personenImScope.find(p => p.id === filterKam) || {}).name || empById[filterKam]?.name || filterKam}`,
    filterStatus && `Status: ${filterStatus}`,
  ].filter(Boolean).join(' · ');
  const fileFilterSuffix = filterRolle ? `_${filterRolle.toUpperCase()}` : '';

  // CSV der aktuell gefilterten Menge (client-seitig) — spiegelt ALLE Filter wie die Liste,
  // auch den clientseitigen Rollen-Filter, den der Server-Export nicht kennt. Spalten wie Server-Export.
  const exportFiltered = () => {
    const cols = [
      ['datum', d => d.datum], ['monat', d => d.monat], ['company', d => d.company_name], ['kunde', d => d.kunde],
      ['dienstleistung', d => d.dienstleistung], ['kam', d => d.kam_name],
      ['angebotswert', d => d.angebotswert], ['ae_wert', d => d.ae_wert], ['laufzeit_monate', d => d.laufzeit_monate],
      ['wie_vielt_verlaengerung', d => d.wie_vielt_verlaengerung], ['status', d => d.status], ['abgerechnet', d => d.abgerechnet],
      ['gewonnen_monat', d => d.gewonnen_monat], ['gewonnen_datum', d => (d.gewonnen_datum ? String(d.gewonnen_datum).slice(0, 10) : '')],
      ['kommentar', d => d.kommentar],
    ];
    const esc = v => { if (v == null) return ''; const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [cols.map(c => c[0]).join(','), ...filtered.map(d => cols.map(c => esc(c[1](d))).join(','))];
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `verlaengerungen${periodFileSuffix(zeitMode, monat, vonMonat, bisMonat)}${fileFilterSuffix}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  const sel = "bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5";
  const hasFilters = filterKam || filterRolle || filterStatus || filterStandort;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Verlängerungen (VL)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {periodLabel(zeitMode, monat, vonMonat, bisMonat)} · {filtered.length} anstehend · {gesamtKpis.gewonnen} realisiert · {gesamtKpis.verloren} Kündigungen · Churn-Rate: {gesamtKpis.churn_rate.toFixed(2)}%
          </p>
          {filterSummary && <p className="text-xs font-medium text-blue-600 mt-0.5">Filter: {filterSummary}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowKpis(v => !v)}
            className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1">
            {showKpis ? '▲ KPIs ausblenden' : '▼ KPIs einblenden'}
          </button>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
            {[['monat','Monat'],['zeitraum','Zeitraum'],['alle','Alle Monate']].map(([v, l]) => (
              <button key={v} onClick={() => setZeitMode(v)}
                className={`px-3 py-1.5 font-medium transition-colors ${zeitMode === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} ${v !== 'monat' ? 'border-l border-gray-300' : ''}`}>
                {l}
              </button>
            ))}
          </div>
          {zeitMode === 'monat' && (
            <input type="month" value={monat} onChange={e => setMonat(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          )}
          {zeitMode === 'zeitraum' && (
            <div className="flex items-center gap-1.5">
              <input type="month" value={vonMonat} onChange={e => setVonMonat(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
              <span className="text-gray-400 text-sm">–</span>
              <input type="month" value={bisMonat} onChange={e => setBisMonat(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
            </div>
          )}
          <button
            onClick={exportFiltered}
            title="Exportiert genau die aktuell gefilterte Menge"
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
        <select value={filterRolle} onChange={e => setFilterRolle(e.target.value)} className={sel} title="Rolle des zugeordneten KAM">
          <option value="">Alle Rollen</option>
          <option value="kam">Key Account Manager</option>
          <option value="am">Account Manager</option>
        </select>
        <select value={filterKam} onChange={e => setFilterKam(e.target.value)} className={sel} title="Mitarbeiter mit Deals im Zeitraum">
          <option value="">Alle Mitarbeiter</option>
          {PERSONEN_GRUPPEN.map(([g, label]) => {
            const opts = personenImScope.filter(p => p.gruppe === g);
            return opts.length ? (
              <optgroup key={label} label={label}>
                {opts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </optgroup>
            ) : null;
          })}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={sel}>
          <option value="">Alle Status</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setFilterKam(''); setFilterRolle(''); setFilterStatus(''); setFilterStandort(''); }}
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
                ['Churn-Rate (Anzahl)', `${gesamtKpis.churn_rate.toFixed(2)}%`],
                ['Möglicher AE',   formatEuro(gesamtKpis.moeglicher_ae)],
                ['Realisierter AE',formatEuro(gesamtKpis.ae_summe)],
                ['Verlorener AE',  formatEuro(gesamtKpis.verlorener_ae)],
                ['Abgerechnet',    `${gesamtKpis.abgerechnet_ja} (${gesamtKpis.abgerechnet_quote}%)`],
              ].map(([label, val]) => (
                <div key={label} className="text-xs">
                  <div className="text-gray-500 mb-0.5">{label}</div>
                  <div className={`font-bold ${label === 'Churn-Rate (Anzahl)'
                    ? (gesamtKpis.churn_rate > 70 ? 'text-red-600' : gesamtKpis.churn_rate > 40 ? 'text-amber-600' : 'text-green-600')
                    : 'text-gray-900'}`}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Churn-Rate nach Verlängerungs-Nummer */}
          <div className="rounded-lg border border-indigo-200 overflow-hidden">
            <button onClick={() => setShowChurn(v => !v)}
              className="w-full px-3 py-2 bg-indigo-700 hover:bg-indigo-600 flex items-center justify-between transition-colors">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Churn-Rate nach Verlängerung</span>
              <span className="text-indigo-200 text-xs">{showChurn ? '▲ Einklappen' : '▼ Anzeigen'}</span>
            </button>
            {showChurn && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-indigo-50 border-b border-indigo-100 text-indigo-800 font-medium">
                    <th className="px-3 py-2 text-left">Verlängerung</th>
                    <th className="px-3 py-2 text-right">Möglich (Anzahl)</th>
                    <th className="px-3 py-2 text-right">Realisiert (Anzahl)</th>
                    <th className="px-3 py-2 text-right">Offen</th>
                    <th className="px-3 py-2 text-right">Verloren</th>
                    <th className="px-3 py-2 text-right">Churn-Rate</th>
                    <th className="px-3 py-2 text-right">Realisierter AE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {churnByNr.length === 0
                    ? <tr><td colSpan={7} className="px-3 py-4 text-center text-gray-400">Keine Daten</td></tr>
                    : churnByNr.map(r => {
                        const cr = r.churn_rate;
                        const churnCls = cr > 70 ? 'text-red-600' : cr > 40 ? 'text-amber-600' : 'text-green-600';
                        return (
                          <tr key={r.nr} className="hover:bg-indigo-50/40">
                            <td className="px-3 py-2 font-medium text-gray-700">{r.nr === 0 ? 'Ohne Angabe' : `${r.nr}. Verlängerung`}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{r.total}</td>
                            <td className="px-3 py-2 text-right font-medium text-gray-900">{r.gewonnen}</td>
                            <td className="px-3 py-2 text-right text-gray-500">{r.offen}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{r.verloren}</td>
                            <td className={`px-3 py-2 text-right font-bold ${churnCls}`}>{cr.toFixed(1)}%</td>
                            <td className="px-3 py-2 text-right font-medium text-gray-900 whitespace-nowrap">{formatEuro(r.ae_summe)}</td>
                          </tr>
                        );
                      })}
                  {churnByNr.length > 0 && (
                    <tr className="bg-indigo-900 text-white font-bold">
                      <td className="px-3 py-2">Gesamt</td>
                      <td className="px-3 py-2 text-right">{gesamtKpis.total}</td>
                      <td className="px-3 py-2 text-right">{gesamtKpis.gewonnen}</td>
                      <td className="px-3 py-2 text-right">{gesamtKpis.total - gesamtKpis.gewonnen - gesamtKpis.verloren}</td>
                      <td className="px-3 py-2 text-right">{gesamtKpis.verloren}</td>
                      <td className="px-3 py-2 text-right">{gesamtKpis.churn_rate.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">{formatEuro(gesamtKpis.ae_summe)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
            {showChurn && (
            <p className="px-3 py-1.5 text-[10px] text-gray-400 bg-indigo-50/50 border-t border-indigo-100">
              Churn-Rate = (Möglich − Realisiert) / Möglich — gerechnet nach <b>Anzahl</b> der Verlängerungen, nicht nach Euro · offene Verlängerungen zählen noch als nicht realisiert · „Realisierter AE" ist der Euro-Wert der realisierten Verlängerungen und geht nicht in die Churn-Rate ein
            </p>
            )}
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

      {/* Kompakt-Vergleich KAM vs. AM — eigener Klappblock, ignoriert den Rollen-Filter (zeigt beide Gruppen) */}
      {vergleichSichtbar && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <button onClick={() => setShowVergleich(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">KAM vs. Account Manager</span>
            <span className="text-xs text-gray-400">{showVergleich ? '▲ einklappen' : '▼ vergleichen'}</span>
          </button>
          {showVergleich && (() => {
            const K = vergleich.kam, A = vergleich.am;
            // Bessere Seite dezent fett; null (n/d) verliert nie und gewinnt nie.
            const bcl = (a, b) => (a != null && (b == null || a > b)) ? 'font-bold text-gray-900' : 'text-gray-500';
            const pct = v => v == null ? '–' : `${v.toFixed(2)}%`;
            const eur = v => v == null ? '–' : formatEuro(v);
            const row = (label, g, o) => (
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap">{label}</td>
                <td className={`px-3 py-2 text-right ${bcl(g.total, o.total)}`}>{g.total}</td>
                <td className={`px-3 py-2 text-right ${bcl(g.gewonnen, o.gewonnen)}`}>{g.gewonnen}</td>
                <td className="px-3 py-2 text-right text-red-600">{g.verloren}</td>
                <td className="px-3 py-2 text-right text-gray-500">{g.offen}</td>
                <td className={`px-3 py-2 text-right ${bcl(g.quote, o.quote)}`}>{pct(g.quote)}</td>
                <td className={`px-3 py-2 text-right whitespace-nowrap ${bcl(g.ae, o.ae)}`}>{formatEuro(g.ae)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{g.personen}</td>
                <td className={`px-3 py-2 text-right whitespace-nowrap ${bcl(g.aePerKopf, o.aePerKopf)}`}>{eur(g.aePerKopf)}</td>
              </tr>
            );
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <th className="px-3 py-2 text-left">Gruppe</th>
                      <th className="px-3 py-2 text-right">Verlängerungen</th>
                      <th className="px-3 py-2 text-right">Gewonnen</th>
                      <th className="px-3 py-2 text-right">Verloren</th>
                      <th className="px-3 py-2 text-right">Offen</th>
                      <th className="px-3 py-2 text-right">VL-Quote</th>
                      <th className="px-3 py-2 text-right">AE realisiert</th>
                      <th className="px-3 py-2 text-right">Aktive Personen</th>
                      <th className="px-3 py-2 text-right">Ø AE / Kopf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row('Key Account Manager', K, A)}
                    {row('Account Manager', A, K)}
                  </tbody>
                </table>
                {vergleich.ohneRolle > 0 && (
                  <div className="px-3 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-100">
                    {vergleich.ohneRolle} Mitarbeiter mit VL-Deals ohne KAM/AM-Zuordnung (inkl. „Multi" ohne Auswahl) — in der Mitarbeiterverwaltung zuordnen
                  </div>
                )}
                <div className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100">
                  Gruppierung nach aktueller Rolle bzw. Gruppen-Zuordnung des KAM (Multi) · respektiert Zeitraum + Standort,
                  ignoriert Status- und Personen-Filter · VL-Quote = Gewonnen ÷ (Gewonnen + Verloren) · Ø AE/Kopf = AE ÷ Personen mit ≥ 1 VL-Deal im Zeitraum
                </div>
              </div>
            );
          })()}
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
            {listDeals.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-8 text-gray-400">Keine Deals gefunden</td></tr>
            ) : listDeals.map(d => (
              <tr key={d.id} className={`hover:bg-gray-50 ${d.status === 'Verloren' ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.datum?.slice(0,10)}</td>
                <td className="px-3 py-2 text-gray-900 font-medium">{d.kunde}</td>
                <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                  {d.kam_name || '—'}
                  {d.kam_standort && <span className="ml-1 text-gray-400">({d.kam_standort})</span>}
                </td>
                <td className="px-3 py-2 text-gray-600">{d.dienstleistung || '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.angebotswert ? formatMoney(d.angebotswert, d.currency) : '—'}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.ae_wert ? formatMoney(d.ae_wert, d.currency) : '—'}</td>
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
        <DealModal key={modal.mode === 'create' ? 'new' : modal.data?.id}
          title={modal.mode === 'create' ? 'Neue Verlängerung' : 'Verlängerung bearbeiten'}
          fields={fields} initial={modal.data} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
