import { z } from "zod";

const secureWebUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, {
    message: "Links in a published invitation must use HTTPS.",
  });

const linkSchema = z.object({
  label: z.string().min(1).max(120),
  href: secureWebUrlSchema,
});

const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  eyebrow: z.string().min(1),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  venue: z.string().min(1),
  address: z.string().min(1),
  map: linkSchema,
});

const milestoneSchema = z.object({
  id: z.string().min(1),
  sequence: z.string().min(1),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  dateLabel: z.string().min(1),
});

const personSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1).max(80),
  role: z.string().min(1).max(64),
  group: z.enum(["family", "wedding-party", "ceremony"]),
  consent: z.enum(["simulation", "approved"]),
});

const vendorSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1).max(80),
  category: z.string().min(1).max(64),
  consent: z.enum(["simulation", "approved"]),
});

export const publishedWeddingSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9_]+$/),
  revision: z.number().int().positive(),
  status: z.enum(["preview", "published"]),
  locale: z.string().min(2),
  timezone: z.string().min(1),
  couple: z.object({
    first: z.string().min(1).max(40),
    second: z.string().min(1).max(40),
  }),
  shareCard: z
    .object({
      portraitAsset: z.enum(["alexander-chioma-line-v5"]),
      portraitOpacity: z.number().min(0).max(1),
    })
    .optional(),
  invitation: z.object({
    eyebrow: z.string().min(1).max(80),
    headline: z.string().min(1).max(120),
    introduction: z.string().min(1).max(180),
  }),
  dateLabel: z.string().min(1).max(64),
  locationLabel: z.string().min(1).max(80),
  story: z.array(milestoneSchema).min(1),
  events: z.array(eventSchema).min(1),
  dress: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    guidance: z.string().min(1),
    weddingPartyPaletteLabel: z.string().min(1).max(80),
    weddingPartyPalette: z
      .array(
        z.object({
          name: z.string().min(1),
          hex: z.string().regex(/^#[0-9a-f]{6}$/i),
        }),
      )
      .min(1)
      .max(4),
    guestPaletteLabel: z.string().min(1).max(80),
    guestGuidance: z.string().min(1).max(180),
    reservation: z.string().min(1).max(180),
    guestPalette: z
      .array(
        z.object({
          name: z.string().min(1),
          hex: z.string().regex(/^#[0-9a-f]{6}$/i),
        }),
      )
      .min(1)
      .max(4),
  }),
  people: z.array(personSchema),
  vendors: z.array(vendorSchema),
  theme: z.object({
    id: z.string().min(1),
    version: z.number().int().positive(),
  }),
}).superRefine((wedding, context) => {
  if (wedding.status !== "published") return;

  for (const [index, person] of wedding.people.entries()) {
    if (person.consent !== "approved") {
      context.addIssue({
        code: "custom",
        message: "Every published person must be approved.",
        path: ["people", index, "consent"],
      });
    }
  }

  for (const [index, vendor] of wedding.vendors.entries()) {
    if (vendor.consent !== "approved") {
      context.addIssue({
        code: "custom",
        message: "Every published vendor must be approved.",
        path: ["vendors", index, "consent"],
      });
    }
  }
});

export type PublishedWedding = z.infer<typeof publishedWeddingSchema>;

const alexanderAndChioma = publishedWeddingSchema.parse({
  id: "wedding_alexander_chioma",
  slug: "the_ogranyas",
  revision: 1,
  status: "published",
  locale: "en-NG",
  timezone: "Africa/Lagos",
  couple: {
    first: "Alexander",
    second: "Chioma",
  },
  shareCard: {
    portraitAsset: "alexander-chioma-line-v5",
    portraitOpacity: 1,
  },
  invitation: {
    eyebrow: "Together with their families",
    headline: "You’re invited to celebrate with us.",
    introduction: "invite you to witness the beginning of their forever.",
  },
  dateLabel: "September 15, 2027",
  locationLabel: "Lagos, Nigeria",
  story: [
    {
      id: "first-conversation",
      sequence: "01",
      eyebrow: "Where it all began",
      title: "One conversation. A thousand reasons to keep talking.",
      dateLabel: "2021 · Lagos",
    },
    {
      id: "the-question",
      sequence: "02",
      eyebrow: "Then came the question",
      title: "She said yes.",
      dateLabel: "2025 · Somewhere unforgettable",
    },
  ],
  events: [
    {
      id: "vow",
      title: "The Vow",
      eyebrow: "02:00 PM",
      startsAt: "2027-09-15T14:00:00+01:00",
      endsAt: "2027-09-15T15:30:00+01:00",
      venue: "The Glass House",
      address: "Lagos, Nigeria",
      map: {
        label: "Directions to The Glass House",
        href: "https://www.google.com/maps/search/?api=1&query=The+Glass+House+Lagos",
      },
    },
    {
      id: "gathering",
      title: "The Gathering",
      eyebrow: "04:30 PM",
      startsAt: "2027-09-15T16:30:00+01:00",
      endsAt: "2027-09-15T22:30:00+01:00",
      venue: "Moon Garden",
      address: "Victoria Island, Lagos",
      map: {
        label: "Directions to Moon Garden",
        href: "https://www.google.com/maps/search/?api=1&query=Moon+Garden+Victoria+Island+Lagos",
      },
    },
  ],
  dress: {
    eyebrow: "Dress the part",
    title: "Dusk, devotion & a little magic.",
    guidance: "Formal · traditional elegance · unmistakably you",
    weddingPartyPaletteLabel: "Wedding party palette",
    weddingPartyPalette: [
      { name: "Pitch black", hex: "#000000" },
      { name: "Pure white", hex: "#FFFFFF" },
      { name: "Celebration yellow", hex: "#FFD21E" },
    ],
    guestPaletteLabel: "Optional guest colour",
    guestGuidance:
      "Emerald traditional attire—or black tailoring with one emerald accent.",
    reservation:
      "Emerald is encouraged, never required. White, ivory, champagne and celebration yellow are reserved for the wedding party.",
    guestPalette: [
      { name: "Deep emerald", hex: "#0D3B2E" },
    ],
  },
  people: [],
  vendors: [],
  theme: {
    id: "modern-heirloom",
    version: 1,
  },
} satisfies PublishedWedding);

const weddings = new Map([[alexanderAndChioma.slug, alexanderAndChioma]]);

export function getPublishedWedding(slug: string) {
  return weddings.get(slug) ?? null;
}

export function getYardstickWedding() {
  return alexanderAndChioma;
}
