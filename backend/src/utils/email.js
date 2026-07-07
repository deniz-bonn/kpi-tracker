const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// ── Absender-Adresse ─────────────────────────────────────────────────────────
const FROM = process.env.SMTP_FROM || 'KPI Tracker <noreply@kpi-tracker.app>';

// ── Resend (bevorzugt auf Railway, läuft über HTTPS) ─────────────────────────
function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// ── SMTP (Fallback für lokale Entwicklung) ───────────────────────────────────
function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host:              process.env.SMTP_HOST,
    port:              Number(process.env.SMTP_PORT) || 587,
    secure:            process.env.SMTP_SECURE === 'true',
    family:            4,
    connectionTimeout: 15000,
    greetingTimeout:   30000,
    socketTimeout:     180000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Einheitliche Versand-Funktion ─────────────────────────────────────────────
// attachments: [{ filename: string, content: string|Buffer }]
async function sendEmail({ to, subject, html, attachments = [] }) {
  const resend = getResendClient();
  if (resend) {
    const toArr = Array.isArray(to) ? to : to.split(',').map(s => s.trim());
    const opts = { from: FROM, to: toArr, subject, html };
    if (attachments.length) {
      opts.attachments = attachments.map(a => ({
        filename: a.filename,
        content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
      }));
    }
    const { error } = await resend.emails.send(opts);
    if (error) throw new Error(error.message || JSON.stringify(error));
    return;
  }
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[EMAIL - kein SMTP/Resend konfiguriert]\nSubject: ${subject}\nTo: ${to}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html, attachments });
}

// ── Verbindungstest ───────────────────────────────────────────────────────────
async function testEmailConnection() {
  const resend = getResendClient();
  if (resend) {
    // Resend hat keinen separaten verify()-Aufruf — API-Key-Format prüfen
    if (!process.env.RESEND_API_KEY.startsWith('re_')) {
      return { ok: false, method: 'resend', reason: 'RESEND_API_KEY hat ungültiges Format (muss mit "re_" beginnen)' };
    }
    return { ok: true, method: 'resend' };
  }
  const transporter = createTransporter();
  if (!transporter) return { ok: false, method: 'none', reason: 'Weder RESEND_API_KEY noch SMTP_HOST konfiguriert' };
  try {
    await transporter.verify();
    return { ok: true, method: 'smtp' };
  } catch (err) {
    return { ok: false, method: 'smtp', reason: err.message };
  }
}
const APP_URL = process.env.APP_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:5173');

