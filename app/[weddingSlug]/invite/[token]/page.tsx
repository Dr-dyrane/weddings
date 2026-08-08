import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPersonalizedCardPath,
  SHARE_CARD_SIZE,
} from "@/domains/invitations/card-edition";
import {
  projectWeddingForInvitation,
  resolveInvitation,
} from "@/domains/invitations/invitation";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { WeddingExperience } from "@/features/invitation/wedding-experience";

type InvitationPageProps = {
  params: Promise<{ weddingSlug: string; token: string }>;
};

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { weddingSlug, token } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  const invitation = resolveInvitation(weddingSlug, token);

  if (!wedding || !invitation) {
    return { robots: { index: false, follow: false } };
  }

  const title = `${invitation.salutation}, ${wedding.couple.first} & ${wedding.couple.second} invite you`;
  const description = `${wedding.dateLabel} · ${wedding.locationLabel}`;
  const cardPath = getPersonalizedCardPath(wedding, token, invitation);

  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title,
      description,
      images: [
        {
          alt: "A personalized formal wedding invitation",
          ...SHARE_CARD_SIZE,
          type: "image/png",
          url: cardPath,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardPath],
    },
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { weddingSlug, token } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  const invitation = resolveInvitation(weddingSlug, token);
  if (!wedding || !invitation) notFound();
  const invitationWedding = projectWeddingForInvitation(wedding, invitation);

  return (
    <WeddingExperience
      wedding={invitationWedding}
      invitation={invitation}
      calendarHref={`/${wedding.slug}/invite/${token}/calendar`}
    />
  );
}
