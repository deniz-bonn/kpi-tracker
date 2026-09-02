import { useState, useMemo, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, employeesApi } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { formatEuro, formatMoney, companyCurrency, isDealCompanyActive, isAeCounted, currentMonat, periodLabel, periodFileSuffix } from '../utils/format';
import { celebrateWin, shouldCelebrate } from '../components/Celebration';

// AE-Euro-Betrag fuer Umsatz-Summen, 0 wenn der AE (noch) nicht getrackt wird (ae_ab_monat-Gate).
const aeEur = d => isAeCounted(d) ? (Number(d.ae_wert_eur ?? d.ae_wert) || 0) : 0;
import { useAuth } from '../context/AuthContext';
import { ROLLE_GRUPPE_LABEL, gruppeVonEmp, KAM_ROLLEN, PERSONEN_GRUPPEN } from '../utils/rollen';

const STATUS_OPTS = ['Offen', 'Gewonnen', 'Verloren'];
const STANDORTE   = ['Bonn / Braunschweig', 'Österreich', 'Schweiz'];
const matchStandort = (kamStandort, filter) => {
  if (!filter) return true;
  if (filter === 'Bonn / Braunschweig') return kamStandort === 'Bonn' || kamStandort === 'Braunschweig';
  return kamStandort === filter;
};

const DIENSTLEISTUNGEN_BK = ['RaaS Kontingente','RaaS Kleinkunde Laufzeit','Kontingent (Alt)','Karriereseite','Karriereseite Wartung','Social-Media','Glaubenssätze','Media-Day','Website','Sonstiges'];
const AUTO_VL_OPTS = ['Ja', 'Nein'];
const ABGERECHNET_OPTS = ['Nein', 'Ja', 'On Hold'];

// Rollen-Gruppen (KAM/AM) kommen zentral aus utils/rollen.js — gleiche Definition wie im VL-Bereich.

// ── KPIs aus einem Deal-Array berechnen ──────────────────────────────────────
function calcKpis(deals) {
  const gew = deals.filter(d => d.status === 'Gewonnen');
  const ae  = gew.reduce((s, d) => s + aeEur(d), 0);
  const agw = deals.reduce((s, d) => s + (Number(d.angebotswert_eur ?? d.angebotswert) || 0), 0);
  const agwGew = gew.reduce((s, d) => s + (Number(d.angebotswert_eur ?? d.angebotswert) || 0), 0); // Angebotswert der gewonnenen Deals
  const n   = deals.length;
  const autoJ     = gew.filter(d => d.automatische_verlaengerung === 'Ja').length;
  const abgJ      = gew.filter(d => d.abgerechnet === 'Ja').length;
  const danielJ   = deals.filter(d => d.termin_mit_daniel === 'Ja').length;
  const danielGew = gew.filter(d => d.termin_mit_daniel === 'Ja').length;
  return {
    total:               n,
    gewonnen:            gew.length,
    verloren:            deals.filter(d => d.status === 'Verloren').length,
    ae_summe:            ae,
    angebotswert_gesamt: agw,
    angebotswert_gewonnen: agwGew,
    wert_offen:          deals.filter(d => !['Gewonnen','Verloren'].includes(d.status))
                           .reduce((s, d) => s + (Number(d.angebotswert_eur ?? d.angebotswert) || 0), 0),
    quote_angebote:      n > 0 ? (gew.length / n * 100).toFixed(2) : '0.00',
    // Annahmequote nach Angebotswert (€): gewonnener Angebotswert ÷ gesamter Angebotswert.
    quote_angebotswert:  agw > 0 ? (agwGew / agw * 100).toFixed(2) : '0.00',
    quote_wert:          agw > 0 ? (ae / agw * 100).toFixed(2) : '0.00',
    auto_verlaengerung:       autoJ,
    auto_verlaengerung_quote: gew.length > 0 ? (autoJ / gew.length * 100).toFixed(1) : '0.0',
    abgerechnet_ja:           abgJ,
    abgerechnet_quote:        gew.length > 0 ? (abgJ / gew.length * 100).toFixed(1) : '0.0',
    daniel_termine:           danielJ,
    daniel_gewonnen:          danielGew,
    daniel_quote:             danielJ > 0 ? (danielGew / danielJ * 100).toFixed(0) : '—',
  };
}

