import { describe, expect, it } from "vitest";

import { getPublicInvitation } from "@/domains/invitations/invitation";
import { createInvitationShareCard } from "@/domains/invitations/share-card";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

describe("invitation share card", () => {
  it("renders a long Igbo salutation into a real 1200 by 630 image", async () => {
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

    expect(response.headers.get("content-type")).toContain("image/png");
    expect(image.byteLength).toBeGreaterThan(50_000);
  });
});
