import { DEFAULT_DATA } from './default-data.mjs';

const nowIso = () => new Date().toISOString();

export class StoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'StoreError';
    this.code = code;
  }
}

function productFromRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    density: Number(row.density),
    fireRate: Number(row.fire_rate),
    version: Number(row.version),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function correlationFromRow(row) {
  return {
    id: Number(row.id),
    product: row.product,
    gtip: row.gtip,
    correlationYear: row.correlation_year,
    correlationGtip: row.correlation_gtip,
    aRate: row.a_rate == null ? null : Number(row.a_rate),
    bRate: row.b_rate == null ? null : Number(row.b_rate),
    version: Number(row.version),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function auditFromRow(row) {
  return {
    id: Number(row.id),
    entityType: row.entity_type,
    entityId: Number(row.entity_id),
    entityName: row.entity_name,
    action: row.action,
    beforeValues: row.before_values ? JSON.parse(row.before_values) : null,
    afterValues: row.after_values ? JSON.parse(row.after_values) : null,
    actor: row.actor,
    changedAt: row.changed_at
  };
}

const chunks = (rows, size) => {
  const result = [];
  for (let index = 0; index < rows.length; index += size) result.push(rows.slice(index, index + size));
  return result;
};

export function createD1Store(db, clock = nowIso) {
  async function batch(statements) {
    if (statements.length) await db.batch(statements);
  }

  async function ensureSeeded() {
    const seeded = await db.prepare("SELECT value FROM metadata WHERE key = 'seeded'").first();
    if (seeded?.value === '1') return;
    const stamp = clock();
    const productStatements = DEFAULT_DATA.products.map((product, index) => db.prepare(`
      INSERT OR IGNORE INTO products (id, name, density, fire_rate, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).bind(index + 1, product.name, Number(product.density), Number(product.fireRate ?? 0.002), stamp, stamp));
    const correlationStatements = DEFAULT_DATA.correlations.map((row, index) => db.prepare(`
      INSERT OR IGNORE INTO correlations
        (id, product, gtip, correlation_year, correlation_gtip, a_rate, b_rate, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      index + 1,
      row.product,
      String(row.gtip ?? ''),
      String(row.correlationYear ?? 'YOK'),
      String(row.correlationGtip ?? 'YOK'),
      row.aRate == null ? null : Number(row.aRate),
      row.bRate == null ? null : Number(row.bRate),
      stamp,
      stamp
    ));
    for (const group of chunks(productStatements, 50)) await batch(group);
    for (const group of chunks(correlationStatements, 50)) await batch(group);
    await batch([
      db.prepare('DELETE FROM audit_log'),
      db.prepare("INSERT OR REPLACE INTO metadata (key, value) VALUES ('seeded', '1')")
    ]);
  }

  async function productById(id) {
    const row = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    return row ? productFromRow(row) : null;
  }

  async function correlationById(id) {
    const row = await db.prepare('SELECT * FROM correlations WHERE id = ?').bind(id).first();
    return row ? correlationFromRow(row) : null;
  }

  async function mutationFailure(entity, id) {
    const row = entity === 'product' ? await productById(id) : await correlationById(id);
    if (!row) throw new StoreError('not_found', 'Kayıt bulunamadı.');
    throw new StoreError('version_conflict', 'Kayıt başka bir yetkili tarafından değiştirildi.');
  }

  return {
    async getPublishedData() {
      await ensureSeeded();
      const [productRows, correlationRows] = await Promise.all([
        db.prepare('SELECT * FROM products ORDER BY name COLLATE NOCASE, id').all(),
        db.prepare('SELECT * FROM correlations ORDER BY product COLLATE NOCASE, id').all()
      ]);
      return {
        products: productRows.results.map(productFromRow),
        correlations: correlationRows.results.map(correlationFromRow)
      };
    },

    async createProduct(input) {
      await ensureSeeded();
      const stamp = clock();
      const result = await db.prepare(`
        INSERT INTO products (name, density, fire_rate, version, created_at, updated_at)
        VALUES (?, ?, 0.002, 1, ?, ?)
      `).bind(input.name, input.density, stamp, stamp).run();
      return productById(Number(result.meta.last_row_id));
    },

    async updateProduct(id, input) {
      await ensureSeeded();
      const result = await db.prepare(`
        UPDATE products
        SET name = ?, density = ?, version = version + 1, updated_at = ?
        WHERE id = ? AND version = ?
      `).bind(input.name, input.density, clock(), id, input.expectedVersion).run();
      if (!Number(result.meta.changes)) return mutationFailure('product', id);
      return productById(id);
    },

    async deleteProduct(id, expectedVersion) {
      await ensureSeeded();
      const before = await productById(id);
      if (!before) throw new StoreError('not_found', 'Kayıt bulunamadı.');
      const result = await db.prepare('DELETE FROM products WHERE id = ? AND version = ?')
        .bind(id, expectedVersion).run();
      if (!Number(result.meta.changes)) return mutationFailure('product', id);
      return before;
    },

    async createCorrelation(input) {
      await ensureSeeded();
      const stamp = clock();
      const result = await db.prepare(`
        INSERT INTO correlations
          (product, gtip, correlation_year, correlation_gtip, a_rate, b_rate, version, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(input.product, input.gtip, input.correlationYear, input.correlationGtip, input.aRate, input.bRate, stamp, stamp).run();
      return correlationById(Number(result.meta.last_row_id));
    },

    async updateCorrelation(id, input) {
      await ensureSeeded();
      const result = await db.prepare(`
        UPDATE correlations
        SET product = ?, gtip = ?, correlation_year = ?, correlation_gtip = ?,
            a_rate = ?, b_rate = ?, version = version + 1, updated_at = ?
        WHERE id = ? AND version = ?
      `).bind(
        input.product, input.gtip, input.correlationYear, input.correlationGtip,
        input.aRate, input.bRate, clock(), id, input.expectedVersion
      ).run();
      if (!Number(result.meta.changes)) return mutationFailure('correlation', id);
      return correlationById(id);
    },

    async deleteCorrelation(id, expectedVersion) {
      await ensureSeeded();
      const before = await correlationById(id);
      if (!before) throw new StoreError('not_found', 'Kayıt bulunamadı.');
      const result = await db.prepare('DELETE FROM correlations WHERE id = ? AND version = ?')
        .bind(id, expectedVersion).run();
      if (!Number(result.meta.changes)) return mutationFailure('correlation', id);
      return before;
    },

    async listAudit() {
      await ensureSeeded();
      const rows = await db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 500').all();
      return rows.results.map(auditFromRow);
    }
  };
}
