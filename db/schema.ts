import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  density: real('density').notNull(),
  fireRate: real('fire_rate').notNull().default(0.002),
  version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const correlations = sqliteTable('correlations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  product: text('product').notNull(),
  gtip: text('gtip').notNull().default(''),
  correlationYear: text('correlation_year').notNull().default('YOK'),
  correlationGtip: text('correlation_gtip').notNull().default('YOK'),
  aRate: real('a_rate'),
  bRate: real('b_rate'),
  version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  entityName: text('entity_name').notNull(),
  action: text('action').notNull(),
  beforeValues: text('before_values'),
  afterValues: text('after_values'),
  actor: text('actor').notNull().default('Yetkili'),
  changedAt: text('changed_at').notNull()
}, table => [
  index('idx_audit_log_entity').on(table.entityType, table.entityId),
  index('idx_audit_log_changed_at').on(table.changedAt)
]);

export const metadata = sqliteTable('metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
});
