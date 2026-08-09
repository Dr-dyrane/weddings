import type { MetadataRoute } from "next";

import { getWeddingBrandAssets, weddingBrandCacheControl } from "@/domains/weddings/couple-brand";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { getCoupleInitials } from "@/ui/brand/couple-monogram";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);

  if (!wedding) {
    return Response.json({ error: "Wedding not found" }, { status: 404 });
  }

  const assets = getWeddingBrandAssets(wedding);
  const initials = getCoupleInitials(
    wedding.couple.first,
    wedding.couple.second,
  );
  const manifest: MetadataRoute.Manifest = {
    background_color: "#000000",
    description: `${wedding.couple.first} and ${wedding.couple.second} — ${wedding.dateLabel}, ${wedding.locationLabel}`,
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: assets.icon192,
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: assets.icon512,
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: assets.icon512,
        type: "image/png",
      },
    ],
    id: `/${wedding.slug}`,
    name: `${wedding.couple.first} & ${wedding.couple.second} — Wedding Invitation`,
    scope: `/${wedding.slug}/`,
    short_name: `${initials.first}${initials.second} Wedding`,
    start_url: `/${wedding.slug}/`,
    theme_color: "#000000",
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Cache-Control": weddingBrandCacheControl(wedding.status),
      "Content-Type": "application/manifest+json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
