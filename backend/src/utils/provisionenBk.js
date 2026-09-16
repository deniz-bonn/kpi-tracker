// ── Provisions-Engine: Abrechnungskreis "Bestandskundenvertrieb" ─────────────
//
// Vierter Kreis neben bonn/braunschweig/oesterreich, aber strukturell anders:
//
//   Quelle      deals_bk (Upsell)  +  deals_vl (Verlaengerung)   statt deals_nk
//   Empfaenger  der KAM des Deals (kam_id)                       statt Opener/Setter/Closer
//   Satz        3 % (Upsell) / 2 % (Verlaengerung) vom ae_wert    statt Rollen-Saetze + Staffeln
//   Achse       gewonnen_monat                                    statt gewonnen_datum
//   Zyklus      Kalendermonat, Auszahlung im Folgemonat
//
// WARUM EIN EIGENES MODUL: Die NK-Engine ist eine Standort-Dimension — der Kreis eines
// Beteiligten folgt aus employees.standort, ein Deal streut in mehrere Kreise. Der BK-Kreis ist
// eine Quellen-Dimension: ein Deal, ein Empfaenger, unabhaengig vom Standort. Diese Logik in die
// NK-Funktionen zu weben haette jede von ihnen um einen Sonderzweig erweitert und drei laufende
// Abrechnungskreise gefaehrdet. Geteilt werden nur die Ledger-Primitive, damit es EIN
// Kontoauszug-Format und EINE Zeitraum-Mechanik gibt.
//
// ACHSE gewonnen_monat — ausdrueckliche Festlegung, kein Versehen:
// Die NK-Engine rechnet nach gewonnen_datum. Im BK/VL-Bereich fallen die beiden bei einzelnen
// Deals auseinander (nachgeholte Statuspflege alter Kohorten: gewonnen_datum September,
// gewonnen_monat Januar). gewonnen_monat ist die Achse, auf der auch die AE-Auswertung zaehlt —
// damit zeigen Provision und Auswertung denselben Monat. Folge, die so gewollt ist: ein Deal mit
// gewonnen_monat VOR dem Go-Live faellt aus der Abrechnung, auch wenn sein gewonnen_datum danach
// liegt. Der Dry-Run weist genau diese Faelle gesondert aus (`ausserhalb`), damit sie sichtbar
// sind statt verloren zu gehen.

const db = require('../db');
const { insertBuchung, offenerZeitraumAm, periodFor, configFor, getOrCreateZeitraum,
        goLiveDatum, labelForKreis, kreisFor, round2 } = require('./provisionen');
const { gruppeVonEmp } = require('./rollen');

const KREIS = 'bestandskunden';
const pg = () => db.dialect === 'postgres';
const q1 = i => (pg() ? `$${i}` : '?');
const fmtEur = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
const fmtPct = n => String(n).replace('.', ',') + ' %';
const heute = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// Die zwei Deal-Quellen des Kreises. `satzFeld` zeigt auf provision_config (Migration 108).
const QUELLEN = {
  bk: { tabelle: 'deals_bk', typ: 'bk_upsell',        satzFeld: 'upsell_satz',  label: 'Upsell' },
  vl: { tabelle: 'deals_vl', typ: 'bk_verlaengerung', satzFeld: 'auto_vl_satz', label: 'Verlängerung' },
};
const QUELLEN_KEYS = Object.keys(QUELLEN);

// Go-Live als Monat: die Config traegt ein Datum ('2026-09-01'), die Achse ist ein Monat.
async function goLiveMonat() { return (await goLiveDatum(KREIS)).slice(0, 7); }

// Periode eines gewonnen_monat ('YYYY-MM'). periodFor liefert fuer alles ausser 'bonn' den
// vollen Kalendermonat — genau der geforderte BK-Zyklus, ohne Sonderlogik.
const periodeFuer = gm => periodFor(`${gm}-01`, KREIS);

