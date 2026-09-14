import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meinDashboardApi } from '../utils/api';
import { formatEuro } from '../utils/format';
import Kontoauszug from '../components/Kontoauszug';
import InfoPopover from '../components/InfoPopover';

// ── "Mein Dashboard" — persoenliche Startseite je Vertriebler ────────────────
// Alle Zahlen kommen aus EINEM Endpoint (/api/mein-dashboard). Hier wird nichts nachgerechnet,
// was der Server nicht schon geliefert hat — Ausnahme sind reine Darstellungsableitungen
// (Prozent eines Balkens, "noch X bis Ziel"), die bewusst keine eigene Wahrheit erzeugen.

const card = 'rounded-xl border border-gray-200 overflow-hidden bg-white';
const head = 'px-4 py-2.5 bg-[#2d2e30] border-b border-[#444]';
const headT = 'text-xs font-bold text-white uppercase tracking-wide';
const sec = 'text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2';

const pct = (ist, ziel) => (ziel > 0 ? Math.max(0, Math.min(100, (ist / ziel) * 100)) : 0);
const STATUS_TEXT = { erreicht: 'erreicht', auf_kurs: 'auf Kurs', gefaehrdet: 'gefährdet', offen: 'offen' };
const STATUS_CLASS = {
  erreicht:   'bg-green-100 text-green-800',
  auf_kurs:   'bg-amber-100 text-amber-800',
  gefaehrdet: 'bg-red-100 text-red-800',
  offen:      'bg-gray-100 text-gray-600',
};

function Ampel({ ok, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs mr-4">
      <span className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-600' : 'bg-gray-300'}`} />
      {label}
    </span>
  );
}

function Balken({ anteil, farbe = 'bg-blue-600', hoehe = 'h-2.5' }) {
  return (
    <div className={`${hoehe} bg-gray-100 rounded-full overflow-hidden my-1.5`}>
      <div className={`h-full rounded-full ${farbe}`} style={{ width: `${anteil}%` }} />
    </div>
  );
}

function Kachel({ label, wert, unter, farbe = 'text-gray-900', tip, onClick, offen }) {
  return (
    <div className={`flex-1 min-w-[150px] ${card} px-4 py-3 ${onClick ? 'cursor-pointer hover:border-gray-300' : ''}`}
         onClick={onClick}>
      <div className="text-[11px] text-gray-500 flex items-center">
        {label}{tip && <InfoPopover text={tip} label={label} />}
        {onClick && <span className="ml-auto text-gray-400 text-[11px]">{offen ? '▲' : '▼'}</span>}
      </div>
      <div className={`text-xl font-bold mt-0.5 ${farbe}`}>{wert}</div>
      {unter && <div className="text-xs text-gray-500">{unter}</div>}
    </div>
  );
}

