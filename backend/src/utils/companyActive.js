const db = require('../db');

// SQL-Bedingung: Deal gehört zu einer bereits aktiven Company.
// Companies mit aktiv_ab in der Zukunft (z.B. Risem bis 2026-08-01) werden komplett
// aus Auswertungen/Dashboard/Listen ausgeblendet — abhängig vom HEUTIGEN Datum,
// nicht vom Deal-Monat. Ab dem Stichtag erscheinen alle ihre Deals schlagartig.
// Erfordert die company_id-Spalte unter dem angegebenen Alias.
function activeCompanySql(alias = 'd') {
  const today = db.dialect === 'postgres' ? 'CURRENT_DATE' : "date('now')";
  return `(${alias}.company_id NOT IN (SELECT id FROM companies WHERE aktiv_ab IS NOT NULL AND aktiv_ab > ${today}))`;
}

module.exports = { activeCompanySql };