/**
 * Empfangsberechtigung des KAM. Drei Bedingungen, alle drei bewusst:
 *   1. Der Deal hat ueberhaupt einen KAM (kam_id). Ohne ihn gibt es niemanden zu bezahlen.
 *   2. Der Mitarbeiter hat eine Gruppe (KAM / Closer-KAM / Account Manager, 'Multi' per
 *      bk_gruppe) — zentral in utils/rollen.js, nicht als Literal hier.
 *   3. Sein Standort liegt im Modul (Bonn/Braunschweig/Österreich). Schweiz/Risem ist
 *      ausdruecklich NICHT im Kreis: dort wird in CHF gerechnet, und eine Waehrungsumrechnung
 *      gibt es in der Provisionsengine nirgends. Das ist eine eigene Stufe.
 * @returns {{ok: true, emp}|{ok: false, grund: string, emp?: object}}
 */
async function empfaenger(kamId) {
  if (!kamId) return { ok: false, grund: 'kein_kam' };
  const emp = await db.get(`SELECT id, name, rolle, standort, aktiv, bk_gruppe FROM employees WHERE id=${q1(1)}`, [kamId]);
  if (!emp) return { ok: false, grund: 'kam_unbekannt' };
  if (!gruppeVonEmp(emp)) return { ok: false, grund: 'rolle_nicht_berechtigt', emp };
  if (!kreisFor(emp.standort)) return { ok: false, grund: 'standort_ausserhalb', emp };
  return { ok: true, emp };
}

/**
 * Die eine Position eines BK/VL-Deals — das Gegenstueck zu positionenFor() der NK-Engine.
 * Gibt null zurueck, wenn der Deal nicht provisionsrelevant ist (mit Grund, fuer den Report).
 */
async function positionBk(deal, quelle, { goLive, cfg } = {}) {
  const Q = QUELLEN[quelle];
  if (!Q) return { ok: false, grund: 'quelle_unbekannt' };
  if (deal.status !== 'Gewonnen') return { ok: false, grund: 'nicht_gewonnen' };

  const gm = String(deal.gewonnen_monat || '').slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(gm)) return { ok: false, grund: 'kein_gewonnen_monat' };

  const gl = goLive || await goLiveMonat();
  if (gm < gl) return { ok: false, grund: 'vor_go_live', gm };

  const e = await empfaenger(deal.kam_id);
  if (!e.ok) return e;

  const { von, bis } = periodeFuer(gm);
  const c = cfg || await configFor(von, KREIS);
  if (!c) return { ok: false, grund: 'keine_config' };
  const satz = Number(c[Q.satzFeld]) || 0;
  if (!satz) return { ok: false, grund: 'satz_null' };

  const ae = Number(deal.ae_wert) || 0;
  return {
    ok: true, emp: e.emp, quelle, gm, von, bis, satz, ae,
    typ: Q.typ,
    betrag: round2(ae * satz / 100),
    besch: `${Q.label} (${fmtPct(satz)}) · ${deal.kunde || ''}`.trim(),
  };
}

/**
 * Zielzeitraum einer Buchung. Ist die Periode des gewonnen_monat bereits ABGESCHLOSSEN, geht
 * die Buchung als Nachtrag in den laufenden Zeitraum — nicht rueckwirkend in die geschlossene.
 * Begruendung: ein abgeschlossener Zeitraum ist exportiert und ausgezahlt; ihn nachtraeglich zu
 * veraendern hiesse, eine bereits geloehnte Datei still zu widerlegen. (Die NK-Engine ist hier
 * uneinheitlich: der WIN-Pfad bucht rueckwirkend, die Staffeln nicht. Fuer den BK-Kreis gilt
 * einheitlich die Nachtrags-Regel.)
 */
async function zielZeitraum(von, bis, today) {
  const z = await getOrCreateZeitraum(von, bis, KREIS);
  if (z && z.status === 'offen') return { z, nachtrag: false };
  return { z: await offenerZeitraumAm(today, KREIS), nachtrag: true };
}

/**
 * Ist-Stand je (Empfaenger, ZEITRAUM) fuer diesen Deal — nicht nur je Empfaenger.
 *
 * Der Zeitraum MUSS Teil des Schluessels sein. Ohne ihn traten zwei gemessene Fehler auf:
 *   · KAM-Wechsel nach Monatswechsel: der neue KAM bekam September, die Rueckbuchung des alten
 *     landete im Oktober — der September zahlte BEIDE, der Oktober startete negativ.
 *   · Verschiebung des gewonnen_monat bei gleichem Betrag: Soll == Ist, diff = 0, also gar keine
 *     Buchung — die Provision blieb dauerhaft im falschen Monat stehen. Genau das, wogegen die
 *     Achse gewonnen_monat gewaehlt wurde.
 * `anzahl` traegt zusaetzlich die Revisionsnummer fuer den idem_key (siehe idemKey unten).
 */
