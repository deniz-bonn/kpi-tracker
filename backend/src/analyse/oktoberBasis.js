// Oktober-Basis: die 1.059 Oktober-Codierungen (exports/oktober-2026/transkript-analyse/codierung_calls.xlsx)
// als basis='oktober' in call_codings uebernehmen. Idempotent (ON CONFLICT DO NOTHING).
// Kein Transkripttext — die Excel enthaelt nur Codierung und Paraphrasen.
const ExcelJS = require('exceljs');
const { db, TEAM, PH } = require('./basis');

const JA_NEIN = (v) => (v == null || v === '' ? null : String(v).trim());
const zahl = (v) => (v == null || v === '' ? null : Number(String(v).replace(',', '.')));
const grundId = (v) => (v ? String(v).trim().split(/\s+/)[0] : null);   // "B2-13 Setter bietet ..." -> "B2-13"
const deDatum = (v) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(v || '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

async function importiere(datei, { log = console.log } = {}) {
  // Eingabe: die Oktober-Excel (Blatt "Calls") oder dieselben Zeilen als JSON-Liste von Objekten (Spaltenname -> Wert).
  let kopf, zeilen = [];
  if (/\.json$/i.test(datei)) {
    const liste = JSON.parse(require('fs').readFileSync(datei, 'utf8'));
    kopf = ['', ...Object.keys(liste[0] || {})];
    zeilen = liste.map(o => kopf.map(k => (k ? o[k] : undefined)));
  } else {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(datei);
    const ws = wb.getWorksheet('Calls');
    if (!ws) throw new Error('Blatt "Calls" fehlt in ' + datei);
    kopf = ws.getRow(1).values.map(v => (v == null ? '' : String(v)));
    ws.eachRow((row, nr) => { if (nr > 1) zeilen.push(row.values); });
  }
  const sp = (name) => { const i = kopf.indexOf(name); if (i < 0) throw new Error('Spalte fehlt: ' + name); return i; };
  const S = {
    opp: sp('Opp-ID'), call: sp('Call-ID'), quelle: sp('Quelle'), datum: sp('Datum'), ma: sp('Mitarbeiter'),
    typ: sp('Call-Typ (nach Inhalt)'), typH: sp('Call-Typ laut Zeitlinie'), anlass: sp('Zeitlinie: Anlass'), erg: sp('Ergebnis'),
    erfolg: sp('Stufe erfolgreich'), konf: sp('Konfidenz gesamt'), g1: sp('Grund 1'), k1: sp('Konfidenz Grund 1'), g2: sp('Grund 2'),
    k2: sp('Konfidenz Grund 2'), frei: sp('Freitext Sonstiger Grund'), rede: sp('Redeanteil MA %'), dauer: sp('Dauer Min'),
    ent: sp('Entscheider im Gespraech'), bed: sp('Bedarf bestaetigt'), schritt: sp('Naechster Schritt mit Datum'), aktiv: sp('MA fragte aktiv nach Termin'),
    abf: sp('Abschlussfrage gestellt (B1-09 invers)'), cla: sp('Closing aktiv angeboten (B2-13 invers)'), fix: sp('Termin verbindlich fixiert (B2-14 invers)'),
    abv: sp('Abschluss aktiv versucht (B5-13 invers)'), b4: sp('Warnsignale B4 (Transkript)'), wid: sp('Zusammenfassung widerspricht'),
    ein: sp('Einzeiler (paraphrasiert)'),
  };
  const emps = await db.all(`SELECT id, name FROM employees`);
  const empVon = (name) => { const e = emps.find(x => String(x.name || '').trim().toLowerCase() === name.toLowerCase()); return e ? Number(e.id) : null; };
  const personVon = Object.fromEntries(TEAM.personen.map(p => [p.vorname, { name: p.name, employeeId: empVon(p.name) }]));

  let neu = 0, gelesen = 0;
  for (const v of zeilen) {
    const quelle = String(v[S.quelle] || '').toLowerCase() === 'fireflies' ? 'fireflies' : 'close';
    const id = v[S.call];
    if (!id) continue;
    gelesen++;
    const p = personVon[String(v[S.ma] || '').trim()] || { name: String(v[S.ma] || ''), employeeId: null };
    const konf = JA_NEIN(v[S.konf]);
    const row = {
      quelle, quell_id: String(id), basis: 'oktober', close_opportunity_id: v[S.opp] || null, employee_id: p.employeeId, mitarbeiter: p.name,
      call_datum: deDatum(v[S.datum]), dauer_sek: zahl(v[S.dauer]) != null ? Math.round(zahl(v[S.dauer]) * 60) : null, redeanteil_ma: zahl(v[S.rede]),
      stufe_zeitlinie: JA_NEIN(v[S.typH]), stufe_zeitlinie_grund: JA_NEIN(v[S.anlass]), stufe: JA_NEIN(v[S.typ]), ergebnis: JA_NEIN(v[S.erg]),
      erfolg: JA_NEIN(v[S.erfolg]), konfidenz: konf, in_hauptquote: db.dialect === 'postgres' ? konf !== 'niedrig' : (konf !== 'niedrig' ? 1 : 0),
      grund1_id: grundId(v[S.g1]), grund1_konfidenz: JA_NEIN(v[S.k1]), grund2_id: grundId(v[S.g2]), grund2_konfidenz: JA_NEIN(v[S.k2]),
      grund_freitext: JA_NEIN(v[S.frei]), entscheider_im_gespraech: JA_NEIN(v[S.ent]), bedarf_bestaetigt: JA_NEIN(v[S.bed]),
      naechster_schritt_mit_datum: JA_NEIN(v[S.schritt]), ma_fragte_aktiv_nach_termin: JA_NEIN(v[S.aktiv]), abschlussfrage_gestellt: JA_NEIN(v[S.abf]),
      closing_aktiv_angeboten: JA_NEIN(v[S.cla]), termin_verbindlich_fixiert: JA_NEIN(v[S.fix]), abschluss_aktiv_versucht: JA_NEIN(v[S.abv]),
      warnsignale_b4: JA_NEIN(v[S.b4]), widerspruch_zusammenfassung: JA_NEIN(v[S.wid]), einzeiler: JA_NEIN(v[S.ein]),
      modell: 'claude-sonnet-5-5', prompt_version: 'v1', taxonomie_version: 'v1',
    };
    const cols = Object.keys(row);
    const r = await db.run(`INSERT INTO call_codings (${cols.join(',')}) VALUES (${PH(cols.length)}) ON CONFLICT (quelle, quell_id) DO NOTHING`, cols.map(c => row[c]));
    neu += Number(r.rowCount ?? r.changes ?? 0);
  }
  // Lead-ID aus dem Close-Spiegel nachtragen (fuer die Verbleib-Liste), soweit vorhanden
  await db.run(`UPDATE call_codings SET close_lead_id = (SELECT o.lead_id FROM close_opportunities o WHERE o.id = call_codings.close_opportunity_id)
                 WHERE basis='oktober' AND close_lead_id IS NULL`);
  log(`  Oktober-Basis: ${gelesen} Zeilen gelesen, ${neu} neu uebernommen`);
  return { gelesen, neu };
}

module.exports = { importiere };
