const styles = {
  Gewonnen: 'bg-green-100 text-green-700 border border-green-300',
  Verloren: 'bg-red-100 text-red-700 border border-red-300',
  Offen: 'bg-amber-100 text-amber-700 border border-amber-300',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? ''}`}>
      {status}
    </span>
  );
}
