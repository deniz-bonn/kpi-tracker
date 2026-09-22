const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { normalisiereLeereFelder } = require('../utils/leereFelder');
const { logAudit }   = require('../utils/audit');
const { pruefeDatumsaenderung } = require('../utils/dealGuards');
const { enrichDealsEur } = require('../utils/currency');
const { resolveGewonnenFelder } = require('../utils/gewonnen');
// Provisions-Hook des Abrechnungskreises "Bestandskundenvertrieb" (Upsell 3 % an den KAM).
// Wie in deals_nk.js laeuft jeder Aufruf in try/catch: ein Fehler in der Provisionsrechnung
// darf das Speichern des Deals niemals brechen.
const { provisionSyncBk } = require('../utils/provisionenBk');

router.use(requireAuth);
// Geleerte Zahlen-/Datumsfelder kommen als '' an; Postgres lehnt das ab (500).
// Siehe utils/leereFelder.js — die Oberflaeche filtert bereits, das hier gilt API und Import.
router.use(normalisiereLeereFelder);
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

// Schreibbare Spalten eines BK-Deals. EINE Liste fuer POST und fuer den WM-Bereich —
// sonst driftet die Feld-Paritaet zwischen "manuell in BK angelegt" und "aus einem
// Willkommensmeeting entstanden" auseinander, und genau das soll ausgeschlossen sein.
const BK_FELDER = ['datum','monat','company_id','kam_id','kunde','angebotsnummer','dienstleistung',
  'angebotswert','laufzeit_monate','status','ae_wert','kommentar',
  'automatische_verlaengerung','abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
  'termin_mit_daniel','herkunft'];

/**
 * Legt EINEN BK-Deal an — der einzige Schreibpfad, inklusive aller Folgewirkungen.
 *
 * Bewusst als Funktion und nicht nur als Route-Handler: Der Bereich "Willkommensmeetings" legt
 * seinen Deal ueber DIESE Funktion an, nicht per eigenem INSERT. Grund: Die Hooks haengen an der
 * Route, nicht an der Tabelle — es gibt keinen DB-Trigger auf deals_bk. Ein Direkt-INSERT
 * verloere AE-Snapshot, Provisionsbuchung und Audit-Eintrag dauerhaft, und die Felder koennten
 * still auseinanderlaufen.
 *
 * KAM-REGEL: Die eigene employee_id wird nur eingesetzt, wenn KEINE kam_id mitkommt
 * ("nur wenn leer", Muster aus deals_nk.js:191). Frueher ueberschrieb die Route sie fuer die
 * Rolle bk_vertrieb bedingungslos — damit waere ein Deal, den jemand fuer einen Kollegen erfasst,
 * samt AE und 3 % Provision beim Erfasser gelandet. Fuer den normalen BK-Anlageweg aendert sich
 * nichts: dort zeigt das Formular das KAM-Feld fuer bk_vertrieb gar nicht erst an (canSeeAll),
 * es kommt also weiterhin leer an und wird wie bisher gefuellt.
 */
async function erstelleBkDeal(body, user) {
  const b = { ...body };
  if (!b.kam_id && ['bk_vertrieb'].includes(user?.role) && user?.employee_id) {
    b.kam_id = user.employee_id;
  }

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(b);
  const values = BK_FELDER.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return b[f] ?? (b.status === 'Gewonnen' ? 'Nein' : null);
    return b[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const ph = BK_FELDER.map((_, i) => `$${i + 1}`).join(',');
    row = await db.get(`INSERT INTO deals_bk (${BK_FELDER.join(',')}) VALUES (${ph}) RETURNING *`, values);
  } else {
    const ph = BK_FELDER.map(() => '?').join(',');
    const result = db.run(`INSERT INTO deals_bk (${BK_FELDER.join(',')}) VALUES (${ph})`, values);
    row = { id: result.lastInsertRowid, ...b, gewonnen_datum, gewonnen_monat };
  }

  try { await syncAeGesamtBK(row, null); } catch (e) { console.error('[sync-bk] create:', e.message); }
  try { await provisionSyncBk(row, 'bk'); } catch (e) { console.error('[prov-bk] create:', e.message); }
  await logAudit({ user, action: 'create', entityType: 'deal_bk', entityId: row.id, newData: row });
  return row;
}

