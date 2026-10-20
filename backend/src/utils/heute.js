// ── "Heute" in Berlin ────────────────────────────────────────────────────────
//
// Die Nutzer arbeiten in Europe/Berlin, der Container auf Railway laeuft in UTC (weder Dockerfile
// noch railway.toml setzen TZ). Lokale Getter von new Date() liefern dort den UTC-Tag — zwischen
// 00:00 und 01:00 (Winterzeit) bzw. 02:00 (Sommerzeit) Berliner Zeit ist das noch GESTERN. Eine
// Pruefung "Datum <= heute" wuerde in diesem Fenster einen heute eingetragenen Deal als Zukunft
// ablehnen. Berlin liegt immer vor UTC, die Gegenrichtung (einen Tag zu viel durchlassen) gibt es
// nicht. Format 'YYYY-MM-DD', direkt vergleichbar mit DATE-Werten (Typparser 1082, db/index.js).
const BERLIN = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });

/** @param jetzt Zeitpunkt (fuer Tests einschleusbar), Default jetzt */
const heuteBerlin = (jetzt = new Date()) => BERLIN.format(jetzt);

/** 'YYYY-MM-DD' -> 'TT.MM.JJJJ' fuer Fehlermeldungen. */
const datumDe = (ymd) => (ymd ? `${ymd.slice(8, 10)}.${ymd.slice(5, 7)}.${ymd.slice(0, 4)}` : '');

module.exports = { heuteBerlin, datumDe };
