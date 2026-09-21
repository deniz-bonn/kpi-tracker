const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { normalisiereLeereFelder } = require('../utils/leereFelder');
const { logAudit }   = require('../utils/audit');
const { pruefeDatumsaenderung } = require('../utils/dealGuards');
const { enrichDealsEur } = require('../utils/currency');
const { resolveGewonnenFelder } = require('../utils/gewonnen');
// Provisions-Hook des Abrechnungskreises "Bestandskundenvertrieb" (Verlaengerung 2 % an den KAM).
// Wie in deals_nk.js laeuft jeder Aufruf in try/catch: ein Fehler in der Provisionsrechnung
// darf das Speichern des Deals niemals brechen.
const { provisionSyncBk } = require('../utils/provisionenBk');
const { kamRollenSql } = require('../utils/rollen');
// Der Dauer-RaaS-Umsatz einer Umstellung ist ein REGULAERER BK-Deal und wird ueber DIESE
// Funktionen angelegt bzw. entfernt, nicht per eigenem INSERT/DELETE: die Hooks (AE-Snapshot,
// BK-Provision, Audit) haengen an der Route, nicht an der Tabelle — es gibt keinen DB-Trigger
// auf deals_bk. Dasselbe Muster wie im Bereich Willkommensmeetings.
const { erstelleBkDeal, loescheBkDeal } = require('./deals_bk');

router.use(requireAuth);
// Geleerte Zahlen-/Datumsfelder kommen als '' an; Postgres lehnt das ab (500).
// Siehe utils/leereFelder.js — die Oberflaeche filtert bereits, das hier gilt API und Import.
router.use(normalisiereLeereFelder);
// EUR-Anreicherung. Der Dauer-RaaS-Betrag wird MITGELESEN, nicht mitgespeichert: er steht im
// verknuepften BK-Deal (umstellung_ae_wert aus dem JOIN unten) und wird hier nur zusaetzlich in
// EUR ausgewiesen, damit eine Anzeige bei CHF-Companies (Risem) keine Waehrungen mischt.
// Er flieszt in KEINE VL-Summe — sein Platz ist der Bestandskunden-Umsatz.
const VL_EUR_MAP = {
  angebotswert: 'angebotswert_eur',
  ae_wert: 'ae_wert_eur',
  umstellung_ae_wert: 'umstellung_ae_wert_eur',
};

// ─────────────────────────────────────────────────────────────────────────────
// UMSTELLUNG AUF DAUER-RaaS — der dritte Ausgang einer Verlaengerung
//
// Ein Vertrag, der statt der Verlaengerung auf den Dauer-Recruiting-Service umgestellt wird, ist
// KEINE Verlaengerung: weder gewonnen noch gekuendigt. Er traegt deshalb den eigenen Status
// 'Umgestellt' (Migration 113) und nicht mehr, wie im Provisorium aus Migration 102, einen Haken
// AN einem gewonnenen Deal.
//
// REFERENZ STATT KOPIE: Der Umsatz lebt in einem regulaeren deals_bk-Deal mit
// herkunft='vl_umstellung'. Damit ergibt sich alles Weitere von selbst:
//   * Der AE flieszt als Bestandskunden-Umsatz in Monatsuebersicht und Auswertung.
//   * Die 3 % kommen aus dem BESTEHENDEN Upsell-Buchungstyp des BK-Kreises — kein neuer Satz,
//     keine neue Config-Spalte, kein neuer Export-Typ.
//   * Die 2 % Verlaengerungsprovision entfallen OHNE Sondercode: der VL-Deal ist nicht mehr
//     'Gewonnen', positionBk() lehnt ihn ab, und provisionSyncBk bucht zustandsbasiert die
//     Differenz. Kein Doppelbezug, in beide Richtungen.
//
// dauervertrag_ae_wert wird bewusst NICHT mehr gefuellt: der Betrag steht ausschliesslich im
// verknuepften BK-Deal. Zwei Spalten fuer dasselbe Geld waeren Doppelzaehlung — genau der Fehler,
// den dieser Umbau beseitigt. Die Spalte bleibt nur, weil ein DROP COLUMN in SQLite einen
// weiteren Tabellen-Neuaufbau kostete; im Bestand traegt sie ohnehin keinen einzigen Wert.
// ─────────────────────────────────────────────────────────────────────────────
const UMSTELLUNG_HERKUNFT = 'vl_umstellung';

