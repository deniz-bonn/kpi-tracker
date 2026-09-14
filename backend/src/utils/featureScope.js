// Wer ist fuer ein Feature effektiv freigeschaltet?
//
// DAS IST DIE EINE WAHRHEIT fuer beide Seiten der Kontroll-Sicht:
//   · welche Personen im "Aus der Sicht von"-Dropdown stehen
//   · und gegen welche Menge ?als=<employee_id> serverseitig validiert wird.
// Das Dropdown zu filtern reicht nicht — sonst koennte man am Dropdown vorbei eine Person
// oeffnen, die den Bereich selbst gar nicht sieht. Beide Seiten fragen deshalb hier.
//
// Die Regel spiegelt hatFeature() in middleware/requireFeature.js: Superadmin ist strukturell
// freigeschaltet, sonst zaehlt die Rolle (feature_flags) ODER die Einzel-Freischaltung
// (feature_flag_users). Zusaetzlich muss die Person greifbar sein: verknuepftes Nutzerkonto,
// Konto aktiv, Mitarbeiter aktiv. Wer sich nicht einloggen kann, ist fuer den Bereich nicht
// freigeschaltet — und taucht folgerichtig auch in keiner Kontroll-Sicht auf.
const db = require('../db');

const pg = () => db.dialect === 'postgres';
const T  = () => (pg() ? 'TRUE' : '1');

/**
 * Bedingung "dieser User ist fuer das Feature freigeschaltet".
 * @param phFeatureRolle  Platzhalter fuer das Feature in der Rollen-Pruefung
 * @param phFeatureUser   Platzhalter fuer das Feature in der Einzel-Pruefung
 *                        (Postgres braucht zwei verschiedene Nummern, SQLite zweimal '?')
 */
const freigeschaltetSql = (phFeatureRolle, phFeatureUser) => `(
     u.role = 'superadmin'
  OR EXISTS (SELECT 1 FROM feature_flags      ff  WHERE ff.feature  = ${phFeatureRolle} AND ff.role     = u.role)
  OR EXISTS (SELECT 1 FROM feature_flag_users ffu WHERE ffu.feature = ${phFeatureUser}  AND ffu.user_id = u.id)
)`;

/**
 * Alle Mitarbeiter, die fuer `feature` effektiv freigeschaltet sind.
 * @returns {Promise<Array<{id,name,rolle,standort,user_id}>>}
 */
async function freigeschaltetePersonen(feature, { standort = null } = {}) {
  const ph = (n) => (pg() ? `$${n}` : '?');
  const params = [feature, feature];
  let wStandort = '';
  if (standort) { wStandort = ` AND e.standort = ${ph(3)}`; params.push(standort); }
  return db.all(
    `SELECT e.id, e.name, e.rolle, e.standort, MIN(u.id) AS user_id
       FROM employees e
       JOIN users u ON u.employee_id = e.id
      WHERE e.aktiv = ${T()} AND u.active = ${T()}
        AND ${freigeschaltetSql(ph(1), ph(2))}${wStandort}
      GROUP BY e.id, e.name, e.rolle, e.standort
      ORDER BY e.name`,
    params);
}

/** Ist genau dieser Mitarbeiter fuer `feature` freigeschaltet? Dieselbe Regel, eine Zeile. */
async function istFreigeschaltet(employeeId, feature) {
  if (!employeeId) return false;
  const ph = (n) => (pg() ? `$${n}` : '?');
  // ACHTUNG Platzhalter-Reihenfolge: Postgres bindet nach Nummer ($1/$2/$3), SQLite rein nach
  // POSITION im SQL. Die Parameter muessen deshalb in derselben Reihenfolge stehen, in der die
  // Platzhalter im Text vorkommen — sonst landet unter SQLite die employee_id im Feature-Vergleich
  // und die Pruefung sagt immer "nein". (Genau so passiert, in Postgres unsichtbar.)
  const r = await db.get(
    `SELECT 1 AS ok
       FROM employees e JOIN users u ON u.employee_id = e.id
      WHERE e.aktiv = ${T()} AND u.active = ${T()}
        AND ${freigeschaltetSql(ph(1), ph(2))}
        AND e.id = ${ph(3)}
      LIMIT 1`,
    [feature, feature, employeeId]);
  return !!r;
}

module.exports = { freigeschaltetePersonen, istFreigeschaltet };
