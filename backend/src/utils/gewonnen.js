// Ableitung der Gewonnen-Felder — EINE Quelle der Wahrheit für nk/bk/vl.
//
// Hintergrund: gewonnen_monat ist die Buchungsachse der AE. Es darf niemals aus dem
// Request-Body übernommen oder auf NULL gesetzt werden, solange der Status Gewonnen ist,
// sondern immer deterministisch aus dem effektiven gewonnen_datum abgeleitet werden.
//
// toYmd normalisiert String ('YYYY-MM-DD'), ISO-String und JS-Date einheitlich auf 'YYYY-MM-DD'.
// Seit 12.10.2026 liefert db/index.js DATE-Spalten prozessweit als 'YYYY-MM-DD'-String
// (setTypeParser 1082); der Date-Zweig bleibt fuer Bodies, Alt-Audit-Eintraege und Backups
// in ISO-Form sowie fuer Verbindungen ohne den Parser (Standalone-Skripte).

const { heuteBerlin, datumDe } = require('./heute');

function toYmd(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    // Lokale Komponenten (kein UTC-Shift) — konsistent zum CSV-Export.
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  }
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// Leitet { gewonnen_datum, gewonnen_monat } ab.
// Effektives Datum = Body-Datum, sonst DB-Bestand (existing) — beides normalisiert.
// Status Gewonnen ohne effektives Datum ist nicht speicherbar -> wirft 400.
// Status Umgestellt (nur VL, Dauer-RaaS) leitet aus dauervertrag_datum ab -> siehe unten.
//
// ZUKUNFTSSPERRE (20.10.2026): Bei Status Gewonnen darf gewonnen_datum nicht nach heute (Berlin)
// liegen — ein Deal ist an dem Tag gewonnen, an dem er gewonnen WURDE. Anlass: Ein VL-Deal der
// Oktober-Kohorte trug ein November-Datum (Vorbelegung aus dem Ende der Kuendigungsfrist) und
// erschien in der Monatsuebersicht als Zukunftsmonat mit 100 % Anteil. Die VL-Regel vom 10.08.
// ("verstreicht der Tag ohne Kuendigung, gilt sie AN DEM TAG als gewonnen") deckt sich damit:
// vor Fristende ist eine Verlaengerung nur gewonnen, wenn der Kunde schon zugesagt hat — dann
// heute. Die Sperre gilt NUR fuer Gewonnen: dauervertrag_datum (Umgestellt), datum, Kuendigungs-
// und Fristdaten duerfen weiter in der Zukunft liegen.
// Sie trifft jeden Schreibweg, der hier durchlaeuft (NK/BK/VL POST+PUT, Willkommensmeeting,
// Anlage des Dauer-RaaS-Deals), und zwar VOR dem Schreiben — ein 400 hinterlaesst nichts Halbes.
// Ein Bestandsdeal mit Zukunftsdatum wird erst nach der Korrektur wieder speicherbar; das Feld
// steht im selben Dialog, die Meldung nennt beide Daten.
function resolveGewonnenFelder(body, existing = null, heute = heuteBerlin()) {
  // VL-Sonderfall "Umgestellt" (Dauer-RaaS): der Deal ist NICHT gewonnen, braucht aber trotzdem
  // eine Monatsachse — sonst verliert er sie hier (der Zweig unten nullt beide Felder) und ist in
  // keiner Monatssicht mehr auffindbar. gewonnen_monat ist die generische Ereignisachse, nicht
  // "der Monat des Gewinns": fuer die Umstellung ist das Ereignis der Umstellungstag.
  // AE zieht der Deal dadurch NICHT — jede AE-Summe filtert zusaetzlich auf status='Gewonnen'.
  if (body.status === 'Umgestellt') {
    const dd = toYmd(body.dauervertrag_datum) || toYmd(existing && existing.dauervertrag_datum);
    if (!dd) {
      const err = new Error('Status "Umgestellt" erfordert ein Umstellungsdatum (dauervertrag_datum).');
      err.statusCode = 400;
      throw err;
    }
    return { gewonnen_datum: dd, gewonnen_monat: dd.slice(0, 7) };
  }
  if (body.status === 'Gewonnen') {
    const gd = toYmd(body.gewonnen_datum) || toYmd(existing && existing.gewonnen_datum);
    if (!gd) {
      const err = new Error('Status "Gewonnen" erfordert ein gültiges Abschlussdatum (gewonnen_datum).');
      err.statusCode = 400;
      throw err;
    }
    if (gd > heute) {
      const err = new Error(`Gewonnen-Datum liegt in der Zukunft (${datumDe(gd)}) — erlaubt ist höchstens heute (${datumDe(heute)}).`);
      err.statusCode = 400;
      throw err;
    }
    return { gewonnen_datum: gd, gewonnen_monat: gd.slice(0, 7) };
  }
  return { gewonnen_datum: null, gewonnen_monat: null };
}

module.exports = { toYmd, resolveGewonnenFelder };
