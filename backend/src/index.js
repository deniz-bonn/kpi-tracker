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
  try {
    const { DatabaseSync } = require('node:sqlite');
    const path = require('path');
    const dbPath = process.env.DB_PATH || './data/kpi.db';
    const sq = new DatabaseSync(dbPath);
    const N = v => Number(v ?? 0);
    const nk = N(sq.prepare('SELECT COUNT(*) as n FROM deals_nk').get()?.n);
    const bk = N(sq.prepare('SELECT COUNT(*) as n FROM deals_bk').get()?.n);
    const vl = N(sq.prepare('SELECT COUNT(*) as n FROM deals_vl').get()?.n);
    const ag = N(sq.prepare('SELECT COUNT(*) as n FROM ae_gesamt_monthly').get()?.n);
    const nk_gwm = Array.from(sq.prepare("SELECT gewonnen_monat as m, COUNT(*) as n FROM deals_nk WHERE status='Gewonnen' GROUP BY m ORDER BY m").all()).map(r => `${r.m}:${N(r.n)}`);
    sq.close();
    res.json({ nk, bk, vl, ag, nk_gwm, seed: 'v046' });
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
const { router: backupRouter, generateBackup, storeAutoBackup } = require('./routes/backup');
const cron = require('node-cron');
app.use('/api/backup',         backupRouter);                   // requireAuth + requireRole inside
// Daily auto-backup at 23:00
cron.schedule('0 23 * * *', async () => {
  try {
    const data = await generateBackup();
    storeAutoBackup(data);
    console.log('[backup] Auto-Backup erstellt:', data.generated_at);
  } catch (err) {
    console.error('[backup] Auto-Backup fehlgeschlagen:', err.message);
  }
});

// POST /api/admin/test-daily-report — löst beide Tagesberichte sofort aus (nur Admin)
app.post('/api/admin/test-daily-report', requireAuth, async (req, res) => {
  if (!['superadmin', 'admin', 'vertriebsleitung'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const step = (msg) => console.log('[test-daily-report]', msg);

  const run = async () => {
    const { sendDailyDashboard, sendDailyKpi, testSmtpConnection } = require('./utils/email');
    const { buildDashboardEmailData, buildKpiEmailData } = require('./utils/dailyReport');

    const today = new Date().toISOString().slice(0, 10);
    const monat = today.slice(0, 7);
    step(`START today=${today} monat=${monat}`);

    // 1. SMTP-Verbindung prüfen (sofortige Rückmeldung bei falschen Credentials)
    step('Prüfe SMTP-Verbindung…');
    const smtpCheck = await testSmtpConnection();
    if (!smtpCheck.ok) {
      step(`SMTP-Fehler: ${smtpCheck.reason}`);
      return { ok: false, smtp: false, message: `SMTP-Verbindung fehlgeschlagen: ${smtpCheck.reason}` };
    }
    step('SMTP-Verbindung OK');

    const recipients = process.env.REPORT_EMAIL || '(nicht konfiguriert)';

    // 2. Daten aus DB holen
    step('Baue Dashboard-Daten (DB-Abfragen)…');
    const dashData = await buildDashboardEmailData(monat, today);
    step('Dashboard-Daten OK');

    step('Baue KPI-Daten (DB-Abfragen)…');
    const kpiData = await buildKpiEmailData(today, monat);
    step('KPI-Daten OK');

    // 3. E-Mails fire-and-forget (laufen im Hintergrund, da Versand bis zu 2 Min. dauern kann)
    sendDailyDashboard(dashData)
      .then(() => step('Dashboard-E-Mail fertig'))
      .catch(e  => console.error('[test-daily-report] Dashboard-E-Mail FEHLER:', e.message));
    sendDailyKpi(kpiData)
      .then(() => step('KPI-E-Mail fertig'))
      .catch(e  => console.error('[test-daily-report] KPI-E-Mail FEHLER:', e.message));

    return { ok: true, today, monat, smtp: true, message: `E-Mails werden gesendet an ${recipients} – bitte in 1–3 Minuten prüfen.` };
  };

  try {
    const result = await run();
    res.json(result);
  } catch (err) {
    console.error('[test-daily-report] FEHLER:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Daily reports at 22:00
cron.schedule('0 22 * * *', async () => {
  try {
    const { sendDailyDashboard, sendDailyKpi } = require('./utils/email');
    const { buildDashboardEmailData, buildKpiEmailData } = require('./utils/dailyReport');
    const today = new Date().toISOString().slice(0, 10);
    const monat = today.slice(0, 7);
    console.log('[daily-report] Starte Tagesberichte für', today);
    const dashData = await buildDashboardEmailData(monat, today);
    const kpiData  = await buildKpiEmailData(today, monat);
    await sendDailyDashboard(dashData);
    await sendDailyKpi(kpiData);
    console.log('[daily-report] Tagesberichte verschickt für', today);
  } catch (err) {
    console.error('[daily-report] Fehlgeschlagen:', err.message, err.stack?.split('\n')[1] || '');
  }
});

// ── Serve built React frontend (production / Railway) ────────────────────────
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath, { etag: true, lastModified: true }));
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Global JSON error handler — must be last middleware
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[API error]', err.message, err.stack?.split('\n')[1] || '');
  res.status(err.status || err.statusCode || 500).json({ error: err.message || 'Interner Serverfehler' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KPI Tracker API running on :${PORT}`));
