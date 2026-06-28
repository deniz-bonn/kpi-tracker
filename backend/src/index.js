require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const { requireAuth } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// ── Public routes (no auth) ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (_, res) => res.json({ ok: true, dialect: process.env.DB_DIALECT || 'sqlite', deploy: 'v045-data-sync' }));
app.get('/api/dbstats', (_, res) => {
  const db = require('./db');
  const N = v => Number(v ?? 0);
  try {
    const nk   = N(db.get('SELECT CAST(COUNT(*) AS REAL) as n FROM deals_nk')?.n);
    const bk   = N(db.get('SELECT CAST(COUNT(*) AS REAL) as n FROM deals_bk')?.n);
    const vl   = N(db.get('SELECT CAST(COUNT(*) AS REAL) as n FROM deals_vl')?.n);
    const ag   = N(db.get('SELECT CAST(COUNT(*) AS REAL) as n FROM ae_gesamt_monthly')?.n);
    const migs = db.all('SELECT filename FROM _migrations ORDER BY ran_at DESC LIMIT 5').map(r => r.filename);
    const nk_gwm = db.all('SELECT gewonnen_monat as m, CAST(COUNT(*) AS REAL) as n FROM deals_nk WHERE status=\'Gewonnen\' GROUP BY gewonnen_monat ORDER BY gewonnen_monat').map(r => ({m: r.m, n: N(r.n)}));
    res.json({ nk, bk, vl, ag, migs, nk_gwm });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Protected routes (require JWT) ──────────────────────────────────────────
app.use('/api/companies',      requireAuth, require('./routes/companies'));
app.use('/api/employees',      requireAuth, require('./routes/employees'));
app.use('/api/deals/nk',       require('./routes/deals_nk'));   // requireAuth inside
app.use('/api/deals/bk',       require('./routes/deals_bk'));   // requireAuth inside
app.use('/api/deals/vl',       require('./routes/deals_vl'));   // requireAuth inside
app.use('/api/targets',        requireAuth, require('./routes/targets'));
app.use('/api/kpis',           requireAuth, require('./routes/kpis'));
app.use('/api/auswertung',     requireAuth, require('./routes/auswertung'));
app.use('/api/monthly-targets',requireAuth, require('./routes/monthly_targets'));
app.use('/api/activity-logs',  require('./routes/activity_logs'));  // requireAuth inside
app.use('/api/inbound-daily',  require('./routes/inbound_daily'));  // requireAuth inside
app.use('/api/feature-flags',  require('./routes/feature_flags')); // requireAuth inside
app.use('/api/upsale-deals',   require('./routes/upsale_deals'));   // requireAuth inside
app.use('/api/admin',          require('./routes/admin'));       // requireAuth + requireRole inside
app.use('/api/audit',          require('./routes/audit'));       // requireAuth inside
app.use('/api/export',         require('./routes/export'));      // requireAuth inside

// ── Serve built React frontend (production / Railway) ────────────────────────
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
}

// Global JSON error handler — must be last middleware
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[API error]', err.message, err.stack?.split('\n')[1] || '');
  res.status(err.status || err.statusCode || 500).json({ error: err.message || 'Interner Serverfehler' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KPI Tracker API running on :${PORT}`));
