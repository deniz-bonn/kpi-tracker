export const formatEuro = (val) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val ?? 0);

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
