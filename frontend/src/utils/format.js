export const formatEuro = (val) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val ?? 0);

// Betrag in beliebiger Währung formatieren (CHF für Risem, sonst EUR). Für Erfassung/Detailanzeige.
export const formatMoney = (val, currency = 'EUR') =>
  new Intl.NumberFormat(currency === 'CHF' ? 'de-CH' : 'de-DE',
    { style: 'currency', currency, maximumFractionDigits: 0 }).format(val ?? 0);

// Währung einer Company aus der companies-Liste (Fallback EUR).
export const companyCurrency = (companies, companyId) =>
  (companies || []).find(c => String(c.id) === String(companyId))?.currency || 'EUR';

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
