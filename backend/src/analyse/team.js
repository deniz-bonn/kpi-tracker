// Team-Abgrenzung: die acht Personen aus config/analyse/team.json mit Close-Benutzern und employee_id.
const close = require('../utils/closeClient');
const { db, TEAM, P } = require('./basis');

const norm = (s) => String(s || '').toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();
let cache = null;

/**
 * Laedt die Personen einmal je Prozess-Lauf: Close-User-IDs ueber Namen (und optionale Zusatz-Mails),
 * employee_id ueber close_user_map bzw. employees.name. Fehlt eine Person in Close, wirft der Aufruf —
 * das ist ein Konfigurationsfehler, der per Fehlermail gemeldet werden soll.
 */
async function ladeTeam({ neu = false } = {}) {
  if (cache && !neu) return cache;
  const users = ((await close.get('/user/', { _limit: 200 })).data || [])
    .map(u => ({ id: u.id, name: `${u.first_name || ''} ${u.last_name || ''}`.trim(), email: norm(u.email) }));
  const personen = [];
  for (const p of TEAM.personen) {
    const namen = new Set(p.close_namen.map(norm));
    const mails = new Set((p.close_emails || []).map(norm));
    const ids = users.filter(u => namen.has(norm(u.name)) || mails.has(u.email)).map(u => u.id);
    if (!ids.length) throw new Error(`Team-Konfiguration: kein Close-Benutzer fuer "${p.name}" gefunden`);
    let emp = null;
    for (const id of ids) {
      const m = await db.get(`SELECT employee_id FROM close_user_map WHERE close_user_id=${P(1)} AND employee_id IS NOT NULL`, [id]).catch(() => null);
      if (m) { emp = Number(m.employee_id); break; }
    }
    if (!emp) {
      const e = await db.get(`SELECT id FROM employees WHERE LOWER(TRIM(name))=${P(1)} ORDER BY aktiv DESC, id LIMIT 1`, [norm(p.name)]);
      if (e) emp = Number(e.id);
    }
    personen.push({ ...p, closeUserIds: ids, employeeId: emp, sprecherRe: new RegExp(p.sprecher_muster, 'i') });
  }
  const nachUser = new Map();
  for (const p of personen) for (const id of p.closeUserIds) nachUser.set(id, p);
  cache = {
    personen,
    nachUser,
    alleUser: users,
    userName: Object.fromEntries(users.map(u => [u.id, u.name || u.email])),
    internRe: new RegExp(TEAM.intern_sprecher_muster, 'i'),
    /** Fireflies-Sprecherlabel -> Person der acht (oder null). */
    personZuSprecher(label) {
      const l = norm(label).replace(/[‎‏]/g, '');
      return personen.find(p => p.sprecherRe.test(l)) || null;
    },
    nachName(name) { return personen.find(p => norm(p.name) === norm(name) || norm(p.vorname) === norm(name)) || null; },
  };
  return cache;
}

module.exports = { ladeTeam };
