import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getGuestPhotoFallbackPath,
  getGuestPhotoFallbackUrl,
  projectWeddingForCelebration,
} from "@/domains/event-collaboration/celebration";
import { getWeddingBrandMetadata } from "@/domains/weddings/couple-brand";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { GuestPhotoEntry } from "@/features/event-collaboration/guest-photo-entry";

type GuestPhotoPageProps = {
  params: Promise<{ weddingSlug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: GuestPhotoPageProps): Promise<Metadata> {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return {};

  return {
    ...getWeddingBrandMetadata(wedding),
    title: `Guest camera — ${wedding.couple.first} & ${wedding.couple.second}`,
    description: "Guest photo contribution status and no-scan fallback.",
    alternates: { canonical: getGuestPhotoFallbackPath(wedding) },
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function GuestPhotoPage({
  params,
}: GuestPhotoPageProps) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) notFound();

  return (
    <GuestPhotoEntry
      fallbackUrl={getGuestPhotoFallbackUrl(wedding)}
      celebration={projectWeddingForCelebration(wedding)}
    />
  );
}
