const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const windowbar = html.match(/<header class="windowbar">([\s\S]*?)<\/header>/)?.[1] ?? '';

test('üst çubuk yalnız web uygulamasını gösterir', () => {
  assert.doesNotMatch(windowbar, /data-view=|>Masaüstü<|>Web</);
  assert.doesNotMatch(css, /\.view-switch/);
});

test('yetkili veri girişi ve düzenleme yüzeyleri korunur', () => {
  assert.match(html, /id="dataGate"/);
  assert.match(html, /id="authModal"/);
  assert.match(html, /id="authPassword"/);
  assert.match(html, /id="corrUpdate"/);
  assert.match(html, /id="corrDelete"/);
});
