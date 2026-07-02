const nodemailer = require('nodemailer');

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host:             process.env.SMTP_HOST,
    port:             Number(process.env.SMTP_PORT) || 587,
    secure:           process.env.SMTP_SECURE === 'true',
    connectionTimeout: 8000,
    socketTimeout:     8000,
    greetingTimeout:   8000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || 'KPI Tracker <noreply@kpi-tracker.app>';
const APP_URL = process.env.APP_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:5173');

async function sendInvite(email, name, token) {
  const link = `${APP_URL}/set-password?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n[INVITE EMAIL - no SMTP configured]\nTo: ${email}\nLink: ${link}\n`);
    return { link, email_sent: false };
  }

  try {
    await transporter.sendMail({
      from: FROM,
      to:   email,
      subject: 'Einladung zum KPI Tracker',
      html: `
        <p>Hallo ${name},</p>
        <p>Du wurdest zum KPI Tracker eingeladen. Klicke auf den folgenden Link, um dein Passwort festzulegen:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Der Link ist 7 Tage gültig.</p>
      `,
    });
    return { link, email_sent: true };
  } catch (err) {
    console.error('[sendInvite SMTP error]', err.message);
    return { link, email_sent: false };
  }
}

async function sendPasswordReset(email, name, token) {
  const link = `${APP_URL}/set-password?token=${token}&mode=reset`;
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n[RESET EMAIL - no SMTP configured]\nTo: ${email}\nLink: ${link}\n`);
    return { link, email_sent: false };
  }

  try {
    await transporter.sendMail({
      from: FROM,
      to:   email,
      subject: 'Passwort zurücksetzen – KPI Tracker',
      html: `
        <p>Hallo ${name},</p>
        <p>Du hast eine Passwortzurücksetzung angefordert. Klicke auf den folgenden Link:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Der Link ist 1 Stunde gültig. Falls du keine Zurücksetzung angefordert hast, ignoriere diese E-Mail.</p>
      `,
    });
    return { link, email_sent: true };
  } catch (err) {
    console.error('[sendPasswordReset SMTP error]', err.message);
    return { link, email_sent: false };
  }
}

// ── Daily Report E-Mails ─────────────────────────────────────────────────────

const { fmtEuro, fmt, fmtMonth } = require('./dailyReport');

const REPORT_RECIPIENTS = process.env.REPORT_EMAIL
  ? process.env.REPORT_EMAIL.split(',').map(e => e.trim()).filter(Boolean)
  : [];

function styleTable() {
  return `border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:13px`;
}
function styleTh() {
  return `background:#1e293b;color:#fff;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em`;
}
function styleThR() { return styleTh() + ';text-align:right'; }
function styleTd(bg) {
  return `padding:7px 12px;border-bottom:1px solid #e2e8f0;${bg ? 'background:' + bg + ';' : ''}`;
}
function styleTdR(bg) { return styleTd(bg) + ';text-align:right'; }

function sectionHeader(title, color) {
  return `<tr><td colspan="99" style="background:${color};color:#fff;padding:8px 12px;font-weight:bold;font-size:13px;letter-spacing:.02em">${title}</td></tr>`;
}

