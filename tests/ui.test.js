const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('üstte yalnız sarı marka alanı ve küçük sistem adı kalır', () => {
  assert.doesNotMatch(html, /class="windowbar"|SEYMEN Hesaplama Merkezi<\/b>/);
  assert.doesNotMatch(html, /Ş\. Melih KARABAY için özenle hazırlanmıştır\./);
  assert.match(html, /class="brand-system-name">Fire\/Tonaj Hesaplama Sistemi<\/div>/);
  assert.match(css, /\.brand-lockup/);
  assert.match(css, /\.brand-system-name/);
  assert.doesNotMatch(css, /\.view-switch/);
});

test('yetkili ürün editörü yoğunluk kaydını ortak veriye yayınlamak için hazırdır', () => {
  assert.match(html, /id="dataGate"/);
  assert.match(html, /id="authModal"/);
  assert.match(html, /id="authPassword"/);
  assert.match(html, /id="adminName"/);
  assert.match(html, /id="adminDensity"/);
  assert.doesNotMatch(html, /id="adminFireRate"/);
  assert.match(html, /id="adminUpdate"[^>]*>Kaydet<\/button>/);
  assert.match(html, /id="productSaveState"/);
  assert.match(html, /id="corrUpdate"/);
  assert.match(html, /id="corrDelete"/);
  assert.doesNotMatch(html, /masaüstü/i);
});

test('yetkili veri değişiklikleri hesaplama geçmişinde ayrı ve silinemez gösterilir', () => {
  assert.match(html, /id="auditHistory"[^>]*hidden/);
  assert.match(html, /id="auditRows"/);
  assert.match(html, /<th>Tarih ve Saat<\/th>/);
  assert.match(html, /<th>Önceki Değer<\/th>/);
  assert.match(html, /<th>Yeni Değer<\/th>/);
  assert.match(html, /id="corrSaveState"/);
  assert.doesNotMatch(html, /id="corrExcel"|Excel Yükle/);
});
