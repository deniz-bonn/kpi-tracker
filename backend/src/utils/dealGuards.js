/**
 * Gemeinsame Schutzregeln für Deal-Updates (NK / BK / VL).
 */

// Datum aus DB oder Body auf YYYY-MM-DD normalisieren.
// Postgres liefert DATE als JS-Date bzw. ISO-String, SQLite als TEXT.
function dayStr(v) {
  if (!v) return null;
  if (v instanceof Date) {
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  }
  return String(v).slice(0, 10);
}

/**
 * Das Angebotsdatum (`datum`) darf nachträglich nur ein Admin/Superadmin ändern —
 * so wie es die Oberfläche anzeigt. Geprüft wird ausschliesslich eine TATSÄCHLICHE
 * Änderung: alle Bearbeiter senden `datum` unverändert mit, deren Updates laufen
 * also unbehindert durch.
 *
 * @returns {string|null} Fehlermeldung, wenn die Änderung unzulässig ist, sonst null
 */
function pruefeDatumsaenderung(req, existing) {
  if (!existing) return null;                       // 404 behandelt der Aufrufer
  if (req.body.datum === undefined) return null;    // nicht mitgesendet -> nichts zu prüfen
  const neu = dayStr(req.body.datum);
  const alt = dayStr(existing.datum);
  if (neu === alt) return null;                     // unverändert
  if (['admin', 'superadmin'].includes(req.user?.role)) return null;
  return 'Das Datum darf nur ein Admin nachträglich ändern.';
}

module.exports = { dayStr, pruefeDatumsaenderung };
