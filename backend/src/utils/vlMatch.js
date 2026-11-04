// ── Dublettenregel fuer Verlaengerungen (externe API: GET /vl/match, POST /vl) ─────────────
//
// Ausgang je Kandidat:
//   exact  — gleiche Kundennummer (HubSpot ID) UND gleicher VL-Monat,
//            ODER gleiche Vertragsnummer + gleicher normalisierter Name + gleicher Monat.
//   nahe   — gleiche Kundennummer, gleicher oder aehnlicher Name (Levenshtein <= 2 ab 6 Zeichen)
//            UND (gleicher Monat ODER Monat +-1 ODER Datum/Kuendigungsfrist innerhalb der Toleranz).
//   (kein Treffer) — sonst.
// AUSSCHLUSS vorab (legitime getrennte Ereignisse, z. B. Mehrmonats-Vertraege, Regel 10.08.):
//   beide haben ein Ende der Kuendigungsfrist und es liegt > Toleranz auseinander, ODER
//   beide haben eine Vertragsnummer und sie ist verschieden.
// Die Regel ist bewusst vorsichtig: lieber ein 409 als eine Dublette. Fuer den Altbestand haben
// nur ~22 % der Braunschweiger Verlaengerungen eine HubSpot ID (Backup 12.10.2026) — dort traegt
// der Namensabgleich.

const RECHTSFORMEN = new Set(['gmbh', 'gesmbh', 'mbh', 'co', 'kg', 'ag', 'ug', 'haftungsbeschraenkt',
  'ek', 'ohg', 'gbr', 'ev', 'se', 'kgaa', 'und', 'u', 'gmbhco', 'cokg']);

/** Name normalisieren: Kleinschreibung, Umlaute, Rechtsformen und Satzzeichen weg. */
function normName(s) {
  const t = String(s || '').toLowerCase()
    .replace(/\./g, '')                              // "G.m.b.H." -> "gmbh", "e.K." -> "ek"
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ').trim();
  return t.split(' ').filter(w => w && !RECHTSFORMEN.has(w)).join('');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;   // reicht fuer die Schwelle 2
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

const ymd = (v) => {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v.toISOString().slice(0, 10);
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};
const tageZwischen = (a, b) => Math.abs((new Date(a + 'T12:00:00Z') - new Date(b + 'T12:00:00Z')) / 864e5);
const monatsAbstand = (a, b) => {
  const [y1, m1] = String(a).split('-').map(Number), [y2, m2] = String(b).split('-').map(Number);
  return Math.abs((y1 * 12 + m1) - (y2 * 12 + m2));
};
const txt = (v) => (v == null ? '' : String(v).trim());

/**
 * @param eingabe { kundennummer?, kunde?, monat, vertragsnummer?, datum?, ende_kuendigungsfrist? }
 * @param kandidaten Deal-Zeilen (bereits auf den Standort-Scope gefiltert)
 * @param toleranzTage Default 14
 * @returns { ergebnis: 'exact'|'nahe'|'keine', exact: [{deal, gruende}], nahe: [{deal, gruende}] }
 */
function findeTreffer(eingabe, kandidaten, toleranzTage = 14) {
  const kn = txt(eingabe.kundennummer), vn = txt(eingabe.vertragsnummer);
  const name = normName(eingabe.kunde), monat = txt(eingabe.monat).slice(0, 7);
  const datum = ymd(eingabe.datum), frist = ymd(eingabe.ende_kuendigungsfrist);
  const exact = [], nahe = [];

  for (const d of kandidaten) {
    const dKn = txt(d.kundennummer), dVn = txt(d.vertragsnummer), dName = normName(d.kunde);
    const dMonat = txt(d.monat).slice(0, 7), dDatum = ymd(d.datum), dFrist = ymd(d.ende_kuendigungsfrist);

    // Ausschluss: eindeutig verschiedene Ereignisse
    if (frist && dFrist && tageZwischen(frist, dFrist) > toleranzTage) continue;
    if (vn && dVn && vn !== dVn) continue;

    const knGleich   = !!kn && kn === dKn;
    const nameGleich = !!name && name === dName;
    const nameAehnl  = !nameGleich && !!name && name.length >= 6 && dName.length >= 6 && levenshtein(name, dName) <= 2;
    const monatGleich = !!monat && monat === dMonat;

    const gruende = [];
    if (knGleich) gruende.push('kundennummer_gleich');
    if (nameGleich) gruende.push('name_gleich');
    if (nameAehnl) gruende.push('name_aehnlich');
    if (vn && vn === dVn) gruende.push('vertragsnummer_gleich');

    if ((knGleich && monatGleich) || (vn && vn === dVn && nameGleich && monatGleich)) {
      exact.push({ deal: d, gruende: [...gruende, 'monat_gleich'] });
      continue;
    }
    if (!(knGleich || nameGleich || nameAehnl)) continue;
    if (monatGleich) gruende.push('monat_gleich');
    else if (monat && dMonat && monatsAbstand(monat, dMonat) === 1) gruende.push('monat_benachbart');
    if (datum && dDatum && tageZwischen(datum, dDatum) <= toleranzTage) gruende.push('datum_in_toleranz');
    if (frist && dFrist && tageZwischen(frist, dFrist) <= toleranzTage) gruende.push('frist_in_toleranz');
    if (gruende.some(g => ['monat_gleich', 'monat_benachbart', 'datum_in_toleranz', 'frist_in_toleranz'].includes(g))) {
      nahe.push({ deal: d, gruende });
    }
  }
  return { ergebnis: exact.length ? 'exact' : nahe.length ? 'nahe' : 'keine', exact, nahe };
}

module.exports = { normName, levenshtein, findeTreffer };
