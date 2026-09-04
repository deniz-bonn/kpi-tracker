import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bestenlisteApi } from '../utils/api';
import { formatEuro, currentMonat } from '../utils/format';

// ── Monats-Helfer fuer den Monatswaehler ─────────────────────────────────────
// Der Server erwartet einen Stichtag (?ref=YYYY-MM-DD) und leitet daraus Monat, Trend-Vergleich
// (Stichtag minus 7 Tage) und Vormonatssieger ab. Fuer einen abgeschlossenen Monat schicken wir
// deshalb dessen LETZTEN Tag — dann ist der Trend "letzte Woche des Monats" und der
// Vormonatssieger der davorliegende Monat. Fuer den laufenden Monat schicken wir NICHTS,
// damit der Server "jetzt" nimmt (Trend gegen die echte Vorwoche).
const shiftMonat = (ym, delta) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const letzterTag = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`;
};
const monatLang = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('de-DE', { month: 'long', year: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
// Bestenliste (Beta) — Motivations-Leaderboard. Kein Controlling: nur Top 10,
// keine Negativlisten, kein Rang jenseits Platz 10 (ausser der eigenen Position).
// Datenbasis ausschliesslich NK-Deals (siehe Backend). Live via 60s-Refetch.
// ─────────────────────────────────────────────────────────────────────────────

const ROLLEN = [
  { key: 'opener', label: 'Opener', emoji: '📞' },
  { key: 'setter', label: 'Setter', emoji: '🤝' },
  { key: 'closer', label: 'Closer', emoji: '🎯' },
];
const WERTUNGEN = [
  { key: 'volumen', label: 'AE-Volumen' },
  { key: 'anzahl',  label: 'Anzahl Deals' },
];
const ZEITRAEUME = [
  { key: 'monat',   label: 'Monat' },
  { key: 'quartal', label: 'Quartal' },
  { key: 'jahr',    label: 'Jahr' },
];

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

function Segmented({ options, value, onChange, size = 'md' }) {
  const pad = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs';
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
      {options.map(o => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`${pad} rounded-md font-semibold transition-colors ${
              active ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {o.emoji ? <span className="mr-1">{o.emoji}</span> : null}{o.label}
          </button>
        );
      })}
    </div>
  );
}

function Trend({ trend, neu }) {
  if (neu) return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">NEU</span>;
  if (trend == null) return null;
  if (trend > 0) return <span className="text-xs font-bold text-emerald-600" title="Plätze gutgemacht seit letzter Woche">▲ {trend}</span>;
  if (trend < 0) return <span className="text-xs font-bold text-rose-500" title="Plätze verloren seit letzter Woche">▼ {Math.abs(trend)}</span>;
  return <span className="text-xs text-gray-400" title="unverändert">–</span>;
}

function StandortBadge({ standort }) {
  if (!standort) return null;
  return <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">{standort}</span>;
}

const fmtWert = (w, wertung) => wertung === 'volumen' ? formatEuro(w) : String(w ?? 0);
const fmtAbstand = (a, wertung) => wertung === 'volumen'
  ? formatEuro(a)
  : `${Math.max(1, Math.ceil(a || 0))} Deal${Math.ceil(a || 0) === 1 ? '' : 's'}`;

