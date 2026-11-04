const m = require('./meta.json');
const INTERN = /@(hioffice\.com|high-office\.com|fach-digital\.de|fach-digial\.de|jann-kaporse\.de|morawitzconsulting\.at|lk-recruiting\.com|risem\.ch)$/i;
const okt = m.filter(x => (x.dateString || '') >= '2026-10-01' && (x.dateString || '') < '2026-11-01');
const mail = x => [...new Set([x.host_email, x.organizer_email, ...(x.participants || []), ...((x.meeting_attendees || []).map(a => a.email))].filter(Boolean).map(e => e.toLowerCase()))];
const rows = okt.map(x => {
  const t = (x.title || ''); const tl = t.toLowerCase(); const em = mail(x);
  const ext = em.filter(e => !INTERN.test(e)); const intern = em.filter(e => INTERN.test(e));
  let klasse, grund;
  if (/einstellungsgarantie/.test(tl)) { klasse = 'SC'; grund = 'Titel: Einstellungsgarantie (Verkaufsprodukt)'; }
  else if (/^hioffice cloud/.test(tl) || /^hioffice\s*[-–|]/.test(tl)) { klasse = 'SC'; grund = 'Titel: HiOffice Cloud/HiOffice - Firma'; }
  else if (/schulung|aufteiler|marketing|morgen|abend|onboarding|pm[- ]call|first[- ]match|weekly|team|x jkbub|\bx\b.*\bx\b/.test(tl)) { klasse = 'intern/Sonstiges'; grund = 'Titel-Muster intern'; }
  else { klasse = 'Zweifel'; grund = 'Titel nicht eindeutig'; }
  // Plausibilitaet: SC ohne externe Teilnehmer -> Kunde evtl. nicht eingeloggt (nur vermerken)
  return { id: x.id, datum: (x.dateString || '').slice(0, 10), min: Math.round(x.duration || 0), host: (x.host_email || x.organizer_email || '').split('@')[0], titel: t, klasse, grund, ext: ext.length, intern: intern.length, extDomains: [...new Set(ext.map(e => e.split('@')[1]))], tn: em, summary: !!(x.summary && (x.summary.overview || x.summary.short_summary)) };
});
const c = k => rows.filter(r => r.klasse === k).length;
console.log('Oktober gesamt', rows.length, '| SC-Kandidaten', c('SC'), '| intern/Sonstiges', c('intern/Sonstiges'), '| Zweifel', c('Zweifel'));
const sc = rows.filter(r => r.klasse === 'SC');
const h = {}; for (const r of sc) h[r.host] = (h[r.host] || 0) + 1; console.log('SC-Kandidaten je Host', JSON.stringify(h));
console.log('SC mit Julius als Teilnehmer', sc.filter(r => r.tn.some(e => /kawka/.test(e))).length, '| ohne externen Teilnehmer', sc.filter(r => r.ext === 0).length, '| <10 Min', sc.filter(r => r.min < 10).length);
console.log('SC je Titeltyp: Einstellungsgarantie', sc.filter(r => /einstellungsgarantie/i.test(r.titel)).length, '| mit Firmenname', sc.filter(r => !/einstellungsgarantie/i.test(r.titel)).length);
console.log('\nintern/Sonstiges:'); for (const r of rows.filter(r => r.klasse === 'intern/Sonstiges')) console.log('  ', r.datum, r.host.padEnd(9), String(r.min).padStart(3) + 'min', r.titel.slice(0, 50), '| ext', r.ext);
console.log('\nZweifelsfaelle:'); for (const r of rows.filter(r => r.klasse === 'Zweifel')) console.log('  ', r.datum, r.host.padEnd(9), String(r.min).padStart(3) + 'min', r.titel.slice(0, 60), '| ext', r.ext, r.extDomains.join(','));
require('fs').writeFileSync(__dirname + '/klassen.json', JSON.stringify(rows));
