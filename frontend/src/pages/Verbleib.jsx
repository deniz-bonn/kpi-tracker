import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { verbleibApi } from '../utils/api';

// Verbleib-Liste der Wochenanalyse Bonn: Opportunities mit gefuehrtem/terminiertem Setting oder Closing,
// die ohne Ergebnis stehen. Taeglich 05:30 neu berechnet (backend/src/analyse/verbleib.js).
const BED = {
  a: 'a · kein nächster Schritt',
  b: 'b · Closing ohne Ergebnis',
  c: 'c · Setting ohne Ergebnis',
  d: 'd · Wiedervorlage statt Termin',
};
const BED_HILFE = {
  a: 'Status QC Follow-Up, SC/ Statt. FU, QC Terminiert oder SC Terminiert seit mehr als 5 Werktagen, ohne Statuswechsel und ohne offene datierte Aufgabe in Close',
  b: 'Aufnahme vorhanden oder Kalendertermin vergangen, Status weiter SC Terminiert',
  c: 'Aufnahme ab 60 Sekunden am Termintag, Status weiter QC Terminiert',
  d: 'Entscheider und Bedarf waren da, trotzdem wurde kein Termin gelegt, sondern nur eine Wiedervorlage vereinbart: mehr als 14 Tage später oder ohne Datum (Termin nicht angeboten/fixiert bzw. kein Abschluss versucht)',
};
const de = (s) => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(2, 4)}` : '—');
const eur = (v) => (v == null ? '—' : `${Math.round(v).toLocaleString('de-DE')} €`);
const pct = (v) => (v == null ? '—' : `${String(v).replace('.', ',')} %`);

function Kachel({ label, wert, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-[150px]" title={hint}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold text-gray-900 tabular-nums">{wert}</div>
    </div>
  );
}

export default function Verbleib() {
  const [stand, setStand] = useState('');
  const [filter, setFilter] = useState({ stufe: '', bed: '', person: '', nurFu: false, suche: '' });
  const { data, isLoading, error } = useQuery({ queryKey: ['verbleib', stand], queryFn: () => verbleibApi.liste(stand || undefined) });

  const personen = useMemo(() => {
    const s = new Set();
    for (const z of data?.zeilen || []) for (const p of [z.opener, z.setter, z.closer]) if (p) s.add(p);
    return [...s].sort();
  }, [data]);

  const zeilen = useMemo(() => (data?.zeilen || []).filter(z =>
    (!filter.stufe || z.stufe === filter.stufe)
    && (!filter.bed || z.bedingungen.split(', ').includes(filter.bed))
    && (!filter.person || [z.opener, z.setter, z.closer].includes(filter.person))
    && (!filter.nurFu || z.follow_up_statt_termin)
    && (!filter.suche || (z.firma || '').toLowerCase().includes(filter.suche.toLowerCase()))), [data, filter]);

  async function exportieren() {
    const blob = await verbleibApi.export(data?.stand);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Verbleib_Bonn_${data?.stand || 'aktuell'}.xlsx`; a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) return <div className="p-6 text-gray-500">Lade Verbleib-Liste …</div>;
  if (error) return <div className="p-6 text-red-600">Fehler beim Laden: {error.response?.data?.error || error.message}</div>;
  if (!data?.stand) return <div className="p-6 text-gray-500">Noch kein Stand berechnet. Die Liste wird täglich um 05:30 Uhr aktualisiert.</div>;

  const kw = data.kennzahlen.woche, km = data.kennzahlen.monat, g = kw.gesamtListe;
  const summe = zeilen.reduce((s, z) => s + (Number(z.opportunity_wert) || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Verbleib: Settings und Closings ohne Ergebnis</h1>
          <p className="text-sm text-gray-500">Bonn, acht Personen der Wochenanalyse · Stand {de(data.stand)} · täglich aktualisiert</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="border border-gray-300 rounded px-2 py-1.5 text-sm" value={stand} onChange={e => setStand(e.target.value)}>
            <option value="">Aktueller Stand</option>
            {data.staende.map(s => <option key={s} value={s}>{de(s)}</option>)}
          </select>
          <button onClick={exportieren} className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded px-3 py-1.5">Excel</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Kachel label="Opportunities in der Liste" wert={g.opportunities.toLocaleString('de-DE')} />
        <Kachel label="Opportunity-Wert gesamt" wert={eur(g.wert)} />
        <Kachel label="Wiedervorlage statt Termin" wert={g.followUpStattTermin} hint={BED_HILFE.d} />
        <Kachel label="Woche: Settings / Closings o. E." wert={`${kw.settingsOhneErgebnis} / ${kw.closingsOhneErgebnis}`} hint={`Woche ${de(kw.zeitraum.von)}–${de(kw.zeitraum.bis)}`} />
        <Kachel label="Monat: Settings / Closings o. E." wert={`${km.settingsOhneErgebnis} / ${km.closingsOhneErgebnis}`} />
        <Kachel label="Monat: Wert der Wiedervorlagen" wert={eur(km.fuWert)} hint={`davon „Wiedervorlage statt Termin“: ${pct(km.fuStattTerminAnteil)}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select className="border border-gray-300 rounded px-2 py-1" value={filter.stufe} onChange={e => setFilter(f => ({ ...f, stufe: e.target.value }))}>
          <option value="">Alle Stufen</option><option>Setting</option><option>Closing</option>
        </select>
        <select className="border border-gray-300 rounded px-2 py-1" value={filter.bed} onChange={e => setFilter(f => ({ ...f, bed: e.target.value }))}>
          <option value="">Alle Bedingungen</option>
          {Object.entries(BED).map(([k, v]) => <option key={k} value={k} title={BED_HILFE[k]}>{v} ({g.jeBedingung[k] || 0})</option>)}
        </select>
        <select className="border border-gray-300 rounded px-2 py-1" value={filter.person} onChange={e => setFilter(f => ({ ...f, person: e.target.value }))}>
          <option value="">Alle Personen</option>
          {personen.map(p => <option key={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-1"><input type="checkbox" checked={filter.nurFu} onChange={e => setFilter(f => ({ ...f, nurFu: e.target.checked }))} /> nur „Wiedervorlage statt Termin“</label>
        <input className="border border-gray-300 rounded px-2 py-1" placeholder="Firma suchen" value={filter.suche} onChange={e => setFilter(f => ({ ...f, suche: e.target.value }))} />
        <span className="text-gray-500 ml-auto">{zeilen.length} Zeilen · {eur(summe)}</span>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>{['Firma', 'Stufe', 'Datum', 'Opener', 'Setter', 'Closer', 'Status', 'seit', 'Tage', 'Bedingung', 'Nächster Schritt (Close)', 'Nächster Schritt (Transkript)', 'Grund', 'Wert', ''].map(h =>
              <th key={h} className="px-2 py-2 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {zeilen.map(z => (
              <tr key={z.close_opportunity_id} className={`border-t border-gray-100 ${z.follow_up_statt_termin ? 'bg-amber-50' : ''}`}>
                <td className="px-2 py-1.5 font-medium text-gray-900 max-w-[200px] truncate" title={z.firma}>{z.firma || '—'}</td>
                <td className="px-2 py-1.5">{z.stufe}</td>
                <td className="px-2 py-1.5 tabular-nums">{de(z.termin_datum)}</td>
                <td className="px-2 py-1.5">{z.opener || '—'}</td>
                <td className="px-2 py-1.5">{z.setter || '—'}</td>
                <td className="px-2 py-1.5">{z.closer || '—'}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{z.status_label}</td>
                <td className="px-2 py-1.5 tabular-nums">{de(z.status_seit)}</td>
                <td className="px-2 py-1.5 tabular-nums text-right">{z.tage_im_status}</td>
                <td className="px-2 py-1.5 whitespace-nowrap" title={z.bedingungen.split(', ').map(b => BED_HILFE[b]).join('\n')}>
                  {z.bedingungen}{z.follow_up_statt_termin && <span className="ml-1 text-amber-700 font-medium">Wiedervorlage statt Termin</span>}
                </td>
                <td className="px-2 py-1.5 max-w-[180px] truncate" title={z.naechster_schritt_close || ''}>{z.naechster_schritt_close ? `${de(z.naechster_schritt_close_datum)} ${z.naechster_schritt_close}` : '—'}</td>
                <td className="px-2 py-1.5 max-w-[200px] truncate" title={z.naechster_schritt_transkript || ''}>{z.naechster_schritt_transkript ? `${z.naechster_schritt_transkript_datum ? de(z.naechster_schritt_transkript_datum) + ' ' : ''}${z.naechster_schritt_transkript}` : '—'}</td>
                <td className="px-2 py-1.5 max-w-[180px] truncate" title={z.grund || ''}>{z.grund || '—'}</td>
                <td className="px-2 py-1.5 tabular-nums text-right whitespace-nowrap">{eur(z.opportunity_wert)}</td>
                <td className="px-2 py-1.5"><a href={z.close_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Close</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Bedingungen: {Object.entries(BED_HILFE).map(([k, v]) => `${k}) ${v}`).join(' · ')}</p>
    </div>
  );
}
