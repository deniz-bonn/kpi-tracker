export const formatEuro = (val) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val ?? 0);

// Betrag in beliebiger Währung formatieren (CHF für Risem, sonst EUR). Für Erfassung/Detailanzeige.
export const formatMoney = (val, currency = 'EUR') =>
  new Intl.NumberFormat(currency === 'CHF' ? 'de-CH' : 'de-DE',
    { style: 'currency', currency, maximumFractionDigits: 0 }).format(val ?? 0);

// Währung einer Company aus der companies-Liste (Fallback EUR).
export const companyCurrency = (companies, companyId) =>
  (companies || []).find(c => String(c.id) === String(companyId))?.currency || 'EUR';

// Ist die Company des Deals schon aktiv? (aktiv_ab leer oder <= heute). Deals noch nicht
// aktiver Companies (z.B. Risem vor 2026-08-01) bleiben in Listen sichtbar, fließen aber
// nicht in Auswertungen/Stats/KPIs ein.
export const isDealCompanyActive = (d) => {
  const ab = d?.aktiv_ab ? String(d.aktiv_ab).slice(0, 10) : null;
  return !ab || ab <= new Date().toISOString().slice(0, 10);
};

// Zählt der AE (Umsatz) dieses Deals? Client-Spiegel des Backend-Gates aeEurGatedSql:
// company.ae_ab_monat leer -> immer; sonst nur wenn gewonnen_monat >= ae_ab_monat.
// Nötig, weil client-seitige AE-Summen (z.B. der Copy-Text-Report) direkt aus den
// Deal-Daten rechnen, wo das SQL-Gate nicht greift. aktiv_ab reicht dafür NICHT:
// es blendet nur VOR dem Startdatum aus und greift ab dem Aktivierungstag gar nicht mehr.
export const isAeCounted = (d) => {
  const ab = d?.ae_ab_monat ? String(d.ae_ab_monat).slice(0, 7) : null;
  if (!ab) return true;
  const gm = d?.gewonnen_monat ? String(d.gewonnen_monat).slice(0, 7) : null;
  return !!gm && gm >= ab;
};

export const formatPct = (val) => `${val ?? 0} %`;

export const monthLabel = (monat) => {
  if (!monat) return '';
  const [y, m] = monat.split('-');
  return new Date(y, m - 1).toLocaleString('de-DE', { month: 'short', year: 'numeric' });
};

export const currentMonat = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Zeitraum-Label für KPI-Kopfzeilen: Monat -> "Jul 2026", Zeitraum -> "Jul 2026 – Aug 2026",
// Alle -> "Alle Monate". zeitMode: 'monat' | 'zeitraum' | 'alle'.
export const periodLabel = (zeitMode, monat, von, bis) => {
  if (zeitMode === 'alle') return 'Alle Monate';
  if (zeitMode === 'zeitraum') {
    if (!von || !bis) return '';
    return von === bis ? monthLabel(von) : `${monthLabel(von)} – ${monthLabel(bis)}`;
  }
  return monthLabel(monat);
};

// Dateinamen-Suffix für CSV-Export: "_2026-07" | "_2026-07_2026-08" | "_alle".
export const periodFileSuffix = (zeitMode, monat, von, bis) =>
  zeitMode === 'alle' ? '_alle'
    : zeitMode === 'zeitraum' ? `_${von}_${bis}`
      : `_${monat}`;
