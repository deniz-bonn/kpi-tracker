const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { logAudit }   = require('../utils/audit');
const { pruefeDatumsaenderung } = require('../utils/dealGuards');
const { enrichDealsEur } = require('../utils/currency');
const { resolveGewonnenFelder } = require('../utils/gewonnen');
// Provisions-Hook des Abrechnungskreises "Bestandskundenvertrieb" (Upsell 3 % an den KAM).
// Wie in deals_nk.js laeuft jeder Aufruf in try/catch: ein Fehler in der Provisionsrechnung
// darf das Speichern des Deals niemals brechen.
const { provisionSyncBk } = require('../utils/provisionenBk');

router.use(requireAuth);

const BASE_SELECT = `
  SELECT d.*, c.name as company_name, c.currency, c.aktiv_ab, c.ae_ab_monat, k.name as kam_name, k.standort as kam_standort
  FROM deals_bk d
  LEFT JOIN companies c ON c.id = d.company_id
  LEFT JOIN employees k ON k.id = d.kam_id
`;

// Syncs bk_at_ae in ae_gesamt_monthly for Österreich deals.
// Other standorts (Bonn, BS, CH) are always read live from deals_bk — no sync needed.
// Zustandsbasiert wie NK: Beitrag = ae_wert wenn Gewonnen, sonst 0 — im jeweiligen gewonnen_monat.
// Nur DE/AT haben BK-Spalten (Schweiz wird live gerechnet). 0-Zelle = live -> nicht bebuchen.
async function syncAeGesamtBK(deal, prev) {
  const oldGew = prev?.status === 'Gewonnen';
  const newGew = deal?.status === 'Gewonnen';
  if (!oldGew && !newGew) return;

  const old = oldGew ? { monat: prev.gewonnen_monat || null, ae: Number(prev.ae_wert) || 0, kam: prev.kam_id } : null;
  const neu = newGew ? { monat: deal.gewonnen_monat || null, ae: Number(deal.ae_wert) || 0, kam: deal.kam_id } : null;

  if (old && neu && old.monat && old.monat === neu.monat && old.kam === neu.kam) {
    await bookAeBK(old.monat, neu.kam, neu.ae - old.ae);
    return;
  }
  if (old && old.monat) await bookAeBK(old.monat, old.kam, -old.ae);
  if (neu && neu.monat) await bookAeBK(neu.monat, neu.kam, neu.ae);
}

