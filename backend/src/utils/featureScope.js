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

// SQL liefert 0/1 (bzw. bigint in PG) — einmal zentral in Booleans wandeln, damit jeder Aufrufer
// mit === false pruefen kann statt mit Number(...) === 0.
const alsBool = (v, standard = true) => (v == null ? standard : Number(v) === 1);
const normPerson = (p) => ({
  id: p.id, name: p.name, rolle: p.rolle, standort: p.standort, user_id: p.user_id ?? null,
  hat_konto:      alsBool(p.hat_konto),
  konto_aktiv:    alsBool(p.konto_aktiv),
  freigeschaltet: alsBool(p.freigeschaltet),
});
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
  return (await db.all(
    `SELECT e.id, e.name, e.rolle, e.standort, MIN(u.id) AS user_id,
            1 AS hat_konto, 1 AS konto_aktiv, 1 AS freigeschaltet
       FROM employees e
       JOIN users u ON u.employee_id = e.id
      WHERE e.aktiv = ${T()} AND u.active = ${T()}
        AND ${freigeschaltetSql(ph(1), ph(2))}${wStandort}
      GROUP BY e.id, e.name, e.rolle, e.standort
      ORDER BY e.name`,
    params)).map(normPerson);
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

/**
 * ALLE dashboard-relevanten Mitarbeiter — unabhaengig von Freischaltung und Nutzerkonto.
 *
 * Fuer den vollen Kontroll-Scope (Superadmin und wer ausdruecklich gleichgestellt wurde).
 * Begruendung: Die Ansicht braucht nur die employee_id, keinen Login. Wer keinen Account hat oder
 * dessen Konto deaktiviert ist, hat trotzdem Deals, Provision und ggf. Incentive-Ziele — und genau
 * die soll die Kontrolle sehen koennen. Der Zustand wird nicht versteckt, sondern als Badge
 * ausgewiesen (hat_konto / konto_aktiv / freigeschaltet).
 *
 * "Relevant" = aktiver Mitarbeiter mit NK-Beteiligung (als Opener, Setter oder Closer) ODER
 * mit einem Incentive-Ziel.
 */
async function alleRelevantenPersonen(feature, { standort = null } = {}) {
  const ph = (n) => (pg() ? `$${n}` : '?');
  // Reihenfolge der Parameter MUSS der Reihenfolge im SQL entsprechen (SQLite bindet positionell).
  const params = [feature, feature];
  let wStandort = '';
  if (standort) { wStandort = ` AND e.standort = ${ph(3)}`; params.push(standort); }
  return (await db.all(
    `SELECT e.id, e.name, e.rolle, e.standort, MIN(u.id) AS user_id,
            MAX(CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END) AS hat_konto,
            MAX(CASE WHEN u.active = ${T()} THEN 1 ELSE 0 END) AS konto_aktiv,
            MAX(CASE WHEN u.active = ${T()} AND ${freigeschaltetSql(ph(1), ph(2))}
                     THEN 1 ELSE 0 END) AS freigeschaltet
       FROM employees e
       LEFT JOIN users u ON u.employee_id = e.id
      WHERE e.aktiv = ${T()}${wStandort}
        AND ( EXISTS (SELECT 1 FROM deals_nk d
                       WHERE d.opener_id = e.id OR d.setter_id = e.id OR d.closer_id = e.id)
           OR EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id) )
      GROUP BY e.id, e.name, e.rolle, e.standort
      ORDER BY e.name`,
    params)).map(normPerson);
}

/** Ist dieser Mitarbeiter ueberhaupt dashboard-relevant? (Validierung fuer den vollen Scope.) */
async function istRelevant(employeeId) {
  if (!employeeId) return false;
  const ph = (n) => (pg() ? `$${n}` : '?');
  const r = await db.get(
    `SELECT 1 AS ok FROM employees e
      WHERE e.aktiv = ${T()} AND e.id = ${ph(1)}
        AND ( EXISTS (SELECT 1 FROM deals_nk d
                       WHERE d.opener_id = e.id OR d.setter_id = e.id OR d.closer_id = e.id)
           OR EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id) )
      LIMIT 1`, [employeeId]);
  return !!r;
}

module.exports = { freigeschaltetePersonen, istFreigeschaltet, alleRelevantenPersonen, istRelevant };
