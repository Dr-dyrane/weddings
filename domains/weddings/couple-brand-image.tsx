import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import type { WeddingIconSize } from "@/domains/weddings/couple-brand";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import {
  COUPLE_MONOGRAM_BACKGROUND,
  COUPLE_MONOGRAM_INK,
  COUPLE_MONOGRAM_RING,
  getCoupleMonogramText,
} from "@/ui/brand/couple-monogram";

const monogramFontPromise = readFile(
  path.join(process.cwd(), "public/fonts/dyrane-space-grotesk.ttf"),
);

export async function createWeddingAppIcon(
  wedding: PublishedWedding,
  size: WeddingIconSize,
) {
  const monogramFont = await monogramFontPromise;
  const monogramFontData = monogramFont.buffer.slice(
    monogramFont.byteOffset,
    monogramFont.byteOffset + monogramFont.byteLength,
  ) as ArrayBuffer;
  const ringSize = size * 0.75;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: COUPLE_MONOGRAM_BACKGROUND,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            border: `${Math.max(2, size * 0.01875)}px solid ${COUPLE_MONOGRAM_RING}`,
            borderRadius: "9999px",
            color: COUPLE_MONOGRAM_INK,
            display: "flex",
            fontFamily: "Dyrane Space Grotesk",
            fontSize: `${size * 0.2}px`,
            fontWeight: 500,
            height: `${ringSize}px`,
            justifyContent: "center",
            letterSpacing: `${size * -0.0075}px`,
            lineHeight: 1,
            width: `${ringSize}px`,
          }}
        >
          {getCoupleMonogramText(
            wedding.couple.first,
            wedding.couple.second,
          )}
        </div>
      </div>
    ),
    {
      fonts: [
        {
          data: monogramFontData,
          name: "Dyrane Space Grotesk",
          style: "normal",
          weight: 500,
        },
      ],
      height: size,
      width: size,
    },
  );
}
