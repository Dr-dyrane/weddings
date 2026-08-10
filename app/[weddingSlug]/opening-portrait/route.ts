import { getWeddingOpeningPortrait } from "@/domains/weddings/opening-portrait";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { fetchRuntimeAsset } from "@/domains/weddings/runtime-assets";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  const portrait = wedding ? getWeddingOpeningPortrait(wedding) : null;

  if (!portrait) return new Response(null, { status: 404 });

  const assetResponse = await fetchRuntimeAsset(portrait, request.url);

  if (!assetResponse.ok || !assetResponse.body) {
    return new Response(null, { status: 404 });
  }

  return new Response(assetResponse.body, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
