import { describe, expect, it } from "vitest";

import { createWeddingCalendar } from "@/domains/weddings/calendar";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

describe("wedding calendar", () => {
  it("contains every published celebration event", () => {
    const calendar = createWeddingCalendar(getYardstickWedding());

    expect(calendar).toContain("BEGIN:VCALENDAR");
    expect(calendar).toContain("The Vow");
    expect(calendar).toContain("The Gathering");
    expect(calendar).toContain("END:VCALENDAR");
  });
});
