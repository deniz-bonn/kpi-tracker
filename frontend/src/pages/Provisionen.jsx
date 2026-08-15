import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { provisionenApi } from '../utils/api';
import { formatEuro } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import Kontoauszug from '../components/Kontoauszug';

// ─────────────────────────────────────────────────────────────────────────────
// Provisionen (Admin/Vertriebsleitung) — Gesamtübersicht je Abrechnungszeitraum,
// Standort-Filter, Einzeldetail je Mitarbeiter, Live-Staffel-Anzeige. Superadmin:
// laufenden Zeitraum initialisieren. Read-only bis auf Backfill/Abschluss.
// ─────────────────────────────────────────────────────────────────────────────

const fmtPct = (n) => String(n ?? 0).replace('.', ',') + ' %';
const betragCls = (n) => (Number(n) < 0 ? 'text-rose-600' : 'text-gray-900');

function StandortBadge({ standort }) {
  if (!standort) return null;
  const cls = standort === 'Bonn' ? 'bg-blue-50 text-blue-700' : standort === 'Braunschweig' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{standort}</span>;
}

function DetailModal({ employeeId, zeitraumId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['prov-emp', employeeId, zeitraumId],
    queryFn: () => provisionenApi.employee(employeeId, zeitraumId || undefined),
  });
  const buchungen = data?.buchungen || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="font-bold text-gray-900">{data?.employee?.name || 'Mitarbeiter'}</div>
            <div className="text-xs text-gray-500">{data?.zeitraum?.label} · Summe {formatEuro(data?.summe || 0)}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto">
          {isLoading ? <div className="p-8 text-center text-sm text-gray-400">Lädt…</div> : <Kontoauszug buchungen={buchungen} />}
        </div>
      </div>
    </div>
  );
}

function BackfillPanel({ onDone }) {
  const [proj, setProj] = useState(null);
  const [msg, setMsg] = useState('');
  const dry = useMutation({ mutationFn: provisionenApi.backfillDry, onSuccess: (d) => { setProj(d); setMsg(''); } });
  const run = useMutation({
    mutationFn: provisionenApi.backfillRun,
    onSuccess: (d) => { setMsg(`Backfill ausgeführt: ${d.inScopeDeals} In-Scope-Deals verbucht.`); setProj(null); onDone?.(); },
  });
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-amber-900">⚙️ Laufenden Zeitraum initialisieren <span className="text-xs font-normal text-amber-700">(nur Superadmin)</span></div>
        <button onClick={() => dry.mutate()} disabled={dry.isPending}
          className="rounded-lg bg-white border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50">
          {dry.isPending ? 'Berechne…' : 'Projektion anzeigen (Dry-Run)'}
        </button>
      </div>
      {proj && (
        <div className="rounded-xl bg-white border border-amber-200 p-3 text-sm space-y-2">
          <div className="text-gray-700">Go-Live <b>{proj.goLive}</b> · <b>{proj.inScopeDeals}</b> In-Scope-Deals → <b>{proj.positionen}</b> Positionen · Basis gesamt <b>{formatEuro(proj.totalBase)}</b></div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(proj.perRolle || {}).map(([rolle, v]) => (
              <span key={rolle} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{ROLLE_LABEL[rolle] || rolle} <b>{v.n}×</b> {formatEuro(v.summe)}</span>
            ))}
          </div>
          <button
            onClick={() => { if (window.confirm(`Backfill jetzt ausführen? Bucht ${proj.positionen} Positionen (idempotent, mehrfach ausführbar).`)) run.mutate(); }}
            disabled={run.isPending}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50">
            {run.isPending ? 'Buche…' : 'Backfill ausführen'}
          </button>
        </div>
      )}
      {msg && <div className="text-sm font-semibold text-emerald-700">{msg}</div>}
      <p className="text-xs text-amber-700/80">Idempotent: pflegt nur fehlende Buchungen nach, doppeltes Ausführen ist harmlos. Neue Deals werden ohnehin automatisch verbucht.</p>
    </div>
  );
}