function buildDashboardHtml(data) {
  const { monat, today, nkMonth, bkMonth, vlMonth, nkToday, bkToday, vlToday } = data;

  const standorte = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];

  const monthTable = (rows, color) => {
    const byLoc = {};
    standorte.forEach(s => { byLoc[s] = { cnt: 0, ae: 0 }; });
    (rows || []).forEach(r => {
      const s = r.standort;
      if (!byLoc[s]) byLoc[s] = { cnt: 0, ae: 0 };
      byLoc[s].cnt += Number(r.cnt) || 0;
      byLoc[s].ae  += Number(r.ae)  || 0;
    });
    const totalCnt = Object.values(byLoc).reduce((s, v) => s + v.cnt, 0);
    const totalAe  = Object.values(byLoc).reduce((s, v) => s + v.ae, 0);

    return standorte.map((s, i) => {
      if (!byLoc[s] || (byLoc[s].cnt === 0)) return '';
      const bg = i % 2 === 0 ? '#f8fafc' : '#fff';
      return `<tr>
        <td style="${styleTd(bg)}">${s}</td>
        <td style="${styleTdR(bg)}">${byLoc[s].cnt}</td>
        <td style="${styleTdR(bg)}">${fmtEuro(byLoc[s].ae)}</td>
      </tr>`;
    }).join('') + `<tr>
      <td style="${styleTd('#f1f5f9')};font-weight:bold">Gesamt</td>
      <td style="${styleTdR('#f1f5f9')};font-weight:bold">${totalCnt}</td>
      <td style="${styleTdR('#f1f5f9')};font-weight:bold">${fmtEuro(totalAe)}</td>
    </tr>`;
  };

  const todayRows = (deals, label) => {
    if (!deals || deals.length === 0) {
      return `<tr><td colspan="4" style="${styleTd()};color:#94a3b8;font-style:italic">Keine ${label}-Abschlüsse heute</td></tr>`;
    }
    return deals.map((d, i) => {
      const bg = i % 2 === 0 ? '#f8fafc' : '#fff';
      return `<tr>
        <td style="${styleTd(bg)}">${d.kunde}</td>
        <td style="${styleTd(bg)}">${d.mitarbeiter || '—'}</td>
        <td style="${styleTd(bg)}">${d.standort}</td>
        <td style="${styleTdR(bg)}">${fmtEuro(d.ae_wert)}</td>
      </tr>`;
    }).join('');
  };

  const dateStr = today ? new Date(today + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }) : today;

  return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
  <div style="max-width:680px;margin:0 auto">
    <div style="background:#1e293b;color:#fff;border-radius:8px 8px 0 0;padding:20px 24px">
      <div style="font-size:20px;font-weight:bold">📊 Dashboard Auftragseingang</div>
      <div style="opacity:.7;font-size:13px;margin-top:4px">${dateStr} · ${fmtMonth(monat)}</div>
    </div>
    <div style="background:#fff;border-radius:0 0 8px 8px;padding:0 0 20px">

      <!-- Monatstabellen -->
      <div style="padding:16px 24px 8px;font-size:16px;font-weight:bold;color:#1e293b">Auftragseingang ${fmtMonth(monat)} nach Standort</div>

      <div style="padding:0 24px">
        <table style="${styleTable()};margin-bottom:16px">
          ${sectionHeader('Neukunden (NK)', '#166534')}
          <tr>
            <th style="${styleTh()}">Standort</th>
            <th style="${styleThR()}">Deals</th>
            <th style="${styleThR()}">AE</th>
          </tr>
          ${monthTable(nkMonth, '#166534')}
        </table>

        <table style="${styleTable()};margin-bottom:16px">
          ${sectionHeader('Bestandskunden (BK)', '#1d4ed8')}
          <tr>
            <th style="${styleTh()}">Standort</th>
            <th style="${styleThR()}">Deals</th>
            <th style="${styleThR()}">AE</th>
          </tr>
          ${monthTable(bkMonth, '#1d4ed8')}
        </table>

        <table style="${styleTable()};margin-bottom:24px">
          ${sectionHeader('Verlängerungen (VL)', '#7c3aed')}
          <tr>
            <th style="${styleTh()}">Standort</th>
            <th style="${styleThR()}">Deals</th>
            <th style="${styleThR()}">AE</th>
          </tr>
          ${monthTable(vlMonth, '#7c3aed')}
        </table>
      </div>

      <!-- Heute gewonnen -->
      <div style="padding:0 24px 8px;font-size:16px;font-weight:bold;color:#1e293b;border-top:2px solid #e2e8f0;margin-top:8px;padding-top:16px">
        Neue Abschlüsse heute
      </div>
      <div style="padding:0 24px">
        <table style="${styleTable()};margin-bottom:16px">
          ${sectionHeader('Neukunden heute', '#166534')}
          <tr>
            <th style="${styleTh()}">Kunde</th>
            <th style="${styleTh()}">Mitarbeiter</th>
            <th style="${styleTh()}">Standort</th>
            <th style="${styleThR()}">AE</th>
          </tr>
          ${todayRows(nkToday, 'NK')}
        </table>

        <table style="${styleTable()};margin-bottom:16px">
          ${sectionHeader('Bestandskunden heute', '#1d4ed8')}
          <tr>
            <th style="${styleTh()}">Kunde</th>
            <th style="${styleTh()}">KAM</th>
            <th style="${styleTh()}">Standort</th>
            <th style="${styleThR()}">AE</th>
          </tr>
          ${todayRows(bkToday, 'BK')}
        </table>

        <table style="${styleTable()}">
          ${sectionHeader('Verlängerungen heute', '#7c3aed')}
          <tr>
            <th style="${styleTh()}">Kunde</th>
            <th style="${styleTh()}">KAM</th>
            <th style="${styleTh()}">Standort</th>
            <th style="${styleThR()}">AE</th>
          </tr>
          ${todayRows(vlToday, 'VL')}
        </table>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:11px;padding:12px">KPI Tracker · Automatischer Tagesbericht</div>
  </div>
