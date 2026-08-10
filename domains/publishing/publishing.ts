import { z } from "zod";

import {
  publishedWeddingSchema,
  type PublishedWedding,
} from "../weddings/published-wedding";

const identifierSchema = z.string().min(1).max(120);
const approvalStateSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "simulation",
]);
const visibilitySchema = z.enum(["private", "public"]);

const linkSchema = z.object({
  label: z.string().min(1).max(120),
  href: z.string().min(1),
});

const authoringEventSchema = z.object({
  id: identifierSchema,
  title: z.string().min(1),
  eyebrow: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  venue: z.string().min(1),
  address: z.string().min(1),
  map: linkSchema,
  sortOrder: z.number().int().nonnegative(),
  visibility: visibilitySchema,
  privateNotes: z.string().optional(),
});

const authoringMilestoneSchema = z.object({
  id: identifierSchema,
  sequence: z.string().min(1),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  dateLabel: z.string().min(1),
  narrative: z.string().optional(),
  artDirection: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
  visibility: visibilitySchema,
  privateNotes: z.string().optional(),
});

const authoringPersonSchema = z.object({
  id: identifierSchema,
  displayName: z.string().min(1).max(80),
  role: z.string().min(1).max(64),
  group: z.enum(["family", "wedding-party", "ceremony"]),
  sortOrder: z.number().int().nonnegative(),
  visibility: visibilitySchema,
  consent: approvalStateSchema,
  privateContact: z.string().optional(),
  privateNotes: z.string().optional(),
  portraitMediaId: identifierSchema.optional(),
});

const authoringVendorSchema = z.object({
  id: identifierSchema,
  displayName: z.string().min(1).max(80),
  category: z.string().min(1).max(64),
  sortOrder: z.number().int().nonnegative(),
  visibility: visibilitySchema,
  consent: approvalStateSchema,
  creditHref: z.string().optional(),
  contactVisibility: visibilitySchema,
  privateContact: z.string().optional(),
  privateNotes: z.string().optional(),
});

const authoringMediaAssetSchema = z.object({
  id: identifierSchema,
  publishedAsset: z.literal("alexander-chioma-line-v5").optional(),
  sourceKey: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  focalPoint: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }),
  cropVariants: z.record(z.string(), z.unknown()),
  altTreatment: z.string().min(1),
  rights: z.enum(["unknown", "approved", "rejected"]),
  consent: approvalStateSchema,
  approval: approvalStateSchema,
  visibility: visibilitySchema,
  provenance: z.record(z.string(), z.unknown()),
  privateNotes: z.string().optional(),
});

export const publicationIdentitySchema = z.object({
  tenantId: identifierSchema,
  weddingId: identifierSchema,
});

export const publicationAddressSchema = publicationIdentitySchema.extend({
  revision: z.number().int().positive(),
});

export const authoringWeddingSchema = z.object({
  tenantId: identifierSchema,
  weddingId: identifierSchema,
  draftRevision: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9_]+$/),
  locale: z.string().min(2),
  timezone: z.string().min(1),
  approval: approvalStateSchema,
  couple: z.object({
    first: z.string().min(1).max(40),
    second: z.string().min(1).max(40),
  }),
  shareCard: z
    .object({
      portraitMediaId: identifierSchema,
      portraitOpacity: z.number().min(0).max(1),
    })
    .optional(),
  invitation: z.object({
    eyebrow: z.string().min(1).max(80),
    headline: z.string().min(1).max(120),
    introduction: z.string().min(1).max(180),
  }),
  dateLabel: z.string().min(1).max(64),
  locationLabel: z.string().min(1).max(80),
  story: z.array(authoringMilestoneSchema),
  events: z.array(authoringEventSchema),
  dress: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    guidance: z.string().min(1),
    paletteLabel: z.string().min(1).max(80),
    reservation: z.string().min(1).max(180),
    palette: z
      .array(
        z.object({
          name: z.string().min(1),
          hex: z.string().regex(/^#[0-9a-f]{6}$/i),
        }),
      )
      .min(1)
      .max(4),
  }),
  people: z.array(authoringPersonSchema),
  vendors: z.array(authoringVendorSchema),
  mediaAssets: z.array(authoringMediaAssetSchema),
  theme: z.object({
    id: identifierSchema,
    version: z.number().int().positive(),
    approval: approvalStateSchema,
  }),
  privateNotes: z.string().optional(),
});

