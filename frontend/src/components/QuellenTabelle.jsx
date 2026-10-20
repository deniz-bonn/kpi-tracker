import { formatEuro } from '../utils/format';
import { KEIN_ANGEBOT_HINWEIS } from '../utils/nkConstants';

// ── Quoten nach Leadquelle ───────────────────────────────────────────────────
// Reine Darstellung von quellenStats() (nkConstants.js) — genutzt auf der NK-Seite und in der
// KPI Auswertung. Quellen ohne Calls im Zeitraum stehen grau mit Strichen da, damit eine neue
// Quelle (KI) sichtbar ist, bevor sie Daten hat.

const pct = (v) => `${v.toFixed(1).replace('.', ',')} %`;

const SPALTEN = [
  ['Calls', 'Alle Closing Calls dieser Quelle, auch ohne Angebot'],
  ['Angebote', 'Calls mit erstelltem Angebot'],
  ['Gewonnen', null],
  ['Angebotsquote', 'Angebote ÷ Calls'],
  ['Abschlussquote', 'Gewonnen ÷ Angebote'],
  ['Quote alle Calls', 'Gewonnen ÷ alle Calls'],
  ['AE realisiert', null],
];

function Zeile({ z, gesamt }) {
  const leer = z.calls === 0;
  const zelle = 'px-3 py-1.5 text-right whitespace-nowrap';
  const td = (inhalt, klasse = 'text-gray-700') => <td className={`${zelle} ${leer ? 'text-gray-300' : klasse}`}>{leer ? '—' : inhalt}</td>;
  return (
    <tr className={gesamt ? 'bg-gray-50 font-semibold border-t-2 border-gray-200' : 'hover:bg-gray-50'}>
      <td className={`px-3 py-1.5 sticky left-0 whitespace-nowrap ${gesamt ? 'bg-gray-50 text-gray-900' : 'bg-white'} ${leer ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>{z.quelle}</td>
      {td(z.calls)}
      {td(z.angebote)}
      {td(z.gewonnen, 'text-green-700 font-medium')}
      {td(pct(z.angebotsquote))}
      {td(pct(z.rateKlassisch), 'text-gray-900 font-bold')}
      {td(pct(z.rateBereinigt))}
      {td(z.ae > 0 ? formatEuro(z.ae) : '—', 'text-blue-700 font-medium')}
    </tr>
  );
}

/** @param stats Ergebnis von quellenStats() · @param vorTracking Zeitraum (teilweise) vor dem Kein-Angebot-Tracking */
export default function QuellenTabelle({ stats, vorTracking }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <th className="px-3 py-2 text-left sticky left-0 bg-gray-50">Quelle</th>
              {SPALTEN.map(([label, titel]) => (
                <th key={label} className="px-3 py-2 text-right whitespace-nowrap" title={titel || undefined}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.zeilen.map(z => <Zeile key={z.quelle} z={z} />)}
            <Zeile z={stats.gesamt} gesamt />
          </tbody>
        </table>
      </div>
      {vorTracking && (
        <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-100 text-[11px] text-amber-800">⚠ {KEIN_ANGEBOT_HINWEIS}</div>
      )}
    </div>
  );
}
