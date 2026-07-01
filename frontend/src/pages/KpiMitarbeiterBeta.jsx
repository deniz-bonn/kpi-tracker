import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityLogsApi, inboundDailyApi, employeesApi, dealsApi } from '../utils/api';
import { currentMonat } from '../utils/format';

const TODAY = new Date().toISOString().slice(0, 10);

const TRACKED_ROLES = ['Opener', 'Setter', 'Multi', 'Multi BS', 'NKV-Closer'];
const IS_OPENER = r => ['Opener', 'Setter', 'Multi', 'Multi BS'].includes(r);
const IS_CLOSER = r => ['NKV-Closer', 'Multi', 'Multi BS'].includes(r);

const pct = (num, den) => den > 0 ? `${(num / den * 100).toFixed(1)}%` : '—';
const sum = (arr, key) => arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
const errMsg = mut => mut.error?.response?.data?.message || mut.error?.message || 'Fehler beim Speichern';

const ZERO_FORM = {
  entscheider_erreicht: '', entscheider_terminiert: '',
  terminiert_cold_calls: '', terminiert_inbound: '',
  settings_geplant: '', settings_stattgefunden: '',
  setting_abgesagt: '', setting_verschoben: '', nicht_erreicht: '',
  settings_direkt: '', beratung_vereinbart_direkt: '',
  unqualifiziert: '', follow_up: '', beratung_vereinbart: '',
  beratungen_geplant: '', beratungen_stattgefunden: '',
  beratungen_verschoben: '', beratungen_no_show: '',
  beratungen_follow_up_cc2: '', beratungen_kein_close: '',
  kommentar: '',
};

const INBOUND_ZERO = { inbound_mail: '', inbound_fax: '', inbound_ad: '', terminiert_mail: '', terminiert_fax: '', terminiert_ad: '', kommentar: '' };

// ── Eingabe-Input helper ───────────────────────────────────────────────────────
const INPUT_CLS = 'w-16 text-right text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400';

const makeInp = (form, set) => (key, label) => (
  <div key={key} className="flex items-center justify-between gap-2">
    <label className="text-xs text-gray-600 flex-1">{label}</label>
    <input
      type="number" min="0"
      value={form[key]}
      onChange={e => set(key, e.target.value)}
      className={INPUT_CLS}
    />
  </div>
);

