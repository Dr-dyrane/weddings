import type { Metadata } from "next";

import {
  getPublicCardPath,
  SHARE_CARD_SIZE,
} from "@/domains/invitations/card-edition";
import type { InvitationProjection } from "@/domains/invitations/invitation";
import { getWeddingBrandMetadata } from "@/domains/weddings/couple-brand";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";

export function getPublicWeddingMetadata(
  wedding: PublishedWedding,
  invitation: InvitationProjection,
  canonicalPath: string,
): Metadata {
  const title = `${wedding.couple.first} & ${wedding.couple.second} — You’re Invited`;
  const description = `${wedding.dateLabel} · ${wedding.locationLabel}`;
  const cardPath = getPublicCardPath(wedding, invitation);

  return {
    ...getWeddingBrandMetadata(wedding),
    title,
    description,
    robots:
      wedding.status === "published"
        ? { index: true, follow: true }
        : { index: false, follow: false, nocache: true },
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      images: [
        {
          alt: "A formal wedding invitation",
          ...SHARE_CARD_SIZE,
          type: "image/png",
          url: cardPath,
        },
      ],
      type: "website",
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardPath],
    },
  };
}
