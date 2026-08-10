import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCelebrationPath,
  projectPublishedCreditsForCelebration,
} from "@/domains/event-collaboration/celebration";
import { getPublicCredits } from "@/domains/event-collaboration/event-store";
import { getWeddingBrandMetadata } from "@/domains/weddings/couple-brand";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { CelebrationHub } from "@/features/event-collaboration/celebration-hub";

type CelebrationPageProps = {
  params: Promise<{ weddingSlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CelebrationPageProps): Promise<Metadata> {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return {};

  const title = `${wedding.couple.first} & ${wedding.couple.second} — Celebration hub`;
  const description = `People, creative credits, and guest photo contribution status for ${wedding.couple.first} & ${wedding.couple.second}.`;

  return {
    ...getWeddingBrandMetadata(wedding),
    title,
    description,
    alternates: { canonical: getCelebrationPath(wedding) },
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function CelebrationPage({
  params,
}: CelebrationPageProps) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) notFound();

  const publication = await getPublicCredits(wedding.id).catch(() => null);

  return (
    <CelebrationHub
      celebration={projectPublishedCreditsForCelebration(
        wedding,
        publication?.enabled ? publication.credits : [],
      )}
    />
  );
}
