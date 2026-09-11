(function exposeUiFormat(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SeymenUiFormat = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createUiFormat() {
  const labels = {
    name: 'Ürün',
    product: 'Ürün',
    density: 'Yoğunluk',
    fireRate: '90+ fire oranı',
    gtip: 'GTİP',
    correlationYear: 'Korelasyon yılı',
    correlationGtip: 'Korelasyon GTİP',
    aRate: 'A fire oranı',
    bRate: 'B fire oranı'
  };
  const fieldOrder = ['name', 'product', 'density', 'fireRate', 'gtip', 'correlationYear', 'correlationGtip', 'aRate', 'bRate'];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/gu, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  function formatNumber(value, maximumFractionDigits = 4) {
    return Number(value).toLocaleString('tr-TR', { maximumFractionDigits });
  }

  function formatField(key, value) {
    if (value === null || value === undefined || value === '') return '—';
    if (key === 'density') return `${formatNumber(value, 4)} kg/L`;
    if (key === 'fireRate' || key === 'aRate' || key === 'bRate') return `%${formatNumber(value, 4)}`;
    return String(value);
  }

  function formatAuditValues(values) {
    if (!values) return '—';
    const parts = fieldOrder
      .filter(key => Object.prototype.hasOwnProperty.call(values, key))
      .map(key => `${labels[key]}: ${formatField(key, values[key])}`);
    return parts.length ? parts.join(' • ') : '—';
  }

  function formatIstanbulDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const parts = Object.fromEntries(new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date).map(part => [part.type, part.value]));
    return `${parts.day}.${parts.month}.${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
  }

  return { escapeHtml, formatAuditValues, formatIstanbulDate };
}));
