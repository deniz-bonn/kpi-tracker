// Provisionsabzuege (manuell, nur Superadmin) — z. B. fuer Tobias Boettcher und Julius Kawka.
//
// Ein Abzug ist eine ganz normale Zeile im Kontoauszug (provision_buchungen), typ 'abzug',
// rolle 'abzug', negativer Betrag, die Begruendung steht in `beschreibung`. Dadurch erscheint er
// ohne Sonderweg in "Meine Provision", im Mein-Dashboard, in der Admin-Uebersicht und im
// StB-Export — und verringert die Summe des Zeitraums genau dort, wo ausgezahlt wird.
//
// Der Kontoauszug ist append-only. Ein falscher Abzug wird deshalb nicht geloescht, sondern
// zurueckgenommen: Gegenbuchung 'abzug_storno' (positiver Betrag) in den offenen Zeitraum.
// Der Mitarbeiter sieht beides — das ist gewollt, er soll nachvollziehen koennen, was passiert ist.
//
// Gebucht wird nur in den HEIMATKREIS (Standort) des Mitarbeiters und nur in offene Zeitraeume:
// "Meine Provision" zeigt ausschliesslich den Heimatkreis, ein Abzug anderswo waere fuer ihn
// unsichtbar. Abgeschlossene Zeitraeume sind eingefroren.
const crypto = require('crypto');
const db = require('../db');
const { insertBuchung, offenerZeitraumAm, kreisFor, round2 } = require('./provisionen');

const pg = () => db.dialect === 'postgres';
const q = i => (pg() ? `$${i}` : '?');
const heute = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

const ABZUG = 'abzug', ABZUG_STORNO = 'abzug_storno';
const MAX_BETRAG = 100000;
const BEGRUENDUNG_MIN = 5, BEGRUENDUNG_MAX = 500;

class AbzugFehler extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }

/** Aktive Mitarbeiter mit Provisionskreis (Auswahl im Formular). */
async function abzugPersonen() {
  const rows = await db.all(`SELECT id, name, standort FROM employees WHERE aktiv=${pg() ? 'TRUE' : '1'} ORDER BY name`);
  return rows.map(r => ({ ...r, kreis: kreisFor(r.standort) })).filter(r => r.kreis);
}

/** Offene Zeitraeume des Heimatkreises; der laufende wird bei Bedarf angelegt. */
async function abzugZeitraeume(employeeId) {
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${q(1)}`, [Number(employeeId)]);
  if (!emp) throw new AbzugFehler('Mitarbeiter nicht gefunden', 404);
  const kreis = kreisFor(emp.standort);
  if (!kreis) throw new AbzugFehler(`Kein Provisionskreis für den Standort ${emp.standort || '(ohne Standort)'}`);
  const laufend = await offenerZeitraumAm(heute(), kreis);
  const rows = await db.all(`SELECT id, von, bis, label, status, kreis FROM provision_zeitraeume WHERE kreis=${q(1)} AND status='offen' ORDER BY von DESC`, [kreis]);
  return { employee: emp, kreis, laufend_id: laufend?.id ?? null, zeitraeume: rows };
}

async function bucheAbzug({ employeeId, zeitraumId, betrag, begruendung }) {
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${q(1)}`, [Number(employeeId)]);
  if (!emp) throw new AbzugFehler('Mitarbeiter nicht gefunden', 404);
  const kreis = kreisFor(emp.standort);
  if (!kreis) throw new AbzugFehler(`Kein Provisionskreis für den Standort ${emp.standort || '(ohne Standort)'}`);
  const b = round2(Number(String(betrag ?? '').replace(',', '.')));
  if (!(b > 0)) throw new AbzugFehler('Betrag muss größer als 0 sein');
  if (b > MAX_BETRAG) throw new AbzugFehler(`Betrag über ${MAX_BETRAG.toLocaleString('de-DE')} € — bitte prüfen`);
  const text = String(begruendung ?? '').trim();
  if (text.length < BEGRUENDUNG_MIN) throw new AbzugFehler('Bitte eine Begründung angeben (mindestens 5 Zeichen)');
  if (text.length > BEGRUENDUNG_MAX) throw new AbzugFehler(`Begründung zu lang (höchstens ${BEGRUENDUNG_MAX} Zeichen)`);
  const z = await db.get(`SELECT * FROM provision_zeitraeume WHERE id=${q(1)}`, [Number(zeitraumId)]);
  if (!z) throw new AbzugFehler('Zeitraum nicht gefunden', 404);
  if (z.kreis !== kreis) throw new AbzugFehler(`Zeitraum gehört zum Kreis ${z.kreis}, ${emp.name} rechnet über ${kreis} ab`);
  if (z.status !== 'offen') throw new AbzugFehler('Zeitraum ist abgeschlossen — Abzüge nur in offenen Zeiträumen');
  const idem = `abzug:${crypto.randomUUID()}`;
  await insertBuchung({ zeitraum_id: z.id, employee_id: emp.id, deal_id: null, deal_quelle: 'manuell', rolle: ABZUG,
    typ: ABZUG, satz: 0, bemessungsgrundlage: 0, betrag: -b, kalendermonat: heute().slice(0, 7), gewonnen_datum: null,
    beschreibung: text, idem_key: idem });
  return db.get(`SELECT * FROM provision_buchungen WHERE idem_key=${q(1)}`, [idem]);
}

