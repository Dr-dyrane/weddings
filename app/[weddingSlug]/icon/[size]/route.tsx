import { isWeddingIconSize, weddingBrandCacheControl } from "@/domains/weddings/couple-brand";
import { createWeddingAppIcon } from "@/domains/weddings/couple-brand-image";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  {
    params,
  }: { params: Promise<{ size: string; weddingSlug: string }> },
) {
  const { size: sizeParam, weddingSlug } = await params;
  const size = Number(sizeParam);
  const wedding = getPublishedWedding(weddingSlug);

  if (!wedding || !Number.isInteger(size) || !isWeddingIconSize(size)) {
    return new Response("Icon not found", { status: 404 });
  }

  const response = await createWeddingAppIcon(wedding, size, request.url);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Cache-Control",
    weddingBrandCacheControl(wedding.status),
  );
  return response;
}
