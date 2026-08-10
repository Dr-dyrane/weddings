import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getStudioDashboard } from "@/domains/event-collaboration/event-store";
import { requireStudioPageIdentity } from "@/domains/event-collaboration/studio-auth";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { CelebrationStudio } from "@/features/event-collaboration/celebration-studio";

type StudioPageProps = {
  params: Promise<{ weddingSlug: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Celebration Studio",
  robots: { index: false, follow: false, nocache: true },
};

export default async function StudioPage({ params }: StudioPageProps) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) notFound();
  const identity = await requireStudioPageIdentity(
    `/${weddingSlug}/studio/celebration`,
  );
  const dashboard = await getStudioDashboard(wedding.id);
  const defaultOpen = new Date();
  const defaultClose = new Date(defaultOpen.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <CelebrationStudio
      coupleName={`${wedding.couple.first} & ${wedding.couple.second}`}
      dashboard={dashboard}
      defaultClose={defaultClose.toISOString()}
      defaultOpen={defaultOpen.toISOString()}
      identity={identity}
      weddingSlug={wedding.slug}
    />
  );
}