async function sendInvite(email, name, token) {
  const link = `${APP_URL}/set-password?token=${token}`;
  try {
    await sendEmail({
      to: email,
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
    console.error('[sendInvite error]', err.message);
    return { link, email_sent: false };
  }
}

async function sendPasswordReset(email, name, token) {
  const link = `${APP_URL}/set-password?token=${token}&mode=reset`;
  try {
    await sendEmail({
      to: email,
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
    console.error('[sendPasswordReset error]', err.message);
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
  const { monat, today, nkMonth, bkMonth, vlMonth, nkToday, bkToday, vlToday, monatsziel } = data;

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

      <!-- Gesamt-Übersicht -->
      ${(() => {
        const sumAe = rows => (rows || []).reduce((s, r) => s + (Number(r.ae) || 0), 0);
        const nkAe  = sumAe(nkMonth);
        const bkAe  = sumAe(bkMonth);
        const vlAe  = sumAe(vlMonth);
        const gesamt = nkAe + bkAe + vlAe;
        const ziel   = monatsziel || 0;
        const rest   = ziel > 0 ? ziel - gesamt : null;
        const pct    = ziel > 0 ? Math.min(Math.round(gesamt / ziel * 100), 100) : null;
        const barColor = pct >= 100 ? '#16a34a' : pct >= 75 ? '#ca8a04' : '#dc2626';
        const restColor = rest !== null && rest <= 0 ? '#16a34a' : '#dc2626';

        return `<div style="margin:0 24px 24px;border-radius:10px;border:2px solid #e2e8f0;overflow:hidden">
          <div style="background:#0f172a;padding:12px 16px;color:#fff;font-size:13px;font-weight:bold;letter-spacing:.05em;text-transform:uppercase">
            Gesamt-Übersicht ${fmtMonth(monat)}
          </div>
          <div style="display:flex;gap:0;flex-wrap:wrap">
            <div style="flex:1;min-width:140px;padding:14px 16px;border-right:1px solid #e2e8f0;background:#f8fafc">
              <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Auftragseingang gesamt</div>
              <div style="font-size:22px;font-weight:900;color:#0f172a">${fmtEuro(gesamt)}</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px">NK ${fmtEuro(nkAe)} · BK ${fmtEuro(bkAe)} · VL ${fmtEuro(vlAe)}</div>
            </div>
            <div style="flex:1;min-width:140px;padding:14px 16px;border-right:1px solid #e2e8f0;background:#f8fafc">
              <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Monatsziel</div>
              <div style="font-size:22px;font-weight:900;color:#d97706">${ziel > 0 ? fmtEuro(ziel) : '—'}</div>
            </div>
            <div style="flex:1;min-width:140px;padding:14px 16px;background:#f8fafc">
              <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">${rest !== null && rest <= 0 ? '🎯 Ziel erreicht!' : 'Noch benötigt'}</div>
              <div style="font-size:22px;font-weight:900;color:${restColor}">${rest !== null ? (rest <= 0 ? fmtEuro(Math.abs(rest)) + ' über Ziel' : fmtEuro(rest)) : '—'}</div>
            </div>
          </div>
          ${pct !== null ? `<div style="padding:10px 16px;background:#f1f5f9;border-top:1px solid #e2e8f0">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:4px">
              <span>Zielerreichung</span><span style="font-weight:bold;color:${barColor}">${pct}%</span>
            </div>
            <div style="background:#e2e8f0;border-radius:99px;height:8px;overflow:hidden">
              <div style="background:${barColor};height:100%;width:${pct}%;border-radius:99px"></div>
            </div>
          </div>` : ''}
        </div>`;
      })()}

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
  if (REPORT_RECIPIENTS.length === 0) {
    console.log('[daily-report] Kein REPORT_EMAIL konfiguriert — Dashboard-E-Mail übersprungen');
    return;
  }
  const dateLabel = data.today
    ? new Date(data.today + 'T12:00:00').toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' })
    : data.today;
  const totalToday = (data.nkToday?.length || 0) + (data.bkToday?.length || 0) + (data.vlToday?.length || 0);
  const subject = `📊 Dashboard ${fmtMonth(data.monat)} – ${dateLabel} | ${totalToday} neue Abschlüsse`;
  try {
    await sendEmail({ to: REPORT_RECIPIENTS.join(','), subject, html: buildDashboardHtml(data) });
    console.log(`[daily-report] Dashboard-E-Mail verschickt an ${REPORT_RECIPIENTS.join(', ')}`);
  } catch (err) {
    console.error('[daily-report] Dashboard-E-Mail fehlgeschlagen:', err.message);
  }
}

async function sendDailyKpi(data) {
  if (REPORT_RECIPIENTS.length === 0) {
    console.log('[daily-report] Kein REPORT_EMAIL konfiguriert — KPI-E-Mail übersprungen');
    return;
  }
  const dateLabel = new Date(data.datum + 'T12:00:00').toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
  const subject = `📈 KPI Mitarbeiter – ${dateLabel} | ${data.perEmployee.length} Einträge`;
  try {
    await sendEmail({ to: REPORT_RECIPIENTS.join(','), subject, html: buildKpiHtml(data) });
    console.log(`[daily-report] KPI-E-Mail verschickt an ${REPORT_RECIPIENTS.join(', ')}`);
  } catch (err) {
    console.error('[daily-report] KPI-E-Mail fehlgeschlagen:', err.message);
  }
}

async function sendBackupEmail(backupData) {
  if (REPORT_RECIPIENTS.length === 0) {
    console.log('[backup-email] Kein REPORT_EMAIL konfiguriert — Backup-E-Mail übersprungen');
    return;
  }
  const dateStr = backupData.generated_at.slice(0, 10);
  const filename = `kpi-backup-${dateStr}.json`;
  const subject = `💾 KPI Tracker Backup – ${dateStr}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
  <div style="max-width:500px;margin:0 auto">
    <div style="background:#1e293b;color:#fff;border-radius:8px 8px 0 0;padding:16px 20px">
      <div style="font-size:18px;font-weight:bold">💾 Automatisches Backup</div>
      <div style="opacity:.7;font-size:12px;margin-top:4px">KPI Tracker · ${dateStr}</div>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:16px 20px">
      <p style="margin:0 0 12px;color:#334155">Das tägliche automatische Backup wurde erfolgreich erstellt und ist als Anhang beigefügt.</p>
      <p style="margin:0 0 8px;font-size:13px;color:#64748b">Datei: <strong>${filename}</strong></p>
      <p style="margin:0;font-size:12px;color:#94a3b8">Erstellt am ${dateStr} um 23:00 Uhr (automatisch)</p>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:11px;padding:12px">KPI Tracker · Automatisches Tages-Backup</div>
  </div>
</body></html>`;
  try {
    await sendEmail({
      to: REPORT_RECIPIENTS.join(','),
      subject,
      html,
      attachments: [{ filename, content: JSON.stringify(backupData, null, 2) }],
    });
    console.log(`[backup-email] Backup-E-Mail verschickt an ${REPORT_RECIPIENTS.join(', ')}`);
  } catch (err) {
    console.error('[backup-email] Backup-E-Mail fehlgeschlagen:', err.message);
  }
}

module.exports = { sendInvite, sendPasswordReset, sendDailyDashboard, sendDailyKpi, sendBackupEmail, testEmailConnection };