</body></html>`;
}

function buildKpiHtml(data) {
  const { datum, perEmployee, totals } = data;
  const dateStr = new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  const pct = (a, b) => b > 0 ? Math.round(a / b * 100) + '%' : '—';

  const rows = perEmployee.map((e, i) => {
    const bg = i % 2 === 0 ? '#f8fafc' : '#fff';
    return `<tr>
      <td style="${styleTd(bg)};font-weight:500">${e.name}</td>
      <td style="${styleTd(bg)};font-size:11px;color:#64748b">${e.rolle}</td>
      <td style="${styleTd(bg)};font-size:11px;color:#64748b">${e.standort}</td>
      <td style="${styleTdR(bg)}">${e.entscheider}</td>
      <td style="${styleTdR(bg)}">${e.terminiert}</td>
      <td style="${styleTdR(bg)};font-weight:bold;color:#6d28d9">${pct(e.terminiert, e.entscheider)}</td>
      <td style="${styleTdR(bg)}">${e.settings}</td>
      <td style="${styleTdR(bg)}">${e.beratungen}</td>
    </tr>`;
  }).join('');

  const noDataRow = `<tr><td colspan="8" style="${styleTd()};color:#94a3b8;font-style:italic;text-align:center">Keine Aktivitätsdaten für heute</td></tr>`;

  return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
  <div style="max-width:760px;margin:0 auto">
    <div style="background:#312e81;color:#fff;border-radius:8px 8px 0 0;padding:20px 24px">
      <div style="font-size:20px;font-weight:bold">📈 KPI Mitarbeiter-Auswertung</div>
      <div style="opacity:.7;font-size:13px;margin-top:4px">${dateStr} · Tagesbasis</div>
    </div>
    <div style="background:#fff;border-radius:0 0 8px 8px;padding:20px 24px">

      <!-- Gesamtzahlen -->
      <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap">
        ${[
          ['Entscheider', totals.entscheider, '#2563eb'],
          ['Terminiert',  totals.terminiert,  '#0891b2'],
          ['Settings',    totals.settings,    '#7c3aed'],
          ['Beratungen',  totals.beratungen,  '#059669'],
        ].map(([label, val, color]) => `
          <div style="flex:1;min-width:120px;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">${label}</div>
            <div style="font-size:28px;font-weight:900;color:${color}">${val}</div>
          </div>`).join('')}
        <div style="flex:1;min-width:120px;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;background:#faf5ff">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Term.Quote</div>
          <div style="font-size:28px;font-weight:900;color:#7c3aed">${pct(totals.terminiert, totals.entscheider)}</div>
        </div>
      </div>

      <!-- Pro-Mitarbeiter-Tabelle -->
      <table style="${styleTable()}">
        <tr>
          <th style="${styleTh()}">Mitarbeiter</th>
          <th style="${styleTh()}">Rolle</th>
          <th style="${styleTh()}">Standort</th>
          <th style="${styleThR()}">Entsch.</th>
          <th style="${styleThR()}">Term.</th>
          <th style="${styleThR()}">E→T %</th>
          <th style="${styleThR()}">Settings</th>
          <th style="${styleThR()}">Beratungen</th>
        </tr>
        ${perEmployee.length > 0 ? rows : noDataRow}
        ${perEmployee.length > 0 ? `<tr style="background:#1e293b;color:#fff;font-weight:bold">
          <td style="padding:8px 12px" colspan="3">Gesamt</td>
          <td style="padding:8px 12px;text-align:right">${totals.entscheider}</td>
          <td style="padding:8px 12px;text-align:right">${totals.terminiert}</td>
          <td style="padding:8px 12px;text-align:right">${pct(totals.terminiert, totals.entscheider)}</td>
          <td style="padding:8px 12px;text-align:right">${totals.settings}</td>
          <td style="padding:8px 12px;text-align:right">${totals.beratungen}</td>
        </tr>` : ''}
      </table>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:11px;padding:12px">KPI Tracker · Automatischer Tagesbericht</div>
  </div>
</body></html>`;
}