function PodiumCard({ entry, wertung }) {
  const rank = entry.platz;
  const styles = {
    1: 'from-amber-200 to-yellow-400 ring-2 ring-amber-400 sm:-translate-y-3 sm:pb-8',
    2: 'from-slate-100 to-slate-300 ring-1 ring-slate-300',
    3: 'from-orange-200 to-amber-500/80 ring-1 ring-orange-300',
  }[rank] || 'from-gray-100 to-gray-200';
  return (
    <div className={`relative rounded-2xl bg-gradient-to-b ${styles} p-4 pt-5 text-center shadow-sm flex flex-col items-center gap-1`}>
      {rank === 1 && <div className="absolute -top-3 text-2xl">👑</div>}
      <div className="text-4xl leading-none">{MEDALS[rank]}</div>
      <div className={`font-extrabold text-gray-900 leading-tight ${rank === 1 ? 'text-lg' : 'text-base'}`}>{entry.name}</div>
      <StandortBadge standort={entry.standort} />
      <div className={`font-black text-gray-900 mt-1 ${rank === 1 ? 'text-2xl' : 'text-xl'}`}>
        {fmtWert(entry.wert, wertung)}
      </div>
      {wertung === 'anzahl' && <div className="text-[11px] font-medium text-gray-600 -mt-0.5">gewonnene Deals</div>}
      <div className="mt-0.5"><Trend trend={entry.trend} neu={entry.neu} /></div>
    </div>
  );
}

