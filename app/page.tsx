import type { Metadata } from "next";

import { getPublicInvitation } from "@/domains/invitations/invitation";
import { getDyraneWeddingsMetadata } from "@/domains/invitations/root-metadata";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";
import { WeddingExperience } from "@/features/invitation/wedding-experience";

export const revalidate = 3600;

const wedding = getYardstickWedding();
const invitation = getPublicInvitation();

export function generateMetadata(): Metadata {
  return getDyraneWeddingsMetadata();
}

export default function HomePage() {
  return (
    <WeddingExperience
      wedding={wedding}
      invitation={invitation}
      calendarHref={`/${wedding.slug}/calendar`}
    />
  );
}