// Annahmequote-Ampel: <25% rot · 25–33% gelb · >33% grün
const quoteColor = q => q > 33 ? 'text-green-600' : q >= 25 ? 'text-amber-600' : 'text-red-600';

// ── Hauptkomponente ──────────────────────────────────────────────────────────
export default function DealsBK() {
  const { company, companies } = useOutletContext();
  const { canSeeAll, user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [monat, setMonat]               = useState(currentMonat());
  const [zeitMode, setZeitMode]         = useState('monat'); // 'monat' | 'zeitraum' | 'alle'
  const [vonMonat, setVonMonat]         = useState(currentMonat());
  const [bisMonat, setBisMonat]         = useState(currentMonat());
  const [modal, setModal]               = useState(null);
  const [showKpis, setShowKpis]         = useState(true);

  const [viewMode,       setViewMode]       = useState('alle');
  const [filterKam,      setFilterKam]      = useState('');
  const [filterRolle,    setFilterRolle]    = useState(''); // '' | 'kam' | 'am' (Rolle des Deal-KAMs)
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterStandort, setFilterStandort] = useState('');
  const [filterDienstleistung, setFilterDienstleistung] = useState('');
  const [filterMinAe,    setFilterMinAe]    = useState('');
  const [filterMaxAe,    setFilterMaxAe]    = useState('');
  const [showVergleich,  setShowVergleich]  = useState(false); // KAM-vs-AM-Block, standardmaessig eingeklappt

  // Nur im Monats-Modus serverseitig filtern; Zeitraum/Alle laden alles (Zeitraum filtert clientseitig).
  const params = { ...(company && { company_id: company }), ...(zeitMode === 'monat' && { monat }) };
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

  const maybeCelebrate = (row, prevStatus) => {
    if (shouldCelebrate(row?.status, prevStatus)) {
      celebrateWin({ kunde: row.kunde, betrag: Number(row.ae_wert) || 0, currency: companyCurrency(companies, row.company_id) });
    }
  };
  const createMut = useMutation({ mutationFn: dealsApi.bk.create, onSuccess: (row) => { invalidate(); setModal(null); maybeCelebrate(row, null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => dealsApi.bk.update(id, data), onSuccess: (row, vars) => { invalidate(); setModal(null); maybeCelebrate(row, vars?.prevStatus); } });
  const deleteMut = useMutation({ mutationFn: dealsApi.bk.delete, onSuccess: invalidate });

  const compOpts   = companies.map(c => ({ value: c.id, label: c.name }));
  // Deal-Formular: als KAM waehlbar sind alle BK-verantwortlichen Rollen (inkl. Account Manager/Multi).
  const kamOptions = employees.filter(e => KAM_ROLLEN.includes(e.rolle)).map(e => ({ value: e.id, label: `${e.name} (${e.company_name})` }));
  // Deal-KAM -> Gruppe ('kam' | 'am' | null) aus dem aktuellen Mitarbeiter-Datensatz (Rolle + bk_gruppe).
  const empById = useMemo(() => Object.fromEntries(employees.map(e => [String(e.id), e])), [employees]);
  const gruppeVonDeal = useCallback((d) => gruppeVonEmp(empById[String(d.kam_id)]), [empById]);

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
  // Erfassungswährung nach aktiver Company (CHF bei Risem, sonst €)
  const curSym = companyCurrency(companies, company) === 'CHF' ? 'CHF' : '€';

  const fields = [
    // Datum nachträglich ändern: nur Admin/Superadmin. Ändert NICHT den Berichtsmonat
    // (Feld "monat") und nicht die AE-Buchung (die hängt an gewonnen_monat).
    { name: 'datum',          label: 'Datum',             type: 'date',   required: true, readOnly: modal?.mode === 'edit' && !isAdmin },
    { name: 'monat',          label: 'Monat (YYYY-MM)',                   required: true },
    { name: 'company_id',     label: 'Company',           type: 'select', options: compOpts, required: true },
    { name: 'kunde',          label: 'Kunde',                             required: true },
    { name: 'kundennummer',   label: 'HubSpot ID' },
    { name: 'dienstleistung', label: 'Dienstleistung',    type: 'select', options: DIENSTLEISTUNGEN_BK, required: f => f.status === 'Gewonnen' },
    ...(canSeeAll ? [{ name: 'kam_id', label: 'KAM', type: 'select', options: kamOptions }] : []),
    { name: 'angebotswert',   label: `Angebotswert (${curSym})`,  type: 'number', required: true },
    { name: 'ae_wert',        label: `AE-Wert (${curSym})`,       type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'laufzeit_monate',label: 'Laufzeit (Monate)', type: 'number', required: f => f.status === 'Gewonnen' },
    { name: 'termin_mit_daniel', label: 'Termin mit Daniel?', type: 'select', options: ['Ja', 'Nein'], required: true },
    { name: 'automatische_verlaengerung', label: 'Automatische Verlängerung', type: 'select', options: AUTO_VL_OPTS, required: true },
    { name: 'status',         label: 'Status',            type: 'select', options: STATUS_OPTS, required: true },
    {
      name:     'gewonnen_datum',
      label:    'Annahmedatum',
      type:     'date',
      hint:     'Datum, an dem der Kunde den Deal angenommen hat',
      show:     f => f.status === 'Gewonnen',
      required: f => f.status === 'Gewonnen',
      autoFill: (form, changedKey) =>
        changedKey === 'status' && form.status === 'Gewonnen' && !form.gewonnen_datum
          ? new Date().toISOString().slice(0, 10)
          : undefined,
    },
    { name: 'abgerechnet',    label: 'Abgerechnet',       type: 'select', options: ABGERECHNET_OPTS },
    { name: 'kommentar',      label: 'Kommentar',         type: 'textarea' },
  ];

  const handleSave = (form) => {
    const data = { ...form, monat: form.monat || monat, company_id: form.company_id || company || null };
    if (modal.mode === 'create') createMut.mutate(data);
    else updateMut.mutate({ id: modal.data.id, data, prevStatus: modal.data.status });
  };

  // €-Wert wie in den KPIs (CHF -> EUR via *_eur). Filter "Angebotshöhe" vergleicht denselben Wert.
  const aeVal = d => Number(d.angebotswert_eur ?? d.angebotswert) || 0;
  // Dienstleistungs-Optionen = tatsächlich in den geladenen Deals vorkommende Werte (distinct, alphabetisch).
  const dienstleistungOptions = useMemo(
    () => [...new Set(deals.map(d => d.dienstleistung).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de')),
    [deals]);

  // listDeals treibt die Liste (auch noch-nicht-aktive Companies); filtered = nur aktive, treibt Stats.
  const listDeals = useMemo(() => deals.filter(d =>
    (canSeeAll || viewMode === 'alle' || String(d.kam_id) === String(user?.employee_id)) &&
    (!filterKam      || String(d.kam_id)    === filterKam) &&
    (!filterRolle    || gruppeVonDeal(d)    === filterRolle) &&
    (!filterStatus   || d.status            === filterStatus) &&
    matchStandort(d.kam_standort, filterStandort) &&
    (!filterDienstleistung || d.dienstleistung === filterDienstleistung) &&
    (!filterMinAe || aeVal(d) >= Number(filterMinAe)) &&
    (!filterMaxAe || aeVal(d) <= Number(filterMaxAe)) &&
    (zeitMode !== 'zeitraum' || ((d.monat || '').trim() >= vonMonat && (d.monat || '').trim() <= bisMonat))
  ), [deals, filterKam, filterRolle, gruppeVonDeal, filterStatus, filterStandort, filterDienstleistung, filterMinAe, filterMaxAe, viewMode, canSeeAll, user?.employee_id, zeitMode, vonMonat, bisMonat]);
  const filtered = useMemo(() => listDeals.filter(isDealCompanyActive), [listDeals]);

  // Gesamt-KPIs
  const gesamtKpis = useMemo(() => calcKpis(filtered), [filtered]);

  // KPIs pro KAM — alle KAMs (des aktiven Standort-Filters) immer anzeigen, auch ohne Deals im Zeitraum
  const kamKpis = useMemo(() => {
    const m = {};
    // KAMs vorinitialisieren — bei Standort-/KAM-Filter entsprechend einschränken
    employees
      // Ohne Rollen-Filter wie bisher (KAM/Closer-KAM); mit Rollen-Filter genau die gewaehlte Gruppe
      // (inkl. Multi mit passender bk_gruppe-Zuordnung).
      .filter(e => filterRolle ? gruppeVonEmp(e) === filterRolle : ['KAM', 'Closer-KAM'].includes(e.rolle))
      .filter(e => matchStandort(e.standort, filterStandort))
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

  // ── Kompakt-Vergleich KAM vs. AM ─────────────────────────────────────────────
  // Basis: respektiert Zeitmodus + Standort + Dienstleistung + Angebotshöhe, IGNORIERT den Rollen-Filter
  // (zeigt immer beide Gruppen) sowie Status- und Personen-Filter. Bei Einzelpersonen-Scope ausgeblendet.
  const vergleich = useMemo(() => {
    const basis = deals.filter(d =>
      (canSeeAll || viewMode === 'alle' || String(d.kam_id) === String(user?.employee_id)) &&
      matchStandort(d.kam_standort, filterStandort) &&
      (!filterDienstleistung || d.dienstleistung === filterDienstleistung) &&
      (!filterMinAe || aeVal(d) >= Number(filterMinAe)) &&
      (!filterMaxAe || aeVal(d) <= Number(filterMaxAe)) &&
      (zeitMode !== 'zeitraum' || ((d.monat || '').trim() >= vonMonat && (d.monat || '').trim() <= bisMonat))
    ).filter(isDealCompanyActive);
    const headcount = g => employees.filter(e => e.aktiv && gruppeVonEmp(e) === g && matchStandort(e.standort, filterStandort)).length;
    const build = g => {
      const k = calcKpis(basis.filter(d => gruppeVonDeal(d) === g));
      const hc = headcount(g);
      return {
        angebote: k.total, gewonnen: k.gewonnen, quote: parseFloat(k.quote_angebote),
        ae: k.ae_summe, avgAngebot: k.total > 0 ? k.angebotswert_gesamt / k.total : 0,
        personen: hc, aePerKopf: hc > 0 ? k.ae_summe / hc : 0,
      };
    };
    const ohneRolle = new Set(basis.filter(d => d.kam_id && !gruppeVonDeal(d)).map(d => String(d.kam_id))).size;
    return { kam: build('kam'), am: build('am'), ohneRolle };
  }, [deals, employees, gruppeVonDeal, filterStandort, filterDienstleistung, filterMinAe, filterMaxAe, zeitMode, vonMonat, bisMonat, canSeeAll, viewMode, user?.employee_id]);
  // Bei Einzelpersonen-Scope (KAM-Filter oder Nur-meine) ist ein Gruppenvergleich sinnlos -> ausblenden.
  const vergleichSichtbar = !filterKam && !(!canSeeAll && viewMode === 'eigene');

  const sel = "bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5";
  const hasFilters = filterKam || filterRolle || filterStatus || filterStandort || filterDienstleistung || filterMinAe || filterMaxAe;
  const resetFilters = () => { setFilterKam(''); setFilterRolle(''); setFilterStatus(''); setFilterStandort(''); setFilterDienstleistung(''); setFilterMinAe(''); setFilterMaxAe(''); };

  // Aktive Filter kompakt (KPI-Kopfzeile) + Dateinamen-Suffix (CSV).
  const filterSummary = [
    filterStandort && `Standort: ${filterStandort}`,
    filterRolle && `Rolle: ${ROLLE_GRUPPE_LABEL[filterRolle]}`,
    filterKam && `Mitarbeiter: ${(personenImScope.find(p => p.id === filterKam) || {}).name || empById[filterKam]?.name || filterKam}`,
    filterStatus && `Status: ${filterStatus}`,
    filterDienstleistung && `Dienstleistung: ${filterDienstleistung}`,
    filterMinAe && `ab ${formatEuro(Number(filterMinAe))}`,
    filterMaxAe && `bis ${formatEuro(Number(filterMaxAe))}`,
  ].filter(Boolean).join(' · ');
  const fileFilterSuffix = [
    filterDienstleistung && '_' + filterDienstleistung.replace(/[^\wÄÖÜäöüß]+/g, '-'),
    filterMinAe && `_ab${filterMinAe}`,
    filterMaxAe && `_bis${filterMaxAe}`,
  ].filter(Boolean).join('');

  // CSV der aktuell gefilterten Menge (client-seitig) — spiegelt ALLE Filter wie die Liste. Spalten wie Server-Export.
  const exportFiltered = () => {
    const cols = [
      ['datum', d => d.datum], ['monat', d => d.monat], ['company', d => d.company_name], ['kunde', d => d.kunde],
      ['angebotsnummer', d => d.angebotsnummer], ['dienstleistung', d => d.dienstleistung], ['kam', d => d.kam_name],
      ['angebotswert', d => d.angebotswert], ['ae_wert', d => d.ae_wert], ['laufzeit_monate', d => d.laufzeit_monate],
      ['automatische_verlaengerung', d => d.automatische_verlaengerung], ['status', d => d.status], ['abgerechnet', d => d.abgerechnet],
      ['gewonnen_monat', d => d.gewonnen_monat], ['gewonnen_datum', d => (d.gewonnen_datum ? String(d.gewonnen_datum).slice(0, 10) : '')],
      ['kommentar', d => d.kommentar],
    ];
    const esc = v => { if (v == null) return ''; const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [cols.map(c => c[0]).join(','), ...filtered.map(d => cols.map(c => esc(c[1](d))).join(','))];
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `bestandskunden${periodFileSuffix(zeitMode, monat, vonMonat, bisMonat)}${fileFilterSuffix}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Bestandskunden (BK)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {periodLabel(zeitMode, monat, vonMonat, bisMonat)} · {filtered.length} Angebote · {gesamtKpis.gewonnen} gewonnen · {gesamtKpis.quote_angebote}% · {formatEuro(gesamtKpis.ae_summe)} AE
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
                className={`bg-white border text-gray-700 text-sm rounded px-3 py-1.5 ${vonMonat > bisMonat ? 'border-red-400' : 'border-gray-300'}`} />
              {vonMonat > bisMonat && <span className="text-xs text-red-500">Von ≤ Bis</span>}
            </div>
          )}
          <button
            onClick={exportFiltered}
            title="Exportiert genau die aktuell gefilterte Menge"
            className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-600 text-sm rounded">
            ↓ CSV
          </button>
          {!canSeeAll && (
            <div className="flex rounded border border-gray-300 overflow-hidden text-xs">
              <button
                onClick={() => setViewMode('alle')}
                className={`px-3 py-1.5 ${viewMode === 'alle' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Alle Angebote
              </button>
              <button
                onClick={() => setViewMode('eigene')}
                className={`px-3 py-1.5 border-l border-gray-300 ${viewMode === 'eigene' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Nur meine
              </button>
            </div>
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
        <select value={filterDienstleistung} onChange={e => setFilterDienstleistung(e.target.value)} className={sel} title="Dienstleistung">
          <option value="">Alle Dienstleistungen</option>
          {dienstleistungOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="number" min="0" step="1000" list="bk-ae-presets" placeholder="Angebot ab €"
          value={filterMinAe} onChange={e => setFilterMinAe(e.target.value)} className={`${sel} w-32`} />
        <datalist id="bk-ae-presets"><option value="5000" /><option value="10000" /><option value="20000" /></datalist>
        <input type="number" min="0" step="1000" placeholder="bis €"
          value={filterMaxAe} onChange={e => setFilterMaxAe(e.target.value)} className={`${sel} w-24`} />
        {hasFilters && (
          <button onClick={resetFilters}
            className="text-xs text-gray-500 hover:text-gray-800 ml-1">✕ Zurücksetzen</button>
        )}
      </div>

      {/* KPI-Block */}
      {showKpis && (
        <div className="space-y-3">
          {/* Gesamt — kompakte Kennzahlen-Leiste */}
          <div className="rounded-lg border border-green-300 overflow-hidden">
            <div className="px-3 py-2 bg-green-700 border-b border-green-600">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Gesamt-KPIs</span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 px-4 py-3 bg-green-50">
              {[
                ['Angebote',      gesamtKpis.total],
                ['Gewonnen',      gesamtKpis.gewonnen],
                ['Verloren',      gesamtKpis.verloren],
                ['Quote',         `${gesamtKpis.quote_angebote}%`],
                ['AE realisiert', formatEuro(gesamtKpis.ae_summe)],
                ['Quote (€)',     `${gesamtKpis.quote_angebotswert}%`],
                ['Angebotswert',  formatEuro(gesamtKpis.angebotswert_gesamt)],
                ['Offen (Wert)',  formatEuro(gesamtKpis.wert_offen)],
                ['Auto-VL',           `${gesamtKpis.auto_verlaengerung} (${gesamtKpis.auto_verlaengerung_quote}%)`],
                ['Abgerechnet',       `${gesamtKpis.abgerechnet_ja} (${gesamtKpis.abgerechnet_quote}%)`],
                ['Termine m. Daniel', gesamtKpis.daniel_termine],
                ['Gewonnen m. Daniel',gesamtKpis.daniel_gewonnen],
                ['Win-Rate Daniel',   gesamtKpis.daniel_termine > 0 ? `${gesamtKpis.daniel_quote}%` : '—'],
              ].map(([label, val]) => (
                <div key={label} className="text-xs">
                  <div className="text-gray-500 mb-0.5">{label}</div>
                  <div className={`font-bold ${gesamtKpis.total > 0 && (label === 'Quote' || label === 'Quote (€)') ? quoteColor(parseFloat(label === 'Quote' ? gesamtKpis.quote_angebote : gesamtKpis.quote_angebotswert)) : 'text-gray-900'}`}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro KAM — kompakte Vergleichstabelle */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 bg-[#2d2e30] border-b border-[#444]">
              <span className="text-xs font-bold text-white uppercase tracking-wide">KPIs nach KAM</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <th className="px-3 py-2 text-left">KAM</th>
                    <th className="px-3 py-2 text-right">Angebote</th>
                    <th className="px-3 py-2 text-right">Gewonnen</th>
                    <th className="px-3 py-2 text-right">Verloren</th>
                    <th className="px-3 py-2 text-right">Quote</th>
                    <th className="px-3 py-2 text-right">AE realisiert</th>
                    <th className="px-3 py-2 text-right">Quote (€)</th>
                    <th className="px-3 py-2 text-right">Angebotswert</th>
                    <th className="px-3 py-2 text-right">Auto-VL</th>
                    <th className="px-3 py-2 text-right">Abgerechnet</th>
                    <th className="px-3 py-2 text-right">Termine m. Daniel</th>
                    <th className="px-3 py-2 text-right">Gewonnen m. Daniel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kamKpis.length === 0
                    ? <tr><td colSpan={12} className="px-3 py-4 text-center text-gray-400">Keine Daten</td></tr>
                    : kamKpis.map(k => {
                        const q = parseFloat(k.kpis.quote_angebote);
                        return (
                          <tr key={k.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap">{k.name}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{k.kpis.total}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{k.kpis.gewonnen}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{k.kpis.verloren}</td>
                            <td className={`px-3 py-2 text-right font-bold ${k.kpis.total === 0 ? 'text-gray-400' : quoteColor(q)}`}>
                              {k.kpis.quote_angebote}%
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-gray-900 whitespace-nowrap">{formatEuro(k.kpis.ae_summe)}</td>
                            <td className={`px-3 py-2 text-right font-bold whitespace-nowrap ${k.kpis.total === 0 ? 'text-gray-400' : quoteColor(parseFloat(k.kpis.quote_angebotswert))}`}>
                              {k.kpis.quote_angebotswert}%
                            </td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">{formatEuro(k.kpis.angebotswert_gesamt)}</td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">{k.kpis.auto_verlaengerung} ({k.kpis.auto_verlaengerung_quote}%)</td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">{k.kpis.abgerechnet_ja} ({k.kpis.abgerechnet_quote}%)</td>
                            <td className="px-3 py-2 text-right text-gray-500">{k.kpis.daniel_termine}</td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">
                              {k.kpis.daniel_gewonnen}
                              {k.kpis.daniel_termine > 0 && <span className="text-gray-400 ml-1">({k.kpis.daniel_quote}%)</span>}
                            </td>
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
            const bcl = (a, b) => a > b ? 'font-bold text-gray-900' : 'text-gray-500'; // bessere Spalte dezent fett
            const row = (label, g, o) => (
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap">{label}</td>
                <td className={`px-3 py-2 text-right ${bcl(g.angebote, o.angebote)}`}>{g.angebote}</td>
                <td className={`px-3 py-2 text-right ${bcl(g.gewonnen, o.gewonnen)}`}>{g.gewonnen}</td>
                <td className={`px-3 py-2 text-right ${bcl(g.quote, o.quote)}`}>{g.quote.toFixed(2)}%</td>
                <td className={`px-3 py-2 text-right whitespace-nowrap ${bcl(g.ae, o.ae)}`}>{formatEuro(g.ae)}</td>
                <td className={`px-3 py-2 text-right whitespace-nowrap ${bcl(g.avgAngebot, o.avgAngebot)}`}>{formatEuro(g.avgAngebot)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{g.personen}</td>
                <td className={`px-3 py-2 text-right whitespace-nowrap ${bcl(g.aePerKopf, o.aePerKopf)}`}>{formatEuro(g.aePerKopf)}</td>
              </tr>
            );
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <th className="px-3 py-2 text-left">Gruppe</th>
                      <th className="px-3 py-2 text-right">Angebote</th>
                      <th className="px-3 py-2 text-right">Gewonnen</th>
                      <th className="px-3 py-2 text-right">Annahmequote</th>
                      <th className="px-3 py-2 text-right">AE realisiert</th>
                      <th className="px-3 py-2 text-right">Ø Angebotswert</th>
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
                    {vergleich.ohneRolle} Mitarbeiter mit BK-Deals ohne KAM/AM-Zuordnung (inkl. „Multi" ohne Auswahl) — in der Mitarbeiterverwaltung zuordnen
                  </div>
                )}
                <div className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100">
                  Gruppierung nach aktueller Rolle bzw. BK-Zuordnung des KAM (Multi) · respektiert Zeitraum/Standort/Dienstleistung/Angebotshöhe · Ø AE/Kopf = AE ÷ aktive Personen
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
              {['Datum','Kunde','KAM','Dienstleistung','Angebotswert','AE-Wert','Laufzeit','Status','Daniel','Auto-VL','Abgerechnet','Notiz',''].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listDeals.length === 0 ? (
              <tr><td colSpan={13} className="text-center py-8 text-gray-400">Keine Deals gefunden</td></tr>
            ) : listDeals.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
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
                <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {d.termin_mit_daniel
                    ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${d.termin_mit_daniel === 'Ja' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>{d.termin_mit_daniel}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
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
        <DealModal key={modal.mode === 'create' ? 'new' : modal.data?.id}
          title={modal.mode === 'create' ? 'Neuer BK-Deal' : 'BK-Deal bearbeiten'}
          fields={fields} initial={modal.data} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
