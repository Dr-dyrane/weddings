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
    expect(wedding.people).toHaveLength(4);
    expect(wedding.vendors).toHaveLength(3);
    expect(wedding.events).toHaveLength(2);
    expect(wedding.couple).not.toHaveProperty("monogram");
  });

  it("returns null for an unknown wedding", () => {
    expect(getPublishedWedding("not-a-wedding")).toBeNull();
  });

  it("refuses to publish simulated people or vendors", () => {
    const wedding = getYardstickWedding();
    const result = publishedWeddingSchema.safeParse({
      ...wedding,
      status: "published",
    });

    expect(result.success).toBe(false);
  });

  it("accepts publication only after every named participant is approved", () => {
    const wedding = getYardstickWedding();
    const result = publishedWeddingSchema.safeParse({
      ...wedding,
      status: "published",
      people: wedding.people.map((person) => ({
        ...person,
        consent: "approved",
      })),
      vendors: wedding.vendors.map((vendor) => ({
        ...vendor,
        consent: "approved",
      })),
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
