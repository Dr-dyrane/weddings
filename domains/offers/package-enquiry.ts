import type { WeddingPackage } from "@/domains/offers/wedding-packages";

export const dyraneWeddingContact = {
  email: "hello@dyrane.tech",
  whatsapp: "19517284218",
} as const;

export type PackageEnquiry = {
  packageId: WeddingPackage["id"];
  packageLabel: string;
  firstName: string;
  secondName: string;
  weddingDate: string;
  location: string;
  preferredReply: "whatsapp" | "email";
  replyAddress: string;
};

export function buildPackageEnquiryMessage(enquiry: PackageEnquiry) {
  return [
    "Hello Dyrane Weddings,",
    "",
    `We would like to begin with the ${enquiry.packageLabel} package.`,
    `Couple: ${enquiry.firstName.trim()} & ${enquiry.secondName.trim()}`,
    `Wedding date: ${enquiry.weddingDate || "Still deciding"}`,
    `Location: ${enquiry.location.trim() || "Still deciding"}`,
    `Preferred reply: ${enquiry.preferredReply === "whatsapp" ? "WhatsApp" : "Email"} — ${enquiry.replyAddress.trim()}`,
    "",
    "Please tell us the next step.",
  ].join("\n");
}

export function getPackageEnquiryHandoffs(enquiry: PackageEnquiry) {
  const message = buildPackageEnquiryMessage(enquiry);
  return {
    email: `mailto:${dyraneWeddingContact.email}?subject=${encodeURIComponent(
      `${enquiry.firstName.trim()} & ${enquiry.secondName.trim()} — Dyrane Weddings`,
    )}&body=${encodeURIComponent(message)}`,
    whatsapp: `https://wa.me/${dyraneWeddingContact.whatsapp}?text=${encodeURIComponent(
      message,
    )}`,
  };
}