export default function Bestenliste() {
  const [rolle, setRolle]       = useState('closer');
  const [wertung, setWertung]   = useState('volumen');
  const [zeitraum, setZeitraum] = useState('monat');
  const [monat, setMonat]       = useState(currentMonat());

  // Der Monatswaehler greift nur im Monats-Modus; Quartal/Jahr bleiben auf der laufenden Periode.
  const istMonatsModus   = zeitraum === 'monat';
  const istAktuellerMonat = monat === currentMonat();
  const ref = (istMonatsModus && !istAktuellerMonat) ? letzterTag(monat) : undefined;

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['bestenliste', rolle, wertung, zeitraum, ref || 'live'],
    queryFn: () => bestenlisteApi.list({ rolle, wertung, zeitraum, ...(ref && { ref }) }),
    // Ein abgeschlossener Monat aendert sich nicht mehr -> kein Live-Refetch.
    refetchInterval: ref ? false : 60_000,
    placeholderData: keepPreviousData, // kein Flackern beim Umschalten
  });

  const rolleInfo = ROLLEN.find(r => r.key === rolle);
  const podium = data?.podium || [];
  const top10 = data?.top10 || [];
  const pos = data?.meine_position;
  const leer = !isLoading && podium.length === 0;

  return (
    <div className="space-y-6">
      {/* ── Kopf ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">🏆 Bestenliste</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className={`h-2 w-2 rounded-full ${ref ? 'bg-gray-300' : (isFetching ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400')}`} />
          {ref ? 'Archiv' : 'Live'} · {data?.meta?.zeitraum_label || '—'}
        </div>
      </div>

      {/* Vormonatssieger */}
      {data?.monatssieger_vormonat && (
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-200 px-3 py-1.5 text-sm">
          <span>🏆</span>
          <span className="font-semibold text-amber-800">Monatssieger {data.monatssieger_vormonat.monat_label}:</span>
          <span className="font-bold text-gray-900">{data.monatssieger_vormonat.name}</span>
        </div>
      )}

      {/* ── Steuerung ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Disziplin</div>
            <Segmented options={ROLLEN} value={rolle} onChange={setRolle} size="lg" />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Wertung</div>
            <Segmented options={WERTUNGEN} value={wertung} onChange={setWertung} />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Zeitraum</div>
            <Segmented options={ZEITRAEUME} value={zeitraum} onChange={setZeitraum} />
          </div>
          {istMonatsModus && (
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Monat</div>
              <div className="inline-flex items-center rounded-lg bg-gray-100 p-1 gap-1">
                <button onClick={() => setMonat(m => shiftMonat(m, -1))}
                  title="Vorheriger Monat"
                  className="px-2 py-1.5 rounded-md text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-white">‹</button>
                <span className="px-2 text-xs font-semibold text-gray-700 min-w-[7.5rem] text-center">{monatLang(monat)}</span>
                <button onClick={() => setMonat(m => shiftMonat(m, 1))}
                  disabled={istAktuellerMonat}
                  title={istAktuellerMonat ? 'Kein zukünftiger Monat' : 'Nächster Monat'}
                  className="px-2 py-1.5 rounded-md text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent">›</button>
                {!istAktuellerMonat && (
                  <button onClick={() => setMonat(currentMonat())}
                    className="px-2 py-1.5 rounded-md text-xs font-semibold text-indigo-600 hover:bg-white">heute</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Konnte die Bestenliste nicht laden.
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-400 py-12">Lade Bestenliste…</div>
      )}

      {leer && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
          <div className="text-3xl mb-2">{rolleInfo?.emoji}</div>
          {istMonatsModus ? (
            <>
              Noch keine Abschlüsse als <b>{rolleInfo?.label}</b> im {monatLang(monat)}
              {' – '}
              <button onClick={() => setMonat(m => shiftMonat(m, -1))}
                className="font-semibold text-indigo-600 hover:text-indigo-800 underline decoration-dotted">
                {monatLang(shiftMonat(monat, -1))} anzeigen
              </button>
            </>
          ) : (
            <>Noch keine gewonnenen Deals als <b>{rolleInfo?.label}</b> in diesem Zeitraum.</>
          )}
        </div>
      )}

      {/* ── Podium ────────────────────────────────────────────────────────── */}
      {!isLoading && podium.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {podium[1] && <div className="order-2 sm:order-1"><PodiumCard entry={podium[1]} wertung={wertung} /></div>}
          {podium[0] && <div className="order-1 sm:order-2"><PodiumCard entry={podium[0]} wertung={wertung} /></div>}
          {podium[2] && <div className="order-3 sm:order-3"><PodiumCard entry={podium[2]} wertung={wertung} /></div>}
        </div>
      )}

      {/* ── Plätze 4–10 ───────────────────────────────────────────────────── */}
      {top10.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          {top10.map(e => (
            <div key={e.employee_id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 border-gray-100 hover:bg-gray-50">
              <div className="w-7 text-center font-bold text-gray-400">{e.platz}</div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="font-semibold text-gray-800 truncate">{e.name}</span>
                <StandortBadge standort={e.standort} />
              </div>
              <div className="w-14 text-right"><Trend trend={e.trend} neu={e.neu} /></div>
              <div className="w-32 text-right font-bold text-gray-900 tabular-nums">{fmtWert(e.wert, wertung)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Deine Position ────────────────────────────────────────────────── */}
      {pos && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Deine Position</div>

          {!pos.platziert ? (
            <div className="text-sm text-gray-600">
              Du bist als <b>{rolleInfo?.label}</b> in diesem Zeitraum noch nicht platziert.
              {pos.ziel_platz != null
                ? <> Dein erster gewonnener Deal bringt dich auf die Liste — <b>{fmtAbstand(pos.abstand, wertung)}</b> fehlen bis Platz {pos.ziel_platz}.</>
                : <> Dein erster gewonnener Deal bringt dich auf die Liste!</>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-700">Platz {pos.platz}</span>
                  {pos.platz <= 3 && <span className="text-2xl">{MEDALS[pos.platz]}</span>}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900">{fmtWert(pos.wert, wertung)}</div>
                  {wertung === 'anzahl' && <div className="text-[11px] text-gray-500 -mt-0.5">gewonnene Deals</div>}
                </div>
              </div>

              {pos.fuehrt ? (
                <div className="text-sm font-semibold text-emerald-600">🔥 Du führst die Rangliste an — verteidige deinen Platz!</div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Noch <b className="text-indigo-700">{fmtAbstand(pos.abstand, wertung)}</b> bis Platz {pos.ziel_platz}</span>
                    <span>{Math.round((pos.progress || 0) * 100)}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-indigo-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((pos.progress || 0) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center pt-2">
        Datenbasis: gewonnene Neukunden-Deals (nach Gewinnmonat). Trend im Vergleich zur Vorwoche.
      </p>
    </div>
  );
}