router.post('/', wrap(async (req, res) => {
  res.status(201).json(await erstelleBkDeal(req.body, req.user));
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
  const fields = BK_FELDER;   // dieselbe Liste wie beim Anlegen — inkl. herkunft, das sonst
                              // bei jedem Speichern still verloren ginge (die Route verwirft
                              // jedes Feld ausserhalb dieser Liste kommentarlos).
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
  // Umstellungs-Angebot angenommen oder zurueckgenommen -> Verlaengerungs-Deal nachfuehren.
  const flip = await fuehreUmstellungNach(existing, row, req.user);
  await logAudit({ user: req.user, action: 'update', entityType: 'deal_bk', entityId: Number(req.params.id), oldData: existing, newData: row });
  res.json(flip ? { ...row, umstellung_vl: flip } : row);
}));

// ── Automatik BK -> VL ───────────────────────────────────────────────────────
//
// Ein Umstellungs-Angebot (BK-Deal mit herkunft='vl_umstellung', Status 'Offen') wird angenommen:
// der verknuepfte Verlaengerungs-Deal wechselt auf 'Umgestellt'. Wird die Annahme zurueckgenommen,
// geht er auf 'Offen' zurueck.
//
// WARUM HIER UND NICHT IN erstelleBkDeal(): Jene Funktion laeuft im VL-POST/PUT VOR dem
// deals_vl-UPDATE. Ein dort geschriebener VL-Zustand wuerde von den bereits berechneten `values`
// kommentarlos ueberschrieben, und syncAeGesamtVL liefe zweimal mit unterschiedlichem `prev`.
//
// WARUM DIREKT SCHREIBEN UND NICHT UEBER DIE VL-ROUTE: Die VL-Route ruft ihrerseits
// synchronisiereUmstellung, das wieder auf deals_bk zugreift — ein Zyklus. Wir schreiben deshalb
// gezielt und rufen die VL-Hooks selbst, GENAU EINMAL. Damit kann keine Schleife entstehen, statt
// sich auf einen Early Return zu verlassen, den ein spaeterer Umbau entfernen koennte.
//
// syncAeGesamtVL ist delta-basiert und NICHT idempotent: `prev` muss der Stand unmittelbar vor
// dem Schreiben sein, und der Aufruf darf sich nicht wiederholen. provisionSyncBk ist dagegen
// zustandsbasiert und vertraegt Wiederholung.
async function fuehreUmstellungNach(prev, row, user) {
  if (!row || row.herkunft !== 'vl_umstellung') return null;
  const wurdeGewonnen = prev?.status !== 'Gewonnen' && row.status === 'Gewonnen';
  const nichtMehrGewonnen = prev?.status === 'Gewonnen' && row.status !== 'Gewonnen';
  if (!wurdeGewonnen && !nichtMehrGewonnen) return null;

  const p = db.dialect === 'postgres' ? (i) => `$${i}` : () => '?';
  try {
    const vl = await db.get(`SELECT * FROM deals_vl WHERE umstellung_deal_bk_id=${p(1)}`, [row.id]);
    if (!vl) return null;

    // Lazy require: deals_vl laedt beim Start deals_bk (erstelleBkDeal). Ein Require auf
    // Modulebene waere ein Zyklus — index.js laedt deals_bk zuerst, deals_vl waere dann noch
    // ein leeres Objekt. Zur Aufrufzeit sind beide Module fertig geladen.
    const { syncAeGesamtVL } = require('./deals_vl');
    const { toYmd } = require('../utils/gewonnen');

    const zielStatus = wurdeGewonnen ? 'Umgestellt' : 'Offen';
    // Reihenfolge zwingend: erst das Datum, dann der Status. resolveGewonnenFelder leitet die
    // Ereignisachse bei 'Umgestellt' aus dauervertrag_datum ab und wirft ohne es einen 400er.
    const datum = wurdeGewonnen ? (toYmd(row.gewonnen_datum) || toYmd(row.datum)) : null;
    const monat = datum ? datum.slice(0, 7) : null;

    const felder = ['status', 'dauervertrag_umgestellt', 'dauervertrag_datum', 'gewonnen_datum', 'gewonnen_monat'];
    const werte = [zielStatus, wurdeGewonnen ? 1 : 0, datum, datum, monat];
    const set = felder.map((f, i) => `${f}=${p(i + 1)}`).join(',');
    const stamp = db.dialect === 'postgres' ? 'NOW()' : `datetime('now')`;
    await db.run(`UPDATE deals_vl SET ${set}, updated_at=${stamp} WHERE id=${p(felder.length + 1)}`,
      [...werte, vl.id]);
    const neu = await db.get(`SELECT * FROM deals_vl WHERE id=${p(1)}`, [vl.id]);

    // Die VL-Hooks genau einmal, mit dem Stand UNMITTELBAR davor als prev.
    try { await syncAeGesamtVL(neu, vl); } catch (e) { console.error('[sync-vl] flip:', e.message); }
    try { await provisionSyncBk(neu, 'vl'); } catch (e) { console.error('[prov-vl] flip:', e.message); }
    await logAudit({ user, action: 'update', entityType: 'deal_vl', entityId: vl.id,
      oldData: vl, newData: neu });
    return { id: vl.id, von: vl.status, nach: zielStatus };
  } catch (e) {
    // Fehlschlag darf das Speichern des BK-Deals nicht brechen — aber er darf auch nicht
    // verschwinden: sonst stuende ein gewonnenes Angebot neben einer Verlaengerung, die noch
    // laeuft, und beide wuerden gezaehlt.
    console.error('[umstellung] Nachfuehrung des VL-Deals fehlgeschlagen:', e.message);
    return null;
  }
}

