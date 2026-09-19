import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wmApi, dealsApi, employeesApi } from '../utils/api';
import DealModal from '../components/DealModal';
import InfoPopover from '../components/InfoPopover';
import { formatEuro, companyCurrency, currentMonat } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { KAM_ROLLEN, gruppeVonEmp, ROLLE_GRUPPE_LABEL, PERSONEN_GRUPPEN } from '../utils/rollen';
import { STANDORT_GRUPPEN, standortGruppeLabel, passtZuStandortGruppe } from '../utils/standorte';
import { bkDealFields } from '../utils/bkDealFields';
import { ANGEBOTS_TYPEN, trichter, fmtQuote, vorErfassung, ERFASSUNG_HINWEIS } from '../utils/wmConstants';

// ─────────────────────────────────────────────────────────────────────────────
// Willkommensmeetings — an den Bestandskunden-Bereich angelagert.
//
// REFERENZ STATT KOPIE: Das Angebot ist ein regulaerer BK-Deal. Diese Seite legt ihn ueber das
// GLEICHE Formular an (bkDealFields + DealModal) und bearbeitet ihn ueber die GLEICHE Route
// (dealsApi.bk.update) — es gibt hier bewusst keinen eigenen Deal-Bearbeitungspfad. Deshalb
// kann es keine zwei Staende desselben Angebots geben; es ist EIN Datensatz.
// ─────────────────────────────────────────────────────────────────────────────

const card = 'bg-white rounded-xl border border-gray-200';
const sec  = 'text-sm font-bold text-gray-900 mt-6 mb-2';

function Kachel({ label, wert, unter, hero }) {
  return (
    <div className={`flex-1 min-w-[150px] rounded-xl border p-3 ${hero ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200'}`}>
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-0.5 ${hero ? 'text-indigo-700' : 'text-gray-900'}`}>{wert}</div>
      {unter && <div className="text-xs text-gray-500 mt-0.5">{unter}</div>}
    </div>
  );
}

const Pill = ({ children, ton = 'grau' }) => {
  const c = { gruen: 'bg-green-50 text-green-700', rot: 'bg-red-50 text-red-700',
    gelb: 'bg-amber-50 text-amber-700', grau: 'bg-gray-100 text-gray-600',
    blau: 'bg-indigo-50 text-indigo-700' }[ton];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${c}`}>{children}</span>;
};

