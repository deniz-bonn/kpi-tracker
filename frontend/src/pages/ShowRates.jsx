import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showRatesApi } from '../utils/api';
import { currentMonat } from '../utils/format';

// Startmarke der Close-Ableitung. Spiegelt CLOSE_BACKFILL_AB in utils/closeSync.js — frueher
// liegende Ereignisse leitet der Sync ohnehin nicht zu Terminen ab.
const BACKFILL_AB = '2026-06-01';

// Zeitstempel-Anzeige. Postgres liefert ISO mit Zone, SQLite 'YYYY-MM-DD HH:MM:SS' in UTC —
// letzteres parst der Browser als lokale Zeit, deshalb das Z ergaenzen, bevor daraus ein Date wird.
function alsDatum(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v);
  const d = new Date(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s) ? s.replace(' ', 'T') + 'Z' : s);
  return isNaN(d) ? null : d;
}
const uhrzeit  = (v) => alsDatum(v)?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) ?? '—';
const zeitpunkt = (v) => alsDatum(v)?.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) ?? '—';

// Show Rates (Close) — Opener/Setter. Datenbasis ist die lokal gespiegelte Close-Status-Historie
// (siehe docs/close-discovery.md Rev. 4). Quote = stattgefunden / (stattgefunden + nicht stattgefunden);
// offene Termine (Ausgang nicht nachgetragen) bleiben bewusst draussen und stehen im Qualitaets-Block.
// 'verschoben' ist quotenNEUTRAL, zaehlt aber als GEPFLEGTER Ausgang ins Belastbarkeits-Gate —
// Quote und Gate rechnen deshalb auf verschiedenen Mengen (basis vs. gepflegt).

const ART = [['setting', 'Settings (Opener)'], ['closing', 'Closings / Sales Calls (Setter)']];
const rateColor = (r) => r == null ? 'text-gray-400' : r >= 80 ? 'text-green-600' : r >= 60 ? 'text-amber-600' : 'text-red-600';
const pctTxt = (r) => r == null ? '—' : `${r.toFixed(1)} %`;

function RateZelle({ z }) {
  if (!z || z.gelegt === 0) return <span className="text-gray-300">—</span>;
  if (!z.belastbar) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500" title={
        `Nicht belastbar: ${z.gepflegt ?? z.basis} von ${z.gelegt} Terminen haben einen gepflegten Ausgang` +
        (z.verschoben ? ` (davon ${z.verschoben} verschoben — quotenneutral)` : '') +
        (z.bewertetQuote != null ? ` = ${z.bewertetQuote} %` : '')}>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Datenbasis unzureichend
      </span>
    );
  }
  return <span className={`font-bold ${rateColor(z.rate)}`}>{pctTxt(z.rate)}</span>;
}

