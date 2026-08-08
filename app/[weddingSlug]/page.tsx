import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicCardPath,
  SHARE_CARD_SIZE,
} from "@/domains/invitations/card-edition";
import { getPublicInvitation } from "@/domains/invitations/invitation";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { WeddingExperience } from "@/features/invitation/wedding-experience";

type WeddingPageProps = {
  params: Promise<{ weddingSlug: string }>;
};

export async function generateMetadata({
  params,
}: WeddingPageProps): Promise<Metadata> {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return {};

  const title = `${wedding.couple.first} & ${wedding.couple.second} — You’re Invited`;
  const description = `${wedding.dateLabel} · ${wedding.locationLabel}`;
  const cardPath = getPublicCardPath(wedding, getPublicInvitation());

  return {
    title,
    description,
    robots:
      wedding.status === "published"
        ? { index: true, follow: true }
        : { index: false, follow: false, nocache: true },
    alternates: { canonical: `/${wedding.slug}` },
    openGraph: {
      title,
      description,
      images: [
        {
          alt: "A formal wedding invitation",
          ...SHARE_CARD_SIZE,
          type: "image/png",
          url: cardPath,
        },
      ],
      type: "website",
      url: `/${wedding.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardPath],
    },
  };
}

export default async function WeddingPage({ params }: WeddingPageProps) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) notFound();

  return (
    <WeddingExperience
      wedding={wedding}
      invitation={getPublicInvitation()}
      calendarHref={`/${wedding.slug}/calendar`}
    />
  );
}
