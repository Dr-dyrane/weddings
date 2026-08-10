import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { PublishedWeddingRevision } from "../domains/publishing/publishing";

// Phase 2 PostgreSQL target metadata. This is deliberately not exported from
// db/schema.ts while the application entrypoint is still bound to D1/SQLite.

export const contentVisibility = pgEnum("content_visibility", [
  "private",
  "public",
]);

export const approvalState = pgEnum("approval_state", [
  "pending",
  "approved",
  "rejected",
  "simulation",
]);

export const publicationState = pgEnum("publication_state", [
  "draft",
  "published",
]);

export const mediaRightsState = pgEnum("media_rights_state", [
  "unknown",
  "approved",
  "rejected",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const publishingTenants = pgTable("publishing_tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  ...timestamps,
});

export const publishingThemeVersions = pgTable(
  "publishing_theme_versions",
  {
    tenantId: text("tenant_id").notNull(),
    themeId: text("theme_id").notNull(),
    version: integer("version").notNull(),
    approval: approvalState("approval").notNull().default("pending"),
    tokens: jsonb("tokens").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.themeId, table.version] }),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [publishingTenants.id],
    }).onDelete("cascade"),
    check("publishing_theme_versions_version_positive", sql`${table.version} > 0`),
  ],
);

export const authoringWeddings = pgTable(
  "authoring_weddings",
  {
    tenantId: text("tenant_id").notNull(),
    id: text("id").notNull(),
    slug: text("slug").notNull(),
    locale: text("locale").notNull(),
    timezone: text("timezone").notNull(),
    state: publicationState("state").notNull().default("draft"),
    approval: approvalState("approval").notNull().default("pending"),
    authoringRevision: integer("authoring_revision").notNull().default(1),
    activePublishedRevision: integer("active_published_revision"),
    themeId: text("theme_id").notNull(),
    themeVersion: integer("theme_version").notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.id] }),
    uniqueIndex("authoring_weddings_tenant_slug_unique").on(
      table.tenantId,
      table.slug,
    ),
    foreignKey({
      columns: [table.tenantId],
      foreignColumns: [publishingTenants.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tenantId, table.themeId, table.themeVersion],
      foreignColumns: [
        publishingThemeVersions.tenantId,
        publishingThemeVersions.themeId,
        publishingThemeVersions.version,
      ],
    }),
    check(
      "authoring_weddings_authoring_revision_positive",
      sql`${table.authoringRevision} > 0`,
    ),
  ],
);

export const authoringWeddingCopy = pgTable(
  "authoring_wedding_copy",
  {
    tenantId: text("tenant_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    coupleFirst: text("couple_first").notNull(),
    coupleSecond: text("couple_second").notNull(),
    invitationEyebrow: text("invitation_eyebrow").notNull(),
    invitationHeadline: text("invitation_headline").notNull(),
    invitationIntroduction: text("invitation_introduction").notNull(),
    dateLabel: text("date_label").notNull(),
    locationLabel: text("location_label").notNull(),
    dressEyebrow: text("dress_eyebrow").notNull(),
    dressTitle: text("dress_title").notNull(),
    dressGuidance: text("dress_guidance").notNull(),
    dressPalette: jsonb("dress_palette")
      .$type<Array<{ name: string; hex: string }>>()
      .notNull(),
    shareCardPortraitMediaId: text("share_card_portrait_media_id"),
    shareCardPortraitOpacity: real("share_card_portrait_opacity"),
    privateNotes: text("private_notes"),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.weddingId] }),
    foreignKey({
      columns: [table.tenantId, table.weddingId],
      foreignColumns: [authoringWeddings.tenantId, authoringWeddings.id],
    }).onDelete("cascade"),
    check(
      "authoring_wedding_copy_portrait_opacity_fraction",
      sql`${table.shareCardPortraitOpacity} is null or ${table.shareCardPortraitOpacity} between 0 and 1`,
    ),
  ],
);