// ── Mitarbeiter-Dateneingabe Modal ─────────────────────────────────────────────
function ActivityModal({ employee, datum, existing, companyId, onSave, onClose, isPending, isError, error }) {
  const rolle = employee.rolle;
  const [form, setForm] = useState(() => existing
    ? { ...ZERO_FORM, ...Object.fromEntries(Object.keys(ZERO_FORM).map(k => [k, existing[k] ?? ''])) }
    : { ...ZERO_FORM }
  );
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
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📞</span> Entscheider &amp; Terminierung
              </h3>
              <div className="space-y-2 bg-indigo-50 rounded-lg p-3">
                {inp('entscheider_erreicht',   'Entscheider erreicht')}
                {inp('entscheider_terminiert', 'Entscheider terminiert')}
                {inp('terminiert_cold_calls',  '→ davon Cold Calls')}
                {inp('terminiert_inbound',     '→ davon Inbound')}
              </div>
            </section>
          )}

          {IS_OPENER(rolle) && (
            <section>
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📅</span> Settings
              </h3>
              <div className="space-y-2 bg-indigo-50 rounded-lg p-3">
                {inp('settings_geplant',       'Settings geplant')}
                {inp('settings_stattgefunden', 'Settings stattgefunden')}
                <div className="border-t border-indigo-100 pt-2 mt-1">
                  <p className="text-[10px] text-indigo-500 font-medium mb-1.5">Nicht stattgefunden:</p>
                  {inp('setting_abgesagt',   'Setting abgesagt')}
                  {inp('setting_verschoben', 'Setting verschoben')}
                  {inp('nicht_erreicht',     'Nicht erreicht')}
                </div>
                <div className="border-t border-indigo-100 pt-2 mt-1">
                  <p className="text-[10px] text-indigo-500 font-medium mb-1.5">Direkte Settings:</p>
                  {inp('settings_direkt',            'Direkte Settings')}
                  {inp('beratung_vereinbart_direkt',  'Beratungsgespr. vereinbart (direkt)')}
                </div>
                <div className="border-t border-indigo-100 pt-2 mt-1">
                  <p className="text-[10px] text-indigo-500 font-medium mb-1.5">Nachbearbeitung:</p>
                  {inp('unqualifiziert',      'Unqualifiziert')}
                  {inp('follow_up',           'Follow-Up')}
                  {inp('beratung_vereinbart', 'Beratungsgespr. vereinbart (geplante Settings)')}
                </div>
              </div>
            </section>
          )}

          {IS_CLOSER(rolle) && (
            <section>
              <h3 className="text-[11px] font-bold text-violet-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🤝</span> Beratungsgespräche
              </h3>
              <div className="space-y-2 bg-violet-50 rounded-lg p-3">
                {(() => {
                  const inpV = makeInp(form, set);
                  return <>
                    {inpV('beratungen_geplant',       'Beratungsgespräche geplant')}
                    {inpV('beratungen_stattgefunden', 'Beratungsgespräche stattgefunden')}
                    {inpV('beratungen_verschoben',    'Beratungsgespräche verschoben')}
                    {inpV('beratungen_no_show',       'No-Show')}
                    {inpV('beratungen_follow_up_cc2',    'Follow-Up / Closing Call 2')}
                    {inpV('beratungen_direkter_close',   'Direkter Close')}
                    {inpV('beratungen_kein_close',       'Kein Close')}
                  </>;
                })()}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kommentar</h3>
            <textarea
              value={form.kommentar} onChange={e => set('kommentar', e.target.value)}
              rows={2}
              className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2
                focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
              placeholder="Optional…"
            />
          </section>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex items-center gap-2">
          {isError
            ? <p className="text-xs text-red-600 flex-1 min-w-0 truncate">{error}</p>
            : <div className="flex-1" />
          }
          <button onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            Abbrechen
          </button>
          <button onClick={handleSave} disabled={isPending}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded font-medium">
            {isPending ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Globaler Inbound-Modal ─────────────────────────────────────────────────────
function InboundModal({ datum, existing, companyId, onSave, onClose, isPending, isError, error }) {
  const [form, setForm] = useState(() => existing
    ? { ...INBOUND_ZERO, ...Object.fromEntries(Object.keys(INBOUND_ZERO).map(k => [k, existing[k] ?? ''])) }
    : { ...INBOUND_ZERO }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = makeInp(form, set);

  const handleSave = () => {
    onSave({
      datum,
      monat:           datum.slice(0, 7),
      company_id:      companyId,
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
            <h3 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📬</span> Inbound nach Quelle
            </h3>
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
                    onChange={e => set(`inbound_${key}`, e.target.value)}
                    className={INPUT_CLS} />
                  <input type="number" min="0" value={form[`terminiert_${key}`]}
                    onChange={e => set(`terminiert_${key}`, e.target.value)}
                    className={INPUT_CLS} />
                </div>
              ))}
              {(() => {
                const totalIn = (Number(form.inbound_mail)||0)+(Number(form.inbound_fax)||0)+(Number(form.inbound_ad)||0);
                const totalT  = (Number(form.terminiert_mail)||0)+(Number(form.terminiert_fax)||0)+(Number(form.terminiert_ad)||0);
                return (
                  <div className="flex items-center gap-2 border-t border-teal-200 pt-2 mt-1">
                    <span className="text-xs font-bold text-teal-700 flex-1">Gesamt</span>
                    <span className="w-16 text-right text-xs font-bold text-teal-700">{totalIn}</span>
                    <span className="w-16 text-right text-xs font-bold text-teal-700">{totalT}</span>
                  </div>
                );
              })()}
            </div>
          </section>
          <section>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kommentar</h3>
            <textarea
              value={form.kommentar} onChange={e => set('kommentar', e.target.value)}
              rows={2}
              className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
              placeholder="Optional…"
            />
          </section>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex items-center gap-2">
          {isError
            ? <p className="text-xs text-red-600 flex-1 min-w-0 truncate">{error}</p>
            : <div className="flex-1" />
          }
          <button onClick={onClose}
            className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            Abbrechen
          </button>
          <button onClick={handleSave} disabled={isPending}
            className="px-4 py-1.5 text-sm bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white rounded font-medium">
            {isPending ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KPI-Karte ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, desc, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    teal:   'bg-teal-50   border-teal-200   text-teal-700',
    green:  'bg-green-50  border-green-200  text-green-700',
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color] || colors.indigo}`}>
      <div className="text-[11px] font-medium mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {desc && <div className="text-[10px] opacity-70 mt-0.5">{desc}</div>}
    </div>
  );
}

// ── Hauptseite ─────────────────────────────────────────────────────────────────
export default function KpiMitarbeiterBeta() {
  const { company } = useOutletContext();
  const qc = useQueryClient();

  const [tab,          setTab]          = useState('eingabe');
  const [datum,        setDatum]        = useState(TODAY);
  const [monat,        setMonat]        = useState(currentMonat());
  const [modal,        setModal]        = useState(null);   // { employee, existing? }
  const [inboundModal, setInboundModal] = useState(false);
  const [empFilter,    setEmpFilter]    = useState('');
  const [standortFilter, setStandortFilter] = useState('');

  const shiftDatum = (delta) => {
    const [y, m, d] = datum.split('-').map(Number);
    const date = new Date(y, m - 1, d + delta);
    setDatum(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);
  };

  const companyId = Number(company) || 1;

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

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: activityLogsApi.upsert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-logs-day'] });
      qc.invalidateQueries({ queryKey: ['activity-logs-month'] });
      setModal(null);
    },
  });

  const saveInboundMut = useMutation({
    mutationFn: inboundDailyApi.upsert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inbound-daily-day'] });
      qc.invalidateQueries({ queryKey: ['inbound-daily-month'] });
      setInboundModal(false);
    },
  });

  // ── Computed ──────────────────────────────────────────────────────────────────
  const tracked = useMemo(() =>
    employees
      .filter(e => TRACKED_ROLES.includes(e.rolle))
      .filter(e => e.show_in_kpi !== 0)
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

  const monthLogs   = logsByMonth.data  || [];
  const monthDeals  = nkDeals.data      || [];
  const inboundData = inboundByMonth.data || [];

  const auswertungLogs = useMemo(() => {
    if (!standortFilter) return monthLogs;
    const empSet = new Set(employees.filter(e => e.standort === standortFilter).map(e => e.id));
    return monthLogs.filter(l => empSet.has(l.employee_id));
  }, [monthLogs, employees, standortFilter]);

  const perEmployee = useMemo(() => {
    const map = {};
    auswertungLogs.forEach(l => {
      if (!map[l.employee_id])
        map[l.employee_id] = { name: l.employee_name, rolle: l.employee_rolle, logs: [] };
      map[l.employee_id].logs.push(l);
    });
    return Object.values(map).sort((a, b) => a.name?.localeCompare(b.name));
  }, [auswertungLogs]);

  const inboundWeeks = useMemo(() => {
    const weeks = {};
    inboundData.forEach(l => {
      const d   = new Date(l.datum);
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
      const total      = v.mail + v.fax + v.ad;
      const terminiert = v.tmail + v.tfax + v.tad;
      return { week, ...v, total, terminiert, quote: total > 0 ? Math.round((terminiert/total)*100) : 0 };
    });
  }, [inboundData]);

  const sel = "bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5";

  const standorte = useMemo(() =>
    [...new Set(
      employees
        .filter(e => TRACKED_ROLES.includes(e.rolle) && e.show_in_kpi !== 0 && e.standort)
        .map(e => e.standort)
    )].sort()
  , [employees]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">KPI Mitarbeiter</h1>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">BETA</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Tägliches Sales-Tracking · Opener / Setter / Closer</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
            <button onClick={() => setTab('eingabe')}
              className={`px-3 py-1.5 font-medium transition-colors ${tab === 'eingabe'
                ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Dateneingabe
            </button>
            <button onClick={() => setTab('auswertung')}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-300 ${tab === 'auswertung'
                ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              KPI-Auswertung
            </button>
          </div>
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
                    className="px-2 py-1 bg-indigo-50 border border-indigo-300 text-indigo-600 text-xs rounded hover:bg-indigo-100 font-medium whitespace-nowrap">
                    Heute
                  </button>
                )}
              </div>
            : <input type="month" value={monat} onChange={e => setMonat(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5" />
          }
        </div>
      </div>

      {/* ── TAB: DATENEINGABE ──────────────────────────────────────────────────── */}
      {tab === 'eingabe' && (
        <div className="space-y-3">

          {/* Statusleiste */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              {new Date(datum).toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              {(logsByDay.data || []).length} von {tracked.length} Mitarbeiter-Einträge erfasst
            </span>
          </div>

          {/* Globaler Tages-Inbound */}
          <div className="rounded-lg border border-teal-200 bg-white overflow-hidden">
            <div className="px-3 py-2 bg-teal-700 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide">📬 Tages-Inbound (global)</span>
              <button
                onClick={() => setInboundModal(true)}
                className="text-xs text-teal-200 hover:text-white font-medium transition-colors">
                {currentInbound ? 'Bearbeiten' : '+ Eintragen'}
              </button>
            </div>
            <div className="px-4 py-3">
              {currentInbound ? (() => {
                const totalIn = (currentInbound.inbound_mail||0)+(currentInbound.inbound_fax||0)+(currentInbound.inbound_ad||0);
                const totalT  = (currentInbound.terminiert_mail||0)+(currentInbound.terminiert_fax||0)+(currentInbound.terminiert_ad||0);
                const quote   = totalIn > 0 ? Math.round((totalT/totalIn)*100) : 0;
                return (
                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <span className="text-gray-600">Mail: <b className="text-teal-700">{currentInbound.inbound_mail||0}</b></span>
                      <span className="text-gray-600">Fax: <b className="text-teal-700">{currentInbound.inbound_fax||0}</b></span>
                      <span className="text-gray-600">Ad: <b className="text-teal-700">{currentInbound.inbound_ad||0}</b></span>
                      <span className="font-bold text-teal-800">Gesamt: {totalIn}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-teal-600">
                      <span>Terminiert: <b>{totalT}</b></span>
                      <span>Quote: <b>{quote} %</b></span>
                    </div>
                  </div>
                );
              })() : (
                <p className="text-xs text-gray-400">Noch kein Eintrag für diesen Tag.</p>
              )}
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
                {tracked.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-400">Keine Mitarbeiter gefunden</td></tr>
                ) : tracked.map((emp, i) => {
                  const log      = dayMap[emp.id];
                  const hasEntry = !!log;
                  return (
                    <tr key={emp.id} className={`hover:bg-indigo-50 transition-colors ${i%2===0?'bg-white':'bg-gray-50'}`}>
                      <td className="px-3 py-2 font-medium text-gray-900">{emp.name}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          IS_OPENER(emp.rolle) && IS_CLOSER(emp.rolle) ? 'bg-purple-100 text-purple-700'
                          : IS_CLOSER(emp.rolle)                       ? 'bg-violet-100 text-violet-700'
                          :                                               'bg-indigo-100 text-indigo-700'
                        }`}>{emp.rolle}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_OPENER(emp.rolle) ? log.entscheider_erreicht   : '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_OPENER(emp.rolle) ? log.entscheider_terminiert : '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_OPENER(emp.rolle) ? log.settings_geplant        : '—'}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{hasEntry && IS_OPENER(emp.rolle) ? log.settings_stattgefunden : '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{hasEntry && IS_CLOSER(emp.rolle) ? log.beratungen_geplant      : '—'}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{hasEntry && IS_CLOSER(emp.rolle) ? log.beratungen_stattgefunden : '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {hasEntry
                          ? <span className="inline-flex items-center gap-1 text-green-700 text-[10px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Erfasst
                            </span>
                          : <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Offen
                            </span>
                        }
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setModal({ employee: emp, existing: log || null })}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">
                          {hasEntry ? 'Bearbeiten' : '+ Eintragen'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: AUSWERTUNG ───────────────────────────────────────────────────── */}
      {tab === 'auswertung' && (
        <div className="space-y-4">

          {/* KPI-Kategorien */}
          {monthLogs.length === 0 ? (
            <div className="rounded-lg border border-indigo-200 overflow-hidden">
              <div className="px-3 py-2 bg-indigo-700">
                <span className="text-xs font-bold text-white uppercase tracking-wide">KPI-Übersicht — {monat}</span>
              </div>
              <div className="px-4 py-6 text-sm text-gray-400 text-center bg-indigo-50">
                Noch keine Activity-Logs für {monat} erfasst.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Opening */}
              <div className="rounded-lg border border-indigo-200 overflow-hidden">
                <div className="px-3 py-2 bg-indigo-700">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">Opening — Entscheider</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-indigo-50">
                  <KpiCard color="indigo" label="Entscheider erreicht"   value={sum(auswertungLogs,'entscheider_erreicht')} />
                  <KpiCard color="indigo" label="Entscheider terminiert" value={sum(auswertungLogs,'entscheider_terminiert')} />
                  <KpiCard color="indigo" label="Entscheider → Termin"
                    value={pct(sum(auswertungLogs,'entscheider_terminiert'), sum(auswertungLogs,'entscheider_erreicht'))}
                    desc={`${sum(auswertungLogs,'entscheider_terminiert')} von ${sum(auswertungLogs,'entscheider_erreicht')}`} />
                </div>
              </div>
              {/* Terminierungen */}
              <div className="rounded-lg border border-teal-200 overflow-hidden">
                <div className="px-3 py-2 bg-teal-700">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">Terminierungen</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-teal-50">
                  <KpiCard color="teal"   label="Terminiert gesamt"
                    value={sum(auswertungLogs,'entscheider_terminiert')} />
                  <KpiCard color="indigo" label="Anteil Cold Calls"
                    value={pct(sum(auswertungLogs,'terminiert_cold_calls'), sum(auswertungLogs,'entscheider_terminiert'))}
                    desc={`${sum(auswertungLogs,'terminiert_cold_calls')} CC-Termine`} />
                  <KpiCard color="teal"   label="Anteil Inbound"
                    value={pct(sum(auswertungLogs,'terminiert_inbound'), sum(auswertungLogs,'entscheider_terminiert'))}
                    desc={`${sum(auswertungLogs,'terminiert_inbound')} Inbound-Termine`} />
                </div>
              </div>
              {/* Setting */}
              <div className="rounded-lg border border-violet-200 overflow-hidden">
                <div className="px-3 py-2 bg-violet-700">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">Setting</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-violet-50">
                  <KpiCard color="violet" label="Settings geplant"       value={sum(auswertungLogs,'settings_geplant')} />
                  <KpiCard color="violet" label="Settings stattgefunden" value={sum(auswertungLogs,'settings_stattgefunden')} />
                  <KpiCard color="violet" label="Show-Rate Settings"
                    value={pct(sum(auswertungLogs,'settings_stattgefunden'), sum(auswertungLogs,'settings_geplant'))}
                    desc={`${sum(auswertungLogs,'settings_stattgefunden')} von ${sum(auswertungLogs,'settings_geplant')}`} />
                  <KpiCard color="violet" label="Setting → Closing"
                    value={pct(sum(auswertungLogs,'beratungen_geplant'), sum(auswertungLogs,'settings_stattgefunden'))}
                    desc={`${sum(auswertungLogs,'beratungen_geplant')} Beratungen terminiert`} />
                </div>
              </div>
              {/* Beratungsgespräche / Closing */}
              <div className="rounded-lg border border-green-200 overflow-hidden">
                <div className="px-3 py-2 bg-green-700">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">Beratungsgespräche / Closing</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-green-50">
                  <KpiCard color="violet" label="Beratungen geplant"       value={sum(auswertungLogs,'beratungen_geplant')} />
                  <KpiCard color="violet" label="Beratungen stattgefunden" value={sum(auswertungLogs,'beratungen_stattgefunden')} />
                  <KpiCard color="violet" label="Show-Rate Closing"
                    value={pct(sum(auswertungLogs,'beratungen_stattgefunden'), sum(auswertungLogs,'beratungen_geplant'))}
                    desc={`${sum(auswertungLogs,'beratungen_stattgefunden')} von ${sum(auswertungLogs,'beratungen_geplant')}`} />
                  <KpiCard color="green"  label="Closing → Close"
                    value={pct(monthDeals.filter(d => d.status==='Gewonnen').length, sum(auswertungLogs,'beratungen_stattgefunden'))}
                    desc={`${monthDeals.filter(d => d.status==='Gewonnen').length} Deals gewonnen`} />
                </div>
              </div>
            </div>
          )}

          {/* Pro-Mitarbeiter Tabelle */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 bg-[#2d2e30] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Zahlen gesamt — {monat}</span>
              <span className="text-xs text-gray-400">{auswertungLogs.length} Einträge</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <th className="px-3 py-2 text-left">Mitarbeiter</th>
                    <th className="px-3 py-2 text-left">Rolle</th>
                    <th className="px-3 py-2 text-right">Err.</th>
                    <th className="px-3 py-2 text-right">Term.</th>
                    <th className="px-3 py-2 text-right">Set. gepl.</th>
                    <th className="px-3 py-2 text-right">Set. stattg.</th>
                    <th className="px-3 py-2 text-right">Ber. gepl.</th>
                    <th className="px-3 py-2 text-right">Ber. stattg.</th>
                    <th className="px-3 py-2 text-right">Show-R. Set.</th>
                    <th className="px-3 py-2 text-right">Set.→Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {perEmployee.length === 0 ? (
                    <tr><td colSpan={10} className="px-3 py-4 text-center text-gray-400">Keine Daten</td></tr>
                  ) : perEmployee.map((ep, i) => {
                    const ls       = ep.logs;
                    const empDeals = monthDeals.filter(d =>
                      d.status === 'Gewonnen' &&
                      (d.closer_name === ep.name || d.setter_name === ep.name)
                    );
                    return (
                      <tr key={ep.name} className={`hover:bg-gray-50 ${i%2===0?'bg-white':'bg-gray-50'}`}>
                        <td className="px-3 py-2 font-medium text-gray-900">{ep.name}</td>
                        <td className="px-3 py-2 text-gray-500">{ep.rolle}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{sum(ls,'entscheider_erreicht')}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{sum(ls,'entscheider_terminiert')}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{sum(ls,'settings_geplant')}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{sum(ls,'settings_stattgefunden')}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{sum(ls,'beratungen_geplant')}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{sum(ls,'beratungen_stattgefunden')}</td>
                        <td className="px-3 py-2 text-right text-indigo-700 font-medium">
                          {pct(sum(ls,'settings_stattgefunden'), sum(ls,'settings_geplant'))}
                        </td>
                        <td className="px-3 py-2 text-right text-green-700 font-medium">
                          {pct(empDeals.length, sum(ls,'settings_stattgefunden'))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {perEmployee.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#2d2e30] text-white font-bold text-xs">
                      <td className="px-3 py-2" colSpan={2}>Gesamt</td>
                      <td className="px-3 py-2 text-right">{sum(auswertungLogs,'entscheider_erreicht')}</td>
                      <td className="px-3 py-2 text-right">{sum(auswertungLogs,'entscheider_terminiert')}</td>
                      <td className="px-3 py-2 text-right">{sum(auswertungLogs,'settings_geplant')}</td>
                      <td className="px-3 py-2 text-right">{sum(auswertungLogs,'settings_stattgefunden')}</td>
                      <td className="px-3 py-2 text-right">{sum(auswertungLogs,'beratungen_geplant')}</td>
                      <td className="px-3 py-2 text-right">{sum(auswertungLogs,'beratungen_stattgefunden')}</td>
                      <td className="px-3 py-2 text-right">
                        {pct(sum(auswertungLogs,'settings_stattgefunden'), sum(auswertungLogs,'settings_geplant'))}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {pct(monthDeals.filter(d=>d.status==='Gewonnen').length, sum(auswertungLogs,'settings_stattgefunden'))}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Inbound Wochenübersicht */}
          <div className="rounded-lg border border-teal-200 overflow-hidden">
            <div className="px-3 py-2 bg-teal-700">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Inbound nach Quelle — {monat}</span>
            </div>
            {inboundWeeks.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-400 bg-teal-50 text-center">
                Keine Inbound-Daten für {monat}
              </div>
            ) : (
              <table className="w-full text-xs">
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
                    <tr key={w.week} className={i%2===0?'bg-white':'bg-teal-50'}>
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
                    const totalIn = sum(inboundData,'inbound_mail')+sum(inboundData,'inbound_fax')+sum(inboundData,'inbound_ad');
                    const totalT  = sum(inboundData,'terminiert_mail')+sum(inboundData,'terminiert_fax')+sum(inboundData,'terminiert_ad');
                    const quote   = totalIn > 0 ? Math.round((totalT/totalIn)*100) : 0;
                    return (
                      <tr className="bg-teal-700 text-white font-bold text-xs">
                        <td className="px-3 py-2">Gesamt</td>
                        <td className="px-3 py-2 text-right">{sum(inboundData,'inbound_mail')}</td>
                        <td className="px-3 py-2 text-right">{sum(inboundData,'inbound_fax')}</td>
                        <td className="px-3 py-2 text-right">{sum(inboundData,'inbound_ad')}</td>
                        <td className="px-3 py-2 text-right">{totalIn}</td>
                        <td className="px-3 py-2 text-right">{totalT}</td>
                        <td className="px-3 py-2 text-right">{quote} %</td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ActivityModal */}
      {modal && (
        <ActivityModal
          employee={modal.employee}
          datum={datum}
          existing={modal.existing}
          companyId={companyId}
          onSave={data => saveMut.mutate(data)}
          onClose={() => { setModal(null); saveMut.reset(); }}
          isPending={saveMut.isPending}
          isError={saveMut.isError}
          error={errMsg(saveMut)}
        />
      )}

      {/* InboundModal */}
      {inboundModal && (
        <InboundModal
          datum={datum}
          existing={currentInbound}
          companyId={companyId}
          onSave={data => saveInboundMut.mutate(data)}
          onClose={() => { setInboundModal(false); saveInboundMut.reset(); }}
          isPending={saveInboundMut.isPending}
          isError={saveInboundMut.isError}
          error={errMsg(saveInboundMut)}
        />
      )}
    </div>
  );
}
