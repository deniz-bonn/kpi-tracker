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
 * Das `datum` darf nachträglich nur von berechtigten Rollen geändert werden.
 * Standard: nur Admin/Superadmin (NK/BK). VL übergibt eine erweiterte Rollenliste,
 * damit Account Manager (bk_vertrieb) fehlerhafte Import-Daten selbst korrigieren können.
 * Geprüft wird ausschliesslich eine TATSÄCHLICHE Änderung: wer `datum` unverändert
 * mitsendet, läuft unbehindert durch.
 *
 * @param {string[]} allowedRoles Rollen, die das Datum nachträglich ändern dürfen
 * @returns {string|null} Fehlermeldung, wenn die Änderung unzulässig ist, sonst null
 */
function pruefeDatumsaenderung(req, existing, allowedRoles = ['admin', 'superadmin']) {
  if (!existing) return null;                       // 404 behandelt der Aufrufer
  if (req.body.datum === undefined) return null;    // nicht mitgesendet -> nichts zu prüfen
  const neu = dayStr(req.body.datum);
  const alt = dayStr(existing.datum);
  if (neu === alt) return null;                     // unverändert
  if (allowedRoles.includes(req.user?.role)) return null;
  return 'Keine Berechtigung, das Datum nachträglich zu ändern.';
}

// NK: erkennt einen "Kein Angebot erstellt"-Deal aus dem Request-Body (Boolean/0-1/'nein' robust).
function istKeinAngebot(body) {
  const v = body.angebot_erstellt;
  return v === false || v === 0 || v === '0' || v === 'nein' || v === 'false';
}

// NK-Schutzregeln fuer "kein Angebot": Gewonnen ist gesperrt (erst Angebot=Ja setzen),
// Grund ist Pflicht, "Sonstiges" erzwingt Freitext. Gibt Fehlermeldung oder null.
function pruefeKeinAngebot(body) {
  if (!istKeinAngebot(body)) return null;
  if (body.status === 'Gewonnen')
    return "Für einen Deal ohne Angebot ist der Status 'Gewonnen' nicht möglich — bitte zuerst 'Angebot erstellt' auf Ja setzen.";
  if (!body.kein_angebot_grund)
    return 'Bitte einen Grund angeben, warum kein Angebot erstellt wurde.';
  if (body.kein_angebot_grund === 'sonstiges' && !String(body.kein_angebot_grund_text || '').trim())
    return "Bei 'Sonstiges' bitte einen Freitext-Grund angeben.";
  return null;
}

module.exports = { dayStr, pruefeDatumsaenderung, istKeinAngebot, pruefeKeinAngebot };
