CREATE TRIGGER audit_products_insert
AFTER INSERT ON products
BEGIN
  INSERT INTO audit_log (entity_type, entity_id, entity_name, action, before_values, after_values, actor, changed_at)
  VALUES (
    'Ürün', NEW.id, NEW.name, 'Ekleme', NULL,
    json_object('name', NEW.name, 'density', NEW.density, 'fireRate', NEW.fire_rate, 'version', NEW.version),
    'Yetkili', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;
--> statement-breakpoint
CREATE TRIGGER audit_products_update
AFTER UPDATE ON products
BEGIN
  INSERT INTO audit_log (entity_type, entity_id, entity_name, action, before_values, after_values, actor, changed_at)
  VALUES (
    'Ürün', NEW.id, NEW.name, 'Güncelleme',
    json_object('name', OLD.name, 'density', OLD.density, 'fireRate', OLD.fire_rate, 'version', OLD.version),
    json_object('name', NEW.name, 'density', NEW.density, 'fireRate', NEW.fire_rate, 'version', NEW.version),
    'Yetkili', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;
--> statement-breakpoint
CREATE TRIGGER audit_products_delete
AFTER DELETE ON products
BEGIN
  INSERT INTO audit_log (entity_type, entity_id, entity_name, action, before_values, after_values, actor, changed_at)
  VALUES (
    'Ürün', OLD.id, OLD.name, 'Silme',
    json_object('name', OLD.name, 'density', OLD.density, 'fireRate', OLD.fire_rate, 'version', OLD.version),
    NULL, 'Yetkili', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;
--> statement-breakpoint
CREATE TRIGGER audit_correlations_insert
AFTER INSERT ON correlations
BEGIN
  INSERT INTO audit_log (entity_type, entity_id, entity_name, action, before_values, after_values, actor, changed_at)
  VALUES (
    'EK-11', NEW.id, NEW.product, 'Ekleme', NULL,
    json_object('product', NEW.product, 'gtip', NEW.gtip, 'correlationYear', NEW.correlation_year, 'correlationGtip', NEW.correlation_gtip, 'aRate', NEW.a_rate, 'bRate', NEW.b_rate, 'version', NEW.version),
    'Yetkili', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;
--> statement-breakpoint
CREATE TRIGGER audit_correlations_update
AFTER UPDATE ON correlations
BEGIN
  INSERT INTO audit_log (entity_type, entity_id, entity_name, action, before_values, after_values, actor, changed_at)
  VALUES (
    'EK-11', NEW.id, NEW.product, 'Güncelleme',
    json_object('product', OLD.product, 'gtip', OLD.gtip, 'correlationYear', OLD.correlation_year, 'correlationGtip', OLD.correlation_gtip, 'aRate', OLD.a_rate, 'bRate', OLD.b_rate, 'version', OLD.version),
    json_object('product', NEW.product, 'gtip', NEW.gtip, 'correlationYear', NEW.correlation_year, 'correlationGtip', NEW.correlation_gtip, 'aRate', NEW.a_rate, 'bRate', NEW.b_rate, 'version', NEW.version),
    'Yetkili', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;
--> statement-breakpoint
CREATE TRIGGER audit_correlations_delete
AFTER DELETE ON correlations
BEGIN
  INSERT INTO audit_log (entity_type, entity_id, entity_name, action, before_values, after_values, actor, changed_at)
  VALUES (
    'EK-11', OLD.id, OLD.product, 'Silme',
    json_object('product', OLD.product, 'gtip', OLD.gtip, 'correlationYear', OLD.correlation_year, 'correlationGtip', OLD.correlation_gtip, 'aRate', OLD.a_rate, 'bRate', OLD.b_rate, 'version', OLD.version),
    NULL, 'Yetkili', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );
END;
