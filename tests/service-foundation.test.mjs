import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const dataUrl = new URL('../server/default-data.mjs', import.meta.url);
const workerUrl = new URL('../server/worker.mjs', import.meta.url);

test('ortak veri hizmeti mevcut hesaplama verilerini eksiksiz başlatır', async () => {
  assert.equal(existsSync(dataUrl), true, 'server/default-data.mjs henüz yok');
  const { DEFAULT_DATA } = await import(dataUrl);

  assert.equal(DEFAULT_DATA.products.length, 62);
  assert.equal(DEFAULT_DATA.products.find(product => product.name === 'METHANOL').density, 0.7949);
  assert.ok(DEFAULT_DATA.correlations.length > 90);
});

test('veri hizmeti çalıştırılabilir bir web giriş noktası sunar', async () => {
  assert.equal(existsSync(workerUrl), true, 'server/worker.mjs henüz yok');
  const { default: worker } = await import(workerUrl);

  assert.equal(typeof worker.fetch, 'function');
  const response = await worker.fetch(new Request('https://service.test/health'), {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});
