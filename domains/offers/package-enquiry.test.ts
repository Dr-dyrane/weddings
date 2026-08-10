import { describe, expect, it } from "vitest";

import {
  buildPackageEnquiryMessage,
  dyraneWeddingContact,
  getPackageEnquiryHandoffs,
} from "@/domains/offers/package-enquiry";

const enquiry = {
  packageId: "intermediate" as const,
  packageLabel: "Intermediate",
  firstName: "Ada",
  secondName: "Chidi",
  weddingDate: "2027-09-15",
  location: "Lagos",
  preferredReply: "whatsapp" as const,
  replyAddress: "+234 800 000 0000",
};

describe("package enquiry handoff", () => {
  it("keeps the complete enquiry in the deliberate handoff message", () => {
    expect(buildPackageEnquiryMessage(enquiry)).toContain("Ada & Chidi");
    expect(buildPackageEnquiryMessage(enquiry)).toContain("Intermediate");
    expect(buildPackageEnquiryMessage(enquiry)).toContain("2027-09-15");
  });

  it("uses the approved Dyrane WhatsApp and email destinations", () => {
    const handoffs = getPackageEnquiryHandoffs(enquiry);

    expect(dyraneWeddingContact.email).toBe("hello@dyrane.tech");
    expect(handoffs.whatsapp).toContain(
      `https://wa.me/${dyraneWeddingContact.whatsapp}`,
    );
    expect(handoffs.email).toContain(`mailto:${dyraneWeddingContact.email}`);
    expect(decodeURIComponent(handoffs.whatsapp)).toContain("Lagos");
  });
});