async function bookAeBK(monat, kamId, aeDelta) {
  if (!monat || aeDelta === 0) return;
  const d = db.dialect;
  const p1 = d === 'postgres' ? '$1' : '?';
  const emp = await db.get(`SELECT standort FROM employees WHERE id=${p1}`, [kamId]);
  const standort = emp?.standort || '';
  const col = standort === 'Österreich' ? 'bk_at_ae'
    : (standort === 'Bonn' || standort === 'Braunschweig') ? 'bk_de_ae' : null;
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

router.get('/', wrap(async (req, res) => {
  const { company_id, monat, gewonnen_monat, status, kam_id } = req.query;
  const conditions = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  if (company_id)    { conditions.push(`d.company_id = ${p()}`);    params.push(company_id); }
  if (monat)         { conditions.push(`d.monat = ${p()}`);         params.push(monat); }
  if (gewonnen_monat){ conditions.push(`d.gewonnen_monat = ${p()}`);params.push(gewonnen_monat); }
  if (status)        { conditions.push(`d.status = ${p()}`);        params.push(status); }
  if (kam_id)        { conditions.push(`d.kam_id = ${p()}`);        params.push(kam_id); }
  // Kein aktiv_ab-Filter: Deal-LISTEN zeigen alle Companies; Stats/Auswertungen blenden aus.

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(await enrichDealsEur(await db.all(BASE_SELECT + where + ' ORDER BY d.datum DESC', params)));
}));

router.get('/:id', wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  const row = await db.get(BASE_SELECT + ` WHERE d.id=${p}`, [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(await enrichDealsEur(row));
}));

router.post('/', wrap(async (req, res) => {
  const body = { ...req.body };
  if (['bk_vertrieb'].includes(req.user.role) && req.user.employee_id) {
    body.kam_id = req.user.employee_id;
  }

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(body);
  const fields = ['datum','monat','company_id','kam_id','kunde','angebotsnummer','dienstleistung',
    'angebotswert','laufzeit_monate','status','ae_wert','kommentar',
    'automatische_verlaengerung','abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'termin_mit_daniel'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return body[f] ?? (body.status === 'Gewonnen' ? 'Nein' : null);
    return body[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const ph = fields.map((_,i) => `$${i+1}`).join(',');
    row = await db.get(`INSERT INTO deals_bk (${fields.join(',')}) VALUES (${ph}) RETURNING *`, values);
  } else {
    const ph = fields.map(() => '?').join(',');
    const result = db.run(`INSERT INTO deals_bk (${fields.join(',')}) VALUES (${ph})`, values);
    row = { id: result.lastInsertRowid, ...body, gewonnen_datum, gewonnen_monat };
  }

  try { await syncAeGesamtBK(row, null); } catch (e) { console.error('[sync-bk] POST:', e.message); }
  try { await provisionSyncBk(row, 'bk'); } catch (e) { console.error('[prov-bk] POST:', e.message); }
  await logAudit({ user: req.user, action: 'create', entityType: 'deal_bk', entityId: row.id, newData: row });
  res.status(201).json(row);
}));

router.put('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_bk WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_bk WHERE id=?', [req.params.id]);

  // Datum nachträglich ändern ist Admin-Recht (die Oberfläche sperrt es entsprechend).
  const datumFehler = pruefeDatumsaenderung(req, existing);
  if (datumFehler) return res.status(403).json({ error: datumFehler });

  // TEIL-UPDATES: Fehlt ein Feld im Body, bleibt der bestehende Wert stehen (siehe `values`).
  // Frueher fiel jedes nicht mitgeschickte Feld auf NULL. STILL geloescht wurden dabei die
  // NULLABLE-Spalten — allen voran kam_id: der KAM verschwand ohne Fehlermeldung, der Deal fiel
  // aus jeder Standort-Auswertung. Seit dem BK-Provisionskreis ist das keine Kosmetik mehr,
  // sondern entgangene Provision: ohne kam_id gibt es keinen Empfaenger, und der Hook unten
  // wuerde eine bereits gebuchte Provision als "Rolle entfaellt" zurueckbuchen.
  // NOT NULL (datum/monat/company_id/kunde/status) krachte stattdessen mit einem 500er.
  // Ueber die UI war beides nicht erreichbar (DealsBK.jsx schickt die volle Deal-Zeile) — der
  // Schutz gilt API-Skripten, Importen und kuenftigen Aufrufern.
  // Ein EXPLIZITES null im Body loescht weiterhin: PUT bleibt PUT.
  const body = { ...req.body };
  // ZWINGEND VOR resolveGewonnenFelder: die Ableitung prueft body.status. Fehlt der im Teil-Body,
  // liefe sie in den "nicht gewonnen"-Zweig und setzte gewonnen_datum/-monat auf NULL — der Deal
  // waere still entwertet und der Provisions-Hook wuerde stornieren. (Gleiches Muster wie
  // angebot_erstellt in deals_nk.js.)
  if (body.status === undefined && existing) body.status = existing.status;
  if (body.gewonnen_datum === undefined && existing) body.gewonnen_datum = existing.gewonnen_datum;

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(body, existing);
  const fields = ['datum','monat','company_id','kam_id','kunde','angebotsnummer','dienstleistung',
    'angebotswert','laufzeit_monate','status','ae_wert','kommentar',
    'automatische_verlaengerung','abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'termin_mit_daniel'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') {
      if (req.body[f] === undefined) return existing?.abgerechnet ?? null;
      return req.body[f] ?? (body.status === 'Gewonnen' ? 'Nein' : null);
    }
    // Teil-Update: nicht mitgeschickte Felder behalten ihren Wert. Explizites null loescht.
    if (req.body[f] === undefined) return existing?.[f] ?? null;
    return req.body[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const set = fields.map((f,i) => `${f}=$${i+1}`).join(',');
    row = await db.get(
      `UPDATE deals_bk SET ${set}, updated_at=NOW() WHERE id=$${fields.length+1} RETURNING *`,
      [...values, req.params.id]
    );
  } else {
    const set = fields.map(f => `${f}=?`).join(',');
    db.run(`UPDATE deals_bk SET ${set}, updated_at=datetime('now') WHERE id=?`, [...values, req.params.id]);
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }

  try { await syncAeGesamtBK(row, existing); } catch (e) { console.error('[sync-bk] PUT:', e.message); }
  // State-based: provisionSyncBk rechnet das Soll des NEUEN Zustands und bucht die Differenz.
  // Damit sind Gewinn, Storno, ae_wert-Aenderung und KAM-Wechsel mit einem Aufruf abgedeckt.
  try { await provisionSyncBk(row, 'bk'); } catch (e) { console.error('[prov-bk] PUT:', e.message); }
  await logAudit({ user: req.user, action: 'update', entityType: 'deal_bk', entityId: Number(req.params.id), oldData: existing, newData: row });
  res.json(row);
}));

router.delete('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_bk WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_bk WHERE id=?', [req.params.id]);

  if (existing?.status === 'Gewonnen') {
    try { await syncAeGesamtBK({ ...existing, status: 'Gelöscht' }, existing); } catch (e) { console.error('[sync-bk] DELETE:', e.message); }
    // Storno VOR dem DELETE: die Engine liest den Deal nicht mehr, wenn die Zeile weg ist.
    // 'Gelöscht' ist kein provisionsrelevanter Status -> Soll 0 -> Rueckbuchung der Ist-Summe.
    try { await provisionSyncBk({ ...existing, status: 'Gelöscht' }, 'bk'); } catch (e) { console.error('[prov-bk] DELETE:', e.message); }
  }
  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM deals_bk WHERE id=${p}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'deal_bk', entityId: Number(req.params.id), oldData: existing });
  res.status(204).end();
}));

module.exports = router;
module.exports.syncAeGesamtBK = syncAeGesamtBK; // für Regressionstests
