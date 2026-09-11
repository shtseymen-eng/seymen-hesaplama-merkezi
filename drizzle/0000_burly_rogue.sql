CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`entity_name` text NOT NULL,
	`action` text NOT NULL,
	`before_values` text,
	`after_values` text,
	`actor` text DEFAULT 'Yetkili' NOT NULL,
	`changed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_log_entity` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_log_changed_at` ON `audit_log` (`changed_at`);--> statement-breakpoint
CREATE TABLE `correlations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text NOT NULL,
	`gtip` text DEFAULT '' NOT NULL,
	`correlation_year` text DEFAULT 'YOK' NOT NULL,
	`correlation_gtip` text DEFAULT 'YOK' NOT NULL,
	`a_rate` real,
	`b_rate` real,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`density` real NOT NULL,
	`fire_rate` real DEFAULT 0.002 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_name_unique` ON `products` (`name`);