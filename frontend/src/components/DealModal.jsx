import { useState, useEffect } from 'react';

export default function DealModal({ title, fields, initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => { setForm(initial); setErrors({}); }, [initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isRequired = (f) => typeof f.required === 'function' ? f.required(form) : !!f.required;

  const handleSave = () => {
    const errs = {};
    fields.forEach(f => {
      if (isRequired(f) && !form[f.name] && form[f.name] !== 0) {
        errs[f.name] = true;
      }
    });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70">
      <div className="bg-white border border-gray-200 rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg sm:mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {fields.map(f => {
            const req = isRequired(f);
            const hasErr = errors[f.name];
            const base = `w-full bg-white border text-gray-700 text-sm rounded px-3 py-1.5 ${hasErr ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;
            return (
              <div key={f.name}>
                <label className="block text-xs text-gray-600 mb-1">
                  {f.label}
                  {req && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {f.type === 'select' ? (
                  <select value={form[f.name] ?? ''} onChange={e => { set(f.name, e.target.value); setErrors(er => ({ ...er, [f.name]: false })); }} className={base}>
                    <option value="">— wählen —</option>
                    {f.options.map(o => (
                      <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={form[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} rows={2} className={base + ' resize-none'} />
                ) : (
                  <input
                    type={f.type ?? 'text'}
                    value={form[f.name] ?? ''}
                    onChange={e => { set(f.name, e.target.value); setErrors(er => ({ ...er, [f.name]: false })); }}
                    className={base}
                  />
                )}
                {hasErr && <p className="text-xs text-red-500 mt-0.5">Pflichtfeld</p>}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-800">Abbrechen</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
