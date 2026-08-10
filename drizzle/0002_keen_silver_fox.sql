CREATE TABLE `rsvp_rate_limits` (
	`wedding_id` text NOT NULL,
	`source_fingerprint` text NOT NULL,
	`window_started_at` text NOT NULL,
	`attempt_count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_rsvp_rate_limits_window` ON `rsvp_rate_limits` (`wedding_id`,`source_fingerprint`,`window_started_at`);--> statement-breakpoint
CREATE TABLE `rsvp_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`wedding_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`attendance` text NOT NULL,
	`guest_name` text NOT NULL,
	`menu_choice` text,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_rsvp_responses_wedding_idempotency` ON `rsvp_responses` (`wedding_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_rsvp_responses_wedding_created` ON `rsvp_responses` (`wedding_id`,`created_at`);