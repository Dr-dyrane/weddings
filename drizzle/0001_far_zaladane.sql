CREATE TABLE `photo_rate_limits` (
	`collection_id` text NOT NULL,
	`source_fingerprint` text NOT NULL,
	`window_started_at` text NOT NULL,
	`attempt_count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_photo_rate_limits_window` ON `photo_rate_limits` (`collection_id`,`source_fingerprint`,`window_started_at`);