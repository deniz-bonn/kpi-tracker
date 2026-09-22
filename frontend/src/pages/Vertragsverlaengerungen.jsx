import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vertragsverlaengerungenApi, dealsApi, employeesApi } from '../utils/api';
import { formatEuro, companyCurrency, currentMonat } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { useAuth } from '../context/AuthContext';
import { ROLLE_GRUPPE_LABEL, KAM_ROLLEN } from '../utils/rollen';
import { STANDORT_GRUPPEN, standortGruppeLabel } from '../utils/standorte';
import { bkDealFields } from '../utils/bkDealFields';

// ─────────────────────────────────────────────────────────────────────────────
// Vertragsverlängerungen — wie viele anstehende Verlängerungen heben wir auf Dauer-RaaS?
//
// Die Seite ist eine LESENDE Auswertungsfläche. Erfasst wird über PUT /api/deals/vl/:id —
// dieselbe Route, die auch der VL-Bereich benutzt ("zwei Türen, ein Deal"). Dadurch kann es
// keine zwei Verhaltensweisen geben: Was hier gespeichert wird, ist byte-gleich mit dem, was
// im VL-Bereich gespeichert würde.
//
// ZWEI STUFEN:
//   "Umstellung anbieten"  legt den Dauer-RaaS-Deal mit Status Offen an. Der Verlängerungs-Deal
//                          bleibt, wo er ist — es ist erst ein Angebot.
//   "Direkt umstellen"     legt ihn gewonnen an und hebt die Verlängerung sofort.
// Wird ein angebotener Deal später im BK-Bereich gewonnen, zieht die Verlängerung automatisch
// nach (Automatik in routes/deals_bk.js) — die Richtung ist bewusst nur BK -> VL.
//
// Das Formular ist der VOLLE BK-Deal-Builder, derselbe wie im BK-Bereich und bei den
// Willkommensmeetings. Ein abgespecktes Zweitformular hätte genau die Felder verloren, die der
// Vertrieb hinterher von Hand nachpflegen musste.
// ─────────────────────────────────────────────────────────────────────────────

const GRUPPEN = [['', 'Alle Rollen'], ['kam', ROLLE_GRUPPE_LABEL.kam], ['am', ROLLE_GRUPPE_LABEL.am]];

const pct = (v) => (v == null ? '—' : `${String(v).replace('.', ',')} %`);
// Identisch zu DealsVL.jsx: bg-white und text-gray-700 MUESSEN explizit gesetzt sein. Ohne sie
// erben die Steuerelemente die Farben des Umfelds und stehen praktisch weiss auf weiss — im
// ersten Wurf dieser Seite waren die Filter dadurch nicht lesbar.
const sel = 'bg-white border border-gray-300 text-gray-700 text-sm rounded px-2 py-1.5';
const card = 'bg-white rounded-lg border border-gray-200 overflow-hidden';
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const head = 'px-3 py-2 bg-gray-800';