/**
 * Deal loeschen — inklusive Storno, AE-Rueckbuchung und Aufraeumen der Verknuepfungen.
 *
 * Als Funktion und nicht nur als Route, weil der Bereich "Vertragsverlaengerungen" sie braucht:
 * Wird eine Umstellung auf Dauer-RaaS zurueckgenommen, muss der dafuer angelegte BK-Deal mitsamt
 * seiner 3 % verschwinden. Ein eigener DELETE dort wuerde Storno und AE-Rueckbuchung verlieren.
 */
async function loescheBkDeal(id, user) {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  const existing = await db.get(`SELECT * FROM deals_bk WHERE id=${p}`, [id]);
  if (!existing) return null;

  if (existing.status === 'Gewonnen') {
    try { await syncAeGesamtBK({ ...existing, status: 'Gelöscht' }, existing); } catch (e) { console.error('[sync-bk] DELETE:', e.message); }
    try { await provisionSyncBk({ ...existing, status: 'Gelöscht' }, 'bk'); } catch (e) { console.error('[prov-bk] DELETE:', e.message); }
  }
  try {
    await db.run(`UPDATE willkommensmeetings SET deal_entfernt = 1 WHERE deal_bk_id = ${p}`, [id]);
  } catch (e) { console.error('[wm] DELETE-Markierung:', e.message); }
  // Die Verknuepfung im VL-Deal ausdruecklich loesen statt auf ON DELETE SET NULL zu vertrauen:
  // unter Postgres greift der Fremdschluessel, unter SQLite nur bei eingeschaltetem PRAGMA — und
  // ein verwaister Zeiger waere eine Umstellung, deren Umsatz nicht mehr auffindbar ist.
  try {
    await db.run(`UPDATE deals_vl SET umstellung_deal_bk_id = NULL WHERE umstellung_deal_bk_id = ${p}`, [id]);
  } catch (e) { console.error('[vl] Umstellungs-Verknuepfung loesen:', e.message); }

  await db.run(`DELETE FROM deals_bk WHERE id=${p}`, [id]);
  await logAudit({ user, action: 'delete', entityType: 'deal_bk', entityId: Number(id), oldData: existing });
  return existing;
}

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
  // Haengt an diesem Deal ein Willkommensmeeting, bleibt das Meeting bestehen (es hat ja
  // stattgefunden) — aber es muss sich merken, DASS hier einmal ein Angebot hing. Ohne dieses
  // Flag waere nach dem Loeschen nicht mehr unterscheidbar, ob nie eines platziert wurde
  // (zaehlt gegen die Quote) oder ob es nachtraeglich entfernt wurde.
  // Reihenfolge zwingend: VOR dem DELETE, danach ist deal_bk_id bereits NULL.
  try {
    await db.run(`UPDATE willkommensmeetings SET deal_entfernt = 1 WHERE deal_bk_id = ${p}`, [req.params.id]);
  } catch (e) { console.error('[wm] DELETE-Markierung:', e.message); }
  try {
    await db.run(`UPDATE deals_vl SET umstellung_deal_bk_id = NULL WHERE umstellung_deal_bk_id = ${p}`, [req.params.id]);
  } catch (e) { console.error('[vl] Umstellungs-Verknuepfung loesen:', e.message); }
  await db.run(`DELETE FROM deals_bk WHERE id=${p}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'deal_bk', entityId: Number(req.params.id), oldData: existing });
  res.status(204).end();
}));

module.exports = router;
module.exports.syncAeGesamtBK = syncAeGesamtBK; // für Regressionstests
// Der Bereich "Willkommensmeetings" legt seine Deals hierueber an — nicht per eigenem INSERT.
module.exports.erstelleBkDeal = erstelleBkDeal;
// Der Bereich "Vertragsverlaengerungen" nimmt Umstellungen zurueck und muss dabei den dafuer
// angelegten Dauer-RaaS-Deal mitsamt Storno und AE-Rueckbuchung entfernen.
module.exports.loescheBkDeal = loescheBkDeal;
module.exports.BK_FELDER = BK_FELDER;
