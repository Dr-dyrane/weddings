import { deleteRsvpResponse } from "@/domains/event-collaboration/event-store";
import {
  getStudioIdentity,
  isTrustedStudioMutation,
} from "@/domains/event-collaboration/studio-auth";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

type RSVPRouteProps = {
  params: Promise<{ weddingSlug: string; rsvpId: string }>;
};

export async function DELETE(request: Request, { params }: RSVPRouteProps) {
  if (!isTrustedStudioMutation(request)) {
    return new Response(null, { status: 403 });
  }
  const identity = await getStudioIdentity();
  if (!identity) return new Response(null, { status: 401 });
  const { weddingSlug, rsvpId } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return new Response(null, { status: 404 });
  await deleteRsvpResponse(wedding.id, rsvpId);
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "private, no-store" },
  });
}
