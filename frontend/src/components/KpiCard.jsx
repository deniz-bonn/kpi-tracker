import { formatEuro, formatPct } from '../utils/format';

export default function KpiCard({ title, total, gewonnen, verloren, offen, ae_summe, quote, color = 'blue' }) {
  const colors = {
    blue: 'border-blue-500/40 bg-blue-950/30',
    green: 'border-green-500/40 bg-green-950/30',
    purple: 'border-purple-500/40 bg-purple-950/30',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Gesamt" value={total} />
        <Stat label="Gewonnen" value={gewonnen} valueClass="text-green-400" />
        <Stat label="Verloren" value={verloren} valueClass="text-red-400" />
        <Stat label="Offen" value={offen} valueClass="text-amber-400" />
        <Stat label="AE-Wert" value={formatEuro(ae_summe)} />
        <Stat label="Quote" value={formatPct(quote)} valueClass={quote >= 50 ? 'text-green-400' : 'text-amber-400'} />
      </div>
    </div>
  );
}

function Stat({ label, value, valueClass = 'text-white' }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
