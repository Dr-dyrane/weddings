import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";

export const SHARE_CARD_SIZE = { height: 630, width: 1200 } as const;

export function getShareCardDayKey(
  wedding: PublishedWedding,
  now = new Date(),
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: wedding.timezone,
    year: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getPublicCardPath(
  wedding: PublishedWedding,
  invitation: InvitationProjection,
  now = new Date(),
) {
  return `/${wedding.slug}/card/${invitation.cardEdition}?day=${getShareCardDayKey(wedding, now)}`;
}

export function getPersonalizedCardPath(
  wedding: PublishedWedding,
  opaqueToken: string,
  invitation: InvitationProjection,
  now = new Date(),
) {
  return `/${wedding.slug}/invite/${opaqueToken}/card/${invitation.cardEdition}?day=${getShareCardDayKey(wedding, now)}`;
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
