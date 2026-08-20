const db = require('../db');

// ── Zentrale Gruppen-Scope-Regel ─────────────────────────────────────────────
// Welche Standorte zaehlen in Gruppen-Summen (Gesamt-Auftragseingang) und Zielerreichung?
// EINE Quelle: companies.zaehlt_in_gruppe (Migration 095). Ein Standort zaehlt, wenn seine Firma
// das Flag gesetzt hat. Risem (Schweiz) ist vorerst NICHT in der Gruppe -> wird angezeigt, aber
// nicht in Gesamt/Ziel gezaehlt. Kommt die Schweiz spaeter voll dazu: Flag der Firma auf TRUE
// (Konfiguration), Dashboard, Mail und Auswertungen ziehen automatisch nach.
//
// Standorte ohne Zuordnung ('' / NULL, z. B. inaktive Accounts) sind bewusst NICHT in der Gruppe
// (analog Dashboard: nur Bonn/Braunschweig/Oesterreich zaehlen).
const GRUPPE_FALLBACK = ['Bonn', 'Braunschweig', 'Österreich'];

async function gruppenStandorte() {
  try {
    const wahr = db.dialect === 'postgres' ? 'c.zaehlt_in_gruppe' : 'c.zaehlt_in_gruppe = 1';
    const rows = await db.all(
      `SELECT DISTINCT e.standort AS s
         FROM employees e JOIN companies c ON c.id = e.company_id
        WHERE ${wahr} AND e.standort IS NOT NULL AND e.standort <> ''`);
    const list = rows.map(r => r.s).filter(Boolean);
    return list.length ? list : GRUPPE_FALLBACK;   // leere DB -> sichere Default-Gruppe
  } catch (e) {
    // Spalte fehlt (Aufruf vor Migration 095): auf die dokumentierte Default-Gruppe zurueckfallen.
    return GRUPPE_FALLBACK;
  }
}

module.exports = { gruppenStandorte, GRUPPE_FALLBACK };
