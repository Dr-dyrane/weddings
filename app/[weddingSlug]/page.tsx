import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicInvitation } from "@/domains/invitations/invitation";
import { getPublicWeddingMetadata } from "@/domains/invitations/public-metadata";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { WeddingExperience } from "@/features/invitation/wedding-experience";

type WeddingPageProps = {
  params: Promise<{ weddingSlug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: WeddingPageProps): Promise<Metadata> {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return {};

  return getPublicWeddingMetadata(
    wedding,
    getPublicInvitation(),
    `/${wedding.slug}`,
  );
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
