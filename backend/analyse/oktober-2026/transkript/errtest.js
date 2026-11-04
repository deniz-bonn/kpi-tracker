require('dotenv').config({ path: '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend/.env', quiet: true });
const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk'); const c = new Anthropic();
const mk = (extra) => ({ type: 'object', additionalProperties: false, required: ['a', 'g'], properties: { a: { type: 'string', enum: ['x', 'y'] }, g: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['t'], properties: { t: { type: 'string' } } }, ...extra } } });
(async () => { for (const [n, extra] of [['ohne maxItems', {}], ['mit maxItems', { maxItems: 3 }]]) {
  try { const r = await c.messages.create({ model: 'claude-opus-5-5', max_tokens: 1000, output_config: { effort: 'low', format: { type: 'json_schema', schema: mk(extra) } }, messages: [{ role: 'user', content: 'a=x, g mit einem Eintrag t=hallo' }] }); console.log(n, 'OK', r.content.filter(b => b.type === 'text').map(b => b.text).join('').slice(0, 80)); }
  catch (e) { console.log(n, 'FEHLER', e.status, (e.error && e.error.error && e.error.error.message) || e.message); } } })();
