require('dotenv').config({ path: '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend/.env' });
const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
(async () => {
  const client = new Anthropic();
  for (const model of ['claude-opus-5-5', 'claude-sonnet-5-5']) {
    try {
      const r = await client.messages.create({ model, max_tokens: 2000, output_config: { effort: 'low' }, messages: [{ role: 'user', content: 'Antworte nur mit dem Wort OK.' }] });
      console.log(model, '->', r.stop_reason, '|', r.content.filter(b => b.type === 'text').map(b => b.text).join('').trim().slice(0, 20), '| Tokens', r.usage.input_tokens, '/', r.usage.output_tokens);
    } catch (e) { console.log(model, 'FEHLER', e.status, (e.message || '').slice(0, 200)); }
  }
  try { const b = await client.messages.batches.list({ limit: 1 }); console.log('Batch-API erreichbar:', Array.isArray(b.data)); } catch (e) { console.log('Batch-API FEHLER', e.status, (e.message || '').slice(0, 160)); }
})();
