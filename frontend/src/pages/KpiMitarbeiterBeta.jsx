import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityLogsApi, inboundDailyApi, employeesApi, dealsApi } from '../utils/api';
import { currentMonat } from '../utils/format';

const TODAY = new Date().toISOString().slice(0, 10);
const TRACKED_ROLES = ['Opener', 'Setter', 'Multi', 'Multi BS', 'NKV-Closer', 'Closer-KAM'];
const IS_OPENER = r => ['Opener', 'Setter', 'Multi', 'Multi BS'].includes(r);
const IS_CLOSER = r => ['NKV-Closer', 'Multi', 'Multi BS', 'Closer-KAM'].includes(r);
const pct    = (n, d) => d > 0 ? `${(n / d * 100).toFixed(1)}%` : '—';
const pctNum = (n, d) => d > 0 ? +(n / d * 100).toFixed(1) : 0;
const sum    = (arr, key) => arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
const errMsg = mut => mut.error?.response?.data?.message || mut.error?.response?.data?.error || mut.error?.message || 'Fehler beim Speichern';

const fmtMonth = m => {
  if (!m) return '';
  const [y, mo] = m.split('-');
  return `${['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'][+mo-1]} ${y}`;
};

const convColor = v =>
  v === '—' ? 'text-gray-400'
  : parseFloat(v) >= 50 ? 'text-green-600 font-bold'
  : parseFloat(v) >= 25 ? 'text-amber-500 font-bold'
  : 'text-red-500 font-bold';

const trendIcon = (cur, prev) => {
  if (prev == null) return null;
  if (cur > prev) return <span className="text-green-500 text-[10px] ml-0.5">↑</span>;
  if (cur < prev) return <span className="text-red-400 text-[10px] ml-0.5">↓</span>;
  return null;
};

// ── Form constants ─────────────────────────────────────────────────────────────
const ZERO_FORM = {
  entscheider_erreicht: '', entscheider_terminiert: '',
  terminiert_cold_calls: '', terminiert_inbound: '',
  settings_geplant: '', settings_stattgefunden: '',
  setting_abgesagt: '', setting_verschoben: '', nicht_erreicht: '',
  settings_direkt: '', beratung_vereinbart_direkt: '', unqualifiziert_direkt: '', follow_up_direkt: '',
  unqualifiziert: '', follow_up: '', beratung_vereinbart: '',
  beratungen_geplant: '', beratungen_stattgefunden: '',
  beratungen_verschoben: '', beratungen_no_show: '',
  beratungen_direkter_close: '', beratungen_follow_up_cc2: '',
  beratungen_unqualifiziert: '', beratungen_kein_close: '',
  kommentar: '',
};
const INBOUND_ZERO = { inbound_mail: '', inbound_fax: '', inbound_ad: '', terminiert_mail: '', terminiert_fax: '', terminiert_ad: '', kommentar: '' };
const INPUT_CLS = 'w-16 text-right text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400';
const makeInp = (form, set) => (key, label) => (
  <div key={key} className="flex items-center justify-between gap-2">
    <label className="text-xs text-gray-600 flex-1">{label}</label>
    <input type="number" min="0" value={form[key]}
      onChange={e => set(key, e.target.value)} className={INPUT_CLS} />
  </div>
);