// Reise-Karte (Warschau / München)
function Reise({ name, untertitel, farbe, ziel, ist, srIst, srZiel, srNichtMessbar, status,
                 teamNoetig, teamOk, markerAnteil, markerLabel, aeJeAbschluss, fokus }) {
  const anteil = pct(ist, ziel?.ae);
  const rest = ziel?.ae != null ? Math.max(0, ziel.ae - ist) : null;
  const abschluesse = rest != null && aeJeAbschluss > 0 ? Math.ceil(rest / aeJeAbschluss) : null;
  const aeOk = ziel?.ae == null || ist >= ziel.ae;
  const srOk = ziel?.sr == null || (srIst != null && srIst >= ziel.sr);
  return (
    <div className={`${card} flex-1 min-w-[330px]`}>
      <div className={`px-4 py-2.5 ${farbe} flex items-center justify-between`}>
        <span className={headT}>✈ {name} — {untertitel}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_CLASS[status] || STATUS_CLASS.offen}`}>
          {STATUS_TEXT[status] || status}
        </span>
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500">Auftragseingang deiner Messbasis</div>
        <div className="relative">
          <Balken anteil={anteil} farbe={aeOk ? 'bg-green-600' : 'bg-blue-600'} hoehe="h-5" />
          {markerAnteil != null && markerAnteil < 100 && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-700" style={{ left: `${markerAnteil}%` }}
                 title={markerLabel} />
          )}
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-semibold">{formatEuro(ist)}</span>
          <span className="text-gray-500">Ziel {ziel?.ae != null ? formatEuro(ziel.ae) : '—'}</span>
        </div>
        {rest > 0 && (
          <div className="text-xs mt-1">
            noch <b>{formatEuro(rest)}</b>
            {abschluesse != null && <> — Ø-Deal {formatEuro(aeJeAbschluss)} ≙ <b>~{abschluesse} Abschlüsse</b></>}
          </div>
        )}

        {ziel?.sr != null && (
          <>
            <div className="text-xs text-gray-500 mt-4 flex items-center">
              Show-Rate — Ø der Monate
              {fokus === 'sr' && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">Fokus</span>}
            </div>
            {srNichtMessbar
              ? <div className="text-xs text-gray-400 py-1">Datenbasis unzureichend — keine Quote ausgewiesen.</div>
              : <>
                  <Balken anteil={pct(srIst, 100)} farbe={srOk ? 'bg-green-600' : 'bg-amber-500'} />
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{srIst} %</span>
                    <span className="text-gray-500">Ziel {ziel.sr} %</span>
                  </div>
                </>}
          </>
        )}

        <div className="mt-4 pt-2.5 border-t border-gray-200">
          <Ampel ok={aeOk} label="Auftragseingang" />
          {ziel?.sr != null && <Ampel ok={srOk} label="Show-Rate" />}
          {teamNoetig && <Ampel ok={teamOk} label="Teamziel" />}
        </div>
      </div>
    </div>
  );
}

export default function MeinDashboard() {
  const [zeitraumId, setZeitraumId] = useState(null);
  const [auf, setAuf] = useState(null);          // welche Deal-Kachel ist aufgeklappt
  const [auszug, setAuszug] = useState(null);    // welcher Zeitraum zeigt seinen Kontoauszug

  const { data, isLoading, error } = useQuery({
    queryKey: ['mein-dashboard', zeitraumId],
    queryFn: () => meinDashboardApi.load(zeitraumId),
  });

  const inc = data?.incentive;
  // Fokus = die Zielkomponente mit dem groessten relativen Rueckstand. Reine Hervorhebung,
  // keine Handlungsempfehlung — das Dashboard zeigt, WO der Hebel liegt, nicht was zu tun ist.
  const fokus = useMemo(() => {
    if (!inc?.ziele?.muenchen) return null;
    const z = inc.ziele.muenchen;
    const aeLuecke = z.ae ? Math.max(0, 1 - inc.ae_gesamt / z.ae) : 0;
    const srLuecke = (z.sr && inc.sr_mittel != null) ? Math.max(0, 1 - inc.sr_mittel / z.sr) : 0;
    if (aeLuecke === 0 && srLuecke === 0) return null;
    return srLuecke > aeLuecke ? 'sr' : 'ae';
  }, [inc]);

  if (isLoading) return <div className="text-sm text-gray-400 py-10">Lade…</div>;
  if (error) return <div className="text-sm text-red-600 py-10">Konnte nicht geladen werden: {error.message}</div>;
  if (!data?.employee) {
    return (
      <div className="text-sm text-gray-500 py-10">
        {data?.hinweis || 'Kein Mitarbeiter mit diesem Account verknüpft.'}
      </div>
    );
  }

  const { employee, provision, deals, forecast, kpis } = data;
  const z = provision.zeitraum;
  const fcAnteil = forecast.forecast > 0 ? (forecast.gebucht / forecast.forecast) * 100 : 0;

  return (
    <div className="space-y-1 text-gray-900">
      {/* body ist global `text-gray-100` (helles Theme-Erbe fuer dunkle Flaechen). Alles, was hier
          keine eigene Textfarbe setzt, waere sonst gray-100 auf Weiss — also unsichtbar. Deshalb
          setzt die Seite ihre Grundfarbe einmal am Wurzelknoten. */}
      {/* Kopf */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Mein Dashboard
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">Beta</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {employee.name}{employee.standort ? ` · ${employee.standort}` : ''} — nur deine eigenen Zahlen
          </p>
        </div>
        {provision.zeitraeume?.length > 0 && (
          <select
            value={zeitraumId ?? (z ? z.id : '')}
            onChange={e => setZeitraumId(e.target.value || null)}
            className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5">
            {provision.zeitraeume.map(zz => (
              <option key={zz.id} value={zz.id}>
                {zz.label || `${zz.von} – ${zz.bis}`}{zz.status === 'abgeschlossen' ? ' (Archiv)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 1 Provision */}
      <div className={sec}>Provision</div>
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[320px] rounded-xl bg-[#2d2e30] text-white px-5 py-4">
          <div className="text-[11px] uppercase tracking-wide text-gray-400">
            {z?.status === 'abgeschlossen' ? 'Provision (abgeschlossener Zeitraum)' : 'Provision im laufenden Zeitraum'}
            {z && <span className="ml-2 bg-gray-600 text-gray-200 rounded-full px-2 py-0.5 text-[11px]">
              {employee.kreis === 'bonn' ? 'Bonn' : employee.kreis === 'braunschweig' ? 'Braunschweig' : 'Österreich'}
              {' · '}{z.label || `${z.von}–${z.bis}`}
            </span>}
          </div>
          <div className="text-3xl font-bold mt-1.5">{formatEuro(provision.summe)}</div>
          {z && <div className="text-xs text-gray-400 mt-1.5">
            {z.status === 'abgeschlossen'
              ? <>abgeschlossen am {String(z.abgeschlossen_am || '').slice(0, 10)} — eingefroren</>
              : <>Stichtag {String(z.bis).slice(0, 10)} · Stand live</>}
          </div>}
          {provision.staffel && (
            <div className="text-xs text-gray-400 mt-1">
              Dein Closer-Satz aktuell <b className="text-white">{provision.staffel.satz} %</b>
              {provision.staffel.restBisNext > 0 && <> · noch {formatEuro(provision.staffel.restBisNext)} bis {provision.staffel.nextSatz} %</>}
            </div>
          )}
        </div>
        <div className={`${card} flex-1 min-w-[330px]`}>
          <div className={head}><span className={headT}>Zeiträume</span></div>
          <div className="divide-y divide-gray-100">
            {provision.zeitraeume.map(zz => (
              <div key={zz.id}>
                <div className="flex items-center justify-between px-4 py-2 text-xs">
                  <span className="text-gray-700">{zz.label || `${zz.von} – ${zz.bis}`}</span>
                  <span className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      zz.status === 'abgeschlossen' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {zz.status === 'abgeschlossen' ? 'Archiv' : 'laufend'}
                    </span>
                    <b className="text-gray-900">{formatEuro(zz.summe)}</b>
                    <button onClick={() => setAuszug(auszug === zz.id ? null : zz.id)}
                            className="text-gray-400 hover:text-gray-700">
                      {auszug === zz.id ? '▲' : '▼'}
                    </button>
                  </span>
                </div>
                {auszug === zz.id && (
                  <div className="px-3 pb-3">
                    {String(zz.id) === String(z?.id)
                      ? <Kontoauszug buchungen={provision.buchungen} />
                      : <div className="text-xs text-gray-400 py-2">
                          Zum Öffnen oben den Zeitraum wählen — der Kontoauszug wird je Zeitraum geladen.
                        </div>}
                  </div>
                )}
              </div>
            ))}
            {provision.zeitraeume.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-400">Noch keine Abrechnungszeiträume.</div>
            )}
          </div>
        </div>
      </div>

      {/* 2 Meine Deals */}
      <div className={sec}>Meine Deals</div>
      <div className="flex gap-3 flex-wrap">
        {[['gewonnen', 'Gewonnen', 'text-green-700', 'realisierter AE'],
          ['offen', 'Offen', 'text-amber-600', 'Angebotswert · gesamter offener Bestand'],
          ['verloren', 'Verloren', 'text-red-600', 'Angebotswert']].map(([k, label, farbe, unter]) => (
          <Kachel key={k} label={label} wert={deals[k].n} farbe={farbe}
                  unter={`${formatEuro(deals[k].volumen)} ${unter}`}
                  onClick={() => setAuf(auf === k ? null : k)} offen={auf === k} />
        ))}
        <Kachel label="Ø Deal" wert={deals.ae_je_abschluss != null ? formatEuro(deals.ae_je_abschluss) : '—'}
                unter="realisierter AE je Abschluss" />
      </div>
      {auf && (
        <div className={`${card} mt-2 overflow-x-auto`}>
          <table className="w-full text-xs">
            <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <th className="px-3 py-2 text-left">Kunde</th>
              <th className="px-3 py-2 text-left">Datum</th>
              <th className="px-3 py-2 text-left">Deine Rolle</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Wert</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {deals[auf].liste.length === 0
                ? <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400">Keine Deals.</td></tr>
                : deals[auf].liste.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 text-gray-800">{d.kunde}</td>
                      <td className="px-3 py-1.5 text-gray-500">{String(d.datum || '').slice(0, 10)}</td>
                      <td className="px-3 py-1.5 text-gray-600">{d.rollen.join(' + ')}</td>
                      <td className="px-3 py-1.5 text-gray-600">{d.status}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-gray-900">{formatEuro(d.wert)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3 Provisions-Forecast */}
      <div className={sec}>Provisions-Forecast</div>
      <div className={card}>
        <div className={head}><span className={headT}>Gebucht → Forecast</span></div>
        <div className="p-4">
          <div className="h-5 bg-gray-100 rounded-md overflow-hidden flex">
            <div className="h-full bg-blue-600" style={{ width: `${fcAnteil}%` }} />
            <div className="h-full bg-blue-300" style={{ width: `${100 - fcAnteil}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5 flex-wrap gap-2">
            <span><b>{formatEuro(forecast.gebucht)}</b> gebucht</span>
            <span className="text-blue-700"><b>+ {formatEuro(forecast.potenzial)}</b> aus offenen Deals</span>
            <span><b>{formatEuro(forecast.forecast)}</b> Forecast</span>
          </div>
          <div className="mt-3 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            Gebuchter Stand + <b>{Math.round(forecast.quote * 100)} %</b> des Provisionspotenzials deiner
            offenen Deals (dein aktuell wirksamer Satz, keine Staffel-Annahme).
            <b> Der Forecast ist eine Indikation, keine Zusage.</b>
            {forecast.hinweise?.map((h, i) => <div key={i} className="mt-1">· {h}</div>)}
          </div>
        </div>
      </div>

      {/* 4 Meine KPIs */}
      <div className={sec}>Meine KPIs <span className="normal-case font-normal text-gray-400">— {kpis.monat}</span></div>
      <div className="flex gap-3 flex-wrap">
        {kpis.termine.length === 0 && (
          <div className="text-xs text-gray-400 py-2">Für diesen Monat sind keine Termine erfasst.</div>
        )}
        {kpis.termine.map(t => (
          <Kachel key={t.art}
                  label={t.art === 'setting' ? 'Settings gelegt' : 'Beratungen gelegt'}
                  wert={t.gelegt}
                  unter={`${t.statt} von ${t.bewertet} bewerteten stattgefunden`} />
        ))}
        {kpis.termine.map(t => (
          <Kachel key={t.art + '-rate'}
                  label={`Show-Rate ${t.art === 'setting' ? 'Setting' : 'Beratung'}`}
                  wert={t.messbar ? `${t.rate} %` : '—'}
                  farbe={t.messbar ? 'text-green-700' : 'text-gray-400'}
                  unter={t.messbar ? `${t.abdeckung} % der Termine bewertet` : 'Datenbasis unzureichend'}
                  tip="Stattgefunden ÷ bewertete gelegte Termine. Unter 50 % bewerteten oder weniger als 10 bewertbaren Terminen wird bewusst keine Quote ausgewiesen." />
        ))}
      </div>

      {/* 5 Incentive */}
      {inc && (
        <>
          <div className={sec}>
            Team-Incentive {inc.zeitraum.von} – {inc.zeitraum.bis}
            {inc.vorlaeufig && (
              <span className="ml-2 normal-case font-normal text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                vorläufige Ziele
              </span>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Reise name="Warschau" untertitel="Mastermind November" farbe="bg-indigo-700"
                   ziel={inc.ziele.warschau} ist={inc.ae_gesamt}
                   srIst={inc.sr_mittel} srZiel={inc.ziele.warschau.sr}
                   srNichtMessbar={inc.sr_nicht_messbar}
                   status={inc.status.warschau} teamNoetig={false}
                   aeJeAbschluss={deals.ae_je_abschluss} fokus={null} />
            <Reise name="München" untertitel="VIP-Loge FC Bayern" farbe="bg-purple-700"
                   ziel={inc.ziele.muenchen} ist={inc.ae_gesamt}
                   srIst={inc.sr_mittel} srZiel={inc.ziele.muenchen.sr}
                   srNichtMessbar={inc.sr_nicht_messbar}
                   status={inc.status.muenchen} teamNoetig teamOk={inc.team_erreicht}
                   markerAnteil={inc.ziele.muenchen.ae ? pct(inc.ziele.warschau.ae, inc.ziele.muenchen.ae) : null}
                   markerLabel="Warschau-Ziel"
                   aeJeAbschluss={deals.ae_je_abschluss} fokus={fokus} />
          </div>

          {/* Teamgate */}
          <div className={`${card} mt-3`}>
            <div className={head}>
              <span className={headT}>Teamziel — Neukundenumsatz Bonn, je Monat {formatEuro(data.konfiguration.teamziel)}</span>
            </div>
            <div className="p-4">
              <div className="flex gap-4 flex-wrap">
                {inc.teamgate.map(g => (
                  <div key={g.monat} className="flex-1 min-w-[240px]">
                    <div className="flex justify-between text-xs">
                      <b>{g.monat}</b>
                      <span className="text-gray-500">{formatEuro(g.ae)} / {formatEuro(g.ziel)}</span>
                    </div>
                    <Balken anteil={pct(g.ae, g.ziel)} farbe={g.erreicht ? 'bg-green-600' : 'bg-amber-500'} hoehe="h-3" />
                    <div className="text-[11px] text-gray-400">
                      {g.erreicht ? '✓ erreicht' : `noch ${formatEuro(g.rest)}`}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                Beide Monate zählen einzeln — ein starker Monat gleicht einen schwachen nicht aus.
                München setzt beide voraus. Gerechnet wird der Neukunden-AE mit Closer-Standort Bonn
                im jeweiligen Abschlussmonat.
              </div>
            </div>
          </div>

          {/* Was die offenen Deals bedeuten */}
          <div className={`${card} mt-3`}>
            <div className={head}><span className={headT}>Was deine offenen Deals bedeuten</span></div>
            <div className="p-4 text-sm">
              Mit deinen <b>{inc.offene_messbasis.n} offenen Deals</b> ({formatEuro(inc.offene_messbasis.volumen)})
              landest du bei einer Closing-Rate von {Math.round(inc.ae_forecast.quote * 100)} % rechnerisch bei
              {' '}<b>{formatEuro(inc.ae_forecast.ae_forecast)}</b>
              {inc.ziele.warschau.ae != null && (
                <> — das wäre{' '}
                  <b className={inc.ae_forecast.ae_forecast >= inc.ziele.warschau.ae ? 'text-green-700' : 'text-amber-700'}>
                    {inc.ae_forecast.ae_forecast >= inc.ziele.warschau.ae ? 'über' : 'unter'} dem Warschau-Ziel
                  </b>
                  {inc.ziele.muenchen.ae != null && <> und{' '}
                    <b className={inc.ae_forecast.ae_forecast >= inc.ziele.muenchen.ae ? 'text-green-700' : 'text-amber-700'}>
                      {inc.ae_forecast.ae_forecast >= inc.ziele.muenchen.ae ? 'über' : 'unter'} dem München-Ziel
                    </b></>}
                </>
              )}.
              <div className="mt-2 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                Indikation aus dem offenen Bestand, keine Zusage.
                {inc.hinweis_direktsettings && <div className="mt-1">· {inc.hinweis_direktsettings}</div>}
                {inc.notiz && <div className="mt-1">· {inc.notiz}</div>}
              </div>
            </div>
          </div>

          {/* Monatsdetail */}
          <div className={`${card} mt-3`}>
            <div className={head}><span className={headT}>Monate im Detail</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <th className="px-3 py-2 text-left">Monat</th>
                  <th className="px-3 py-2 text-right">Auftragseingang</th>
                  <th className="px-3 py-2 text-right">Termine gelegt</th>
                  <th className="px-3 py-2 text-right">bewertet</th>
                  <th className="px-3 py-2 text-right">Show-Rate</th>
                  <th className="px-3 py-2 text-left">Stand</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {inc.monate.map(m => (
                    <tr key={m.monat} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 font-medium text-gray-800">{m.monat}</td>
                      <td className="px-3 py-1.5 text-right text-gray-700">{formatEuro(m.ae)}</td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{m.sr_gelegt}</td>
                      <td className="px-3 py-1.5 text-right text-gray-600">{m.sr_bewertet} ({m.sr_abdeckung} %)</td>
                      <td className={`px-3 py-1.5 text-right font-semibold ${m.sr_messbar ? 'text-gray-900' : 'text-gray-400'}`}>
                        {m.sr_messbar ? `${m.sr_rate} %` : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-gray-500">
                        {m.eingefroren ? 'eingefroren' : 'live'}
                        {!m.sr_messbar && m.sr_grund ? ` · ${m.sr_grund}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-500">
              Die Show-Rate ist das Mittel der messbaren Monate — ein Monat ohne gelegte Termine
              (Urlaub, Krankheit) zählt nicht als 0 %. Monate werden am {data.konfiguration.freeze_tag}. des
              Folgemonats eingefroren, damit nachgetragene Ausgänge noch zählen.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
