// ── Live-Board (/board) — Vollbild fuer den Bildschirm im Bonner NK-Vertrieb ────────────────────
// Eigenstaendige Seite ohne Navigation. Zeichnet fest in 1920×1080 und skaliert auf jeden
// Bildschirm. Zwei Raster-Seiten im Wechsel (60 s): A "Wettbewerb", B "Pipeline & Rollen".
//
// Anmeldung: Display-Sitzung aus dem Link (#k=kpt_…) — wird lokal abgelegt und sofort aus der
// Adresszeile entfernt — oder, ohne Display-Sitzung, die normale Anmeldung (Vorschau mit Feature
// 'live_board'). Daten alle 30 s von /api/board; alle Zahlen rechnet der Server aus den
// bestehenden Quellen, hier wird nur dargestellt. Einzige Rechnung hier: die Closing-Rate ueber
// rollenStats() — dieselbe Funktion wie auf der Neukunden-Seite.
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { rollenStats } from '../utils/nkConstants';
import { fireConfetti, reducedMotion } from '../components/Celebration';

const BOARD_KEY = 'kpi_board_token';
const POLL_MS = 30_000;
const SEITE_MS = 60_000;
const SICHT_MS = 12_000;
const ZEIT_MS = 20_000;
const TOAST_MS = 15_000;

// ── Token ──────────────────────────────────────────────────────────────────────────────────────
function leseToken() {
  try {
    const m = /[#&]k=(kpt_[A-Za-z0-9_-]+)/.exec(window.location.hash || '');
    if (m) {
      localStorage.setItem(BOARD_KEY, m[1]);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const display = localStorage.getItem(BOARD_KEY);
    if (display) return { token: display, art: 'display' };
    const session = localStorage.getItem('kpi_token');
    if (session) return { token: session, art: 'session' };
  } catch { /* privater Modus */ }
  return null;
}

// ── Format ─────────────────────────────────────────────────────────────────────────────────────
const eur = (n) => `${Math.round(Number(n) || 0).toLocaleString('de-DE')} €`;
const kEur = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: v % 1000 && Math.abs(v) < 100000 ? 1 : 0 })}k`;
  return Math.round(v).toLocaleString('de-DE');
};
const pct = (n) => (n == null ? '–' : `${Math.round(n)} %`);
const datumLang = (ymd) => new Date(`${ymd}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const tageSeit = (ymd, heute) => (ymd ? Math.round((Date.parse(heute) - Date.parse(ymd)) / 86400000) : null);
const seitText = (ymd, heute) => {
  const t = tageSeit(ymd, heute);
  if (t == null) return '–';
  return t <= 0 ? 'heute' : t === 1 ? 'gestern' : `vor ${t} T`;
};
const farbe = (q) => (q == null ? 'var(--tx3)' : q >= 100 ? 'var(--ok)' : q >= 70 ? 'var(--warn)' : 'var(--bad)');
const chipKl = (q) => (q == null ? '' : q >= 100 ? 'g' : q >= 70 ? 'y' : 'r');