export default function ShowRates() {
  const qc = useQueryClient();
  const [monat, setMonat] = useState(currentMonat());
  const [tab, setTab] = useState('uebersicht');

  const { data: ov, isLoading } = useQuery({ queryKey: ['sr-overview'], queryFn: showRatesApi.overview });
  const { data: personen = [] } = useQuery({ queryKey: ['sr-personen', monat], queryFn: () => showRatesApi.personen(monat) });
  const { data: quellen = [] }  = useQuery({ queryKey: ['sr-quellen', monat],  queryFn: () => showRatesApi.quellen(monat) });
  const { data: qual }          = useQuery({ queryKey: ['sr-qualitaet'],       queryFn: showRatesApi.qualitaet });

  // ── Sync: 202 + Polling statt synchronem Warten ──────────────────────────────
  // Der Voll-Backfill dauert ~70 s; synchron lief er in den 20-s-Timeout von axios und meldete
  // "fehlgeschlagen", obwohl er im Hintergrund weiterlief. Jetzt: starten, dann Status pollen.
  //
  // Zwei Fallen, die hier bewusst adressiert sind:
  //  (a) refetchInterval als einfacher Wert startete NICHT zuverlaessig neu, wenn der letzte Fetch
  //      schon abgeschlossen war. Deshalb die Funktionsform + ein explizites refetch() nach dem 202.
  //  (b) Ein Lauf kann schneller fertig sein als der erste Poll (ein 401 kommt nach ~0,6 s zurueck).
  //      Ein "lief vorher, laeuft jetzt nicht mehr"-Vergleich verpasst das. Deshalb merken wir uns
  //      die runId und lesen ihr Ergebnis aus der Historie — unabhaengig davon, wie schnell es ging.
  const [hinweis, setHinweis] = useState(null);        // { art: 'info'|'fehler', text }
  const [pollt, setPollt]     = useState(false);       // steuert das Poll-Intervall
  const laufendeId = useRef(null);                     // runId, auf deren Ergebnis wir warten

  const { data: syncStatus, refetch: statusNeuLaden } = useQuery({
    queryKey: ['sr-sync-status'],
    queryFn: showRatesApi.syncStatus,
  });

  // Bewusst ein eigenes Intervall statt refetchInterval: dessen Neustart nach einem bereits
  // abgeschlossenen Fetch war hier nicht verlaesslich (gemessen: nach dem 202 kam genau EIN
  // Status-Request, danach nichts mehr, die UI blieb auf "Synchronisiere…" stehen).
  useEffect(() => {
    if (!pollt) return;
    const t = setInterval(() => statusNeuLaden(), 2000);
    return () => clearInterval(t);
  }, [pollt, statusNeuLaden]);

  const laeuft = !!syncStatus?.laeuft;

  // Ergebnis des selbst gestarteten Laufs aus der Historie lesen, sobald es da ist.
  useEffect(() => {
    const id = laufendeId.current;
    if (!id || !syncStatus?.laeufe) return;
    const lauf = syncStatus.laeufe.find(l => l.id === id);
    if (!lauf || lauf.status === 'laeuft') return;

    laufendeId.current = null;
    setPollt(false);
    ['sr-overview', 'sr-personen', 'sr-quellen', 'sr-qualitaet'].forEach(k => qc.invalidateQueries({ queryKey: [k] }));
    if (lauf.status === 'ok') {
      setHinweis({ art: 'info', text: `Sync fertig in ${Number(lauf.dauer_sek).toFixed(0)} s · `
        + `${lauf.events ?? '—'} Events · ${lauf.termine ?? '—'} Termine` });
    } else {
      setHinweis({ art: 'fehler', text: `Sync fehlgeschlagen: ${lauf.fehler || lauf.status}` });
    }
  }, [syncStatus, qc]);

  const syncMut = useMutation({
    mutationFn: (since) => showRatesApi.sync(since),
    onMutate: () => setHinweis(null),
    onSuccess: (r) => {
      if (r.httpStatus === 202) {
        laufendeId.current = r.runId;
        setPollt(true);
        statusNeuLaden();                                // erster Abruf sofort, dann alle 2 s
        return;
      }
      if (r.httpStatus === 409) {
        laufendeId.current = r.runId ?? null;
        setPollt(true);
        statusNeuLaden();
        setHinweis({ art: 'info', text: `Sync läuft bereits — gestartet ${uhrzeit(r.gestartetAm)}` });
        return;
      }
      if (r.httpStatus === 429) {
        const min = Math.ceil((r.restSek || 0) / 60);
        setHinweis({ art: 'info', text: `Zuletzt synchronisiert ${uhrzeit(r.letzterLauf)} — `
          + `frühestens in ${min} Minute${min === 1 ? '' : 'n'} wieder (Cooldown ${r.cooldownMin} min).` });
      }
    },
    onError: (e) => setHinweis({ art: 'fehler', text: e?.response?.data?.error || e.message }),
  });

  // Laeuft beim Seitenaufruf schon ein fremder Sync (z.B. der Nightly), mitlaufen lassen.
  useEffect(() => {
    if (laeuft && !laufendeId.current) {
      laufendeId.current = syncStatus?.laufend?.runId ?? null;
      setPollt(true);
    }
  }, [laeuft, syncStatus]);

  const monate = ov?.monate || [];
  const aktuell = useMemo(() => monate.find(m => m.monat === monat), [monate, monat]);
  const monatsOpts = useMemo(() => [...new Set([...monate.map(m => m.monat), monat])].sort().reverse(), [monate, monat]);

  const sel = 'bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5';
  const card = 'rounded-xl border border-gray-200 overflow-hidden';
  const head = 'px-4 py-2.5 bg-[#2d2e30] border-b border-[#444]';

  if (isLoading) return <div className="text-sm text-gray-400 py-6">Lade…</div>;

  return (
    <div className="space-y-4">
      {/* Kopf */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Show Rates (Close)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Aus den Lead- und Opportunity-Statusdaten in Close · Quote = stattgefunden ÷ (stattgefunden + No-Show/Abgesagt)
          </p>
          {(syncStatus?.letzterErfolg || ov?.letzterSync) && (
            <p className="text-xs text-gray-400 mt-0.5">
              {syncStatus?.letzterErfolg
                ? <>Zuletzt synchronisiert: {uhrzeit(syncStatus.letzterErfolg.beendet_am)}
                    {' · '}{syncStatus.letzterErfolg.events ?? '—'} Events
                    {' · '}{syncStatus.letzterErfolg.termine ?? '—'} Termine
                    {syncStatus.letzterErfolg.ausgeloest_von === 'cron'
                      ? ' (nächtlicher Lauf)'
                      : syncStatus.letzterErfolg.user_name ? ` (${syncStatus.letzterErfolg.user_name})` : ''}</>
                : <>Letzter Sync: {zeitpunkt(ov.letzterSync)}</>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={monat} onChange={e => setMonat(e.target.value)} className={sel}>
            {monatsOpts.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {/* Kein Rollen-Gate mehr: wer den Bereich sieht, darf synchronisieren (serverseitig
              durchgesetzt ueber requireFeature). Der Button ist nur die Sichtbarkeit. */}
          <button onClick={() => syncMut.mutate(undefined)} disabled={syncMut.isPending || laeuft}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded">
            {laeuft ? 'Synchronisiere…' : syncMut.isPending ? 'Starte…' : '↻ Sync'}
          </button>
          {/* VOLL-BACKFILL — bewusst ein EIGENER Knopf.
              Der normale Sync laeuft inkrementell: er holt nur Events ab dem juengsten bereits
              gespiegelten Zeitpunkt. Alte Zeilen fasst er nie wieder an — was genau dann zum
              Problem wird, wenn eine Spalte nachtraeglich dazukam (so geschehen mit status_id,
              Migration 101: 8.021 Events trugen sie nicht, und ihre Termine blieben dauerhaft
              'offen'). Erst ein Lauf mit `since` zieht sie per ON CONFLICT DO UPDATE nach.
              Deshalb nicht als Vorauswahl am Haupt-Button: ~2 Minuten Laufzeit und ein voller
              Close-Durchlauf sind nichts, was man versehentlich ausloest. */}
          <button
            onClick={() => {
              if (window.confirm(
                `Voll-Backfill ab ${BACKFILL_AB} starten?\n\n` +
                'Liest die gesamte Close-Historie ab diesem Datum neu ein und zieht dabei ' +
                'fehlende Status-IDs nach. Dauert rund zwei Minuten. Der normale Sync holt ' +
                'nur neue Ereignisse und repariert solche Lücken NICHT.')) {
                syncMut.mutate(BACKFILL_AB);
              }
            }}
            disabled={syncMut.isPending || laeuft}
            title={`Volle Close-Historie ab ${BACKFILL_AB} neu einlesen — repariert fehlende Status-IDs`}
            className="px-3 py-1.5 border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 text-sm rounded">
            ⟳ Voll-Backfill
          </button>
        </div>
      </div>

      {hinweis && (
        <div className={`text-xs rounded px-3 py-2 border ${hinweis.art === 'fehler'
          ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          {hinweis.text}
        </div>
      )}

      {laeuft && (
        <div className="text-xs bg-blue-50 border border-blue-200 text-blue-800 rounded px-3 py-2">
          <div className="font-semibold">
            Sync läuft{syncStatus?.laufend?.gestartetAm ? ` — gestartet ${uhrzeit(syncStatus.laufend.gestartetAm)}` : ''}
            {syncStatus?.laufend?.ausgeloestVon === 'cron' ? ' (nächtlicher Lauf)' : ''}
          </div>
          {syncStatus?.laufend?.schritte?.length > 0 && (
            <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] text-blue-700 leading-snug">
              {syncStatus.laufend.schritte.join('\n')}
            </pre>
          )}
        </div>
      )}

      <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs w-fit">
        {[['uebersicht', 'Übersicht'], ['personen', 'Nach Person'], ['quellen', 'Nach Quelle'], ['qualitaet', 'Datenqualität']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-3 py-1.5 font-medium transition-colors ${tab === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} ${v !== 'uebersicht' ? 'border-l border-gray-300' : ''}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Übersicht: Monatsreihe ── */}
      {tab === 'uebersicht' && (
        <>
          {ART.map(([art, label]) => (
            <div key={art} className={card}>
              <div className={head}><span className="text-xs font-bold text-white uppercase tracking-wide">{label}</span></div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <th className="px-3 py-2 text-left">Monat</th>
                      <th className="px-3 py-2 text-right">gelegt</th>
                      <th className="px-3 py-2 text-right">stattgefunden</th>
                      <th className="px-3 py-2 text-right">No-Show / abgesagt</th>
                      <th className="px-3 py-2 text-right" title="Quotenneutral: zaehlt als gepflegter Ausgang, aber nicht in die Quote">verschoben</th>
                      <th className="px-3 py-2 text-right">offen</th>
                      <th className="px-3 py-2 text-right">Show Rate</th>
                      <th className="px-3 py-2 text-right">gepflegt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monate.length === 0
                      ? <tr><td colSpan={8} className="px-3 py-6 text-center text-gray-400">Noch keine Daten — bitte Sync ausführen.</td></tr>
                      : monate.map(m => {
                          const z = m[art];
                          return (
                            <tr key={m.monat} className={`hover:bg-gray-50 ${m.monat === monat ? 'bg-blue-50/40' : ''}`}>
                              <td className="px-3 py-1.5 text-gray-700 font-medium">{m.monat}</td>
                              <td className="px-3 py-1.5 text-right text-gray-600">{z.gelegt}</td>
                              <td className="px-3 py-1.5 text-right text-green-700 font-medium">{z.stattgefunden}</td>
                              <td className="px-3 py-1.5 text-right text-red-600">{z.nicht_stattgefunden}</td>
                              <td className="px-3 py-1.5 text-right text-gray-500">{z.verschoben || 0}</td>
                              <td className="px-3 py-1.5 text-right text-amber-600">{z.offen}</td>
                              <td className="px-3 py-1.5 text-right"><RateZelle z={z} /></td>
                              {/* Der Bruch MUSS auf 'gepflegt' stehen, nicht auf 'basis': das Gate
                                  zaehlt verschobene Termine mit, die Quote nicht. Mit 'basis' wuerde
                                  die Prozentzahl danebenstehend nicht mehr aufgehen. */}
                              <td className="px-3 py-1.5 text-right text-gray-400"
                                  title={z.verschoben ? `${z.basis} bewertet + ${z.verschoben} verschoben` : undefined}>
                                {z.bewertetQuote != null ? `${z.bewertetQuote} %` : '—'}
                                <span className="text-gray-300"> ({z.gepflegt ?? z.basis}/{z.gelegt})</span>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-gray-400">
            „bewertet" = Anteil der gelegten Termine, bei denen der Ausgang nachgetragen wurde. Nur diese fließen in die Quote ein.
            Unter {ov?.schwellen?.minBewertetProzent ?? 50} % oder bei weniger als {ov?.schwellen?.minBasis ?? 10} bewertbaren
            Terminen wird bewusst keine Quote ausgewiesen — sie wäre dann nur eine Aussage über die gepflegte Teilmenge.
          </p>
        </>
      )}

      {/* ── Nach Person ── */}
      {tab === 'personen' && ART.map(([art, label]) => {
        const rows = personen.filter(p => p.art === art);
        return (
          <div key={art} className={card}>
            <div className={head}><span className="text-xs font-bold text-white uppercase tracking-wide">{label} · {monat}</span></div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <th className="px-3 py-2 text-left">Mitarbeiter</th>
                  <th className="px-3 py-2 text-right">gelegt</th>
                  <th className="px-3 py-2 text-right">stattgefunden</th>
                  <th className="px-3 py-2 text-right">No-Show / abgesagt</th>
                  <th className="px-3 py-2 text-right">offen</th>
                  <th className="px-3 py-2 text-right">Show Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0
                  ? <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400">Keine Termine in diesem Monat</td></tr>
                  : rows.map(p => (
                      <tr key={`${p.name}-${p.art}`} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-700 font-medium">
                          {p.name}
                          {!p.employee_id && <span className="ml-1.5 text-[10px] text-amber-600" title="Close-User ist keinem Mitarbeiter zugeordnet">nicht zugeordnet</span>}
                        </td>
                        <td className="px-3 py-1.5 text-right text-gray-600">{p.gelegt}</td>
                        <td className="px-3 py-1.5 text-right text-green-700 font-medium">{p.stattgefunden}</td>
                        <td className="px-3 py-1.5 text-right text-red-600">{p.nicht_stattgefunden}</td>
                        <td className="px-3 py-1.5 text-right text-amber-600">{p.offen}</td>
                        <td className={`px-3 py-1.5 text-right font-bold ${rateColor(p.rate)}`}>
                          {p.basis >= 5 ? pctTxt(p.rate) : <span className="text-gray-400 font-normal text-[11px]" title={`nur ${p.basis} bewertbare Termine`}>zu wenig Daten</span>}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* ── Nach Quelle ── */}
      {tab === 'quellen' && (
        <div className={card}>
          <div className={head}><span className="text-xs font-bold text-white uppercase tracking-wide">Nach Quelle · {monat}</span></div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <th className="px-3 py-2 text-left">Quelle</th><th className="px-3 py-2 text-left">Art</th>
                <th className="px-3 py-2 text-right">gelegt</th><th className="px-3 py-2 text-right">stattgefunden</th>
                <th className="px-3 py-2 text-right">No-Show / abgesagt</th><th className="px-3 py-2 text-right">Show Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quellen.length === 0
                ? <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400">Keine Daten</td></tr>
                : quellen.map(q => (
                    <tr key={`${q.quelle}-${q.art}`} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 text-gray-700 font-medium">{q.quelle}</td>
                      <td className="px-3 py-1.5 text-gray-500">{q.art === 'setting' ? 'Setting' : 'Closing'}</td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{q.gelegt}</td>
                      <td className="px-3 py-1.5 text-right text-green-700 font-medium">{q.stattgefunden}</td>
                      <td className="px-3 py-1.5 text-right text-red-600">{q.nicht_stattgefunden}</td>
                      <td className={`px-3 py-1.5 text-right font-bold ${rateColor(q.rate)}`}>
                        {q.basis >= 5 ? pctTxt(q.rate) : <span className="text-gray-400 font-normal text-[11px]">zu wenig Daten</span>}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Datenqualität ── */}
      {tab === 'qualitaet' && qual && (
        <div className="space-y-3">
          {/* Rueck-Terminierungen nach No-Show/Abgesagt.
              Kein Pranger: einen geplatzten Termin neu zu legen ist richtig. Sichtbar sein soll
              die HAEUFUNG — bevor jemand im November eine Reise an einer Show-Rate festmacht. */}
          {(qual.rueckTerminierungen || []).length > 0 && (
            <div className={card}>
              <div className={head}>
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Rück-Terminierungen nach No-Show / Abgesagt
                </span>
              </div>
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                Ein geplatzter Termin, der neu gelegt wird, ist normal — der negative Termin bleibt
                bestehen, der neue zählt separat. Auffällig ist ein hoher <b>Anteil</b>, nicht die
                absolute Zahl.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <th className="px-3 py-2 text-left">Person</th>
                    <th className="px-3 py-2 text-left">Art</th>
                    <th className="px-3 py-2 text-right">Rück-Term.</th>
                    <th className="px-3 py-2 text-right">von negativen</th>
                    <th className="px-3 py-2 text-right">Anteil</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {qual.rueckTerminierungen.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700">{r.name}</td>
                        <td className="px-3 py-2 text-gray-500">{r.art === 'setting' ? 'Setting' : 'Closing'}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{r.rueck}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{r.negativ}</td>
                        <td className={`px-3 py-2 text-right font-medium ${r.anteil >= 30 ? 'text-amber-700' : 'text-gray-600'}`}>
                          {r.anteil != null ? `${String(r.anteil).replace('.', ',')} %` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Sync-Historie: beantwortet "laeuft der naechtliche Lauf?" und "wer hat manuell
              ausgeloest?" ohne Railway-Logs. Cron- und Hand-Laeufe stehen in derselben Liste. */}
          <div className={card}>
            <div className={head}>
              <span className="text-xs font-bold text-white uppercase tracking-wide">Sync-Historie</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">Auslöser</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Dauer</th>
                  <th className="px-3 py-2 text-right">Events</th>
                  <th className="px-3 py-2 text-right">Termine</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {(syncStatus?.laeufe || []).length === 0
                    ? <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400">Noch keine protokollierten Läufe.</td></tr>
                    : syncStatus.laeufe.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{zeitpunkt(l.gestartet_am)}</td>
                          <td className="px-3 py-1.5 text-gray-600">
                            {l.ausgeloest_von === 'cron' ? 'nächtlich (01:15)' : (l.user_name || 'manuell')}
                            {l.since && <span className="text-gray-400"> · Backfill ab {l.since}</span>}
                          </td>
                          <td className="px-3 py-1.5">
                            <span className={
                              l.status === 'ok' ? 'text-green-700 font-medium'
                              : l.status === 'laeuft' ? 'text-blue-700 font-medium'
                              : 'text-red-600 font-medium'}>
                              {l.status === 'ok' ? 'ok' : l.status === 'laeuft' ? 'läuft' : l.status === 'abgebrochen' ? 'abgebrochen' : 'Fehler'}
                            </span>
                            {l.fehler && <span className="text-red-500 ml-1" title={l.fehler}>· {String(l.fehler).slice(0, 60)}</span>}
                          </td>
                          <td className="px-3 py-1.5 text-right text-gray-600">{l.dauer_sek != null ? `${Number(l.dauer_sek).toFixed(0)} s` : '—'}</td>
                          <td className="px-3 py-1.5 text-right text-gray-600">{l.events ?? '—'}</td>
                          <td className="px-3 py-1.5 text-right text-gray-600">{l.termine ?? '—'}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-500">
              Der nächtliche Lauf startet um 01:15 (Europe/Berlin). Fehlt er hier für eine Nacht, lief er nicht.
            </div>
          </div>

          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-3 py-2">
            <b>{qual.offenGesamt}</b> Termine ohne nachgetragenen Ausgang. Sie fließen <b>nicht</b> in die Quote ein —
            je mehr davon, desto dünner die Datenbasis.
          </div>

          <div className={card}>
            <div className={head}><span className="text-xs font-bold text-white uppercase tracking-wide">Offene Termine je Person</span></div>
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <th className="px-3 py-2 text-left">Mitarbeiter</th><th className="px-3 py-2 text-left">Art</th><th className="px-3 py-2 text-right">offen</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {(qual.offenJePerson || []).length === 0
                  ? <tr><td colSpan={3} className="px-3 py-4 text-center text-gray-400">Alles nachgetragen 🎉</td></tr>
                  : qual.offenJePerson.map((o, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-700">{o.name}</td>
                        <td className="px-3 py-1.5 text-gray-500">{o.art === 'setting' ? 'Setting' : 'Closing'}</td>
                        <td className="px-3 py-1.5 text-right text-amber-700 font-semibold">{o.n}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className={card}>
            <div className={head}><span className="text-xs font-bold text-white uppercase tracking-wide">Opportunity-Abdeckung je Monat</span></div>
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <th className="px-3 py-2 text-left">Monat</th><th className="px-3 py-2 text-left">Art</th>
                <th className="px-3 py-2 text-right">auf Lead-Ebene</th><th className="px-3 py-2 text-right">mit Opportunity</th><th className="px-3 py-2 text-right">Abdeckung</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {(qual.abdeckung || []).sort((a, b) => b.monat.localeCompare(a.monat) || a.art.localeCompare(b.art)).map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 text-gray-700 font-medium">{a.monat}</td>
                    <td className="px-3 py-1.5 text-gray-500">{a.art === 'setting' ? 'Setting' : 'Closing'}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{a.lead}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{a.opp}</td>
                    <td className={`px-3 py-1.5 text-right font-bold ${a.quote >= 50 ? 'text-green-600' : a.quote >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                      {a.quote != null ? `${a.quote} %` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(qual.closeUserOhneMapping || []).length > 0 && (
            <div className={card}>
              <div className={head}><span className="text-xs font-bold text-white uppercase tracking-wide">Close-User ohne Mitarbeiter-Zuordnung</span></div>
              <div className="p-3 flex flex-wrap gap-1.5">
                {qual.closeUserOhneMapping.map(u => (
                  <span key={u.close_user_id} className="text-[11px] rounded-full border border-gray-200 bg-white px-2 py-0.5 text-gray-600">
                    {u.close_name || '⟨ohne Namen⟩'}<span className="text-gray-400"> · {u.close_email || '—'}</span>
                  </span>
                ))}
              </div>
              <p className="px-3 pb-3 text-[11px] text-gray-400">
                Termine dieser Konten erscheinen unter „nicht zugeordnet". Zuordnung über die Mapping-API bzw. Bereinigung in Close.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
