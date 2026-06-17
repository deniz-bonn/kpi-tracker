import { useState, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi, employeesApi, upsaleDealsApi } from '../utils/api';
import DealModal from '../components/DealModal';
import { formatEuro } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const UPSALE_STATUS = ['Offen', 'In Verhandlung', 'Abgelehnt', 'Gewonnen'];
const AUTO_VL_OPTS  = ['Ja', 'Nein'];

const STATUS_COLORS = {
  'Offen':          'bg-gray-100 text-gray-600',
  'In Verhandlung': 'bg-blue-100 text-blue-700',
  'Abgelehnt':      'bg-red-100 text-red-600',
  'Gewonnen':       'bg-emerald-100 text-emerald-700',
};

const UPSALE_FIELDS = [
  { name: 'angebotsdatum',        label: 'Angebotsdatum',             type: 'date',   required: true },
  { name: 'angebotsvolumen',      label: 'Angebotsvolumen (€)',        type: 'number', required: true },
  { name: 'status',               label: 'Status',                    type: 'select', options: UPSALE_STATUS, required: true },
  { name: 'angenommenes_volumen', label: 'Angenommenes Volumen (€)',   type: 'number', show: f => f.status === 'Gewonnen', required: f => f.status === 'Gewonnen' },
  { name: 'auto_verlaengerung',   label: 'Automatische Verlängerung', type: 'select', options: AUTO_VL_OPTS,  show: f => f.status === 'Gewonnen', required: f => f.status === 'Gewonnen' },
  { name: 'laufzeit_monate',      label: 'Laufzeit (Monate)',          type: 'number', show: f => f.status === 'Gewonnen', required: f => f.status === 'Gewonnen' },
  { name: 'kommentar',            label: 'Kommentar',                  type: 'textarea' },
];

// ── CSV helpers ───────────────────────────────────────────────────────────────
function parseCSVRow(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
    else cur += c;
  }
  result.push(cur);
  return result.map(s => s.trim().replace(/^"|"$/g, ''));
}

const CSV_HEADERS = ['id','Kunde','Company','Account Manager','Gekündigt am','Auslaufend am','Ansprechpartner kundenseitig','Telefon','E-Mail'];
const CSV_FIELD_MAP = {
  'Gekündigt am':               'gekuendigt_am',
  'Auslaufend am':              'auslaufend_am',
  'Ansprechpartner kundenseitig': 'ansprechpartner',
  'Telefon':                    'telefon',
  'E-Mail':                     'email_kontakt',
};

// ── Month navigation helpers ──────────────────────────────────────────────────
function addMonths(ym, n) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtMonth(ym) {
  const [y, m] = ym.split('-');
  const names = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  return `${names[Number(m) - 1]} ${y}`;
}

// Returns the current month as YYYY-MM
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Kuendigungen() {
  const { company } = useOutletContext();
  const { canSeeAll } = useAuth();
  const qc = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [terminiertLocal, setTerminiertLocal] = useState({}); // optimistic local state per row id
  const [filterKam,    setFilterKam]    = useState('');
  const [filterDeals,  setFilterDeals]  = useState('');
  const [sortBy,       setSortBy]       = useState('ablauf_asc');
  const [dealModal,    setDealModal]    = useState(null);

  // Inline editing state
  const [editingCell,  setEditingCell]  = useState(null);
  const [cellValue,    setCellValue]    = useState('');
  const [importResult, setImportResult] = useState(null);
  const importFileRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Fetch all Verloren + weitergeben=Ja deals (no month filter — we filter client-side by auslaufend_am)
  const vlParams = { status: 'Verloren', ...(company && { company_id: company }) };

  const { data: deals = [], isLoading } = useQuery({
    queryKey:       ['deals-vl-kuendigungen', vlParams],
    queryFn:        () => dealsApi.vl.list(vlParams),
    staleTime:      0,
    refetchOnMount: 'always',
  });

  const upsaleParams = company ? { company_id: company } : {};
  const { data: upsaleDeals = [] } = useQuery({
    queryKey:       ['upsale-deals', upsaleParams],
    queryFn:        () => upsaleDealsApi.list(upsaleParams),
    staleTime:      0,
    refetchOnMount: 'always',
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn:  () => employeesApi.list(),
  });

  const kamList = employees.filter(e => e.rolle === 'KAM');

  // Options for "Neuer Ansprechpartner": Vertrieb + all KAMs
  const neuerApOptions = useMemo(() => [
    { value: 'Vertrieb', label: 'Vertrieb' },
    ...kamList.map(e => ({ value: String(e.id), label: e.name })),
  ], [kamList]);

  const getNeuerApLabel = (val) => {
    if (!val) return null;
    if (val === 'Vertrieb') return 'Vertrieb';
    const emp = kamList.find(e => String(e.id) === val);
    return emp ? emp.name : val;
  };

  const upsaleByVlId = useMemo(() => {
    const map = {};
    upsaleDeals.forEach(u => {
      if (!map[u.deals_vl_id]) map[u.deals_vl_id] = [];
      map[u.deals_vl_id].push(u);
    });
    return map;
  }, [upsaleDeals]);

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['deals-vl-kuendigungen'] });
    qc.invalidateQueries({ queryKey: ['upsale-deals'] });
  };

  const patchKontaktMut = useMutation({
    mutationFn: ({ id, data }) => dealsApi.vl.patchKontakt(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['deals-vl-kuendigungen'] }),
  });

