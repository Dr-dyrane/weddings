import { readFile } from "node:fs/promises";
import path from "node:path";

import { weddingBrandCacheControl } from "@/domains/weddings/couple-brand";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { renderCoupleMonogramSvg } from "@/ui/brand/couple-monogram";

export const runtime = "nodejs";

const monogramFontPromise = readFile(
  path.join(process.cwd(), "public/fonts/dyrane-monogram-cinzel.ttf"),
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);

  if (!wedding) {
    return new Response("Wedding not found", { status: 404 });
  }

  const monogramFont = await monogramFontPromise;

  const svg = renderCoupleMonogramSvg({
    firstName: wedding.couple.first,
    fontDataUri: `data:font/ttf;base64,${monogramFont.toString("base64")}`,
    secondName: wedding.couple.second,
    title: `${wedding.couple.first} and ${wedding.couple.second} wedding monogram`,
  });

  return new Response(svg, {
    headers: {
      "Cache-Control": weddingBrandCacheControl(wedding.status),
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
