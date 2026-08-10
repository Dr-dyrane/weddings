import { revokePhotoCollection } from "@/domains/event-collaboration/event-store";
import {
  getStudioIdentity,
  isTrustedStudioMutation,
} from "@/domains/event-collaboration/studio-auth";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

type CollectionRouteProps = {
  params: Promise<{ weddingSlug: string; collectionId: string }>;
};

export async function PATCH(request: Request, { params }: CollectionRouteProps) {
  if (!isTrustedStudioMutation(request)) {
    return new Response(null, { status: 403 });
  }
  const identity = await getStudioIdentity();
  if (!identity) return new Response(null, { status: 401 });
  const { weddingSlug, collectionId } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return new Response(null, { status: 404 });
  await revokePhotoCollection(wedding.id, collectionId);
  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