// Status und Flag koennen nicht mehr auseinanderlaufen: das Flag wird AUS dem Status abgeleitet.
// (Frueher liess DealsVL.jsx den Haken absichtlich stehen, wenn der Status spaeter wechselte —
// damit gab es zwei Wahrheiten fuer denselben Ausgang.)
function normUmstellung(zielStatus, body, existing) {
  const an = zielStatus === 'Umgestellt' ? 1 : 0;
  const datum = body.dauervertrag_datum !== undefined
    ? body.dauervertrag_datum
    : (existing?.dauervertrag_datum ?? null);
  return {
    dauervertrag_umgestellt: an,
    dauervertrag_ae_wert: null,
    dauervertrag_datum: an ? (datum ?? null) : null,
  };
}

/**
 * Angaben zum Dauer-RaaS-Deal pruefen.
 *
 * kam_id ist PFLICHT: auswertung.js und kpis.js joinen deals_bk per INNER JOIN auf employees.
 * Ein Deal ohne kam_id verschwindet damit lautlos aus JEDER BK-Auswertung — und haette obendrein
 * keinen Provisionsempfaenger. Der Betrag muss > 0 sein, sonst entstuende eine Umstellung ohne
 * Umsatz und eine 0-Euro-Provisionsposition.
 */
function pruefeUmstellung(u, vl) {
  if (!u || typeof u !== 'object') return 'Angaben zum Dauer-RaaS-Deal fehlen';
  if (!(u.kam_id ?? vl?.kam_id)) return 'KAM fehlt — ohne KAM fiele der Dauer-RaaS-Deal aus jeder Auswertung';
  if (!(u.company_id ?? vl?.company_id)) return 'Company fehlt';
  if (!(Number(u.ae_wert) > 0)) return 'Dauer-RaaS-Betrag fehlt oder ist 0';
  return null;
}

// Der BK-Deal leitet sich weitgehend aus dem Verlaengerungs-Deal ab — die Erfassung soll zwei
// Klicks sein, nicht ein zweites Formular. Angegeben werden muss nur der Betrag.
function bkBodyAus(vl, u, datum, vlId) {
  const betrag = Number(u.ae_wert);
  const status = u.status || 'Gewonnen';
  return {
    datum,
    monat: String(datum).slice(0, 7),
    company_id: u.company_id ?? vl.company_id,
    kam_id: u.kam_id ?? vl.kam_id,
    kunde: u.kunde ?? vl.kunde,
    angebotsnummer: u.angebotsnummer ?? null,
    dienstleistung: u.dienstleistung || 'Dauer-RaaS',
    angebotswert: u.angebotswert != null ? Number(u.angebotswert) : betrag,
    laufzeit_monate: u.laufzeit_monate != null ? Number(u.laufzeit_monate) : 12,
    status,
    ae_wert: betrag,
    gewonnen_datum: status === 'Gewonnen' ? datum : null,
    kundennummer: u.kundennummer ?? vl.kundennummer ?? null,
    kommentar: u.kommentar ?? `Umstellung der Verlängerung${vlId ? ` #${vlId}` : ''} auf Dauer-RaaS`,
    herkunft: UMSTELLUNG_HERKUNFT,
  };
}

/**
 * Haelt Status und verknuepften Dauer-RaaS-Deal konsistent. Liefert die zu schreibende
 * umstellung_deal_bk_id — und im Fehlerfall einen 400er, nie einen halben Zustand.
 *
 * Drei Wege in die Umstellung:
 *   * `umstellung: { ae_wert, ... }`  -> neuer BK-Deal wird angelegt
 *   * `umstellung_deal_bk_id: 123`    -> ein bereits bestehender Deal wird verknuepft
 *   * nichts davon, aber schon verknuepft -> bleibt wie es ist
 *
 * Und einer wieder heraus: faellt der Status von 'Umgestellt' zurueck, muss der Umsatz mit. Ein
 * stehengebliebener Deal hiesse 3 % fuer einen Vorgang, den es nicht mehr gibt. Geloescht wird
 * aber NUR, was diese Route selbst angelegt hat (herkunft-Marke) — ein vorher schon vorhandener,
 * bloss verknuepfter Deal wird ausschliesslich geloest.
 */
