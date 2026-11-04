const L = require('./lib'); const C = require('./code_lib'); const fs = require('fs'); const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
const client = new Anthropic(); const stages = require('./stages.json'); const zu = require('./ff/zuordnung.json'); const ffmeta = Object.fromEntries(require('./ff/meta.json').map(x => [x.id, x]));
const faelle = [
  ...stages.filter(c => c.imKreis).map(c => ({ quelle: 'close', callId: c.callId, leadId: c.leadId, datum: c.datum, zeit: c.zeit, person: c.person, stufeH: c.stufe, warum: c.warum, richtung: c.richtung })),
  ...zu.filter(z => (z.stufe === 'sicher' || z.stufe.startsWith('wahr')) && z.leadId).map(z => ({ quelle: 'fireflies', id: z.ffId, leadId: z.leadId, datum: z.datum, zeit: ffmeta[z.ffId] && ffmeta[z.ffId].date ? new Date(ffmeta[z.ffId].date).toISOString() : null, person: null, stufeH: 'Closing', warum: 'Fireflies-Videocall, zugeordnet' })),
];
const reqs = [], metas = {}, ohne = []; const q = [...faelle]; let n = 0;
async function w() { while (q.length) { const f = q.shift(); try { const fall = await C.baueFall(f, 'claude-sonnet-5-5', 'low'); if (!fall) { ohne.push({ quelle: f.quelle, id: f.callId || f.id, datum: f.datum, stufeH: f.stufeH, person: f.person }); } else { reqs.push({ custom_id: fall.customId, params: fall.params }); metas[fall.customId] = fall.meta; } } catch (e) { ohne.push({ quelle: f.quelle, id: f.callId || f.id, datum: f.datum, fehler: String(e.message).slice(0, 80) }); }
  if (++n % 100 === 0) console.log('gebaut', n, '/', faelle.length); } }
(async () => {
  await Promise.all([1, 2, 3, 4].map(w));
  const names = {}; for (const m of Object.values(metas)) { names[m.customId] = { kunden: m.kundenNamen, lead: m.leadName }; delete m.kundenNamen; delete m.leadName; }
  fs.writeFileSync('run/meta.json', JSON.stringify(metas)); fs.writeFileSync('run/names_scratch.json', JSON.stringify(names)); fs.writeFileSync('run/ohne_transkript.json', JSON.stringify(ohne));
  console.log('Faelle', faelle.length, '| mit Transkript', reqs.length, '| ohne Transkript/Fehler', ohne.length);
  const ids = []; const CH = 350;
  for (let i = 0; i < reqs.length; i += CH) { const b = await client.messages.batches.create({ requests: reqs.slice(i, i + CH) }); ids.push(b.id); console.log('Batch', b.id, 'mit', Math.min(CH, reqs.length - i), 'Anfragen'); }
  fs.writeFileSync('run/batch_ids.json', JSON.stringify(ids)); console.log('FERTIG eingereicht');
})().catch(e => { console.error('FEHLER', e.status, (e.message || '').slice(0, 300)); process.exit(1); });