// ── Avatar (Foto per Board-Zugang laden, sonst Initialen) ─────────────────────────────────────
const fotoCache = new Map();   // `${id}:${version}` -> objectURL | Promise
function useFoto(id, version, token) {
  const key = version ? `${id}:${version}` : null;
  const [url, setUrl] = useState(() => (key && typeof fotoCache.get(key) === 'string' ? fotoCache.get(key) : null));
  useEffect(() => {
    if (!key || !token) { setUrl(null); return; }
    const c = fotoCache.get(key);
    if (typeof c === 'string') { setUrl(c); return; }
    let aktiv = true;
    const p = c || fetch(`/api/board/foto/${id}?v=${version}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.blob() : null)).then(b => (b ? URL.createObjectURL(b) : null)).catch(() => null)
      .then(u => { if (u) fotoCache.set(key, u); else fotoCache.delete(key); return u; });
    if (!c) fotoCache.set(key, p);
    p.then(u => { if (aktiv) setUrl(u); });
    return () => { aktiv = false; };
  }, [key, id, version, token]);
  return url;
}
function Avatar({ p, size = 36, token, ring }) {
  const url = useFoto(p?.id, p?.foto, token);
  const ini = String(p?.name || '?').split(' ').filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const h = ((Number(p?.id) || 0) * 47) % 360;
  const st = { width: size, height: size, fontSize: Math.round(size * 0.36), boxShadow: ring ? `0 0 0 ${Math.max(3, size / 22)}px ${ring}` : undefined };
  return url
    ? <img className="lb-av" src={url} alt="" style={st} />
    : <span className="lb-av" style={{ ...st, '--h': h }}>{ini}</span>;
}

// ── Kleine Bausteine ───────────────────────────────────────────────────────────────────────────
function Gauge({ ist, soll, label, unter, fmt = (v) => v }) {
  const q = soll > 0 ? Math.min(1, ist / soll) : 0;
  const L = 298;
  const c = soll > 0 ? (ist >= soll ? '#22c55e' : q >= 0.7 ? '#f59e0b' : '#ef4444') : '#26365a';
  return (
    <div className="lb-g">
      <svg viewBox="0 0 230 128" style={{ width: '100%', maxWidth: 210, height: 'auto' }}>
        <path d="M20 115 A95 95 0 0 1 210 115" fill="none" stroke="#26365a" strokeWidth="20" strokeLinecap="round" />
        <path d="M20 115 A95 95 0 0 1 210 115" fill="none" stroke={c} strokeWidth="20" strokeLinecap="round"
          strokeDasharray={L} strokeDashoffset={L * (1 - q)} style={{ transition: 'stroke-dashoffset .8s' }} />
        <text x="115" y="96" textAnchor="middle" fill="#f4f7fb" fontSize="42" fontWeight="800">{fmt(ist)}</text>
        <text x="115" y="121" textAnchor="middle" fill="#9fb0cc" fontSize="15">{unter}</text>
      </svg>
      <div className="lab">{label}</div>
    </div>
  );
}

function Delta({ e }) {
  if (e.platz_gestern == null) return <span className="d eq">neu</span>;
  const d = e.platz_gestern - e.platz;
  if (d > 0) return <span className="d up">▲ {d}</span>;
  if (d < 0) return <span className="d dn">▼ {-d}</span>;
  return <span className="d eq">–</span>;
}

const SICHTEN = [
  { key: 'alle',   titel: 'Alle',   art: 'zeitraum' },
  { key: 'opener', titel: 'Opener', art: 'zeitraum' },
  { key: 'setter', titel: 'Setter', art: 'zeitraum' },
  { key: 'closer', titel: 'Closer', art: 'zeitraum' },
  { key: 'jahr',   titel: 'Jahr',   art: 'jahr' },
];

function Rainmakers({ prov, pers, token }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % SICHTEN.length), SICHT_MS); return () => clearInterval(t); }, []);
  const s = SICHTEN[i];
  const liste = prov?.sichten?.[s.key] || [];
  // Der Hinweis "ohne Team" ist nur dort Information, wo die Teamprovision ueberhaupt fehlen koennte.
  const team = (s.key === 'alle' || s.key === 'jahr') ? (prov?.team_ausgeschlossen?.[s.art] || {}) : {};
  const z = prov?.zeitraum;
  const fmtD = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.` : '');
  const sub = s.art === 'jahr'
    ? `Provision · ${prov?.jahr?.jahr}${prov?.jahr?.ab ? ` seit ${fmtD(prov.jahr.ab)}` : ''} · ${prov?.jahr?.zeitraeume || 0} Zeiträume`
    : `Provision · Abrechnungszeitraum ${z ? `${fmtD(z.von)}–${fmtD(z.bis)}` : '–'}`;
  const [p1, p2, p3] = liste;
  const rest = liste.slice(3, 9);
  const Pod = ({ e, rang, size, h, ring }) => e ? (
    <div className="pod">
      <div className="ring" style={{ background: ring }}><Avatar p={pers(e.employee_id)} size={size} token={token} /><span className="rk" style={{ background: ring }}>{rang}</span></div>
      <div className="nm">{pers(e.employee_id)?.vorname}{team[e.employee_id] ? <span className="chip sm">ohne Team</span> : null}</div>
      <div className="amt" style={rang === 1 ? { fontSize: 38 } : null}>{eur(e.summe)}</div>
      <div className="dl">{e.heute > 0.5 ? <span className="up">+{eur(e.heute)} heute</span> : <Delta e={e} />}</div>
      <div className="block" style={{ height: h }} />
    </div>
  ) : <div className="pod" />;
  return (
    <div className="tile">
      <div className="th" style={{ marginBottom: 8 }}><div><div className="tt">Top Rainmakers</div><div className="ts">{sub}</div></div></div>
      <div className="chips" style={{ marginLeft: 0, justifyContent: 'flex-start', marginBottom: 2 }}>{SICHTEN.map((x, k) => <span key={x.key} className={`chip ${k === i ? 'on' : ''}`}>{x.titel}</span>)}</div>
      {liste.length === 0 ? <div className="leer">Noch keine Provision in dieser Sicht.</div> : (<>
        <div className="podium">
          <Pod e={p2} rang={2} size={104} h={46} ring="var(--silver)" />
          <Pod e={p1} rang={1} size={128} h={70} ring="var(--gold)" />
          <Pod e={p3} rang={3} size={96} h={30} ring="var(--bronze)" />
        </div>
        <div className="rl">
          {rest.map(e => (
            <div key={e.employee_id} className="rr"><span className="p">{e.platz}</span><Avatar p={pers(e.employee_id)} size={36} token={token} />
              <span className="n">{pers(e.employee_id)?.vorname}{team[e.employee_id] ? <span className="chip sm">ohne Team</span> : null}</span>
              <span className="v">{eur(e.summe)}</span><Delta e={e} /></div>
          ))}
        </div>
      </>)}
      <div className="note">Pfeile: Platz gegenüber gestern 24 Uhr. Ohne Teamprovision (Buchungsrolle „team“). „Opener+Setter“-Pauschale zählt in beiden Rollen.</div>
    </div>
  );
}

function Thermometer({ team }) {
  const ist = team.ae_monat, ziel = team.ziel_monat, soll = team.soll_heute;
  const max = Math.max(ziel, ist, team.teamgate) || 1;
  const vorn = ist - soll;
  const bg = ist >= soll ? 'linear-gradient(135deg,#16a34a,#15803d)' : ist >= soll * 0.85 ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#dc2626,#b91c1c)';
  return (
    <div className="tile hero" style={{ background: bg }}>
      <div className="th"><div><div className="tt">Auftragseingang NK Bonn</div>
        <div className="ts">Monat bis heute · Ziel {eur(ziel)}{team.ziel_quelle === 'kpi_vorgabe' ? ' (KPI-Vorgabe)' : ''}</div></div>
        <div className="chips"><span className="chip dark">{vorn >= 0 ? `▲ ${eur(vorn)} vor Soll heute` : `▼ ${eur(-vorn)} hinter Soll heute`}</span></div></div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <div className="big">{eur(ist)}</div><div className="bigp">{ziel ? Math.round(ist / ziel * 100) : 0} %</div></div>
      <div className="bar"><i style={{ width: `${Math.min(100, ist / max * 100)}%` }} />
        <div className="mk" style={{ left: `${Math.min(100, soll / max * 100)}%` }}><span>Soll heute {kEur(soll)}</span></div>
        {team.teamgate < max * 1.001 && <div className="mk gate" style={{ left: `${team.teamgate / max * 100}%` }}><span>Teamgate {kEur(team.teamgate)}</span></div>}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

function Verlauf({ team, stand }) {
  const monat = stand.monat, vm = team.vormonat;
  const tage = (m) => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0).getDate();
  const n = tage(monat), nv = tage(vm);
  const kum = (jeTag, m, bis, len) => { let s = 0; const out = []; for (let d = 1; d <= len; d++) { const k = `${m}-${String(d).padStart(2, '0')}`; if (bis && k > bis) break; s += Number(jeTag[k] || 0); out.push(s); } return out; };
  const akt = kum(team.verlauf || {}, monat, stand.stichtag, n);
  const vor = kum(team.verlauf_vormonat || {}, vm, null, nv);
  const W = 640, H = 230, x0 = 46, x1 = 630, y0 = 200, y1 = 20;
  const max = Math.max(team.ziel_monat, ...akt, ...vor, 1);
  const X = (d, len) => x0 + (x1 - x0) * (d / Math.max(1, len - 1));
  const Y = (v) => y0 - (y0 - y1) * (v / max);
  const pts = (arr, len) => arr.map((v, i) => `${X(i, len).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const last = akt.length - 1;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * max);
  return (
    <div className="tile">
      <div className="th"><div><div className="tt">Sind wir on track?</div><div className="ts">AE kumuliert · dieser Monat (Fläche), Vormonat (gepunktet), Ziel-Linie</div></div></div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', flex: 1, minHeight: 0 }}>
        <defs><linearGradient id="lbga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#22c55e" stopOpacity=".55" /><stop offset="1" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs>
        {ticks.map((t, i) => <g key={i}><line x1={x0} x2={x1} y1={Y(t)} y2={Y(t)} stroke="#26365a" /><text x="0" y={Y(t) + 4} fill="#6b7d9c" fontSize="12">{kEur(t)}</text></g>)}
        {[1, 8, 15, 22, n].map(d => <text key={d} x={X(d - 1, n)} y="222" fill="#6b7d9c" fontSize="12" textAnchor="middle">{d}.</text>)}
        <line x1={x0} y1={y0} x2={x1} y2={Y(team.ziel_monat)} stroke="#9fb0cc" strokeWidth="2" opacity=".45" />
        {/* Vormonat auf dieselbe Breite gestreckt (Monatsanfang bis Monatsende) */}
        {vor.length > 1 && <polyline points={pts(vor, nv)} fill="none" stroke="#9fb0cc" strokeWidth="3" strokeDasharray="3 7" strokeLinecap="round" />}
        {akt.length > 0 && <>
          <path d={`M${X(0, n)},${y0} L${pts(akt, n).replace(/ /g, ' L')} L${X(last, n)},${y0} Z`} fill="url(#lbga)" />
          <polyline points={pts(akt, n)} fill="none" stroke="#22c55e" strokeWidth="4" />
          <circle cx={X(last, n)} cy={Y(akt[last])} r="7" fill="#22c55e" stroke="#0b1220" strokeWidth="3" />
          <text x={Math.min(X(last, n) + 12, W - 110)} y={Y(akt[last]) - 8} fill="#f4f7fb" fontSize="15" fontWeight="700">{kEur(akt[last])} heute</text>
        </>}
      </svg>
    </div>
  );
}

function Tagesziele({ liste, pers, token }) {
  const zelle = (k, fmt) => {
    if (!k || k.ziel_tag == null) return <td className="c eq">–</td>;
    const q = k.ziel_tag > 0 ? k.ist_tag / k.ziel_tag * 100 : null;
    return <td><div className="cell2"><small>{fmt(k.ist_tag)} / {fmt(k.ziel_tag)}</small><div className="mini"><i style={{ width: `${Math.min(100, q || 0)}%`, background: farbe(q) }} /></div></div></td>;
  };
  const summe = (key) => liste.reduce((a, p) => { const k = p.kennzahlen[key]; if (k?.ziel_tag != null) { a.ist += k.ist_tag; a.ziel += k.ziel_tag; } return a; }, { ist: 0, ziel: 0 });
  const sS = summe('settings'), sC = summe('sales_calls'), sA = summe('ae');
  return (
    <div className="tile">
      <div className="th"><div><div className="tt">Tagesziele</div><div className="ts">Heute · sortiert nach Zielerreichung (der Vergleich über Rollen)</div></div></div>
      {liste.length === 0 ? <div className="leer">Noch keine Tagesziele hinterlegt. Einrichten unter „Live-Board“ im Menü.</div> : (
        <table>
          <thead><tr><th style={{ width: 34 }}>#</th><th>Name</th><th>Settings</th><th>Sales Calls</th><th>AE</th><th className="r">Ziel</th><th className="r">Monat</th></tr></thead>
          <tbody>
            {liste.slice(0, 9).map((p, i) => (
              <tr key={p.employee_id}>
                <td className="c num">{i + 1}</td>
                <td><div className="who"><Avatar p={pers(p.employee_id)} size={32} token={token} />{pers(p.employee_id)?.vorname}</div></td>
                {zelle(p.kennzahlen.settings, (v) => Math.round(v))}
                {zelle(p.kennzahlen.sales_calls, (v) => Math.round(v))}
                {zelle(p.kennzahlen.ae, kEur)}
                <td className="r num" style={{ color: farbe(p.erreichung_tag) }}>{pct(p.erreichung_tag)}</td>
                <td className="r"><span className={`chip ${chipKl(p.pacing_monat)}`}>{pct(p.pacing_monat)}</span></td>
              </tr>
            ))}
            <tr className="tot"><td /><td>Summe</td><td>{sS.ziel ? `${sS.ist} / ${sS.ziel}` : ''}</td><td>{sC.ziel ? `${sC.ist} / ${sC.ziel}` : ''}</td><td>{sA.ziel ? `${kEur(sA.ist)} / ${kEur(sA.ziel)}` : ''}</td><td /><td /></tr>
          </tbody>
        </table>
      )}
      <div className="note">„Monat“ = Ist ÷ Soll-Stand heute (Monatsziel × Arbeitstag ÷ Arbeitstage). „–“ = kein Ziel in dieser Kennzahl.</div>
    </div>
  );
}

function Ticker({ liste, pers, token }) {
  const summe = liste.reduce((s, d) => s + d.ae_eur, 0);
  return (
    <div className="ticker">
      <div className="tlab">Heute gewonnen<small>{liste.length} {liste.length === 1 ? 'Deal' : 'Deals'} · {eur(summe)}</small></div>
      {liste.length === 0 && <div className="tleer">Noch kein Gewinn heute — wer macht den ersten?</div>}
      {liste.slice(0, 4).map(d => (
        <div key={d.id} className="win"><Avatar p={pers(d.closer_id)} size={44} token={token} />
          <div><div className="k">{d.kunde}</div><div className="s">{[
            d.closer_id && `Closer ${pers(d.closer_id)?.vorname}`, d.setter_id && `Setter ${pers(d.setter_id)?.vorname}`, d.opener_id && `Opener ${pers(d.opener_id)?.vorname}`,
          ].filter(Boolean).join(' · ')}</div></div><span className="a">{eur(d.ae_eur)}</span></div>
      ))}
      {liste.length > 4 && <div className="tleer">+{liste.length - 4} weitere</div>}
    </div>
  );
}

function TopOffen({ top, pers, token }) {
  const alter = (t) => t >= 21 ? { background: 'rgba(239,68,68,.2)', color: '#f87171' } : t >= 14 ? { background: 'rgba(245,158,11,.2)', color: '#fbbf24' } : { background: 'rgba(255,255,255,.08)', color: 'var(--tx2)' };
  return (
    <div className="tile">
      <div className="th"><div><div className="tt">Top 10 offene Angebote</div><div className="ts">Sales Calls der letzten 30 Tage mit Angebot, noch ohne Gewonnen/Verloren</div></div>
        <div className="chips"><span className="chip">{top.gesamt_n} offen · {eur(top.gesamt_wert)}</span></div></div>
      {top.zeilen.length === 0 ? <div className="leer">Keine offenen Angebote aus den letzten 30 Tagen.</div> : (
        <table className="tight">
          <thead><tr><th style={{ width: 34 }}>#</th><th>Kunde</th><th className="r">Angebot</th><th>Closer</th><th>Setter</th><th className="r">Alter</th></tr></thead>
          <tbody>{top.zeilen.map((d, i) => (
            <tr key={d.id}><td className="c num">{i + 1}</td><td className="kunde">{d.kunde}</td><td className="r num">{eur(d.angebotswert_eur)}</td>
              <td><div className="who"><Avatar p={pers(d.closer_id)} size={28} token={token} />{pers(d.closer_id)?.vorname || '–'}</div></td>
              <td>{pers(d.setter_id)?.vorname || '–'}</td>
              <td className="r"><span className="age" style={alter(d.alter_tage)}>{d.alter_tage} T</span></td></tr>
          ))}</tbody>
        </table>
      )}
      <div className="note">Alter = Tage seit dem Sales Call · ab 14 Tagen gelb, ab 21 rot.</div>
    </div>
  );
}

function HeuteGelegt({ rollen, pers, token, team }) {
  const m = new Map();
  for (const r of rollen.heute.opener) m.set(r.employee_id, { id: r.employee_id, s: r.gelegt, c: 0 });
  for (const r of rollen.heute.setter) { const e = m.get(r.employee_id) || { id: r.employee_id, s: 0, c: 0 }; e.c = r.gelegt; m.set(r.employee_id, e); }
  const liste = [...m.values()].sort((a, b) => (b.s + b.c) - (a.s + a.c));
  return (
    <div className="tile">
      <div className="th"><div><div className="tt">Heute gelegt</div><div className="ts">Settings und Sales Calls je Person · aus Close, jede Minute</div></div>
        <div className="chips"><span className="chip">{team.settings_heute} Settings · {team.sales_calls_heute} Sales Calls</span></div></div>
      {liste.length === 0 ? <div className="leer">Heute noch nichts gelegt.</div> : (
        <table className="tight">
          <thead><tr><th>Name</th><th className="r">Settings</th><th className="r">Sales Calls</th></tr></thead>
          <tbody>{liste.slice(0, 9).map(e => (
            <tr key={e.id}><td><div className="who"><Avatar p={pers(e.id)} size={28} token={token} />{pers(e.id)?.vorname}</div></td>
              <td className="r num">{e.s || '–'}</td><td className="r num">{e.c || '–'}</td></tr>
          ))}</tbody>
        </table>
      )}
      <div className="note">„Heute: Sales Calls mit Uhrzeit“ folgt in Stufe 2, sobald die Closer ihren Kalender mit Close verbinden.</div>
    </div>
  );
}

const ZEITEN = [{ key: 'heute', t: 'Heute' }, { key: 'woche', t: 'Woche' }, { key: 'monat', t: 'Monat' }];
function RollenDuelle({ d, pers, token }) {
  const [zi, setZi] = useState(0);
  useEffect(() => { const t = setInterval(() => setZi(x => (x + 1) % ZEITEN.length), ZEIT_MS); return () => clearInterval(t); }, []);
  const z = ZEITEN[zi].key;
  const r = d.rollen[z];
  const closerRate = useMemo(() => {
    const s = rollenStats(d.calls_monat, 'closer', (x) => Number(x.ae_wert_eur) || 0);
    return Object.fromEntries(s.map(e => [e.id, e.nenner >= d.min_basis ? e.rateKlassisch : null]));
  }, [d.calls_monat, d.min_basis]);
  const hot = new Set(d.closer_hot || []);
  const sr = (s) => (s && s.belastbar ? `${Math.round(s.rate)} %` : '–');
  const Who = ({ id, extra }) => <div className="who"><Avatar p={pers(id)} size={28} token={token} />{pers(id)?.vorname}{extra}</div>;
  return (
    <div className="tile" style={{ gridColumn: '1 / span 2' }}>
      <div className="th"><div><div className="tt">Rollen-Duelle</div><div className="ts">Nur innerhalb einer Rolle gerankt · Quoten im Monat, erst ab {d.min_basis} Terminen bzw. Angeboten und mit gepflegten Ausgängen</div></div>
        <div className="chips">{ZEITEN.map((x, k) => <span key={x.key} className={`chip ${k === zi ? 'on' : ''}`}>{x.t}</span>)}
          {d.offene_ausgaenge > 0 && <span className="chip y">Ausgänge nachtragen: {d.offene_ausgaenge} offen</span>}</div></div>
      <div className="duelle">
        <div><div className="dh">OPENER · Settings gelegt</div>
          <table><thead><tr><th>#</th><th>Name</th><th className="r">{ZEITEN[zi].t}</th><th className="r">Show-Rate</th><th className="r">AE Kette</th></tr></thead>
            <tbody>{r.opener.slice(0, 6).map((e, i) => <tr key={e.employee_id}><td className="c num">{i + 1}</td><td><Who id={e.employee_id} /></td><td className="r num">{e.gelegt}</td><td className="r">{sr(e.showrate)}</td><td className="r">{e.ae_kette ? kEur(e.ae_kette) : '–'}</td></tr>)}
              {r.opener.length === 0 && <tr><td colSpan="5" className="eq">Noch keine Settings.</td></tr>}</tbody></table></div>
        <div><div className="dh">SETTER · Sales Calls gelegt</div>
          <table><thead><tr><th>#</th><th>Name</th><th className="r">{ZEITEN[zi].t}</th><th className="r">Show-Rate</th><th className="r">AE Kette</th></tr></thead>
            <tbody>{r.setter.slice(0, 6).map((e, i) => <tr key={e.employee_id}><td className="c num">{i + 1}</td><td><Who id={e.employee_id} /></td><td className="r num">{e.gelegt}</td><td className="r">{sr(e.showrate)}</td><td className="r">{e.ae_kette ? kEur(e.ae_kette) : '–'}</td></tr>)}
              {r.setter.length === 0 && <tr><td colSpan="5" className="eq">Noch keine Sales Calls.</td></tr>}</tbody></table></div>
        <div><div className="dh">CLOSER · AE gewonnen</div>
          <table><thead><tr><th>#</th><th>Name</th><th className="r">{ZEITEN[zi].t}</th><th className="r">Closing-Rate</th><th className="r">Letzter Gewinn</th></tr></thead>
            <tbody>{r.closer.slice(0, 6).map((e, i) => <tr key={e.employee_id}><td className="c num">{i + 1}</td>
              <td><Who id={e.employee_id} extra={hot.has(e.employee_id) ? <span className="chip y sm" title="Die letzten drei entschiedenen Calls gewonnen">🔥</span> : null} /></td>
              <td className="r num">{kEur(e.ae)}</td><td className="r">{pct(closerRate[e.employee_id])}</td><td className="r">{seitText(d.letzter_gewinn?.[e.employee_id], d.stand.stichtag)}</td></tr>)}
              {r.closer.length === 0 && <tr><td colSpan="5" className="eq">Noch kein Gewinn.</td></tr>}</tbody></table></div>
      </div>
    </div>
  );
}

function Kopf({ d, seite, alter, fehler }) {
  const closeAlter = d.close?.am ? Math.round((Date.now() - Date.parse(d.close.am)) / 60000) : null;
  return (
    <div className="top">
      <div className="logo">HiOffice <span>Live</span></div>
      <div className="pill">Neukunden · <b>Bonn</b></div>
      <div className="pill">{datumLang(d.stand.stichtag)} · Arbeitstag {d.stand.arbeitstag} von {d.stand.arbeitstage_monat}</div>
      <div className="sp" />
      <div className="pager"><i className={seite === 0 ? 'on' : ''} /><i className={seite === 1 ? 'on' : ''} /></div>
      <div className="live"><span className="dot" style={fehler ? { background: 'var(--warn)', boxShadow: '0 0 0 4px rgba(245,158,11,.2)' } : null} />
        {fehler ? 'Verbindung unterbrochen · zeige letzten Stand' : alter < 15 ? 'Aktualisiert gerade eben' : `Aktualisiert vor ${alter} s`}
        {closeAlter != null && <span className="cls"> · Close vor {closeAlter < 1 ? '<1' : closeAlter} Min</span>}</div>
    </div>
  );
}

// ── Seite ──────────────────────────────────────────────────────────────────────────────────────
export default function Board() {
  const [auth] = useState(leseToken);
  const [d, setD] = useState(null);
  const [fehler, setFehler] = useState(null);       // { status, text }
  const [letzterOk, setLetzterOk] = useState(0);
  const [jetzt, setJetzt] = useState(Date.now());
  // ?seite=2 startet auf Seite B (zum Einrichten/Pruefen); danach wechselt es wie immer.
  const [seite, setSeite] = useState(() => (new URLSearchParams(window.location.search).get('seite') === '2' ? 1 : 0));
  const [toasts, setToasts] = useState([]);
  const [scale, setScale] = useState(1);
  const gesehen = useRef(null);                     // Set der Gewinn-IDs (null = erster Abruf)
  const canvas = useRef(null);

  const stichtag = new URLSearchParams(window.location.search).get('stichtag');

  const laden = useCallback(async () => {
    if (!auth) return;
    try {
      const r = await axios.get('/api/board', { params: stichtag ? { stichtag } : {}, headers: { Authorization: `Bearer ${auth.token}` }, timeout: 25000 });
      const neu = r.data;
      // Gewinn-Erkennung: neue IDs in "Heute gewonnen" seit dem letzten Abruf. Beim ersten Abruf
      // wird nur gemerkt, nicht gefeiert (sonst feiert jeder Neustart des Bildschirms alles neu).
      const ids = new Set(neu.gewonnen_heute.map(x => x.id));
      if (gesehen.current) {
        const frisch = neu.gewonnen_heute.filter(x => !gesehen.current.has(x.id));
        if (frisch.length) {
          const pm = new Map(neu.personen.map(p => [p.id, p]));
          setToasts(ts => [...ts, ...frisch.map(x => ({ ...x, closer: pm.get(x.closer_id), setter: pm.get(x.setter_id), opener: pm.get(x.opener_id), t0: Date.now() }))]);
          if (!reducedMotion() && canvas.current) fireConfetti(canvas.current);
        }
      }
      gesehen.current = ids;
      setD(neu); setFehler(null); setLetzterOk(Date.now());
    } catch (e) {
      const st = e.response?.status;
      setFehler({ status: st || 0, text: e.response?.data?.error || e.message });
      if (st === 401 || st === 403) {
        try { if (auth.art === 'display') localStorage.removeItem(BOARD_KEY); } catch { /* egal */ }
      }
    }
  }, [auth, stichtag]);

  useEffect(() => { laden(); const t = setInterval(laden, POLL_MS); return () => clearInterval(t); }, [laden]);
  useEffect(() => { const t = setInterval(() => setJetzt(Date.now()), 5000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setSeite(s => 1 - s), SEITE_MS); return () => clearInterval(t); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') setSeite(s => 1 - s); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // Toasts nach 15 s entfernen, immer nur einen zeigen (Warteschlange).
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts(ts => ts.slice(1)), TOAST_MS);
    return () => clearTimeout(t);
  }, [toasts]);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => { document.title = 'Live-Board · NK Bonn'; }, []);

  const pm = useMemo(() => new Map((d?.personen || []).map(p => [p.id, p])), [d]);
  const pers = (id) => pm.get(Number(id));

  const gesperrt = !auth || (fehler && (fehler.status === 401 || fehler.status === 403));
  return (
    <div className="lb-root">
      <style>{CSS}</style>
      <canvas ref={canvas} className="lb-conf" aria-hidden="true" />
      {gesperrt ? (
        <div className="lb-msg"><div className="logo">HiOffice <span>Live</span></div>
          <p>{!auth ? 'Keine Display-Sitzung. Bitte über „Live-Board → Jetzt Dashboard öffnen“ starten.' : fehler.text}</p></div>
      ) : !d ? (
        <div className="lb-msg"><div className="logo">HiOffice <span>Live</span></div><p>{fehler ? `Lädt nicht: ${fehler.text}` : 'Lädt …'}</p></div>
      ) : (
        <div className="lb-stage" style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
          {seite === 0 ? (
            <section className="page">
              <Kopf d={d} seite={seite} alter={Math.round((jetzt - letzterOk) / 1000)} fehler={fehler} />
              <div className="grid" style={{ gridTemplateColumns: '560px 1fr 640px' }}>
                <Rainmakers prov={d.provision} pers={pers} token={auth.token} />
                <div className="mitte">
                  <Thermometer team={d.team} />
                  <div className="tile">
                    <div className="th"><div><div className="tt">Team heute</div><div className="ts">Heute · Teamziele aus den KPI-Vorgaben</div></div></div>
                    <div className="gauges">
                      <Gauge ist={d.team.settings_heute} soll={d.team.tagesziel_settings} label="Settings gelegt" unter={`von ${d.team.tagesziel_settings}`} />
                      <Gauge ist={d.team.sales_calls_heute} soll={d.team.tagesziel_sales_calls} label="Sales Calls gelegt" unter={`von ${d.team.tagesziel_sales_calls}`} />
                      <Gauge ist={d.team.ae_heute} soll={d.team.ae_soll_tag || 0} label="AE gewonnen" unter={`Soll/Tag ${kEur(d.team.ae_soll_tag)}`} fmt={kEur} />
                    </div>
                  </div>
                  <Verlauf team={d.team} stand={d.stand} />
                </div>
                <Tagesziele liste={d.tagesziele} pers={pers} token={auth.token} />
              </div>
              <Ticker liste={d.gewonnen_heute} pers={pers} token={auth.token} />
            </section>
          ) : (
            <section className="page">
              <Kopf d={d} seite={seite} alter={Math.round((jetzt - letzterOk) / 1000)} fehler={fehler} />
              <div className="grid" style={{ gridTemplateColumns: '1.25fr 1fr', gridTemplateRows: '1.45fr 1fr' }}>
                <TopOffen top={d.top_offen} pers={pers} token={auth.token} />
                <HeuteGelegt rollen={d.rollen} pers={pers} token={auth.token} team={d.team} />
                <RollenDuelle d={d} pers={pers} token={auth.token} />
              </div>
            </section>
          )}
          {toasts[0] && (
            <div className="toast" key={toasts[0].id}>
              <Avatar p={toasts[0].closer} size={72} token={auth.token} ring="var(--ok)" />
              <div><div className="t1">🎉 Gerade gewonnen</div>
                <div className="t2">{toasts[0].closer?.vorname || 'Team'} · {eur(toasts[0].ae_eur)}</div>
                <div className="t3">{[toasts[0].kunde, toasts[0].setter && `Setter ${toasts[0].setter.vorname}`, toasts[0].opener && `Opener ${toasts[0].opener.vorname}`].filter(Boolean).join(' · ')}</div></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const CSS = `
.lb-root{--bg:#0b1220;--bg2:#111a2e;--tile:#16213a;--tile2:#1b2846;--line:#26365a;--tx:#f4f7fb;--tx2:#9fb0cc;--tx3:#6b7d9c;
--ok:#22c55e;--warn:#f59e0b;--bad:#ef4444;--gold:#f5c542;--silver:#cfd6e1;--bronze:#d08a4c;
position:fixed;inset:0;overflow:hidden;background:linear-gradient(160deg,var(--bg) 0%,var(--bg2) 100%);color:var(--tx);
font-family:"Inter","SF Pro Display",-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums;cursor:none}
.lb-root *{box-sizing:border-box}
.lb-conf{position:fixed;inset:0;pointer-events:none;z-index:50;width:100vw;height:100vh}
.lb-stage{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:center center}
.lb-msg{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font-size:24px;color:var(--tx2);cursor:default}
.lb-root .page{width:1920px;height:1080px;padding:22px 26px;display:flex;flex-direction:column;gap:16px}
.lb-root .top{display:flex;align-items:center;gap:18px;height:52px}
.lb-root .logo{font-weight:800;font-size:26px;letter-spacing:.3px}.lb-root .logo span{color:var(--ok)}
.lb-root .pill{background:var(--tile);border:1px solid var(--line);border-radius:999px;padding:7px 14px;font-size:15px;color:var(--tx2)}
.lb-root .pill b{color:var(--tx)}.lb-root .sp{flex:1}
.lb-root .live{display:flex;align-items:center;gap:8px;color:var(--tx3);font-size:15px}.lb-root .cls{color:var(--tx3)}
.lb-root .dot{width:10px;height:10px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px rgba(34,197,94,.18)}
.lb-root .pager{display:flex;gap:6px}.lb-root .pager i{width:28px;height:6px;border-radius:3px;background:var(--line)}.lb-root .pager i.on{background:var(--tx2)}
.lb-root .grid{flex:1;display:grid;gap:16px;min-height:0}
.lb-root .mitte{display:grid;grid-template-rows:auto auto 1fr;gap:16px;min-height:0}
.lb-root .tile{background:var(--tile);border:1px solid var(--line);border-radius:18px;padding:18px 20px;display:flex;flex-direction:column;min-height:0;position:relative;overflow:hidden}
.lb-root .th{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
.lb-root .tt{font-size:19px;font-weight:700}.lb-root .ts{font-size:14px;color:var(--tx3)}
.lb-root .chips{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.lb-root .chip{font-size:12.5px;padding:4px 10px;border-radius:999px;background:var(--tile2);color:var(--tx2);border:1px solid var(--line);white-space:nowrap;font-weight:500}
.lb-root .chip.sm{font-size:11px;padding:2px 8px;margin-left:8px;vertical-align:middle}
.lb-root .chip.on{background:#e8eefb;color:#0b1220;border-color:#e8eefb;font-weight:700}
.lb-root .chip.dark{background:rgba(0,0,0,.22);color:#fff;border-color:transparent}
.lb-root .chip.g{background:rgba(34,197,94,.16);color:#4ade80;border-color:rgba(34,197,94,.35)}
.lb-root .chip.y{background:rgba(245,158,11,.16);color:#fbbf24;border-color:rgba(245,158,11,.35)}
.lb-root .chip.r{background:rgba(239,68,68,.16);color:#f87171;border-color:rgba(239,68,68,.35)}
.lb-av{border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex:none;object-fit:cover;
background:linear-gradient(135deg,hsl(var(--h,200),55%,52%),hsl(calc(var(--h,200) + 40),60%,38%))}
.lb-root .up{color:var(--ok);font-weight:700}.lb-root .dn{color:var(--bad);font-weight:700}.lb-root .eq{color:var(--tx3)}
.lb-root .num{font-weight:800;letter-spacing:-.3px}
.lb-root .leer{flex:1;display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:18px;text-align:center;padding:20px}
.lb-root .podium{display:grid;grid-template-columns:1fr 1.15fr 1fr;align-items:end;gap:10px;margin:6px 0 14px}
.lb-root .pod{display:flex;flex-direction:column;align-items:center;text-align:center}
.lb-root .ring{border-radius:50%;padding:5px;position:relative;display:inline-flex}
.lb-root .ring .rk{position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:30px;height:30px;border-radius:50%;font-weight:800;font-size:16px;
display:flex;align-items:center;justify-content:center;color:#0b1220;border:3px solid var(--tile)}
.lb-root .pod .nm{margin-top:16px;font-size:19px;font-weight:700}.lb-root .pod .amt{font-size:30px;font-weight:800;margin-top:2px}.lb-root .pod .dl{font-size:14px;min-height:18px}
.lb-root .block{background:var(--tile2);border-radius:12px 12px 0 0;width:100%;margin-top:10px}
.lb-root .rl{display:flex;flex-direction:column;gap:4px}
.lb-root .rr{display:grid;grid-template-columns:34px 40px 1fr auto 60px;align-items:center;gap:10px;padding:7px 10px;border-radius:10px;font-size:17px}
.lb-root .rr:nth-child(odd){background:rgba(255,255,255,.03)}
.lb-root .rr .p{color:var(--tx3);font-weight:700;text-align:center}.lb-root .rr .n{font-weight:600}.lb-root .rr .v{font-weight:800;text-align:right}.lb-root .d{text-align:right;font-size:14px}
.lb-root .note{font-size:12.5px;color:var(--tx3);margin-top:auto;padding-top:10px;line-height:1.45}
.lb-root .hero{border-color:rgba(255,255,255,.25)}.lb-root .hero .ts,.lb-root .hero .tt{color:#f0fff4}
.lb-root .big{font-size:96px;font-weight:900;letter-spacing:-3px;line-height:1}.lb-root .bigp{font-size:28px;font-weight:800;opacity:.9}
.lb-root .bar{height:16px;border-radius:8px;background:rgba(0,0,0,.25);position:relative;margin-top:16px}
.lb-root .bar>i{position:absolute;left:0;top:0;bottom:0;border-radius:8px;background:#fff;transition:width .8s}
.lb-root .mk{position:absolute;top:-8px;bottom:-8px;width:3px;background:#0b1220}
.lb-root .mk span{position:absolute;top:30px;transform:translateX(-50%);font-size:13px;white-space:nowrap;color:#f0fff4;font-weight:600}
.lb-root .mk.gate{background:#fde68a}.lb-root .mk.gate span{color:#fde68a}
.lb-root .gauges{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.lb-root .lb-g{display:flex;flex-direction:column;align-items:center}.lb-root .lb-g .lab{font-size:15px;color:var(--tx2);margin-top:-4px}
.lb-root table{width:100%;border-collapse:separate;border-spacing:0 4px;font-size:17px}
.lb-root th{font-size:12.5px;font-weight:600;color:var(--tx3);text-align:left;padding:0 8px 4px;text-transform:uppercase;letter-spacing:.6px}
.lb-root td{padding:8px 8px;background:rgba(255,255,255,.025);white-space:nowrap}
.lb-root .tight td{padding:5px 8px}
.lb-root td.kunde{max-width:380px;overflow:hidden;text-overflow:ellipsis}
.lb-root tr td:first-child{border-radius:10px 0 0 10px}.lb-root tr td:last-child{border-radius:0 10px 10px 0}
.lb-root tbody tr:nth-child(even) td{background:rgba(255,255,255,.05)}
.lb-root .r{text-align:right}.lb-root .c{text-align:center}
.lb-root .who{display:flex;align-items:center;gap:9px;font-weight:600}
.lb-root .mini{height:8px;border-radius:4px;background:var(--line);position:relative;width:100%;min-width:56px}
.lb-root .mini>i{position:absolute;left:0;top:0;bottom:0;border-radius:4px}
.lb-root .cell2{display:flex;flex-direction:column;gap:4px}.lb-root .cell2 small{font-size:13px;color:var(--tx2)}
.lb-root .tot td{background:transparent!important;border-top:1px solid var(--line);font-weight:800;color:var(--tx2)}
.lb-root .ticker{height:92px;display:flex;align-items:center;gap:14px;background:var(--tile);border:1px solid var(--line);border-radius:18px;padding:0 20px;overflow:hidden;flex:none}
.lb-root .tlab{font-weight:800;font-size:18px;white-space:nowrap;display:flex;flex-direction:column}.lb-root .tlab small{font-size:13px;color:var(--tx3);font-weight:500}
.lb-root .tleer{color:var(--tx3);font-size:16px;white-space:nowrap}
.lb-root .win{display:flex;align-items:center;gap:12px;background:var(--tile2);border-radius:14px;padding:10px 16px;white-space:nowrap;border:1px solid var(--line);min-width:0}
.lb-root .win .k{font-weight:700;font-size:16px;max-width:260px;overflow:hidden;text-overflow:ellipsis}.lb-root .win .s{font-size:13.5px;color:var(--tx2)}.lb-root .win .a{font-weight:900;font-size:22px;color:#4ade80;margin-left:6px}
.lb-root .toast{position:absolute;right:26px;top:84px;width:560px;background:#0f1a30;border:2px solid var(--ok);border-radius:18px;padding:16px 18px;display:flex;gap:14px;align-items:center;
box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 0 6px rgba(34,197,94,.12);z-index:40;animation:lbIn .4s cubic-bezier(.16,1,.3,1)}
.lb-root .toast .t1{font-size:15px;color:var(--tx2)}.lb-root .toast .t2{font-size:24px;font-weight:800}.lb-root .toast .t3{font-size:15px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:420px}
@keyframes lbIn{from{transform:translateY(-20px);opacity:0}to{transform:none;opacity:1}}
.lb-root .age{font-weight:800;border-radius:8px;padding:3px 10px;font-size:15px}
.lb-root .duelle{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lb-root .dh{font-size:14px;font-weight:700;color:var(--tx2);margin-bottom:6px}
`;