export const authoringWeddingEvents = pgTable(
  "authoring_wedding_events",
  {
    tenantId: text("tenant_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    id: text("id").notNull(),
    title: text("title").notNull(),
    eyebrow: text("eyebrow").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    venue: text("venue").notNull(),
    address: text("address").notNull(),
    mapLabel: text("map_label").notNull(),
    mapHref: text("map_href").notNull(),
    sortOrder: integer("sort_order").notNull(),
    visibility: contentVisibility("visibility").notNull().default("private"),
    privateNotes: text("private_notes"),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.weddingId, table.id] }),
    foreignKey({
      columns: [table.tenantId, table.weddingId],
      foreignColumns: [authoringWeddings.tenantId, authoringWeddings.id],
    }).onDelete("cascade"),
    uniqueIndex("authoring_wedding_events_sort_unique").on(
      table.tenantId,
      table.weddingId,
      table.sortOrder,
    ),
    check(
      "authoring_wedding_events_ends_after_start",
      sql`${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const authoringStoryMilestones = pgTable(
  "authoring_story_milestones",
  {
    tenantId: text("tenant_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    id: text("id").notNull(),
    sequence: text("sequence").notNull(),
    eyebrow: text("eyebrow").notNull(),
    title: text("title").notNull(),
    dateLabel: text("date_label").notNull(),
    narrative: text("narrative"),
    artDirection: text("art_direction"),
    sortOrder: integer("sort_order").notNull(),
    visibility: contentVisibility("visibility").notNull().default("private"),
    privateNotes: text("private_notes"),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.weddingId, table.id] }),
    foreignKey({
      columns: [table.tenantId, table.weddingId],
      foreignColumns: [authoringWeddings.tenantId, authoringWeddings.id],
    }).onDelete("cascade"),
    uniqueIndex("authoring_story_milestones_sort_unique").on(
      table.tenantId,
      table.weddingId,
      table.sortOrder,
    ),
  ],
);

export const authoringPeople = pgTable(
  "authoring_people",
  {
    tenantId: text("tenant_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    id: text("id").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull(),
    group: text("group", {
      enum: ["family", "wedding-party", "ceremony"],
    }).notNull(),
    sortOrder: integer("sort_order").notNull(),
    visibility: contentVisibility("visibility").notNull().default("private"),
    consent: approvalState("consent").notNull().default("pending"),
    privateContact: text("private_contact"),
    privateNotes: text("private_notes"),
    portraitMediaId: text("portrait_media_id"),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.weddingId, table.id] }),
    foreignKey({
      columns: [table.tenantId, table.weddingId],
      foreignColumns: [authoringWeddings.tenantId, authoringWeddings.id],
    }).onDelete("cascade"),
    uniqueIndex("authoring_people_sort_unique").on(
      table.tenantId,
      table.weddingId,
      table.sortOrder,
    ),
  ],
);

export const authoringVendors = pgTable(
  "authoring_vendors",
  {
    tenantId: text("tenant_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    id: text("id").notNull(),
    displayName: text("display_name").notNull(),
    category: text("category").notNull(),
    sortOrder: integer("sort_order").notNull(),
    visibility: contentVisibility("visibility").notNull().default("private"),
    consent: approvalState("consent").notNull().default("pending"),
    creditHref: text("credit_href"),
    contactVisibility: contentVisibility("contact_visibility")
      .notNull()
      .default("private"),
    privateContact: text("private_contact"),
    privateNotes: text("private_notes"),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.weddingId, table.id] }),
    foreignKey({
      columns: [table.tenantId, table.weddingId],
      foreignColumns: [authoringWeddings.tenantId, authoringWeddings.id],
    }).onDelete("cascade"),
    uniqueIndex("authoring_vendors_sort_unique").on(
      table.tenantId,
      table.weddingId,
      table.sortOrder,
    ),
  ],
);

export const authoringMediaAssets = pgTable(
  "authoring_media_assets",
  {
    tenantId: text("tenant_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    id: text("id").notNull(),
    publishedAsset: text("published_asset"),
    sourceKey: text("source_key").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    focalPointX: real("focal_point_x").notNull(),
    focalPointY: real("focal_point_y").notNull(),
    cropVariants: jsonb("crop_variants")
      .$type<Record<string, { key: string; width: number; height: number }>>()
      .notNull(),
    altTreatment: text("alt_treatment").notNull(),
    rights: mediaRightsState("rights").notNull().default("unknown"),
    consent: approvalState("consent").notNull().default("pending"),
    approval: approvalState("approval").notNull().default("pending"),
    visibility: contentVisibility("visibility").notNull().default("private"),
    provenance: jsonb("provenance")
      .$type<Record<string, unknown>>()
      .notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.weddingId, table.id] }),
    foreignKey({
      columns: [table.tenantId, table.weddingId],
      foreignColumns: [authoringWeddings.tenantId, authoringWeddings.id],
    }).onDelete("cascade"),
    check("authoring_media_assets_width_positive", sql`${table.width} > 0`),
    check("authoring_media_assets_height_positive", sql`${table.height} > 0`),
    check(
      "authoring_media_assets_focal_x_fraction",
      sql`${table.focalPointX} between 0 and 1`,
    ),
    check(
      "authoring_media_assets_focal_y_fraction",
      sql`${table.focalPointY} between 0 and 1`,
    ),
  ],
);

export const publishedWeddingRevisions = pgTable(
  "published_wedding_revisions",
  {
    tenantId: text("tenant_id").notNull(),
    weddingId: text("wedding_id").notNull(),
    revision: integer("revision").notNull(),
    sourceAuthoringRevision: integer("source_authoring_revision").notNull(),
    shareCardEdition: text("share_card_edition").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
    publishedBy: text("published_by").notNull(),
    envelope: jsonb("envelope").$type<PublishedWeddingRevision>().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.weddingId, table.revision] }),
    foreignKey({
      columns: [table.tenantId, table.weddingId],
      foreignColumns: [authoringWeddings.tenantId, authoringWeddings.id],
    }).onDelete("restrict"),
    uniqueIndex("published_wedding_source_revision_unique").on(
      table.tenantId,
      table.weddingId,
      table.sourceAuthoringRevision,
    ),
    uniqueIndex("published_wedding_share_card_edition_unique").on(
      table.tenantId,
      table.weddingId,
      table.shareCardEdition,
    ),
    check("published_wedding_revision_positive", sql`${table.revision} > 0`),
  ],
);