async function istJeEmpfaengerZeitraum(dealId, quelle) {
  const rows = await db.all(
    `SELECT b.employee_id, b.zeitraum_id, z.von, z.bis, z.status,
            COALESCE(SUM(b.betrag),0) betrag, COUNT(*) anzahl
       FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id
      WHERE b.deal_id=${q1(1)} AND b.deal_quelle=${q1(2)}
      GROUP BY b.employee_id, b.zeitraum_id, z.von, z.bis, z.status`, [dealId, quelle]);
  const m = new Map();
  for (const r of rows) {
    m.set(`${r.employee_id}|${r.zeitraum_id}`, {
      empId: r.employee_id, zeitraumId: r.zeitraum_id, von: r.von, bis: r.bis,
      offen: r.status === 'offen', betrag: round2(Number(r.betrag)), anzahl: Number(r.anzahl),
    });
  }
  return m;
}

/**
 * Revisions-Schluessel statt eines festen. Er muss zwei Dinge gleichzeitig leisten:
 *   · zwei GLEICHZEITIGE Syncs desselben Deals duerfen nicht doppelt buchen (gemessen: zwei
 *     parallele PUTs lasen beide Ist = 0 und buchten beide voll -> 600 statt 300 €),
 *   · ein Deal, der storniert und WIEDER gewonnen wird, muss erneut buchen duerfen.
 * Beides loest die laufende Nummer der bisherigen Buchungen dieses (Deal, Empfaenger, Zeitraum):
 * parallele Laeufe sehen dieselbe Nummer und kollidieren (ON CONFLICT DO NOTHING greift),
 * ein spaeterer Wieder-Gewinn sieht eine hoehere und geht durch.
 */
const idemKey = (quelle, dealId, empId, zeitraumId, rev) => `bkp:${quelle}:${dealId}:${empId}:${zeitraumId}:#${rev}`;

/**
 * HAUPT-HOOK. Wird aus den BK/VL-Routen bei POST/PUT/DELETE gerufen.
 * State-based statt ereignisbasiert: er berechnet das SOLL des aktuellen Deal-Zustands und
 * bucht die Differenz zum IST — je (Empfaenger, Zeitraum). Damit ist er idempotent und deckt
 * alle Faelle mit einem Pfad ab: Gewinn, Storno, ae_wert-Aenderung, KAM-Wechsel und
 * Monatsverschiebung.
 *
 * @param deal   neuer Zustand (bei DELETE: {...existing, status:'Gelöscht'})
 * @param quelle 'bk' | 'vl'
 */
