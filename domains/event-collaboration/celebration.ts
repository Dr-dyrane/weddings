import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import { getSiteOrigin } from "@/domains/weddings/site-origin";
import type { CelebrationCreditRecord } from "@/domains/event-collaboration/event-store";

const PEOPLE_GROUPS = ["family", "wedding-party", "ceremony"] as const;

const PEOPLE_GROUP_LABELS = {
  family: "Family",
  "wedding-party": "Wedding party",
  ceremony: "Ceremony",
} satisfies Record<(typeof PEOPLE_GROUPS)[number], string>;

export type CelebrationProjection = {
  couple: PublishedWedding["couple"];
  weddingSlug: PublishedWedding["slug"];
  dateLabel: PublishedWedding["dateLabel"];
  locationLabel: PublishedWedding["locationLabel"];
  contentState: "provisional" | "published";
  peopleGroups: Array<{
    id: string;
    label: string;
    people: Array<{
      id: string;
      displayName: string;
      role: string;
      isProvisional: boolean;
    }>;
  }>;
  vendors: Array<{
    id: string;
    displayName: string;
    category: string;
    isProvisional: boolean;
  }>;
  photoContribution: {
    state: "credential-required";
    fallbackPath: string;
    qrTargetPathTemplate: string;
  };
};

export function getCelebrationPath(
  wedding: Pick<PublishedWedding, "slug">,
) {
  return `/${encodeURIComponent(wedding.slug)}/celebration`;
}

export function getGuestPhotoFallbackPath(
  wedding: Pick<PublishedWedding, "slug">,
) {
  return `${getCelebrationPath(wedding)}/photos`;
}

export function getGuestPhotoFallbackUrl(
  wedding: Pick<PublishedWedding, "slug">,
  origin: URL = getSiteOrigin(),
) {
  return new URL(getGuestPhotoFallbackPath(wedding), origin).href;
}

export function getGuestPhotoQrTargetPathTemplate(
  wedding: Pick<PublishedWedding, "slug">,
) {
  return `${getGuestPhotoFallbackPath(wedding)}/[opaqueCollectionCredential]`;
}

export function isOpaqueCollectionCredential(value: string) {
  return /^[A-Za-z0-9_-]{32,128}$/.test(value);
}

export function getGuestPhotoQrTargetPath(
  wedding: Pick<PublishedWedding, "slug">,
  opaqueCollectionCredential: string,
) {
  if (!isOpaqueCollectionCredential(opaqueCollectionCredential)) {
    throw new Error("A valid opaque collection credential is required.");
  }

  return `${getGuestPhotoFallbackPath(wedding)}/${encodeURIComponent(
    opaqueCollectionCredential,
  )}`;
}

export function projectWeddingForCelebration(
  wedding: PublishedWedding,
): CelebrationProjection {
  return {
    couple: wedding.couple,
    weddingSlug: wedding.slug,
    dateLabel: wedding.dateLabel,
    locationLabel: wedding.locationLabel,
    contentState:
      wedding.status === "published" ? "published" : "provisional",
    peopleGroups: PEOPLE_GROUPS.map((group) => ({
      id: group,
      label: PEOPLE_GROUP_LABELS[group],
      people: wedding.people
        .filter((person) => person.group === group)
        .map((person) => ({
          id: person.id,
          displayName: person.displayName,
          role: person.role,
          isProvisional: person.consent === "simulation",
        })),
    })).filter((group) => group.people.length > 0),
    vendors: wedding.vendors.map((vendor) => ({
      id: vendor.id,
      displayName: vendor.displayName,
      category: vendor.category,
      isProvisional: vendor.consent === "simulation",
    })),
    photoContribution: {
      state: "credential-required",
      fallbackPath: getGuestPhotoFallbackPath(wedding),
      qrTargetPathTemplate: getGuestPhotoQrTargetPathTemplate(wedding),
    },
  };
}

function titleCaseGroup(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function projectPublishedCreditsForCelebration(
  wedding: PublishedWedding,
  credits: CelebrationCreditRecord[],
): CelebrationProjection {
  const publicCredits = credits.filter(
    (credit) =>
      credit.visibility === "public" && credit.consent === "approved",
  );
  const people = publicCredits.filter((credit) => credit.kind === "person");
  const groupNames = [...new Set(people.map((credit) => credit.groupName))];

  return {
    couple: wedding.couple,
    weddingSlug: wedding.slug,
    dateLabel: wedding.dateLabel,
    locationLabel: wedding.locationLabel,
    contentState: "published",
    peopleGroups: groupNames.map((groupName) => ({
      id: groupName,
      label: titleCaseGroup(groupName),
      people: people
        .filter((credit) => credit.groupName === groupName)
        .map((credit) => ({
          id: credit.id,
          displayName: credit.displayName,
          role: credit.role,
          isProvisional: false,
        })),
    })),
    vendors: publicCredits
      .filter((credit) => credit.kind === "vendor")
      .map((credit) => ({
        id: credit.id,
        displayName: credit.displayName,
        category: credit.role,
        isProvisional: false,
      })),
    photoContribution: {
      state: "credential-required",
      fallbackPath: getGuestPhotoFallbackPath(wedding),
      qrTargetPathTemplate: getGuestPhotoQrTargetPathTemplate(wedding),
    },
  };
}
