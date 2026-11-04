// Live-Board einrichten: Display-Sitzung oeffnen ("Jetzt Dashboard öffnen"), eigene Sitzungen
// widerrufen, Tagesziele je Person pflegen. Das Board selbst ist pages/Board.jsx unter /board.
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const datum = (v) => (v ? String(v).replace('T', ' ').slice(0, 16) : '—');
const aktiv = (t) => (t.aktiv === true || t.aktiv === 1) && !t.widerrufen_am;
const inp = 'w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-2 py-1 text-right';

function Oeffnen() {
  const qc = useQueryClient();
  const [name, setName] = useState('Bildschirm Vertrieb');
  const [neu, setNeu] = useState(null);       // { name, link }
  const [kopiert, setKopiert] = useState(false);
  const { data: sitzungen = [] } = useQuery({ queryKey: ['board-sessions'], queryFn: boardApi.sessions });
  const oeffnen = useMutation({
    mutationFn: () => boardApi.oeffnen(name),
    onSuccess: (r) => {
      const link = `${window.location.origin}/board#k=${r.token}`;
      setNeu({ name: r.name, link }); setKopiert(false);
      window.open(link, '_blank', 'noopener');
      qc.invalidateQueries({ queryKey: ['board-sessions'] });
    },
  });
  const widerrufen = useMutation({
    mutationFn: boardApi.widerrufen,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board-sessions'] }),
  });
  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Jetzt Dashboard öffnen</h2>
        <p className="text-xs text-gray-500 mb-4">
          Öffnet das Live-Board in einem neuen Fenster, z. B. für den Bildschirm im Vertrieb. Der Bildschirm bekommt eine
          eigene <b>Display-Sitzung</b>: nur lesend, nur für das Board, ohne Ablauf. Dein Login liegt damit nicht auf dem Gerät.
          Die Sitzung gilt, bis du sie unten widerrufst oder dir das Live-Board entzogen wird.
        </p>
        <form onSubmit={e => { e.preventDefault(); oeffnen.mutate(); }} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[260px]">
            <label className="text-xs text-gray-600 mb-1 block">Bezeichnung des Bildschirms</label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
              className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          </div>
          <button type="submit" disabled={oeffnen.isPending}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm rounded font-semibold">📺 Jetzt Dashboard öffnen</button>
          <a href="/board" target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline pb-2">Vorschau mit meinem Login</a>
        </form>
        {oeffnen.error && <div className="text-xs text-red-600 mt-2">{oeffnen.error.response?.data?.error || oeffnen.error.message}</div>}
        {neu && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3">
            <div className="text-xs font-semibold text-amber-900 mb-1">
              Link für „{neu.name}“: auf dem Bildschirm-Rechner öffnen. Er wird nur jetzt angezeigt.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all text-xs bg-white border border-amber-200 rounded px-2 py-1.5 select-all">{neu.link}</code>
              <button onClick={() => { navigator.clipboard?.writeText(neu.link); setKopiert(true); }}
                className="px-3 py-1.5 text-xs rounded bg-amber-600 hover:bg-amber-500 text-white">{kopiert ? 'Kopiert ✓' : 'Kopieren'}</button>
              <button onClick={() => setNeu(null)} className="px-3 py-1.5 text-xs rounded border border-amber-300 text-amber-900">Schließen</button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">Display-Sitzungen</div>
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500"><tr>
            <th className="text-left px-4 py-2">Bildschirm</th><th className="text-left px-4 py-2">Geöffnet von</th>
            <th className="text-left px-4 py-2">Geöffnet am</th><th className="text-left px-4 py-2">Zuletzt aktiv</th>
            <th className="text-left px-4 py-2">Status</th><th className="px-4 py-2" /></tr></thead>
          <tbody>
            {sitzungen.length === 0 && <tr><td colSpan="6" className="px-4 py-4 text-gray-400">Noch keine Display-Sitzung.</td></tr>}
            {sitzungen.map(t => (
              <tr key={t.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-800">{String(t.name).replace(/^Live-Board: /, '')} <span className="text-gray-400">· {t.praefix}</span></td>
                <td className="px-4 py-2 text-gray-600">{t.erstellt_von_name || '—'}</td>
                <td className="px-4 py-2 text-gray-600">{datum(t.erstellt_am)}</td>
                <td className="px-4 py-2 text-gray-600">{datum(t.zuletzt_benutzt)}</td>
                <td className="px-4 py-2">{aktiv(t)
                  ? <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">aktiv</span>
                  : <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">widerrufen {datum(t.widerrufen_am)}</span>}</td>
                <td className="px-4 py-2 text-right">{aktiv(t) && (
                  <button onClick={() => { if (window.confirm('Display-Sitzung widerrufen? Der Bildschirm zeigt danach nichts mehr an.')) widerrufen.mutate(t.id); }}
                    className="text-xs text-red-600 hover:underline">Widerrufen</button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

const KZ = [
  { key: 'settings',    label: 'Settings gelegt',    einheit: 'Anzahl' },
  { key: 'sales_calls', label: 'Sales Calls gelegt', einheit: 'Anzahl' },
  { key: 'ae',          label: 'AE gewonnen (Closer)', einheit: '€' },
];

const TAGE = [[1, 'Mo'], [2, 'Di'], [3, 'Mi'], [4, 'Do'], [5, 'Fr']];

// Einstellungen je Person: auf dem Board zeigen + Arbeitstage. Speichert sofort beim Klick.
function Einstellungen({ p, onSaved }) {
  const [aus, setAus] = useState(!!p.ausblenden);
  const [tage, setTage] = useState(p.arbeitstage || [1, 2, 3, 4, 5]);
  const [fehler, setFehler] = useState(null);
  useEffect(() => { setAus(!!p.ausblenden); setTage(p.arbeitstage || [1, 2, 3, 4, 5]); }, [p.ausblenden, p.arbeitstage]);
  const speichern = async (a, t) => {
    setFehler(null);
    try { await boardApi.einstellungen(p.id, { ausblenden: a, arbeitstage: t }); onSaved(); }
    catch (e) { setFehler(e.response?.data?.error || e.message); setAus(!!p.ausblenden); setTage(p.arbeitstage || [1, 2, 3, 4, 5]); }
  };
  const tag = (n) => {
    const neu = tage.includes(n) ? tage.filter(x => x !== n) : [...tage, n].sort();
    if (!neu.length) return;
    setTage(neu); speichern(aus, neu);
  };
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-gray-700 whitespace-nowrap">
        <input type="checkbox" checked={!aus} onChange={e => { setAus(!e.target.checked); speichern(!e.target.checked, tage); }} /> auf dem Board
      </label>
      <div className="flex gap-0.5" title="An welchen Tagen getrackt wird (Tagesziele und Soll-Stand des Monats)">
        {TAGE.map(([n, l]) => (
          <button key={n} type="button" onClick={() => tag(n)}
            className={`px-1.5 py-0.5 rounded text-[11px] border ${tage.includes(n) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-300'}`}>{l}</button>
        ))}
      </div>
      {fehler && <div className="text-[11px] text-red-600">{fehler}</div>}
    </div>
  );
}

function ZielZeile({ p, ziele, onSaved }) {
  const start = () => Object.fromEntries(KZ.map(k => {
    const z = ziele.find(x => Number(x.employee_id) === p.id && x.kennzahl === k.key);
    return [k.key, { ziel_tag: z?.ziel_tag != null ? String(Number(z.ziel_tag)) : '', ziel_monat: z?.ziel_monat != null ? String(Number(z.ziel_monat)) : '' }];
  }));
  const [f, setF] = useState(start);
  const [ok, setOk] = useState(false);
  useEffect(() => { setF(start()); }, [ziele]);   // eslint-disable-line react-hooks/exhaustive-deps
  const speichern = useMutation({
    mutationFn: () => boardApi.zieleSetzen(p.id, f),
    onSuccess: () => { setOk(true); setTimeout(() => setOk(false), 2000); onSaved(); },
  });
  const set = (k, feld, v) => setF(x => ({ ...x, [k]: { ...x[k], [feld]: v } }));
  return (
    <tr className={`border-t border-gray-100 ${p.ausblenden ? 'opacity-50' : ''}`}>
      <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{p.name}{p.ausblenden && <div className="text-[11px] text-gray-500">nicht auf dem Board</div>}</td>
      <td className="px-3 py-2"><Einstellungen p={p} onSaved={onSaved} /></td>
      {KZ.map(k => (
        <td key={k.key} className="px-2 py-2">
          <div className="flex gap-1">
            <input className={inp} placeholder="Tag" inputMode="decimal" value={f[k.key].ziel_tag} onChange={e => set(k.key, 'ziel_tag', e.target.value)} />
            <input className={inp} placeholder="Monat" inputMode="decimal" value={f[k.key].ziel_monat} onChange={e => set(k.key, 'ziel_monat', e.target.value)} />
          </div>
        </td>
      ))}
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button onClick={() => speichern.mutate()} disabled={speichern.isPending}
          className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white">{ok ? 'Gespeichert ✓' : 'Speichern'}</button>
        {speichern.error && <div className="text-[11px] text-red-600 mt-1">{speichern.error.response?.data?.error || speichern.error.message}</div>}
      </td>
    </tr>
  );
}

function Tagesziele() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['board-ziele'], queryFn: boardApi.ziele });
  if (isLoading) return <div className="text-sm text-gray-400">Lade…</div>;
  return (
    <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="text-sm font-semibold text-gray-700">Tagesziele je Person (Bonn)</div>
        <p className="text-xs text-gray-500 mt-1">
          Je Kennzahl ein Tagesziel und ein Monatsziel. Beide werden eingetragen, nichts wird aus Arbeitstagen abgeleitet.
          Leer heißt: kein Ziel in dieser Kennzahl. Wer z. B. keine Sales Calls legt, bekommt dort einfach kein Ziel; die Zielerreichung
          rechnet dann nur mit den Kennzahlen, die ein Ziel haben. Das Board zeigt nur Personen mit mindestens einem Ziel.
          „auf dem Board“ aus: Die Person erscheint in keiner Liste des Boards, ihre Deals zählen weiter in die Teamzahlen.
          Arbeitstage: An anderen Tagen steht die Person nicht in den Tageszielen, und ihr Monats-Soll rechnet nur mit ihren Tagen.
          „Monat“ auf dem Board = Ist ÷ (Monatsziel × Arbeitstag ÷ Arbeitstage des Monats).
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500"><tr>
            <th className="text-left px-3 py-2">Person</th>
            <th className="text-left px-3 py-2">Board · Arbeitstage</th>
            {KZ.map(k => <th key={k.key} className="text-left px-2 py-2">{k.label}<span className="text-gray-400 font-normal"> · Tag / Monat ({k.einheit})</span></th>)}
            <th className="px-3 py-2" /></tr></thead>
          <tbody>{(data?.personen || []).map(p => (
            <ZielZeile key={p.id} p={p} ziele={data?.ziele || []} onSaved={() => qc.invalidateQueries({ queryKey: ['board-ziele'] })} />
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

export default function LiveBoardAdmin() {
  const { canSeeLiveBoard, canPflegeBoardZiele } = useAuth();
  return (
    <div className="space-y-4 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">📺 Live-Board</h1>
        <p className="text-sm text-gray-500">Wettbewerbs-Dashboard für den Bildschirm im Bonner Neukunden-Vertrieb.</p>
      </div>
      {canSeeLiveBoard && <Oeffnen />}
      {canPflegeBoardZiele && <Tagesziele />}
    </div>
  );
}
