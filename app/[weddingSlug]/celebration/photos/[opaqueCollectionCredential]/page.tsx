import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isOpaqueCollectionCredential } from "@/domains/event-collaboration/celebration";
import { resolvePhotoCollection } from "@/domains/event-collaboration/event-store";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";
import { GuestPhotoCollection } from "@/features/event-collaboration/guest-photo-collection";

type CollectionPageProps = {
  params: Promise<{
    weddingSlug: string;
    opaqueCollectionCredential: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Guest camera",
    description: "Private wedding photo collection entry.",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { weddingSlug, opaqueCollectionCredential } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding || !isOpaqueCollectionCredential(opaqueCollectionCredential)) {
    notFound();
  }
  const collection = await resolvePhotoCollection(
    wedding.id,
    opaqueCollectionCredential,
  ).catch(() => null);

  if (!collection) notFound();

  return (
    <GuestPhotoCollection
      collection={collection}
      credential={opaqueCollectionCredential}
      wedding={wedding}
    />
  );
}
