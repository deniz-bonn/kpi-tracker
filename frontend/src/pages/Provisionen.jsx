import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { provisionenApi } from '../utils/api';
import { formatEuro } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import Kontoauszug from '../components/Kontoauszug';
import { KREISE } from '../utils/kreise';

// ─────────────────────────────────────────────────────────────────────────────
// Provisionen (Admin/Vertriebsleitung) — Gesamtübersicht je Abrechnungszeitraum,
// Standort-Filter, Einzeldetail je Mitarbeiter, Live-Staffel-Anzeige. Superadmin:
// laufenden Zeitraum initialisieren. Read-only bis auf Backfill/Abschluss.
// ─────────────────────────────────────────────────────────────────────────────

const fmtPct = (n) => String(n ?? 0).replace('.', ',') + ' %';
const betragCls = (n) => (Number(n) < 0 ? 'text-rose-600' : 'text-gray-900');
const ROLLE_LABEL = { opener: 'Opener', setter: 'Setter', closer: 'Closer', opener_setter: 'Opener+Setter', team: 'Team', kam: 'KAM', opener_fix: 'Opener-Fix (125 €)', at_opener_staffel: 'Opener-Staffel', at_setter_staffel: 'Setter-Staffel' };
const BK = 'bestandskunden';
// Rollen-Gruppen-Filter (nur im BK-Kreis sinnvoll: dort buendelt eine Liste alle Standorte).
const GRUPPEN = [{ key: '', label: 'Alle' }, { key: 'kam', label: 'Key Account Manager' }, { key: 'am', label: 'Account Manager' }];

function StandortBadge({ standort }) {
  if (!standort) return null;
  const cls = standort === 'Bonn' ? 'bg-blue-50 text-blue-700'
    : standort === 'Braunschweig' ? 'bg-purple-50 text-purple-700'
    : standort === 'Österreich' ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-gray-500';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{standort}</span>;
}

function DetailModal({ employeeId, zeitraumId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['prov-emp', employeeId, zeitraumId],
    queryFn: () => provisionenApi.employee(employeeId, zeitraumId || undefined),
  });
  const buchungen = data?.buchungen || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="font-bold text-gray-900">{data?.employee?.name || 'Mitarbeiter'}</div>
            <div className="text-xs text-gray-500">{data?.zeitraum?.label} · Summe {formatEuro(data?.summe || 0)}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto">
          {isLoading ? <div className="p-8 text-center text-sm text-gray-400">Lädt…</div> : <Kontoauszug buchungen={buchungen} />}
        </div>
      </div>
    </div>
  );
}

