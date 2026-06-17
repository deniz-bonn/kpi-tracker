const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'kpi-tracker-secret-change-in-prod';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Nicht angemeldet' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token ungültig oder abgelaufen' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    if (req.user.role === 'superadmin' || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: 'Keine Berechtigung' });
  };
}

module.exports = { requireAuth, requireRole, SECRET };
