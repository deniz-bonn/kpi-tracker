// ── Rollen-Gruppen für die Bereichs-Vergleiche (Bestandskunden BK + Verlängerungen VL) ──
// EINE zentrale Zuordnung, damit die Gruppen-Definition nicht über die Seiten verstreut ist.
//
// Gruppiert wird nach der AKTUELLEN Rolle des Deal-KAMs (employees.rolle des kam_id). Bei einem
// Rollenwechsel wandern auch historische Deals in die neue Gruppe — kein Rollen-Verlauf, für den
// Vergleichszweck bewusst ausreichend.
export const ROLLE_GRUPPEN = { kam: ['KAM', 'Closer-KAM'], am: ['Account Manager'] };
export const ROLLE_GRUPPE_LABEL = { kam: 'Key Account Manager', am: 'Account Manager' };

export const rolleGruppe = (rolle) =>
  ROLLE_GRUPPEN.kam.includes(rolle) ? 'kam' : ROLLE_GRUPPEN.am.includes(rolle) ? 'am' : null;

// Gruppe eines Mitarbeiters: KAM/Closer-KAM -> kam, Account Manager -> am. 'Multi' ist mehrdeutig und
// wird per employees.bk_gruppe ('kam'|'am'|null) explizit zugeordnet (Mitarbeiterverwaltung).
// Hinweis: bk_gruppe ist die allgemeine Gruppen-Zuordnung der Person und gilt auch im VL-Bereich —
// es gibt bewusst kein separates vl_gruppe, eine Person gehört zu genau einer Gruppe.
export const gruppeVonEmp = (e) =>
  !e ? null
     : (e.rolle === 'Multi'
         ? (e.bk_gruppe === 'kam' || e.bk_gruppe === 'am' ? e.bk_gruppe : null)
         : rolleGruppe(e.rolle));

// Rollen, die einen Bestandskunden-/Verlängerungs-Deal als KAM verantworten können (Deal-Formular).
// Bewusst breit inkl. Account Manager + Multi, damit für diese Deals angelegt/bearbeitet werden können.
export const KAM_ROLLEN = ['KAM', 'Closer-KAM', 'Account Manager', 'Multi'];

// Optgroup-Reihenfolge für Personen-Dropdowns (identisch in BK und VL).
export const PERSONEN_GRUPPEN = [['kam', 'Key Account Manager'], ['am', 'Account Manager'], [null, 'Weitere']];
