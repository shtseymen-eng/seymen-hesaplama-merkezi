const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const clientPath = path.join(__dirname, '..', 'data-client.js');

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    dump: () => Object.fromEntries(values)
  };
}

const jsonResponse = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' }
}));

test('başarılı ortak veri yanıtını önbelleğe alır ve çevrimdışıyken kullanır', async () => {
  assert.equal(fs.existsSync(clientPath), true, 'data-client.js henüz yok');
  const { create } = require(clientPath);
  const storage = memoryStorage();
  const data = {
    products: [{ id: 1, name: 'METHANOL', density: 0.7949, version: 1 }],
    correlations: [{ id: 1, product: 'METHANOL', aRate: 0.4, bRate: 0.0025, version: 1 }]
  };
  const online = create({ baseUrl: 'https://api.test', fetch: () => jsonResponse(data), storage, sessionStorage: memoryStorage() });
  const first = await online.loadData();
  assert.equal(first.source, 'network');
  assert.deepEqual(first.products, data.products);

  const offline = create({
    baseUrl: 'https://api.test',
    fetch: async () => { throw new Error('offline'); },
    storage,
    sessionStorage: memoryStorage()
  });
  const cached = await offline.loadData();
  assert.equal(cached.source, 'cache');
  assert.deepEqual(cached.correlations, data.correlations);
});

test('yetkili girişinde yalnız süreli oturum belirtecini saklar', async () => {
  assert.equal(fs.existsSync(clientPath), true, 'data-client.js henüz yok');
  const { create } = require(clientPath);
  const storage = memoryStorage();
  const session = memoryStorage();
  const client = create({
    baseUrl: 'https://api.test',
    fetch: () => jsonResponse({ token: 'signed-session-token' }),
    storage,
    sessionStorage: session
  });

  await client.login('test-password');
  assert.equal(session.getItem('seymen_admin_token'), 'signed-session-token');
  assert.doesNotMatch(JSON.stringify(session.dump()), /test-password/);
  assert.equal(client.isAuthorized(), true);
  client.logout();
  assert.equal(client.isAuthorized(), false);
});

test('yetkili güncellemesi belirteçle gönderilir ve başarısız yanıt yayımlanmış sayılmaz', async () => {
  assert.equal(fs.existsSync(clientPath), true, 'data-client.js henüz yok');
  const { create, DataClientError } = require(clientPath);
  const session = memoryStorage();
  session.setItem('seymen_admin_token', 'signed-session-token');
  const requests = [];
  const client = create({
    baseUrl: 'https://api.test',
    fetch: async (url, options) => {
      requests.push({ url, options });
      return jsonResponse({ error: 'version_conflict', message: 'Kayıt değişti.' }, 409);
    },
    storage: memoryStorage(),
    sessionStorage: session
  });

  await assert.rejects(
    client.updateProduct(1, { name: 'METHANOL', density: 0.7951, expectedVersion: 1 }),
    error => error instanceof DataClientError && error.code === 'version_conflict'
  );
  assert.equal(requests[0].options.method, 'PATCH');
  assert.equal(requests[0].options.headers.authorization, 'Bearer signed-session-token');
});

test('tarayıcı kullanımında yerleşik ağ ve depolama araçlarını kullanır', () => {
  const context = {
    fetch: async () => jsonResponse({ products: [], correlations: [] }),
    localStorage: memoryStorage(),
    sessionStorage: memoryStorage()
  };
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(clientPath, 'utf8'), context);

  const client = context.SeymenDataClient.create({ baseUrl: 'https://api.test' });
  assert.equal(client.isAuthorized(), false);
});
