import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vertragsverlaengerungenApi, dealsApi } from '../utils/api';
import { formatEuro, currentMonat } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import DealModal from '../components/DealModal';
import { ROLLE_GRUPPE_LABEL } from '../utils/rollen';
import { STANDORT_GRUPPEN, standortGruppeLabel } from '../utils/standorte';

// ─────────────────────────────────────────────────────────────────────────────
// Vertragsverlängerungen — wie viele anstehende Verlängerungen heben wir auf Dauer-RaaS?
//
// Die Seite ist eine LESENDE Auswertungsfläche. Erfasst wird über PUT /api/deals/vl/:id —
// dieselbe Route, die auch der VL-Bereich benutzt ("zwei Türen, ein Deal"). Dadurch kann es
// keine zwei Verhaltensweisen geben: Was hier gespeichert wird, ist byte-gleich mit dem, was
// im VL-Bereich gespeichert würde.
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

export default function Vertragsverlaengerungen() {
  const [monat, setMonat] = useState(currentMonat());
  const [standort, setStandort] = useState('');
  const [gruppe, setGruppe] = useState('');
  const [modal, setModal] = useState(null);

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

  // Erfassung läuft über die VL-Route — kein eigener Schreibpfad in diesem Bereich.
  const speichern = async (form) => {
    const ae = Number(form.umstellung_ae_wert);
    await dealsApi.vl.update(modal.deal.id, {
      ...modal.deal,
      status: 'Umgestellt',
      dauervertrag_datum: form.dauervertrag_datum,
      umstellung: { ae_wert: ae },
    });
    setModal(null);
    refetch();
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
            <Kachel label="Auf Dauer-RaaS" wert={g.umgestellt} ton="indigo"
              sub={`Umstellungsquote ${pct(g.umstellungsquote)}`} />
            <Kachel label="Regulär verlängert" wert={g.verlaengert} ton="green" />
            <Kachel label="Gekündigt" wert={g.gekuendigt} ton="red" sub={`Churn ${pct(g.churn)}`} />
            <Kachel label="Offen" wert={g.offen} ton="amber" sub="noch nicht entschieden" />
            <Kachel label="Neuer AE Dauer-RaaS" wert={formatEuro(g.dauer_raas_ae)} ton="indigo"
              sub="zählt im Bestandskunden-Umsatz" />
          </div>

          <p className="text-[11px] text-gray-400">
            Umstellungsquote = Umgestellt ÷ Anstehend · Churn = Kündigungen ÷ (Verlängert + Umgestellt + Gekündigt) ·
            Bestandserhalt {pct(g.erhaltsquote)} — eine Umstellung zählt wie eine Verlängerung, der Kunde bleibt.
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
                  <th className="px-3 py-2 text-right">Dauer-RaaS</th>
                  <th className="px-3 py-2 text-right">verlängert</th>
                  <th className="px-3 py-2 text-right">gekündigt</th>
                  <th className="px-3 py-2 text-right">offen</th>
                  <th className="px-3 py-2 text-right">Umstellungsquote</th>
                  <th className="px-3 py-2 text-right">neuer AE</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {personen.length === 0
                    ? <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Keine Daten für diesen Monat.</td></tr>
                    : personen.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-700">{p.name}</td>
                        <td className="px-3 py-1.5 text-gray-400">{p.gruppe ? ROLLE_GRUPPE_LABEL[p.gruppe] : '—'}</td>
                        <td className="px-3 py-1.5 text-right text-gray-600">{p.anstehend}</td>
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
                  <th className="px-3 py-2 text-right">AE Dauer-RaaS</th>
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
                          ? <span title={`Bestandskunden-Deal #${d.umstellung_deal_bk_id}`}>{formatEuro(d.umstellung_ae_wert_eur ?? d.umstellung_ae_wert)}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {d.status !== 'Umgestellt' && (
                          <button onClick={() => setModal({ deal: d })}
                            className="px-2 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded">
                            Auf Dauer-RaaS umstellen
                          </button>
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
          title={`Umstellung auf Dauer-RaaS — ${modal.deal.kunde}`}
          initial={{ dauervertrag_datum: new Date().toISOString().slice(0, 10), umstellung_ae_wert: '' }}
          fields={[
            { name: 'dauervertrag_datum', label: 'Umstellungsdatum', type: 'date', required: true,
              hint: 'Bestimmt den Monat, in dem die Umstellung zählt und die Provision gebucht wird.' },
            { name: 'umstellung_ae_wert', label: 'Neuer AE (Dauer-RaaS)', type: 'number', required: true,
              hint: 'Legt einen Bestandskunden-Deal an (12 Monate, Upsell 3 % an den Account Manager). '
                  + 'Die bisherige Verlängerungs-Provision von 2 % entfällt dadurch automatisch.' },
          ]}
          onSave={speichern}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