async function nimmAbzugZurueck(abzugId) {
  const a = await db.get(`SELECT b.*, z.kreis FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id WHERE b.id=${q(1)}`, [Number(abzugId)]);
  if (!a || a.typ !== ABZUG) throw new AbzugFehler('Abzug nicht gefunden', 404);
  const key = `abzug-storno:${a.id}`;
  if (await db.get(`SELECT id FROM provision_buchungen WHERE idem_key=${q(1)}`, [key])) throw new AbzugFehler('Dieser Abzug wurde bereits zurückgenommen', 409);
  const z = await offenerZeitraumAm(heute(), a.kreis);
  const datum = new Date(a.created_at).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' });
  await insertBuchung({ zeitraum_id: z.id, employee_id: a.employee_id, deal_id: null, deal_quelle: 'manuell', rolle: ABZUG,
    typ: ABZUG_STORNO, satz: 0, bemessungsgrundlage: 0, betrag: -Number(a.betrag), kalendermonat: heute().slice(0, 7), gewonnen_datum: null,
    beschreibung: `Abzug vom ${datum} zurückgenommen: ${a.beschreibung || ''}`.trim(), idem_key: key });
  return db.get(`SELECT * FROM provision_buchungen WHERE idem_key=${q(1)}`, [key]);
}

/** Alle Abzuege (neueste zuerst) mit Zeitraum und Ruecknahme-Status. */
async function abzugListe() {
  const rows = await db.all(
    `SELECT b.id, b.employee_id, e.name, b.zeitraum_id, z.label zeitraum, z.status zeitraum_status, b.betrag, b.beschreibung, b.created_at,
            s.id storno_id, s.created_at storno_am
       FROM provision_buchungen b
       JOIN provision_zeitraeume z ON z.id=b.zeitraum_id
       LEFT JOIN employees e ON e.id=b.employee_id
       LEFT JOIN provision_buchungen s ON s.idem_key = 'abzug-storno:' || b.id
      WHERE b.typ='${ABZUG}'
      ORDER BY b.created_at DESC, b.id DESC`);
  return rows.map(r => ({ ...r, betrag: Number(r.betrag), zurueckgenommen: !!r.storno_id }));
}

module.exports = { abzugPersonen, abzugZeitraeume, bucheAbzug, nimmAbzugZurueck, abzugListe, AbzugFehler, ABZUG, ABZUG_STORNO };
