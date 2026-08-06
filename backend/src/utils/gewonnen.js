// Ableitung der Gewonnen-Felder — EINE Quelle der Wahrheit für nk/bk/vl.
//
// Hintergrund: gewonnen_monat ist die Buchungsachse der AE. Es darf niemals aus dem
// Request-Body übernommen oder auf NULL gesetzt werden, solange der Status Gewonnen ist,
// sondern immer deterministisch aus dem effektiven gewonnen_datum abgeleitet werden.
//
// Robust gegen die Postgres-Falle: DATE-Spalten kommen aus node-pg als JS-Date-Objekt
// zurück (kein Typparser gesetzt). Ein Date hat kein .slice — das alte gd.slice(0,7) warf
// deshalb bei Folge-Edits, bei denen der Body kein gewonnen_datum mitschickt. toYmd
// normalisiert String ('YYYY-MM-DD'), ISO-String und JS-Date einheitlich auf 'YYYY-MM-DD'.

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
function resolveGewonnenFelder(body, existing = null) {
  if (body.status === 'Gewonnen') {
    const gd = toYmd(body.gewonnen_datum) || toYmd(existing && existing.gewonnen_datum);
    if (!gd) {
      const err = new Error('Status "Gewonnen" erfordert ein gültiges Abschlussdatum (gewonnen_datum).');
      err.statusCode = 400;
      throw err;
    }
    return { gewonnen_datum: gd, gewonnen_monat: gd.slice(0, 7) };
  }
  return { gewonnen_datum: null, gewonnen_monat: null };
}

module.exports = { toYmd, resolveGewonnenFelder };