export default function Provisionen() {
  const { isSuperAdmin } = useAuth();
  const qc = useQueryClient();
  const [zid, setZid] = useState('');
  const [detailEmp, setDetailEmp] = useState(null);
  const [exportErr, setExportErr] = useState('');
  const [filterStandort, setFilterStandort] = useState('Alle');

  const { data: zeitraeume = [] } = useQuery({ queryKey: ['prov-zeitraeume'], queryFn: provisionenApi.zeitraeume });
  const { data, isLoading } = useQuery({
    queryKey: ['prov-overview', zid],
    queryFn: () => provisionenApi.overview(zid || undefined),
    placeholderData: keepPreviousData,
  });

  const zSel = zid || data?.zeitraum?.id || '';
  const zeilen = data?.zeilen || [];
  const staffelMap = Object.fromEntries((data?.staffel?.closers || []).map(c => [c.employee_id, c]));
  const zeilenF = filterStandort === 'Alle' ? zeilen : zeilen.filter(z => z.standort === filterStandort);
  const gesamtF = Math.round(zeilenF.reduce((a, r) => a + Number(r.summe || 0), 0) * 100) / 100;

  const abschlussMut = useMutation({
    mutationFn: () => provisionenApi.abschluss(zSel),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prov-zeitraeume'] }); qc.invalidateQueries({ queryKey: ['prov-overview'] }); },
  });
  const doExport = async () => { setExportErr(''); try { await provisionenApi.exportCsv(zSel); } catch (e) { setExportErr('Export fehlgeschlagen.'); } };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">🧾 Provisionen</h1>
        <select value={zSel} onChange={(e) => setZid(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 bg-white">
          {zeitraeume.map((z) => (
            <option key={z.id} value={z.id}>{z.label}{z.status === 'abgeschlossen' ? ' (abgeschlossen)' : ''}</option>
          ))}
        </select>
      </div>

      {isSuperAdmin && data?.zeitraum && (
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={doExport} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">⬇ StB-Export (CSV)</button>
          {data.zeitraum.status === 'offen' ? (
            <button
              onClick={() => { if (window.confirm(`Zeitraum „${data.zeitraum.label}" abschließen? Buchungen werden eingefroren; spätere Stornos/Korrekturen laufen in den Folgezeitraum.`)) abschlussMut.mutate(); }}
              disabled={abschlussMut.isPending}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50">
              {abschlussMut.isPending ? 'Schließe…' : '🔒 Zeitraum abschließen'}
            </button>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">✓ Abgeschlossen{data.zeitraum.abgeschlossen_am ? ` am ${data.zeitraum.abgeschlossen_am}` : ''}</span>
          )}
          {abschlussMut.isError && <span className="text-xs text-rose-600">{abschlussMut.error?.response?.data?.error || 'Abschluss fehlgeschlagen'}</span>}
          {exportErr && <span className="text-xs text-rose-600">{exportErr}</span>}
        </div>
      )}

      {isSuperAdmin && <BackfillPanel onDone={() => qc.invalidateQueries({ queryKey: ['prov-overview'] })} />}

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Standort:</span>
        <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
          {['Alle', 'Bonn', 'Braunschweig'].map(s => (
            <button key={s} onClick={() => setFilterStandort(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filterStandort === s ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 shadow-sm flex items-baseline justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-300">Gesamt{data?.zeitraum ? ` · ${data.zeitraum.label}` : ''}{filterStandort !== 'Alle' ? ` · ${filterStandort}` : ''}</div>
        <div className="text-3xl font-bold">{formatEuro(gesamtF)}</div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">Berechtigte im Zeitraum</div>
        {isLoading && !data ? (
          <div className="p-8 text-center text-sm text-gray-400">Lädt…</div>
        ) : zeilenF.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Keine Einträge{filterStandort !== 'Alle' ? ` für ${filterStandort}` : ''} in diesem Zeitraum.{isSuperAdmin && zeilen.length === 0 ? ' Ggf. oben den Backfill ausführen.' : ''}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 font-medium w-10">#</th>
                  <th className="px-4 py-2 font-medium">Mitarbeiter</th>
                  <th className="px-4 py-2 font-medium">Standort</th>
                  <th className="px-4 py-2 font-medium">Satz (Monat)</th>
                  <th className="px-4 py-2 font-medium text-right">Provision</th>
                  <th className="px-4 py-2 font-medium text-right w-20"></th>
                </tr>
              </thead>
              <tbody>
                {zeilenF.map((r, i) => {
                  const st = staffelMap[r.employee_id];
                  return (
                    <tr key={r.employee_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setDetailEmp(r.employee_id)}>
                      <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{r.name || `#${r.employee_id}`}</td>
                      <td className="px-4 py-2"><StandortBadge standort={r.standort} /></td>
                      <td className="px-4 py-2">
                        {st ? (
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.satz > st.basis ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
                            title={st.erreichtAm ? `200k-Schwelle am ${st.erreichtAm.slice(8, 10)}.${st.erreichtAm.slice(5, 7)}. erreicht` : `noch ${formatEuro(st.restBisNext)} bis ${fmtPct(st.hoch)}`}>
                            {fmtPct(st.satz)}
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className={`px-4 py-2 text-right font-semibold ${betragCls(r.summe)}`}>{formatEuro(r.summe)}</td>
                      <td className="px-4 py-2 text-right"><span className="text-xs text-indigo-600 font-semibold">Details →</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">Abrechnungszeitraum 21.–20. Zeile anklicken für den Kontoauszug des Mitarbeiters.</p>

      {detailEmp != null && <DetailModal employeeId={detailEmp} zeitraumId={zSel} onClose={() => setDetailEmp(null)} />}
    </div>
  );
}
