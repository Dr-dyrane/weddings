import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { createWeddingCalendar } from "@/domains/weddings/calendar";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return new Response("Not found", { status: 404 });

  const previewHeaders: Record<string, string> =
    wedding.status === "preview"
      ? {
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
        }
      : {
          "Cache-Control": "public, max-age=300, s-maxage=86400",
        };

  return new Response(createWeddingCalendar(wedding), {
    headers: {
      ...previewHeaders,
      "Content-Disposition": `attachment; filename="${wedding.slug}-wedding.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
