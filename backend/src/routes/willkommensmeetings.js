const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { logAudit }   = require('../utils/audit');
// Der Deal wird ueber DIESE Funktion angelegt, nicht per eigenem INSERT: die Hooks (AE-Snapshot,
// BK-Provision, Audit) haengen an der Route, nicht an der Tabelle — es gibt keinen DB-Trigger auf
// deals_bk. Ein Direkt-INSERT verloere sie dauerhaft und die Felder koennten auseinanderlaufen.
const { erstelleBkDeal } = require('./deals_bk');
const { loadRates, toEur } = require('../utils/currency');

// ─────────────────────────────────────────────────────────────────────────────
// Willkommensmeetings (WM) — an den Bestandskunden-Bereich angelagert.
//
// REFERENZ STATT KOPIE: Das im Meeting platzierte Angebot ist ein regulaerer deals_bk-Deal.
// Dieses Modul haelt nur die Verknuepfung (deal_bk_id) und liest den LIVE-Stand des Deals fuer
// seine Quoten. Es gibt hier bewusst keinen eigenen Bearbeitungspfad fuer den Deal — die
// Oberflaeche oeffnet dasselbe BK-Formular und schickt an dieselbe BK-Route ("zwei Tueren,
// ein Deal"). Damit KANN es keine zwei Staende desselben Angebots geben.
//
// Zugriff wie der BK-Bereich: nur requireAuth. Das ist bewusst gespiegelt und keine Nachlaessigkeit
// — deals_bk.js haelt es genauso, und Team-Transparenz ist im BK/VL-Bereich gewollt. Wer das
// spaeter enger zieht, muss beide Bereiche gemeinsam anfassen, sonst entsteht ein Schlupfloch.
// ─────────────────────────────────────────────────────────────────────────────

router.use(requireAuth);

const P  = db.dialect === 'postgres';
const ph = i => (P ? `$${i}` : '?');

// Der Deal-Stand wird IMMER live mitgelesen, nie kopiert. Faellt der Deal weg, liefert der
// LEFT JOIN NULL und die Quoten rechnen ihn korrekt nicht mehr mit.
const BASE_SELECT = `
  SELECT w.*,
         e.name AS gefuehrt_von_name, e.rolle AS gefuehrt_von_rolle, e.standort AS standort,
         e.bk_gruppe AS bk_gruppe,
         d.status AS deal_status, d.ae_wert AS deal_ae_wert, d.angebotswert AS deal_angebotswert,
         d.gewonnen_monat AS deal_gewonnen_monat, d.kunde AS deal_kunde,
         d.company_id AS deal_company_id, c.currency AS deal_currency, d.monat AS deal_monat
    FROM willkommensmeetings w
    LEFT JOIN employees e  ON e.id = w.gefuehrt_von
    LEFT JOIN deals_bk  d  ON d.id = w.deal_bk_id
    LEFT JOIN companies c  ON c.id = d.company_id
`;

const MONAT_RE = /^\d{4}-\d{2}$/;
const monatVon = (datum) => String(datum || '').slice(0, 7);

/**
 * AE und Angebotswert des verknuepften Deals zusaetzlich in EUR ausweisen.
 *
 * Noetig, weil deals_bk in der Waehrung der Company speichert (Risem rechnet in CHF). Eine
 * Trichter-KPI "AE aus WM-Angeboten", die roh summiert, mischte sonst CHF und EUR in einer Zahl.
 * Der Kurs haengt am Monat des DEALS, nicht am Meeting-Monat: fuer den realisierten AE gilt der
 * Gewinnmonat, sonst der Angebotsmonat — dieselbe Regel wie in utils/currency.js.
 */
async function mitEur(rows) {
  const list = Array.isArray(rows) ? rows : (rows ? [rows] : []);
  if (!list.length) return rows;
  const rates = await loadRates();
  for (const r of list) {
    const cur = r.deal_currency || 'EUR';
    r.deal_ae_wert_eur     = r.deal_ae_wert == null ? null
      : toEur(r.deal_ae_wert, cur, r.deal_gewonnen_monat || r.deal_monat, rates);
    r.deal_angebotswert_eur = r.deal_angebotswert == null ? null
      : toEur(r.deal_angebotswert, cur, r.deal_monat, rates);
  }
  return rows;
}

