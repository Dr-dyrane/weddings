import { deleteCredit } from "@/domains/event-collaboration/event-store";
import {
  getStudioIdentity,
  isTrustedStudioMutation,
} from "@/domains/event-collaboration/studio-auth";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

type CreditRouteProps = {
  params: Promise<{ weddingSlug: string; creditId: string }>;
};

export async function DELETE(request: Request, { params }: CreditRouteProps) {
  if (!isTrustedStudioMutation(request)) {
    return new Response(null, { status: 403 });
  }
  const identity = await getStudioIdentity();
  if (!identity) return new Response(null, { status: 401 });
  const { weddingSlug, creditId } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return new Response(null, { status: 404 });
  await deleteCredit(wedding.id, creditId);
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "private, no-store" },
  });
}
