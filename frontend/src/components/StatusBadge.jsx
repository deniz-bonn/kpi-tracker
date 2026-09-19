const styles = {
  Gewonnen: 'bg-green-100 text-green-700 border border-green-300',
  Verloren: 'bg-red-100 text-red-700 border border-red-300',
  Offen: 'bg-amber-100 text-amber-700 border border-amber-300',
  // Dritter VL-Ausgang (Dauer-RaaS): kein Gewinn, aber auch kein Verlust — der Kunde bleibt,
  // nur höherwertig. Eigene Farbe, damit er sich von beidem unterscheidet. Ohne Eintrag
  // renderte der Status als Text ohne Hintergrund und sähe schlicht kaputt aus.
  Umgestellt: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? ''}`}>
      {status}
    </span>
  );
}
