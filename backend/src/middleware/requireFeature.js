const db = require('../db');

// Serverseitige Feature-Flag-Durchsetzung, spiegelt das Frontend-Muster (AuthContext).
// Additive Allowlist: Zugriff hat, wer (a) Superadmin ist, (b) eine in feature_flags
// freigeschaltete Rolle hat ODER (c) in feature_flag_users einzeln eingetragen ist.
// Die Einzel-Freischaltung zählt nur, solange der User aktiv ist (deaktiviert -> wirkungslos,
// auch mitten in einer noch gültigen Session). Kein Deny-Mechanismus in dieser Stufe.

/**
 * Dieselbe Regel als Boolean — fuer Stellen, die nicht abbrechen, sondern verzweigen wollen
 * (z.B. "darf dieser Nutzer eine fremde Sicht oeffnen?"). Die Middleware unten benutzt sie
 * ebenfalls, damit es nur EINE Definition der Regel gibt.
 */
async function hatFeature(user, feature) {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  const pg = db.dialect === 'postgres';
  const p = (n) => pg ? `$${n}` : '?';

  // (b) Rolle freigeschaltet?
  const byRole = await db.get(
    `SELECT 1 AS ok FROM feature_flags WHERE feature = ${p(1)} AND role = ${p(2)}`,
    [feature, user.role]
  );
  if (byRole) return true;

  // (c) Einzel-Freischaltung — nur wenn der User (noch) aktiv ist.
  const byUser = await db.get(
    `SELECT 1 AS ok FROM feature_flag_users ffu
       JOIN users u ON u.id = ffu.user_id
      WHERE ffu.feature = ${p(1)} AND ffu.user_id = ${p(2)} AND u.active = ${pg ? 'TRUE' : '1'}`,
    [feature, user.id]
  );
  return !!byUser;
}

function requireFeature(feature) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Nicht angemeldet' });
      if (await hatFeature(req.user, feature)) return next();
      return res.status(403).json({ error: 'Kein Zugriff auf dieses Feature' });
    } catch (e) { next(e); }
  };
}

/** Zugriff, wenn EINES der Features freigeschaltet ist — fuer Endpoints, die zwei Bereiche bedienen
 *  (z.B. /provisionen/zeitraeume: sowohl die eigene Sicht als auch der Admin-Bereich brauchen es). */
function requireAnyFeature(...features) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Nicht angemeldet' });
      for (const f of features) if (await hatFeature(req.user, f)) return next();
      return res.status(403).json({ error: 'Kein Zugriff auf dieses Feature' });
    } catch (e) { next(e); }
  };
}

module.exports = { requireFeature, requireAnyFeature, hatFeature };