async function synchronisiereUmstellung({ zielStatus, body, existing, vlFelder, vlId, user }) {
  const p1 = db.dialect === 'postgres' ? '$1' : '?';
  const p2 = db.dialect === 'postgres' ? '$2' : '?';
  const vorher = existing?.umstellung_deal_bk_id ?? null;

  if (zielStatus !== 'Umgestellt') {
    if (!vorher) return { id: null, neuerDeal: null };
    const d = await db.get(`SELECT * FROM deals_bk WHERE id=${p1}`, [vorher]);
    if (d && d.herkunft === UMSTELLUNG_HERKUNFT) {
      await loescheBkDeal(vorher, user);       // inkl. Storno und AE-Rueckbuchung
    }
    return { id: null, neuerDeal: null };
  }

  // Ausdrueckliche Verknuepfung eines bestehenden Deals
  if (body.umstellung_deal_bk_id != null) {
    const nr = Number(body.umstellung_deal_bk_id);
    const da = await db.get(`SELECT id FROM deals_bk WHERE id=${p1}`, [nr]);
    if (!da) { const e = new Error('Dauer-RaaS-Deal nicht gefunden'); e.statusCode = 400; throw e; }
    const schon = await db.get(
      `SELECT id FROM deals_vl WHERE umstellung_deal_bk_id=${p1} AND id <> ${p2}`, [nr, vlId ?? -1]);
    if (schon) { const e = new Error(`Dieser Deal hängt bereits an der Verlängerung #${schon.id}`); e.statusCode = 400; throw e; }
    return { id: nr, neuerDeal: null };
  }

  if (vorher) return { id: vorher, neuerDeal: null };   // schon verknuepft, nichts zu tun

  const u = body.umstellung;
  const fehler = pruefeUmstellung(u, vlFelder);
  if (fehler) { const e = new Error(fehler); e.statusCode = 400; throw e; }
  const datum = String(vlFelder.dauervertrag_datum || '').slice(0, 10);
  const neuerDeal = await erstelleBkDeal(bkBodyAus(vlFelder, u, datum, vlId), user);
  return { id: neuerDeal.id, neuerDeal };
}

// Der Stand des Dauer-RaaS-Deals wird IMMER live mitgelesen, nie kopiert — dasselbe Prinzip wie
// bei den Willkommensmeetings. Faellt der Deal weg, liefert der LEFT JOIN NULL und die Oberflaeche
// kann eine Umstellung ohne Umsatz als das anzeigen, was sie ist.
const BASE_SELECT = `
  SELECT d.*, c.name as company_name, c.currency, c.aktiv_ab, c.ae_ab_monat, k.name as kam_name, k.standort as kam_standort,
         u.ae_wert AS umstellung_ae_wert, u.status AS umstellung_status, u.monat AS umstellung_monat,
         u.gewonnen_monat AS umstellung_gewonnen_monat, u.kunde AS umstellung_kunde,
         u.dienstleistung AS umstellung_dienstleistung, u.herkunft AS umstellung_herkunft
  FROM deals_vl d
  LEFT JOIN companies c ON c.id = d.company_id
  LEFT JOIN employees k ON k.id = d.kam_id
  LEFT JOIN deals_bk u ON u.id = d.umstellung_deal_bk_id
`;

// Zustandsbasiert wie NK: Beitrag = ae_wert wenn Gewonnen, sonst 0 — im jeweiligen gewonnen_monat.
// Nur DE/AT haben VL-Spalten. Jan–Jun 2026: statische Sollwerte, keine Automation. 0-Zelle = live.
async function syncAeGesamtVL(deal, prev) {
  const oldGew = prev?.status === 'Gewonnen';
  const newGew = deal?.status === 'Gewonnen';
  if (!oldGew && !newGew) return;

  const old = oldGew ? { monat: prev.gewonnen_monat || null, ae: Number(prev.ae_wert) || 0, kam: prev.kam_id } : null;
  const neu = newGew ? { monat: deal.gewonnen_monat || null, ae: Number(deal.ae_wert) || 0, kam: deal.kam_id } : null;

  if (old && neu && old.monat && old.monat === neu.monat && old.kam === neu.kam) {
    await bookAeVL(old.monat, neu.kam, neu.ae - old.ae);
    return;
  }
  if (old && old.monat) await bookAeVL(old.monat, old.kam, -old.ae);
  if (neu && neu.monat) await bookAeVL(neu.monat, neu.kam, neu.ae);
}

