// ── Rollen-Gruppen (Backend-Spiegel von frontend/src/utils/rollen.js) ────────
//
// SPIEGEL-DATEI: Inhalt und Semantik muessen mit frontend/src/utils/rollen.js uebereinstimmen.
// Getrennt, weil das Frontend ESM (`export const`) und das Backend CommonJS ist — require()
// auf die Frontend-Datei ist nicht moeglich. Aendert sich dort eine Rolle, muss sie hier nach.
// (Gleiches Muster und derselbe Warnhinweis wie in utils/forecast.js gegenueber positionenFor.)
//
// Warum das Backend die Liste ueberhaupt braucht (frueher tat es das nicht):
//   1. Der BK-Provisionskreis zahlt an den KAM des Deals — wer empfangsberechtigt ist, ist eine
//      Rollen-Frage und darf nicht als Literal in der Engine stehen.
//   2. Der VL-CSV-Import mappte KAM-Namen ueber "WHERE rolle='KAM'" und liess damit
//      Closer-KAM, Account Manager und Multi mit kam_id=NULL zurueck. Solange kam_id nur
//      Zuordnung war, war das kosmetisch — seit dem BK-Kreis ist es entgangene Provision.

const ROLLE_GRUPPEN = { kam: ['KAM', 'Closer-KAM'], am: ['Account Manager'] };
const ROLLE_GRUPPE_LABEL = { kam: 'Key Account Manager', am: 'Account Manager' };

const rolleGruppe = (rolle) =>
  ROLLE_GRUPPEN.kam.includes(rolle) ? 'kam' : ROLLE_GRUPPEN.am.includes(rolle) ? 'am' : null;

/**
 * Gruppe eines Mitarbeiters. 'Multi' ist mehrdeutig und wird per employees.bk_gruppe
 * ('kam'|'am'|null) explizit zugeordnet (Mitarbeiterverwaltung) — ohne Zuordnung: null.
 * @returns {'kam'|'am'|null}
 */
const gruppeVonEmp = (e) =>
  !e ? null
     : (e.rolle === 'Multi'
         ? (e.bk_gruppe === 'kam' || e.bk_gruppe === 'am' ? e.bk_gruppe : null)
         : rolleGruppe(e.rolle));

// Rollen, die einen Bestandskunden-/Verlaengerungs-Deal als KAM verantworten koennen.
// Bewusst breit inkl. Account Manager + Multi — das ist die ERFASSUNGS-Liste (wer darf im
// Formular/Import als KAM stehen), NICHT die Empfaengerliste der Provision. Empfangsberechtigt
// ist, wer eine Gruppe hat: gruppeVonEmp(e) !== null.
const KAM_ROLLEN = ['KAM', 'Closer-KAM', 'Account Manager', 'Multi'];

/** SQL-Fragment `rolle IN ('KAM','Closer-KAM',...)` — fuer Lookups im Import. */
const kamRollenSql = () => KAM_ROLLEN.map(r => `'${r.replace(/'/g, "''")}'`).join(',');

module.exports = { ROLLE_GRUPPEN, ROLLE_GRUPPE_LABEL, rolleGruppe, gruppeVonEmp, KAM_ROLLEN, kamRollenSql };
