import type { Metadata } from "next";

import { weddingPackages, type WeddingPackage } from "@/domains/offers/wedding-packages";
import { PackageEnquiryJourney } from "@/features/intake/package-enquiry-journey";

export const metadata: Metadata = {
  title: "Begin — Dyrane Weddings",
  description: "Begin a private Dyrane Weddings enquiry.",
  robots: { follow: false, index: false },
};

function getPackageId(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return weddingPackages.some((item) => item.id === candidate)
    ? (candidate as WeddingPackage["id"])
    : undefined;
}

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string | string[] }>;
}) {
  const params = await searchParams;
  return <PackageEnquiryJourney initialPackageId={getPackageId(params.package)} />;
}