function Kachel({ label, wert, sub, ton = 'gray' }) {
  const farben = {
    gray:   'text-gray-900',
    indigo: 'text-indigo-700',
    green:  'text-green-700',
    red:    'text-red-600',
    amber:  'text-amber-600',
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${farben[ton]}`}>{wert}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// Der Angebots-Teil trägt das Präfix a_, damit er nicht mit Feldern der Seite kollidiert.
// entpacke() reicht den ursprünglichen show/required/autoFill-Ausdrücken die Felder unter ihrem
// echten Namen — sonst griffe "required: f => f.status === 'Gewonnen'" ins Leere. Identisch zu
// Willkommensmeetings.jsx; autoFill MUSS mit umhüllt werden, sonst feuert die Vorbelegung des
// Annahmedatums nie und ein Pflichtfeld bleibt unsichtbar leer.
function entpacke(form) {
  const o = {};
  for (const [k, v] of Object.entries(form)) o[k.startsWith('a_') ? k.slice(2) : k] = v;
  return o;
}

export default function Vertragsverlaengerungen() {
  const { company, companies } = useOutletContext();
  const { canSeeAll, isAdmin } = useAuth();
  const [monat, setMonat] = useState(currentMonat());
  const [standort, setStandort] = useState('');
  const [gruppe, setGruppe] = useState('');
  const [modal, setModal] = useState(null);
  const [fehler, setFehler] = useState(null);
  const [speichert, setSpeichert] = useState(false);

  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.list() });
  const compOpts = useMemo(() => (companies || []).map(c => ({ value: c.id, label: c.name })), [companies]);
  const kamOptions = useMemo(() => employees.filter(e => KAM_ROLLEN.includes(e.rolle))
    .map(e => ({ value: e.id, label: `${e.name}${e.standort ? ` (${e.standort})` : ''}` })), [employees]);
  const curSym = companyCurrency(companies, company) === 'CHF' ? 'CHF' : '€';

  // Das volle BK-Formular mit Präfix — kein abgespecktes Zweitformular.
  const angebotsFelder = useMemo(() => bkDealFields({
    compOpts, kamOptions, curSym, canSeeAll, isAdmin, kamPflicht: true,
  }).map(f => ({ ...f, name: `a_${f.name}`,
    show: typeof f.show === 'function' ? (form) => f.show(entpacke(form)) : undefined,
    required: typeof f.required === 'function' ? (form) => f.required(entpacke(form)) : f.required,
    ...(typeof f.autoFill === 'function' ? { autoFill: (form, changedKey) =>
      f.autoFill(entpacke(form), String(changedKey).startsWith('a_') ? String(changedKey).slice(2) : changedKey) } : {}),
    ...(typeof f.onBeforeChange === 'function' ? { onBeforeChange: (wert, form) =>
      f.onBeforeChange(wert, entpacke(form)) } : {}),
  })), [compOpts, kamOptions, curSym, canSeeAll, isAdmin]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vv', monat, standort],
    queryFn: () => vertragsverlaengerungenApi.list({ monat, standort: standort || undefined }),
  });

  const g = data?.gesamt;
  const personen = useMemo(
    () => (data?.personen || []).filter(p => !gruppe || p.gruppe === gruppe),
    [data, gruppe]);

  // Der Export folgt dem SICHTBAREN Scope: dieselbe Kohorte, die die Kacheln zählen. Ein Export,
  // der mehr enthält als die Anzeige darüber, ist die stillste Art, jemanden in die Irre zu führen.
  const exportCsv = () => {
    const cols = [
      ['monat', d => d.monat], ['kunde', d => d.kunde], ['status', d => d.status],
      ['account_manager', d => d.kam_name || ''], ['standort', d => d.kam_standort || ''],
      ['ae_verlaengerung', d => d.ae_wert ?? ''],
      ['umstellung_stufe', d => (!d.umstellung_deal_bk_id ? ''
        : d.umstellung_status === 'Offen' ? 'angeboten'
        : d.umstellung_status === 'Verloren' ? 'abgelehnt' : 'angenommen')],
      ['angebotswert_dauer_raas', d => d.umstellung_angebotswert ?? ''],
      ['ae_dauer_raas_eur', d => d.umstellung_ae_wert_eur ?? d.umstellung_ae_wert ?? ''],
      ['dauer_raas_deal_bk_id', d => d.umstellung_deal_bk_id ?? ''],
      ['umstellungsdatum', d => (d.dauervertrag_datum ? String(d.dauervertrag_datum).slice(0, 10) : '')],
      ['wie_vielt_verlaengerung', d => d.wie_vielt_verlaengerung ?? ''],
    ];
    const zeilen = [cols.map(c => c[0]).join(';'),
      ...(data?.kohorte || []).map(d => cols.map(c => esc(c[1](d))).join(';'))];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + zeilen.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vertragsverlaengerungen_${monat}${standort ? `_${standort}` : ''}${gruppe ? `_${gruppe}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const aktiveFilter = [
    standort && `Standort: ${standortGruppeLabel(standort)}`,
    gruppe && `Rolle: ${ROLLE_GRUPPE_LABEL[gruppe]}`,
  ].filter(Boolean);

  /**
   * Dialog öffnen — "anbieten" (BK-Deal Offen) oder "direkt umstellen" (BK-Deal Gewonnen).
   * Vorbelegt wird aus dem Verlängerungs-Deal, damit die Erfassung kurz bleibt.
   */
  const oeffnen = (deal, modus) => {
    setFehler(null);
    const heute = new Date().toISOString().slice(0, 10);
    setModal({ deal, modus, initial: {
      a_datum: heute,
      a_monat: heute.slice(0, 7),
      a_company_id: deal.company_id ?? company ?? '',
      a_kunde: deal.kunde ?? '',
      a_kam_id: deal.kam_id ?? '',
      a_kundennummer: deal.kundennummer ?? '',
      a_dienstleistung: 'Dauer-RaaS',
      a_laufzeit_monate: 12,
      a_status: modus === 'direkt' ? 'Gewonnen' : 'Offen',
      a_gewonnen_datum: modus === 'direkt' ? heute : '',
      a_abgerechnet: 'Nein',
      // Umstellungsdatum des Verlängerungs-Deals — nur beim Direktweg relevant, weil dort der
      // VL-Deal sofort wechselt. Beim Angebot bleibt er, wo er ist.
      dauervertrag_datum: heute,
    } });
  };

  // Erfassung läuft über die VL-Route — kein eigener Schreibpfad in diesem Bereich.
  const speichern = async (form) => {
    setFehler(null);
    setSpeichert(true);
    try {
      const a = entpacke(Object.fromEntries(Object.entries(form).filter(([k]) => k.startsWith('a_'))));
      const direkt = modal.modus === 'direkt';
      await dealsApi.vl.update(modal.deal.id, {
        ...modal.deal,
        // Nur der Direktweg hebt die Verlängerung sofort. Ein Angebot lässt ihren Status in Ruhe —
        // sonst wäre die Vorstufe nur ein anderer Name für dasselbe.
        status: direkt ? 'Umgestellt' : modal.deal.status,
        dauervertrag_datum: direkt ? form.dauervertrag_datum : modal.deal.dauervertrag_datum,
        umstellung: { ...a, status: direkt ? 'Gewonnen' : 'Offen' },
      });
      setModal(null);
      refetch();
    } catch (e) {
      setFehler(e?.response?.data?.error || e?.message || 'Unbekannter Fehler beim Speichern.');
    } finally {
      setSpeichert(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vertragsverlängerungen</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Anstehende Verlängerungen des Monats und wie viele davon auf <b>Dauer-RaaS</b> gehoben wurden.
          Der Umsatz einer Umstellung liegt im verknüpften Bestandskunden-Deal und wird dort als
          Upsell (3 %) provisioniert — er zählt nicht als Verlängerungs-AE.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input type="month" value={monat} onChange={e => setMonat(e.target.value)} className={sel} />
        <select value={standort} onChange={e => setStandort(e.target.value)} className={sel}
          title="Standort des zugeordneten Account Managers — nicht der Company">
          <option value="">Alle Standorte</option>
          {STANDORT_GRUPPEN.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
        </select>
        <select value={gruppe} onChange={e => setGruppe(e.target.value)} className={sel}
          title="Rolle des zugeordneten Account Managers">
          {GRUPPEN.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {aktiveFilter.length > 0 && (
          // Zusammenfassung und Zurücksetzen als EINE Einheit, damit der Knopf beim Umbruch nicht
          // allein in die nächste Zeile rutscht und wie ein eigenes Bedienelement aussieht.
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs text-gray-500">{aktiveFilter.join(' · ')}</span>
            <button onClick={() => { setStandort(''); setGruppe(''); }}
              className="text-xs text-indigo-600 hover:text-indigo-500 underline">Zurücksetzen</button>
          </span>
        )}
        <button onClick={exportCsv} className={`${sel} font-semibold ml-auto`}>⬇ CSV</button>
      </div>

      {isLoading && <div className="text-sm text-gray-400">Lädt…</div>}

      {g && (
        <>
          {/* ── Trichter ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <Kachel label="Anstehend" wert={g.anstehend} sub="Kohorte des Monats" />
            <Kachel label="Umstellung angeboten" wert={g.angeboten} ton="indigo"
              sub={`${pct(g.angebotsquote)} der Anstehenden${g.angebot_offen ? ` · ${g.angebot_offen} offen` : ''}`} />
            <Kachel label="Angenommen" wert={g.umgestellt} ton="indigo"
              sub={`${pct(g.annahmequote)} der Angebote · ${pct(g.umstellungsquote)} der Kohorte`} />
            <Kachel label="Regulär verlängert" wert={g.verlaengert} ton="green" />
            <Kachel label="Gekündigt" wert={g.gekuendigt} ton="red" sub={`Churn ${pct(g.churn)}`} />
            <Kachel label="Neuer AE Dauer-RaaS" wert={formatEuro(g.dauer_raas_ae)} ton="indigo"
              sub={g.angebot_volumen > 0
                ? `zählt im BK-Umsatz · ${formatEuro(g.angebot_volumen)} noch offen angeboten`
                : 'zählt im Bestandskunden-Umsatz'} />
          </div>

          <p className="text-[11px] text-gray-400">
            Angebotsquote = Angeboten ÷ Anstehend · Annahmequote = Angenommen ÷ Angeboten ·
            Churn = Kündigungen ÷ (Verlängert + Umgestellt + Gekündigt) · Bestandserhalt {pct(g.erhaltsquote)} —
            eine Umstellung zählt wie eine Verlängerung, der Kunde bleibt. Eine Direkt-Umstellung zählt als
            Angebot <i>und</i> Annahme am selben Tag; der Angebotswert eines noch offenen Angebots steht in der
            Bestandskunden-Pipeline, sein AE erst nach der Annahme hier.
            {g.offen > 0 && <> · {g.offen} Verlängerungen noch nicht entschieden.</>}
          </p>

          {/* ── Je Person ── */}
          <div className={card}>
            <div className={head}>
              <span className="text-xs font-bold text-white uppercase tracking-wide">Je Account Manager</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <th className="px-3 py-2 text-left">Person</th>
                  <th className="px-3 py-2 text-left">Gruppe</th>
                  <th className="px-3 py-2 text-right">anstehend</th>
                  <th className="px-3 py-2 text-right">angeboten</th>
                  <th className="px-3 py-2 text-right">Dauer-RaaS</th>
                  <th className="px-3 py-2 text-right">verlängert</th>
                  <th className="px-3 py-2 text-right">gekündigt</th>
                  <th className="px-3 py-2 text-right">offen</th>
                  <th className="px-3 py-2 text-right">Umstellungsquote</th>
                  <th className="px-3 py-2 text-right">neuer AE</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {personen.length === 0
                    ? <tr><td colSpan={10} className="px-3 py-6 text-center text-gray-400">Keine Daten für diesen Monat.</td></tr>
                    : personen.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-700">{p.name}</td>
                        <td className="px-3 py-1.5 text-gray-400">{p.gruppe ? ROLLE_GRUPPE_LABEL[p.gruppe] : '—'}</td>
                        <td className="px-3 py-1.5 text-right text-gray-600">{p.anstehend}</td>
                        <td className="px-3 py-1.5 text-right text-gray-600">{p.angeboten}{p.angebot_offen ? <span className="text-amber-600"> ({p.angebot_offen})</span> : null}</td>
                        <td className="px-3 py-1.5 text-right font-medium text-indigo-700">{p.umgestellt}</td>
                        <td className="px-3 py-1.5 text-right text-green-700">{p.verlaengert}</td>
                        <td className="px-3 py-1.5 text-right text-red-600">{p.gekuendigt}</td>
                        <td className="px-3 py-1.5 text-right text-amber-600">{p.offen}</td>
                        <td className="px-3 py-1.5 text-right">{pct(p.umstellungsquote)}</td>
                        <td className="px-3 py-1.5 text-right text-gray-600">{formatEuro(p.dauer_raas_ae)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Kohorte ── */}
          <div className={card}>
            <div className={head}>
              <span className="text-xs font-bold text-white uppercase tracking-wide">Anstehende Verlängerungen</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <th className="px-3 py-2 text-left">Kunde</th>
                  <th className="px-3 py-2 text-left">Account Manager</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">AE Verlängerung</th>
                  <th className="px-3 py-2 text-right">AE / Angebot Dauer-RaaS</th>
                  <th className="px-3 py-2 text-left">Umstellung</th>
                  <th className="px-3 py-2 text-right"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {(data.kohorte || []).map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 text-gray-700">{d.kunde}</td>
                      <td className="px-3 py-1.5 text-gray-500">{d.kam_name || <span className="text-amber-600">∅ ohne KAM</span>}</td>
                      <td className="px-3 py-1.5"><StatusBadge status={d.status} /></td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{formatEuro(d.ae_wert)}</td>
                      <td className="px-3 py-1.5 text-right text-indigo-700">
                        {d.umstellung_deal_bk_id
                          ? <span title={`Bestandskunden-Deal #${d.umstellung_deal_bk_id}`
                              + (d.umstellung_dienstleistung ? ` · ${d.umstellung_dienstleistung}` : '')}>
                              {d.umstellung_status === 'Gewonnen'
                                ? formatEuro(d.umstellung_ae_wert_eur ?? d.umstellung_ae_wert)
                                : <span className="text-gray-500">{formatEuro(d.umstellung_angebotswert)}</span>}
                            </span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-1.5">
                        {/* Der Trichter-Zustand steht im Status des verknüpften Deals, nicht am
                            Verlängerungs-Deal. Deshalb hier und nicht in der Status-Spalte. */}
                        {!d.umstellung_deal_bk_id ? <span className="text-gray-300 text-[11px]">—</span>
                          : d.umstellung_status === 'Offen'
                            ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">Angebot offen</span>
                          : d.umstellung_status === 'Verloren'
                            ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-300">abgelehnt</span>
                            : <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300">angenommen</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        {d.status !== 'Umgestellt' && !d.umstellung_deal_bk_id && (
                          <>
                            <button onClick={() => oeffnen(d, 'angebot')}
                              className="px-2 py-1 text-[11px] border border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded">
                              Umstellung anbieten
                            </button>
                            <button onClick={() => oeffnen(d, 'direkt')}
                              className="ml-1 px-2 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                              title="Ohne Vorstufe: Angebot und Annahme am selben Tag">
                              direkt umstellen
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modal && (
        <DealModal
          key={`${modal.deal.id}-${modal.modus}`}
          title={modal.modus === 'direkt'
            ? `Direkt auf Dauer-RaaS umstellen — ${modal.deal.kunde}`
            : `Umstellung anbieten — ${modal.deal.kunde}`}
          initial={modal.initial}
          fields={modal.modus === 'direkt'
            ? [{ name: 'dauervertrag_datum', label: 'Umstellungsdatum (Verlängerung)', type: 'date', required: true,
                 hint: 'Bestimmt den Monat, in dem die Umstellung zählt und die 3 % gebucht werden. '
                     + 'Die bisherige Verlängerungs-Provision von 2 % entfällt dadurch automatisch.' },
               ...angebotsFelder]
            : angebotsFelder}
          onSave={speichern}
          onClose={() => { setModal(null); setFehler(null); }}
          fehler={fehler}
          busy={speichert}
        />
      )}
    </div>
  );
}
