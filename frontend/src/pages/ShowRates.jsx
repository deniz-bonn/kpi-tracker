import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showRatesApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { currentMonat } from '../utils/format';

// Show Rates (Close) — Opener/Setter. Datenbasis ist die lokal gespiegelte Close-Status-Historie
// (siehe docs/close-discovery.md Rev. 2). Quote = stattgefunden / (stattgefunden + nicht stattgefunden);
// offene Termine (Ausgang nicht nachgetragen) bleiben bewusst draussen und stehen im Qualitaets-Block.

const ART = [['setting', 'Settings (Opener)'], ['closing', 'Closings / Sales Calls (Setter)']];
const rateColor = (r) => r == null ? 'text-gray-400' : r >= 80 ? 'text-green-600' : r >= 60 ? 'text-amber-600' : 'text-red-600';
const pctTxt = (r) => r == null ? '—' : `${r.toFixed(1)} %`;

function RateZelle({ z }) {
  if (!z || z.gelegt === 0) return <span className="text-gray-300">—</span>;
  if (!z.belastbar) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500" title={
        `Nicht belastbar: nur ${z.basis} bewertbare Termine` +
        (z.abdeckung != null ? `, Opportunity-Abdeckung ${z.abdeckung} % (von ${z.leadTermine} auf Lead-Ebene)` : '')}>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Datenbasis unzureichend
      </span>
    );
  }
  return <span className={`font-bold ${rateColor(z.rate)}`}>{pctTxt(z.rate)}</span>;
}

export default function ShowRates() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [monat, setMonat] = useState(currentMonat());
  const [tab, setTab] = useState('uebersicht');

  const { data: ov, isLoading } = useQuery({ queryKey: ['sr-overview'], queryFn: showRatesApi.overview });
  const { data: personen = [] } = useQuery({ queryKey: ['sr-personen', monat], queryFn: () => showRatesApi.personen(monat) });
  const { data: quellen = [] }  = useQuery({ queryKey: ['sr-quellen', monat],  queryFn: () => showRatesApi.quellen(monat) });
  const { data: qual }          = useQuery({ queryKey: ['sr-qualitaet'],       queryFn: showRatesApi.qualitaet });

  const syncMut = useMutation({
    mutationFn: (since) => showRatesApi.sync(since),
    onSuccess: () => ['sr-overview', 'sr-personen', 'sr-quellen', 'sr-qualitaet']
      .forEach(k => qc.invalidateQueries({ queryKey: [k] })),
  });

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
          {ov?.letzterSync && (
            <p className="text-xs text-gray-400 mt-0.5">
              Letzter Sync: {new Date(ov.letzterSync).toLocaleString('de-DE')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={monat} onChange={e => setMonat(e.target.value)} className={sel}>
            {monatsOpts.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {isAdmin && (
            <button onClick={() => syncMut.mutate(undefined)} disabled={syncMut.isPending}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded">
              {syncMut.isPending ? 'Synchronisiere…' : '↻ Sync'}
            </button>
          )}
        </div>
      </div>

      {syncMut.isError && (
        <div className="text-xs bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2">
          Sync fehlgeschlagen: {syncMut.error?.response?.data?.error || syncMut.error?.message}
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
                      <th className="px-3 py-2 text-right">offen</th>
                      <th className="px-3 py-2 text-right">Show Rate</th>
                      <th className="px-3 py-2 text-right">Abdeckung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monate.length === 0
                      ? <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">Noch keine Daten — bitte Sync ausführen.</td></tr>
                      : monate.map(m => {
                          const z = m[art];
                          return (
                            <tr key={m.monat} className={`hover:bg-gray-50 ${m.monat === monat ? 'bg-blue-50/40' : ''}`}>
                              <td className="px-3 py-1.5 text-gray-700 font-medium">{m.monat}</td>
                              <td className="px-3 py-1.5 text-right text-gray-600">{z.gelegt}</td>
                              <td className="px-3 py-1.5 text-right text-green-700 font-medium">{z.stattgefunden}</td>
                              <td className="px-3 py-1.5 text-right text-red-600">{z.nicht_stattgefunden}</td>
                              <td className="px-3 py-1.5 text-right text-amber-600">{z.offen}</td>
                              <td className="px-3 py-1.5 text-right"><RateZelle z={z} /></td>
                              <td className="px-3 py-1.5 text-right text-gray-400">
                                {z.abdeckung != null ? `${z.abdeckung} %` : '—'}
                                {z.leadTermine ? <span className="text-gray-300"> ({z.leadTermine} Leads)</span> : null}
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
            „Abdeckung" = Anteil der auf Lead-Ebene terminierten Termine, für die es eine Opportunity mit auswertbarem Ausgang gibt.
            Unter {ov?.schwellen?.minAbdeckungProzent ?? 50} % oder bei weniger als {ov?.schwellen?.minBasis ?? 10} bewertbaren
            Terminen wird bewusst keine Quote ausgewiesen.
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