async function provisionSyncBk(deal, quelle, stichtag) {
  const dealId = deal?.id; if (!dealId) return;
  const today = stichtag || heute();

  const ist = await istJeEmpfaengerZeitraum(dealId, quelle);

  // SOLL: hoechstens eine Position (ein Deal, ein KAM). Ihr Zielzeitraum folgt dem gewonnen_monat;
  // ist dessen Periode bereits abgeschlossen, weicht zielZeitraum() auf den laufenden aus.
  const pos = await positionBk(deal, quelle);
  const soll = new Map();
  if (pos.ok) {
    const { z, nachtrag } = await zielZeitraum(pos.von, pos.bis, today);
    if (z) soll.set(`${pos.emp.id}|${z.id}`, { pos, zeitraumId: z.id, nachtrag });
  }

  for (const key of new Set([...soll.keys(), ...ist.keys()])) {
    const s = soll.get(key), i = ist.get(key);
    const sollB = s ? s.pos.betrag : 0;
    const istB  = i ? i.betrag : 0;
    const diff  = round2(sollB - istB);
    if (diff === 0) continue;

    // ZIEL-Zeitraum der Buchung:
    //   · Soll-Seite -> der beim Soll bestimmte Zeitraum.
    //   · Reine Rueckbuchung (kein Soll mehr in diesem Zeitraum) -> ist die Ursprungsperiode noch
    //     OFFEN, wird dort zurueckgebucht, sodass sie netto auf 0 geht. Ist sie ABGESCHLOSSEN,
    //     geht die Rueckbuchung als Nachtrag in den laufenden Zeitraum — eine abgeschlossene,
    //     exportierte und ausgezahlte Periode wird nicht nachtraeglich veraendert.
    let zielId, nachtrag = false, refVon = null, refBis = null;
    if (s) { zielId = s.zeitraumId; nachtrag = s.nachtrag; refVon = s.pos.von; refBis = s.pos.bis; }
    else if (i.offen) { zielId = i.zeitraumId; }
    else {
      const z = await offenerZeitraumAm(today, KREIS);
      if (!z) continue;
      zielId = z.id; nachtrag = true; refVon = i.von; refBis = i.bis;
    }

    const erstbuchung = !!s && istB === 0;
    const km = s ? s.pos.gm : (i.von ? String(i.von).slice(0, 7) : today.slice(0, 7));
    const hinweis = nachtrag && refVon
      ? ` · Nachtrag für ${labelForKreis(KREIS, refVon, refBis)} (Zeitraum bereits abgeschlossen)` : '';
    // Revisionsnummer je (Deal, Empfaenger, ZIEL-Zeitraum) — auch wenn die Rueckbuchung in einen
    // anderen Zeitraum geht als die Ist-Zeile, die sie ausloest.
    const rev = (ist.get(`${(s ? s.pos.emp.id : i.empId)}|${zielId}`)?.anzahl) ?? 0;
    const empId = s ? s.pos.emp.id : i.empId;

    await insertBuchung({
      zeitraum_id: zielId, employee_id: empId, deal_id: dealId, deal_quelle: quelle,
      rolle: 'kam',
      typ: erstbuchung ? s.pos.typ : (s ? 'korrektur' : 'storno'),
      satz: s ? s.pos.satz : 0,
      bemessungsgrundlage: s ? s.pos.ae : 0,
      betrag: diff,
      kalendermonat: km,
      gewonnen_datum: null,                       // Achse ist gewonnen_monat -> kalendermonat traegt sie
      beschreibung: erstbuchung
        ? `${s.pos.besch}${hinweis}`
        : (s ? `Korrektur → Soll ${fmtEur(sollB)} (war ${fmtEur(istB)}) · ${s.pos.besch}${hinweis}`
             : `Storno (nicht mehr provisionsrelevant in diesem Zeitraum), Rückbuchung ${fmtEur(-diff)} · ${deal.kunde || ''}${hinweis}`.trim()),
      idem_key: idemKey(quelle, dealId, empId, zielId, rev),
    });
  }
}

// ── Dry-Run / Backfill ───────────────────────────────────────────────────────

/** Alle gewonnenen Deals einer Quelle ab Go-Live-Monat, auf der Achse gewonnen_monat. */
async function gewonneneAbGoLive(quelle, goLive) {
  const Q = QUELLEN[quelle];
  return db.all(
    `SELECT * FROM ${Q.tabelle} WHERE status='Gewonnen' AND gewonnen_monat >= ${q1(1)} ORDER BY gewonnen_monat, id`,
    [goLive]);
}

/**
 * Deals, die NUR wegen der Achsen-Wahl herausfallen: gewonnen_datum liegt im Abrechnungs-
 * zeitraum, gewonnen_monat aber davor. Ausdruecklich angefordert, damit diese Faelle sichtbar
 * sind statt still zu verschwinden — es sind typischerweise nachgeholte Statuspflegen alter
 * Kohorten, die NICHT in die erste Periode rutschen sollen.
 */
async function ausserhalbDerAchse(quelle, goLive) {
  const Q = QUELLEN[quelle];
  const goLiveTag = `${goLive}-01`;
  const gdTxt = pg() ? `to_char(d.gewonnen_datum, 'YYYY-MM-DD')` : 'd.gewonnen_datum';
  return db.all(
    `SELECT d.id, d.kunde, d.ae_wert, d.gewonnen_monat, ${gdTxt} gewonnen_datum, e.name kam
       FROM ${Q.tabelle} d LEFT JOIN employees e ON e.id=d.kam_id
      WHERE d.status='Gewonnen' AND ${gdTxt} >= ${q1(1)} AND d.gewonnen_monat < ${q1(2)}
      ORDER BY d.gewonnen_monat, d.id`, [goLiveTag, goLive]);
}

