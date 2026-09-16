import { formatEuro } from '../utils/format';

// Gemeinsame Kontoauszug-Darstellung (Mitarbeiter-Dashboard + Admin-Detail).
// Beschreibungen werden vollständig umbrochen (nie abgeschnitten); Mobile als 2-zeilige Karten.

export const TYP_LABEL = {
  deal_gewonnen: 'Gewonnen', team_provision: 'Team (Bonn)', korrektur: 'Korrektur', storno: 'Storno',
  staffel_upgrade: 'Staffel-Upgrade', staffel_nachtrag: 'Staffel-Nachtrag',
  team_upgrade: 'Team-Upgrade', team_nachtrag: 'Team-Nachtrag',
  opener_fix: 'Opener-Fix (125 €)', opener_fix_storno: 'Opener-Fix Storno',
  at_opener_staffel: 'Opener-Staffel', at_opener_nachtrag: 'Opener-Staffel (Nachtrag)',
  at_setter_staffel: 'Setter-Staffel', at_setter_nachtrag: 'Setter-Staffel (Nachtrag)',
  // Bestandskundenvertrieb. OHNE Eintrag rendert der Badge unten den ROHEN Schluessel
  // ('bk_upsell') — still, ohne Fehler, in Admin-Detail, Meine Provision UND Mein Dashboard.
  bk_upsell: 'Upsell 3 %', bk_verlaengerung: 'Verlängerung 2 %',
};
export const TYP_COLOR = {
  deal_gewonnen: 'text-emerald-700 bg-emerald-50', team_provision: 'text-sky-700 bg-sky-50',
  korrektur: 'text-amber-700 bg-amber-50', storno: 'text-rose-700 bg-rose-50',
  staffel_upgrade: 'text-indigo-700 bg-indigo-50', staffel_nachtrag: 'text-indigo-700 bg-indigo-50',
  team_upgrade: 'text-violet-700 bg-violet-50', team_nachtrag: 'text-violet-700 bg-violet-50',
  opener_fix: 'text-teal-700 bg-teal-50', opener_fix_storno: 'text-rose-700 bg-rose-50',
  at_opener_staffel: 'text-indigo-700 bg-indigo-50', at_opener_nachtrag: 'text-indigo-700 bg-indigo-50',
  at_setter_staffel: 'text-cyan-700 bg-cyan-50', at_setter_nachtrag: 'text-cyan-700 bg-cyan-50',
  bk_upsell: 'text-emerald-700 bg-emerald-50', bk_verlaengerung: 'text-lime-700 bg-lime-50',
};
const ROLLE_LABEL = { opener: 'Opener', setter: 'Setter', closer: 'Closer', opener_setter: 'Opener+Setter', team: 'Team', kam: 'KAM' };
const fmtDate = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : '—');
// Buchungen des Bestandskundenvertriebs rechnen auf der Achse gewonnen_MONAT, tragen also
// bewusst kein gewonnen_datum. Statt einer Spalte voller Striche zeigen wir dort den
// Abrechnungsmonat aus `kalendermonat` — die Achse, auf der die Zeile tatsaechlich haengt.
const fmtWann = (b) => {
  if (b.gewonnen_datum) return fmtDate(b.gewonnen_datum);
  // Format MM.JJJJ statt "September 2026": die Spalte ist auf TT.MM.JJJJ bemessen, ein
  // ausgeschriebener Monatsname wird darin abgeschnitten ("September 20" liest sich wie ein Jahr).
  const km = String(b.kalendermonat || '');
  return /^\d{4}-\d{2}$/.test(km) ? `${km.slice(5, 7)}.${km.slice(0, 4)}` : '—';
};
const betragCls = (n) => (Number(n) < 0 ? 'text-rose-600' : 'text-gray-900');
const Badge = ({ typ }) => <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYP_COLOR[typ] || 'text-gray-700 bg-gray-100'}`}>{TYP_LABEL[typ] || typ}</span>;

export default function Kontoauszug({ buchungen = [] }) {
  if (!buchungen.length) return <div className="p-8 text-center text-sm text-gray-400">Keine Buchungen in diesem Zeitraum.</div>;
  return (
    <>
      {/* Desktop: Tabelle mit umbrechender Beschreibung */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="px-4 py-2 font-medium w-24">Datum</th>
              <th className="px-3 py-2 font-medium w-36">Typ</th>
              <th className="px-3 py-2 font-medium w-24">Rolle</th>
              <th className="px-3 py-2 font-medium">Beschreibung</th>
              <th className="px-4 py-2 font-medium text-right w-28">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {buchungen.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 last:border-0 align-top">
                <td className="px-4 py-2 whitespace-nowrap text-gray-500">{fmtWann(b)}</td>
                <td className="px-3 py-2"><Badge typ={b.typ} /></td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">{ROLLE_LABEL[b.rolle] || b.rolle}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-normal break-words">{b.beschreibung || ''}</td>
                <td className={`px-4 py-2 whitespace-nowrap text-right font-semibold ${betragCls(b.betrag)}`}>{formatEuro(b.betrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile: 2-zeilige Karten, nichts abgeschnitten */}
      <div className="sm:hidden divide-y divide-gray-100">
        {buchungen.map((b) => (
          <div key={b.id} className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <Badge typ={b.typ} />
              <span className={`font-semibold whitespace-nowrap ${betragCls(b.betrag)}`}>{formatEuro(b.betrag)}</span>
            </div>
            <div className="mt-1 text-xs text-gray-500">{ROLLE_LABEL[b.rolle] || b.rolle} · {fmtWann(b)}</div>
            <div className="mt-0.5 text-sm text-gray-600 break-words">{b.beschreibung || ''}</div>
          </div>
        ))}
      </div>
    </>
  );
}
