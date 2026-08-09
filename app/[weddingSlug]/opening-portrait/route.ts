import { getWeddingOpeningPortrait } from "@/domains/weddings/opening-portrait";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  const portrait = wedding ? await getWeddingOpeningPortrait(wedding) : null;

  if (!portrait) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(portrait), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