const createDealMut = useMutation({
    mutationFn: (data)         => upsaleDealsApi.create(data),
    onSuccess:  () => { invalidateAll(); setDealModal(null); },
  });

  const updateDealMut = useMutation({
    mutationFn: ({ id, data }) => upsaleDealsApi.update(id, data),
    onSuccess:  () => { invalidateAll(); setDealModal(null); },
  });

  const deleteDealMut = useMutation({
    mutationFn: (id)           => upsaleDealsApi.delete(id),
    onSuccess:  () => invalidateAll(),
  });

  const importMut = useMutation({
    mutationFn: (rows) => dealsApi.vl.importKontakt(rows),
    onSuccess:  (result) => {
      setImportResult(result);
      qc.invalidateQueries({ queryKey: ['deals-vl-kuendigungen'] });
    },
  });

  // ── Inline editing ────────────────────────────────────────────────────────────
  const commitEdit = () => {
    if (!editingCell) return;
    patchKontaktMut.mutate({ id: editingCell.id, data: { [editingCell.field]: cellValue || null } });
    setEditingCell(null);
  };

  const handleCellKey = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') setEditingCell(null);
  };

  // ── CSV Export ────────────────────────────────────────────────────────────────
  const exportCsv = () => {
    const rows = sorted.map(d => [
      d.id,
      d.kunde || '',
      d.company_name || '',
      d.kam_name || '',
      (d.gekuendigt_am || d.datum || '').slice(0, 10),
      (d.auslaufend_am || '').slice(0, 10),
      d.ansprechpartner || '',
      d.telefon || '',
      d.email_kontakt || '',
    ]);
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [CSV_HEADERS, ...rows].map(row => row.map(escape).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `kuendigungen_${showAllMonths ? 'gesamt' : selectedMonth}_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── CSV Import ────────────────────────────────────────────────────────────────
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text  = (ev.target.result || '').replace(/^﻿/, '').replace(/\r/g, '');
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { alert('Keine Daten in der Datei gefunden.'); return; }
      const headers = parseCSVRow(lines[0]);
      const idIdx   = headers.indexOf('id');
      if (idIdx === -1) { alert('Spalte "id" fehlt – bitte die exportierte Vorlage verwenden.'); return; }
      const updates = lines.slice(1).map(line => {
        const cells = parseCSVRow(line);
        if (!cells[idIdx]) return null;
        const row = { id: Number(cells[idIdx]) };
        Object.entries(CSV_FIELD_MAP).forEach(([label, field]) => {
          const idx = headers.indexOf(label);
          if (idx >= 0) row[field] = cells[idx] || null;
        });
        return row;
      }).filter(Boolean);
      if (updates.length === 0) { alert('Keine gültigen Zeilen gefunden.'); return; }
      if (!confirm(`${updates.length} Datensätze importieren und überschreiben?`)) return;
      importMut.mutate(updates);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // ── Inline-editable text/date cell ───────────────────────────────────────────
  const renderEditCell = (d, field, type = 'text', placeholder = '—', initValue = undefined) => {
    const isEditing  = editingCell?.id === d.id && editingCell?.field === field;
    const raw        = d[field];
    const displayVal = raw || initValue || null;

    return (
      <td
        key={field}
        onClick={() => {
          if (isEditing) return;
          setEditingCell({ id: d.id, field });
          setCellValue(raw || initValue || '');
        }}
        className={`px-3 py-2 whitespace-nowrap ${isEditing ? '' : 'cursor-pointer hover:bg-orange-50 group'}`}
      >
        {isEditing ? (
          <input
            autoFocus
            type={type}
            value={cellValue}
            onChange={e => setCellValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleCellKey}
            className="w-full min-w-[110px] text-xs text-gray-900 border border-orange-400 rounded px-1.5 py-1 focus:outline-none bg-white"
          />
        ) : displayVal ? (
          <span className="text-gray-900 text-xs">
            {type === 'date' ? displayVal.slice(0, 10) : displayVal}
          </span>
        ) : (
          <span className="text-gray-300 text-xs italic group-hover:text-orange-400">{placeholder}</span>
        )}
      </td>
    );
  };

  // ── Always-visible compact dropdown cell (single click to select & save) ────
  const renderDropdownCell = (d, field, options) => (
    <td key={field} className="px-2 py-1.5 whitespace-nowrap">
      <select
        value={d[field] || ''}
        onChange={e => {
          const val = e.target.value || null;
          patchKontaktMut.mutate({ id: d.id, data: { [field]: val } });
        }}
        className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-900 hover:border-orange-400 focus:border-orange-400 focus:outline-none cursor-pointer max-w-[130px]"
      >
        <option value="">— Zuweisen —</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </td>
  );

  // Separate mutation for terminiert so we can handle onError independently
  const patchTerminiertMut = useMutation({
    mutationFn: ({ id, terminiert }) => dealsApi.vl.patchKontakt(id, { terminiert }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['deals-vl-kuendigungen'] }),
    onError:    (_err, vars) => {
      // Revert local optimistic state on failure
      setTerminiertLocal(prev => { const next = { ...prev }; delete next[vars.id]; return next; });
    },
  });

  const renderTerminiertCell = (d) => {
    const val = Object.prototype.hasOwnProperty.call(terminiertLocal, d.id)
      ? terminiertLocal[d.id]
      : !!d.terminiert;

    return (
      <td key="terminiert" className="px-2 py-1.5 text-center">
        <button
          type="button"
          onClick={() => {
            const newVal = !val;
            setTerminiertLocal(prev => ({ ...prev, [d.id]: newVal }));
            patchTerminiertMut.mutate({ id: d.id, terminiert: newVal ? 1 : 0 });
          }}
          className={`text-xs px-2 py-1 rounded border font-medium transition-colors min-w-[46px] ${
            val
              ? 'bg-green-100 border-green-400 text-green-700 hover:bg-green-200'
              : 'bg-white border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-600'
          }`}
        >
          {val ? 'Ja ✓' : 'Nein'}
        </button>
      </td>
    );
  };

  // ── Deal modal helpers ────────────────────────────────────────────────────────
  const openNewDeal = (vlDeal) => {
    setDealModal({ mode: 'create', vlDealId: vlDeal.id, vlLabel: vlDeal.kunde, data: { status: 'Offen', angebotsdatum: today } });
  };

  const openEditDeal = (upsaleDeal, vlKunde) => {
    setDealModal({ mode: 'edit', vlLabel: vlKunde, data: upsaleDeal });
  };

  const handleDealSave = (form) => {
    if (dealModal.mode === 'create') {
      createDealMut.mutate({ ...form, deals_vl_id: dealModal.vlDealId });
    } else {
      updateDealMut.mutate({ id: dealModal.data.id, data: form });
    }
  };

  // ── Filter & sort ─────────────────────────────────────────────────────────────
  // Only show deals explicitly passed to Vertrieb (Nein = stays in VL, doesn't appear here)
  const weitergegeben = useMemo(() =>
    deals.filter(d => d.weitergeben_an_vertrieb === 'Ja'),
    [deals]
  );

  // Monthly filter: by auslaufend_am month (or no filter when showAllMonths)
  const monthFiltered = useMemo(() => {
    if (showAllMonths) return weitergegeben;
    return weitergegeben.filter(d => {
      const ablauf = d.auslaufend_am?.slice(0, 7);
      return ablauf === selectedMonth;
    });
  }, [weitergegeben, showAllMonths, selectedMonth]);

  const filtered = useMemo(() => monthFiltered.filter(d => {
    if (filterKam && String(d.kam_id) !== filterKam) return false;
    if (filterDeals === '_mit_deal'  && (upsaleByVlId[d.id] || []).length === 0) return false;
    if (filterDeals === '_ohne_deal' && (upsaleByVlId[d.id] || []).length > 0)   return false;
    return true;
  }), [monthFiltered, filterKam, filterDeals, upsaleByVlId]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const getKuendigt = d => (d.gekuendigt_am || d.datum || '').slice(0, 10);
    switch (sortBy) {
      case 'datum_desc':  arr.sort((a, b) => getKuendigt(b).localeCompare(getKuendigt(a))); break;
      case 'datum_asc':   arr.sort((a, b) => getKuendigt(a).localeCompare(getKuendigt(b))); break;
      case 'ablauf_asc':
        arr.sort((a, b) => {
          const da = a.auslaufend_am?.slice(0, 10) || null;
          const db = b.auslaufend_am?.slice(0, 10) || null;
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da.localeCompare(db);
        });
        break;
      case 'ablauf_desc':
        arr.sort((a, b) => {
          const da = a.auslaufend_am?.slice(0, 10) || null;
          const db = b.auslaufend_am?.slice(0, 10) || null;
          if (!da && !db) return 0;
          if (!da) return -1;
          if (!db) return 1;
          return db.localeCompare(da);
        });
        break;
      case 'alpha_asc':  arr.sort((a, b) => (a.kunde || '').localeCompare(b.kunde || '')); break;
      case 'alpha_desc': arr.sort((a, b) => (b.kunde || '').localeCompare(a.kunde || '')); break;
      default: break;
    }
    return arr;
  }, [filtered, sortBy]);

  // ── KPIs ──────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = filtered.length;
    const terminiert_n = filtered.filter(d => d.terminiert).length;
    const withDeal = filtered.filter(d => (upsaleByVlId[d.id] || []).length > 0);
    const angebote_n = withDeal.length;
    const allUpsale = filtered.flatMap(d => upsaleByVlId[d.id] || []);
    const allAngeboteEuro = allUpsale.reduce((s, u) => s + (Number(u.angebotsvolumen) || 0), 0);
    const gewonnenDeals = allUpsale.filter(u => u.status === 'Gewonnen');
    const angenommen_n = filtered.filter(d => (upsaleByVlId[d.id] || []).some(u => u.status === 'Gewonnen')).length;
    const angenommen_euro = gewonnenDeals.reduce((s, u) => s + (Number(u.angenommenes_volumen) || 0), 0);

    const pct = (n, base) => base > 0 ? (n / base * 100).toFixed(1) : '0.0';

    return {
      total,
      terminiert_n,
      terminiert_pct: pct(terminiert_n, total),
      angebote_n,
      angebote_pct:   pct(angebote_n, total),
      angenommen_n,
      angenommen_pct: pct(angenommen_n, total),
      angenommen_euro,
      angebote_euro_pct: allAngeboteEuro > 0 ? pct(angenommen_euro, allAngeboteEuro) : '0.0',
    };
  }, [filtered, upsaleByVlId]);

  const sel = 'bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1.5';
  const hasF = filterKam || filterDeals;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kündigungen — Up-Sale Potenzial</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {showAllMonths ? 'Alle Monate' : fmtMonth(selectedMonth)} · {kpis.total} Potenziale · {kpis.terminiert_n} terminiert · {kpis.angebote_n} mit Angebot · {kpis.angenommen_n} angenommen
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCsv}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:border-gray-400 text-gray-600 rounded">
            ↓ CSV exportieren
          </button>
          <button onClick={() => importFileRef.current?.click()} disabled={importMut.isPending}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:border-gray-400 text-gray-600 rounded disabled:opacity-50">
            ↑ {importMut.isPending ? 'Importiere...' : 'CSV importieren'}
          </button>
          <input ref={importFileRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {/* Import result banner */}
      {importResult && (
        <div className={`rounded-lg border px-4 py-2.5 text-xs flex items-center justify-between ${
          importResult.errors?.length > 0
            ? 'border-amber-300 bg-amber-50 text-amber-700'
            : 'border-green-300 bg-green-50 text-green-700'
        }`}>
          <span>
            {importResult.updated} Datensätze erfolgreich aktualisiert
            {importResult.errors?.length > 0 && ` · ${importResult.errors.length} Fehler: ${importResult.errors.join(', ')}`}
          </span>
          <button onClick={() => setImportResult(null)} className="ml-4 text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showAllMonths} onChange={e => setShowAllMonths(e.target.checked)} className="accent-orange-500" />
          Alle Monate anzeigen
        </label>
        {!showAllMonths && (
          <div className="flex items-center gap-1">
            <button onClick={() => setSelectedMonth(m => addMonths(m, -1))}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50">
              ‹
            </button>
            <span className="px-3 py-1 text-sm font-semibold text-gray-700 border border-orange-300 bg-orange-50 rounded min-w-[90px] text-center">
              {fmtMonth(selectedMonth)}
            </span>
            <button onClick={() => setSelectedMonth(m => addMonths(m, 1))}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50">
              ›
            </button>
            <button onClick={() => setSelectedMonth(currentMonth())}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 ml-1">
              Heute
            </button>
          </div>
        )}
      </div>

      {/* Filter + Sort bar */}
      <div className="flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <span className="text-xs text-gray-500 mr-1">Filter:</span>

        {canSeeAll && (
          <select value={filterKam} onChange={e => setFilterKam(e.target.value)} className={sel}>
            <option value="">Alle Account Manager</option>
            {kamList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}

        <select value={filterDeals} onChange={e => setFilterDeals(e.target.value)} className={sel}>
          <option value="">Angebot: Alle</option>
          <option value="_mit_deal">Mit Angebot</option>
          <option value="_ohne_deal">Noch kein Angebot</option>
        </select>

        <span className="text-xs text-gray-400 mx-1">|</span>
        <span className="text-xs text-gray-500">Sortierung:</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={sel}>
          <option value="ablauf_asc">Auslaufdatum aufsteigend</option>
          <option value="ablauf_desc">Auslaufdatum absteigend</option>
          <option value="datum_desc">Neueste Kündigung zuerst</option>
          <option value="datum_asc">Älteste Kündigung zuerst</option>
          <option value="alpha_asc">Alphabetisch A → Z</option>
          <option value="alpha_desc">Alphabetisch Z → A</option>
        </select>

        {hasF && (
          <button onClick={() => { setFilterKam(''); setFilterDeals(''); }}
            className="text-xs text-gray-500 hover:text-red-500 ml-1">
            ✕ Zurücksetzen
          </button>
        )}
      </div>

      {/* KPI Block */}
      <div className="rounded-lg border border-orange-300 overflow-hidden">
        <div className="px-3 py-2 bg-orange-700">
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            Up-Sale KPIs {showAllMonths ? '(Gesamt)' : `— ${fmtMonth(selectedMonth)}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 px-4 py-3 bg-orange-50">
          <div className="text-xs min-w-[80px]">
            <div className="text-orange-600 mb-0.5">Soll-Potenzial</div>
            <div className="font-bold text-gray-900 text-lg">{kpis.total}</div>
          </div>
          <div className="text-xs min-w-[80px]">
            <div className="text-orange-600 mb-0.5">Terminiert</div>
            <div className="font-bold text-gray-900 text-lg">{kpis.terminiert_n}</div>
            <div className="text-gray-500">{kpis.terminiert_pct}% von Soll</div>
          </div>
          <div className="text-xs min-w-[80px]">
            <div className="text-orange-600 mb-0.5">Angebot</div>
            <div className="font-bold text-gray-900 text-lg">{kpis.angebote_n}</div>
            <div className="text-gray-500">{kpis.angebote_pct}% von Soll</div>
          </div>
          <div className="text-xs min-w-[80px]">
            <div className="text-orange-600 mb-0.5">Angenommen (Anz.)</div>
            <div className="font-bold text-gray-900 text-lg">{kpis.angenommen_n}</div>
            <div className="text-gray-500">{kpis.angenommen_pct}% von Soll</div>
          </div>
          <div className="text-xs min-w-[120px]">
            <div className="text-orange-600 mb-0.5">Angenommen (€)</div>
            <div className="font-bold text-gray-900 text-lg">{formatEuro(kpis.angenommen_euro)}</div>
            <div className="text-gray-500">{kpis.angebote_euro_pct}% des angebotenen Volumens</div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 italic">
        Tipp: Felder direkt in der Tabelle anklicken zum Bearbeiten. Terminiert-Haken setzt den Gesprächsstatus.
      </p>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#2d2e30] text-gray-300 text-xs uppercase">
            <tr>
              {['Kunde','Gekündigt am','Auslaufend am','Account Manager','Verantwortlicher','Term.','Ansprechpartner kundenseitig','Telefon','E-Mail','Angebote',''].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={11} className="text-center py-8 text-gray-400">Lade...</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-8 text-gray-400">
                {showAllMonths
                  ? 'Keine weitergegebe Kündigungen vorhanden'
                  : `Keine Kündigungen die im ${fmtMonth(selectedMonth)} auslaufen`}
              </td></tr>
            ) : sorted.map(d => {
              const myDeals  = upsaleByVlId[d.id] || [];
              const ablauf   = d.auslaufend_am?.slice(0, 10) || null;
              const expired  = ablauf && ablauf < today;

              return (
                <tr key={d.id} className={`hover:bg-gray-50/40 ${expired ? 'opacity-70' : ''}`}>
                  {/* Kunde */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-gray-900 font-medium text-xs">{d.kunde}</span>
                    {expired && (
                      <span className="ml-1.5 text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-600">Ausgelaufen</span>
                    )}
                    <div className="text-[10px] text-gray-400">{d.company_name || ''}</div>
                  </td>

                  {/* Gekündigt am — falls back to datum */}
                  {renderEditCell(d, 'gekuendigt_am', 'date', '—', d.datum?.slice(0, 10))}
                  {/* Auslaufend am */}
                  {renderEditCell(d, 'auslaufend_am', 'date', '—')}

                  {/* Account Manager */}
                  <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{d.kam_name || '—'}</td>

                  {/* Neuer Ansprechpartner intern */}
                  {renderDropdownCell(d, 'neuer_ap_intern', neuerApOptions, 'Zuweisen...')}

                  {/* Terminiert */}
                  {renderTerminiertCell(d)}

                  {/* Ansprechpartner kundenseitig */}
                  {renderEditCell(d, 'ansprechpartner', 'text', 'Ansprechpartner...')}
                  {renderEditCell(d, 'telefon',         'text', 'Telefon...')}
                  {renderEditCell(d, 'email_kontakt',   'text', 'E-Mail...')}

                  {/* Deal badges */}
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1 items-center min-w-[100px]">
                      {myDeals.map(u => (
                        <div key={u.id} className="flex items-center">
                          <button
                            onClick={() => openEditDeal(u, d.kunde)}
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-l border-r border-black/10 cursor-pointer ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-600'}`}
                            title={`${u.angebotsdatum?.slice(0,10) || '—'} · ${formatEuro(u.angebotsvolumen)}`}
                          >
                            {u.status}
                          </button>
                          <button
                            onClick={() => { if (confirm('Angebot löschen?')) deleteDealMut.mutate(u.id); }}
                            className={`text-[10px] px-1 py-0.5 rounded-r cursor-pointer ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-500'} hover:bg-red-100 hover:text-red-600`}
                            title="Löschen"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Add Deal */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={() => openNewDeal(d)}
                      className="text-xs text-orange-600 hover:text-orange-800 border border-orange-200 rounded px-2 py-0.5 hover:bg-orange-50 whitespace-nowrap">
                      + Deal
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Deal Modal */}
      {dealModal && (
        <DealModal
          title={dealModal.mode === 'create'
            ? `Neues Angebot — ${dealModal.vlLabel}`
            : `Angebot bearbeiten — ${dealModal.vlLabel}`}
          fields={UPSALE_FIELDS}
          initial={dealModal.data}
          onSave={handleDealSave}
          onClose={() => setDealModal(null)}
        />
      )}
    </div>
  );
}
