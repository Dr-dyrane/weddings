import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import type { WeddingIconSize } from "@/domains/weddings/couple-brand";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import { getCoupleInitials } from "@/ui/brand/couple-monogram";

const monogramFontPromise = readFile(
  path.join(process.cwd(), "public/fonts/dyrane-monogram-cinzel.ttf"),
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
  const initials = getCoupleInitials(
    wedding.couple.first,
    wedding.couple.second,
  );
  const markSize = size * 0.9;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 34% 26%, #56305a 0%, #29122d 48%, #130817 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: "#ddb66d",
            display: "flex",
            fontFamily: "Dyrane Monogram",
            fontSize: `${markSize * 0.3125}px`,
            fontStyle: "normal",
            fontWeight: 400,
            height: `${markSize}px`,
            justifyContent: "center",
            lineHeight: 1,
            transform: "skewX(-9deg)",
            whiteSpace: "nowrap",
            width: `${markSize}px`,
          }}
        >
          {initials.first} &amp; {initials.second}
        </div>
      </div>
    ),
    {
      fonts: [
        {
          data: monogramFontData,
          name: "Dyrane Monogram",
          style: "normal",
          weight: 400,
        },
      ],
      height: size,
      width: size,
    },
  );
}
