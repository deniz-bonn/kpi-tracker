// Team-Incentive September/Oktober 2026 — Fortschritt je Person.
//
// Regeln aus Team-Incentive_Sep-Okt-2026.md, verbindlich mit Deniz abgestimmt (14.09.2026):
//  · Auftragseingang: Summe ueber ALLE Monate des Zeitraums, je nach Messbasis ueber
//    deals_nk.opener_id / setter_id / closer_id. Ein Deal kann bei mehreren Personen zaehlen —
//    das ist gewollt, jeder wird an seiner eigenen Kette gemessen.
//  · Show-Rate: arithmetisches MITTEL der Monatsraten (nicht gepoolt). Ein Monat ohne gelegte
//    Termine (Urlaub/Krankheit) zaehlt NICHT als 0 %, sondern faellt aus dem Mittel. Sind alle
//    Monate leer -> "nicht messbar".
//  · "Beratung" im Dokument = termine.art 'closing' (Sales-/Closing-Call-Kette).
//  · Direkt-Settings werden NICHT ausgenommen — im Close-Modell nicht identifizierbar
//    (herkunft='anlage' traegt 95 % aller Settings und meint etwas anderes). Im UI ausgewiesen.
//  · Teamziel: NK-AE mit Closer-Standort Bonn, nach gewonnen_monat, live gerechnet — dieselbe
//    Definition wie die Dashboard-Zelle nk_bonn.
const db = require('../db');
const { aeEurGatedSql } = require('./currency');

const P  = (i) => (db.dialect === 'postgres' ? `$${i}` : '?');
const pg = () => db.dialect === 'postgres';

// Gate der Show-Rate — identisch zu routes/showrates.js, damit es nur eine Schwelle gibt.
const MIN_BEWERTET = 50;   // Prozent der gelegten Termine mit nachgetragenem Ausgang
const MIN_BASIS    = 10;   // und mindestens so viele bewertbare Termine im Monat

// Eingefroren wird am 5. des Folgemonats: Ausgaenge werden nachgetragen, ein Freeze am Monatsersten
// wuerde noch offene Termine als unbewertet festschreiben und die Show-Rate druecken.
const FREEZE_TAG = Number(process.env.INCENTIVE_FREEZE_TAG || 5);

