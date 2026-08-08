import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";

export const SHARE_CARD_SIZE = { height: 630, width: 1200 } as const;

export function getPublicCardPath(
  wedding: PublishedWedding,
  invitation: InvitationProjection,
) {
  return `/${wedding.slug}/card/${invitation.cardEdition}`;
}

export function getPersonalizedCardPath(
  wedding: PublishedWedding,
  opaqueToken: string,
  invitation: InvitationProjection,
) {
  return `/${wedding.slug}/invite/${opaqueToken}/card/${invitation.cardEdition}`;
}

export function cardEditionMatches(value: string, expected: number) {
  return /^[1-9]\d*$/.test(value) && Number(value) === expected;
}

export function setShareCardHeaders(
  response: Response,
  options: { personalized: boolean; published: boolean },
) {
  response.headers.set(
    "Cache-Control",
    options.published && !options.personalized
      ? "public, max-age=31536000, immutable"
      : "private, no-store",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");

  if (options.personalized) {
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet",
    );
  }

  return response;
}
