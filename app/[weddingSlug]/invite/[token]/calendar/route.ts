import {
  projectWeddingForInvitation,
  resolveInvitation,
} from "@/domains/invitations/invitation";
import { createWeddingCalendar } from "@/domains/weddings/calendar";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ weddingSlug: string; token: string }> },
) {
  const { weddingSlug, token } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  const invitation = resolveInvitation(weddingSlug, token);
  if (!wedding || !invitation) return new Response("Not found", { status: 404 });
  const invitationWedding = projectWeddingForInvitation(wedding, invitation);

  return new Response(createWeddingCalendar(invitationWedding), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${wedding.slug}-wedding.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
