const db = require('../db');

// ── Zentrale Gruppen-Scope-Regel ─────────────────────────────────────────────
// Welche Standorte zaehlen in Gruppen-Summen (Gesamt-Auftragseingang) und Zielerreichung?
// EINE Quelle: die Firma des Standorts (companies). Ein Standort zaehlt in Monat M, wenn seine Firma
//   - zaehlt_in_gruppe gesetzt hat (Migration 095, gilt fuer alle Monate) ODER
//   - gruppe_ab_monat <= M hat (Migration 115, Beitritt ab einem Monat; fruehere Monate bleiben draussen).
// Schweiz (HiOffice CH, ehem. Risem) zaehlt ab 2026-11. Dashboard, Mail und Auswertungen fragen die
// Regel je Monat ab -> ein Beitritt ist reine Konfiguration.
//
// Standorte ohne Zuordnung ('' / NULL, z. B. inaktive Accounts) sind bewusst NICHT in der Gruppe
// (analog Dashboard: nur Bonn/Braunschweig/Oesterreich zaehlen).
const GRUPPE_FALLBACK = ['Bonn', 'Braunschweig', 'Österreich'];

/** Laedt die Regel einmal und liefert monat ('YYYY-MM') -> Liste der Gruppen-Standorte. */
async function gruppenRegel() {
  let rows;
  try {
    rows = await db.all(
      `SELECT DISTINCT e.standort AS s, c.zaehlt_in_gruppe AS immer, c.gruppe_ab_monat AS ab
         FROM employees e JOIN companies c ON c.id = e.company_id
        WHERE e.standort IS NOT NULL AND e.standort <> ''`);
  } catch (e) {
    // Spalte fehlt (Aufruf vor Migration 095/115): auf die dokumentierte Default-Gruppe zurueckfallen.
    return () => GRUPPE_FALLBACK;
  }
  const wahr = v => v === true || v === 1 || v === '1' || v === 't';
  return (monat) => {
    const list = [...new Set(rows
      .filter(r => wahr(r.immer) || (r.ab && monat && monat >= String(r.ab).slice(0, 7)))
      .map(r => r.s))];
    return list.length ? list : GRUPPE_FALLBACK;   // leere DB -> sichere Default-Gruppe
  };
}

/** Gruppen-Standorte fuer einen Monat ('YYYY-MM'). */
async function gruppenStandorte(monat) {
  return (await gruppenRegel())(monat);
}

module.exports = { gruppenStandorte, gruppenRegel, GRUPPE_FALLBACK };