async function bookAeVL(monat, kamId, aeDelta) {
  if (!monat || aeDelta === 0) return;
  if (monat <= '2026-06') return; // Jan–Jun 2026: statische Sollwerte, keine Automation
  const d = db.dialect;
  const p1 = d === 'postgres' ? '$1' : '?';
  const emp = await db.get(`SELECT standort FROM employees WHERE id=${p1}`, [kamId]);
  const standort = emp?.standort || '';
  const col = standort === 'Österreich' ? 'vl_at_ae'
    : (standort === 'Bonn' || standort === 'Braunschweig') ? 'vl_de_ae' : null;
  if (!col) return;

  const ag = await db.get(`SELECT * FROM ae_gesamt_monthly WHERE monat=${p1}`, [monat]);
  if (!ag) return;
  const n = v => Number(v) || 0;
  if (n(ag[col]) === 0) return; // 0 = live gerechnet, nicht in Snapshot buchen
  const newVal = Math.max(0, n(ag[col]) + aeDelta);
  if (d === 'postgres') {
    await db.run(`UPDATE ae_gesamt_monthly SET ${col}=$1, updated_at=NOW() WHERE monat=$2`, [newVal, monat]);
  } else {
    await db.run(`UPDATE ae_gesamt_monthly SET ${col}=?, updated_at=datetime('now') WHERE monat=?`, [newVal, monat]);
  }
}

function ownFilter(_req) {
  // VL und Kuendigungen: alle KAMs sehen alle Datensaetze (kein per-User-Filter)
  return null;
}

router.get('/', wrap(async (req, res) => {
  const { company_id, monat, gewonnen_monat, status, kam_id } = req.query;
  const conditions = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  const own = ownFilter(req);
  if (own) { conditions.push(`${own.field} = ${p()}`); params.push(own.value); }

  if (company_id)    { conditions.push(`d.company_id = ${p()}`);    params.push(company_id); }
  if (monat)         { conditions.push(`d.monat = ${p()}`);         params.push(monat); }
  if (gewonnen_monat){ conditions.push(`d.gewonnen_monat = ${p()}`);params.push(gewonnen_monat); }
  if (status)        { conditions.push(`d.status = ${p()}`);        params.push(status); }
  if (kam_id)        { conditions.push(`d.kam_id = ${p()}`);        params.push(kam_id); }
  // Kein aktiv_ab-Filter: Deal-LISTEN zeigen alle Companies; Stats/Auswertungen blenden aus.

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(await enrichDealsEur(await db.all(BASE_SELECT + where + ' ORDER BY d.datum DESC', params), VL_EUR_MAP));
}));

router.get('/:id', wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  const row = await db.get(BASE_SELECT + ` WHERE d.id=${p}`, [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(await enrichDealsEur(row, VL_EUR_MAP));
}));

router.post('/import-kontakt', wrap(async (req, res) => {
  const rows = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Keine Daten' });
  }
  const ALLOWED = ['gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt','terminiert','neuer_ap_intern'];
  let updated = 0;
  const errors = [];
  for (const row of rows) {
    if (!row.id) { errors.push('Zeile ohne ID übersprungen'); continue; }
    const toUpdate = ALLOWED.filter(f => Object.prototype.hasOwnProperty.call(row, f));
    if (toUpdate.length === 0) continue;
    try {
      if (db.dialect === 'postgres') {
        const set = toUpdate.map((f, i) => `${f}=$${i + 1}`).join(',');
        await db.run(
          `UPDATE deals_vl SET ${set}, updated_at=NOW() WHERE id=$${toUpdate.length + 1}`,
          [...toUpdate.map(f => row[f] || null), row.id]
        );
      } else {
        const set = toUpdate.map(f => `${f}=?`).join(',');
        db.run(
          `UPDATE deals_vl SET ${set}, updated_at=datetime('now') WHERE id=?`,
          [...toUpdate.map(f => row[f] || null), row.id]
        );
      }
      updated++;
    } catch (e) {
      errors.push(`ID ${row.id}: ${e.message}`);
    }
  }
  res.json({ updated, errors });
}));

