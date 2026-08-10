import { weddingBrandCacheControl } from "@/domains/weddings/couple-brand";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { renderCoupleMonogramSvg } from "@/ui/brand/couple-monogram";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);

  if (!wedding) {
    return new Response("Wedding not found", { status: 404 });
  }

  const svg = renderCoupleMonogramSvg({
    firstName: wedding.couple.first,
    fontDataUri: new URL(
      "/fonts/dyrane-space-grotesk.ttf",
      request.url,
    ).toString(),
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
