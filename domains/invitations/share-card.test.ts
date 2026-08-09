import { describe, expect, it } from "vitest";

import { getPublicInvitation } from "@/domains/invitations/invitation";
import {
  createInvitationShareCard,
  getWeddingDayProgress,
} from "@/domains/invitations/share-card";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

describe("invitation share card", () => {
  it("advances determinately from the prior calendar year to the wedding day", () => {
    const date = "September 15, 2027";
    const timezone = "Africa/Lagos";
    const start = getWeddingDayProgress(
      date,
      timezone,
      new Date("2026-01-01T12:00:00.000Z"),
    );
    const today = getWeddingDayProgress(
      date,
      timezone,
      new Date("2026-08-09T12:00:00.000Z"),
    );
    const tomorrow = getWeddingDayProgress(
      date,
      timezone,
      new Date("2026-08-10T12:00:00.000Z"),
    );
    const weddingDay = getWeddingDayProgress(
      date,
      timezone,
      new Date("2027-09-15T12:00:00.000Z"),
    );

    expect(start).toBe(0);
    expect(today).toBeGreaterThan(0);
    expect(tomorrow).toBeGreaterThan(today);
    expect(weddingDay).toBe(1);
  });

  it("renders long Igbo couple names into a real 1200 by 630 image", async () => {
    const wedding = {
      ...getYardstickWedding(),
      couple: {
        ...getYardstickWedding().couple,
        first: "Chịọma-Nkemdilim",
        second: "Ọ̀ranyanwụ-Alexander",
      },
    };
    const invitation = {
      ...getPublicInvitation(),
      kind: "personalized" as const,
      salutation: "Ndị Ezinụlọ Ọ̀ranyanwụ na Ndị Enyi Ha",
    };

    const response = await createInvitationShareCard(wedding, invitation);
    const image = await response.arrayBuffer();
    const png = Buffer.from(image);

    expect(response.headers.get("content-type")).toContain("image/png");
    expect(png.byteLength).toBeGreaterThan(20_000);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
