import {
  cardEditionMatches,
  setShareCardHeaders,
} from "@/domains/invitations/card-edition";
import {
  getPublicInvitation,
  resolveInvitation,
} from "@/domains/invitations/invitation";
import {
  createDyraneShareCard,
  createInvitationShareCard,
} from "@/domains/invitations/share-card";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      edition: string;
      token: string;
      weddingSlug: string;
    }>;
  },
) {
  const { edition, token, weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  const invitation = resolveInvitation(weddingSlug, token);

  if (!wedding) {
    return setShareCardHeaders(await createDyraneShareCard(), {
      personalized: true,
      published: false,
    });
  }

  if (!invitation || !cardEditionMatches(edition, invitation.cardEdition)) {
    return setShareCardHeaders(
      await createInvitationShareCard(wedding, getPublicInvitation()),
      { personalized: true, published: false },
    );
  }

  return setShareCardHeaders(
    await createInvitationShareCard(wedding, invitation),
    { personalized: true, published: false },
  );
}
