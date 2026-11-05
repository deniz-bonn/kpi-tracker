// Kosten aus den gemeldeten Token-Zahlen und den Listenpreisen in config/analyse/models.json.
// Keine Abfrage bei Anthropic (Festlegung: keine Kostenabfragen).
const { MODELS } = require('./basis');

function kosten(model, usage, batch = false) {
  const p = MODELS.preise[model];
  if (!p || !usage) return 0;
  const f = batch ? MODELS.batch_rabatt : 1;
  const inp = usage.input_tokens || 0, out = usage.output_tokens || 0;
  const cr = usage.cache_read_input_tokens || 0, cw = usage.cache_creation_input_tokens || 0;
  return f * (inp * p.input + cw * p.cache_schreiben + cr * p.cache_lesen + out * p.output) / 1e6;
}

module.exports = { kosten };
