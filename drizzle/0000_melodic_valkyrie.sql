CREATE TABLE `celebration_credits` (
	`id` text PRIMARY KEY NOT NULL,
	`wedding_id` text NOT NULL,
	`kind` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`group_name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`consent` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_celebration_credits_wedding_public` ON `celebration_credits` (`wedding_id`,`visibility`,`consent`,`sort_order`);--> statement-breakpoint
CREATE TABLE `celebration_settings` (
	`wedding_id` text PRIMARY KEY NOT NULL,
	`hub_visibility` text DEFAULT 'closed' NOT NULL,
	`retention_days` integer DEFAULT 90 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photo_collections` (
	`id` text PRIMARY KEY NOT NULL,
	`wedding_id` text NOT NULL,
	`label` text NOT NULL,
	`credential_hash` text NOT NULL,
	`state` text DEFAULT 'active' NOT NULL,
	`opens_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`retention_days` integer DEFAULT 90 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`revoked_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_photo_collections_credential_hash` ON `photo_collections` (`credential_hash`);--> statement-breakpoint
CREATE INDEX `idx_photo_collections_wedding_created` ON `photo_collections` (`wedding_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `photo_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`wedding_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`object_key` text NOT NULL,
	`original_filename` text NOT NULL,
	`media_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`uploader_name` text,
	`consent_version` text NOT NULL,
	`moderation_state` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`moderated_at` text,
	`moderated_by` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_photo_submissions_collection_idempotency` ON `photo_submissions` (`collection_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_photo_submissions_wedding_created` ON `photo_submissions` (`wedding_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_photo_submissions_collection_recent` ON `photo_submissions` (`collection_id`,`created_at`);