router.post('/import-csv', wrap(async (req, res) => {
  const { rows, company_id } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'Keine Daten' });
  if (!company_id) return res.status(400).json({ error: 'company_id fehlt' });

  // KAM-Name -> id. Rollen-Liste ZENTRAL aus utils/rollen.js (KAM_ROLLEN), nicht als Literal:
  // vorher stand hier rolle='KAM', wodurch Closer-KAM, Account Manager und Multi allesamt
  // kam_id=NULL bekamen. Solange kam_id nur Zuordnung war, blieb das unbemerkt — seit dem
  // BK-Provisionskreis ist ein Deal ohne kam_id entgangene Provision, weil es keinen
  // Empfaenger gibt. Die Zuordnung MUSS deshalb dieselbe Rollen-Menge treffen wie das Formular.
  // Bewusst OHNE aktiv-Filter: vorher gab es keinen, und ein deaktivierter Mitarbeiter mit
  // historischen Vertraegen soll seine importierten Zeilen weiterhin zugeordnet bekommen.
  // Geaendert wird hier nur die ROLLEN-Menge, nichts sonst.
  const kamSql = `SELECT id, name FROM employees WHERE rolle IN (${kamRollenSql()})`;
  const kamRows = db.dialect === 'postgres' ? await db.all(kamSql) : db.all(kamSql);
  const kamMap = {};
  for (const k of kamRows) kamMap[k.name.trim().toLowerCase()] = k.id;

  let created = 0;
  const errors = [];

  for (const row of rows) {
    if (!row.kunde || !row.datum) {
      errors.push(`Übersprungen: Kunde oder Datum fehlt (${row.kunde || '?'})`);
      continue;
    }
    const monat = String(row.datum).slice(0, 7);
    const kam_id = kamMap[(row.kam_name || '').trim().toLowerCase()] || null;
    const angebotswert = row.angebotswert ? Number(row.angebotswert) || null : null;
    const laufzeit_monate = row.laufzeit_monate ? Number(row.laufzeit_monate) || null : null;
    const wie_vielt = row.wie_vielt_verlaengerung ? Number(row.wie_vielt_verlaengerung) || null : null;
    try {
      if (db.dialect === 'postgres') {
        await db.run(
          `INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,created_at,updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Offen',NOW(),NOW())`,
          [row.datum, monat, company_id, kam_id, row.kunde, row.dienstleistung || null,
           angebotswert, laufzeit_monate, wie_vielt, row.auslaufend_am || null]
        );
      } else {
        db.run(
          `INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,'Offen',datetime('now'),datetime('now'))`,
          [row.datum, monat, company_id, kam_id, row.kunde, row.dienstleistung || null,
           angebotswert, laufzeit_monate, wie_vielt, row.auslaufend_am || null]
        );
      }
      created++;
    } catch (e) {
      errors.push(`${row.kunde}: ${e.message}`);
    }
  }
  res.json({ created, errors });
}));

