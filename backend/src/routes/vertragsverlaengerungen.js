const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { gruppeVonEmp } = require('../utils/rollen');
const { standortInSql } = require('../utils/standorte');

// ─────────────────────────────────────────────────────────────────────────────
// Vertragsverlaengerungen — Arbeits- und Auswertungsflaeche fuer die Umstellung auf Dauer-RaaS.
//
// Gemessen wird, wie viele der anstehenden automatischen Verlaengerungen proaktiv auf den
// Dauer-Recruiting-Service gehoben werden, statt sich regulaer zu verlaengern.
//
// DIESER BEREICH SCHREIBT NICHT. Das ist Absicht und die strengste Form von "zwei Tueren, ein
// Deal": Die Umstellung wird ueber PUT /api/deals/vl/:id erfasst — dieselbe Route, die auch der
// VL-Bereich benutzt. Damit KANN es keine zwei Verhaltensweisen geben, und es gibt keinen
// zweiten Schreibpfad, der Hooks verlieren koennte. Der Bereich liest den Live-Stand, mehr nicht.
// (Die Willkommensmeetings haben eine eigene Tabelle und brauchen deshalb einen Schreibpfad —
// hier gibt es nichts Eigenes zu speichern, der Ausgang steht im Verlaengerungs-Deal selbst.)
//
// KOHORTE ist immer deals_vl.monat, der Faelligkeitsmonat der Verlaengerung — dieselbe Menge,
// die auch die VL-Seite zeigt. Der Dauer-RaaS-Umsatz bringt seine eigene Achse mit (den Monat
// des BK-Deals) und filtert hier bewusst nicht mit.
//
// Zugriff wie VL und BK: nur requireAuth. Bewusst gespiegelt, keine Nachlaessigkeit — wer das
// enger zieht, muss alle drei Bereiche gemeinsam anfassen, sonst entsteht ein Schlupfloch.
// ─────────────────────────────────────────────────────────────────────────────

router.use(requireAuth);

const PG = db.dialect === 'postgres';
const ph = i => (PG ? `$${i}` : '?');
const MONAT_RE = /^\d{4}-\d{2}$/;
const n = v => Number(v) || 0;
const r1 = v => Math.round(v * 10) / 10;

// Der Dauer-RaaS-Betrag steht im verknuepften BK-Deal und wird mit DESSEN Achse in EUR gerechnet
// (Gewinnmonat, sonst Angebotsmonat) — nicht mit der des Verlaengerungs-Deals. Sonst stuenden
// Kursmonat und Ereignismonat auseinander.
// Ausgeschrieben statt ueber moneyEurSql(), weil der Kursmonat hier ein COALESCE braucht: ein
// noch offener Dauer-RaaS-Deal hat kein gewonnen_monat, und ohne Rueckfall auf den Angebotsmonat
// faende die Kursabfrage nichts und rechnete CHF still mit Faktor 1.
const UMS_EUR = `(COALESCE(u.ae_wert,0) * CASE WHEN uc.currency = 'CHF'
  THEN COALESCE((SELECT r.rate FROM chf_eur_rates r
                  WHERE r.monat = COALESCE(u.gewonnen_monat, u.monat)), 1)
  ELSE 1 END)`;

function zeitraum(req) {
  const { monat, von, bis } = req.query;
  const cond = [], params = [];
  let i = 1;
  const p = () => ph(i++);
  if (monat && MONAT_RE.test(monat)) { cond.push(`d.monat = ${p()}`); params.push(monat); }
  else {
    if (von && MONAT_RE.test(von)) { cond.push(`d.monat >= ${p()}`); params.push(von); }
    if (bis && MONAT_RE.test(bis)) { cond.push(`d.monat <= ${p()}`); params.push(bis); }
  }
  // Standort-Gruppe ('de' = Bonn+Braunschweig, 'at', 'ch'). Massgeblich ist der Standort des
  // KAM, nicht die Company — dieselbe Aufloesung wie im VL-Bereich.
  //
  // Ein Deal OHNE kam_id (oder mit einem KAM ohne Standort) faellt bei jedem konkreten Filter
  // heraus: k.standort ist dann NULL und IN (...) liefert NULL, also nicht wahr. Das ist
  // gewollt und deckt sich mit der VL-Seite; unter "Alle Standorte" bleibt er sichtbar.
  if (req.query.standort) {
    const sql = standortInSql(req.query.standort, 'k.standort');
    // Kein stiller Fallback auf "ungefiltert": ein Tippfehler im Parameter wuerde sonst die
    // ganze Kohorte ausweisen und wie ein gefiltertes Ergebnis aussehen.
    if (!sql) return { fehler: `Unbekannte Standort-Gruppe: ${req.query.standort}` };
    cond.push(sql);
  }
  return { where: cond.length ? ' WHERE ' + cond.join(' AND ') : '', params };
}