// ── Lesen ───────────────────────────────────────────────────────────────────
// monat= einzelner Kalendermonat · von=/bis= Zeitraum · ohne beides: alle.
// Achse ist IMMER w.monat (Meeting-Monat) — die Kohorte. Der Deal bringt seine eigene
// Achse (gewonnen_monat) mit, die hier bewusst nicht filtert.
router.get('/', wrap(async (req, res) => {
  const { monat, von, bis, gefuehrt_von } = req.query;
  const cond = [], params = [];
  let i = 1;
  const p = () => ph(i++);
  if (monat && MONAT_RE.test(monat)) { cond.push(`w.monat = ${p()}`); params.push(monat); }
  else {
    if (von && MONAT_RE.test(von)) { cond.push(`w.monat >= ${p()}`); params.push(von); }
    if (bis && MONAT_RE.test(bis)) { cond.push(`w.monat <= ${p()}`); params.push(bis); }
  }
  if (gefuehrt_von) { cond.push(`w.gefuehrt_von = ${p()}`); params.push(Number(gefuehrt_von)); }
  const where = cond.length ? ' WHERE ' + cond.join(' AND ') : '';
  res.json(await mitEur(await db.all(BASE_SELECT + where + ' ORDER BY w.datum DESC, w.id DESC', params)));
}));

router.get('/:id', wrap(async (req, res) => {
  const row = await db.get(BASE_SELECT + ` WHERE w.id = ${ph(1)}`, [Number(req.params.id)]);
  if (!row) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(await mitEur(row));
}));

// ── Schreiben ───────────────────────────────────────────────────────────────
const WM_FELDER = ['datum', 'monat', 'kunde', 'gefuehrt_von', 'angebots_typ',
  'aufzeichnung_url', 'notiz', 'deal_bk_id'];

function pruefeMeeting(b) {
  if (!b.datum) return 'Datum fehlt';
  if (!String(b.kunde || '').trim()) return 'Kunde fehlt';
  if (!b.gefuehrt_von) return 'Geführt von fehlt';
  const m = b.monat || monatVon(b.datum);
  if (!MONAT_RE.test(m)) return 'Monat muss YYYY-MM sein';
  return null;
}

/**
 * Angebots-Teil pruefen. kam_id ist PFLICHT, sobald ein Angebot angelegt wird.
 *
 * Grund: auswertung.js und kpis.js joinen deals_bk per INNER JOIN auf employees
 * ("JOIN employees e ON e.id = d.kam_id"). Ein Deal ohne kam_id verschwindet damit lautlos aus
 * JEDER BK-Auswertung — ohne Fehlermeldung, ohne Spur. Ueber diesen Weg darf so ein Deal nicht
 * entstehen koennen, deshalb wird hier hart abgelehnt statt still angelegt.
 */
function pruefeAngebot(a) {
  if (!a.kam_id) return 'KAM fehlt — ohne KAM fiele der Deal aus jeder Auswertung';
  if (!a.company_id) return 'Company fehlt';
  if (!String(a.kunde || '').trim()) return 'Kunde des Angebots fehlt';
  if (!(Number(a.angebotswert) >= 0)) return 'Angebotswert fehlt';
  const m = a.monat || '';
  if (!MONAT_RE.test(m)) return 'Monat des Angebots muss YYYY-MM sein';
  return null;
}

async function schreibeMeeting(b, id = null) {
  const felder = WM_FELDER.filter(f => f !== 'deal_bk_id' || b.deal_bk_id !== undefined);
  const wert = (f) => {
    if (f === 'monat') return b.monat || monatVon(b.datum);
    if (f === 'gefuehrt_von') return Number(b.gefuehrt_von);
    if (f === 'deal_bk_id') return b.deal_bk_id ?? null;
    return b[f] ?? null;
  };
  const values = felder.map(wert);
  if (id) {
    const set = felder.map((f, k) => `${f}=${ph(k + 1)}`).join(',');
    const stamp = P ? 'NOW()' : "datetime('now')";
    await db.run(`UPDATE willkommensmeetings SET ${set}, updated_at=${stamp} WHERE id=${ph(felder.length + 1)}`,
      [...values, id]);
    return id;
  }
  if (P) {
    const r = await db.get(
      `INSERT INTO willkommensmeetings (${felder.join(',')}) VALUES (${felder.map((_, k) => `$${k + 1}`).join(',')}) RETURNING id`,
      values);
    return r.id;
  }
  return db.run(`INSERT INTO willkommensmeetings (${felder.join(',')}) VALUES (${felder.map(() => '?').join(',')})`,
    values).lastInsertRowid;
}

/**
 * Meeting anlegen — optional samt Angebot.
 *
 * `angebot` ist der komplette BK-Deal-Body aus demselben Formular, das auch der BK-Bereich
 * benutzt. Alternativ verknuepft `deal_bk_id` einen BEREITS bestehenden Deal (wenn der AM
 * schneller war) — dann wird kein zweiter angelegt.
 *
 * REIHENFOLGE: erst der Deal, dann das Meeting. Es gibt in der DB-Schicht keinen
 * Transaktions-Helfer, der beide Dialekte traegt. Scheitert das Meeting, wird der eben
 * angelegte Deal wieder entfernt — inklusive seiner Provisionsbuchung, die der Storno-Pfad
 * der Engine sauber zurueckdreht (provisionSyncBk ist state-based). Andersherum waere der
 * Rueckbau nicht moeglich: ein Meeting ohne Deal ist ein gueltiger Zustand, ein Deal ohne
 * Meeting aber eine unsichtbare Leiche.
 */
