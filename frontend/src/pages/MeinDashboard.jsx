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

// ── Mitarbeiter-Sicht ────────────────────────────────────────────────────────
// Bekommt die Daten als Prop. Genau diese Komponente rendert auch "Sehen als …" — es gibt
// KEINE Admin-Variante der Sektionen. Saehe ein Mitarbeiter etwas Falsches, sieht der
// Kontrollierende exakt dasselbe Falsche.
function MitarbeiterSicht({ data, zeitraumId, setZeitraumId }) {
  const [auf, setAuf] = useState(null);          // welche Deal-Kachel ist aufgeklappt
  const [auszug, setAuszug] = useState(null);    // welcher Zeitraum zeigt seinen Kontoauszug

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

// ── Team-Überblick (für Superadmin / Vertriebsleitung) ───────────────────────
// Aggregiert NICHT selbst: jede Zeile kommt aus demselben Rechenweg wie die Einzelsicht
// (dashboardFuer je Person im Backend), hier wird nur projiziert und dargestellt.
function StatusChip({ status }) {
  if (!status) return <span className="text-gray-300">—</span>;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_CLASS[status] || STATUS_CLASS.offen}`}>
      {STATUS_TEXT[status] || status}
    </span>
  );
}

function TeamUeberblick({ onPerson }) {
  const [standort, setStandort] = useState('Bonn');
  const [sort, setSort] = useState('ziel');   // 'ziel' | 'name' | 'ae'

  const { data, isLoading } = useQuery({
    queryKey: ['mein-dashboard-team', standort],
    queryFn: () => meinDashboardApi.team(standort),
  });

  // Grösster Rückstand je Person — dieselbe Fokus-Logik wie in der Einzelsicht.
  const mitFokus = useMemo(() => (data?.zeilen || []).map(z => {
    const m = z.ziele?.muenchen;
    const aeL = m?.ae ? Math.max(0, 1 - (z.ae_gesamt || 0) / m.ae) : 0;
    const srL = (m?.sr && z.sr_mittel != null) ? Math.max(0, 1 - z.sr_mittel / m.sr) : 0;
    return { ...z, fokus: !z.hat_incentive ? null : (aeL === 0 && srL === 0) ? null : (srL > aeL ? 'Show-Rate' : 'Auftragseingang'),
      // Ohne Incentive-Ziel gibt es keine Luecke — solche Zeilen duerfen bei "Zielerreichung"
      // nicht wie Bestplatzierte oben stehen, sondern gehoeren ans Ende.
      fokusLuecke: z.hat_incentive ? Math.max(aeL, srL) : Infinity };
  }), [data]);

  const zeilen = useMemo(() => {
    const arr = [...mitFokus];
    if (sort === 'name') arr.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    else if (sort === 'ae') arr.sort((a, b) => (b.ae_gesamt || 0) - (a.ae_gesamt || 0));
    else arr.sort((a, b) => a.fokusLuecke - b.fokusLuecke);   // beste Zielerreichung zuerst
    return arr;
  }, [mitFokus, sort]);

  if (isLoading) return <div className="text-sm text-gray-400 py-10">Lade Team-Überblick…</div>;

  return (
    <div className="space-y-3 text-gray-900">
      {/* Teamgate — dieselbe Darstellung wie in der Mitarbeiter-Sicht */}
      {data?.teamgate?.length > 0 && (
        <div className={card}>
          <div className={head}>
            <span className={headT}>Teamziel — Neukundenumsatz Bonn, je Monat {formatEuro(data.konfiguration.teamziel)}</span>
          </div>
          <div className="p-4 flex gap-4 flex-wrap">
            {data.teamgate.map(g => (
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
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-gray-500">Standort</span>
        <select value={standort} onChange={e => setStandort(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5">
          {(data?.standorte || ['Bonn']).map(s => <option key={s} value={s}>{s}</option>)}
          <option value="alle">Alle Standorte</option>
        </select>
        <span className="text-[11px] text-gray-500 ml-3">Sortierung</span>
        <select value={sort} onChange={e => setSort(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5">
          <option value="ziel">Zielerreichung</option>
          <option value="ae">Auftragseingang</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <th className="px-3 py-2 text-left">Mitarbeiter</th>
              <th className="px-3 py-2 text-left">Messbasis</th>
              <th className="px-3 py-2 text-right">Provision</th>
              <th className="px-3 py-2 text-right">AE Sep+Okt</th>
              <th className="px-3 py-2 text-right">Show-Rate</th>
              <th className="px-3 py-2 text-right">AE-Forecast</th>
              <th className="px-3 py-2 text-center">Warschau</th>
              <th className="px-3 py-2 text-center">München</th>
              <th className="px-3 py-2 text-left">Fokus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {zeilen.length === 0
              ? <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Keine Vertriebler an diesem Standort.</td></tr>
              : zeilen.map(z => (
                  <tr key={z.employee_id} className="hover:bg-blue-50/40 cursor-pointer"
                      onClick={() => onPerson(z.employee_id)}
                      title="Sicht dieser Person öffnen">
                    <td className="px-3 py-1.5 font-medium text-gray-800">
                      {z.name}
                      {z.vorlaeufig && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">vorläufig</span>}
                    </td>
                    <td className="px-3 py-1.5 text-gray-600">
                      {z.messbasis || <span className="text-gray-300">kein Incentive</span>}
                      {z.showrate_art && <span className="text-gray-400"> · {z.showrate_art === 'setting' ? 'Setting' : 'Beratung'}</span>}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-700">{formatEuro(z.provision)}</td>
                    <td className="px-3 py-1.5 text-right font-medium text-gray-900">
                      {z.ae_gesamt != null ? formatEuro(z.ae_gesamt) : '—'}
                      {z.ziele?.warschau?.ae != null && (
                        <div className="text-[10px] text-gray-400">Ziel {formatEuro(z.ziele.warschau.ae)}</div>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {z.sr_mittel == null
                        ? <span className="text-gray-400" title="Datenbasis unzureichend oder keine Termine">—</span>
                        : <span className="font-medium">{z.sr_mittel} %</span>}
                      {z.ziele?.warschau?.sr != null && (
                        <div className="text-[10px] text-gray-400">Ziel {z.ziele.warschau.sr} %</div>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-600">
                      {z.ae_forecast != null ? formatEuro(z.ae_forecast) : '—'}
                    </td>
                    <td className="px-3 py-1.5 text-center"><StatusChip status={z.status?.warschau} /></td>
                    <td className="px-3 py-1.5 text-center"><StatusChip status={z.status?.muenchen} /></td>
                    <td className="px-3 py-1.5 text-gray-600">{z.fokus || <span className="text-green-700">—</span>}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-500">
          Zeile anklicken öffnet die Sicht dieser Person — exakt so, wie sie sie selbst sieht.
          Gelistet ist, wer für „Mein Dashboard" freigeschaltet ist.
          „—" bei der Show-Rate heißt: Datenbasis unzureichend oder keine Termine gelegt.
        </div>
      </div>

      {/* Incentive-Teilnehmer ohne Freischaltung wuerden sonst kommentarlos fehlen. */}
      {data?.nicht_freigeschaltet?.length > 0 && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2">
          <b>{data.nicht_freigeschaltet.length} Incentive-Teilnehmer sehen ihr Dashboard nicht</b> und
          stehen deshalb nicht in der Tabelle:
          <ul className="mt-1 space-y-0.5">
            {data.nicht_freigeschaltet.map(p => (
              <li key={p.employee_id}>· {p.name} — {p.grund}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Seite ────────────────────────────────────────────────────────────────────
export default function MeinDashboard() {
  const [zeitraumId, setZeitraumId] = useState(null);
  const [ansicht, setAnsicht] = useState(null);   // null = eigene Sicht · 'team' · employee_id

  const alsId = (ansicht && ansicht !== 'team') ? ansicht : null;
  const { data, isLoading, error } = useQuery({
    queryKey: ['mein-dashboard', zeitraumId, alsId],
    queryFn: () => meinDashboardApi.load(zeitraumId, alsId),
  });

  const sicht = data?.sicht;
  // Berechtigte ohne eigenen Mitarbeiter landen im Team-Überblick statt in der Sackgasse
  // "kein Mitarbeiter verknüpft".
  const zeigeTeam = ansicht === 'team'
    || (ansicht === null && !isLoading && !data?.employee && sicht?.fremdsicht_erlaubt);

  if (isLoading) return <div className="text-sm text-gray-400 py-10">Lade…</div>;
  if (error) return <div className="text-sm text-red-600 py-10">Konnte nicht geladen werden: {error.message}</div>;

  const auswahl = (
    sicht?.fremdsicht_erlaubt ? (
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500">Ansicht</span>
        <select
          value={zeigeTeam ? 'team' : (alsId ? String(alsId) : 'eigene')}
          onChange={e => {
            const v = e.target.value;
            setAnsicht(v === 'team' ? 'team' : v === 'eigene' ? null : Number(v));
          }}
          className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5 max-w-[220px]">
          <option value="team">Team-Überblick</option>
          {data?.employee && <option value="eigene">Meine eigene Sicht</option>}
          {(sicht.personen || []).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
    ) : null
  );

  if (zeigeTeam) {
    return (
      <div className="space-y-3 text-gray-900">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Team-Überblick</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Incentive- und Provisionsstand aller Vertriebler · Zeile anklicken öffnet die Sicht der Person
            </p>
          </div>
          {auswahl}
        </div>
        <TeamUeberblick onPerson={(id) => setAnsicht(id)} />
      </div>
    );
  }

  if (!data?.employee) {
    return (
      <div className="space-y-3">
        {auswahl}
        <div className="text-sm text-gray-500 py-10">
          {data?.hinweis || 'Kein Mitarbeiter mit diesem Account verknüpft.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(sicht?.fremdsicht_erlaubt || sicht?.als_fremde) && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Verwechslungsschutz: unmissverstaendlich, wessen Seite hier steht. */}
          {sicht?.als_fremde ? (
            <div className="flex items-center gap-3 flex-wrap bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
              <span className="text-xs text-amber-900">
                👁 <b>Ansicht als {data.employee.name}</b> — so sieht {data.employee.name.split(' ')[0]} seine Seite.
                Du siehst fremde Provisions- und Incentive-Daten.
              </span>
              <button onClick={() => setAnsicht('team')}
                      className="text-xs px-2 py-1 rounded border border-amber-400 text-amber-900 hover:bg-amber-100">
                ← Zum Team-Überblick
              </button>
            </div>
          ) : <div />}
          {auswahl}
        </div>
      )}
      <MitarbeiterSicht data={data} zeitraumId={zeitraumId} setZeitraumId={setZeitraumId} />
    </div>
  );
}
