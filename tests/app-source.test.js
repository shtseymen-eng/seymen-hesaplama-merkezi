const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('uygulama ortak veri istemcisini hesaplama kodundan önce yükler', () => {
  const configIndex = html.indexOf('<script src="site-config.js"></script>');
  const clientIndex = html.indexOf('<script src="data-client.js"></script>');
  const appIndex = html.indexOf('<script src="app.js"></script>');
  assert.ok(configIndex >= 0);
  assert.ok(clientIndex > configIndex);
  assert.ok(appIndex > clientIndex);
  assert.match(app, /dataClient\.loadData\(\)/);
});

test('şifre doğrulaması ve yayınlanan veri kaydı geçici tarayıcı deposunda yapılmaz', () => {
  assert.doesNotMatch(app, /AUTH_HASH|TEMP_PRODUCTS_KEY|CORR_SESSION_KEY|persistTempProducts|saveCorrelations/);
  assert.match(app, /dataClient\.login\(/);
  assert.match(app, /dataClient\.updateProduct\(/);
  assert.match(app, /dataClient\.updateCorrelation\(/);
});

test('yetkili ürün satırını çift tıklayarak editörü açar', () => {
  assert.match(app, /productRows'\)\.addEventListener\('dblclick'/);
  assert.match(app, /productAdmin'\)\.classList\.remove\('hidden'\)/);
  assert.doesNotMatch(app, /adminFireRate/);
});

test('yetkili geçmiş sayfasında sunucudaki veri değişikliklerini yükler', () => {
  assert.match(app, /async function renderAuditHistory/);
  assert.match(app, /dataClient\.loadAudit\(\)/);
  assert.match(app, /auditHistory'\)\.classList\.toggle\('hidden',!on\)/);
});
