import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const workerUrl = new URL('../server/worker.mjs', import.meta.url);
const authUrl = new URL('../server/auth.mjs', import.meta.url);
const validationUrl = new URL('../server/validation.mjs', import.meta.url);

const fixedNow = Date.parse('2026-09-11T10:00:00.000Z');
const env = {
  ADMIN_PASSWORD: 'test-password',
  SESSION_SECRET: 'test-session-secret-with-at-least-32-characters'
};

function jsonRequest(path, body, token, method = 'POST', origin = 'https://shtseymen-eng.github.io') {
  const headers = { 'content-type': 'application/json', origin };
  if (token) headers.authorization = `Bearer ${token}`;
  return new Request(`https://service.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function createMemoryStore() {
  let products = [{ id: 1, name: 'METHANOL', density: 0.7949, fireRate: 0.002, version: 1 }];
  let correlations = [{ id: 1, product: 'METHANOL', gtip: '290511001011', correlationYear: 'YOK', correlationGtip: 'YOK', aRate: 0.4, bRate: 0.0025, version: 1 }];
  const audit = [];
  const record = (entityType, action, beforeValues, afterValues) => audit.unshift({
    id: audit.length + 1,
    entityType,
    entityId: (afterValues || beforeValues).id,
    entityName: (afterValues || beforeValues).name || (afterValues || beforeValues).product,
    action,
    beforeValues,
    afterValues,
    actor: 'Yetkili',
    changedAt: '2026-09-11T10:00:00.000Z'
  });
  const find = (rows, id) => rows.find(row => row.id === id);

  return {
    async getPublishedData() { return { products, correlations }; },
    async createProduct(input) {
      const row = { id: 2, ...input, fireRate: 0.002, version: 1 };
      products = [...products, row]; record('Ürün', 'Ekleme', null, row); return row;
    },
    async updateProduct(id, input) {
      const before = find(products, id);
      if (!before) throw Object.assign(new Error('missing'), { code: 'not_found' });
      if (before.version !== input.expectedVersion) throw Object.assign(new Error('stale'), { code: 'version_conflict' });
      const after = { ...before, name: input.name, density: input.density, version: before.version + 1 };
      products = products.map(row => row.id === id ? after : row); record('Ürün', 'Güncelleme', before, after); return after;
    },
    async deleteProduct(id, expectedVersion) {
      const before = find(products, id);
      if (!before) throw Object.assign(new Error('missing'), { code: 'not_found' });
      if (before.version !== expectedVersion) throw Object.assign(new Error('stale'), { code: 'version_conflict' });
      products = products.filter(row => row.id !== id); record('Ürün', 'Silme', before, null); return before;
    },
    async createCorrelation(input) {
      const row = { id: 2, ...input, version: 1 };
      correlations = [...correlations, row]; record('EK-11', 'Ekleme', null, row); return row;
    },
    async updateCorrelation(id, input) {
      const before = find(correlations, id);
      if (!before) throw Object.assign(new Error('missing'), { code: 'not_found' });
      if (before.version !== input.expectedVersion) throw Object.assign(new Error('stale'), { code: 'version_conflict' });
      const after = { ...before, ...input, id, version: before.version + 1 };
      delete after.expectedVersion;
      correlations = correlations.map(row => row.id === id ? after : row); record('EK-11', 'Güncelleme', before, after); return after;
    },
    async deleteCorrelation(id, expectedVersion) {
      const before = find(correlations, id);
      if (!before) throw Object.assign(new Error('missing'), { code: 'not_found' });
      if (before.version !== expectedVersion) throw Object.assign(new Error('stale'), { code: 'version_conflict' });
      correlations = correlations.filter(row => row.id !== id); record('EK-11', 'Silme', before, null); return before;
    },
    async listAudit() { return audit; }
  };
}

async function testApp() {
  const { createApp } = await import(workerUrl);
  return createApp({ store: createMemoryStore(), now: () => fixedNow });
}

async function login(app, password = 'test-password') {
  const response = await app.fetch(jsonRequest('/api/auth/login', { password }), env);
  const body = await response.json();
  return { response, body };
}

test('API güvenlik ve doğrulama modülleri hazırdır', () => {
  assert.equal(existsSync(authUrl), true, 'server/auth.mjs henüz yok');
  assert.equal(existsSync(validationUrl), true, 'server/validation.mjs henüz yok');
});

test('hatalı şifre reddedilir ve doğru şifre süreli oturum açar', async t => {
  if (!existsSync(authUrl) || !existsSync(validationUrl)) return t.skip('API modülleri bekleniyor');
  const app = await testApp();
  assert.equal((await login(app, 'wrong')).response.status, 401);
  const good = await login(app);
  assert.equal(good.response.status, 200);
  assert.equal(typeof good.body.token, 'string');
  assert.ok(good.body.token.length > 40);
});

test('yetkisiz yazma reddedilir ve ürün güncellemesi denetim kaydı oluşturur', async t => {
  if (!existsSync(authUrl) || !existsSync(validationUrl)) return t.skip('API modülleri bekleniyor');
  const app = await testApp();
  const payload = { name: 'METHANOL', density: 0.7951, expectedVersion: 1 };
  assert.equal((await app.fetch(jsonRequest('/api/products/1', payload, null, 'PATCH'), env)).status, 401);

  const { body: session } = await login(app);
  const savedResponse = await app.fetch(jsonRequest('/api/products/1', payload, session.token, 'PATCH'), env);
  assert.equal(savedResponse.status, 200);
  assert.equal((await savedResponse.json()).product.density, 0.7951);

  const auditResponse = await app.fetch(jsonRequest('/api/audit', undefined, session.token, 'GET'), env);
  const rows = (await auditResponse.json()).audit;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].beforeValues.density, 0.7949);
  assert.equal(rows[0].afterValues.density, 0.7951);
});

test('eski sürüm güncel kaydı ezmez ve başarısız işlem geçmiş oluşturmaz', async t => {
  if (!existsSync(authUrl) || !existsSync(validationUrl)) return t.skip('API modülleri bekleniyor');
  const app = await testApp();
  const { body: session } = await login(app);
  const response = await app.fetch(jsonRequest('/api/products/1', {
    name: 'METHANOL', density: 0.7951, expectedVersion: 9
  }, session.token, 'PATCH'), env);
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'version_conflict');
  const audit = await app.fetch(jsonRequest('/api/audit', undefined, session.token, 'GET'), env);
  assert.deepEqual((await audit.json()).audit, []);
});

test('geçersiz yoğunluk ve fire oranları kaydedilmez', async t => {
  if (!existsSync(authUrl) || !existsSync(validationUrl)) return t.skip('API modülleri bekleniyor');
  const app = await testApp();
  const { body: session } = await login(app);
  const badProduct = await app.fetch(jsonRequest('/api/products/1', {
    name: 'METHANOL', density: 0, expectedVersion: 1
  }, session.token, 'PATCH'), env);
  assert.equal(badProduct.status, 400);

  const badCorrelation = await app.fetch(jsonRequest('/api/correlations/1', {
    product: 'METHANOL', gtip: '', correlationYear: 'YOK', correlationGtip: 'YOK',
    aRate: 0.4, bRate: -1, expectedVersion: 1
  }, session.token, 'PATCH'), env);
  assert.equal(badCorrelation.status, 400);
});

test('EK-11 güncellemesi yeni fire oranını ve geçmişini döndürür', async t => {
  if (!existsSync(authUrl) || !existsSync(validationUrl)) return t.skip('API modülleri bekleniyor');
  const app = await testApp();
  const { body: session } = await login(app);
  const response = await app.fetch(jsonRequest('/api/correlations/1', {
    product: 'METHANOL', gtip: '290511001011', correlationYear: 'YOK', correlationGtip: 'YOK',
    aRate: 0.4, bRate: 0.003, expectedVersion: 1
  }, session.token, 'PATCH'), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).correlation.bRate, 0.003);
  const audit = await app.fetch(jsonRequest('/api/audit', undefined, session.token, 'GET'), env);
  assert.equal((await audit.json()).audit[0].entityType, 'EK-11');
});

test('yalnız izin verilen web adresi CORS yanıtı alır', async t => {
  if (!existsSync(authUrl) || !existsSync(validationUrl)) return t.skip('API modülleri bekleniyor');
  const app = await testApp();
  const allowed = await app.fetch(new Request('https://service.test/api/data', {
    headers: { origin: 'https://shtseymen-eng.github.io' }
  }), env);
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://shtseymen-eng.github.io');

  const denied = await app.fetch(new Request('https://service.test/api/data', {
    headers: { origin: 'https://example.com' }
  }), env);
  assert.equal(denied.status, 403);
});
