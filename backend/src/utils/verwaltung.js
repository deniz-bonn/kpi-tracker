// ── Delegierbare Verwaltungsrechte: Mitarbeiter- und Benutzerverwaltung ──────────────────────
//
// EINE Regel fuer beide Seiten: die Routen (employees.js, admin.js) setzen sie durch, und
// GET /api/feature-flags liefert der Oberflaeche dasselbe Ergebnis, damit Menuepunkte, gesperrte
// Felder und die Rollen-Auswahl nicht nachgebaut werden muessen. Die Oberflaeche ist nur die
// Sichtbarkeit — entschieden wird hier.
//
//   Superadmin                                    -> alles (implizit, ohne Flag)
//   Rollenfreigabe ODER Einzelfreigabe '<bereich>' -> alle Standorte
//   Einzelfreigabe '<bereich>_eigener_standort'    -> nur der Standort des eigenen Mitarbeiters
//                                                    (ohne Verknuepfung/Standort: wirkungslos)
//
// Stufen ("ebene"): superadmin > admin > delegiert. Die Leitplanken (Entscheidung 30.10.2026):
//   · admin/superadmin vergeben und Admin-/Superadmin-Konten anfassen: nur Superadmin.
//   · Kein Konto aendert seine eigene Rolle (auch kein Superadmin — Aussperr-Schutz).
//   · Delegierte vergeben nur Vertriebsrollen bis zur eigenen Rangstufe und fassen keine Konten
//     oberhalb ihrer Stufe an, keine Konten mit Einzel-Freigaben (Passwort-Reset = Kontouebernahme
//     samt dieser Freigaben) und nicht ihr eigenes.
//   · Rolle/Standort/Company/BK-Gruppe eines Mitarbeiters bestimmen seinen Provisionskreis
//     (kreisFor(employees.standort)). Sobald Deals oder Provisionsbuchungen an ihm haengen,
//     aendert sie nur noch der Superadmin — sonst verschiebt ein Standortwechsel beim naechsten
//     Neuberechnen Geld zwischen den Kreisen.
// Die Zugriffssteuerung selbst (feature_flags*) bleibt Superadmin — siehe routes/feature_flags.js.
const db = require('../db');
const { hatFeature, hatEinzelFreigabe } = require('../middleware/requireFeature');

const pg = () => db.dialect === 'postgres';
const ph = (n) => (pg() ? `$${n}` : '?');

const BEREICHE = { mitarbeiter: 'mitarbeiter_verwaltung', benutzer: 'benutzer_verwaltung' };
const standortFeature = (feature) => `${feature}_eigener_standort`;
const VERWALTUNG_FEATURES = Object.values(BEREICHE);
const STANDORT_FEATURES   = VERWALTUNG_FEATURES.map(standortFeature);

// Vertriebsrollen, die ueberhaupt delegiert vergeben werden koennen, mit Rangstufe.
// Ein Delegierter vergibt und bearbeitet nur bis zur eigenen Stufe.
const RANG = { nk_vertrieb: 1, bk_vertrieb: 1, backoffice: 2, vertriebsleitung: 3 };
const VERTRIEBSROLLEN = Object.keys(RANG);
const ALLE_ROLLEN = ['superadmin', 'admin', ...VERTRIEBSROLLEN];

// Mitarbeiter-Felder, die auf die Provisions-Zuordnung wirken.
const PROV_FELDER = ['rolle', 'standort', 'company_id', 'bk_gruppe'];

const ebeneVon = (role) => (role === 'superadmin' ? 'superadmin' : role === 'admin' ? 'admin' : 'delegiert');

/** Standort des mit dem Konto verknuepften Mitarbeiters — aus der DB, nicht aus dem JWT. */
async function eigenerMitarbeiter(userId) {
  return db.get(
    `SELECT e.id, e.standort FROM users u JOIN employees e ON e.id = u.employee_id WHERE u.id = ${ph(1)}`,
    [userId]);
}

/**
 * Was darf dieser Nutzer im Bereich ('mitarbeiter' | 'benutzer')?
 * @returns null (kein Recht) oder { ebene, scope: 'alle'|'standort', standort, eigeneEmployeeId, rollen }
 */
async function verwaltungsZugriff(user, bereich) {
  if (!user) return null;
  const feature = BEREICHE[bereich];
  const ebene = ebeneVon(user.role);
  let scope = null;
  if (ebene === 'superadmin' || await hatFeature(user, feature)) scope = 'alle';
  else if (await hatEinzelFreigabe(user, standortFeature(feature))) scope = 'standort';
  if (!scope) return null;

  const eigen = await eigenerMitarbeiter(user.id);
  const standort = eigen?.standort || null;
  if (scope === 'standort' && !standort) return null;   // fail closed

  const rollen = ebene === 'superadmin' ? ALLE_ROLLEN
    : ebene === 'admin' ? VERTRIEBSROLLEN
    : VERTRIEBSROLLEN.filter((r) => RANG[r] <= (RANG[user.role] || 0));
  return { ebene, scope, standort, eigeneEmployeeId: eigen?.id ?? null, rollen };
}

