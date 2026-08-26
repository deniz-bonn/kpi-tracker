'use strict';
// ── READ-ONLY Close-CRM-API-Client ───────────────────────────────────────────
// Der Close-API-Key ist universell (Close kennt keine read-only Keys). Diese Schicht laesst deshalb
// technisch AUSSCHLIESSLICH GET zu: es gibt keine post/put/delete-Methode, und der Low-Level-Fetch
// erzwingt method:'GET'. Das ist bewusst die EINZIGE Zugriffsschicht auf Close (auch fuer spaetere
// Phasen). Key kommt nur aus process.env.CLOSE_API_KEY und wird nie geloggt/ausgegeben/zurueckgegeben.
const BASE = 'https://api.close.com/api/v1';

function authHeader() {
  const key = process.env.CLOSE_API_KEY;
  if (!key) throw new Error('CLOSE_API_KEY nicht gesetzt (lokal: backend/.env; prod: Railway-ENV).');
  return 'Basic ' + Buffer.from(key + ':').toString('base64'); // Close: Basic-Auth, Key als User, leeres PW
}

// Einziger Netzwerkpfad. Hart auf GET verdrahtet; 429/5xx mit Backoff, moderat.
async function rawGet(path, params) {
  const auth = authHeader(); // einmal: fehlender Key wirft sofort (kein Retry)
  const url = new URL(BASE + (path.startsWith('/') ? path : '/' + path));
  if (params) for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, String(v));
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url, { method: 'GET', headers: { Authorization: auth, Accept: 'application/json' } });
    } catch (e) {
      if (attempt >= 5) throw new Error(`Close GET ${path} — Netzwerkfehler nach ${attempt} Retries: ${e.message}`);
      await sleep(Math.min(30000, 500 * 2 ** attempt)); continue;
    }
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= 6) throw new Error(`Close GET ${path} → HTTP ${res.status} (nach ${attempt} Retries)`);
      const retryAfter = Number(res.headers.get('retry-after')) || 0;
      await sleep(Math.max(retryAfter * 1000, Math.min(30000, 500 * 2 ** attempt)));
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Close GET ${path} → HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json();
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Oeffentliche API: NUR Lesen.
async function get(path, params) { return rawGet(path, params); }

// Skip-basierte Paginierung (Close: has_more + _skip/_limit). Moderate Seitengroesse, hoehflich gedrosselt.
async function getAll(path, params = {}, { max = 20000, limit = 100 } = {}) {
  const out = [];
  let skip = 0;
  for (;;) {
    const page = await rawGet(path, { ...params, _skip: skip, _limit: limit });
    const data = Array.isArray(page) ? page : (page.data || []);
    out.push(...data);
    const hasMore = !Array.isArray(page) && page.has_more;
    if (!hasMore || data.length === 0 || out.length >= max) break;
    skip += data.length;
    await sleep(250);
  }
  return out;
}

module.exports = Object.freeze({ get, getAll, BASE });
