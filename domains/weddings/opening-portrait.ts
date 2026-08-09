import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PublishedWedding } from "@/domains/weddings/published-wedding";

const portraitPromises = {
  "alexander-chioma-line-v5": readFile(
    path.join(
      process.cwd(),
      "docs/references/visual/alexander-chioma-line-portrait-v5.png",
    ),
  ),
} as const;

export function getWeddingOpeningPortrait(wedding: PublishedWedding) {
  const asset = wedding.shareCard?.portraitAsset;
  return asset ? portraitPromises[asset] : null;
}
