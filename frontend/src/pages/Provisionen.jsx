import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { provisionenApi } from '../utils/api';
import { formatEuro } from '../utils/format';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Provisionen (Admin/Vertriebsleitung) — Gesamtübersicht je Abrechnungszeitraum,
// Einzeldetail je Mitarbeiter. Superadmin: laufenden Zeitraum initialisieren
// (Dry-Run-Projektion → Commit). Read-only bis auf den Backfill-Commit.
// ─────────────────────────────────────────────────────────────────────────────

const TYP_LABEL = {
  deal_gewonnen: 'Gewonnen', team_provision: 'Team (Bonn)', korrektur: 'Korrektur',
  storno: 'Storno', staffel_nachtrag: 'Staffel-Nachtrag', team_nachtrag: 'Team-Nachtrag',
};
const TYP_COLOR = {
  deal_gewonnen: 'text-emerald-700 bg-emerald-50', team_provision: 'text-sky-700 bg-sky-50',
  korrektur: 'text-amber-700 bg-amber-50', storno: 'text-rose-700 bg-rose-50',
  staffel_nachtrag: 'text-indigo-700 bg-indigo-50', team_nachtrag: 'text-indigo-700 bg-indigo-50',
};
const ROLLE_LABEL = { opener: 'Opener', setter: 'Setter', closer: 'Closer', opener_setter: 'Opener+Setter', team: 'Team' };
const fmtDate = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : '—');
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
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <div className="font-bold text-gray-900">{data?.employee?.name || 'Mitarbeiter'}</div>
            <div className="text-xs text-gray-500">{data?.zeitraum?.label} · Summe {formatEuro(data?.summe || 0)}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400">Lädt…</div>
          ) : buchungen.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">Keine Buchungen in diesem Zeitraum.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-2 font-medium">Datum</th><th className="px-3 py-2 font-medium">Typ</th>
                  <th className="px-3 py-2 font-medium">Rolle</th><th className="px-3 py-2 font-medium">Beschreibung</th>
                  <th className="px-5 py-2 font-medium text-right">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {buchungen.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-2 whitespace-nowrap text-gray-500">{fmtDate(b.gewonnen_datum)}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYP_COLOR[b.typ] || 'bg-gray-100 text-gray-700'}`}>{TYP_LABEL[b.typ] || b.typ}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">{ROLLE_LABEL[b.rolle] || b.rolle}</td>
                    <td className="px-3 py-2 text-gray-500 max-w-xs truncate" title={b.beschreibung || ''}>{b.beschreibung || ''}</td>
                    <td className={`px-5 py-2 whitespace-nowrap text-right font-semibold ${betragCls(b.betrag)}`}>{formatEuro(b.betrag)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  const { isSuperAdmin, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [zid, setZid] = useState('');
  const [detailEmp, setDetailEmp] = useState(null);
  const [exportErr, setExportErr] = useState('');

  const { data: zeitraeume = [] } = useQuery({ queryKey: ['prov-zeitraeume'], queryFn: provisionenApi.zeitraeume });
  const { data, isLoading } = useQuery({
    queryKey: ['prov-overview', zid],
    queryFn: () => provisionenApi.overview(zid || undefined),
    placeholderData: keepPreviousData,
  });

  const zSel = zid || data?.zeitraum?.id || '';
  const zeilen = data?.zeilen || [];

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

      {isAdmin && data?.zeitraum && (
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

      <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 shadow-sm flex items-baseline justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-300">Gesamt{data?.zeitraum ? ` · ${data.zeitraum.label}` : ''}</div>
        <div className="text-3xl font-bold">{formatEuro(data?.gesamt || 0)}</div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">Berechtigte im Zeitraum</div>
        {isLoading && !data ? (
          <div className="p-8 text-center text-sm text-gray-400">Lädt…</div>
        ) : zeilen.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Noch keine Buchungen in diesem Zeitraum.{isSuperAdmin ? ' Ggf. oben den Backfill ausführen.' : ''}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 font-medium w-10">#</th>
                  <th className="px-4 py-2 font-medium">Mitarbeiter</th>
                  <th className="px-4 py-2 font-medium">Standort</th>
                  <th className="px-4 py-2 font-medium text-right">Provision</th>
                  <th className="px-4 py-2 font-medium text-right w-20"></th>
                </tr>
              </thead>
              <tbody>
                {zeilen.map((r, i) => (
                  <tr key={r.employee_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setDetailEmp(r.employee_id)}>
                    <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{r.name || `#${r.employee_id}`}</td>
                    <td className="px-4 py-2"><StandortBadge standort={r.standort} /></td>
                    <td className={`px-4 py-2 text-right font-semibold ${betragCls(r.summe)}`}>{formatEuro(r.summe)}</td>
                    <td className="px-4 py-2 text-right"><span className="text-xs text-indigo-600 font-semibold">Details →</span></td>
                  </tr>
                ))}
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
