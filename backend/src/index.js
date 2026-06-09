require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/companies', require('./routes/companies'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/deals/nk', require('./routes/deals_nk'));
app.use('/api/deals/bk', require('./routes/deals_bk'));
app.use('/api/deals/vl', require('./routes/deals_vl'));
app.use('/api/targets', require('./routes/targets'));
app.use('/api/kpis', require('./routes/kpis'));
app.use('/api/auswertung', require('./routes/auswertung'));
app.use('/api/monthly-targets', require('./routes/monthly_targets'));

app.get('/api/health', (_, res) => res.json({ ok: true, dialect: process.env.DB_DIALECT || 'sqlite' }));

// Serve built React frontend (production / Railway)
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  // All non-API routes → React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`KPI Tracker API running on :${PORT}`));