/** Middleware: setzt req.verwaltung; 403 ohne Recht. */
const requireVerwaltung = (bereich) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    req.verwaltung = await verwaltungsZugriff(req.user, bereich);
    if (!req.verwaltung) return res.status(403).json({ error: 'Kein Zugriff auf dieses Feature' });
    next();
  } catch (e) { next(e); }
};

/** Liste der Mitarbeiter-IDs (aus `ids`), an denen Deals oder Provisionsbuchungen haengen. */
async function mitarbeiterMitBuchungen(ids) {
  const liste = [...new Set(ids.map(Number).filter(Boolean))];
  if (!liste.length) return new Set();
  const inList = liste.join(',');   // nur Zahlen — sicher interpolierbar
  const rows = await db.all(
    `SELECT e.id FROM employees e
      WHERE e.id IN (${inList})
        AND ( EXISTS (SELECT 1 FROM deals_nk d WHERE d.opener_id = e.id OR d.setter_id = e.id OR d.closer_id = e.id)
           OR EXISTS (SELECT 1 FROM deals_bk d WHERE d.kam_id = e.id)
           OR EXISTS (SELECT 1 FROM deals_vl d WHERE d.kam_id = e.id)
           OR EXISTS (SELECT 1 FROM provision_buchungen b WHERE b.employee_id = e.id) )`, []);
  return new Set(rows.map((r) => Number(r.id)));
}

/**
 * Darf `z` (Zugriff) den Mitarbeiter `emp` bearbeiten? Liefert null (ja) oder einen Sperrgrund.
 * `hatBuchungen` steuert nur die Provisions-Felder und wird separat ausgewertet.
 */
function mitarbeiterSperre(z, emp) {
  if (z.ebene === 'superadmin') return null;
  if (z.eigeneEmployeeId && Number(emp.id) === Number(z.eigeneEmployeeId)) {
    return 'Den eigenen Mitarbeiter-Datensatz ändert nur der Superadmin.';
  }
  if (z.scope === 'standort' && emp.standort !== z.standort) {
    return `Nur Mitarbeiter am eigenen Standort (${z.standort}).`;
  }
  return null;
}

const PROV_SPERRE = 'An diesem Mitarbeiter hängen Deals oder Provisionsbuchungen — Rolle, Standort und Company ändert nur der Superadmin (wirkt auf die Provisions-Zuordnung).';

/** Konten mit Einzel-Freigaben (Zugriffssteuerung-Chips) — fuer Delegierte tabu. */
async function kontenMitEinzelfreigaben() {
  const rows = await db.all('SELECT DISTINCT user_id FROM feature_flag_users', []);
  return new Set(rows.map((r) => Number(r.user_id)));
}

/**
 * Darf `z` das Konto `ziel` ({id, role, employee_standort}) anfassen? null = ja, sonst Sperrgrund.
 * @param chipKonten Set aus kontenMitEinzelfreigaben()
 * @param actorId    id des handelnden Kontos
 */
function benutzerSperre(z, ziel, actorId, chipKonten) {
  if (z.ebene === 'superadmin') return null;
  if (ziel.role === 'superadmin' || ziel.role === 'admin') {
    return 'Admin- und Superadmin-Konten bearbeitet nur der Superadmin.';
  }
  if (z.ebene === 'admin') return null;
  if (String(ziel.id) === String(actorId)) return 'Das eigene Konto ändert nur der Superadmin.';
  if (!z.rollen.includes(ziel.role)) return 'Konto oberhalb der eigenen Rolle.';
  if (chipKonten.has(Number(ziel.id))) {
    return 'Konto hat Einzel-Freigaben in der Zugriffssteuerung — nur der Superadmin.';
  }
  if (z.scope === 'standort' && ziel.employee_standort !== z.standort) {
    return `Nur Konten von Mitarbeitern am eigenen Standort (${z.standort}).`;
  }
  return null;
}

/** Was die Oberflaeche ueber den angemeldeten Nutzer wissen muss (GET /api/feature-flags). */
async function verwaltungFuerUi(user) {
  const out = {};
  for (const bereich of Object.keys(BEREICHE)) {
    const z = await verwaltungsZugriff(user, bereich);
    out[bereich] = z && { ebene: z.ebene, scope: z.scope, standort: z.standort,
                          eigene_employee_id: z.eigeneEmployeeId, rollen: z.rollen };
  }
  return out;
}

module.exports = {
  BEREICHE, VERWALTUNG_FEATURES, STANDORT_FEATURES, VERTRIEBSROLLEN, PROV_FELDER, PROV_SPERRE,
  verwaltungsZugriff, requireVerwaltung, verwaltungFuerUi,
  mitarbeiterMitBuchungen, mitarbeiterSperre, kontenMitEinzelfreigaben, benutzerSperre,
};