// Trichter der Kohorte. Die vier Ausgaenge sind EXPLIZIT gezaehlt, nie als Rest — ein Rest haette
// den dritten Ausgang still zu "offen" gemacht.
// Der Trichter hat zwei Stufen. Die erste steht NICHT im VL-Status, sondern im Status des
// verknuepften Dauer-RaaS-Deals:
//
//   angeboten  = es existiert ein verknuepfter Deal, egal wie er ausgegangen ist.
//                Eine Direkt-Umstellung zaehlt damit als "angeboten UND angenommen am selben
//                Tag" — fachlich richtig: sie ist ein erfolgreiches Angebot. Wuerde nur der
//                Status 'Offen' zaehlen, fiele jedes Angebot aus der Quote, sobald es entschieden
//                ist, und die Quote saenke ausgerechnet dann, wenn etwas gelingt.
//   angenommen = der VL-Deal steht auf 'Umgestellt'.
//
// Der AE zaehlt weiterhin NUR bei angenommenen Umstellungen. Ein offenes Angebot ist noch kein
// Umsatz; sein Angebotswert steht in der BK-Pipeline, wo er hingehoert.
const TRICHTER = `
  COUNT(*) AS anstehend,
  SUM(CASE WHEN d.umstellung_deal_bk_id IS NOT NULL THEN 1 ELSE 0 END) AS angeboten,
  SUM(CASE WHEN u.status='Offen' THEN 1 ELSE 0 END) AS angebot_offen,
  SUM(CASE WHEN u.status='Verloren' THEN 1 ELSE 0 END) AS angebot_abgelehnt,
  SUM(CASE WHEN d.status='Umgestellt' THEN 1 ELSE 0 END) AS umgestellt,
  SUM(CASE WHEN d.status='Gewonnen'   THEN 1 ELSE 0 END) AS verlaengert,
  SUM(CASE WHEN d.status='Verloren'   THEN 1 ELSE 0 END) AS gekuendigt,
  SUM(CASE WHEN d.status='Offen'      THEN 1 ELSE 0 END) AS offen,
  SUM(CASE WHEN d.status='Umgestellt' THEN ${UMS_EUR} ELSE 0 END) AS dauer_raas_ae,
  SUM(CASE WHEN u.status='Offen' THEN COALESCE(u.angebotswert,0) ELSE 0 END) AS angebot_volumen
`;

