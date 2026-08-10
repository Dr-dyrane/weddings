import type { Metadata } from "next";
import { Suspense } from "react";

import { PackageEnquiryJourney } from "@/features/intake/package-enquiry-journey";

export const metadata: Metadata = {
  title: "Begin — Dyrane Weddings",
  description: "Begin a private Dyrane Weddings enquiry.",
  robots: { follow: false, index: false },
};

export default function StartPage() {
  return (
    <Suspense fallback={<main aria-label="Loading private enquiry" style={{ background: "#000", minHeight: "100svh" }} />}>
      <PackageEnquiryJourney />
    </Suspense>
  );
}