export default function Willkommensmeetings() {
  const { company, companies } = useOutletContext();
  const { canSeeAll, user, isAdmin } = useAuth();
  const qc = useQueryClient();

  const [zeitmodus, setZeitmodus] = useState('monat');       // monat · zeitraum · alle
  const [monat, setMonat]   = useState(currentMonat());
  const [von, setVon]       = useState(currentMonat());
  const [bis, setBis]       = useState(currentMonat());
  const [filterPerson, setFilterPerson] = useState('');
  const [filterGruppe, setFilterGruppe] = useState('');
  const [filterStandort, setFilterStandort] = useState('');   // '' | 'de' | 'at' | 'ch'
  const [modal, setModal]   = useState(null);                // Meeting-Maske
  const [dealModal, setDealModal] = useState(null);          // BK-Deal-Maske (dasselbe Formular)

  const params = zeitmodus === 'monat' ? { monat }
    : zeitmodus === 'zeitraum' ? { von, bis } : {};
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['wm', zeitmodus, monat, von, bis],
    queryFn: () => wmApi.list(params),
  });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.list() });

  const empById   = useMemo(() => Object.fromEntries(employees.map(e => [e.id, e])), [employees]);
  const kamOptions = useMemo(() => employees.filter(e => KAM_ROLLEN.includes(e.rolle))
    .map(e => ({ value: e.id, label: `${e.name}${e.standort ? ` (${e.standort})` : ''}` })), [employees]);
  const compOpts   = useMemo(() => companies.map(c => ({ value: c.id, label: c.name })), [companies]);
  const curSym     = companyCurrency(companies, company) === 'CHF' ? 'CHF' : '€';

  // Standort des MEETING-FÜHRERS, nicht der Company: der Server liefert ihn als `standort`
  // (employees.standort über gefuehrt_von), Rückfall auf die Mitarbeiterliste. Ein Mitarbeiter
  // ohne Standort fällt bei jedem konkreten Filter heraus und bleibt nur unter "Alle Standorte"
  // sichtbar — dieselbe Regel wie im VL-Bereich, bewusst ohne eigenen Sammel-Status.
  const gefiltert = useMemo(() => meetings.filter(m =>
    (!filterPerson || String(m.gefuehrt_von) === String(filterPerson)) &&
    (!filterGruppe || gruppeVonEmp(empById[m.gefuehrt_von]) === filterGruppe) &&
    passtZuStandortGruppe(m.standort ?? empById[m.gefuehrt_von]?.standort, filterStandort)
  ), [meetings, filterPerson, filterGruppe, filterStandort, empById]);

  const t = useMemo(() => trichter(gefiltert), [gefiltert]);

  // Personen-Tabelle: jede Person, die im Zeitraum ein Meeting gefuehrt hat.
  const proPerson = useMemo(() => {
    const m = new Map();
    for (const w of gefiltert) {
      if (!m.has(w.gefuehrt_von)) m.set(w.gefuehrt_von, []);
      m.get(w.gefuehrt_von).push(w);
    }
    return [...m.entries()].map(([id, liste]) => ({
      id, name: empById[id]?.name || `#${id}`,
      gruppe: gruppeVonEmp(empById[id]), ...trichter(liste),
    })).sort((a, b) => b.meetings - a.meetings);
  }, [gefiltert, empById]);

  // Das Personen-Dropdown zeigt nur, wer im gewählten Standort-Scope überhaupt in Frage kommt.
  // Sonst könnte man eine Person wählen, die es im Scope nicht gibt, und bekäme eine leere Seite
  // ohne erkennbaren Grund.
  const personenImScope = useMemo(
    () => employees.filter(e => KAM_ROLLEN.includes(e.rolle) && passtZuStandortGruppe(e.standort, filterStandort)),
    [employees, filterStandort]);

  // Auto-Reset: fällt die gewählte Person aus dem Scope, wird die Auswahl gelöst statt still
  // eine leere Menge zu zeigen.
  useEffect(() => {
    if (filterPerson && !personenImScope.some(e => String(e.id) === String(filterPerson))) {
      setFilterPerson('');
    }
  }, [personenImScope, filterPerson]);

  const aktiveFilter = [
    filterStandort && `Standort: ${standortGruppeLabel(filterStandort)}`,
    filterGruppe && `Rolle: ${ROLLE_GRUPPE_LABEL[filterGruppe]}`,
    filterPerson && `Person: ${empById[filterPerson]?.name || `#${filterPerson}`}`,
  ].filter(Boolean);

  const zeigeHinweis = zeitmodus === 'monat' ? vorErfassung(monat)
    : zeitmodus === 'zeitraum' ? vorErfassung(von) : true;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['wm'] });
    qc.invalidateQueries({ queryKey: ['deals-bk'] });   // die BK-Seite zeigt denselben Deal
  };
  const createMut = useMutation({ mutationFn: wmApi.create, onSuccess: () => { invalidate(); setModal(null); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => wmApi.update(id, data), onSuccess: () => { invalidate(); setModal(null); } });
  const deleteMut = useMutation({ mutationFn: wmApi.delete, onSuccess: invalidate });
  // Der Deal geht an die BK-Route — dieselbe wie im Bestandskunden-Bereich.
  const dealMut   = useMutation({
    mutationFn: ({ id, data }) => dealsApi.bk.update(id, data),
    onSuccess: () => { invalidate(); setDealModal(null); },
  });

  // ── Meeting-Maske ──────────────────────────────────────────────────────────
  // Der Angebots-Teil klappt bei "Angebot platziert? = Ja" auf und besteht 1:1 aus den
  // BK-Formularfeldern (bkDealFields) — keine abgespeckte Kopie. kamPflicht: ohne KAM fiele
  // der Deal per INNER JOIN lautlos aus jeder BK-Auswertung, deshalb hier Pflichtfeld.
  const meetingFelder = useMemo(() => {
    const bk = bkDealFields({ compOpts, kamOptions, curSym, canSeeAll, isAdmin, kamPflicht: true })
      .map(f => ({ ...f, name: `a_${f.name}`,
        show: (form) => form.hat_angebot === 'Ja' && (typeof f.show === 'function' ? f.show(entpacke(form)) : true),
        required: typeof f.required === 'function'
          ? (form) => form.hat_angebot === 'Ja' && f.required(entpacke(form))
          : (form) => form.hat_angebot === 'Ja' && !!f.required,
      }));
    return [
      { name: 'datum', label: 'Datum des Meetings', type: 'date', required: true,
        hint: 'Rückwirkende Erfassung ist erlaubt' },
      { name: 'kunde', label: 'Kunde', required: true },
      { name: 'gefuehrt_von', label: 'Geführt von', type: 'select', options: kamOptions, required: true },
      { name: 'aufzeichnung_url', label: 'Aufzeichnung (URL)', hint: 'Fathom, Drive, Zoom — freies Feld' },
      { name: 'notiz', label: 'Notiz', type: 'textarea' },
      { name: 'hat_angebot', label: 'Angebot platziert?', type: 'select', options: ['Nein', 'Ja'], required: true },
      { name: 'angebots_typ', label: 'Angebots-Typ', type: 'select', options: ANGEBOTS_TYPEN,
        show: f => f.hat_angebot === 'Ja', required: f => f.hat_angebot === 'Ja' },
      ...bk,
    ];
  }, [compOpts, kamOptions, curSym, canSeeAll, isAdmin]);

  // Der Angebots-Teil traegt das Praefix a_, damit er nicht mit den Meeting-Feldern kollidiert.
  // entpacke() reicht dem urspruenglichen show/required-Ausdruck die Felder unter ihrem echten
  // Namen — sonst griffe z.B. "required: f => f.status === 'Gewonnen'" ins Leere.
  function entpacke(form) {
    const o = {};
    for (const [k, v] of Object.entries(form)) o[k.startsWith('a_') ? k.slice(2) : k] = v;
    return o;
  }

  const speichereMeeting = (form) => {
    const basis = {
      datum: form.datum, kunde: form.kunde, gefuehrt_von: Number(form.gefuehrt_von),
      monat: String(form.datum || '').slice(0, 7),
      angebots_typ: form.hat_angebot === 'Ja' ? form.angebots_typ : null,
      aufzeichnung_url: form.aufzeichnung_url || null, notiz: form.notiz || null,
    };
    if (form.hat_angebot === 'Ja' && modal.mode === 'create') {
      const a = entpacke(Object.fromEntries(Object.entries(form).filter(([k]) => k.startsWith('a_'))));
      basis.angebot = { ...a, kunde: a.kunde || form.kunde, monat: a.monat || basis.monat,
        company_id: a.company_id || company || null };
    }
    if (modal.mode === 'create') createMut.mutate(basis);
    else updateMut.mutate({ id: modal.data.id, data: basis });
  };

  const oeffneMeeting = (m) => setModal(m
    ? { mode: 'edit', data: m, initial: {
        datum: String(m.datum || '').slice(0, 10), kunde: m.kunde, gefuehrt_von: m.gefuehrt_von,
        aufzeichnung_url: m.aufzeichnung_url || '', notiz: m.notiz || '',
        hat_angebot: m.deal_bk_id ? 'Ja' : 'Nein', angebots_typ: m.angebots_typ || '' } }
    : { mode: 'create', initial: {
        datum: new Date().toISOString().slice(0, 10), hat_angebot: 'Nein',
        gefuehrt_von: (!canSeeAll && user?.employee_id) ? user.employee_id : '',
        a_status: 'Offen', a_monat: currentMonat(), a_company_id: company || '' } });

  // Klick auf das Angebot oeffnet das REGULAERE BK-Formular mit dem echten Deal.
  const oeffneDeal = async (m) => {
    const d = await dealsApi.bk.get(m.deal_bk_id);
    setDealModal({ deal: d, initial: { ...d, datum: String(d.datum || '').slice(0, 10),
      gewonnen_datum: d.gewonnen_datum ? String(d.gewonnen_datum).slice(0, 10) : '' } });
  };

  const exportCsv = () => {
    const cols = [['datum', m => String(m.datum || '').slice(0, 10)], ['kunde', m => m.kunde],
      ['gefuehrt_von', m => m.gefuehrt_von_name], ['angebot', m => (m.deal_bk_id ? 'ja' : 'nein')],
      ['angebots_typ', m => m.angebots_typ || ''], ['deal_status', m => m.deal_status || ''],
      ['ae_eur', m => (m.deal_status === 'Gewonnen' ? (m.deal_ae_wert_eur ?? m.deal_ae_wert ?? '') : '')],
      ['standort', m => m.standort || ''],
      ['aufzeichnung', m => m.aufzeichnung_url || ''], ['monat', m => m.monat]];
    const esc = v => { const s = String(v ?? ''); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const zeilen = [cols.map(c => c[0]).join(';'),
      ...gefiltert.map(m => cols.map(c => esc(c[1](m))).join(';'))];
    const blob = new Blob(['﻿' + zeilen.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const scope = (filterStandort ? `_${filterStandort}` : '') + (filterGruppe ? `_${filterGruppe}` : '');
    a.download = `willkommensmeetings_${zeitmodus === 'monat' ? monat : zeitmodus === 'zeitraum' ? `${von}_${bis}` : 'alle'}${scope}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  };

  const ctl = 'rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 text-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">🤝 Willkommensmeetings</h1>
        <button onClick={() => oeffneMeeting(null)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500">
          + Meeting erfassen
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
          {['monat', 'zeitraum', 'alle'].map(z => (
            <button key={z} onClick={() => setZeitmodus(z)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold ${zeitmodus === z ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}>
              {z === 'monat' ? 'Monat' : z === 'zeitraum' ? 'Zeitraum' : 'Alle'}
            </button>
          ))}
        </span>
        {zeitmodus === 'monat' && <input type="month" value={monat} onChange={e => setMonat(e.target.value)} className={ctl} />}
        {zeitmodus === 'zeitraum' && <>
          <input type="month" value={von} onChange={e => setVon(e.target.value)} className={ctl} />
          <span className="text-gray-400 text-sm">bis</span>
          <input type="month" value={bis} onChange={e => setBis(e.target.value)} className={ctl} />
        </>}
        <select value={filterGruppe} onChange={e => setFilterGruppe(e.target.value)} className={ctl}>
          <option value="">Alle Rollen</option>
          <option value="kam">{ROLLE_GRUPPE_LABEL.kam}</option>
          <option value="am">{ROLLE_GRUPPE_LABEL.am}</option>
        </select>
        <select value={filterStandort} onChange={e => setFilterStandort(e.target.value)} className={ctl}
          title="Standort des Meeting-Führers — nicht der Company">
          <option value="">Alle Standorte</option>
          {STANDORT_GRUPPEN.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
        </select>
        <select value={filterPerson} onChange={e => setFilterPerson(e.target.value)} className={ctl}>
          <option value="">Alle Personen</option>
          {PERSONEN_GRUPPEN.map(([g, label]) => {
            const leute = personenImScope.filter(e => gruppeVonEmp(e) === g);
            return leute.length ? <optgroup key={label} label={label}>
              {leute.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </optgroup> : null;
          })}
        </select>
        {aktiveFilter.length > 0 && (
          // Zusammenfassung und Zurücksetzen als EINE Einheit, damit der Knopf beim Umbruch nicht
          // allein in die nächste Zeile rutscht und wie ein eigenes Bedienelement aussieht.
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs text-gray-500">{aktiveFilter.join(' · ')}</span>
            <button onClick={() => { setFilterStandort(''); setFilterGruppe(''); setFilterPerson(''); }}
              className="text-xs text-indigo-600 hover:text-indigo-500 underline">Zurücksetzen</button>
          </span>
        )}
        <button onClick={exportCsv} className={`${ctl} font-semibold ml-auto`}>⬇ CSV</button>
      </div>

      {zeigeHinweis && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          {ERFASSUNG_HINWEIS}
        </div>
      )}

      {/* Trichter */}
      <div className="flex gap-3 flex-wrap mt-4">
        <Kachel hero label="Meetings geführt" wert={t.meetings}
                unter={zeitmodus === 'monat' ? monat : zeitmodus === 'zeitraum' ? `${von} – ${bis}` : 'alle Monate'} />
        <Kachel label="Angebote platziert" wert={t.angebote}
                unter={<>Quote <b>{fmtQuote(t.quoteAngebot)}</b> · davon Jahres-Typ <b>{t.jahresAngebote}</b> ({fmtQuote(t.quoteJahres)})</>} />
        <Kachel label="Angebote gewonnen" wert={t.gewonnen}
                unter={<>Quote <b>{fmtQuote(t.quoteAbschluss)}</b> · Durchgriff <b>{fmtQuote(t.quoteDurchgriff)}</b></>} />
        <Kachel label="AE realisiert" wert={formatEuro(t.ae)} unter="aus WM-Angeboten" />
      </div>

      {/* Meeting-Tabelle */}
      <div className={sec}>Meetings</div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="px-3 py-2 font-medium">Datum</th>
            <th className="px-3 py-2 font-medium">Kunde</th>
            <th className="px-3 py-2 font-medium">Geführt von</th>
            <th className="px-3 py-2 font-medium">Angebot</th>
            <th className="px-3 py-2 font-medium">Typ</th>
            <th className="px-3 py-2 font-medium">Deal-Status</th>
            <th className="px-3 py-2 font-medium text-right">AE</th>
            <th className="px-3 py-2 font-medium">Aufz.</th>
            <th className="px-3 py-2 font-medium text-right w-20"></th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-400">Lädt…</td></tr>
            ) : gefiltert.length === 0 ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-400">Keine Meetings in dieser Auswahl.</td></tr>
            ) : gefiltert.map(m => (
              <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">{String(m.datum || '').slice(0, 10)}</td>
                <td className="px-3 py-2 font-medium">{m.kunde}</td>
                <td className="px-3 py-2">{m.gefuehrt_von_name}</td>
                <td className="px-3 py-2">
                  {m.deal_bk_id
                    ? <button onClick={() => oeffneDeal(m)} className="text-indigo-600 font-semibold hover:underline">
                        <Pill ton="gruen">ja ↗</Pill>
                      </button>
                    : Number(m.deal_entfernt) === 1
                      ? <Pill ton="gelb">Angebot entfernt</Pill>
                      : <Pill>nein</Pill>}
                </td>
                <td className="px-3 py-2 text-gray-600">{m.angebots_typ || '—'}</td>
                <td className="px-3 py-2">
                  {m.deal_status ? <Pill ton={m.deal_status === 'Gewonnen' ? 'gruen' : m.deal_status === 'Verloren' ? 'rot' : 'grau'}>{m.deal_status}</Pill> : '—'}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {m.deal_status === 'Gewonnen' ? formatEuro(m.deal_ae_wert_eur ?? m.deal_ae_wert) : '—'}
                </td>
                <td className="px-3 py-2">
                  {m.aufzeichnung_url
                    ? <a href={m.aufzeichnung_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold">↗</a>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => oeffneMeeting(m)} className="text-xs text-indigo-600 font-semibold">Bearbeiten</button>
                  <button onClick={() => { if (window.confirm('Meeting löschen? Ein verknüpftes Angebot bleibt in BK bestehen.')) deleteMut.mutate(m.id); }}
                    className="text-xs text-red-500 ml-2">Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nach Mitarbeiter */}
      <div className={sec}>
        Nach Mitarbeiter
        <InfoPopover title="Wie die Quoten gerechnet werden">
          <p className="mb-1"><b>Kohorte ist der Meeting-Monat.</b> Ein Meeting vom 12.09. bleibt in der
            September-Kohorte, auch wenn sein Angebot erst im Oktober gewonnen wird — dann steigt
            rückwirkend die September-Quote.</p>
          <p>Der Deal-Status wird live gelesen, nie kopiert. Die AE-Zählung des Deals selbst folgt
            unverändert dem Gewonnen-Monat; die Spalte AE hier zeigt den AE der WM-Angebote dieser Kohorte.</p>
        </InfoPopover>
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="px-3 py-2 font-medium">Mitarbeiter</th>
            <th className="px-3 py-2 font-medium">Rolle</th>
            <th className="px-3 py-2 font-medium text-right">Meetings</th>
            <th className="px-3 py-2 font-medium text-right">Angebote</th>
            <th className="px-3 py-2 font-medium text-right">Quote</th>
            <th className="px-3 py-2 font-medium text-right">Gewonnen</th>
            <th className="px-3 py-2 font-medium text-right">Quote</th>
            <th className="px-3 py-2 font-medium text-right">AE</th>
          </tr></thead>
          <tbody>
            {proPerson.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-400">Keine Einträge.</td></tr>
            ) : proPerson.map(p => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">{p.gruppe ? <Pill ton="blau">{p.gruppe === 'kam' ? 'KAM' : 'AM'}</Pill> : <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2 text-right">{p.meetings}</td>
                <td className="px-3 py-2 text-right">{p.angebote}</td>
                <td className="px-3 py-2 text-right">{fmtQuote(p.quoteAngebot)}</td>
                <td className="px-3 py-2 text-right">{p.gewonnen}</td>
                <td className="px-3 py-2 text-right">{fmtQuote(p.quoteAbschluss)}</td>
                <td className="px-3 py-2 text-right font-medium">{formatEuro(p.ae)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <DealModal
          key={modal.mode === 'create' ? 'neu' : modal.data?.id}
          title={modal.mode === 'create' ? 'Willkommensmeeting erfassen' : 'Willkommensmeeting bearbeiten'}
          fields={meetingFelder}
          initial={modal.initial}
          onSave={speichereMeeting}
          onClose={() => setModal(null)}
        />
      )}

      {/* Dasselbe Formular und dieselbe Route wie im BK-Bereich — ein Datensatz, zwei Türen. */}
      {dealModal && (
        <DealModal
          key={`deal-${dealModal.deal.id}`}
          title={`Angebot bearbeiten — ${dealModal.deal.kunde}`}
          fields={bkDealFields({ compOpts, kamOptions, curSym, canSeeAll, isAdmin, isEdit: true, kamPflicht: true })}
          initial={dealModal.initial}
          onSave={(form) => dealMut.mutate({ id: dealModal.deal.id, data: form })}
          onClose={() => setDealModal(null)}
        />
      )}
    </div>
  );
}