const MESSBASIS_SPALTE = { opener: 'opener_id', setter: 'setter_id', closer: 'closer_id' };
const TEAMZIEL_MONAT   = Number(process.env.INCENTIVE_TEAMZIEL || 700000);

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** Monate eines Zeitraums: ('2026-09','2026-10') -> ['2026-09','2026-10'] */
function monateVon(von, bis) {
  const out = [];
  let [y, m] = von.split('-').map(Number);
  const [by, bm] = bis.split('-').map(Number);
  while (y < by || (y === by && m <= bm)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

/** Heute als YYYY-MM-DD (Serverzeit, wie im Provisions-Modul). */
const heute = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Ist der Monat abgeschlossen genug, um eingefroren zu werden? (ab dem 5. des Folgemonats) */
function freezeFaellig(monat, stichtag = heute()) {
  const [y, m] = monat.split('-').map(Number);
  const fy = m === 12 ? y + 1 : y, fm = m === 12 ? 1 : m + 1;
  const grenze = `${fy}-${String(fm).padStart(2, '0')}-${String(FREEZE_TAG).padStart(2, '0')}`;
  return stichtag >= grenze;
}

// ── Live-Werte ───────────────────────────────────────────────────────────────

/** Auftragseingang je Monat fuer eine Person in ihrer Messbasis. EUR + ae_ab_monat-Gate. */
async function aeLive(employeeId, messbasis, monate) {
  const spalte = MESSBASIS_SPALTE[messbasis];
  if (!spalte || !monate.length) return {};
  const ph = monate.map((_, i) => P(i + 2)).join(',');
  const rows = await db.all(
    `SELECT d.gewonnen_monat monat, COALESCE(SUM(${aeEurGatedSql('d', 'c')}), 0) ae
       FROM deals_nk d LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.${spalte} = ${P(1)} AND d.status = 'Gewonnen' AND d.gewonnen_monat IN (${ph})
      GROUP BY d.gewonnen_monat`,
    [employeeId, ...monate]);
  return Object.fromEntries(rows.map(r => [String(r.monat).trim(), r2(r.ae)]));
}

/** Show-Rate-Rohwerte je Monat: gelegt / bewertet / stattgefunden. */
async function srLive(employeeId, art, monate) {
  if (!art || !monate.length) return {};
  const ph = monate.map((_, i) => P(i + 3)).join(',');
  const rows = await db.all(
    `SELECT monat,
            COUNT(*) gelegt,
            SUM(CASE WHEN status IN ('stattgefunden','nicht_stattgefunden') THEN 1 ELSE 0 END) bewertet,
            SUM(CASE WHEN status = 'stattgefunden' THEN 1 ELSE 0 END) statt
       FROM termine
      WHERE employee_id = ${P(1)} AND art = ${P(2)} AND monat IN (${ph})
      GROUP BY monat`,
    [employeeId, art, ...monate]);
  return Object.fromEntries(rows.map(r => [String(r.monat).trim(),
    { gelegt: Number(r.gelegt) || 0, bewertet: Number(r.bewertet) || 0, statt: Number(r.statt) || 0 }]));
}

// ── Einfrieren ───────────────────────────────────────────────────────────────

/**
 * Friert alle faelligen Monate aller Incentive-Teilnehmer ein (idempotent: vorhandene Zeilen
 * bleiben unberuehrt, ausser es wird ausdruecklich neu eingefroren).
 * @returns {{ eingefroren: Array, uebersprungen: number }}
 */
async function freezeFaelligeMonate({ userId = null, nurMonat = null, neu = false, stichtag = heute() } = {}) {
  const ziele = await db.all(`SELECT * FROM incentive_ziele`);
  const out = []; let uebersprungen = 0;
  for (const z of ziele) {
    const monate = monateVon(z.zeitraum_von, z.zeitraum_bis)
      .filter(m => (!nurMonat || m === nurMonat) && freezeFaellig(m, stichtag));
    for (const monat of monate) {
      const da = await db.get(
        `SELECT id FROM incentive_monatswerte WHERE employee_id=${P(1)} AND monat=${P(2)}`,
        [z.employee_id, monat]);
      if (da && !neu) { uebersprungen++; continue; }
      const ae = (await aeLive(z.employee_id, z.messbasis, [monat]))[monat] || 0;
      const sr = (await srLive(z.employee_id, z.showrate_art, [monat]))[monat]
        || { gelegt: 0, bewertet: 0, statt: 0 };
      if (da) {
        await db.run(
          `UPDATE incentive_monatswerte SET messbasis=${P(1)}, showrate_art=${P(2)}, ae=${P(3)},
             sr_gelegt=${P(4)}, sr_bewertet=${P(5)}, sr_statt=${P(6)},
             eingefroren_am=${pg() ? 'NOW()' : "datetime('now')"}, eingefroren_von=${P(7)} WHERE id=${P(8)}`,
          [z.messbasis, z.showrate_art, ae, sr.gelegt, sr.bewertet, sr.statt, userId, da.id]);
      } else {
        await db.run(
          `INSERT INTO incentive_monatswerte
             (employee_id, monat, messbasis, showrate_art, ae, sr_gelegt, sr_bewertet, sr_statt, eingefroren_von)
           VALUES (${P(1)},${P(2)},${P(3)},${P(4)},${P(5)},${P(6)},${P(7)},${P(8)},${P(9)})`,
          [z.employee_id, monat, z.messbasis, z.showrate_art, ae, sr.gelegt, sr.bewertet, sr.statt, userId]);
      }
      out.push({ employee_id: z.employee_id, monat, ae, ...sr, neu: !da });
    }
  }
  return { eingefroren: out, uebersprungen };
}

// ── Fortschritt einer Person ─────────────────────────────────────────────────

/**
 * Fortschritt einer Person gegen ihre Incentive-Ziele.
 * Eingefrorene Monate haben Vorrang vor der Live-Rechnung.
 */
async function fortschrittFuer(ziel, { stichtag = heute() } = {}) {
  const monate = monateVon(ziel.zeitraum_von, ziel.zeitraum_bis);
  const frozen = await db.all(
    `SELECT * FROM incentive_monatswerte WHERE employee_id=${P(1)}`, [ziel.employee_id]);
  const fz = Object.fromEntries(frozen.map(f => [String(f.monat).trim(), f]));

  const liveAe = await aeLive(ziel.employee_id, ziel.messbasis, monate.filter(m => !fz[m]));
  const liveSr = await srLive(ziel.employee_id, ziel.showrate_art, monate.filter(m => !fz[m]));

  const details = monate.map(m => {
    const f = fz[m];
    const ae = f ? r2(f.ae) : (liveAe[m] || 0);
    const sr = f ? { gelegt: f.sr_gelegt, bewertet: f.sr_bewertet, statt: f.sr_statt }
                 : (liveSr[m] || { gelegt: 0, bewertet: 0, statt: 0 });
    // Messbar heisst: ueberhaupt Termine gelegt UND das Belastbarkeits-Gate bestanden.
    // Ein Monat ohne gelegte Termine zaehlt nicht als 0 %, sondern faellt aus dem Mittel.
    const abdeckung = sr.gelegt > 0 ? (sr.bewertet / sr.gelegt) * 100 : 0;
    const messbar = sr.gelegt > 0 && sr.bewertet >= MIN_BASIS && abdeckung >= MIN_BEWERTET;
    return {
      monat: m, ae, eingefroren: !!f, eingefroren_am: f ? f.eingefroren_am : null,
      sr_gelegt: sr.gelegt, sr_bewertet: sr.bewertet, sr_statt: sr.statt,
      sr_abdeckung: Math.round(abdeckung),
      sr_rate: sr.bewertet > 0 ? Number((sr.statt / sr.bewertet * 100).toFixed(1)) : null,
      sr_messbar: messbar,
      sr_grund: sr.gelegt === 0 ? 'keine Termine gelegt'
        : !messbar ? 'Datenbasis unzureichend' : null,
    };
  });

  const aeGesamt = r2(details.reduce((s, d) => s + d.ae, 0));
  // Arithmetisches Mittel ueber die messbaren Monate — nicht gepoolt, und leere Monate fallen raus.
  const messbare = details.filter(d => d.sr_messbar);
  const srMittel = messbare.length
    ? Number((messbare.reduce((s, d) => s + d.sr_rate, 0) / messbare.length).toFixed(1)) : null;

  return {
    employee_id: ziel.employee_id, messbasis: ziel.messbasis, showrate_art: ziel.showrate_art,
    zeitraum: { von: ziel.zeitraum_von, bis: ziel.zeitraum_bis }, monate: details,
    ae_gesamt: aeGesamt, sr_mittel: srMittel,
    sr_monate_gewertet: messbare.map(d => d.monat),
    sr_nicht_messbar: srMittel == null,
    vorlaeufig: !!ziel.vorlaeufig, notiz: ziel.notiz || null,
    ziele: {
      warschau: { ae: ziel.ziel_ae_warschau == null ? null : Number(ziel.ziel_ae_warschau),
                  sr: ziel.ziel_sr_warschau == null ? null : Number(ziel.ziel_sr_warschau) },
      muenchen: { ae: ziel.ziel_ae_muenchen == null ? null : Number(ziel.ziel_ae_muenchen),
                  sr: ziel.ziel_sr_muenchen == null ? null : Number(ziel.ziel_sr_muenchen) },
    },
  };
}

// ── Teamziel ─────────────────────────────────────────────────────────────────

/**
 * NK-AE mit Closer-Standort Bonn je Monat, nach gewonnen_monat — live.
 * Bewusst dieselbe Definition wie die Dashboard-Zelle nk_bonn (kpis.js): EUR-umgerechnet und
 * ae_ab_monat-gegated, Standort ueber den CLOSER. Nicht die Summe der Incentive-Teilnehmer:
 * das Teamziel ist Standortumsatz.
 */
async function teamGate(monate) {
  if (!monate.length) return [];
  const ph = monate.map((_, i) => P(i + 1)).join(',');
  const rows = await db.all(
    `SELECT d.gewonnen_monat monat, COALESCE(SUM(${aeEurGatedSql('d', 'c')}), 0) ae
       FROM deals_nk d
       LEFT JOIN employees e ON e.id = d.closer_id
       LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status = 'Gewonnen' AND d.gewonnen_monat IN (${ph}) AND e.standort = 'Bonn'
      GROUP BY d.gewonnen_monat`, monate);
  const m = Object.fromEntries(rows.map(r => [String(r.monat).trim(), r2(r.ae)]));
  return monate.map(monat => ({
    monat, ae: m[monat] || 0, ziel: TEAMZIEL_MONAT,
    erreicht: (m[monat] || 0) >= TEAMZIEL_MONAT,
    rest: Math.max(0, r2(TEAMZIEL_MONAT - (m[monat] || 0))),
  }));
}

/** Status je Reise: 'erreicht' | 'auf_kurs' | 'gefaehrdet' | 'offen'. */
function reiseStatus({ aeIst, aeZiel, srIst, srZiel, teamOk = true, teamNoetig = false }) {
  const aeOk = aeZiel == null ? true : aeIst >= aeZiel;
  const srOk = srZiel == null ? true : (srIst != null && srIst >= srZiel);
  const gates = [aeOk, srOk, teamNoetig ? teamOk : true];
  if (gates.every(Boolean)) return 'erreicht';
  // "auf Kurs" = Auftragseingang mindestens zu 70 % und Show-Rate (falls gefordert) in Ordnung.
  const aeAnteil = aeZiel ? aeIst / aeZiel : 1;
  if (aeAnteil >= 0.7 && srOk) return 'auf_kurs';
  return 'gefaehrdet';
}

module.exports = {
  monateVon, freezeFaellig, freezeFaelligeMonate, fortschrittFuer, teamGate, reiseStatus,
  aeLive, srLive, heute, MESSBASIS_SPALTE, TEAMZIEL_MONAT, FREEZE_TAG, MIN_BEWERTET, MIN_BASIS,
};
