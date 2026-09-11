import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const storeUrl = new URL('../server/store.mjs', import.meta.url);
const schemaSql = readFileSync(new URL('../drizzle/0000_burly_rogue.sql', import.meta.url), 'utf8');
const triggerSql = readFileSync(new URL('../drizzle/0001_audit_triggers.sql', import.meta.url), 'utf8');

class D1StatementShim {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }
  bind(...values) { return new D1StatementShim(this.database, this.sql, values); }
  async first() { return this.database.prepare(this.sql).get(...this.values); }
  async all() { return { results: this.database.prepare(this.sql).all(...this.values) }; }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
  }
}

class D1DatabaseShim {
  constructor() {
    this.database = new DatabaseSync(':memory:');
    this.database.exec(schemaSql);
    this.database.exec(triggerSql);
  }
  prepare(sql) { return new D1StatementShim(this.database, sql); }
  async batch(statements) {
    this.database.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}

test('D1 deposu başlangıç verisini bir kez yükler ve tohum geçmişini temizler', async () => {
  assert.equal(existsSync(storeUrl), true, 'server/store.mjs henüz yok');
  const { createD1Store } = await import(storeUrl);
  const store = createD1Store(new D1DatabaseShim(), () => '2026-09-11T10:00:00.000Z');

  const first = await store.getPublishedData();
  const second = await store.getPublishedData();
  assert.equal(first.products.length, 62);
  assert.equal(second.products.length, 62);
  assert.ok(first.correlations.length > 90);
  assert.deepEqual(await store.listAudit(), []);
});

test('D1 deposu ürün ve EK-11 güncellemesini sürüm denetimiyle kaydeder', async () => {
  assert.equal(existsSync(storeUrl), true, 'server/store.mjs henüz yok');
  const { createD1Store } = await import(storeUrl);
  const store = createD1Store(new D1DatabaseShim(), () => '2026-09-11T10:00:00.000Z');
  const data = await store.getPublishedData();
  const product = data.products.find(row => row.name === 'METHANOL');
  const correlation = data.correlations.find(row => row.product === 'METHANOL');

  const savedProduct = await store.updateProduct(product.id, {
    name: product.name,
    density: 0.7951,
    expectedVersion: product.version
  });
  const savedCorrelation = await store.updateCorrelation(correlation.id, {
    product: correlation.product,
    gtip: correlation.gtip,
    correlationYear: correlation.correlationYear,
    correlationGtip: correlation.correlationGtip,
    aRate: correlation.aRate,
    bRate: 0.003,
    expectedVersion: correlation.version
  });

  assert.equal(savedProduct.version, 2);
  assert.equal(savedCorrelation.bRate, 0.003);
  const audit = await store.listAudit();
  assert.equal(audit.length, 2);
  assert.equal(audit[0].entityType, 'EK-11');
  assert.equal(audit[1].beforeValues.density, 0.7949);

  await assert.rejects(
    store.updateProduct(product.id, { name: product.name, density: 0.8, expectedVersion: 1 }),
    error => error.code === 'version_conflict'
  );
  assert.equal((await store.listAudit()).length, 2);
});
