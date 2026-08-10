import "server-only";

import type { PublishedWedding } from "@/domains/weddings/published-wedding";

const portraitPaths = {
  "alexander-chioma-line-v5":
    "/journey/alexander-chioma-line-portrait-v5.png",
} as const;

export function getWeddingOpeningPortrait(wedding: PublishedWedding) {
  const asset = wedding.shareCard?.portraitAsset;
  return asset ? portraitPaths[asset] : null;
}
