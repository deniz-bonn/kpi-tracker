import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dealsApi, monthlyTargetsStandortApi } from '../utils/api';
import { formatEuro, isDealCompanyActive } from '../utils/format';
import { monatsvergleich, delta, pacingSoll, arbeitstageBis, VERGLEICH_KPIS, KEIN_ANGEBOT_AB_TAG } from '../utils/nkConstants';
import KPI_CONST from '../../../shared/kpiConstants.json';

// ── Monatsvergleich „Stand Tag X" ─────────────────────────────────────────────
// Reiner Lese-Block. Rechnung komplett in nkConstants.js (monatsvergleich), hier nur Darstellung.
// Daten: dieselbe Deal-Liste wie die Seite im Modus „Alle Monate" (ein Call, ~2 MB), nur geladen,
// solange der Block offen ist. Filterkette = Seitenfilter ohne Status + isDealCompanyActive + aeEur,
// damit erbt der Block Standort/Personen/Quelle, aktiv_ab, ae_ab_monat und CHF→EUR per Konstruktion.

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const fmtMonat     = (ym) => { const [y, m] = ym.split('-'); return `${MONATE[Number(m) - 1]} ${y}`; };
const fmtMonatKurz = (ym) => MONATE[Number(ym.split('-')[1]) - 1];
const de1 = (v) => v.toFixed(1).replace('.', ',');

const fmtWert = (kpi, v) => {
  if (v == null) return '—';
  if (kpi.art === 'eur') return formatEuro(v);
  if (kpi.art === 'pct') return `${de1(v)} %`;
  return Number.isInteger(v) ? String(v) : de1(v);
};
// Delta zum aktuellen Monat: absolut + relativ; Quoten in Prozentpunkten.
const fmtDelta = (kpi, dlt) => {
  if (!dlt) return '';
  const vz  = dlt.abs > 0 ? '+' : '';
  const abs = kpi.art === 'eur' ? formatEuro(dlt.abs)
            : kpi.art === 'pct' ? `${de1(dlt.abs)} pp`
            : Number.isInteger(dlt.abs) ? String(dlt.abs) : de1(dlt.abs);
  const rel = dlt.rel == null ? '' : ` (${dlt.rel > 0 ? '+' : ''}${dlt.rel.toFixed(0)} %)`;
  return `${vz}${abs}${rel}`;
};
// Dezent: besser gruen, schlechter rot, gleich grau — alle neun KPIs sind „mehr ist besser".
const deltaKlasse = (dlt) => !dlt || dlt.abs === 0 ? 'text-gray-400' : dlt.abs > 0 ? 'text-green-600' : 'text-red-500';

const FokusBadge = () => (
  <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase whitespace-nowrap">Fokus</span>
);

// Eine Vergleichszelle: Wert + Delta; bei Call-Nenner vor Tracking nur Wert, markiert, ohne Delta.
function Zelle({ kpi, wert, aktuell, markiert, unter }) {
  if (wert == null) return <td className="px-3 py-1.5 text-right text-gray-300">—</td>;
  if (markiert) return (
    <td className="px-3 py-1.5 text-right text-gray-400" title="Stichtag vor dem Kein-Angebot-Tracking — Wert überzeichnet, kein Vergleich">
      <span className="text-amber-500">⚠</span> {fmtWert(kpi, wert)}
      {unter && <div className="text-[10px] text-gray-400">{unter}</div>}
    </td>
  );
  const dlt = delta(aktuell, wert);
  return (
    <td className="px-3 py-1.5 text-right">
      <div className="text-gray-700 whitespace-nowrap">{fmtWert(kpi, wert)}</div>
      <div className={`text-[10px] whitespace-nowrap ${deltaKlasse(dlt)}`}>{fmtDelta(kpi, dlt)}</div>
      {unter && <div className="text-[10px] text-gray-400 whitespace-nowrap">{unter}</div>}
    </td>
  );
}