export const publishedWeddingRevisionSchema = z
  .object({
    tenantId: identifierSchema,
    weddingId: identifierSchema,
    revision: z.number().int().positive(),
    sourceDraftRevision: z.number().int().positive(),
    shareCardEdition: z.string().regex(/^revision-[1-9][0-9]*$/),
    generatedAt: z.string().datetime({ offset: true }),
    publishedBy: identifierSchema,
    snapshot: publishedWeddingSchema,
  })
  .superRefine((publication, context) => {
    if (publication.snapshot.id !== publication.weddingId) {
      context.addIssue({
        code: "custom",
        message: "Snapshot wedding identity must match its publication envelope.",
        path: ["snapshot", "id"],
      });
    }

    if (publication.snapshot.revision !== publication.revision) {
      context.addIssue({
        code: "custom",
        message: "Snapshot revision must match its publication envelope.",
        path: ["snapshot", "revision"],
      });
    }

    if (publication.shareCardEdition !== `revision-${publication.revision}`) {
      context.addIssue({
        code: "custom",
        message: "Share-card edition must be derived from the immutable revision.",
        path: ["shareCardEdition"],
      });
    }
  });

export type PublicationIdentity = z.infer<typeof publicationIdentitySchema>;
export type PublicationAddress = z.infer<typeof publicationAddressSchema>;
export type AuthoringWedding = z.infer<typeof authoringWeddingSchema>;
export type PublishedWeddingRevision = z.infer<
  typeof publishedWeddingRevisionSchema
>;

export interface PublishingTransaction {
  getActiveRevision(identity: PublicationIdentity): Promise<number | null>;
  getNextRevision(identity: PublicationIdentity): Promise<number>;
  getPublishedRevision(
    address: PublicationAddress,
  ): Promise<PublishedWeddingRevision | null>;
  appendPublishedRevision(
    publication: PublishedWeddingRevision,
  ): Promise<void>;
  setActiveRevision(
    identity: PublicationIdentity,
    revision: number,
    expectedActiveRevision: number | null,
  ): Promise<void>;
}

export interface PublishingRepository {
  /**
   * Adapters must commit the snapshot append and active-revision compare/swap
   * together, and must discard both when the operation throws.
   */
  transaction<T>(
    operation: (transaction: PublishingTransaction) => Promise<T>,
  ): Promise<T>;
}

export class PublicationConflictError extends Error {
  constructor(
    message = "The active publication changed before this operation completed.",
  ) {
    super(message);
    this.name = "PublicationConflictError";
  }
}

export class PublicationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicationValidationError";
  }
}

export class PublishedRevisionNotFoundError extends Error {
  constructor(address: PublicationAddress) {
    super(
      `Published revision ${address.tenantId}/${address.weddingId}/${address.revision} does not exist.`,
    );
    this.name = "PublishedRevisionNotFoundError";
  }
}

function assertPublishable(draft: AuthoringWedding) {
  if (draft.approval !== "approved") {
    throw new PublicationValidationError(
      "Wedding facts require approval before publication.",
    );
  }

  if (draft.theme.approval !== "approved") {
    throw new PublicationValidationError(
      "The selected theme version requires approval before publication.",
    );
  }

  for (const person of draft.people) {
    if (person.visibility === "public" && person.consent !== "approved") {
      throw new PublicationValidationError(
        `Public person ${person.id} requires explicit consent.`,
      );
    }
  }

  for (const vendor of draft.vendors) {
    if (vendor.visibility === "public" && vendor.consent !== "approved") {
      throw new PublicationValidationError(
        `Public vendor ${vendor.id} requires explicit consent.`,
      );
    }
  }

  for (const media of draft.mediaAssets) {
    if (
      media.visibility === "public" &&
      (media.consent !== "approved" ||
        media.rights !== "approved" ||
        media.approval !== "approved")
    ) {
      throw new PublicationValidationError(
        `Public media ${media.id} requires approved consent, rights, and content review.`,
      );
    }
  }
}

