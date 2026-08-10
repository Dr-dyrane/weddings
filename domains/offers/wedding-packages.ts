export const weddingPackages = [
  {
    id: "basic",
    level: "01",
    label: "Basic",
    name: "The Invitation",
    price: "₦650,000",
    promise:
      "A polished digital invitation with everything guests need, held in one beautiful place.",
    inheritsFrom: null,
    benefits: [
      "A dedicated wedding link",
      "A premium card for WhatsApp and social sharing",
      "Date, venue, schedule and dress guidance",
      "Guest RSVP, calendar and directions",
      "A considered experience on every screen",
      "Six months of hosting",
      "One refinement round",
    ],
    note: "Founding rate: ₦450,000 for the next three weddings.",
  },
  {
    id: "intermediate",
    level: "02",
    label: "Intermediate",
    name: "The Signature",
    price: "₦900,000",
    promise:
      "Your story, your people and every guest response shaped into one personal celebration.",
    inheritsFrom: "basic",
    benefits: [
      "A couple-led opening and visual direction",
      "Your story told through scroll chapters",
      "Personal invitations created for your guest list",
      "Wedding party, family roles and vendor credits",
      "A private response dashboard for the couple",
      "Hosting extended to twelve months",
      "Two refinement rounds in total",
    ],
    badge: "Most chosen",
  },
  {
    id: "premium",
    level: "03",
    label: "Premium",
    name: "The Heirloom",
    price: "₦1,500,000",
    pricePrefix: "From",
    promise:
      "An original wedding atmosphere, created from the ground up and entered before the day begins.",
    inheritsFrom: "intermediate",
    benefits: [
      "An original visual identity created for your wedding",
      "Bespoke portrait, marks and scene artwork",
      "Custom transitions, motion and atmosphere",
      "Different invitation details for selected guest groups",
      "A private guest-photo inbox with review controls",
      "Custom domain connection",
      "Priority production",
      "Three refinement rounds in total",
    ],
  },
] as const;

export type WeddingPackage = (typeof weddingPackages)[number];

export function getResolvedPackageBenefits(packageId: WeddingPackage["id"]) {
  const selectedIndex = weddingPackages.findIndex(
    (weddingPackage) => weddingPackage.id === packageId,
  );

  if (selectedIndex < 0) return [];

  return weddingPackages
    .slice(0, selectedIndex + 1)
    .flatMap((weddingPackage) => weddingPackage.benefits);
}