function BackfillPanel({ kreis, kreisLabel, onDone }) {
  const [proj, setProj] = useState(null);
  const [msg, setMsg] = useState('');
  const dry = useMutation({ mutationFn: () => provisionenApi.backfillDry(kreis), onSuccess: (d) => { setProj(d); setMsg(''); } });
  const run = useMutation({
    mutationFn: () => provisionenApi.backfillRun(kreis),
    onSuccess: (d) => { const dek = d.dekopplung ? `, ${d.dekopplung.deleted} BS-Zeilen aus Bonn gelöst` : ''; setMsg(`Backfill (${kreisLabel}) ausgeführt: ${d.gewonneneInScope ?? d.verarbeitet ?? 0} gewonnene Deals${dek}.`); setProj(null); onDone?.(); },
  });
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-amber-900">⚙️ Backfill {kreisLabel} <span className="text-xs font-normal text-amber-700">(nur Superadmin{kreis === 'braunschweig' ? ', inkl. Entkopplung aus Bonn' : ''})</span></div>
        <button onClick={() => dry.mutate()} disabled={dry.isPending}
          className="rounded-lg bg-white border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50">
          {dry.isPending ? 'Berechne…' : 'Projektion anzeigen (Dry-Run)'}
        </button>
      </div>
      {proj && (
        <div className="rounded-xl bg-white border border-amber-200 p-3 text-sm space-y-2">
          <div className="text-gray-700">Go-Live <b>{proj.goLive}</b> · <b>{proj.inScopeDeals ?? proj.positionen}</b> In-Scope-Deals → <b>{proj.positionen}</b> Positionen · Summe <b>{formatEuro(proj.totalBase ?? proj.total)}</b></div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(proj.perRolle || proj.perQuelle || {}).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{v.label || ROLLE_LABEL[k] || k} <b>{v.n}×</b> {formatEuro(v.summe)}</span>
            ))}
          </div>
          {proj.perMonat && Object.keys(proj.perMonat).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(proj.perMonat).map(([m, sum]) => (
                <span key={m} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700">{m} <b>{formatEuro(sum)}</b></span>
              ))}
            </div>
          )}
          {/* Ausdruecklich sichtbar statt still verschluckt: Deals, die NUR wegen der Achse
              gewonnen_monat herausfallen (gewonnen_datum liegt im Zeitraum, gewonnen_monat davor).
              Das sind typischerweise nachgeholte Statuspflegen alter Kohorten. */}
          {proj.ausserhalb?.length > 0 && (
            <details className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-amber-800">
                {proj.ausserhalb.length} Deal(s) fallen durch die Achse „Gewonnen-Monat" heraus — nicht gebucht
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-amber-900">
                {proj.ausserhalb.map((d) => (
                  <li key={`${d.quelle}-${d.id}`}>
                    <b>{d.quelle.toUpperCase()} #{d.id}</b> {d.kunde} · {formatEuro(d.ae_wert)} · Gewonnen-Datum {String(d.gewonnen_datum).slice(0, 10)}, aber Gewonnen-Monat <b>{d.gewonnen_monat}</b>{d.kam ? ` · KAM ${d.kam}` : ''}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {proj.ohneBetrag?.length > 0 && (
            <details className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-gray-700">
                {proj.ohneBetrag.length} gewonnene Deal(s) ohne AE-Wert — Provision 0, keine Buchung
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                {proj.ohneBetrag.map((d) => (
                  <li key={`${d.quelle}-${d.id}`}><b>{d.quelle.toUpperCase()} #{d.id}</b> {d.kunde} · {d.gewonnen_monat}{d.kam ? ` · KAM ${d.kam}` : ''}</li>
                ))}
              </ul>
            </details>
          )}
          {proj.ohneEmpfaenger?.length > 0 && (
            <details className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-rose-800">
                {proj.ohneEmpfaenger.length} gewonnene Deal(s) ohne provisionsberechtigten KAM
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-rose-900">
                {proj.ohneEmpfaenger.map((d) => (
                  <li key={`${d.quelle}-${d.id}`}>
                    <b>{d.quelle.toUpperCase()} #{d.id}</b> {d.kunde} · {formatEuro(d.ae_wert)} · {d.gewonnen_monat} · Grund: {
                      { kein_kam: 'kein KAM hinterlegt', kam_unbekannt: 'KAM-Zuordnung zeigt ins Leere',
                        rolle_nicht_berechtigt: `Rolle nicht berechtigt${d.kam ? ` (${d.kam})` : ''}`,
                        standort_ausserhalb: `Standort außerhalb des Kreises${d.standort ? ` (${d.standort})` : ''}` }[d.grund] || d.grund
                    }
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button
            onClick={() => { if (window.confirm(`Backfill jetzt ausführen? Bucht ${proj.positionen} Positionen (idempotent, mehrfach ausführbar).`)) run.mutate(); }}
            disabled={run.isPending}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50">
            {run.isPending ? 'Buche…' : 'Backfill ausführen'}
          </button>
        </div>
      )}
      {msg && <div className="text-sm font-semibold text-emerald-700">{msg}</div>}
      <p className="text-xs text-amber-700/80">Idempotent: pflegt nur fehlende Buchungen nach, doppeltes Ausführen ist harmlos. Neue Deals werden ohnehin automatisch verbucht.</p>
    </div>
  );
}

// Provisionsabzuege (nur Superadmin). Jeder Abzug wird eine eigene Zeile im Kontoauszug des
// Mitarbeiters — mit Begruendung, sichtbar in "Meine Provision". Kein Loeschen: ein falscher
// Abzug wird zurueckgenommen (Gegenbuchung), beide Zeilen bleiben nachvollziehbar stehen.
const fmtTag = (ts) => (ts ? new Date(ts).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');
const euroCent = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);

function AbzuegePanel({ onChange }) {
  const qc = useQueryClient();
  const [offen, setOffen] = useState(false);
  const [emp, setEmp] = useState('');
  const [zid, setZid] = useState('');
  const [betrag, setBetrag] = useState('');
  const [grund, setGrund] = useState('');
  const [ok, setOk] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['prov-abzuege'], queryFn: provisionenApi.abzuege, enabled: offen });
  const { data: zr } = useQuery({
    queryKey: ['prov-abzug-zeitraeume', emp], queryFn: () => provisionenApi.abzugZeitraeume(emp), enabled: offen && !!emp,
  });
  useEffect(() => { setZid(zr?.laufend_id ? String(zr.laufend_id) : (zr?.zeitraeume?.[0]?.id ? String(zr.zeitraeume[0].id) : '')); }, [zr]);
  const fertig = () => { qc.invalidateQueries({ queryKey: ['prov-abzuege'] }); qc.invalidateQueries({ queryKey: ['prov-emp'] }); onChange?.(); };
  const buchen = useMutation({
    mutationFn: () => provisionenApi.abzugBuchen({ employee_id: Number(emp), zeitraum_id: Number(zid), betrag, begruendung: grund }),
    onSuccess: (row) => { setOk(`Abzug über ${euroCent(Math.abs(row.betrag))} gebucht.`); setBetrag(''); setGrund(''); fertig(); },
  });
  const zurueck = useMutation({ mutationFn: (id) => provisionenApi.abzugZuruecknehmen(id), onSuccess: fertig });
  const personen = data?.personen || [];
  const abzuege = data?.abzuege || [];
  const betragZahl = Number(String(betrag).replace(',', '.'));
  const kannBuchen = emp && zid && betragZahl > 0 && grund.trim().length >= 5 && !buchen.isPending;
  const name = personen.find((p) => String(p.id) === String(emp))?.name || '';
  const zLabel = (zr?.zeitraeume || []).find((z) => String(z.id) === String(zid))?.label || '';
  const inp = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800';

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/40">
      <button onClick={() => setOffen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="text-sm font-semibold text-rose-900">➖ Provisionsabzüge <span className="text-xs font-normal text-rose-700">(nur Superadmin · erscheinen mit Begründung im Kontoauszug des Mitarbeiters)</span></span>
        <span className="text-rose-700 text-sm">{offen ? '▲' : '▼'}</span>
      </button>
      {offen && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block"><span className="text-xs text-gray-500">Mitarbeiter</span>
              <select value={emp} onChange={(e) => { setEmp(e.target.value); setOk(''); }} className={inp}>
                <option value="">— auswählen —</option>
                {personen.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.standort})</option>)}
              </select></label>
            <label className="block"><span className="text-xs text-gray-500">Abrechnungszeitraum</span>
              <select value={zid} onChange={(e) => setZid(e.target.value)} disabled={!emp} className={inp}>
                {(zr?.zeitraeume || []).map((z) => <option key={z.id} value={z.id}>{z.label}{String(z.id) === String(zr?.laufend_id) ? ' (laufend)' : ''}</option>)}
              </select></label>
            <label className="block"><span className="text-xs text-gray-500">Abzug in €</span>
              <input type="number" min="0.01" step="0.01" value={betrag} onChange={(e) => setBetrag(e.target.value)} placeholder="z. B. 250" className={inp} /></label>
          </div>
          <label className="block"><span className="text-xs text-gray-500">Begründung (sieht der Mitarbeiter genau so in seiner Abrechnung)</span>
            <textarea value={grund} onChange={(e) => setGrund(e.target.value)} rows={2} maxLength={500}
              placeholder="z. B. Storno Kunde XY nach Abrechnung — Provision aus Zeitraum 21.09.–20.10. zurückgefordert" className={inp} /></label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { if (window.confirm(`Abzug buchen?\n\n${name}\n${euroCent(betragZahl)} im Zeitraum ${zLabel}\nBegründung: ${grund.trim()}`)) { setOk(''); buchen.mutate(); } }}
              disabled={!kannBuchen}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-40">
              {buchen.isPending ? 'Buche…' : 'Abzug buchen'}
            </button>
            {!kannBuchen && !buchen.isPending && <span className="text-xs text-gray-400">Mitarbeiter, Betrag und Begründung (min. 5 Zeichen) angeben</span>}
            {buchen.isError && <span className="text-xs text-rose-700">{buchen.error?.response?.data?.error || 'Buchen fehlgeschlagen'}</span>}
            {ok && <span className="text-xs font-semibold text-emerald-700">{ok}</span>}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Gebuchte Abzüge</div>
            {isLoading ? <div className="p-4 text-sm text-gray-400">Lädt…</div> : abzuege.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">Noch keine Abzüge.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">Datum</th><th className="px-3 py-2 font-medium">Mitarbeiter</th>
                    <th className="px-3 py-2 font-medium">Zeitraum</th><th className="px-3 py-2 font-medium">Begründung</th>
                    <th className="px-3 py-2 font-medium text-right">Betrag</th><th className="px-4 py-2 font-medium text-right"></th>
                  </tr></thead>
                  <tbody>
                    {abzuege.map((a) => (
                      <tr key={a.id} className={`border-b border-gray-50 last:border-0 align-top ${a.zurueckgenommen ? 'text-gray-400' : ''}`}>
                        <td className="px-4 py-2 whitespace-nowrap">{fmtTag(a.created_at)}</td>
                        <td className="px-3 py-2 whitespace-nowrap font-medium">{a.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{a.zeitraum}</td>
                        <td className="px-3 py-2 break-words">{a.beschreibung}</td>
                        <td className={`px-3 py-2 text-right whitespace-nowrap font-semibold ${a.zurueckgenommen ? 'line-through' : 'text-rose-600'}`}>{euroCent(a.betrag)}</td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          {a.zurueckgenommen
                            ? <span className="text-xs">zurückgenommen {fmtTag(a.storno_am)}</span>
                            : <button onClick={() => { if (window.confirm(`Abzug zurücknehmen?\n\n${a.name}: ${euroCent(a.betrag)}\n„${a.beschreibung}"\n\nEs wird eine Gegenbuchung im laufenden Zeitraum angelegt; beide Zeilen bleiben im Kontoauszug sichtbar.`)) zurueck.mutate(a.id); }}
                                disabled={zurueck.isPending} className="text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-50">Zurücknehmen</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {zurueck.isError && <div className="px-4 py-2 text-xs text-rose-700">{zurueck.error?.response?.data?.error || 'Zurücknehmen fehlgeschlagen'}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Provisionen() {
  const { isSuperAdmin } = useAuth();
  const qc = useQueryClient();
  const [kreis, setKreis] = useState('bonn');
  const [zid, setZid] = useState('');
  const [detailEmp, setDetailEmp] = useState(null);
  const [exportErr, setExportErr] = useState('');
  const [gruppe, setGruppe] = useState('');     // Rollen-Gruppen-Filter (BK-Kreis)
  const [standort, setStandort] = useState(''); // Standort-Filter

  // Welche Kreise darf DIESER Nutzer sehen? Einzelfreigaben koennen auf einzelne Kreise begrenzt
  // sein (z. B. "nur Österreich"). Der Server setzt das durch; hier nur Reiter und Startkreis.
  const { data: erlaubt } = useQuery({ queryKey: ['prov-kreise'], queryFn: provisionenApi.kreise });
  const sichtbareKreise = KREISE.filter((k) => (erlaubt || []).includes(k.key));
  const kreisErlaubt = !!erlaubt && erlaubt.includes(kreis);
  useEffect(() => {
    if (erlaubt?.length && !erlaubt.includes(kreis)) { setKreis(erlaubt[0]); setZid(''); }
  }, [erlaubt]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: zeitraeume = [] } = useQuery({ queryKey: ['prov-zeitraeume', kreis], queryFn: () => provisionenApi.zeitraeume(kreis), enabled: kreisErlaubt });
  const { data, isLoading } = useQuery({
    queryKey: ['prov-overview', kreis, zid],
    queryFn: () => provisionenApi.overview({ kreis, zeitraum_id: zid || undefined }),
    placeholderData: keepPreviousData,
    enabled: kreisErlaubt,
  });

  const zSel = zid || data?.zeitraum?.id || '';
  const istBk = kreis === BK;
  const alleZeilen = data?.zeilen || [];
  // Standort-Auswahl aus den TATSAECHLICH vorhandenen Zeilen, nicht aus einer festen Liste:
  // im BK-Kreis stehen Bonn/Braunschweig/Österreich nebeneinander, in den NK-Kreisen gibt es
  // in aller Regel nur einen. So entstehen keine Filterknöpfe, hinter denen nichts liegt —
  // und ein spaeter hinzukommender Standort taucht von selbst auf.
  const standorte = [...new Set(alleZeilen.map((r) => r.standort).filter(Boolean))].sort();
  // Beide Filter wirken zusammen (UND) und rein clientseitig.
  const zeilen = alleZeilen.filter((r) =>
    (!gruppe || r.gruppe === gruppe) && (!standort || r.standort === standort));
  const gefiltert = !!(gruppe || standort);
  const summeGefiltert = Math.round(zeilen.reduce((a, r) => a + Number(r.summe || 0), 0) * 100) / 100;
  const staffel = data?.staffel || {};
  const closerMap = Object.fromEntries((staffel.closers || []).map((c) => [c.employee_id, c]));
  const atOpenerMap = Object.fromEntries((staffel.atOpener || []).map((c) => [c.employee_id, c]));
  const atSetterMap = Object.fromEntries((staffel.atSetter || []).map((c) => [c.employee_id, c]));
  const gesamt = data?.gesamt ?? Math.round(zeilen.reduce((a, r) => a + Number(r.summe || 0), 0) * 100) / 100;
  const kreisMeta = KREISE.find((k) => k.key === kreis) || KREISE[0];
  const changeKreis = (k) => { setKreis(k); setZid(''); setGruppe(''); setStandort(''); };

  const abschlussMut = useMutation({
    mutationFn: () => provisionenApi.abschluss(zSel),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prov-zeitraeume'] }); qc.invalidateQueries({ queryKey: ['prov-overview'] }); },
  });
  const doExport = async () => { setExportErr(''); try { await provisionenApi.exportCsv(zSel); } catch (e) { setExportErr('Export fehlgeschlagen.'); } };
  const doExportMonat = async () => {
    setExportErr('');
    const monat = String(data?.zeitraum?.von || '').slice(0, 7);
    try { await provisionenApi.exportMonatCsv(monat); } catch (e) { setExportErr('Sammel-Export fehlgeschlagen.'); }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">🧾 Provisionen</h1>
        <select value={zSel} onChange={(e) => setZid(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 bg-white">
          {zeitraeume.map((z) => (
            <option key={z.id} value={z.id}>{z.label}{z.status === 'abgeschlossen' ? ' (abgeschlossen)' : ''}</option>
          ))}
        </select>
      </div>

      {/* Abrechnungskreis (Standort-Dimension) — steuert Zeiträume, Regeln und Export */}
      <div className="space-y-1.5">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
          {sichtbareKreise.map((k) => (
            <button key={k.key} onClick={() => changeKreis(k.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${kreis === k.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{k.label}</button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{kreisMeta.zyklus}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          {istBk && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Rollen-Gruppe</span>
              <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
                {GRUPPEN.map((g) => (
                  <button key={g.key} onClick={() => setGruppe(g.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${gruppe === g.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{g.label}</button>
                ))}
              </div>
            </div>
          )}
          {standorte.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Standort</span>
              <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
                <button onClick={() => setStandort('')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${!standort ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Alle</button>
                {standorte.map((st) => (
                  <button key={st} onClick={() => setStandort(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${standort === st ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{st}</button>
                ))}
              </div>
            </div>
          )}
          {gefiltert && (
            <button onClick={() => { setGruppe(''); setStandort(''); }}
              className="text-[11px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-700">
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {isSuperAdmin && data?.zeitraum && (
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={doExport} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">⬇ StB-Export (CSV)</button>
          {/* Ein Lohnlauf-File statt drei: wer in zwei Kreisen Provision bekommt (Closer-KAM),
              stuende sonst in mehreren Dateien. Bonn fehlt bewusst — anderer Zyklus (21.–20.). */}
          {kreis !== 'bonn' && data.zeitraum.von && (
            <button onClick={doExportMonat} title="Alle Kalendermonats-Kreise dieses Monats in einer Datei (Braunschweig, Österreich, Bestandskundenvertrieb)"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              ⬇ Sammel-Export Monat
            </button>
          )}
          {data.zeitraum.status === 'offen' ? (
            <button
              onClick={() => { if (window.confirm(`Zeitraum „${data.zeitraum.label}" abschließen? Buchungen werden eingefroren; spätere Stornos/Korrekturen laufen in den Folgezeitraum.`)) abschlussMut.mutate(); }}
              disabled={abschlussMut.isPending}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50">
              {abschlussMut.isPending ? 'Schließe…' : '🔒 Zeitraum abschließen'}
            </button>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">✓ Abgeschlossen{data.zeitraum.abgeschlossen_am ? ` am ${data.zeitraum.abgeschlossen_am}` : ''}</span>
          )}
          {abschlussMut.isError && <span className="text-xs text-rose-600">{abschlussMut.error?.response?.data?.error || 'Abschluss fehlgeschlagen'}</span>}
          {exportErr && <span className="text-xs text-rose-600">{exportErr}</span>}
        </div>
      )}

      {isSuperAdmin && <AbzuegePanel onChange={() => qc.invalidateQueries({ queryKey: ['prov-overview'] })} />}

      {isSuperAdmin && <BackfillPanel kreis={kreis} kreisLabel={kreisMeta.label} onDone={() => { qc.invalidateQueries({ queryKey: ['prov-overview'] }); qc.invalidateQueries({ queryKey: ['prov-zeitraeume'] }); }} />}

      <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 shadow-sm flex items-baseline justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-300">
          Gesamt · {kreisMeta.label}{data?.zeitraum ? ` · ${data.zeitraum.label}` : ''}
          {/* Nach Standort zu filtern beantwortet erst dann eine Frage ("was kostet
              Braunschweig diesen Monat?"), wenn man die gefilterte Summe auch sieht.
              Die grosse Zahl bleibt bewusst die des GANZEN Zeitraums — sonst liest
              sich ein aktiver Filter wie eine Teil-Abrechnung. */}
          {gefiltert && (
            <span className="ml-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[11px] normal-case tracking-normal text-gray-200">
              Auswahl {[standort, gruppe === 'kam' ? 'KAM' : gruppe === 'am' ? 'AM' : null].filter(Boolean).join(' · ')}
              {': '}<b>{formatEuro(summeGefiltert)}</b>
              <span className="text-gray-400"> ({zeilen.length} von {alleZeilen.length})</span>
            </span>
          )}
        </div>
        <div className="text-3xl font-bold">{formatEuro(gesamt)}</div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">Berechtigte im Zeitraum</div>
        {isLoading && !data ? (
          <div className="p-8 text-center text-sm text-gray-400">Lädt…</div>
        ) : zeilen.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            {gefiltert && alleZeilen.length > 0
              ? 'Keine Einträge für diese Filterauswahl.'
              : <>Keine Einträge in diesem Zeitraum.{isSuperAdmin ? ' Ggf. oben den Backfill ausführen.' : ''}</>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 font-medium w-10">#</th>
                  <th className="px-4 py-2 font-medium">Mitarbeiter</th>
                  <th className="px-4 py-2 font-medium">Standort</th>
                  <th className="px-4 py-2 font-medium">{istBk ? 'Rolle' : 'Satz (Monat)'}</th>
                  <th className="px-4 py-2 font-medium text-right">Provision</th>
                  <th className="px-4 py-2 font-medium text-right w-20"></th>
                </tr>
              </thead>
              <tbody>
                {zeilen.map((r, i) => {
                  const cl = closerMap[r.employee_id], ao = atOpenerMap[r.employee_id], as = atSetterMap[r.employee_id];
                  return (
                    <tr key={r.employee_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setDetailEmp(r.employee_id)}>
                      <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{r.name || `#${r.employee_id}`}</td>
                      <td className="px-4 py-2"><StandortBadge standort={r.standort} /></td>
                      <td className="px-4 py-2">
                        {istBk ? (
                          r.gruppe
                            ? <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.gruppe === 'kam' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>{r.gruppe === 'kam' ? 'KAM' : 'AM'}</span>
                            : <span className="text-xs text-gray-300">—</span>
                        ) : kreis === 'oesterreich' ? (
                          (ao || as) ? (
                            <div className="flex flex-wrap gap-1">
                              {ao && <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700" title={`Opener Monats-AE ${formatEuro(ao.monthAe)}${ao.nextSatz != null ? ` · noch ${formatEuro(ao.restBisNext)} bis ${fmtPct(ao.nextSatz)}` : ' · Höchststufe'}`}>O {fmtPct(ao.satz)}</span>}
                              {as && <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold bg-cyan-50 text-cyan-700" title={`Setter Monats-AE ${formatEuro(as.monthAe)}${as.nextSatz != null ? ` · noch ${formatEuro(as.restBisNext)} bis ${fmtPct(as.nextSatz)}` : ' · Höchststufe'}`}>S {fmtPct(as.satz)}</span>}
                            </div>
                          ) : <span className="text-xs text-gray-300">—</span>
                        ) : cl ? (
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${cl.satz > cl.basis ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
                            title={cl.erreichtAm ? `200k-Schwelle am ${cl.erreichtAm.slice(8, 10)}.${cl.erreichtAm.slice(5, 7)}. erreicht` : `noch ${formatEuro(cl.restBisNext)} bis ${fmtPct(cl.hoch)}`}>
                            {fmtPct(cl.satz)}
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className={`px-4 py-2 text-right font-semibold ${betragCls(r.summe)}`}>{formatEuro(r.summe)}</td>
                      <td className="px-4 py-2 text-right"><span className="text-xs text-indigo-600 font-semibold">Details →</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">{kreisMeta.zyklus}. Zeile anklicken für den Kontoauszug des Mitarbeiters.</p>

      {detailEmp != null && <DetailModal employeeId={detailEmp} zeitraumId={zSel} onClose={() => setDetailEmp(null)} />}
    </div>
  );
}