function compileShareCard(draft: AuthoringWedding) {
  if (!draft.shareCard) return undefined;

  const portrait = draft.mediaAssets.find(
    (media) => media.id === draft.shareCard?.portraitMediaId,
  );

  if (
    !portrait ||
    portrait.visibility !== "public" ||
    portrait.consent !== "approved" ||
    portrait.rights !== "approved" ||
    portrait.approval !== "approved" ||
    !portrait.publishedAsset
  ) {
    throw new PublicationValidationError(
      "The share-card portrait must reference approved public media.",
    );
  }

  return {
    portraitAsset: portrait.publishedAsset,
    portraitOpacity: draft.shareCard.portraitOpacity,
  };
}

function compileSnapshot(
  draft: AuthoringWedding,
  revision: number,
): PublishedWedding {
  assertPublishable(draft);

  return publishedWeddingSchema.parse({
    id: draft.weddingId,
    slug: draft.slug,
    revision,
    status: "published",
    locale: draft.locale,
    timezone: draft.timezone,
    couple: draft.couple,
    shareCard: compileShareCard(draft),
    invitation: draft.invitation,
    dateLabel: draft.dateLabel,
    locationLabel: draft.locationLabel,
    story: draft.story
      .filter((milestone) => milestone.visibility === "public")
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(({ id, sequence, eyebrow, title, dateLabel }) => ({
        id,
        sequence,
        eyebrow,
        title,
        dateLabel,
      })),
    events: draft.events
      .filter((event) => event.visibility === "public")
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(
        ({ id, title, eyebrow, startsAt, endsAt, venue, address, map }) => ({
          id,
          title,
          eyebrow,
          startsAt,
          endsAt,
          venue,
          address,
          map,
        }),
      ),
    dress: draft.dress,
    people: draft.people
      .filter((person) => person.visibility === "public")
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(({ id, displayName, role, group, consent }) => ({
        id,
        displayName,
        role,
        group,
        consent,
      })),
    vendors: draft.vendors
      .filter((vendor) => vendor.visibility === "public")
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(({ id, displayName, category, consent }) => ({
        id,
        displayName,
        category,
        consent,
      })),
    theme: {
      id: draft.theme.id,
      version: draft.theme.version,
    },
  });
}

export interface PublishWeddingCommand {
  draft: unknown;
  publishedBy: string;
  expectedActiveRevision: number | null;
  generatedAt?: Date;
}

export async function publishWedding(
  repository: PublishingRepository,
  command: PublishWeddingCommand,
) {
  return repository.transaction(async (transaction) => {
    const draft = authoringWeddingSchema.parse(command.draft);
    const identity = {
      tenantId: draft.tenantId,
      weddingId: draft.weddingId,
    };
    const activeRevision = await transaction.getActiveRevision(identity);

    if (activeRevision !== command.expectedActiveRevision) {
      throw new PublicationConflictError();
    }

    const revision = await transaction.getNextRevision(identity);
    const snapshot = compileSnapshot(draft, revision);
    const publication = publishedWeddingRevisionSchema.parse({
      ...identity,
      revision,
      sourceDraftRevision: draft.draftRevision,
      shareCardEdition: `revision-${revision}`,
      generatedAt: (command.generatedAt ?? new Date()).toISOString(),
      publishedBy: command.publishedBy,
      snapshot,
    });

    await transaction.appendPublishedRevision(publication);
    await transaction.setActiveRevision(
      identity,
      revision,
      command.expectedActiveRevision,
    );

    return immutableCopy(publication);
  });
}

export interface RollbackPublicationCommand extends PublicationAddress {
  expectedActiveRevision: number;
}

export async function rollbackPublication(
  repository: PublishingRepository,
  command: RollbackPublicationCommand,
) {
  return repository.transaction(async (transaction) => {
    const address = publicationAddressSchema.parse(command);
    const publication = await transaction.getPublishedRevision(address);

    if (!publication) {
      throw new PublishedRevisionNotFoundError(address);
    }

    await transaction.setActiveRevision(
      address,
      address.revision,
      command.expectedActiveRevision,
    );

    return immutableCopy(publication);
  });
}

export function immutableCopy<T>(value: T): T {
  return deepFreeze(structuredClone(value));
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}
