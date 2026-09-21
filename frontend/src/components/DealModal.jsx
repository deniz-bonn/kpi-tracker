import { useState } from 'react';

/**
 * @param fehler  Fehlertext vom Aufrufer (z. B. abgelehnter Speicherversuch). Wird als Banner
 *                ueber den Feldern gezeigt und der Dialog bleibt offen — ohne das quittierte
 *                ein fehlgeschlagener Speicherversuch mit stillem Nichtstun.
 * @param busy    Speichern laeuft: Knopf sperren, damit kein zweiter Deal durch Doppelklick
 *                entsteht.
 */
export default function DealModal({ title, fields, initial = {}, onSave, onClose, fehler = null, busy = false }) {
  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});

  // Set a field value, then run autoFill for all other fields that depend on this change.
  // Ein Feld kann `onBeforeChange(nextValue, form)` deklarieren und mit `false` abbrechen —
  // gebraucht fuer Rueckfragen, bevor abhaengige Felder geleert werden.
  const set = (k, v) => {
    const feld = fields.find(f => f.name === k);
    if (typeof feld?.onBeforeChange === 'function' && feld.onBeforeChange(v, form) === false) return;
    setForm(prev => {
      const next = { ...prev, [k]: v };

      // Run autoFill on every field that declares it
      fields.forEach(f => {
        if (f.name !== k && typeof f.autoFill === 'function') {
          const filled = f.autoFill(next, k);
          if (filled !== undefined) next[f.name] = filled;
        }
      });

      return next;
    });
  };

  const isVisible  = (f) => typeof f.show === 'function' ? f.show(form) : true;
  const isRequired = (f) => typeof f.required === 'function' ? f.required(form) : !!f.required;

  const [fehlendeFelder, setFehlendeFelder] = useState([]);

  const handleSave = () => {
    const errs = {};
    const fehlen = [];
    fields.forEach(f => {
      if (!isVisible(f)) return; // skip hidden fields
      if (isRequired(f) && !form[f.name] && form[f.name] !== 0) {
        errs[f.name] = true;
        fehlen.push(f.label);
      }
    });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Die roten Rahmen allein reichen nicht: bei einem langen Formular steht das fehlende Feld
      // oft unterhalb des sichtbaren Bereichs, und der Klick auf Speichern sieht aus, als taete
      // er nichts. Deshalb zusaetzlich eine Liste oben, wo der Knopf-Klick hinsieht.
      setFehlendeFelder(fehlen);
      return;
    }
    setFehlendeFelder([]);
    // Geleerte Zahlen- und Datumsfelder als null schicken, nicht als leeren String.
    //
    // Ein geleertes Eingabefeld liefert im Browser '' — Postgres lehnt das fuer NUMERIC, INTEGER
    // und DATE ab und die Route antwortet mit 500. Unter SQLite faellt es nicht auf, der Fehler
    // trat also nur in Produktion auf: einen Betrag ueberschreiben ging, ihn LEEREN nicht.
    const bereinigt = { ...form };
    for (const f of fields) {
      if ((f.type === 'number' || f.type === 'date') && bereinigt[f.name] === '') bereinigt[f.name] = null;
    }
    onSave(bereinigt);
  };

  const visibleFields = fields.filter(isVisible);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70">
      <div className="bg-white border border-gray-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg sm:mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {fehler && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
              <b>Nicht gespeichert.</b> {fehler}
            </div>
          )}
          {fehlendeFelder.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <b>Nicht gespeichert.</b> Bitte ausfüllen: {fehlendeFelder.join(' · ')}
            </div>
          )}
          {visibleFields.map(f => {
            const req    = isRequired(f);
            const hasErr = errors[f.name];
            const base   = `w-full bg-white border text-gray-700 text-sm rounded px-3 py-1.5 ${hasErr ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;
            return (
              <div key={f.name}>
                <label className="block text-xs text-gray-600 mb-1">
                  {f.label}
                  {req && <span className="text-red-500 ml-0.5">*</span>}
                  {f.readOnly && <span className="ml-1 text-gray-400 font-normal">(nicht änderbar)</span>}
                </label>
                {f.readOnly ? (
                  <div className="w-full bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded px-3 py-1.5">
                    {form[f.name] ? String(form[f.name]).slice(0, 10) : <span className="italic text-gray-400">—</span>}
                  </div>
                ) : f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                    <input
                      type="checkbox"
                      checked={!!Number(form[f.name]) || form[f.name] === true}
                      onChange={e => { set(f.name, e.target.checked ? 1 : 0); setErrors(er => ({ ...er, [f.name]: false })); }}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{f.checkboxText ?? 'Ja'}</span>
                  </label>
                ) : f.type === 'select' ? (
                  <select
                    value={form[f.name] ?? ''}
                    onChange={e => { set(f.name, e.target.value); setErrors(er => ({ ...er, [f.name]: false })); }}
                    className={base}
                  >
                    <option value="">— wählen —</option>
                    {f.options.map(o => (
                      <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.name] ?? ''}
                    onChange={e => set(f.name, e.target.value)}
                    rows={2}
                    className={base + ' resize-none'}
                  />
                ) : (
                  <input
                    type={f.type ?? 'text'}
                    value={f.type === 'date' ? (form[f.name] ?? '').slice(0, 10) : (form[f.name] ?? '')}
                    onChange={e => { set(f.name, e.target.value); setErrors(er => ({ ...er, [f.name]: false })); }}
                    className={base}
                  />
                )}
                {hasErr && <p className="text-xs text-red-500 mt-0.5">Pflichtfeld</p>}
                {f.hint && <p className="text-xs text-gray-400 mt-0.5">{f.hint}</p>}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-800">Abbrechen</button>
          <button onClick={handleSave} disabled={busy}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded">
            {busy ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
