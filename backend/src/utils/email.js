const nodemailer = require('nodemailer');

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || 'KPI Tracker <noreply@kpi-tracker.app>';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

async function sendInvite(email, name, token) {
  const link = `${APP_URL}/set-password?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n[INVITE EMAIL - no SMTP configured]\nTo: ${email}\nLink: ${link}\n`);
    return { link };
  }

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
  return { link };
}

async function sendPasswordReset(email, name, token) {
  const link = `${APP_URL}/set-password?token=${token}&mode=reset`;
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n[RESET EMAIL - no SMTP configured]\nTo: ${email}\nLink: ${link}\n`);
    return { link };
  }

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
  return { link };
}

module.exports = { sendInvite, sendPasswordReset };
