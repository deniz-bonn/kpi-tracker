import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { provisionenApi } from '../utils/api';
import { formatEuro } from '../utils/format';

// ─────────────────────────────────────────────────────────────────────────────
// Meine Provision (Mitarbeiter) — eigener Kontoauszug je Abrechnungszeitraum.
// Read-only. Serverseitig auf den eingeloggten Mitarbeiter begrenzt (siehe API /me).
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

export default function MeineProvision() {
  const [zid, setZid] = useState('');
  const { data: zeitraeume = [] } = useQuery({ queryKey: ['prov-zeitraeume'], queryFn: provisionenApi.zeitraeume });
  const { data, isLoading, isError } = useQuery({
    queryKey: ['prov-me', zid],
    queryFn: () => provisionenApi.me(zid || undefined),
    placeholderData: keepPreviousData,
  });

  const zSel = zid || data?.zeitraum?.id || '';
  const buchungen = data?.buchungen || [];
  const perTyp = data?.perTyp || {};

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
          {zeitraeume.map((z) => (
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
            ) : buchungen.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">Keine Buchungen in diesem Zeitraum.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="px-4 py-2 font-medium">Datum</th>
                      <th className="px-4 py-2 font-medium">Typ</th>
                      <th className="px-4 py-2 font-medium">Rolle</th>
                      <th className="px-4 py-2 font-medium">Beschreibung</th>
                      <th className="px-4 py-2 font-medium text-right">Betrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buchungen.map((b) => (
                      <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-500">{fmtDate(b.gewonnen_datum)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYP_COLOR[b.typ] || 'text-gray-700 bg-gray-100'}`}>{TYP_LABEL[b.typ] || b.typ}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">{ROLLE_LABEL[b.rolle] || b.rolle}</td>
                        <td className="px-4 py-2 text-gray-500 max-w-md truncate" title={b.beschreibung || ''}>{b.beschreibung || ''}</td>
                        <td className={`px-4 py-2 whitespace-nowrap text-right font-semibold ${betragCls(b.betrag)}`}>{formatEuro(b.betrag)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">Abrechnungszeitraum jeweils 21. des Vormonats bis 20. des Monats. Provision entsteht mit dem Statuswechsel auf „Gewonnen".</p>
        </>
      )}
    </div>
  );
}