router.post('/', wrap(async (req, res) => {
  const body = { ...req.body };
  if (['bk_vertrieb'].includes(req.user.role) && req.user.employee_id) {
    body.kam_id = req.user.employee_id;
  }

  // Reihenfolge: erst die Umstellungs-Felder normalisieren, dann die Ereignisachse ableiten —
  // resolveGewonnenFelder liest bei Status 'Umgestellt' dauervertrag_datum.
  const zielStatus = body.status || 'Offen';
  const dv = normUmstellung(zielStatus, body, null);
  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder({ ...body, ...dv });
  const fields = ['datum','monat','company_id','kam_id','kunde','dienstleistung','angebotswert',
    'ae_wert','laufzeit_monate','status','wie_vielt_verlaengerung','kommentar',
    'abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt',
    'upsale_angesprochen','upsale_summe','upsale_angenommen','upsale_angenommen_summe',
    'weitergeben_an_vertrieb','terminiert','neuer_ap_intern',
    'dauervertrag_umgestellt','dauervertrag_ae_wert','dauervertrag_datum',
    'umstellung_deal_bk_id',
    'vertragsnummer','vertragsbeginn','ende_laufzeit','ende_kuendigungsfrist'];
  // Dauer-RaaS-Deal anlegen bzw. verknuepfen, BEVOR die Verlaengerung geschrieben wird: ein
  // Deal ohne seinen Umsatz waere ein gueltiger, aber falscher Zustand; ein Umsatz ohne Deal
  // eine unsichtbare Leiche. Scheitert das Schreiben, wird der eben angelegte Deal entfernt
  // (gleiches Muster wie bei den Willkommensmeetings).
  const ums = await synchronisiereUmstellung({
    zielStatus, body, existing: null, vlFelder: { ...body, ...dv }, vlId: null, user: req.user });
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'umstellung_deal_bk_id') return ums.id;
    if (f === 'abgerechnet') return body[f] ?? (body.status === 'Gewonnen' ? 'Nein' : null);
    if (f === 'upsale_angesprochen' || f === 'upsale_angenommen') return Number(body[f]) || 0;
    if (f === 'terminiert') return Number(body[f]) || 0;
    if (f in dv) return dv[f];
    if (f === 'neuer_ap_intern') {
      const v = body[f] ?? null;
      if (!v && body.weitergeben_an_vertrieb === 'Ja') return 'Vertrieb';
      if (!v && body.weitergeben_an_vertrieb === 'Nein' && body.kam_id) return String(body.kam_id);
      return v;
    }
    return body[f] ?? null;
  });

  let row;
  try {
    if (db.dialect === 'postgres') {
      const ph = fields.map((_,i) => `$${i+1}`).join(',');
      row = await db.get(`INSERT INTO deals_vl (${fields.join(',')}) VALUES (${ph}) RETURNING *`, values);
    } else {
      const ph = fields.map(() => '?').join(',');
      const result = db.run(`INSERT INTO deals_vl (${fields.join(',')}) VALUES (${ph})`, values);
      // ...dv/ums NACH dem Body spreaden: sonst gewaenne der rohe Body gegen die normalisierten
      // Werte und der Hook saehe einen anderen Stand als die Datenbank.
      row = { id: result.lastInsertRowid, ...body, ...dv, umstellung_deal_bk_id: ums.id,
        gewonnen_datum, gewonnen_monat };
    }
  } catch (e) {
    if (ums.neuerDeal) {
      try { await loescheBkDeal(ums.neuerDeal.id, req.user); }
      catch (e2) { console.error('[vl] Rueckbau Dauer-RaaS-Deal:', e2.message); }
    }
    throw e;
  }

  try { await syncAeGesamtVL(row, null); } catch (e) { console.error('[sync-vl] POST:', e.message); }
  try { await provisionSyncBk(row, 'vl'); } catch (e) { console.error('[prov-vl] POST:', e.message); }
  await logAudit({ user: req.user, action: 'create', entityType: 'deal_vl', entityId: row.id, newData: row });
  res.status(201).json(row);
}));