router.post('/', wrap(async (req, res) => {
  const b = { ...req.body };
  const fehler = pruefeMeeting(b);
  if (fehler) return res.status(400).json({ error: fehler });

  let dealId = b.deal_bk_id ? Number(b.deal_bk_id) : null;
  let neuerDeal = null;

  if (dealId) {
    const schon = await db.get(`SELECT id FROM willkommensmeetings WHERE deal_bk_id = ${ph(1)}`, [dealId]);
    if (schon) return res.status(400).json({ error: 'Dieser Deal hängt bereits an einem anderen Willkommensmeeting' });
    const da = await db.get(`SELECT id FROM deals_bk WHERE id = ${ph(1)}`, [dealId]);
    if (!da) return res.status(400).json({ error: 'Deal nicht gefunden' });
  } else if (b.angebot) {
    const af = pruefeAngebot(b.angebot);
    if (af) return res.status(400).json({ error: af });
    neuerDeal = await erstelleBkDeal({ ...b.angebot, herkunft: 'willkommensmeeting' }, req.user);
    dealId = neuerDeal.id;
  }

  try {
    const id = await schreibeMeeting({ ...b, deal_bk_id: dealId });
    await logAudit({ user: req.user, action: 'create', entityType: 'willkommensmeeting',
      entityId: id, newData: { ...b, deal_bk_id: dealId } });
    res.status(201).json(await mitEur(await db.get(BASE_SELECT + ` WHERE w.id = ${ph(1)}`, [id])));
  } catch (e) {
    // Rueckbau: der Deal darf nicht ohne sein Meeting zurueckbleiben.
    if (neuerDeal) {
      try {
        await db.run(`DELETE FROM deals_bk WHERE id = ${ph(1)}`, [neuerDeal.id]);
        const { provisionSyncBk } = require('../utils/provisionenBk');
        await provisionSyncBk({ ...neuerDeal, status: 'Gelöscht' }, 'bk');
      } catch (e2) { console.error('[wm] Rueckbau fehlgeschlagen:', e2.message); }
    }
    throw e;
  }
}));

// Bearbeitet NUR die Meeting-Felder. Der verknuepfte Deal wird hier nicht angefasst — dafuer
// gibt es die BK-Route. Ein Teil-Body laesst nicht gesendete Felder stehen.
router.put('/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const alt = await db.get(`SELECT * FROM willkommensmeetings WHERE id = ${ph(1)}`, [id]);
  if (!alt) return res.status(404).json({ error: 'Nicht gefunden' });

  const b = { ...alt, ...req.body };
  const fehler = pruefeMeeting(b);
  if (fehler) return res.status(400).json({ error: fehler });

  // Angebot nachreichen: entweder neu anlegen oder einen bestehenden Deal verknuepfen.
  if (!alt.deal_bk_id && (req.body.angebot || req.body.deal_bk_id)) {
    if (req.body.deal_bk_id) {
      const nr = Number(req.body.deal_bk_id);
      const schon = await db.get(`SELECT id FROM willkommensmeetings WHERE deal_bk_id = ${ph(1)} AND id <> ${ph(2)}`, [nr, id]);
      if (schon) return res.status(400).json({ error: 'Dieser Deal hängt bereits an einem anderen Willkommensmeeting' });
      b.deal_bk_id = nr;
    } else {
      const af = pruefeAngebot(req.body.angebot);
      if (af) return res.status(400).json({ error: af });
      const d = await erstelleBkDeal({ ...req.body.angebot, herkunft: 'willkommensmeeting' }, req.user);
      b.deal_bk_id = d.id;
    }
    b.deal_entfernt = 0;
  }

  await schreibeMeeting(b, id);
  await logAudit({ user: req.user, action: 'update', entityType: 'willkommensmeeting',
    entityId: id, oldData: alt, newData: b });
  res.json(await mitEur(await db.get(BASE_SELECT + ` WHERE w.id = ${ph(1)}`, [id])));
}));

// Meeting loeschen laesst den Deal ausdruecklich UNANGETASTET — er lebt in BK weiter, samt
// AE und Provision. Entfernt wird nur die Verknuepfung, indem die Meeting-Zeile verschwindet.
router.delete('/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const alt = await db.get(`SELECT * FROM willkommensmeetings WHERE id = ${ph(1)}`, [id]);
  if (!alt) return res.status(404).json({ error: 'Nicht gefunden' });
  await db.run(`DELETE FROM willkommensmeetings WHERE id = ${ph(1)}`, [id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'willkommensmeeting',
    entityId: id, oldData: alt });
  res.status(204).end();
}));

module.exports = router;
