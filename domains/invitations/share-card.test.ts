import { readFile } from "node:fs/promises";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { getPublicInvitation } from "@/domains/invitations/invitation";
import {
  createDyraneShareCard,
  createInvitationShareCard,
} from "@/domains/invitations/share-card";
import { getWeddingDayProgress } from "@/domains/invitations/wedding-progress";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

beforeAll(async () => {
  const [font, portrait] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/dyrane-space-grotesk.ttf")),
    readFile(
      path.join(
        process.cwd(),
        "public/journey/alexander-chioma-line-portrait-v5.png",
      ),
    ),
  ]);

  vi.stubGlobal("fetch", async (input: string | URL | Request) => {
    const url = new URL(
      input instanceof Request ? input.url : input.toString(),
    );

    if (url.pathname.endsWith("dyrane-space-grotesk.ttf")) {
      return new Response(font);
    }

    if (url.pathname.endsWith("alexander-chioma-line-portrait-v5.png")) {
      return new Response(portrait, {
        headers: { "Content-Type": "image/png" },
      });
    }

    return new Response(null, { status: 404 });
  });
});

afterAll(() => vi.unstubAllGlobals());

describe("invitation share card", () => {
  it("renders the Dyrane root card as a real 1200 by 630 image", async () => {
    const response = await createDyraneShareCard("https://example.test/card");
    const png = Buffer.from(await response.arrayBuffer());

    expect(response.headers.get("content-type")).toContain("image/png");
    expect(png.byteLength).toBeGreaterThan(10_000);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });

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

    const response = await createInvitationShareCard(
      wedding,
      invitation,
      "https://example.test/the_ogranyas/card/3",
    );
    const image = await response.arrayBuffer();
    const png = Buffer.from(image);

    expect(response.headers.get("content-type")).toContain("image/png");
    expect(png.byteLength).toBeGreaterThan(20_000);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
