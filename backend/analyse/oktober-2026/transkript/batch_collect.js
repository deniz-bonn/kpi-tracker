require('dotenv').config({ path: '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend/.env', quiet: true });
const A = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk'); const C = require('./code_lib'); const fs = require('fs'); const client = new A();
const ids = require('./run/batch_ids.json'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  for (let i = 0; i < 180; i++) {
    const st = await Promise.all(ids.map(id => client.messages.batches.retrieve(id)));
    const fertig = st.every(b => b.processing_status === 'ended');
    fs.writeFileSync('run/batch_status.json', JSON.stringify({ t: new Date().toISOString(), st: st.map(b => ({ id: b.id.slice(-8), s: b.processing_status, c: b.request_counts })) }));
    if (fertig) break; await sleep(60000);
  }
  const res = []; const fehler = []; const u = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
  for (const id of ids) { for await (const r of await client.messages.batches.results(id)) {
    if (r.result.type !== 'succeeded') { fehler.push({ id: r.custom_id, typ: r.result.type, e: JSON.stringify(r.result.error || {}).slice(0, 120) }); continue; }
    const m = r.result.message; for (const k of Object.keys(u)) u[k] += (m.usage[k] || 0);
    try { res.push({ customId: r.custom_id, out: JSON.parse(m.content.filter(b => b.type === 'text').map(b => b.text).join('')), stop: m.stop_reason }); } catch (e) { fehler.push({ id: r.custom_id, typ: 'parse', stop: m.stop_reason }); } } }
  C.logKosten('Batch Codierung (Sonnet, alle Calls)', 'claude-sonnet-5-5', u, true);
  fs.writeFileSync('run/batch_results.json', JSON.stringify(res)); fs.writeFileSync('run/batch_fehler.json', JSON.stringify(fehler));
  fs.writeFileSync('run/BATCH_FERTIG.txt', `ok ${res.length} fehler ${fehler.length}`);
})().catch(e => { fs.writeFileSync('run/BATCH_FERTIG.txt', 'FEHLER ' + e.message); });
