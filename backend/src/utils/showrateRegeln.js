// Regeln der Show-Rate — EINE Stelle fuer die Show-Rate-Seite (routes/showrates.js) und das
// Live-Board (routes/board.js). Hintergrund und Begruendung im Kopf von routes/showrates.js:
//   Quote = stattgefunden / (stattgefunden + nicht_stattgefunden)
//   Gate  = (stattgefunden + nicht_stattgefunden + verschoben) / gelegt  >= MIN_BEWERTET %
//   und mindestens MIN_BASIS bewertbare Termine.
const MIN_BEWERTET = 50;     // Prozent der gelegten Termine mit Ausgang
const MIN_BASIS    = 10;     // und mindestens 10 bewertbare Termine

const quote = (ja, nein) => (ja + nein) > 0 ? Number((ja / (ja + nein) * 100).toFixed(1)) : null;

/** Zaehler -> { basis, gepflegt, rate, bewertetQuote, belastbar }. z: { gelegt, stattgefunden, nicht_stattgefunden, verschoben } */
function bewerte(z) {
  const statt = Number(z.stattgefunden) || 0, nicht = Number(z.nicht_stattgefunden) || 0;
  const basis = statt + nicht;
  const gepflegt = basis + (Number(z.verschoben) || 0);
  const gelegt = Number(z.gelegt) || 0;
  const bewertetQuote = gelegt > 0 ? Number((gepflegt / gelegt * 100).toFixed(1)) : null;
  return { basis, gepflegt, rate: quote(statt, nicht), bewertetQuote,
    belastbar: !!(basis >= MIN_BASIS && bewertetQuote !== null && bewertetQuote >= MIN_BEWERTET) };
}

module.exports = { MIN_BEWERTET, MIN_BASIS, quote, bewerte };
