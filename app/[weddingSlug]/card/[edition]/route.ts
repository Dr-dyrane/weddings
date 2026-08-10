import {
  cardEditionMatches,
  setShareCardHeaders,
} from "@/domains/invitations/card-edition";
import { getPublicInvitation } from "@/domains/invitations/invitation";
import {
  createDyraneShareCard,
  createInvitationShareCard,
} from "@/domains/invitations/share-card";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  {
    params,
  }: { params: Promise<{ edition: string; weddingSlug: string }> },
) {
  const { edition, weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  const invitation = getPublicInvitation();

  if (!wedding || !cardEditionMatches(edition, invitation.cardEdition)) {
    return setShareCardHeaders(await createDyraneShareCard(request.url), {
      personalized: false,
      published: false,
    });
  }

  return setShareCardHeaders(
    await createInvitationShareCard(wedding, invitation, request.url),
    { personalized: false, published: wedding.status === "published" },
  );
}