router.put('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_vl WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_vl WHERE id=?', [req.params.id]);

  // VL: Account Manager dürfen das Datum nachträglich korrigieren (fehlerhafte Import-Daten),
  // nicht nur Admins. NK/BK bleiben admin-only (Default-Guard).
  const datumFehler = pruefeDatumsaenderung(req, existing, ['admin', 'superadmin', 'bk_vertrieb', 'backoffice', 'vertriebsleitung']);
  if (datumFehler) return res.status(403).json({ error: datumFehler });

  // ZWINGEND VOR resolveGewonnenFelder: die Ableitung prueft body.status. Fehlt der Status im
  // Teil-Body, liefe sie in den "nicht gewonnen"-Zweig und setzte gewonnen_datum/-monat auf NULL.
  // Die Feld-Erhaltung weiter unten greift dafuer NICHT — diese beiden Felder kommen nicht aus
  // `existing`, sondern aus dem Rueckgabewert hier. Seit am VL-PUT ein Provisions-Hook haengt,
  // waere die Folge nicht nur ein entwerteter Deal, sondern eine stornierte Provision.
  // (Gleiches Muster wie in deals_bk.js und wie angebot_erstellt in deals_nk.js.)
  const gwBody = { ...req.body };
  if (gwBody.status === undefined && existing) gwBody.status = existing.status;
  if (gwBody.gewonnen_datum === undefined && existing) gwBody.gewonnen_datum = existing.gewonnen_datum;

  // Umstellungs-Felder aus dem GEMERGTEN Status ableiten (nicht mehr aus einem Haken im Body):
  // Status und Flag koennen dadurch nicht auseinanderlaufen. Muss vor resolveGewonnenFelder
  // stehen, das bei 'Umgestellt' dauervertrag_datum liest.
  const zielStatus = gwBody.status;
  const dv = normUmstellung(zielStatus, req.body, existing);
  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder({ ...gwBody, ...dv }, existing);
  const fields = ['datum','monat','company_id','kam_id','kunde','dienstleistung','angebotswert',
    'ae_wert','laufzeit_monate','status','wie_vielt_verlaengerung','kommentar',
    'abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt',
    'upsale_angesprochen','upsale_summe','upsale_angenommen','upsale_angenommen_summe',
    'weitergeben_an_vertrieb','terminiert','neuer_ap_intern',
    'dauervertrag_umgestellt','dauervertrag_ae_wert','dauervertrag_datum',
    'umstellung_deal_bk_id',
    'vertragsnummer','vertragsbeginn','ende_laufzeit','ende_kuendigungsfrist'];
  // TEIL-UPDATES: Fehlt ein Feld im Body, bleibt der bestehende Wert stehen (siehe unten in
  // `values`). Frueher fiel jedes nicht mitgeschickte Feld auf NULL — das loeschte bei einem
  // Teil-Body die Klassifizierung des Deals. Kritisch war kam_id: die Spalte ist NULLABLE, der
  // KAM verschwand also STILL und der Deal fiel aus jeder Standort-Spalte (VL-Seite wie
  // Auswertung), ohne Fehlermeldung. datum/monat/company_id/kunde/status sind NOT NULL und
  // krachten stattdessen mit einem 500er — ein Teil-PUT war damit ohnehin unbrauchbar.
  // Ueber die UI war beides nicht erreichbar (das VL-Formular schickt `initial`, also die volle
  // Deal-Zeile; die Kuendigungen-Seite nutzt PATCH) — der Schutz gilt API-Skripten und kuenftigen
  // Aufrufern. Ein EXPLIZITES null im Body loescht weiterhin: PUT bleibt PUT.
  // Dauer-RaaS-Deal anlegen, verknuepfen oder — bei Ruecknahme der Umstellung — wieder entfernen.
  // Wirft 400, wenn Angaben fehlen; dann ist noch nichts geschrieben.
  const ums = await synchronisiereUmstellung({
    zielStatus, body: req.body, existing,
    vlFelder: { ...existing, ...req.body, ...dv }, vlId: Number(req.params.id), user: req.user });
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'umstellung_deal_bk_id') return ums.id;
    if (f === 'abgerechnet') {
      if (req.body[f] === undefined) return existing?.abgerechnet ?? null;
      return req.body[f] ?? (gwBody.status === 'Gewonnen' ? 'Nein' : null);   // gemergter Status
    }
    if (f === 'upsale_angesprochen' || f === 'upsale_angenommen') {
      if (req.body[f] === undefined) return Number(existing?.[f]) || 0;
      return Number(req.body[f]) || 0;
    }
    if (f in dv) return dv[f];
    if (f === 'terminiert') {
      if (req.body.terminiert !== undefined) return Number(req.body.terminiert) || 0;
      return Number(existing?.terminiert) || 0;
    }
    if (f === 'neuer_ap_intern') {
      if (req.body.neuer_ap_intern !== undefined) return req.body.neuer_ap_intern ?? null;
      const weitergeben = req.body.weitergeben_an_vertrieb;
      const kamId = req.body.kam_id || existing?.kam_id;
      if (weitergeben === 'Ja') return 'Vertrieb';
      if (weitergeben === 'Nein' && kamId) return String(kamId);
      return existing?.neuer_ap_intern ?? null;
    }
    // Teil-Update: nicht mitgeschickte Felder behalten ihren Wert. Explizites null loescht.
    if (req.body[f] === undefined) return existing?.[f] ?? null;
    return req.body[f] ?? null;
  });

  let row;
  try {
    if (db.dialect === 'postgres') {
      const set = fields.map((f,i) => `${f}=$${i+1}`).join(',');
      row = await db.get(
        `UPDATE deals_vl SET ${set}, updated_at=NOW() WHERE id=$${fields.length+1} RETURNING *`,
        [...values, req.params.id]
      );
    } else {
      const set = fields.map(f => `${f}=?`).join(',');
      db.run(`UPDATE deals_vl SET ${set}, updated_at=datetime('now') WHERE id=?`, [...values, req.params.id]);
      row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
    }
  } catch (e) {
    if (ums.neuerDeal) {
      try { await loescheBkDeal(ums.neuerDeal.id, req.user); }
      catch (e2) { console.error('[vl] Rueckbau Dauer-RaaS-Deal:', e2.message); }
    }
    throw e;
  }

  try { await syncAeGesamtVL(row, existing); } catch (e) { console.error('[sync-vl] PUT:', e.message); }
  // State-based: provisionSyncBk rechnet das Soll des NEUEN Zustands und bucht die Differenz.
  // Damit sind Gewinn, Storno, ae_wert-Aenderung und KAM-Wechsel mit einem Aufruf abgedeckt.
  try { await provisionSyncBk(row, 'vl'); } catch (e) { console.error('[prov-vl] PUT:', e.message); }
  await logAudit({ user: req.user, action: 'update', entityType: 'deal_vl', entityId: Number(req.params.id), oldData: existing, newData: row });
  res.json(row);
}));