/**
 * Read-only-Projektion (Dry-Run). Bucht NICHTS. Liefert neben den Summen ausdruecklich die
 * beiden Problemmengen, damit der Knopf-Druecker sieht, was NICHT gebucht wuerde und warum.
 */
async function projektionBk(stichtag) {
  const today = stichtag || heute();
  const goLive = await goLiveMonat();
  const perQuelle = {}; const perMonat = {}; const ohneEmpfaenger = []; const ohneBetrag = [];
  let total = 0, positionen = 0;

  for (const quelle of QUELLEN_KEYS) {
    const Q = QUELLEN[quelle];
    perQuelle[Q.typ] = { n: 0, summe: 0, label: Q.label };
    for (const d of await gewonneneAbGoLive(quelle, goLive)) {
      const p = await positionBk(d, quelle, { goLive });
      if (!p.ok) {
        if (['kein_kam', 'kam_unbekannt', 'rolle_nicht_berechtigt', 'standort_ausserhalb'].includes(p.grund)) {
          ohneEmpfaenger.push({ quelle, id: d.id, kunde: d.kunde, ae_wert: Number(d.ae_wert) || 0,
            gewonnen_monat: d.gewonnen_monat, grund: p.grund, kam: p.emp?.name || null, standort: p.emp?.standort || null });
        }
        continue;
      }
      // Gewonnener Deal mit ae_wert 0 -> Provision 0 -> es entsteht KEINE Buchungszeile.
      // Gesondert ausweisen statt stillschweigend mitzuzaehlen: `positionen` ist die Zusage,
      // wie viele Zeilen der Backfill schreibt — die muss stimmen, sonst wirkt der Lauf
      // hinterher unvollstaendig. Ein gewonnener Deal ohne AE ist ausserdem selbst ein Hinweis.
      if (p.betrag === 0) {
        ohneBetrag.push({ quelle, id: d.id, kunde: d.kunde, gewonnen_monat: d.gewonnen_monat,
          ae_wert: Number(d.ae_wert) || 0, kam: p.emp?.name || null });
        continue;
      }
      perQuelle[Q.typ].n++; perQuelle[Q.typ].summe = round2(perQuelle[Q.typ].summe + p.betrag);
      perMonat[p.gm] = round2((perMonat[p.gm] || 0) + p.betrag);
      total = round2(total + p.betrag); positionen++;
    }
  }

  const ausserhalb = [];
  for (const quelle of QUELLEN_KEYS)
    for (const r of await ausserhalbDerAchse(quelle, goLive))
      ausserhalb.push({ quelle, ...r, ae_wert: Number(r.ae_wert) || 0 });

  return {
    kreis: KREIS, goLive, stichtag: today,
    positionen, total, perQuelle, perMonat,
    ohneEmpfaenger,
    // Gewonnen, aber ae_wert 0 -> keine Buchung. Sichtbar, weil es meist ein Pflegefehler ist.
    ohneBetrag,
    // Absichtlich NICHT gebucht (Achse gewonnen_monat) — zur Sichtkontrolle, nicht als Fehler.
    ausserhalb,
  };
}

/** Backfill: bucht alle gewonnenen BK/VL-Deals ab Go-Live. Idempotent ueber provisionSyncBk. */
async function backfillBk(stichtag) {
  const today = stichtag || heute();
  const goLive = await goLiveMonat();
  let verarbeitet = 0;
  for (const quelle of QUELLEN_KEYS)
    for (const d of await gewonneneAbGoLive(quelle, goLive)) { await provisionSyncBk(d, quelle, today); verarbeitet++; }
  const buchungen = await db.all(
    `SELECT typ, COUNT(*) n, COALESCE(SUM(betrag),0) summe FROM provision_buchungen
      WHERE deal_quelle IN ('bk','vl') GROUP BY typ ORDER BY typ`);
  return { kreis: KREIS, goLive, verarbeitet, buchungen };
}

module.exports = { KREIS, QUELLEN, provisionSyncBk, projektionBk, backfillBk, positionBk, empfaenger };
