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