router.patch('/:id/kontakt', wrap(async (req, res) => {
  const KONTAKT_FIELDS = ['gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt','terminiert','neuer_ap_intern'];
  const toUpdate = KONTAKT_FIELDS.filter(f => Object.prototype.hasOwnProperty.call(req.body, f));
  if (toUpdate.length === 0) return res.json({ ok: true });

  let row;
  if (db.dialect === 'postgres') {
    const set = toUpdate.map((f, i) => `${f}=$${i + 1}`).join(',');
    row = await db.get(
      `UPDATE deals_vl SET ${set}, updated_at=NOW() WHERE id=$${toUpdate.length + 1} RETURNING *`,
      [...toUpdate.map(f => req.body[f] ?? null), req.params.id]
    );
  } else {
    const set = toUpdate.map(f => `${f}=?`).join(',');
    db.run(
      `UPDATE deals_vl SET ${set}, updated_at=datetime('now') WHERE id=?`,
      [...toUpdate.map(f => req.body[f] ?? null), req.params.id]
    );
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }
  res.json(row);
}));

router.patch('/:id/upsale', wrap(async (req, res) => {
  const { upsale_angesprochen, upsale_summe, upsale_angenommen, upsale_angenommen_summe } = req.body;
  let row;
  if (db.dialect === 'postgres') {
    row = await db.get(
      `UPDATE deals_vl SET upsale_angesprochen=$1, upsale_summe=$2, upsale_angenommen=$3,
       upsale_angenommen_summe=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
      [upsale_angesprochen ?? 0, upsale_summe ?? null, upsale_angenommen ?? 0, upsale_angenommen_summe ?? null, req.params.id]
    );
  } else {
    db.run(
      `UPDATE deals_vl SET upsale_angesprochen=?, upsale_summe=?, upsale_angenommen=?,
       upsale_angenommen_summe=?, updated_at=datetime('now') WHERE id=?`,
      [upsale_angesprochen ?? 0, upsale_summe ?? null, upsale_angenommen ?? 0, upsale_angenommen_summe ?? null, req.params.id]
    );
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }
  res.json(row);
}));

router.delete('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_vl WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_vl WHERE id=?', [req.params.id]);

  if (existing?.status === 'Gewonnen') {
    try { await syncAeGesamtVL({ ...existing, status: 'Gelöscht' }, existing); } catch (e) { console.error('[sync-vl] DELETE:', e.message); }
    // Storno VOR dem DELETE: die Engine liest den Deal nicht mehr, wenn die Zeile weg ist.
    try { await provisionSyncBk({ ...existing, status: 'Gelöscht' }, 'vl'); } catch (e) { console.error('[prov-vl] DELETE:', e.message); }
  }
  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM deals_vl WHERE id=${p}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'deal_vl', entityId: Number(req.params.id), oldData: existing });
  res.status(204).end();
}));

module.exports = router;
module.exports.syncAeGesamtVL = syncAeGesamtVL; // für Regressionstests
