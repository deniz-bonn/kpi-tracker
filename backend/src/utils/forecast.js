// Provisions-Forecast fuer "Mein Dashboard".
//
// ABGRENZUNG: Das hier ist eine INDIKATION, keine Zusage — und bewusst KEINE zweite
// Provisions-Engine. Gerechnet wird mit dem heute wirksamen Satz der Person auf die offenen
// Angebotswerte, gewichtet mit der Ziel-Closing-Rate. Keine Staffel-Spekulation: es wird nicht
// unterstellt, dass ein zusaetzlicher Abschluss die naechste Staffelstufe zuendet.
//
// Die Rollen-/Satz-Logik spiegelt positionenFor() in utils/provisionen.js (Stand 14.09.2026):
//   Opener == Setter (dieselbe Person, nicht AT) -> Pauschale opener_setter_pauschal
//   Opener  Bonn -> opener_satz · BS -> Fixbetrag (separat gebucht) · AT -> Staffel
//   Setter  Bonn/BS -> setter_satz · AT -> Staffel
//   Closer  Bonn/BS -> closer_basis bzw. closer_hoch ab Schwelle · AT -> closer_basis (flat_vl)
// Aendert sich dort etwas, muss es hier nachgezogen werden — deshalb steht die Quelle im Klartext.
const { configFor, kreisFor, staffelStatus } = require('./provisionen');

// Ziel-Closing-Rate auf offene Deals. Konfigurierbar, nicht hartkodiert (Vorgabe PRD).
const ZIEL_CLOSING_RATE = Number(process.env.FORECAST_CLOSING_RATE || 45) / 100;

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * @param empId      employees.id
 * @param standort   employees.standort (bestimmt den Abrechnungskreis)
 * @param offene     offene Deals der Person, je Deal { opener_id, setter_id, closer_id, wert }
 *                   `wert` ist der EUR-Angebotswert.
 * @param gebucht    bereits gebuchte Provision im laufenden Zeitraum
 */
async function provisionsForecast({ empId, standort, offene, gebucht, stichtag }) {
  const kreis = kreisFor(standort);
  const hinweise = [];
  if (!kreis) {
    return { quote: ZIEL_CLOSING_RATE, gebucht: r2(gebucht), potenzial: 0, forecast: r2(gebucht),
      anteile: [], hinweise: ['Für diesen Standort gibt es kein Provisionsmodul — kein Forecast.'] };
  }

  const cfg = await configFor(stichtag, kreis);
  const km  = String(stichtag).slice(0, 7);
  const ss  = await staffelStatus(km);
  const closerSatz = (ss.closers.find(c => c.employee_id === empId) || {}).satz
    ?? Number(cfg?.closer_basis ?? 0);
  const atOpenerSatz = (ss.atOpener.find(o => o.employee_id === empId) || {}).satz ?? 0;
  const atSetterSatz = (ss.atSetter.find(s => s.employee_id === empId) || {}).satz ?? 0;

  // Je Deal die Rolle(n) der Person bestimmen und den passenden Satz anlegen.
  const topf = {};   // rolle -> { satz, volumen }
  const add = (rolle, satz, wert) => {
    const t = (topf[rolle] = topf[rolle] || { rolle, satz: Number(satz) || 0, volumen: 0 });
    t.volumen = r2(t.volumen + (Number(wert) || 0));
  };

  for (const d of offene) {
    const wert = Number(d.wert) || 0;
    if (!wert) continue;
    const istO = String(d.opener_id) === String(empId);
    const istS = String(d.setter_id) === String(empId);
    const istC = String(d.closer_id) === String(empId);

    if (istO && istS && kreis !== 'oesterreich') {
      add('opener_setter', cfg?.opener_setter_pauschal, wert);
    } else {
      if (istO) {
        if (kreis === 'bonn')            add('opener', cfg?.opener_satz, wert);
        else if (kreis === 'braunschweig') add('opener_fix', 0, wert);      // 125 € je Call, bereits gebucht
        else                             add('opener_staffel', atOpenerSatz, wert);
      }
      if (istS) {
        if (kreis === 'oesterreich')     add('setter_staffel', atSetterSatz, wert);
        else                             add('setter', cfg?.setter_satz, wert);
      }
    }
    if (istC) add('closer', closerSatz, wert);
  }

  const anteile = Object.values(topf).map(t => ({
    ...t,
    // Nur der gewichtete Anteil des offenen Volumens wird als Potenzial gerechnet.
    potenzial: r2(t.volumen * ZIEL_CLOSING_RATE * (t.satz / 100)),
  }));

  if (topf.opener_fix) {
    hinweise.push('Als Opener in Braunschweig wirst du je Sales Call mit einem Fixbetrag vergütet — '
      + 'der ist bereits gebucht. Offene Deals bringen dir darüber hinaus keine zusätzliche Provision.');
  }
  if (topf.opener_staffel || topf.setter_staffel) {
    hinweise.push('Österreich rechnet über eine Staffel. Gerechnet ist dein aktuell wirksamer Satz — '
      + 'Näherung, die Staffel kann springen.');
  }

  const potenzial = r2(anteile.reduce((s, a) => s + a.potenzial, 0));
  return {
    quote: ZIEL_CLOSING_RATE, kreis,
    gebucht: r2(gebucht), potenzial, forecast: r2(Number(gebucht) + potenzial),
    anteile, hinweise,
  };
}

/** AE-Forecast fuers Incentive: schlicht der gewichtete offene Angebotswert. Gilt fuer ALLE Rollen. */
function aeForecast({ aeGebucht, offenesVolumen }) {
  const zusatz = r2((Number(offenesVolumen) || 0) * ZIEL_CLOSING_RATE);
  return { quote: ZIEL_CLOSING_RATE, ae_gebucht: r2(aeGebucht), zusatz,
    ae_forecast: r2(Number(aeGebucht) + zusatz) };
}

module.exports = { provisionsForecast, aeForecast, ZIEL_CLOSING_RATE };
