import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { provisionenApi } from '../utils/api';
import { formatEuro } from '../utils/format';
import Kontoauszug, { TYP_LABEL, TYP_COLOR } from '../components/Kontoauszug';

// ─────────────────────────────────────────────────────────────────────────────
// Meine Provision (Mitarbeiter) — eigener Kontoauszug je Abrechnungszeitraum.
// Read-only. Serverseitig auf den eingeloggten Mitarbeiter begrenzt (siehe API /me).
// ─────────────────────────────────────────────────────────────────────────────

const fmtDate = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : '—');
const fmtPct = (n) => String(n ?? 0).replace('.', ',') + ' %';
const betragCls = (n) => (Number(n) < 0 ? 'text-rose-600' : 'text-gray-900');

// Dezenter Fortschrittsbalken zur nächsten Staffelstufe (Motivations-Element).
function StaffelBar({ label, satz, monthAe, restBisNext, nextSatz, erreichtAm }) {
  const maxReached = !(restBisNext > 0) || nextSatz == null;
  const ziel = maxReached ? monthAe : monthAe + restBisNext;
  const prog = ziel > 0 ? Math.min(100, Math.round((monthAe / ziel) * 100)) : (maxReached ? 100 : 0);
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
      <div className="flex items-baseline justify-between mb-1.5 gap-2">
        <span className="text-xs font-semibold text-indigo-600 truncate">{label}</span>
        <span className="text-sm font-bold text-indigo-700 whitespace-nowrap">Aktueller Satz: {fmtPct(satz)}</span>
      </div>
      <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: prog + '%' }} />
      </div>
      <div className="mt-1 text-xs text-indigo-500">
        {maxReached ? 'Höchstsatz erreicht 🎉' : `noch ${formatEuro(restBisNext)} bis ${fmtPct(nextSatz)}`}
        {' · '}Monats-AE {formatEuro(monthAe)}
        {erreichtAm ? ` · Schwelle am ${fmtDate(erreichtAm)} erreicht` : ''}
      </div>
    </div>
  );
}

export default function MeineProvision() {
  const [zid, setZid] = useState('');
  const { data: zeitraeume = [] } = useQuery({ queryKey: ['prov-zeitraeume', 'all'], queryFn: () => provisionenApi.zeitraeume() });
  const { data, isLoading, isError } = useQuery({
    queryKey: ['prov-me', zid],
    queryFn: () => provisionenApi.me(zid || undefined),
    placeholderData: keepPreviousData,
  });

  const zSel = zid || data?.zeitraum?.id || '';
  const buchungen = data?.buchungen || [];
  const perTyp = data?.perTyp || {};
  const meKreis = data?.kreis;                                   // eigener Abrechnungskreis
  const zeitraeumeF = zeitraeume.filter((z) => !meKreis || z.kreis === meKreis);
  const zyklusText = meKreis === 'bonn'
    ? 'Abrechnungszeitraum jeweils 21. des Vormonats bis 20. des Monats.'
    : 'Abrechnungszeitraum: voller Kalendermonat (1. bis Monatsende).';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">💰 Meine Provision</h1>
          {data?.employee?.name && <p className="text-sm text-gray-500">{data.employee.name}{data.employee.standort ? ` · ${data.employee.standort}` : ''}</p>}
        </div>
        <select
          value={zSel}
          onChange={(e) => setZid(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 bg-white"
        >
          {zeitraeumeF.map((z) => (
            <option key={z.id} value={z.id}>{z.label}{z.status === 'abgeschlossen' ? ' (abgeschlossen)' : ''}</option>
          ))}
        </select>
      </div>

      {data?.hinweis && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">{data.hinweis}</div>
      )}
      {isError && <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">Daten konnten nicht geladen werden.</div>}

      {!data?.hinweis && (
        <>
          {/* Summe */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-indigo-200">Provision im Zeitraum{data?.zeitraum ? ` ${data.zeitraum.label}` : ''}</div>
            <div className="text-3xl font-bold mt-1">{formatEuro(data?.summe || 0)}</div>
            {data?.zeitraum?.status === 'abgeschlossen' && <div className="text-xs text-indigo-200 mt-1">Zeitraum abgeschlossen</div>}
          </div>

          {/* Live-Staffel (aktueller Kalendermonat) */}
          {(data?.staffel || data?.teamStaffel) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.staffel && (
                <StaffelBar label="200k-Staffel (Closer)" satz={data.staffel.satz} monthAe={data.staffel.monthAe}
                  restBisNext={data.staffel.restBisNext} nextSatz={data.staffel.restBisNext > 0 ? data.staffel.hoch : null}
                  erreichtAm={data.staffel.erreichtAm} />
              )}
              {data.teamStaffel && (
                <StaffelBar label="Team-Staffel (Bonn)" satz={data.teamStaffel.satz} monthAe={data.teamStaffel.monthAe}
                  restBisNext={data.teamStaffel.restBisNext} nextSatz={data.teamStaffel.nextSatz} />
              )}
            </div>
          )}

          {/* AT-Staffeln (Opener/Setter Österreich) */}
          {data?.atStaffel && (data.atStaffel.opener || data.atStaffel.setter) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.atStaffel.opener && (
                <StaffelBar label="Opener-Staffel (Österreich)" satz={data.atStaffel.opener.satz} monthAe={data.atStaffel.opener.monthAe}
                  restBisNext={data.atStaffel.opener.restBisNext} nextSatz={data.atStaffel.opener.nextSatz} />
              )}
              {data.atStaffel.setter && (
                <StaffelBar label="Setter-Staffel (Österreich)" satz={data.atStaffel.setter.satz} monthAe={data.atStaffel.setter.monthAe}
                  restBisNext={data.atStaffel.setter.restBisNext} nextSatz={data.atStaffel.setter.nextSatz} />
              )}
            </div>
          )}

          {/* Aufschlüsselung nach Typ */}
          {Object.keys(perTyp).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(perTyp).map(([typ, betrag]) => (
                <span key={typ} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${TYP_COLOR[typ] || 'text-gray-700 bg-gray-100'}`}>
                  {TYP_LABEL[typ] || typ}
                  <span className={betragCls(betrag)}>{formatEuro(betrag)}</span>
                </span>
              ))}
            </div>
          )}

          {/* Kontoauszug */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">Kontoauszug</div>
            {isLoading && !data ? (
              <div className="p-8 text-center text-sm text-gray-400">Lädt…</div>
            ) : (
              <Kontoauszug buchungen={buchungen} />
            )}
          </div>
          <p className="text-xs text-gray-400">{zyklusText} Provision entsteht mit dem Statuswechsel auf „Gewonnen"{meKreis === 'braunschweig' ? ' (Opener-Fixbetrag 125 € je erfasstem Sales Call, auch bei Verloren)' : ''}.</p>
        </>
      )}
    </div>
  );
}
