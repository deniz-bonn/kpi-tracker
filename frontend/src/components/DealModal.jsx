import { useState, useEffect } from 'react';

export default function DealModal({ title, fields, initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-xs text-gray-600 mb-1">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</label>
              {f.type === 'select' ? (
                <select
                  value={form[f.name] ?? ''}
                  onChange={e => set(f.name, e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5"
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
                  className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5 resize-none"
                />
              ) : (
                <input
                  type={f.type ?? 'text'}
                  value={form[f.name] ?? ''}
                  onChange={e => set(f.name, e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-1.5"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-800">Abbrechen</button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
