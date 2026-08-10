import type { Metadata } from "next";

import { SHARE_CARD_SIZE } from "@/domains/invitations/card-edition";

export const ROOT_SHARE_CARD_VERSION = "dyrane-root-ogb-20260810-2";
export const ROOT_SHARE_CARD_PATH = `/card?v=${ROOT_SHARE_CARD_VERSION}`;

export function getDyraneWeddingsMetadata(): Metadata {
  const title = "Dyrane Weddings";
  const description =
    "Personal digital wedding experiences, created to be felt before the day begins.";

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      images: [
        {
          alt: "Dyrane Weddings",
          ...SHARE_CARD_SIZE,
          type: "image/png",
          url: ROOT_SHARE_CARD_PATH,
        },
      ],
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ROOT_SHARE_CARD_PATH],
    },
  };
}