// ── Activity Modal ─────────────────────────────────────────────────────────────
function ActivityModal({ employee, datum, existing, companyId, onSave, onClose, isPending, isError, error }) {
  const rolle = employee.rolle;
  const [form, setForm] = useState(() => existing
    ? { ...ZERO_FORM, ...Object.fromEntries(Object.keys(ZERO_FORM).map(k => [k, existing[k] ?? ''])) }
    : { ...ZERO_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = makeInp(form, set);

  const handleSave = () => {
    const data = { employee_id: employee.id, company_id: companyId, datum, monat: datum.slice(0, 7) };
    Object.keys(ZERO_FORM).forEach(k => {
      data[k] = k === 'kommentar' ? (form[k] || null) : (Number(form[k]) || 0);
    });
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">{employee.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{datum} · {employee.rolle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {IS_OPENER(rolle) && (
            <section>
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2">📞 Entscheider &amp; Terminierung</h3>
              <div className="space-y-2 bg-indigo-50 rounded-lg p-3">
                {inp('entscheider_erreicht',   'Entscheider erreicht')}
                <div className="border-t border-indigo-100 pt-2 mt-1">
                  <p className="text-[10px] text-indigo-500 font-medium mb-1.5">Terminiert (→ geplantes Setting):</p>
                  {inp('entscheider_terminiert', 'Entscheider terminiert')}
                  {inp('terminiert_cold_calls',  '→ davon Cold Calls')}
                  {inp('terminiert_inbound',     '→ davon Inbound')}
                </div>
                <div className="border-t border-indigo-100 pt-2 mt-1">
                  <p className="text-[10px] text-indigo-500 font-medium mb-1.5">Direkt gesetzt (Setting sofort):</p>
                  {inp('settings_direkt',            'Direkte Settings')}
                  {inp('beratung_vereinbart_direkt', '→ Beratungsgespr. vereinbart')}
                  {inp('follow_up_direkt',           '→ Follow-Up')}
                  {inp('unqualifiziert_direkt',      '→ Unqualifiziert')}
                </div>
              </div>
            </section>
          )}
          {IS_OPENER(rolle) && (
            <section>
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2">📅 Settings (geplant / terminiert)</h3>
              <div className="space-y-2 bg-indigo-50 rounded-lg p-3">
                {inp('settings_geplant',       'Settings geplant')}
                {inp('settings_stattgefunden', 'Settings stattgefunden')}
                <div className="border-t border-indigo-100 pt-2 mt-1">
                  <p className="text-[10px] text-indigo-500 font-medium mb-1.5">Ergebnis (geplante Settings):</p>
                  {inp('unqualifiziert',      'Unqualifiziert')}
                  {inp('follow_up',           'Follow-Up')}
                  {inp('beratung_vereinbart', 'Beratungsgespr. vereinbart')}
                </div>
                <div className="border-t border-indigo-100 pt-2 mt-1">
                  <p className="text-[10px] text-indigo-500 font-medium mb-1.5">Nicht stattgefunden:</p>
                  {inp('setting_abgesagt',   'Setting abgesagt')}
                  {inp('setting_verschoben', 'Setting verschoben')}
                  {inp('nicht_erreicht',     'Nicht erreicht')}
                </div>
              </div>
            </section>
          )}
          {IS_CLOSER(rolle) && (
            <section>
              <h3 className="text-[11px] font-bold text-violet-700 uppercase tracking-wider mb-2">🤝 Beratungsgespräche</h3>
              <div className="space-y-2 bg-violet-50 rounded-lg p-3">
                {inp('beratungen_geplant',         'Beratungsgespräche geplant')}
                {inp('beratungen_stattgefunden',   'Beratungsgespräche stattgefunden')}
                {inp('beratungen_verschoben',      'Beratungsgespräche verschoben')}
                {inp('beratungen_no_show',         'No-Show')}
                {inp('beratungen_direkter_close',  'Direkter Close')}
                {inp('beratungen_follow_up_cc2',   'Follow-Up / Closing Call 2')}
                {inp('beratungen_unqualifiziert',  'Unqualifiziert')}
                {inp('beratungen_kein_close',      'Kein Close')}
              </div>
            </section>
          )}
          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kommentar</h3>
            <textarea value={form.kommentar} onChange={e => set('kommentar', e.target.value)}
              rows={2} placeholder="Optional…"
              className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none" />
          </section>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 flex items-center gap-2">
          {isError ? <p className="text-xs text-red-600 flex-1 min-w-0 truncate">{error}</p> : <div className="flex-1" />}
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Abbrechen</button>
          <button onClick={handleSave} disabled={isPending}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded font-medium">
            {isPending ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inbound Modal ──────────────────────────────────────────────────────────────
function InboundModal({ datum, existing, companyId, onSave, onClose, isPending, isError, error }) {
  const [form, setForm] = useState(() => existing
    ? { ...INBOUND_ZERO, ...Object.fromEntries(Object.keys(INBOUND_ZERO).map(k => [k, existing[k] ?? ''])) }
    : { ...INBOUND_ZERO });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = makeInp(form, set);

  const handleSave = () => {
    onSave({
      datum, monat: datum.slice(0, 7), company_id: companyId,
      inbound_mail:    Number(form.inbound_mail)    || 0,
      inbound_fax:     Number(form.inbound_fax)     || 0,
      inbound_ad:      Number(form.inbound_ad)      || 0,
      terminiert_mail: Number(form.terminiert_mail) || 0,
      terminiert_fax:  Number(form.terminiert_fax)  || 0,
      terminiert_ad:   Number(form.terminiert_ad)   || 0,
      kommentar:       form.kommentar || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Inbound erfassen</h2>
            <p className="text-xs text-gray-500 mt-0.5">{datum} · global</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <section>
            <h3 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-2">📬 Inbound nach Quelle</h3>
            <div className="bg-teal-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold text-teal-600 uppercase tracking-wide">
                <span className="flex-1">Quelle</span>
                <span className="w-16 text-center">Inbound</span>
                <span className="w-16 text-center">Terminiert</span>
              </div>
              {[['mail','Mail-Leads'],['fax','Fax-Leads'],['ad','Ad-Leads']].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-gray-600 flex-1">{label}</label>
                  <input type="number" min="0" value={form[`inbound_${key}`]}
                    onChange={e => set(`inbound_${key}`, e.target.value)} className={INPUT_CLS} />
                  <input type="number" min="0" value={form[`terminiert_${key}`]}
                    onChange={e => set(`terminiert_${key}`, e.target.value)} className={INPUT_CLS} />
                </div>
              ))}
              {(() => {
                const i = (Number(form.inbound_mail)||0)+(Number(form.inbound_fax)||0)+(Number(form.inbound_ad)||0);
                const t = (Number(form.terminiert_mail)||0)+(Number(form.terminiert_fax)||0)+(Number(form.terminiert_ad)||0);
                return (
                  <div className="flex items-center gap-2 border-t border-teal-200 pt-2 mt-1">
                    <span className="text-xs font-bold text-teal-700 flex-1">Gesamt</span>
                    <span className="w-16 text-right text-xs font-bold text-teal-700">{i}</span>
                    <span className="w-16 text-right text-xs font-bold text-teal-700">{t}</span>
                  </div>
                );
              })()}
            </div>
          </section>
          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kommentar</h3>
            <textarea value={form.kommentar} onChange={e => set('kommentar', e.target.value)}
              rows={2} placeholder="Optional…"
              className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none" />
          </section>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 flex items-center gap-2">
          {isError ? <p className="text-xs text-red-600 flex-1 min-w-0 truncate">{error}</p> : <div className="flex-1" />}
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Abbrechen</button>
          <button onClick={handleSave} disabled={isPending}
            className="px-4 py-1.5 text-sm bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white rounded font-medium">
            {isPending ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sollwerte ──────────────────────────────────────────────────────────────────
const SOLL = {
  lead_terminierung:  45,
  show_rate_setting:  80,
  durchstellung:      40,
  show_rate_closing:  80,
  closing_rate:       50,
};
const DAILY_GOAL_SETTINGS = 37;
const DAILY_GOAL_SC       = 12;
// Fixe Monatsziele (Vorgabe Vertriebsleitung) — gelten dauerhaft für jeden Monat,
// NICHT aus Arbeitstagen ableiten
const MONTH_GOAL_SETTINGS = 740;
const MONTH_GOAL_SC       = 276;
// Datum aus API (ISO-Timestamp oder YYYY-MM-DD) auf YYYY-MM-DD normalisieren
const dstr = d => String(d || '').slice(0, 10);

// ── UI-Bausteine ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, desc, color = 'indigo' }) {
  const cls = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    violet: 'bg-violet-50 border-violet-200 text-violet-800',
    teal:   'bg-teal-50   border-teal-200   text-teal-800',
    green:  'bg-green-50  border-green-200  text-green-800',
    blue:   'bg-blue-50   border-blue-200   text-blue-800',
    amber:  'bg-amber-50  border-amber-200  text-amber-800',
    red:    'bg-red-50    border-red-200    text-red-800',
  }[color] || 'bg-indigo-50 border-indigo-200 text-indigo-800';
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-black">{value}</div>
      {desc && <div className="text-[11px] opacity-60 mt-0.5">{desc}</div>}
    </div>
  );
}

function MetricCard({ label, value, sub, color = 'indigo' }) {
  const bg = {
    blue:   'bg-blue-600',   indigo: 'bg-indigo-600', violet: 'bg-violet-600',
    green:  'bg-green-600',  teal:   'bg-teal-600',   amber:  'bg-amber-500',
    slate:  'bg-slate-700',  red:    'bg-red-600',
  }[color] || 'bg-indigo-600';
  return (
    <div className={`rounded-xl p-4 ${bg} text-white shadow-sm`}>
      <div className="text-[11px] font-semibold opacity-75 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-black">{value}</div>
      {sub && <div className="text-[11px] opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

function RoleBadge({ rolle }) {
  const cls = IS_OPENER(rolle) && IS_CLOSER(rolle) ? 'bg-purple-100 text-purple-700'
    : IS_CLOSER(rolle) ? 'bg-violet-100 text-violet-700'
    : 'bg-blue-100 text-blue-700';
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cls}`}>{rolle}</span>;
}

function SollAbweichung({ kpis, nums = {}, label }) {
  const rows = [
    { key: 'lead_terminierung',  label: 'Lead-Terminierungsquote',         soll: SOLL.lead_terminierung,  ist: kpis.lead_terminierung,  nLabel: 'Terminiert', dLabel: 'Inbound gesamt' },
    { key: 'show_rate_setting',  label: 'Show-Rate Setting',               soll: SOLL.show_rate_setting,  ist: kpis.show_rate_setting,  nLabel: 'Stattgef.',  dLabel: 'Geplant' },
    { key: 'durchstellung',      label: 'Durchstellungsquote (Set→Close)',  soll: SOLL.durchstellung,      ist: kpis.durchstellung,      nLabel: 'Vereinbart', dLabel: 'Settings stattgef.' },
    { key: 'show_rate_closing',  label: 'Show-Rate Closing',               soll: SOLL.show_rate_closing,  ist: kpis.show_rate_closing,  nLabel: 'Stattgef.',  dLabel: 'Geplant' },
    { key: 'closing_rate',       label: 'Closing-Rate (NK)',               soll: SOLL.closing_rate,       ist: kpis.closing_rate,       nLabel: 'Gewonnen',   dLabel: 'Angebote gesamt' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-3 py-2.5 bg-[#1e293b] flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-wide">Soll-Abweichung — {label}</span>
        <span className="text-[10px] text-white/50">Zielwerte: Sollquoten Vertrieb</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <th className="px-3 py-2 text-left">KPI</th>
              <th className="px-3 py-2 text-right">Absolut</th>
              <th className="px-3 py-2 text-right">Ist</th>
              <th className="px-3 py-2 text-right">Soll</th>
              <th className="px-3 py-2 text-right">Abweichung</th>
              <th className="px-3 py-2 text-right w-32">Zielerreichung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(r => {
              const hasData = r.ist > 0 || r.soll > 0;
              const diff    = r.ist - r.soll;
              const ok      = diff >= 0;
              const pctBar  = r.soll > 0 ? Math.min(Math.round(r.ist / r.soll * 100), 100) : 0;
              const barCol  = pctBar >= 100 ? 'bg-green-500' : pctBar >= 75 ? 'bg-amber-400' : 'bg-red-500';
              const diffCol = ok ? 'text-green-600' : 'text-red-600';
              const raw = nums[r.key] || {};
              return (
                <tr key={r.key} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700 font-medium">{r.label}</td>
                  <td className="px-3 py-2 text-right">
                    {raw.d > 0 ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-semibold text-gray-800">{raw.n} / {raw.d}</span>
                        <span className="text-[10px] text-gray-400">{r.nLabel} / {r.dLabel}</span>
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${ok ? 'text-green-700' : 'text-red-600'}`}>
                    {hasData ? `${r.ist.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">{r.soll}%</td>
                  <td className={`px-3 py-2 text-right font-bold ${hasData ? diffCol : 'text-gray-400'}`}>
                    {hasData ? `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {hasData ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className={`${barCol} h-2 rounded-full`} style={{ width: `${pctBar}%` }} />
                        </div>
                        <span className={`text-[10px] font-bold w-7 text-right ${barCol.replace('bg-','text-').replace('-500','').replace('-400','')}-600`}>{pctBar}%</span>
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionBox({ header, headerColor = 'bg-indigo-700', children }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className={`px-3 py-2.5 ${headerColor} flex items-center justify-between`}>
        {header}
      </div>
      {children}
    </div>
  );
}

function SalesFunnel({ fEntscheider, fTerminiert, fSetGepl, fSetStattg, fBerVereinbart, fBerGepl, fBerStattg }) {
  const fmt = (a, b) => b > 0 ? Math.round(a / b * 100) + '%' : '—';
  const num = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;
  const tc  = v => v >= 80 ? 'text-green-400' : v >= 60 ? 'text-amber-400' : v > 0 ? 'text-red-400' : 'text-gray-400';

  const BigCard = ({ grad, label, value, sub }) => (
    <div className={`flex-1 ${grad} rounded-2xl p-6 text-white text-center shadow-lg`}>
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">{label}</div>
      <div className="text-6xl font-black leading-none tabular-nums">{value}</div>
      {sub && <div className="text-xs opacity-50 mt-2">{sub}</div>}
    </div>
  );

  const Arrow = ({ a, b, label }) => (
    <div className="shrink-0 flex flex-col items-center justify-center w-28 gap-1.5 px-2">
      <div className="text-[9px] text-gray-400 uppercase tracking-wide text-center leading-tight">{label}</div>
      <div className={`text-3xl font-black ${tc(num(a, b))}`}>{fmt(a, b)}</div>
      <svg width="36" height="14" viewBox="0 0 36 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="7" x2="28" y2="7" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 2L32 7L24 12" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  const PhaseLabel = ({ dot, label }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-1.5 h-5 rounded-full ${dot}`} />
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-5">

      {/* ── Opening ── */}
      <div>
        <PhaseLabel dot="bg-blue-500" label="Opening" />
        <div className="flex items-stretch gap-0">
          <BigCard grad="bg-gradient-to-br from-blue-500 to-blue-700"    label="Entscheider erreicht" value={fEntscheider} sub="Entscheider" />
          <Arrow a={fTerminiert}  b={fEntscheider} label="Terminierungsquote" />
          <BigCard grad="bg-gradient-to-br from-teal-500 to-teal-700"    label="Terminiert"           value={fTerminiert}  sub="Termine gelegt" />
        </div>
      </div>

      {/* ── Setting ── */}
      <div>
        <PhaseLabel dot="bg-violet-500" label="Setting" />
        <div className="flex items-stretch gap-0">
          <BigCard grad="bg-gradient-to-br from-violet-400 to-violet-600" label="Settings geplant"    value={fSetGepl}   sub="geplant" />
          <Arrow a={fSetStattg} b={fSetGepl}     label="Show-Rate Settings" />
          <BigCard grad="bg-gradient-to-br from-violet-600 to-violet-800" label="Settings stattgef."  value={fSetStattg} sub="stattgefunden" />
        </div>
      </div>

      {/* ── Durchstellungsquote ── */}
      <div className="flex items-center gap-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-6 py-4">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-1">Durchstellungsquote</div>
          <div className="text-sm text-indigo-400">
            <span className="font-bold text-indigo-700">{fBerVereinbart}</span> Beratungen vereinbart
            {' '}aus{' '}
            <span className="font-bold text-indigo-700">{fSetStattg}</span> stattgef. Settings
          </div>
        </div>
        <div className={`text-5xl font-black shrink-0 ${tc(num(fBerVereinbart, fSetStattg))}`}>
          {fmt(fBerVereinbart, fSetStattg)}
        </div>
      </div>

      {/* ── Closing ── */}
      <div>
        <PhaseLabel dot="bg-green-500" label="Closing" />
        <div className="flex items-stretch gap-0">
          <BigCard grad="bg-gradient-to-br from-green-400 to-green-600"  label="Beratungen geplant"   value={fBerGepl}    sub="geplant" />
          <Arrow a={fBerStattg} b={fBerGepl}    label="Show-Rate Beratungen" />
          <BigCard grad="bg-gradient-to-br from-green-600 to-green-800"  label="Beratungen stattgef." value={fBerStattg}  sub="stattgefunden" />
        </div>
      </div>

    </div>
  );
}

// ── Hauptkomponente ────────────────────────────────────────────────────────────
export default function KpiMitarbeiterBeta() {
  const { company } = useOutletContext();
  const qc = useQueryClient();

  // Tabs & view state
  const [tab,          setTab]          = useState('eingabe');
  const [auswertTab,   setAuswertTab]   = useState('dashboard');
  const [zeitbasis,    setZeitbasis]    = useState('monat');    // 'tag' | 'woche' | 'monat'
  const [vergleichEmps,setVergleichEmps] = useState(new Set()); // Set<number>

  // Datums / Monat
  const [datum, setDatum] = useState(TODAY);
  const [monat, setMonat] = useState(currentMonat());

  // Modals & Filter
  const [modal,          setModal]          = useState(null);
  const [inboundModal,   setInboundModal]   = useState(false);
  const [empFilter,      setEmpFilter]      = useState('');
  const [standortFilter, setStandortFilter] = useState('');
  const [showExport,     setShowExport]     = useState(false);

  const companyId = Number(company) || 1;

  const shiftDatum = delta => {
    const [y, m, d] = datum.split('-').map(Number);
    const date = new Date(y, m - 1, d + delta);
    setDatum(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);
  };

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn:  () => employeesApi.list(),
  });

  const logsByDay = useQuery({
    queryKey: ['activity-logs-day', datum, company],
    queryFn:  () => activityLogsApi.list({ datum, ...(company && { company_id: company }) }),
  });

  const logsByMonth = useQuery({
    queryKey: ['activity-logs-month', monat, company],
    queryFn:  () => activityLogsApi.list({ monat, ...(company && { company_id: company }) }),
    enabled:  tab === 'auswertung',
  });

  const inboundByDay = useQuery({
    queryKey: ['inbound-daily-day', datum, company],
    queryFn:  () => inboundDailyApi.list({ datum, ...(company && { company_id: company }) }),
  });

  const inboundByMonth = useQuery({
    queryKey: ['inbound-daily-month', monat, company],
    queryFn:  () => inboundDailyApi.list({ monat, ...(company && { company_id: company }) }),
    enabled:  tab === 'auswertung',
  });

  const nkDeals = useQuery({
    queryKey: ['deals-nk-beta', monat, company],
    queryFn:  () => dealsApi.nk.list({ monat, ...(company && { company_id: company }) }),
    enabled:  tab === 'auswertung',
  });

  // Trend: letzte 6 Monate
  const trendMonths = useMemo(() => {
    const months = [];
    const [y, m] = monat.split('-').map(Number);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    return months;
  }, [monat]);

  const trendLogResults = useQueries({
    queries: trendMonths.map(tm => ({
      queryKey: ['activity-logs-month', tm, company],
      queryFn:  () => activityLogsApi.list({ monat: tm, ...(company && { company_id: company }) }),
      enabled:  tab === 'auswertung' && auswertTab === 'trend',
    })),
  });

  const trendDealResults = useQueries({
    queries: trendMonths.map(tm => ({
      queryKey: ['deals-nk-beta', tm, company],
      queryFn:  () => dealsApi.nk.list({ monat: tm, ...(company && { company_id: company }) }),
      enabled:  tab === 'auswertung' && auswertTab === 'trend',
    })),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: activityLogsApi.upsert,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['activity-logs-day'] }); qc.invalidateQueries({ queryKey: ['activity-logs-month'] }); setModal(null); },
  });

  const saveInboundMut = useMutation({
    mutationFn: inboundDailyApi.upsert,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['inbound-daily-day'] }); qc.invalidateQueries({ queryKey: ['inbound-daily-month'] }); setInboundModal(false); },
  });

  // ── Computed ──────────────────────────────────────────────────────────────────
  const standorte = useMemo(() =>
    [...new Set(employees.filter(e => TRACKED_ROLES.includes(e.rolle) && e.show_in_kpi !== 0 && e.standort).map(e => e.standort))].sort()
  , [employees]);

  const tracked = useMemo(() =>
    employees
      .filter(e => TRACKED_ROLES.includes(e.rolle) && e.show_in_kpi !== 0)
      .filter(e => !empFilter || String(e.id) === empFilter)
      .filter(e => !standortFilter || e.standort === standortFilter)
      .sort((a, b) => a.name.localeCompare(b.name))
  , [employees, empFilter, standortFilter]);

  const dayMap = useMemo(() => {
    const m = {};
    (logsByDay.data || []).forEach(l => { m[l.employee_id] = l; });
    return m;
  }, [logsByDay.data]);

  const currentInbound = (inboundByDay.data || [])[0] || null;

  const monthLogs  = logsByMonth.data  || [];
  const monthDeals = nkDeals.data      || [];
  const inboundData = inboundByMonth.data || [];

  // Standort-gefilterte Monatslogs
  const auswertungLogs = useMemo(() => {
    if (!standortFilter) return monthLogs;
    const empSet = new Set(employees.filter(e => e.standort === standortFilter).map(e => e.id));
    return monthLogs.filter(l => empSet.has(l.employee_id));
  }, [monthLogs, employees, standortFilter]);

  // ISO-Wochennummer
  const getISOWeek = d => {
    const dt = new Date(d); dt.setHours(12, 0, 0, 0);
    dt.setDate(dt.getDate() + 4 - (dt.getDay() || 7));
    const y0 = new Date(dt.getFullYear(), 0, 1);
    return Math.ceil((((dt - y0) / 86400000) + 1) / 7);
  };

  // Montag–Sonntag der Woche die `datum` enthält
  const weekRange = useMemo(() => {
    if (!datum) return null;
    const d = new Date(datum + 'T12:00:00');
    const daysFromMon = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const mon = new Date(d); mon.setDate(d.getDate() - daysFromMon);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = dt => dt.toISOString().slice(0, 10);
    return { start: fmt(mon), end: fmt(sun), kw: getISOWeek(mon) };
  }, [datum]);

  // Aktive Logs je nach Zeitbasis
  const activeLogs = useMemo(() => {
    if (zeitbasis === 'tag') {
      let all = logsByDay.data || [];
      if (standortFilter) {
        const empSet = new Set(employees.filter(e => e.standort === standortFilter).map(e => e.id));
        all = all.filter(l => empSet.has(l.employee_id));
      }
      return all;
    }
    if (zeitbasis === 'woche' && weekRange) {
      let all = monthLogs;
      if (standortFilter) {
        const empSet = new Set(employees.filter(e => e.standort === standortFilter).map(e => e.id));
        all = all.filter(l => empSet.has(l.employee_id));
      }
      return all.filter(l => dstr(l.datum) >= weekRange.start && dstr(l.datum) <= weekRange.end);
    }
    return auswertungLogs;
  }, [zeitbasis, logsByDay.data, monthLogs, auswertungLogs, standortFilter, employees, weekRange]);

  // Per-Employee-Aggregation
  const perEmployee = useMemo(() => {
    const map = {};
    activeLogs.forEach(l => {
      if (!map[l.employee_id])
        map[l.employee_id] = { id: l.employee_id, name: l.employee_name, rolle: l.employee_rolle, logs: [] };
      map[l.employee_id].logs.push(l);
    });
    return Object.values(map).sort((a, b) => a.name?.localeCompare(b.name));
  }, [activeLogs]);

  // Inbound Wochenübersicht
  const inboundWeeks = useMemo(() => {
    const weeks = {};
    inboundData.forEach(l => {
      const d = new Date(l.datum);
      const key = `KW ${Math.ceil(d.getDate() / 7)}`;
      if (!weeks[key]) weeks[key] = { mail: 0, fax: 0, ad: 0, tmail: 0, tfax: 0, tad: 0 };
      weeks[key].mail  += Number(l.inbound_mail)    || 0;
      weeks[key].fax   += Number(l.inbound_fax)     || 0;
      weeks[key].ad    += Number(l.inbound_ad)      || 0;
      weeks[key].tmail += Number(l.terminiert_mail) || 0;
      weeks[key].tfax  += Number(l.terminiert_fax)  || 0;
      weeks[key].tad   += Number(l.terminiert_ad)   || 0;
    });
    return Object.entries(weeks).map(([week, v]) => {
      const total = v.mail + v.fax + v.ad;
      const term  = v.tmail + v.tfax + v.tad;
      return { week, ...v, total, terminiert: term, quote: total > 0 ? Math.round(term/total*100) : 0 };
    });
  }, [inboundData]);

  // Trend-Daten
  const trendData = useMemo(() => {
    return trendMonths.map((m, i) => {
      const logs  = trendLogResults[i]?.data  || [];
      const deals = trendDealResults[i]?.data || [];
      const loading = trendLogResults[i]?.isLoading || trendDealResults[i]?.isLoading;
      const filteredLogs = standortFilter
        ? (() => {
            const empSet = new Set(employees.filter(e => e.standort === standortFilter).map(e => e.id));
            return logs.filter(l => empSet.has(l.employee_id));
          })()
        : logs;
      return {
        monat: m, loading,
        entscheider:  sum(filteredLogs, 'entscheider_erreicht'),
        terminiert:   sum(filteredLogs, 'entscheider_terminiert'),
        setGeplant:   sum(filteredLogs, 'settings_geplant'),
        setStattg:    sum(filteredLogs, 'settings_stattgefunden'),
        berGeplant:   sum(filteredLogs, 'beratungen_geplant'),
        berStattg:    sum(filteredLogs, 'beratungen_stattgefunden'),
      };
    });
  }, [trendMonths, trendLogResults, trendDealResults, standortFilter, employees]);

  // Funnel-Daten (für Dashboard)
  const fEntscheider   = sum(activeLogs, 'entscheider_erreicht');
  const fTerminiert    = sum(activeLogs, 'entscheider_terminiert');
  const fSetGepl       = sum(activeLogs, 'settings_geplant');
  const fSettings      = sum(activeLogs, 'settings_stattgefunden');
  const fBerVereinbart = sum(activeLogs, 'beratung_vereinbart');
  const fBerGepl       = sum(activeLogs, 'beratungen_geplant');
  const fBeratungen    = sum(activeLogs, 'beratungen_stattgefunden');
  // Inbound-Leads (aus inbound_daily)
  const tiLeads      = sum(inboundData, 'inbound_mail') + sum(inboundData, 'inbound_fax') + sum(inboundData, 'inbound_ad');
  const tiTerminiert = sum(inboundData, 'terminiert_mail') + sum(inboundData, 'terminiert_fax') + sum(inboundData, 'terminiert_ad');

  // NK-Deals (standort-gefiltert wenn aktiv)
  const filteredDeals = useMemo(() => {
    if (!standortFilter) return monthDeals;
    return monthDeals.filter(d => d.closer_standort === standortFilter || d.setter_standort === standortFilter);
  }, [monthDeals, standortFilter]);
  const nkAngebote = filteredDeals.length;
  const nkGewonnen = filteredDeals.filter(d => d.status === 'Gewonnen').length;

  // Soll-Abweichungs-KPIs
  const sollKpis = {
    lead_terminierung: pctNum(tiTerminiert, tiLeads),
    show_rate_setting: pctNum(fSettings,    fSetGepl),
    durchstellung:     pctNum(fBerVereinbart, fSettings),
    show_rate_closing: pctNum(fBeratungen,  fBerGepl),
    closing_rate:      pctNum(nkGewonnen,   nkAngebote),
  };

  // Tages-Pace (immer aus today-Logs, unabhängig von zeitbasis)
  const todayLogs = useMemo(() => {
    let all = logsByDay.data || [];
    if (standortFilter) {
      const empSet = new Set(employees.filter(e => e.standort === standortFilter).map(e => e.id));
      all = all.filter(l => empSet.has(l.employee_id));
    }
    return all;
  }, [logsByDay.data, standortFilter, employees]);
  const todaySettings     = sum(todayLogs, 'settings_stattgefunden');
  const todaySettingsGepl = sum(todayLogs, 'settings_geplant');
  // "Gelegte" Settings = terminierte Entscheider (Opener-Eingabe "Entscheider terminiert")
  const todaySettingsGelegt = sum(todayLogs, 'entscheider_terminiert');
  const monthSettingsGelegt = sum(auswertungLogs, 'entscheider_terminiert');
  // "Gelegte" Sales Calls = vereinbarte Beratungsgespräche (geplant + direkt), Opener-Eingabe
  const todaySC           = sum(todayLogs, 'beratung_vereinbart') + sum(todayLogs, 'beratung_vereinbart_direkt');
  const todayBerVereinb   = sum(todayLogs, 'beratung_vereinbart');
  // Monatlich kumuliert (aus auswertungLogs = standort-gefiltert, immer Monat)
  const monthSC           = sum(auswertungLogs, 'beratung_vereinbart') + sum(auswertungLogs, 'beratung_vereinbart_direkt');
  const monthSettings     = sum(auswertungLogs, 'settings_stattgefunden');
  const monthSettingsGepl = sum(auswertungLogs, 'settings_geplant');
  const monthBerVereinb   = sum(auswertungLogs, 'beratung_vereinbart');
  // Beratungsgespräche (Closer-Seite) für Sales Show-Rate
  const todayBerGepl      = sum(todayLogs, 'beratungen_geplant');
  const todayBerStattg    = sum(todayLogs, 'beratungen_stattgefunden');
  const monthBerGepl      = sum(auswertungLogs, 'beratungen_geplant');
  const monthBerStattg    = sum(auswertungLogs, 'beratungen_stattgefunden');

  // ── Copy-Text (WhatsApp / Slack) ─────────────────────────────────────────────
  const buildCopyText = () => {
    const f1 = (n, d) => d > 0 ? `${(n / d * 100).toFixed(1)}%` : '—';
    const datumStr = new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
    // Arbeitstage im Monat (Mo–Fr), gesamt + bis einschließlich `datum` vergangen
    const [y, m] = monat.split('-').map(Number);
    let workdays = 0, elapsedWorkdays = 0;
    const daysInMonth = new Date(y, m, 0).getDate();
    const elapsedUntil = datum.startsWith(monat) ? Number(datum.slice(8, 10)) : daysInMonth;
    for (let d = 1; d <= daysInMonth; d++) {
      const wd = new Date(y, m - 1, d).getDay();
      if (wd !== 0 && wd !== 6) {
        workdays++;
        if (d <= elapsedUntil) elapsedWorkdays++;
      }
    }
    const paceGoalSC        = DAILY_GOAL_SC * elapsedWorkdays;
    const paceGoalSettings  = DAILY_GOAL_SETTINGS * elapsedWorkdays;
    // Monat kumuliert NUR bis einschließlich des gewählten Datums (nicht ganzer Monat)
    const mtd = auswertungLogs.filter(l => dstr(l.datum) <= datum);
    const mtdSC             = sum(mtd, 'beratung_vereinbart') + sum(mtd, 'beratung_vereinbart_direkt');
    const mtdSettingsGelegt = sum(mtd, 'entscheider_terminiert');
    const mtdSettings       = sum(mtd, 'settings_stattgefunden');
    const mtdSettingsGepl   = sum(mtd, 'settings_geplant');
    const mtdBerVereinb     = sum(mtd, 'beratung_vereinbart');
    const mtdBerGepl        = sum(mtd, 'beratungen_geplant');
    const mtdBerStattg      = sum(mtd, 'beratungen_stattgefunden');
    return [
      `📊 Sales KPIs — ${datumStr}${standortFilter ? ' · ' + standortFilter : ''}`,
      ``,
      `Daily Goal SC: ${DAILY_GOAL_SC}`,
      `Heute gelegt: ${todaySC}`,
      `Tagesziel: ${todaySC}/${DAILY_GOAL_SC}`,
      `Monatsziel: ${mtdSC}/${MONTH_GOAL_SC}`,
      `Pace (Soll bis heute): ${mtdSC}/${paceGoalSC}`,
      ``,
      `Daily Goal Setting: ${DAILY_GOAL_SETTINGS}`,
      `Heute gelegt: ${todaySettingsGelegt}`,
      `Tagesziel: ${todaySettingsGelegt}/${DAILY_GOAL_SETTINGS}`,
      `Monatsziel: ${mtdSettingsGelegt}/${MONTH_GOAL_SETTINGS}`,
      `Pace (Soll bis heute): ${mtdSettingsGelegt}/${paceGoalSettings}`,
      `Setting Show-Rate heute: ${f1(todaySettings, todaySettingsGepl)}`,
      `Setting Show-Rate ${fmtMonth(monat)} kumuliert: ${f1(mtdSettings, mtdSettingsGepl)}`,
      `Durchstellungsquote heute: ${f1(todayBerVereinb, todaySettings)}`,
      `Durchstellungsquote ${fmtMonth(monat)} kumuliert: ${f1(mtdBerVereinb, mtdSettings)}`,
      ``,
      `Beratungsgespräche geplant heute: ${todayBerGepl}`,
      `Beratungsgespräche stattgefunden heute: ${todayBerStattg}`,
      `Sales Show-Rate heute: ${f1(todayBerStattg, todayBerGepl)}`,
      `Sales Show-Rate ${fmtMonth(monat)} kumuliert: ${f1(mtdBerStattg, mtdBerGepl)}`,
    ].join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCopyText()).catch(() => {});
  };

  // ── CSV-Export ────────────────────────────────────────────────────────────────
  const exportCsv = (section) => {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const row = arr => arr.map(esc).join(';');
    const f1  = (n, d) => d > 0 ? (n / d * 100).toFixed(1) + '%' : '—';
    const lines = [];

    if (section === 'all' || section === 'soll') {
      lines.push(row(['KPI', 'Ist', 'Soll', 'Abweichung']));
      const sRows = [
        ['Lead-Terminierungsquote', sollKpis.lead_terminierung, SOLL.lead_terminierung],
        ['Show-Rate Setting',       sollKpis.show_rate_setting, SOLL.show_rate_setting],
        ['Durchstellungsquote',     sollKpis.durchstellung,     SOLL.durchstellung],
        ['Show-Rate Closing',       sollKpis.show_rate_closing, SOLL.show_rate_closing],
        ['Closing-Rate (NK)',       sollKpis.closing_rate,      SOLL.closing_rate],
      ];
      sRows.forEach(([l, ist, soll]) => lines.push(row([l, ist.toFixed(1)+'%', soll+'%', (ist-soll >= 0 ? '+' : '')+(ist-soll).toFixed(1)+'%'])));
      lines.push('');
    }
    if (section === 'all' || section === 'opening') {
      lines.push(row(['Mitarbeiter', 'Rolle', 'Standort', 'Entscheider erreicht', 'Terminiert', 'davon CC', 'davon Inbound', 'Term.Quote']));
      perEmployee.forEach(e => {
        const ls = e.logs;
        const er = sum(ls,'entscheider_erreicht'), te = sum(ls,'entscheider_terminiert');
        lines.push(row([e.name, e.rolle||'', ls[0]?.standort||'', er, te, sum(ls,'terminiert_cold_calls'), sum(ls,'terminiert_inbound'), f1(te,er)]));
      });
      lines.push('');
    }
    if (section === 'all' || section === 'setting') {
      lines.push(row(['Mitarbeiter', 'Rolle', 'Standort', 'Settings geplant', 'Settings stattgef.', 'Show-Rate', 'Beratung vereinbart', 'Durchstellungsquote']));
      perEmployee.forEach(e => {
        const ls = e.logs;
        const sg = sum(ls,'settings_geplant'), ss = sum(ls,'settings_stattgefunden'), bv = sum(ls,'beratung_vereinbart');
        lines.push(row([e.name, e.rolle||'', ls[0]?.standort||'', sg, ss, f1(ss,sg), bv, f1(bv,ss)]));
      });
      lines.push('');
    }
    if (section === 'all' || section === 'closing') {
      lines.push(row(['Mitarbeiter', 'Rolle', 'Standort', 'Beratungen geplant', 'Beratungen stattgef.', 'Show-Rate', 'Direkter Close', 'Follow-Up', 'Kein Close']));
      perEmployee.forEach(e => {
        const ls = e.logs;
        const bg = sum(ls,'beratungen_geplant'), bs = sum(ls,'beratungen_stattgefunden');
        lines.push(row([e.name, e.rolle||'', ls[0]?.standort||'', bg, bs, f1(bs,bg), sum(ls,'beratungen_direkter_close'), sum(ls,'beratungen_follow_up_cc2'), sum(ls,'beratungen_kein_close')]));
      });
    }

    const bom = '﻿';
    const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const label = standortFilter ? standortFilter : 'Gesamt';
    a.download = `KPI_${monat}_${label}_${section}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const activeLabel = useMemo(() => {
    if (zeitbasis === 'tag') {
      return new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (zeitbasis === 'woche' && weekRange) {
      const s = new Date(weekRange.start + 'T12:00:00');
      const e = new Date(weekRange.end + 'T12:00:00');
      const fmtD = d => d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
      return `KW ${weekRange.kw} · ${fmtD(s)} – ${fmtD(e)} ${e.getFullYear()}`;
    }
    return fmtMonth(monat);
  }, [zeitbasis, datum, monat, weekRange]);

  const sel = 'bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">KPI Mitarbeiter</h1>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">BETA</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Tägliches Sales-Tracking · Opener / Setter / Closer</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
            <button onClick={() => setTab('eingabe')}
              className={`px-3 py-1.5 font-medium transition-colors ${tab === 'eingabe' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Dateneingabe
            </button>
            <button onClick={() => setTab('auswertung')}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-300 ${tab === 'auswertung' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              KPI-Auswertung
            </button>
          </div>
          {/* Filter */}
          <select value={empFilter} onChange={e => setEmpFilter(e.target.value)} className={sel}>
            <option value="">Alle Mitarbeiter</option>
            {employees.filter(e => TRACKED_ROLES.includes(e.rolle) && e.show_in_kpi !== 0).map(e =>
              <option key={e.id} value={e.id}>{e.name}</option>
            )}
          </select>
          <select value={standortFilter} onChange={e => setStandortFilter(e.target.value)} className={sel}>
            <option value="">Alle Standorte</option>
            {standorte.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Datum/Monat */}
          {tab === 'eingabe'
            ? <div className="flex items-center gap-1">
                <button type="button" onClick={() => shiftDatum(-1)}
                  className="px-2 py-1.5 bg-white border border-gray-300 text-gray-500 rounded hover:bg-gray-50 text-sm leading-none">‹</button>
                <input type="date" value={datum} onChange={e => setDatum(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
                <button type="button" onClick={() => shiftDatum(1)}
                  className="px-2 py-1.5 bg-white border border-gray-300 text-gray-500 rounded hover:bg-gray-50 text-sm leading-none">›</button>
                {datum !== TODAY && (
                  <button type="button" onClick={() => setDatum(TODAY)}
                    className="px-2 py-1 bg-indigo-50 border border-indigo-300 text-indigo-600 text-xs rounded hover:bg-indigo-100 font-medium">
                    Heute
                  </button>
                )}
              </div>
            : <input type="month" value={monat} onChange={e => setMonat(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          }
        </div>
      </div>

      {/* ── TAB: DATENEINGABE ────────────────────────────────────────────────────── */}
      {tab === 'eingabe' && (
        <div className="space-y-3">
          {/* Statusleiste */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              {new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              {(logsByDay.data || []).length} von {tracked.length} Mitarbeiter-Einträge erfasst
            </span>
          </div>

          {/* Inbound */}
          <div className="rounded-lg border border-teal-200 bg-white overflow-hidden">
            <div className="px-3 py-2 bg-teal-700 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide">📬 Tages-Inbound (global)</span>
              <button onClick={() => setInboundModal(true)}
                className="text-xs text-teal-200 hover:text-white font-medium transition-colors">
                {currentInbound ? 'Bearbeiten' : '+ Eintragen'}
              </button>
            </div>
            <div className="px-4 py-3">
              {currentInbound ? (() => {
                const ti = (currentInbound.inbound_mail||0)+(currentInbound.inbound_fax||0)+(currentInbound.inbound_ad||0);
                const tt = (currentInbound.terminiert_mail||0)+(currentInbound.terminiert_fax||0)+(currentInbound.terminiert_ad||0);
                return (
                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <span className="text-gray-600">Mail: <b className="text-teal-700">{currentInbound.inbound_mail||0}</b></span>
                      <span className="text-gray-600">Fax: <b className="text-teal-700">{currentInbound.inbound_fax||0}</b></span>
                      <span className="text-gray-600">Ad: <b className="text-teal-700">{currentInbound.inbound_ad||0}</b></span>
                      <span className="font-bold text-teal-800">Gesamt: {ti}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-teal-600">
                      <span>Terminiert: <b>{tt}</b></span>
                      <span>Quote: <b>{ti > 0 ? Math.round(tt/ti*100) : 0} %</b></span>
                    </div>
                  </div>
                );
              })() : <p className="text-xs text-gray-400">Noch kein Eintrag für diesen Tag.</p>}
            </div>
          </div>

          {/* Mitarbeiter-Tabelle */}
          <div className="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#2d2e30] text-gray-300">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Mitarbeiter</th>
                  <th className="px-3 py-2.5 text-left font-medium">Rolle</th>
                  <th className="px-3 py-2.5 text-right font-medium" title="Entscheider erreicht">Err.</th>
                  <th className="px-3 py-2.5 text-right font-medium" title="Entscheider terminiert">Term.</th>
                  <th className="px-3 py-2.5 text-right font-medium" title="Settings geplant">Set. gepl.</th>
                  <th className="px-3 py-2.5 text-right font-medium" title="Settings stattgefunden">Set. stattg.</th>
                  <th className="px-3 py-2.5 text-right font-medium" title="Beratungen geplant">Ber. gepl.</th>
                  <th className="px-3 py-2.5 text-right font-medium" title="Beratungen stattgefunden">Ber. stattg.</th>
                  <th className="px-3 py-2.5 text-center font-medium">Status</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tracked.length === 0
                  ? <tr><td colSpan={10} className="text-center py-8 text-gray-400">Keine Mitarbeiter gefunden</td></tr>
                  : tracked.map((emp, i) => {
                    const log = dayMap[emp.id];
                    const hasEntry = !!log;
                    return (
                      <tr key={emp.id} className={`hover:bg-indigo-50 transition-colors ${i%2===0?'bg-white':'bg-gray-50'}`}>
                        <td className="px-3 py-2 font-medium text-gray-900">{emp.name}</td>
                        <td className="px-3 py-2"><RoleBadge rolle={emp.rolle} /></td>
                        <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_OPENER(emp.rolle) ? log.entscheider_erreicht   : '—'}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_OPENER(emp.rolle) ? log.entscheider_terminiert : '—'}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_OPENER(emp.rolle) ? log.settings_geplant        : '—'}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{hasEntry && IS_OPENER(emp.rolle) ? log.settings_stattgefunden : '—'}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_CLOSER(emp.rolle) ? log.beratungen_geplant      : '—'}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{hasEntry && IS_CLOSER(emp.rolle) ? log.beratungen_stattgefunden : '—'}</td>
                        <td className="px-3 py-2 text-center">
                          {hasEntry
                            ? <span className="inline-flex items-center gap-1 text-green-700 text-[10px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Erfasst</span>
                            : <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Offen</span>
                          }
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => setModal({ employee: emp, existing: log || null })}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">
                            {hasEntry ? 'Bearbeiten' : '+ Eintragen'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: AUSWERTUNG ──────────────────────────────────────────────────────── */}
      {tab === 'auswertung' && (
        <div className="space-y-3">

          {/* Auswertung Controls */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center flex-wrap gap-3">
            {/* Zeitbasis */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">Zeitbasis:</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
                {[['tag','Tagesbasis'],['woche','Wochenbasis'],['monat','Monatsbasis']].map(([v, l]) => (
                  <button key={v} onClick={() => setZeitbasis(v)}
                    className={`px-3 py-1.5 font-medium transition-colors ${zeitbasis === v ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'} ${v !== 'tag' ? 'border-l border-gray-300' : ''}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* Datum für Tages- und Wochenbasis */}
            {(zeitbasis === 'tag' || zeitbasis === 'woche') && (
              <input type="date" value={datum} onChange={e => setDatum(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5" />
            )}
            <div className="flex-1" />
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              {zeitbasis === 'trend' ? 'Letztes Halbjahr' : activeLabel}
            </span>
          </div>

          {/* Sub-Navigation */}
          <div className="flex overflow-x-auto gap-1 pb-1">
            {[
              { id: 'dashboard', label: 'Dashboard',  icon: '📊' },
              { id: 'opening',   label: 'Opening',    icon: '📞' },
              { id: 'setting',   label: 'Setting',    icon: '📅' },
              { id: 'closing',   label: 'Closing',    icon: '🤝' },
              { id: 'vergleich', label: 'Vergleich',  icon: '⚖️' },
              { id: 'trend',     label: 'Trend / Verlauf', icon: '📈' },
            ].map(t => (
              <button key={t.id}
                onClick={() => setAuswertTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  auswertTab === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200'
                }`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* ── Dashboard ── */}
          {auswertTab === 'dashboard' && (
            <div className="space-y-3">

              {/* Tages-Pace + Aktionen */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-3 py-2.5 bg-[#0f172a] flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    Daily Pace — {new Date(datum + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'short' })}
                    {standortFilter && <span className="ml-2 text-white/50">· {standortFilter}</span>}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={handleCopy}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                      📋 Kopieren
                    </button>
                    <div className="relative">
                      <button onClick={() => setShowExport(v => !v)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                        ⬇ Export
                      </button>
                      {showExport && (
                        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-52 py-1 text-xs">
                          <div className="px-3 py-1.5 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Als CSV exportieren</div>
                          {[
                            ['all',     '📊 Komplettes Dashboard'],
                            ['soll',    '🎯 Soll-Abweichungen'],
                            ['opening', '📞 Opening-Zahlen'],
                            ['setting', '⚙️ Setting-Zahlen'],
                            ['closing', '🤝 Closing-Zahlen'],
                          ].map(([key, label]) => (
                            <button key={key} onClick={() => exportCsv(key)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700">
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                  {[
                    { label: 'Sales Calls heute', value: todaySC, goal: DAILY_GOAL_SC, color: 'text-green-700' },
                    { label: 'Settings terminiert heute', value: todaySettingsGelegt, goal: DAILY_GOAL_SETTINGS, color: 'text-violet-700' },
                  ].map(({ label, value, goal, color }) => {
                    const pct = goal > 0 ? Math.min(Math.round(value / goal * 100), 100) : 0;
                    const barCol = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400';
                    return (
                      <div key={label} className="p-3 col-span-1">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
                        <div className={`text-3xl font-black ${color} leading-tight`}>{value}
                          <span className="text-sm font-normal text-gray-400 ml-1">/ {goal}</span>
                        </div>
                        <div className="mt-1.5 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`${barCol} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Pace {pct}%</div>
                      </div>
                    );
                  })}
                  <div className="p-3 col-span-1">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Show-Rate Setting</div>
                    <div className="text-xl font-bold text-violet-600 leading-tight">
                      {todaySettingsGepl > 0 ? `${(todaySettings/todaySettingsGepl*100).toFixed(0)}%` : '—'}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Heute · Soll {SOLL.show_rate_setting}%</div>
                    <div className="text-[10px] text-gray-400">Monat: {monthSettingsGepl > 0 ? `${(monthSettings/monthSettingsGepl*100).toFixed(0)}%` : '—'}</div>
                  </div>
                  <div className="p-3 col-span-1">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Durchstellungsquote</div>
                    <div className="text-xl font-bold text-indigo-600 leading-tight">
                      {todaySettings > 0 ? `${(todayBerVereinb/todaySettings*100).toFixed(0)}%` : '—'}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Heute · Soll {SOLL.durchstellung}%</div>
                    <div className="text-[10px] text-gray-400">Monat: {monthSettings > 0 ? `${(monthBerVereinb/monthSettings*100).toFixed(0)}%` : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Soll-Abweichung */}
              <SollAbweichung
                kpis={sollKpis}
                nums={{
                  lead_terminierung: { n: tiTerminiert,    d: tiLeads },
                  show_rate_setting: { n: fSettings,       d: fSetGepl },
                  durchstellung:     { n: fBerVereinbart,  d: fSettings },
                  show_rate_closing: { n: fBeratungen,     d: fBerGepl },
                  closing_rate:      { n: nkGewonnen,      d: nkAngebote },
                }}
                label={standortFilter ? standortFilter : `Gesamt (${fmtMonth(monat)})`}
              />

              {/* Funnel */}
              <SectionBox
                header={<span className="text-xs font-bold text-white uppercase tracking-wide">Sales-Funnel — {activeLabel}</span>}
                headerColor="bg-slate-800">
                <div className="bg-gradient-to-br from-slate-50 to-gray-100">
                  <SalesFunnel
                    fEntscheider={fEntscheider}
                    fTerminiert={fTerminiert}
                    fSetGepl={fSetGepl}
                    fSetStattg={fSettings}
                    fBerVereinbart={fBerVereinbart}
                    fBerGepl={fBerGepl}
                    fBerStattg={fBeratungen}
                  />
                </div>
              </SectionBox>

              {/* Metriken-Übersicht */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard color="blue"   label="Entscheider erreicht"   value={fEntscheider} sub={`${fTerminiert} terminiert`} />
                <MetricCard color="violet" label="Settings stattgef."     value={fSettings}    sub={pct(fSettings, sum(activeLogs,'settings_geplant')) + ' Show-Rate'} />
                <MetricCard color="green"  label="Beratungen stattgef."   value={fBeratungen}  sub={pct(fBeratungen, sum(activeLogs,'beratungen_geplant')) + ' Show-Rate'} />
              </div>

              {/* Konversionsraten-Übersicht */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard color="blue"   label="Terminierungsquote"   value={pct(fTerminiert, fEntscheider)}                              desc={`${fTerminiert} / ${fEntscheider} Entscheider terminiert`} />
                <KpiCard color="violet" label="Show-Rate Settings"   value={pct(fSettings, sum(activeLogs,'settings_geplant'))}          desc={`${fSettings} stattgef. / ${sum(activeLogs,'settings_geplant')} geplant`} />
                <KpiCard color="green"  label="Show-Rate Beratungen" value={pct(fBeratungen, sum(activeLogs,'beratungen_geplant'))}      desc={`${fBeratungen} stattgef. / ${sum(activeLogs,'beratungen_geplant')} geplant`} />
                <KpiCard color="indigo" label="Durchstellungsquote"  value={pct(fBerVereinbart, fSettings)}                              desc={`${fBerVereinbart} ber. vereinbart aus ${fSettings} Settings`} />
              </div>

              {/* Terminierungsquoten */}
              <div className="grid grid-cols-2 gap-3">
                <KpiCard color="teal"   label="CC-Anteil an Terminen"      value={pct(sum(activeLogs,'terminiert_cold_calls'), fTerminiert)} desc={`${sum(activeLogs,'terminiert_cold_calls')} Cold-Call-Termine`} />
                <KpiCard color="teal"   label="Inbound-Anteil an Terminen" value={pct(sum(activeLogs,'terminiert_inbound'), fTerminiert)}    desc={`${sum(activeLogs,'terminiert_inbound')} Inbound-Termine`} />
              </div>

              {/* Pro-Mitarbeiter Übersicht */}
              <SectionBox
                header={<><span className="text-xs font-bold text-white uppercase tracking-wide">Übersicht pro Mitarbeiter</span><span className="text-xs text-white/60">{activeLogs.length} Einträge</span></>}
                headerColor="bg-[#2d2e30]">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider">
                        <th className="px-3 pt-2 pb-1 bg-gray-50" colSpan={2}></th>
                        <th className="px-3 pt-2 pb-1 text-center bg-blue-50 text-blue-700 border-l border-blue-100" colSpan={3}>📞 Entscheider</th>
                        <th className="px-3 pt-2 pb-1 text-center bg-violet-50 text-violet-700 border-l border-violet-100" colSpan={4}>📅 Settings</th>
                        <th className="px-3 pt-2 pb-1 text-center bg-green-50 text-green-700 border-l border-green-100" colSpan={2}>🤝 Beratungsgespräche</th>
                      </tr>
                      <tr className="border-b border-gray-100 text-gray-500 font-medium">
                        <th className="px-3 py-2 text-left bg-gray-50">Mitarbeiter</th>
                        <th className="px-3 py-2 text-left bg-gray-50">Rolle</th>
                        <th className="px-3 py-2 text-right bg-blue-50/50 border-l border-blue-100" title="Wie viele Entscheider wurden erreicht?">Erreicht</th>
                        <th className="px-3 py-2 text-right bg-blue-50/50" title="Wie viele Entscheider wurden zu einem Setting terminiert?">Terminiert</th>
                        <th className="px-3 py-2 text-right bg-blue-50/50" title="Terminierungsquote: Terminiert / Erreicht">Quote</th>
                        <th className="px-3 py-2 text-right bg-violet-50/50 border-l border-violet-100" title="Wie viele Settings haben stattgefunden?">Stattgef.</th>
                        <th className="px-3 py-2 text-right bg-violet-50/50" title="Show-Rate: Settings stattgefunden / geplant">Show-Rate</th>
                        <th className="px-3 py-2 text-right bg-violet-50/50" title="Wie viele Beratungsgespräche wurden gelegt? (inkl. direkte Settings)">Ber. gelegt</th>
                        <th className="px-3 py-2 text-right bg-violet-50/50" title="Durchstellungsquote: Beratungen vereinbart / Settings stattgefunden">Durchst.</th>
                        <th className="px-3 py-2 text-right bg-green-50/50 border-l border-green-100" title="Wie viele Beratungsgespräche haben stattgefunden?">Stattgef.</th>
                        <th className="px-3 py-2 text-right bg-green-50/50" title="Show-Rate: Beratungen stattgefunden / geplant">Show-Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {perEmployee.length === 0
                        ? <tr><td colSpan={11} className="px-3 py-5 text-center text-gray-400">Keine Daten für diesen Zeitraum</td></tr>
                        : perEmployee.map((ep, i) => {
                          const ls = ep.logs;
                          return (
                            <tr key={ep.name} className={`hover:bg-gray-50 ${i%2===0?'bg-white':'bg-gray-50/50'}`}>
                              <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{ep.name}</td>
                              <td className="px-3 py-2.5"><RoleBadge rolle={ep.rolle} /></td>
                              <td className="px-3 py-2.5 text-right text-gray-600 border-l border-blue-50">{IS_OPENER(ep.rolle) ? sum(ls,'entscheider_erreicht')   : '—'}</td>
                              <td className="px-3 py-2.5 text-right text-gray-600">{IS_OPENER(ep.rolle) ? sum(ls,'entscheider_terminiert') : '—'}</td>
                              <td className="px-3 py-2.5 text-right text-indigo-700 font-medium">{IS_OPENER(ep.rolle) ? pct(sum(ls,'entscheider_terminiert'),sum(ls,'entscheider_erreicht')) : '—'}</td>
                              <td className="px-3 py-2.5 text-right font-medium text-gray-900 border-l border-violet-50">{IS_OPENER(ep.rolle) ? sum(ls,'settings_stattgefunden') : '—'}</td>
                              <td className="px-3 py-2.5 text-right text-violet-700 font-medium">{IS_OPENER(ep.rolle) ? pct(sum(ls,'settings_stattgefunden'),sum(ls,'settings_geplant')) : '—'}</td>
                              <td className="px-3 py-2.5 text-right font-medium text-gray-900">{IS_OPENER(ep.rolle) ? sum(ls,'beratung_vereinbart') + sum(ls,'beratung_vereinbart_direkt') : '—'}</td>
                              <td className="px-3 py-2.5 text-right text-indigo-700 font-bold">{IS_OPENER(ep.rolle) ? pct(sum(ls,'beratung_vereinbart'),sum(ls,'settings_stattgefunden')) : '—'}</td>
                              <td className="px-3 py-2.5 text-right font-medium text-gray-900 border-l border-green-50">{IS_CLOSER(ep.rolle) ? sum(ls,'beratungen_stattgefunden') : '—'}</td>
                              <td className="px-3 py-2.5 text-right text-green-700 font-medium">{IS_CLOSER(ep.rolle) ? pct(sum(ls,'beratungen_stattgefunden'),sum(ls,'beratungen_geplant')) : '—'}</td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                    {perEmployee.length > 0 && (
                      <tfoot>
                        <tr className="bg-[#2d2e30] text-white font-bold text-xs">
                          <td className="px-3 py-2" colSpan={2}>Gesamt</td>
                          <td className="px-3 py-2 text-right">{sum(activeLogs,'entscheider_erreicht')}</td>
                          <td className="px-3 py-2 text-right">{sum(activeLogs,'entscheider_terminiert')}</td>
                          <td className="px-3 py-2 text-right">{pct(sum(activeLogs,'entscheider_terminiert'),sum(activeLogs,'entscheider_erreicht'))}</td>
                          <td className="px-3 py-2 text-right">{sum(activeLogs,'settings_stattgefunden')}</td>
                          <td className="px-3 py-2 text-right">{pct(sum(activeLogs,'settings_stattgefunden'),sum(activeLogs,'settings_geplant'))}</td>
                          <td className="px-3 py-2 text-right">{sum(activeLogs,'beratung_vereinbart') + sum(activeLogs,'beratung_vereinbart_direkt')}</td>
                          <td className="px-3 py-2 text-right">{pct(sum(activeLogs,'beratung_vereinbart'),sum(activeLogs,'settings_stattgefunden'))}</td>
                          <td className="px-3 py-2 text-right">{sum(activeLogs,'beratungen_stattgefunden')}</td>
                          <td className="px-3 py-2 text-right">{pct(sum(activeLogs,'beratungen_stattgefunden'),sum(activeLogs,'beratungen_geplant'))}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                <p className="px-3 py-2 text-[10px] text-gray-400 border-t border-gray-100">
                  So liest du die Tabelle: 📞 Entscheider erreicht → terminiert → 📅 Setting findet statt → Beratungsgespräch gelegt → 🤝 Beratung findet statt.
                  „Durchst." = Anteil der Settings, aus denen ein Beratungsgespräch wurde. „—" = für diese Rolle nicht relevant oder keine Daten. Spalten-Tooltips per Maus-Hover.
                </p>
              </SectionBox>
            </div>
          )}

          {/* ── Opening ── */}
          {auswertTab === 'opening' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <KpiCard color="blue"   label="Entscheider erreicht"    value={sum(activeLogs,'entscheider_erreicht')} />
                <KpiCard color="blue"   label="Entscheider terminiert"  value={sum(activeLogs,'entscheider_terminiert')} />
                <KpiCard color="indigo" label="Terminierungsquote"      value={pct(sum(activeLogs,'entscheider_terminiert'),sum(activeLogs,'entscheider_erreicht'))} desc={`${sum(activeLogs,'entscheider_terminiert')} von ${sum(activeLogs,'entscheider_erreicht')}`} />
                <KpiCard color="teal"   label="Termine gesamt"          value={sum(activeLogs,'entscheider_terminiert')} desc="Cold Call + Inbound" />
                <KpiCard color="teal"   label="davon Cold Call"         value={sum(activeLogs,'terminiert_cold_calls')} desc={pct(sum(activeLogs,'terminiert_cold_calls'),sum(activeLogs,'entscheider_terminiert'))+' aller Termine'} />
                <KpiCard color="teal"   label="davon Inbound"           value={sum(activeLogs,'terminiert_inbound')}    desc={pct(sum(activeLogs,'terminiert_inbound'),sum(activeLogs,'entscheider_terminiert'))+' aller Termine'} />
              </div>

              <SectionBox
                header={<span className="text-xs font-bold text-white uppercase tracking-wide">Opening — Pro Mitarbeiter</span>}
                headerColor="bg-blue-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-blue-50 border-b border-blue-100 text-blue-800 font-medium">
                        <th className="px-3 py-2 text-left">Mitarbeiter</th>
                        <th className="px-3 py-2 text-right">Err.</th>
                        <th className="px-3 py-2 text-right">Term.</th>
                        <th className="px-3 py-2 text-right">E→T %</th>
                        <th className="px-3 py-2 text-right">Cold Call</th>
                        <th className="px-3 py-2 text-right">Inbound</th>
                        <th className="px-3 py-2 text-right">% CC</th>
                        <th className="px-3 py-2 text-right">% IB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                      {perEmployee.filter(ep => IS_OPENER(ep.rolle)).map((ep, i) => {
                        const ls = ep.logs;
                        const err  = sum(ls,'entscheider_erreicht');
                        const term = sum(ls,'entscheider_terminiert');
                        const cc   = sum(ls,'terminiert_cold_calls');
                        const ib   = sum(ls,'terminiert_inbound');
                        return (
                          <tr key={ep.name} className={i%2===0?'bg-white':'bg-blue-50/30'}>
                            <td className="px-3 py-2.5 font-medium text-gray-900">{ep.name}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{err}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-gray-900">{term}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-blue-700">{pct(term,err)}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{cc}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{ib}</td>
                            <td className="px-3 py-2.5 text-right text-teal-700">{pct(cc,term)}</td>
                            <td className="px-3 py-2.5 text-right text-teal-700">{pct(ib,term)}</td>
                          </tr>
                        );
                      })}
                      {perEmployee.filter(ep => IS_OPENER(ep.rolle)).length === 0 && (
                        <tr><td colSpan={8} className="px-3 py-5 text-center text-gray-400">Keine Opener-Daten</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionBox>
            </div>
          )}

          {/* ── Setting ── */}
          {auswertTab === 'setting' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <KpiCard color="violet" label="Settings geplant"       value={sum(activeLogs,'settings_geplant')} />
                <KpiCard color="violet" label="Settings stattgefunden" value={sum(activeLogs,'settings_stattgefunden')} />
                <KpiCard color="violet" label="Show-Rate Settings"     value={pct(sum(activeLogs,'settings_stattgefunden'),sum(activeLogs,'settings_geplant'))} desc={`${sum(activeLogs,'settings_stattgefunden')} stattgef. / ${sum(activeLogs,'settings_geplant')} geplant (täglich)`} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <KpiCard color="indigo" label="Durchstellungsquote" value={pct(sum(activeLogs,'beratung_vereinbart'),sum(activeLogs,'settings_stattgefunden'))} desc={`${sum(activeLogs,'beratung_vereinbart')} Beratungen vereinbart aus ${sum(activeLogs,'settings_stattgefunden')} Settings`} />
                <KpiCard color="indigo" label="Direkte Settings"    value={sum(activeLogs,'settings_direkt')}                                                  desc={`${sum(activeLogs,'beratung_vereinbart_direkt')} direkte Beratungen`} />
              </div>

              {/* Gelegte Beratungsgespräche */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <KpiCard color="green"  label="Beratungen gelegt (gesamt)"  value={sum(activeLogs,'beratung_vereinbart') + sum(activeLogs,'beratung_vereinbart_direkt')} desc="vereinbarte Beratungsgespräche" />
                <KpiCard color="teal"   label="→ nach geplantem Setting"    value={sum(activeLogs,'beratung_vereinbart')}        desc={pct(sum(activeLogs,'beratung_vereinbart'), sum(activeLogs,'beratung_vereinbart') + sum(activeLogs,'beratung_vereinbart_direkt')) + ' der gelegten'} />
                <KpiCard color="teal"   label="→ nach direktem Setting"     value={sum(activeLogs,'beratung_vereinbart_direkt')} desc={pct(sum(activeLogs,'beratung_vereinbart_direkt'), sum(activeLogs,'beratung_vereinbart') + sum(activeLogs,'beratung_vereinbart_direkt')) + ' der gelegten'} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <KpiCard color="amber" label="Setting abgesagt"    value={sum(activeLogs,'setting_abgesagt')}  desc={pct(sum(activeLogs,'setting_abgesagt'),sum(activeLogs,'settings_geplant'))+' von geplanten'} />
                <KpiCard color="amber" label="Setting verschoben"  value={sum(activeLogs,'setting_verschoben')} desc={pct(sum(activeLogs,'setting_verschoben'),sum(activeLogs,'settings_geplant'))+' von geplanten'} />
                <KpiCard color="red"   label="Nicht erreicht"      value={sum(activeLogs,'nicht_erreicht')}     desc={pct(sum(activeLogs,'nicht_erreicht'),sum(activeLogs,'settings_geplant'))+' von geplanten'} />
              </div>

              <SectionBox
                header={<span className="text-xs font-bold text-white uppercase tracking-wide">Setting — Pro Mitarbeiter</span>}
                headerColor="bg-violet-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-violet-50 border-b border-violet-100 text-violet-800 font-medium">
                        <th className="px-3 py-2 text-left">Mitarbeiter</th>
                        <th className="px-3 py-2 text-right">Gepl.</th>
                        <th className="px-3 py-2 text-right">Stattg.</th>
                        <th className="px-3 py-2 text-right">Show-Rate</th>
                        <th className="px-3 py-2 text-right">→ Beratung</th>
                        <th className="px-3 py-2 text-right">Set.→Ber.%</th>
                        <th className="px-3 py-2 text-right">Direkt</th>
                        <th className="px-3 py-2 text-right">Abgesagt</th>
                        <th className="px-3 py-2 text-right">Verschoben</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-50">
                      {perEmployee.filter(ep => IS_OPENER(ep.rolle)).map((ep, i) => {
                        const ls = ep.logs;
                        const gepl   = sum(ls,'settings_geplant');
                        const stattg = sum(ls,'settings_stattgefunden');
                        const bv     = sum(ls,'beratung_vereinbart');
                        return (
                          <tr key={ep.name} className={i%2===0?'bg-white':'bg-violet-50/30'}>
                            <td className="px-3 py-2.5 font-medium text-gray-900">{ep.name}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{gepl}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-gray-900">{stattg}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-violet-700">{pct(stattg,gepl)}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{bv}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-indigo-700">{pct(bv,stattg)}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{sum(ls,'settings_direkt')}</td>
                            <td className="px-3 py-2.5 text-right text-amber-600">{sum(ls,'setting_abgesagt')}</td>
                            <td className="px-3 py-2.5 text-right text-amber-600">{sum(ls,'setting_verschoben')}</td>
                          </tr>
                        );
                      })}
                      {perEmployee.filter(ep => IS_OPENER(ep.rolle)).length === 0 && (
                        <tr><td colSpan={9} className="px-3 py-5 text-center text-gray-400">Keine Setting-Daten</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionBox>
            </div>
          )}

          {/* ── Closing ── */}
          {auswertTab === 'closing' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <KpiCard color="green"  label="Beratungen geplant"       value={sum(activeLogs,'beratungen_geplant')} />
                <KpiCard color="green"  label="Beratungen stattgefunden" value={sum(activeLogs,'beratungen_stattgefunden')} />
                <KpiCard color="green"  label="Show-Rate Beratungen"     value={pct(sum(activeLogs,'beratungen_stattgefunden'),sum(activeLogs,'beratungen_geplant'))} desc={`${sum(activeLogs,'beratungen_stattgefunden')} / ${sum(activeLogs,'beratungen_geplant')}`} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard color="green"  label="Direkter Close"  value={sum(activeLogs,'beratungen_direkter_close')} desc={pct(sum(activeLogs,'beratungen_direkter_close'),sum(activeLogs,'beratungen_stattgefunden'))+' der stattgef. Beratungen'} />
                <KpiCard color="indigo" label="Follow-Up / CC2" value={sum(activeLogs,'beratungen_follow_up_cc2')}  desc={pct(sum(activeLogs,'beratungen_follow_up_cc2'),sum(activeLogs,'beratungen_stattgefunden'))+' der stattgef. Beratungen'} />
                <KpiCard color="amber"  label="Unqualifiziert"  value={sum(activeLogs,'beratungen_unqualifiziert')} desc={pct(sum(activeLogs,'beratungen_unqualifiziert'),sum(activeLogs,'beratungen_stattgefunden'))+' der stattgef. Beratungen'} />
                <KpiCard color="amber"  label="No-Shows"        value={sum(activeLogs,'beratungen_no_show')}        desc={pct(sum(activeLogs,'beratungen_no_show'),sum(activeLogs,'beratungen_geplant'))+' von geplanten'} />
              </div>

              <SectionBox
                header={<span className="text-xs font-bold text-white uppercase tracking-wide">Closing — Pro Mitarbeiter</span>}
                headerColor="bg-green-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-green-50 border-b border-green-100 text-green-800 font-medium">
                        <th className="px-3 py-2 text-left">Mitarbeiter</th>
                        <th className="px-3 py-2 text-right">Gepl.</th>
                        <th className="px-3 py-2 text-right">Stattg.</th>
                        <th className="px-3 py-2 text-right">Show-Rate</th>
                        <th className="px-3 py-2 text-right">No-Show</th>
                        <th className="px-3 py-2 text-right">Dir. Close</th>
                        <th className="px-3 py-2 text-right">Follow-Up</th>
                        <th className="px-3 py-2 text-right">Unqual.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-50">
                      {perEmployee.filter(ep => IS_CLOSER(ep.rolle)).map((ep, i) => {
                        const ls = ep.logs;
                        const gepl   = sum(ls,'beratungen_geplant');
                        const stattg = sum(ls,'beratungen_stattgefunden');
                        return (
                          <tr key={ep.name} className={i%2===0?'bg-white':'bg-green-50/30'}>
                            <td className="px-3 py-2.5 font-medium text-gray-900">{ep.name}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{gepl}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-gray-900">{stattg}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-green-700">{pct(stattg,gepl)}</td>
                            <td className="px-3 py-2.5 text-right text-red-500">{sum(ls,'beratungen_no_show')}</td>
                            <td className="px-3 py-2.5 text-right text-green-600 font-medium">{sum(ls,'beratungen_direkter_close')}</td>
                            <td className="px-3 py-2.5 text-right text-amber-600">{sum(ls,'beratungen_follow_up_cc2')}</td>
                            <td className="px-3 py-2.5 text-right text-gray-500">{sum(ls,'beratungen_unqualifiziert')}</td>
                          </tr>
                        );
                      })}
                      {perEmployee.filter(ep => IS_CLOSER(ep.rolle)).length === 0 && (
                        <tr><td colSpan={8} className="px-3 py-5 text-center text-gray-400">Keine Closer-Daten</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionBox>
            </div>
          )}

          {/* ── Vergleich ── */}
          {auswertTab === 'vergleich' && (
            <div className="space-y-3">
              {/* Mitarbeiter-Auswahl */}
              <SectionBox
                header={<span className="text-xs font-bold text-white uppercase tracking-wide">Mitarbeiter auswählen</span>}
                headerColor="bg-indigo-700">
                <div className="p-3 flex flex-wrap gap-2">
                  {perEmployee.length === 0
                    ? <p className="text-xs text-gray-400 py-2">Keine Daten für diesen Zeitraum.</p>
                    : perEmployee.map(ep => {
                      const sel2 = vergleichEmps.has(ep.id);
                      return (
                        <button key={ep.id}
                          onClick={() => setVergleichEmps(prev => {
                            const n = new Set(prev);
                            if (n.has(ep.id)) n.delete(ep.id); else n.add(ep.id);
                            return n;
                          })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            sel2 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                          }`}>
                          <span>{ep.name}</span>
                          <span className="opacity-60 text-[10px]">({ep.rolle})</span>
                        </button>
                      );
                    })
                  }
                  {vergleichEmps.size > 0 && (
                    <button onClick={() => setVergleichEmps(new Set())}
                      className="ml-auto text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
                      Auswahl löschen ✕
                    </button>
                  )}
                </div>
              </SectionBox>

              {/* Vergleichstabelle */}
              {vergleichEmps.size === 0
                ? <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
                    Bitte mindestens einen Mitarbeiter auswählen.
                  </div>
                : (() => {
                  const selEmps = perEmployee.filter(ep => vergleichEmps.has(ep.id));
                  const rows = [
                    { label: '— Opening', header: true },
                    { label: 'Entscheider erreicht',   fn: (ls) => sum(ls,'entscheider_erreicht'),   show: ep => IS_OPENER(ep.rolle) },
                    { label: 'Entscheider terminiert',  fn: (ls) => sum(ls,'entscheider_terminiert'), show: ep => IS_OPENER(ep.rolle) },
                    { label: 'Terminierungsquote',      fn: (ls) => pct(sum(ls,'entscheider_terminiert'),sum(ls,'entscheider_erreicht')), show: ep => IS_OPENER(ep.rolle), highlight: true },
                    { label: '— Setting', header: true },
                    { label: 'Settings geplant',        fn: (ls) => sum(ls,'settings_geplant'),       show: ep => IS_OPENER(ep.rolle) },
                    { label: 'Settings stattgefunden',  fn: (ls) => sum(ls,'settings_stattgefunden'), show: ep => IS_OPENER(ep.rolle) },
                    { label: 'Show-Rate Settings',      fn: (ls) => pct(sum(ls,'settings_stattgefunden'),sum(ls,'settings_geplant')), show: ep => IS_OPENER(ep.rolle), highlight: true },
                    { label: 'Setting → Beratung %',    fn: (ls) => pct(sum(ls,'beratung_vereinbart'),sum(ls,'settings_stattgefunden')), show: ep => IS_OPENER(ep.rolle), highlight: true },
                    { label: '— Closing', header: true },
                    { label: 'Beratungen geplant',      fn: (ls) => sum(ls,'beratungen_geplant'),       show: ep => IS_CLOSER(ep.rolle) },
                    { label: 'Beratungen stattgef.',    fn: (ls) => sum(ls,'beratungen_stattgefunden'), show: ep => IS_CLOSER(ep.rolle) },
                    { label: 'Show-Rate Beratungen',    fn: (ls) => pct(sum(ls,'beratungen_stattgefunden'),sum(ls,'beratungen_geplant')), show: ep => IS_CLOSER(ep.rolle), highlight: true },
                    { label: 'No-Shows',                fn: (ls) => sum(ls,'beratungen_no_show'), show: ep => IS_CLOSER(ep.rolle) },
                    { label: 'Follow-Up / CC2',         fn: (ls) => sum(ls,'beratungen_follow_up_cc2'), show: ep => IS_CLOSER(ep.rolle) },
                  ];
                  return (
                    <div className="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#2d2e30] text-white">
                            <th className="px-3 py-2.5 text-left font-medium sticky left-0 bg-[#2d2e30]" style={{ minWidth: 160 }}>KPI</th>
                            {selEmps.map(ep => (
                              <th key={ep.id} className="px-3 py-2.5 text-center font-medium whitespace-nowrap">
                                {ep.name}<br /><span className="text-[10px] opacity-60">{ep.rolle}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, ri) => {
                            if (row.header) {
                              return (
                                <tr key={ri} className="bg-gray-100">
                                  <td className="px-3 py-1.5 font-bold text-gray-600 uppercase tracking-wide text-[10px]" colSpan={selEmps.length + 1}>{row.label.replace('— ', '')}</td>
                                </tr>
                              );
                            }
                            return (
                              <tr key={ri} className={`${ri%2===0?'bg-white':'bg-gray-50/50'} hover:bg-indigo-50/30`}>
                                <td className="px-3 py-2 text-gray-600">{row.label}</td>
                                {selEmps.map(ep => {
                                  const shows = !row.show || row.show(ep);
                                  const val = shows ? row.fn(ep.logs, ep) : '—';
                                  return (
                                    <td key={ep.id} className={`px-3 py-2 text-center ${shows && row.highlight ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>
                                      {shows ? val : <span className="text-gray-300">—</span>}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              }
            </div>
          )}

          {/* ── Trend / Verlauf ── */}
          {auswertTab === 'trend' && (
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs text-indigo-700">
                Zeigt die <strong>letzten 6 Monate</strong> bis einschließlich <strong>{fmtMonth(monat)}</strong>.{standortFilter ? ` Gefiltert nach Standort: ${standortFilter}.` : ''}
              </div>

              {/* Trend KPI-Tabelle */}
              <div className="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#2d2e30] text-white">
                      <th className="px-3 py-2.5 text-left font-medium sticky left-0 bg-[#2d2e30]" style={{ minWidth: 160 }}>KPI</th>
                      {trendData.map(td => (
                        <th key={td.monat} className="px-3 py-2.5 text-center font-medium whitespace-nowrap">
                          {fmtMonth(td.monat)}
                          {td.loading && <span className="ml-1 opacity-50 text-[10px]">…</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Entscheider erreicht',    key: 'entscheider', section: 'opening' },
                      { label: 'Terminiert',              key: 'terminiert',  section: 'opening' },
                      { label: 'Terminierungsquote',      key: null, fn: d => pct(d.terminiert, d.entscheider), section: 'opening', pct: true },
                      { label: 'Settings stattgef.',      key: 'setStattg',   section: 'setting' },
                      { label: 'Show-Rate Settings',      key: null, fn: d => pct(d.setStattg, d.setGeplant), section: 'setting', pct: true },
                      { label: 'Beratungen stattgef.',    key: 'berStattg',   section: 'closing' },
                      { label: 'Show-Rate Beratungen',    key: null, fn: d => pct(d.berStattg, d.berGeplant), section: 'closing', pct: true },
                    ].map((row, ri) => (
                      <tr key={ri} className={`${
                        row.section === 'opening' ? (ri%2===0?'bg-blue-50/30':'bg-blue-50/60')
                        : row.section === 'setting' ? (ri%2===0?'bg-violet-50/30':'bg-violet-50/60')
                        : ri%2===0?'bg-green-50/30':'bg-green-50/60'
                      } hover:bg-indigo-50/40`}>
                        <td className="px-3 py-2.5 font-medium text-gray-700 sticky left-0 bg-inherit">{row.label}</td>
                        {trendData.map((td, ti) => {
                          const val  = row.fn ? row.fn(td) : td[row.key];
                          const prev = ti > 0 ? (row.fn ? (() => {
                            const p = trendData[ti-1];
                            const pStr = row.fn(p);
                            return pStr === '—' ? null : parseFloat(pStr);
                          })() : trendData[ti-1][row.key]) : null;
                          const numVal = row.pct ? (val === '—' ? null : parseFloat(val)) : (typeof val === 'number' ? val : null);
                          return (
                            <td key={td.monat} className={`px-3 py-2.5 text-center ${row.pct ? 'font-bold text-gray-800' : 'text-gray-700'}`}>
                              {td.loading ? <span className="text-gray-300">…</span> : (
                                <span className="flex items-center justify-center gap-0.5">
                                  {val}
                                  {numVal !== null && trendIcon(numVal, typeof prev === 'number' ? prev : null)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Trend-Highlights */}
              {trendData.every(td => !td.loading) && trendData.length >= 2 && (() => {
                const last = trendData[trendData.length-1];
                const prev = trendData[trendData.length-2];
                const tqNow   = pctNum(last.terminiert, last.entscheider);
                const tqPrev  = pctNum(prev.terminiert, prev.entscheider);
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className={`rounded-xl border p-4 ${tqNow >= tqPrev ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="text-[11px] font-semibold opacity-70 uppercase tracking-wide mb-1">Term.quote {fmtMonth(monat)}</div>
                      <div className={`text-2xl font-black ${tqNow >= tqPrev ? 'text-green-700' : 'text-red-600'}`}>{pct(last.terminiert, last.entscheider)}</div>
                      <div className="text-[11px] opacity-60 mt-0.5">vs. {fmtMonth(prev.monat)}: {pct(prev.terminiert, prev.entscheider)}</div>
                    </div>
                    <div className="rounded-xl border bg-violet-50 border-violet-200 p-4">
                      <div className="text-[11px] font-semibold opacity-70 uppercase tracking-wide mb-1">Beratungen {fmtMonth(monat)}</div>
                      <div className="text-2xl font-black text-violet-700">{last.berStattg}</div>
                      <div className="text-[11px] opacity-60 mt-0.5">vs. {fmtMonth(prev.monat)}: {prev.berStattg}</div>
                    </div>
                    <div className="rounded-xl border bg-blue-50 border-blue-200 p-4">
                      <div className="text-[11px] font-semibold opacity-70 uppercase tracking-wide mb-1">Entscheider {fmtMonth(monat)}</div>
                      <div className="text-2xl font-black text-blue-700">{last.entscheider}</div>
                      <div className="text-[11px] opacity-60 mt-0.5">vs. {fmtMonth(prev.monat)}: {prev.entscheider}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Inbound-Übersicht am Ende des Auswertungs-Tabs */}
          {(auswertTab === 'dashboard' || auswertTab === 'opening') && (
            <SectionBox
              header={<><span className="text-xs font-bold text-white uppercase tracking-wide">Inbound nach Quelle — {fmtMonth(monat)}</span></>}
              headerColor="bg-teal-700">
              {inboundWeeks.length === 0
                ? <div className="px-4 py-4 text-sm text-gray-400 bg-teal-50 text-center">Keine Inbound-Daten für {fmtMonth(monat)}</div>
                : <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-teal-50 border-b border-teal-100 text-teal-700 font-medium">
                        <th className="px-3 py-2 text-left">Woche</th>
                        <th className="px-3 py-2 text-right">Mail</th>
                        <th className="px-3 py-2 text-right">Fax</th>
                        <th className="px-3 py-2 text-right">Ad</th>
                        <th className="px-3 py-2 text-right font-bold">Gesamt</th>
                        <th className="px-3 py-2 text-right">Terminiert</th>
                        <th className="px-3 py-2 text-right">Quote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-50">
                      {inboundWeeks.map((w, i) => (
                        <tr key={w.week} className={i%2===0?'bg-white':'bg-teal-50/40'}>
                          <td className="px-3 py-2 font-medium text-gray-700">{w.week}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{w.mail}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{w.fax}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{w.ad}</td>
                          <td className="px-3 py-2 text-right font-bold text-teal-700">{w.total}</td>
                          <td className="px-3 py-2 text-right font-medium text-teal-600">{w.terminiert}</td>
                          <td className="px-3 py-2 text-right font-medium text-teal-600">{w.quote} %</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {(() => {
                        const ti = sum(inboundData,'inbound_mail')+sum(inboundData,'inbound_fax')+sum(inboundData,'inbound_ad');
                        const tt = sum(inboundData,'terminiert_mail')+sum(inboundData,'terminiert_fax')+sum(inboundData,'terminiert_ad');
                        return (
                          <tr className="bg-teal-700 text-white font-bold text-xs">
                            <td className="px-3 py-2">Gesamt</td>
                            <td className="px-3 py-2 text-right">{sum(inboundData,'inbound_mail')}</td>
                            <td className="px-3 py-2 text-right">{sum(inboundData,'inbound_fax')}</td>
                            <td className="px-3 py-2 text-right">{sum(inboundData,'inbound_ad')}</td>
                            <td className="px-3 py-2 text-right">{ti}</td>
                            <td className="px-3 py-2 text-right">{tt}</td>
                            <td className="px-3 py-2 text-right">{ti > 0 ? Math.round(tt/ti*100) : 0} %</td>
                          </tr>
                        );
                      })()}
                    </tfoot>
                  </table>
              }
            </SectionBox>
          )}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <ActivityModal
          employee={modal.employee} datum={datum} existing={modal.existing} companyId={companyId}
          onSave={data => saveMut.mutate(data)}
          onClose={() => { setModal(null); saveMut.reset(); }}
          isPending={saveMut.isPending} isError={saveMut.isError} error={errMsg(saveMut)} />
      )}
      {inboundModal && (
        <InboundModal
          datum={datum} existing={currentInbound} companyId={companyId}
          onSave={data => saveInboundMut.mutate(data)}
          onClose={() => { setInboundModal(false); saveInboundMut.reset(); }}
          isPending={saveInboundMut.isPending} isError={saveInboundMut.isError} error={errMsg(saveInboundMut)} />
      )}
    </div>
  );
}
