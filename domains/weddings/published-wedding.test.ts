import { describe, expect, it } from "vitest";

import {
  getPublishedWedding,
  getYardstickWedding,
  publishedWeddingSchema,
} from "@/domains/weddings/published-wedding";

describe("published wedding snapshot", () => {
  it("keeps the yardstick wedding valid and content-complete", () => {
    const wedding = getYardstickWedding();

    expect(() => publishedWeddingSchema.parse(wedding)).not.toThrow();
    expect(wedding.people).toEqual([]);
    expect(wedding.vendors).toEqual([]);
    expect(wedding.events).toHaveLength(2);
    expect(wedding.couple).not.toHaveProperty("monogram");
    expect(wedding.dress.weddingPartyPaletteLabel).toBe("Wedding party palette");
    expect(wedding.dress.guestPaletteLabel).toBe("Optional guest colour");
    expect(wedding.dress.guestGuidance).toContain("black tailoring");
    expect(wedding.dress.reservation).toContain("wedding party");
    expect(wedding.dress.weddingPartyPalette).toEqual([
      { name: "Pitch black", hex: "#000000" },
      { name: "Pure white", hex: "#FFFFFF" },
      { name: "Celebration yellow", hex: "#FFD21E" },
    ]);
    expect(wedding.dress.guestPalette).toEqual([
      { name: "Deep emerald", hex: "#0D3B2E" },
    ]);
  });

  it("returns null for an unknown wedding", () => {
    expect(getPublishedWedding("not-a-wedding")).toBeNull();
  });

  it("refuses to publish simulated people or vendors", () => {
    const wedding = getYardstickWedding();
    const result = publishedWeddingSchema.safeParse({
      ...wedding,
      status: "published",
      people: [
        {
          id: "unapproved-person",
          displayName: "Unapproved Person",
          role: "Wedding party",
          group: "wedding-party",
          consent: "simulation",
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("accepts publication only after every named participant is approved", () => {
    const wedding = getYardstickWedding();
    const result = publishedWeddingSchema.safeParse({
      ...wedding,
      status: "published",
      people: [
        {
          id: "approved-person",
          displayName: "Approved Person",
          role: "Wedding party",
          group: "wedding-party",
          consent: "approved",
        },
      ],
      vendors: [
        {
          id: "approved-vendor",
          displayName: "Approved Vendor",
          category: "Photography",
          consent: "approved",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-HTTPS links before they reach a guest", () => {
    const wedding = getYardstickWedding();
    const result = publishedWeddingSchema.safeParse({
      ...wedding,
      events: wedding.events.map((event, index) =>
        index === 0
          ? { ...event, map: { ...event.map, href: "javascript:alert(1)" } }
          : event,
      ),
    });

    expect(result.success).toBe(false);
  });

  it("returns a validation failure rather than throwing for malformed links", () => {
    const wedding = getYardstickWedding();
    const result = publishedWeddingSchema.safeParse({
      ...wedding,
      events: wedding.events.map((event, index) =>
        index === 0
          ? { ...event, map: { ...event.map, href: "not a URL" } }
          : event,
      ),
    });

    expect(result.success).toBe(false);
  });
});
