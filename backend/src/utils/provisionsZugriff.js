// ── Wer sieht welche Abrechnungskreise im Bereich "Provisionen" (/provisionen)? ──
//
// EINE Regel fuer alle Admin-Lese-Routen (Uebersicht, Einzeldetail, Konfiguration) — und fuer
// die Frage der Oberflaeche, welche Kreis-Reiter sie zeigt.
//
//   Superadmin                                   -> alle Kreise
//   Einzelfreigabe 'provisionen'                 -> alle Kreise, unabhaengig von der Rolle
//   Rollenfreigabe 'provisionen'                 -> alle Kreise, aber NUR fuer Admin/Vertriebsleitung
//   Einzelfreigabe 'provisionen_<kreis>'         -> genau dieser Kreis (mehrere kombinierbar)
//
// WARUM die Rollenfreigabe auf Admin/Vertriebsleitung begrenzt bleibt: In Produktion steht
// 'provisionen' noch fuer Backoffice und NK-Vertrieb in feature_flags — ein Ueberbleibsel aus
// der Zeit, als das Flag auch die EIGENE Provision freigab (seit Migration 106: 'meine_provision').
// Gewirkt hat es nie, weil die Seite zusaetzlich Admin/VL verlangte. Diese Sperre zu streichen
// haette 25 Personen die Provisionen ALLER Kollegen geoeffnet. Einzelfreigaben sind dagegen eine
// bewusste Entscheidung je Person und wirken fuer jede Rolle (Anlass: 21.10.2026).
//
// Die Kreis-Freigaben sind reine Einzelfreigaben; Rollenhaken gibt es fuer sie nicht.
// Abschluss, Export, Konfiguration aendern und Backfill bleiben Superadmin-only (eigene Routen).
const { KREIS_KEYS, kreisFor } = require('./kreise');
const { hatRollenFreigabe, hatEinzelFreigabe } = require('../middleware/requireFeature');

const VOLL_FEATURE        = 'provisionen';
const kreisFeature        = (kreis) => `provisionen_${kreis}`;
const KREIS_FEATURES      = KREIS_KEYS.map(kreisFeature);
const ROLLEN_MIT_ROLLENFREIGABE = ['admin', 'vertriebsleitung'];

/** Liste der Kreis-Schluessel, die dieser Nutzer im Provisions-Bereich sehen darf ([] = keiner). */
async function provisionsKreise(user) {
  if (!user) return [];
  if (user.role === 'superadmin') return [...KREIS_KEYS];
  if (await hatEinzelFreigabe(user, VOLL_FEATURE)) return [...KREIS_KEYS];
  if (ROLLEN_MIT_ROLLENFREIGABE.includes(user.role) && await hatRollenFreigabe(user, VOLL_FEATURE)) return [...KREIS_KEYS];
  const kreise = [];
  for (const k of KREIS_KEYS) if (await hatEinzelFreigabe(user, kreisFeature(k))) kreise.push(k);
  return kreise;
}

/** Middleware: setzt req.provKreise; 403, wenn der Nutzer keinen einzigen Kreis sehen darf. */
const provisionsSicht = async (req, res, next) => {
  try {
    req.provKreise = await provisionsKreise(req.user);
    if (!req.provKreise.length) return res.status(403).json({ error: 'Kein Zugriff auf dieses Feature' });
    next();
  } catch (e) { next(e); }
};

/** Staffel-Status (alle Standorte) auf die erlaubten Kreise zuschneiden — er nennt Personen,
 *  Monats-AE und Saetze und darf einem "nur Oesterreich"-Nutzer keine Bonner Closer zeigen. */
function staffelFuerKreise(staffel, kreise) {
  if (!staffel) return staffel;
  const darf = (k) => kreise.includes(k);
  return {
    ...staffel,
    closers:  (staffel.closers || []).filter(c => darf(kreisFor(c.standort))),
    team:     darf('bonn') ? staffel.team : null,
    atOpener: darf('oesterreich') ? (staffel.atOpener || []) : [],
    atSetter: darf('oesterreich') ? (staffel.atSetter || []) : [],
  };
}

module.exports = { VOLL_FEATURE, KREIS_FEATURES, kreisFeature, provisionsKreise, provisionsSicht, staffelFuerKreise };
