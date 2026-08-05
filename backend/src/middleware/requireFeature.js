const db = require('../db');

// Serverseitige Feature-Flag-Durchsetzung, spiegelt das Frontend-Muster (AuthContext):
// Superadmin hat immer Zugriff; sonst muss die Rolle des Users in feature_flags fuer
// dieses Feature eingetragen sein. Kein Eintrag -> nur Superadmin (leeres Flag = Beta
// nur fuer den Superadmin sichtbar).
function requireFeature(feature) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Nicht angemeldet' });
      if (req.user.role === 'superadmin') return next();
      const pg = db.dialect === 'postgres';
      const row = await db.get(
        `SELECT 1 AS ok FROM feature_flags WHERE feature = ${pg ? '$1' : '?'} AND role = ${pg ? '$2' : '?'}`,
        [feature, req.user.role]
      );
      if (row) return next();
      return res.status(403).json({ error: 'Kein Zugriff auf dieses Feature' });
    } catch (e) { next(e); }
  };
}

module.exports = { requireFeature };
