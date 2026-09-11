const test = require('node:test');
const assert = require('node:assert/strict');

const { escapeHtml, formatAuditValues, formatIstanbulDate } = require('../ui-format.js');

test('yetkili verisi HTML olarak çalıştırılmaz', () => {
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">'),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
  );
});

test('ürün ve EK-11 eski-yeni değerleri okunabilir biçimde gösterilir', () => {
  assert.equal(
    formatAuditValues({ name: 'METHANOL', density: 0.7949 }),
    'Ürün: METHANOL • Yoğunluk: 0,7949 kg/L'
  );
  assert.equal(
    formatAuditValues({ product: 'METHANOL', gtip: '2905', aRate: 0.4, bRate: 0.0025 }),
    'Ürün: METHANOL • GTİP: 2905 • A fire oranı: %0,4 • B fire oranı: %0,0025'
  );
  assert.equal(formatAuditValues(null), '—');
});

test('sunucu zamanı İstanbul tarih ve saatiyle gösterilir', () => {
  assert.equal(formatIstanbulDate('2026-09-11T12:30:45.000Z'), '11.09.2026 15:30:45');
});