function quoten(r) {
  const anstehend = n(r.anstehend), umgestellt = n(r.umgestellt);
  const verlaengert = n(r.verlaengert), gekuendigt = n(r.gekuendigt);
  const angeboten = n(r.angeboten);
  const entschieden = umgestellt + verlaengert + gekuendigt;
  return {
    anstehend, angeboten, umgestellt, verlaengert, gekuendigt, offen: n(r.offen),
    angebot_offen: n(r.angebot_offen), angebot_abgelehnt: n(r.angebot_abgelehnt),
    entschieden,
    dauer_raas_ae: Math.round(n(r.dauer_raas_ae) * 100) / 100,
    angebot_volumen: Math.round(n(r.angebot_volumen) * 100) / 100,
    // Stufe 1: wie oft haben wir die Umstellung ueberhaupt angeboten?
    angebotsquote: anstehend > 0 ? r1((angeboten / anstehend) * 100) : null,
    // Stufe 2: und wie oft wurde sie angenommen? Nenner sind die Angebote, nicht die Kohorte.
    annahmequote: angeboten > 0 ? r1((umgestellt / angeboten) * 100) : null,
    // Umstellungsquote auf der ganzen Kohorte — das ist die Frage des Bereichs:
    // wie viele der anstehenden Verlaengerungen haben wir gehoben?
    umstellungsquote: anstehend > 0 ? r1((umgestellt / anstehend) * 100) : null,
    // Bestandserhalt: eine Umstellung haelt den Kunden, sie verliert ihn nicht.
    erhaltsquote: entschieden > 0 ? r1(((verlaengert + umgestellt) / entschieden) * 100) : null,
    // Churn nach der verbindlichen Definition:
    //   Churn = Kuendigungen / (Gewonnen + Umgestellt + Verloren)
    churn: entschieden > 0 ? r1((gekuendigt / entschieden) * 100) : null,
  };
}

// GET /api/vertragsverlaengerungen?monat=|von=&bis=&standort=
// Trichter + Personen-Tabelle + die Kohorte selbst.
router.get('/', wrap(async (req, res) => {
  const { where, params, fehler } = zeitraum(req);
  if (fehler) return res.status(400).json({ error: fehler });
  const JOINS = `
    FROM deals_vl d
    LEFT JOIN employees k ON k.id = d.kam_id
    LEFT JOIN deals_bk u  ON u.id = d.umstellung_deal_bk_id
    LEFT JOIN companies uc ON uc.id = u.company_id`;

  const gesamtRow = (await db.all(`SELECT ${TRICHTER} ${JOINS}${where}`, params))[0] || {};

  // Je Person. LEFT JOIN auf employees, damit Deals OHNE kam_id nicht lautlos verschwinden —
  // sie erscheinen als "∅ ohne KAM" und sind damit ein sichtbares Pflegethema statt einer Luecke.
  // (Im Prod-Stand vom 18.09.2026 betrifft das 61 von 1.001 Verlaengerungs-Deals.)
  const personen = await db.all(
    `SELECT COALESCE(k.name, '∅ ohne KAM') AS name, k.id AS employee_id, k.rolle, k.bk_gruppe,
            k.standort, ${TRICHTER} ${JOINS}${where}
      GROUP BY COALESCE(k.name, '∅ ohne KAM'), k.id, k.rolle, k.bk_gruppe, k.standort`, params);

  const liste = await db.all(
    `SELECT d.id, d.monat, d.kunde, d.status, d.ae_wert, d.kam_id, d.dauervertrag_datum,
            -- company_id und kundennummer braucht das Umstellungs-Formular zur Vorbelegung;
            -- ohne sie stuende die Company dort leer und waere ein Pflichtfeld zum Raten.
            d.company_id, d.kundennummer,
            d.umstellung_deal_bk_id, d.wie_vielt_verlaengerung, d.ende_kuendigungsfrist,
            k.name AS kam_name, k.standort AS kam_standort,
            u.status AS umstellung_status, u.ae_wert AS umstellung_ae_wert,
            u.angebotswert AS umstellung_angebotswert, u.dienstleistung AS umstellung_dienstleistung,
            u.laufzeit_monate AS umstellung_laufzeit, u.automatische_verlaengerung AS umstellung_auto_vl,
            u.monat AS umstellung_monat, u.herkunft AS umstellung_herkunft,
            ${UMS_EUR} AS umstellung_ae_wert_eur
       ${JOINS}${where}
      ORDER BY d.monat DESC, d.kunde`, params);

  res.json({
    gesamt: quoten(gesamtRow),
    personen: personen
      .map(p => ({ name: p.name, employee_id: p.employee_id, rolle: p.rolle,
        standort: p.standort, gruppe: gruppeVonEmp(p), ...quoten(p) }))
      .sort((a, b) => b.anstehend - a.anstehend),
    kohorte: liste,
  });
}));

module.exports = router;
