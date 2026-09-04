// Treppchen-Optik für die Abschlussquoten-Tabellen (nur Darstellung).
// Rang-Basis = bestehende Sortierung nach realisierter AE (ae_summe). Bei Gleichstand
// gleiche Medaille. Zeilen ohne Wert (ae_summe <= 0) bekommen nie eine Medaille.
import { formatEuro } from '../utils/format';

const MEDALS = {
  gold:   { emoji: '🥇', row: 'bg-amber-50 hover:bg-amber-100',   bar: 'border-amber-400',  podium: 'from-amber-200 to-amber-50 border-amber-300',  h: 'h-16' },
  silver: { emoji: '🥈', row: 'bg-slate-50 hover:bg-slate-100',   bar: 'border-slate-400',  podium: 'from-slate-200 to-slate-50 border-slate-300',  h: 'h-12' },
  bronze: { emoji: '🥉', row: 'bg-orange-50 hover:bg-orange-100', bar: 'border-orange-400', podium: 'from-orange-200 to-orange-50 border-orange-300', h: 'h-10' },
};
const TIERS = ['gold', 'silver', 'bronze'];

// Liefert je Zeile 'gold' | 'silver' | 'bronze' | null (auf ae_summe, Ties teilen sich die Medaille).
export function computeMedals(rows) {
  const distinct = [...new Set(rows.filter(r => (Number(r.ae_summe) || 0) > 0).map(r => Number(r.ae_summe)))]
    .sort((a, b) => b - a).slice(0, 3);
  return rows.map(r => {
    const v = Number(r.ae_summe) || 0;
    if (v <= 0) return null;
    const idx = distinct.indexOf(v);
    return idx >= 0 ? TIERS[idx] : null;
  });
}

// Zeilen-Hintergrund-Tint (Default behält den bisherigen Hover).
export const medalRowClass = (medal) => medal ? MEDALS[medal].row : 'hover:bg-gray-50';

// Schmale farbige Rangleiste links an der ersten Zelle. Nicht-Medaillen behalten die
// gleiche transparente Leiste, damit das Namens-Alignment identisch bleibt.
export const medalBarClass = (medal) =>
  `border-l-[3px] ${medal ? MEDALS[medal].bar : 'border-transparent'}`;

// Badge vor dem Namen (nur Top 3).
export function MedalBadge({ medal }) {
  if (!medal) return null;
  return <span className="mr-1.5" aria-hidden="true">{MEDALS[medal].emoji}</span>;
}

// Variante B: kompaktes Mini-Podium über der Tabelle (Silber links, Gold Mitte, Bronze rechts).
// hinweisText/hinweisTitel: optionale Fussnote unter dem Treppchen. Gebraucht, wo das Podium einer
// anderen Monatslogik folgt als die Tabelle darunter (Abschlussmonat vs. Angebotsmonat) — sonst ist
// die Abweichung fuer den Betrachter nicht erklaerbar.
export function MiniPodium({ rows, format = formatEuro, hinweisText = null, hinweisTitel = null }) {
  const top = rows.filter(r => (Number(r.ae_summe) || 0) > 0).slice(0, 3);
  if (top.length === 0) return null;
  const order = [top[1], top[0], top[2]].map((r, i) => ({ r, tier: TIERS[[1, 0, 2][i]] })).filter(x => x.r);
  return (
    <div className="bg-white">
      <div className="flex items-end justify-center gap-2 px-3 pt-3 pb-1">
        {order.map(({ r, tier }) => (
          <div key={tier} className="flex-1 min-w-0 max-w-[140px] flex flex-col items-center">
            <div className="text-lg leading-none mb-1">{MEDALS[tier].emoji}</div>
            <div className="w-full truncate text-center text-[11px] font-semibold text-gray-700" title={r.name}>{r.name}</div>
            <div className="text-[11px] font-bold text-gray-900 mb-1">{format(r.ae_summe)}</div>
            <div className={`w-full ${MEDALS[tier].h} rounded-t-md bg-gradient-to-b ${MEDALS[tier].podium} border border-b-0`} />
          </div>
        ))}
      </div>
      {hinweisText && (
        <div className="px-3 pb-1.5 text-center text-[10px] text-gray-400 cursor-help" title={hinweisTitel || hinweisText}>
          ⓘ {hinweisText}
        </div>
      )}
    </div>
  );
}
