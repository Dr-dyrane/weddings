import {
  PHOTO_CONSENT_VERSION,
  validatePhoto,
} from "@/domains/event-collaboration/event-policy";

type D1RunResult = { success: boolean; meta?: { changes?: number } };

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<D1RunResult>;
};

type D1DatabaseBinding = {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1RunResult[]>;
};

type R2ObjectBody = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
};

type R2BucketBinding = {
  put(
    key: string,
    value: ArrayBuffer,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
};

type EventBindings = {
  DB: D1DatabaseBinding;
  MEDIA: R2BucketBinding;
  STUDIO_OWNER_EMAILS?: string;
};

export type CelebrationCreditRecord = {
  id: string;
  weddingId: string;
  kind: "person" | "vendor";
  displayName: string;
  role: string;
  groupName: string;
  sortOrder: number;
  visibility: "private" | "public";
  consent: "pending" | "approved";
};

export type PhotoCollectionRecord = {
  id: string;
  weddingId: string;
  label: string;
  state: "active" | "revoked";
  opensAt: string;
  expiresAt: string;
  retentionDays: number;
  createdAt: string;
  revokedAt: string | null;
};

export type PhotoSubmissionRecord = {
  id: string;
  collectionId: string;
  weddingId: string;
  originalFilename: string;
  mediaType: string;
  byteSize: number;
  uploaderName: string | null;
  consentVersion: string;
  moderationState: "pending" | "approved" | "rejected" | "deleted";
  createdAt: string;
  moderatedAt: string | null;
  objectKey: string;
};

export type RSVPRecord = {
  id: string;
  weddingId: string;
  attendance: "yes" | "no";
  guestName: string;
  menuChoice: string | null;
  note: string | null;
  createdAt: string;
};

export type StudioDashboard = {
  hubVisibility: "closed" | "public";
  retentionDays: number;
  credits: CelebrationCreditRecord[];
  collections: PhotoCollectionRecord[];
  submissions: PhotoSubmissionRecord[];
  rsvps: RSVPRecord[];
};

export type ResolvedPhotoCollection = PhotoCollectionRecord & {
  availability: "active" | "not-open" | "expired" | "revoked";
};

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS celebration_settings (
    wedding_id TEXT PRIMARY KEY NOT NULL,
    hub_visibility TEXT NOT NULL DEFAULT 'closed',
    retention_days INTEGER NOT NULL DEFAULT 90,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS celebration_credits (
    id TEXT PRIMARY KEY NOT NULL,
    wedding_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    group_name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'private',
    consent TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_celebration_credits_wedding_public
    ON celebration_credits (wedding_id, visibility, consent, sort_order)`,
  `CREATE TABLE IF NOT EXISTS photo_collections (
    id TEXT PRIMARY KEY NOT NULL,
    wedding_id TEXT NOT NULL,
    label TEXT NOT NULL,
    credential_hash TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'active',
    opens_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    retention_days INTEGER NOT NULL DEFAULT 90,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_collections_credential_hash
    ON photo_collections (credential_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_photo_collections_wedding_created
    ON photo_collections (wedding_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS photo_submissions (
    id TEXT PRIMARY KEY NOT NULL,
    collection_id TEXT NOT NULL,
    wedding_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    object_key TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    media_type TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    uploader_name TEXT,
    consent_version TEXT NOT NULL,
    moderation_state TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    moderated_at TEXT,
    moderated_by TEXT,
    deleted_at TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_submissions_collection_idempotency
    ON photo_submissions (collection_id, idempotency_key)`,
  `CREATE INDEX IF NOT EXISTS idx_photo_submissions_wedding_created
    ON photo_submissions (wedding_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_photo_submissions_collection_recent
    ON photo_submissions (collection_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS photo_rate_limits (
    collection_id TEXT NOT NULL,
    source_fingerprint TEXT NOT NULL,
    window_started_at TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 1
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_rate_limits_window
    ON photo_rate_limits (collection_id, source_fingerprint, window_started_at)`,
  `CREATE TABLE IF NOT EXISTS rsvp_responses (
    id TEXT PRIMARY KEY NOT NULL,
    wedding_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    attendance TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    menu_choice TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_rsvp_responses_wedding_idempotency
    ON rsvp_responses (wedding_id, idempotency_key)`,
  `CREATE INDEX IF NOT EXISTS idx_rsvp_responses_wedding_created
    ON rsvp_responses (wedding_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS rsvp_rate_limits (
    wedding_id TEXT NOT NULL,
    source_fingerprint TEXT NOT NULL,
    window_started_at TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 1
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_rsvp_rate_limits_window
    ON rsvp_rate_limits (wedding_id, source_fingerprint, window_started_at)`,
] as const;

let schemaReady: Promise<void> | undefined;

function getBindings(): EventBindings {
  const bindings = (
    globalThis as typeof globalThis & {
      __dyraneEventBindings?: Partial<EventBindings>;
    }
  ).__dyraneEventBindings;
  if (!bindings?.DB || !bindings.MEDIA) {
    throw new Error("Event collaboration storage is unavailable.");
  }
  return bindings as EventBindings;
}

export function getConfiguredStudioOwnerEmails() {
  const value = (
    globalThis as typeof globalThis & {
      __dyraneEventBindings?: Partial<EventBindings>;
    }
  ).__dyraneEventBindings?.STUDIO_OWNER_EMAILS;
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function ensureEventSchema() {
  schemaReady ??= (async () => {
    const { DB } = getBindings();
    await DB.batch(
      SCHEMA_STATEMENTS.map((statement) => DB.prepare(statement)),
    );
  })();
  return schemaReady;
}

async function database() {
  await ensureEventSchema();
  return getBindings().DB;
}

function mapCredit(row: Record<string, unknown>): CelebrationCreditRecord {
  return {
    id: String(row.id),
    weddingId: String(row.wedding_id),
    kind: row.kind === "vendor" ? "vendor" : "person",
    displayName: String(row.display_name),
    role: String(row.role),
    groupName: String(row.group_name),
    sortOrder: Number(row.sort_order),
    visibility: row.visibility === "public" ? "public" : "private",
    consent: row.consent === "approved" ? "approved" : "pending",
  };
}

function mapCollection(row: Record<string, unknown>): PhotoCollectionRecord {
  return {
    id: String(row.id),
    weddingId: String(row.wedding_id),
    label: String(row.label),
    state: row.state === "revoked" ? "revoked" : "active",
    opensAt: String(row.opens_at),
    expiresAt: String(row.expires_at),
    retentionDays: Number(row.retention_days),
    createdAt: String(row.created_at),
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
  };
}

function mapSubmission(row: Record<string, unknown>): PhotoSubmissionRecord {
  const moderationState = ["approved", "rejected", "deleted"].includes(
    String(row.moderation_state),
  )
    ? (String(row.moderation_state) as PhotoSubmissionRecord["moderationState"])
    : "pending";
  return {
    id: String(row.id),
    collectionId: String(row.collection_id),
    weddingId: String(row.wedding_id),
    originalFilename: String(row.original_filename),
    mediaType: String(row.media_type),
    byteSize: Number(row.byte_size),
    uploaderName: row.uploader_name ? String(row.uploader_name) : null,
    consentVersion: String(row.consent_version),
    moderationState,
    createdAt: String(row.created_at),
    moderatedAt: row.moderated_at ? String(row.moderated_at) : null,
    objectKey: String(row.object_key),
  };
}

function mapRsvp(row: Record<string, unknown>): RSVPRecord {
  return {
    id: String(row.id),
    weddingId: String(row.wedding_id),
    attendance: row.attendance === "no" ? "no" : "yes",
    guestName: String(row.guest_name),
    menuChoice: row.menu_choice ? String(row.menu_choice) : null,
    note: row.note ? String(row.note) : null,
    createdAt: String(row.created_at),
  };
}

async function ensureWeddingSettings(weddingId: string) {
  const db = await database();
  await db
    .prepare(
      `INSERT INTO celebration_settings (wedding_id)
       VALUES (?) ON CONFLICT(wedding_id) DO NOTHING`,
    )
    .bind(weddingId)
    .run();
}

export async function getPublicCredits(weddingId: string) {
  await ensureWeddingSettings(weddingId);
  const db = await database();
  const settings = await db
    .prepare(
      `SELECT hub_visibility, retention_days
       FROM celebration_settings WHERE wedding_id = ?`,
    )
    .bind(weddingId)
    .first<Record<string, unknown>>();
  const { results } = await db
    .prepare(
      `SELECT * FROM celebration_credits
       WHERE wedding_id = ? AND visibility = 'public' AND consent = 'approved'
       ORDER BY sort_order ASC, created_at ASC`,
    )
    .bind(weddingId)
    .all<Record<string, unknown>>();

  return {
    enabled: settings?.hub_visibility === "public",
    credits: results.map(mapCredit),
  };
}

export async function getStudioDashboard(
  weddingId: string,
): Promise<StudioDashboard> {
  await ensureWeddingSettings(weddingId);
  await purgeExpiredPhotoSubmissions(weddingId);
  const db = await database();
  const [settings, credits, collections, submissions, rsvps] = await Promise.all([
    db
      .prepare(`SELECT * FROM celebration_settings WHERE wedding_id = ?`)
      .bind(weddingId)
      .first<Record<string, unknown>>(),
    db
      .prepare(
        `SELECT * FROM celebration_credits WHERE wedding_id = ?
         ORDER BY sort_order ASC, created_at ASC`,
      )
      .bind(weddingId)
      .all<Record<string, unknown>>(),
    db
      .prepare(
        `SELECT * FROM photo_collections WHERE wedding_id = ?
         ORDER BY created_at DESC`,
      )
      .bind(weddingId)
      .all<Record<string, unknown>>(),
    db
      .prepare(
        `SELECT * FROM photo_submissions
         WHERE wedding_id = ? AND moderation_state != 'deleted'
         ORDER BY created_at DESC LIMIT 200`,
      )
      .bind(weddingId)
      .all<Record<string, unknown>>(),
    db
      .prepare(
        `SELECT * FROM rsvp_responses
         WHERE wedding_id = ? ORDER BY created_at DESC LIMIT 500`,
      )
      .bind(weddingId)
      .all<Record<string, unknown>>(),
  ]);

  return {
    hubVisibility:
      settings?.hub_visibility === "public" ? "public" : "closed",
    retentionDays: Number(settings?.retention_days ?? 90),
    credits: credits.results.map(mapCredit),
    collections: collections.results.map(mapCollection),
    submissions: submissions.results.map(mapSubmission),
    rsvps: rsvps.results.map(mapRsvp),
  };
}

export async function saveRsvpResponse(input: {
  weddingId: string;
  idempotencyKey: string;
  attendance: "yes" | "no";
  guestName: string;
  menuChoice: string | null;
  note: string | null;
  sourceFingerprint: string;
}) {
  const db = await database();
  const existing = await db
    .prepare(
      `SELECT * FROM rsvp_responses
       WHERE wedding_id = ? AND idempotency_key = ?`,
    )
    .bind(input.weddingId, input.idempotencyKey)
    .first<Record<string, unknown>>();
  if (existing) return mapRsvp(existing);

  const windowStartedAt = new Date(
    Math.floor(Date.now() / 600_000) * 600_000,
  ).toISOString();
  await db
    .prepare(
      `DELETE FROM rsvp_rate_limits
       WHERE window_started_at < datetime('now', '-1 day')`,
    )
    .run();
  await db
    .prepare(
      `INSERT INTO rsvp_rate_limits
       (wedding_id, source_fingerprint, window_started_at, attempt_count)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(wedding_id, source_fingerprint, window_started_at)
       DO UPDATE SET attempt_count = attempt_count + 1`,
    )
    .bind(input.weddingId, input.sourceFingerprint, windowStartedAt)
    .run();
  const recent = await db
    .prepare(
      `SELECT attempt_count AS count FROM rsvp_rate_limits
       WHERE wedding_id = ? AND source_fingerprint = ? AND window_started_at = ?`,
    )
    .bind(input.weddingId, input.sourceFingerprint, windowStartedAt)
    .first<{ count: number }>();
  if (Number(recent?.count ?? 0) > 8) {
    throw new Error("Please wait a few minutes before trying again.");
  }

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO rsvp_responses
       (id, wedding_id, idempotency_key, attendance, guest_name, menu_choice, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.weddingId,
      input.idempotencyKey,
      input.attendance,
      input.guestName,
      input.menuChoice,
      input.note,
    )
    .run();

  return {
    id,
    weddingId: input.weddingId,
    attendance: input.attendance,
    guestName: input.guestName,
    menuChoice: input.menuChoice,
    note: input.note,
    createdAt: new Date().toISOString(),
  } satisfies RSVPRecord;
}

export async function deleteRsvpResponse(
  weddingId: string,
  rsvpId: string,
) {
  const db = await database();
  await db
    .prepare(`DELETE FROM rsvp_responses WHERE id = ? AND wedding_id = ?`)
    .bind(rsvpId, weddingId)
    .run();
}

export async function setHubVisibility(
  weddingId: string,
  visibility: "closed" | "public",
) {
  await ensureWeddingSettings(weddingId);
  const db = await database();
  if (visibility === "public") {
    const approved = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM celebration_credits
         WHERE wedding_id = ? AND visibility = 'public' AND consent = 'approved'`,
      )
      .bind(weddingId)
      .first<{ count: number }>();
    if (Number(approved?.count ?? 0) === 0) {
      throw new Error("Approve at least one public credit before publishing.");
    }
  }
  await db
    .prepare(
      `UPDATE celebration_settings
       SET hub_visibility = ?, updated_at = CURRENT_TIMESTAMP
       WHERE wedding_id = ?`,
    )
    .bind(visibility, weddingId)
    .run();
}

export async function createCredit(
  weddingId: string,
  input: Omit<CelebrationCreditRecord, "id" | "weddingId">,
) {
  const db = await database();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO celebration_credits
       (id, wedding_id, kind, display_name, role, group_name, sort_order, visibility, consent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      weddingId,
      input.kind,
      input.displayName,
      input.role,
      input.groupName,
      input.sortOrder,
      input.visibility,
      input.consent,
    )
    .run();
  return id;
}

export async function deleteCredit(weddingId: string, creditId: string) {
  const db = await database();
  await db
    .prepare(`DELETE FROM celebration_credits WHERE id = ? AND wedding_id = ?`)
    .bind(creditId, weddingId)
    .run();
}

function encodeToken(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function hashCollectionCredential(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function createPhotoCollection(input: {
  weddingId: string;
  label: string;
  opensAt: string;
  expiresAt: string;
  retentionDays: number;
  createdBy: string;
}) {
  const credentialBytes = crypto.getRandomValues(new Uint8Array(32));
  const credential = encodeToken(credentialBytes);
  const credentialHash = await hashCollectionCredential(credential);
  const id = crypto.randomUUID();
  const db = await database();
  await db
    .prepare(
      `INSERT INTO photo_collections
       (id, wedding_id, label, credential_hash, opens_at, expires_at, retention_days, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.weddingId,
      input.label,
      credentialHash,
      input.opensAt,
      input.expiresAt,
      input.retentionDays,
      input.createdBy,
    )
    .run();

  return { id, credential };
}

export async function revokePhotoCollection(
  weddingId: string,
  collectionId: string,
) {
  const db = await database();
  await db
    .prepare(
      `UPDATE photo_collections
       SET state = 'revoked', revoked_at = CURRENT_TIMESTAMP
       WHERE id = ? AND wedding_id = ?`,
    )
    .bind(collectionId, weddingId)
    .run();
}

export async function resolvePhotoCollection(
  weddingId: string,
  credential: string,
): Promise<ResolvedPhotoCollection | null> {
  await purgeExpiredPhotoSubmissions(weddingId);
  const credentialHash = await hashCollectionCredential(credential);
  const db = await database();
  const row = await db
    .prepare(
      `SELECT * FROM photo_collections
       WHERE wedding_id = ? AND credential_hash = ?`,
    )
    .bind(weddingId, credentialHash)
    .first<Record<string, unknown>>();
  if (!row) return null;

  const collection = mapCollection(row);
  const now = new Date().toISOString();
  const availability =
    collection.state === "revoked"
      ? "revoked"
      : now < collection.opensAt
        ? "not-open"
        : now >= collection.expiresAt
          ? "expired"
          : "active";
  return { ...collection, availability };
}

export async function savePhotoSubmission(input: {
  collection: ResolvedPhotoCollection;
  file: File;
  idempotencyKey: string;
  sourceFingerprint: string;
  uploaderName: string | null;
}) {
  if (input.collection.availability !== "active") {
    throw new Error("This guest camera is not accepting photos.");
  }
  const db = await database();
  const activeCollection = await db
    .prepare(
      `SELECT id FROM photo_collections
       WHERE id = ? AND wedding_id = ? AND state = 'active'
         AND datetime(opens_at) <= CURRENT_TIMESTAMP
         AND datetime(expires_at) > CURRENT_TIMESTAMP`,
    )
    .bind(input.collection.id, input.collection.weddingId)
    .first<{ id: string }>();
  if (!activeCollection) {
    throw new Error("This guest camera is not accepting photos.");
  }
  const existing = await db
    .prepare(
      `SELECT * FROM photo_submissions
       WHERE collection_id = ? AND idempotency_key = ?`,
    )
    .bind(input.collection.id, input.idempotencyKey)
    .first<Record<string, unknown>>();
  if (existing) return mapSubmission(existing);

  const windowStartedAt = new Date(
    Math.floor(Date.now() / 600_000) * 600_000,
  ).toISOString();
  await db
    .prepare(
      `DELETE FROM photo_rate_limits
       WHERE window_started_at < datetime('now', '-1 day')`,
    )
    .run();
  await db
    .prepare(
      `INSERT INTO photo_rate_limits
       (collection_id, source_fingerprint, window_started_at, attempt_count)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(collection_id, source_fingerprint, window_started_at)
       DO UPDATE SET attempt_count = attempt_count + 1`,
    )
    .bind(input.collection.id, input.sourceFingerprint, windowStartedAt)
    .run();
  const recent = await db
    .prepare(
      `SELECT attempt_count AS count FROM photo_rate_limits
       WHERE collection_id = ? AND source_fingerprint = ? AND window_started_at = ?`,
    )
    .bind(input.collection.id, input.sourceFingerprint, windowStartedAt)
    .first<{ count: number }>();
  if (Number(recent?.count ?? 0) > 8) {
    throw new Error("The guest camera is busy. Please try again shortly.");
  }

  const validated = await validatePhoto(input.file);
  const submissionId = crypto.randomUUID();
  const objectKey = `${input.collection.weddingId}/${input.collection.id}/${submissionId}.${validated.extension}`;
  const { MEDIA } = getBindings();
  await MEDIA.put(objectKey, validated.bytes, {
    httpMetadata: { contentType: validated.mediaType },
    customMetadata: {
      weddingId: input.collection.weddingId,
      collectionId: input.collection.id,
      consentVersion: PHOTO_CONSENT_VERSION,
    },
  });

  try {
    await db
      .prepare(
        `INSERT INTO photo_submissions
         (id, collection_id, wedding_id, idempotency_key, object_key,
          original_filename, media_type, byte_size, uploader_name, consent_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        submissionId,
        input.collection.id,
        input.collection.weddingId,
        input.idempotencyKey,
        objectKey,
        input.file.name.slice(0, 180) || `photo.${validated.extension}`,
        validated.mediaType,
        input.file.size,
        input.uploaderName?.slice(0, 80) || null,
        PHOTO_CONSENT_VERSION,
      )
      .run();
  } catch (error) {
    await MEDIA.delete(objectKey);
    throw error;
  }

  return {
    id: submissionId,
    collectionId: input.collection.id,
    weddingId: input.collection.weddingId,
    originalFilename: input.file.name,
    mediaType: validated.mediaType,
    byteSize: input.file.size,
    uploaderName: input.uploaderName,
    consentVersion: PHOTO_CONSENT_VERSION,
    moderationState: "pending" as const,
    createdAt: new Date().toISOString(),
    moderatedAt: null,
    objectKey,
  };
}

export async function getPhotoSubmission(
  weddingId: string,
  submissionId: string,
) {
  const db = await database();
  const row = await db
    .prepare(
      `SELECT * FROM photo_submissions
       WHERE id = ? AND wedding_id = ? AND moderation_state != 'deleted'`,
    )
    .bind(submissionId, weddingId)
    .first<Record<string, unknown>>();
  return row ? mapSubmission(row) : null;
}

export async function getPhotoObject(objectKey: string) {
  return getBindings().MEDIA.get(objectKey);
}

export async function moderatePhotoSubmission(input: {
  weddingId: string;
  submissionId: string;
  state: "approved" | "rejected";
  moderatedBy: string;
}) {
  const db = await database();
  await db
    .prepare(
      `UPDATE photo_submissions
       SET moderation_state = ?, moderated_at = CURRENT_TIMESTAMP, moderated_by = ?
       WHERE id = ? AND wedding_id = ? AND moderation_state != 'deleted'`,
    )
    .bind(input.state, input.moderatedBy, input.submissionId, input.weddingId)
    .run();
}

export async function deletePhotoSubmission(
  weddingId: string,
  submissionId: string,
  deletedBy: string,
) {
  const submission = await getPhotoSubmission(weddingId, submissionId);
  if (!submission) return;
  const db = await database();
  await getBindings().MEDIA.delete(submission.objectKey);
  await db
    .prepare(
      `UPDATE photo_submissions
       SET moderation_state = 'deleted', deleted_at = CURRENT_TIMESTAMP,
           moderated_at = CURRENT_TIMESTAMP, moderated_by = ?,
           object_key = '', original_filename = 'deleted', media_type = 'deleted',
           byte_size = 0, uploader_name = NULL
       WHERE id = ? AND wedding_id = ?`,
    )
    .bind(deletedBy, submissionId, weddingId)
    .run();
}

export async function purgeExpiredPhotoSubmissions(weddingId: string) {
  const db = await database();
  const expired = await db
    .prepare(
      `SELECT s.id, s.object_key
       FROM photo_submissions s
       JOIN photo_collections c ON c.id = s.collection_id
       WHERE s.wedding_id = ?
         AND s.moderation_state != 'deleted'
         AND datetime(c.expires_at, '+' || c.retention_days || ' days') <= CURRENT_TIMESTAMP
       LIMIT 50`,
    )
    .bind(weddingId)
    .all<{ id: string; object_key: string }>();
  if (expired.results.length === 0) return 0;

  const { MEDIA } = getBindings();
  for (const row of expired.results) {
    await MEDIA.delete(row.object_key);
  }
  await db.batch(
    expired.results.map((row) =>
      db
        .prepare(
          `UPDATE photo_submissions
           SET moderation_state = 'deleted', deleted_at = CURRENT_TIMESTAMP,
               moderated_at = CURRENT_TIMESTAMP, moderated_by = 'retention-policy',
               object_key = '', original_filename = 'deleted', media_type = 'deleted',
               byte_size = 0, uploader_name = NULL
           WHERE id = ?`,
        )
        .bind(row.id),
    ),
  );
  return expired.results.length;
}