async function sendDailyDashboard(data) {
  const transporter = createTransporter();
  const dateLabel = data.today
    ? new Date(data.today + 'T12:00:00').toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' })
    : data.today;
  const totalToday = (data.nkToday?.length || 0) + (data.bkToday?.length || 0) + (data.vlToday?.length || 0);
  const subject = `📊 Dashboard ${fmtMonth(data.monat)} – ${dateLabel} | ${totalToday} neue Abschlüsse`;
  const html = buildDashboardHtml(data);

  if (!transporter) {
    console.log(`\n[DAILY DASHBOARD EMAIL - no SMTP]\nSubject: ${subject}\nRecipients: ${REPORT_RECIPIENTS.join(', ')}\n`);
    return;
  }
  if (REPORT_RECIPIENTS.length === 0) {
    console.log('[daily-report] Kein REPORT_EMAIL konfiguriert — E-Mail übersprungen');
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to: REPORT_RECIPIENTS.join(','), subject, html });
    console.log(`[daily-report] Dashboard-E-Mail verschickt an ${REPORT_RECIPIENTS.join(', ')}`);
  } catch (err) {
    console.error('[daily-report] Dashboard-E-Mail fehlgeschlagen:', err.message);
  }
}

async function sendDailyKpi(data) {
  const transporter = createTransporter();
  const dateLabel = new Date(data.datum + 'T12:00:00').toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
  const subject = `📈 KPI Mitarbeiter – ${dateLabel} | ${data.perEmployee.length} Einträge`;
  const html = buildKpiHtml(data);

  if (!transporter) {
    console.log(`\n[DAILY KPI EMAIL - no SMTP]\nSubject: ${subject}\nRecipients: ${REPORT_RECIPIENTS.join(', ')}\n`);
    return;
  }
  if (REPORT_RECIPIENTS.length === 0) {
    console.log('[daily-report] Kein REPORT_EMAIL konfiguriert — E-Mail übersprungen');
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to: REPORT_RECIPIENTS.join(','), subject, html });
    console.log(`[daily-report] KPI-E-Mail verschickt an ${REPORT_RECIPIENTS.join(', ')}`);
  } catch (err) {
    console.error('[daily-report] KPI-E-Mail fehlgeschlagen:', err.message);
  }
}

module.exports = { sendInvite, sendPasswordReset, sendDailyDashboard, sendDailyKpi };
