import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const celebrationSettings = sqliteTable("celebration_settings", {
  weddingId: text("wedding_id").primaryKey(),
  hubVisibility: text("hub_visibility", {
    enum: ["closed", "public"],
  })
    .notNull()
    .default("closed"),
  retentionDays: integer("retention_days").notNull().default(90),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const celebrationCredits = sqliteTable(
  "celebration_credits",
  {
    id: text("id").primaryKey(),
    weddingId: text("wedding_id").notNull(),
    kind: text("kind", { enum: ["person", "vendor"] }).notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull(),
    groupName: text("group_name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    visibility: text("visibility", { enum: ["private", "public"] })
      .notNull()
      .default("private"),
    consent: text("consent", { enum: ["pending", "approved"] })
      .notNull()
      .default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_celebration_credits_wedding_public").on(
      table.weddingId,
      table.visibility,
      table.consent,
      table.sortOrder,
    ),
  ],
);

export const photoCollections = sqliteTable(
  "photo_collections",
  {
    id: text("id").primaryKey(),
    weddingId: text("wedding_id").notNull(),
    label: text("label").notNull(),
    credentialHash: text("credential_hash").notNull(),
    state: text("state", { enum: ["active", "revoked"] })
      .notNull()
      .default("active"),
    opensAt: text("opens_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    retentionDays: integer("retention_days").notNull().default(90),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    revokedAt: text("revoked_at"),
  },
  (table) => [
    uniqueIndex("idx_photo_collections_credential_hash").on(
      table.credentialHash,
    ),
    index("idx_photo_collections_wedding_created").on(
      table.weddingId,
      table.createdAt,
    ),
  ],
);

export const photoSubmissions = sqliteTable(
  "photo_submissions",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    objectKey: text("object_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mediaType: text("media_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    uploaderName: text("uploader_name"),
    consentVersion: text("consent_version").notNull(),
    moderationState: text("moderation_state", {
      enum: ["pending", "approved", "rejected", "deleted"],
    })
      .notNull()
      .default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    moderatedAt: text("moderated_at"),
    moderatedBy: text("moderated_by"),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("idx_photo_submissions_collection_idempotency").on(
      table.collectionId,
      table.idempotencyKey,
    ),
    index("idx_photo_submissions_wedding_created").on(
      table.weddingId,
      table.createdAt,
    ),
    index("idx_photo_submissions_collection_recent").on(
      table.collectionId,
      table.createdAt,
    ),
  ],
);

export const photoRateLimits = sqliteTable(
  "photo_rate_limits",
  {
    collectionId: text("collection_id").notNull(),
    sourceFingerprint: text("source_fingerprint").notNull(),
    windowStartedAt: text("window_started_at").notNull(),
    attemptCount: integer("attempt_count").notNull().default(1),
  },
  (table) => [
    uniqueIndex("idx_photo_rate_limits_window").on(
      table.collectionId,
      table.sourceFingerprint,
      table.windowStartedAt,
    ),
  ],
);

export const rsvpResponses = sqliteTable(
  "rsvp_responses",
  {
    id: text("id").primaryKey(),
    weddingId: text("wedding_id").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    attendance: text("attendance", { enum: ["yes", "no"] }).notNull(),
    guestName: text("guest_name").notNull(),
    menuChoice: text("menu_choice"),
    note: text("note"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_rsvp_responses_wedding_idempotency").on(
      table.weddingId,
      table.idempotencyKey,
    ),
    index("idx_rsvp_responses_wedding_created").on(
      table.weddingId,
      table.createdAt,
    ),
  ],
);

export const rsvpRateLimits = sqliteTable(
  "rsvp_rate_limits",
  {
    weddingId: text("wedding_id").notNull(),
    sourceFingerprint: text("source_fingerprint").notNull(),
    windowStartedAt: text("window_started_at").notNull(),
    attemptCount: integer("attempt_count").notNull().default(1),
  },
  (table) => [
    uniqueIndex("idx_rsvp_rate_limits_window").on(
      table.weddingId,
      table.sourceFingerprint,
      table.windowStartedAt,
    ),
  ],
);
