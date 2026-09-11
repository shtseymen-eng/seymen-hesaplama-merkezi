import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const schemaSql = readFileSync(new URL('../drizzle/0000_burly_rogue.sql', import.meta.url), 'utf8');
const triggerSql = readFileSync(new URL('../drizzle/0001_audit_triggers.sql', import.meta.url), 'utf8');

function migratedDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(schemaSql);
  db.exec(triggerSql);
  return db;
}

test('ürün ekleme, güncelleme ve silme eski-yeni değerleriyle kaydedilir', () => {
  const db = migratedDatabase();
  const now = '2026-09-11T10:00:00.000Z';
  db.prepare('INSERT INTO products (name, density, fire_rate, version, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)')
    .run('METHANOL', 0.7949, 0.002, now, now);
  db.prepare("UPDATE products SET density = ?, version = version + 1, updated_at = ? WHERE id = 1")
    .run(0.7951, '2026-09-11T10:01:00.000Z');
  db.prepare('DELETE FROM products WHERE id = 1').run();

  const rows = db.prepare('SELECT * FROM audit_log ORDER BY id').all();
  assert.deepEqual(rows.map(row => row.action), ['Ekleme', 'Güncelleme', 'Silme']);
  assert.equal(rows.every(row => row.actor === 'Yetkili'), true);
  assert.equal(JSON.parse(rows[1].before_values).density, 0.7949);
  assert.equal(JSON.parse(rows[1].after_values).density, 0.7951);
  assert.equal(rows[0].before_values, null);
  assert.equal(rows[2].after_values, null);
});

test('EK-11 güncellemesi fire oranlarının önceki ve yeni değerlerini kaydeder', () => {
  const db = migratedDatabase();
  const now = '2026-09-11T10:00:00.000Z';
  db.prepare('INSERT INTO correlations (product, gtip, correlation_year, correlation_gtip, a_rate, b_rate, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)')
    .run('METHANOL', '290511001011', 'YOK', 'YOK', 0.4, 0.0025, now, now);
  db.prepare('UPDATE correlations SET b_rate = ?, version = version + 1, updated_at = ? WHERE id = 1')
    .run(0.003, '2026-09-11T10:02:00.000Z');

  const row = db.prepare("SELECT * FROM audit_log WHERE entity_type = 'EK-11' AND action = 'Güncelleme'").get();
  assert.equal(JSON.parse(row.before_values).bRate, 0.0025);
  assert.equal(JSON.parse(row.after_values).bRate, 0.003);
});