export default function NkMonatsvergleich({ company, basisMonat, tag, aeEur, filterPred, filterStandort, canSeeTargets }) {
  const [offen, setOffen]     = useState(false);
  const [einzeln, setEinzeln] = useState(false);

  const { data: alleDeals = [], isLoading } = useQuery({
    queryKey: ['deals-nk-vergleich', company],
    queryFn:  () => dealsApi.nk.list({ ...(company && { company_id: company }) }),
    enabled:  offen,
  });
  // Standortziel nur bei Standort-Filter — ohne stillen Rueckfall aufs Gruppenziel (Beta-Muster).
  const { data: stZiele = [] } = useQuery({
    queryKey: ['monthly-targets-standort', basisMonat],
    queryFn:  () => monthlyTargetsStandortApi.list({ monat: basisMonat }),
    enabled:  offen && canSeeTargets && !!filterStandort,
  });

  const deals = useMemo(() => alleDeals.filter(d => filterPred(d) && isDealCompanyActive(d)), [alleDeals, filterPred]);
  const v = useMemo(() => (offen ? monatsvergleich({ deals, basisMonat, tag, aeEur }) : null), [deals, basisMonat, tag, aeEur, offen]);

  const ziel = !canSeeTargets ? null
    : filterStandort ? (stZiele.find(z => z.standort === filterStandort)?.ziel_ae ?? null)
    : KPI_CONST.auftragseingang.ziel_monat_eur;
  const soll = pacingSoll(ziel, basisMonat, tag);

  const kopf = `Monatsvergleich · Stand ${tag}. ${fmtMonatKurz(basisMonat)}`;
  const th = 'px-3 py-2 text-right whitespace-nowrap';

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOffen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{kopf}</span>
        <span className="text-xs text-gray-400">{offen ? '▲ einklappen' : '▼ vergleichen'}</span>
      </button>

      {offen && (isLoading || !v ? (
        <div className="px-3 py-4 text-xs text-gray-400">Lade alle Monate …</div>
      ) : (() => {
        const vormonat = v.vormonate[0];
        const spalten  = einzeln ? v.vormonate : [];
        const irgendwoVorTracking = [v.aktuell, ...v.vormonate].some(s => s.vorTracking);
        const dlt = delta(v.aktuell.ae, soll);
        return (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <th className="px-3 py-2 text-left sticky left-0 bg-gray-50" style={{ minWidth: 170 }}>KPI</th>
                    <th className={th}>{fmtMonat(v.basisMonat)}<div className="font-normal text-[10px]">bis {tag}.</div></th>
                    <th className={th}>Vormonat {fmtMonatKurz(vormonat.monat)}<div className="font-normal text-[10px]">bis {vormonat.stichtag.slice(8)}. · Δ</div></th>
                    {v.durchschnitte.map(d => (
                      <th key={d.n} className={th}>Ø {d.n} Monate<div className="font-normal text-[10px]">{fmtMonatKurz(d.monate[d.monate.length - 1])}–{fmtMonatKurz(d.monate[0])} · Δ</div></th>
                    ))}
                    {spalten.map(s => (
                      <th key={s.monat} className={`${th} border-l border-gray-100`}>{fmtMonatKurz(s.monat)}{s.vorTracking && <span className="text-amber-500"> ⚠</span>}<div className="font-normal text-[10px]">bis {s.stichtag.slice(8)}.</div></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {VERGLEICH_KPIS.map(k => {
                    const akt = v.aktuell[k.key];
                    const aktMarkiert = k.callNenner && v.aktuell.vorTracking;
                    return (
                      <tr key={k.key}>
                        <td className="px-3 py-1.5 text-gray-700 font-medium sticky left-0 bg-white whitespace-nowrap">
                          {k.label}{v.fokus === k.key && <FokusBadge />}
                        </td>
                        <td className="px-3 py-1.5 text-right font-bold text-gray-900 whitespace-nowrap">
                          {aktMarkiert && <span className="text-amber-500 font-normal">⚠ </span>}{fmtWert(k, akt)}
                        </td>
                        <Zelle kpi={k} wert={vormonat[k.key]} aktuell={akt} markiert={k.callNenner && vormonat.vorTracking} />
                        {v.durchschnitte.map(d => {
                          const w = d.werte[k.key];
                          return <Zelle key={d.n} kpi={k} wert={w.wert} aktuell={akt}
                            unter={w.n < w.von ? `Ø aus ${w.n} von ${w.von}` : null} />;
                        })}
                        {spalten.map(s => (
                          <Zelle key={s.monat} kpi={k} wert={s[k.key]} aktuell={akt} markiert={k.callNenner && s.vorTracking} />
                        ))}
                      </tr>
                    );
                  })}
                  {canSeeTargets && (
                    <tr className="bg-amber-50/40">
                      <td className="px-3 py-1.5 text-gray-700 font-medium sticky left-0 bg-amber-50/40 whitespace-nowrap">Ziel-Pacing (AE)</td>
                      <td className="px-3 py-1.5 text-right">
                        {ziel == null ? <span className="text-gray-400">kein Ziel hinterlegt</span> : (
                          <>
                            <div className="font-bold text-gray-900">{formatEuro(v.aktuell.ae)} <span className="font-normal text-gray-500">von {formatEuro(soll)} Soll</span></div>
                            <div className={`text-[10px] whitespace-nowrap ${deltaKlasse(dlt)}`}>{fmtDelta({ art: 'eur' }, dlt)} · Ziel {formatEuro(ziel)}</div>
                          </>
                        )}
                      </td>
                      <td colSpan={1 + v.durchschnitte.length + spalten.length} className="px-3 py-1.5 text-[10px] text-gray-400">
                        Soll = Ziel × {tag}/{new Date(Date.UTC(...v.basisMonat.split('-').map(Number), 0)).getUTCDate()} Kalendertage
                        {filterStandort ? ` · Standortziel ${filterStandort}` : ' · Gruppenziel NK — Ist enthält Schweiz, Ziel nicht'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3 py-1.5 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
              <button onClick={() => setEinzeln(e => !e)} className="text-gray-600 hover:text-gray-800">
                {einzeln ? '▲ Monate ausblenden' : `▼ die letzten ${v.vormonate.length} Monate einzeln`}
              </button>
              <span>Arbeitstage bis Tag {tag}: {[v.aktuell, ...v.vormonate.slice(0, einzeln ? v.vormonate.length : 1)]
                .map(s => `${fmtMonatKurz(s.monat)} ${arbeitstageBis(s.monat, tag)}`).join(' · ')}</span>
            </div>
            <div className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100 space-y-0.5">
              <div>Gleicher Stichtag je Monat (Kalendertage, am 31. gegen den Monatsletzten). Spalte = Berichtsmonat, Datum entscheidet, ob der Deal am Stichtag schon da war; Gewonnen und AE nach Gewinndatum. Respektiert Standort-, Personen- und Quellen-Filter; ignoriert den Status-Filter. Ø = Mittel der Einzelmonats-Stände. Fokus = stärkste negative Abweichung von Ø 3.</div>
              <div>Der laufende Monat enthält Nacherfassungen noch nicht — historische Stände sind heute um bis zu 17 Calls / 6 Gewonnene vollständiger, als sie am selben Tag live waren.</div>
              {irgendwoVorTracking && (
                <div className="text-amber-700">⚠ Stichtag vor dem Kein-Angebot-Tracking (ab {KEIN_ANGEBOT_AB_TAG.split('-').reverse().join('.')}): Closing Calls, Angebotsquote und Quote alle Calls sind dort überzeichnet und werden nicht verglichen; ihre Durchschnitte laufen nur über getrackte Monate.</div>
              )}
            </div>
          </div>
        );
      })())}
    </div>
  );
}
