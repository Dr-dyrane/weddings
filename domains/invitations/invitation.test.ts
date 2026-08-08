import { describe, expect, it } from "vitest";

import {
  DEMO_INVITATION_TOKEN,
  getPublicInvitation,
  projectWeddingForInvitation,
  resolveInvitation,
} from "@/domains/invitations/invitation";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

describe("invitation resolution", () => {
  it("resolves the opaque yardstick credential", () => {
    const invitation = resolveInvitation("the_ogranyas", DEMO_INVITATION_TOKEN);

    expect(invitation?.kind).toBe("personalized");
    expect(invitation?.salutation).toBe("Dr. Dyrane");
    expect(invitation?.allowedEventIds).toEqual(["vow", "gathering"]);
  });

  it("filters wedding events before a private projection reaches the client", () => {
    const invitation = resolveInvitation("the_ogranyas", DEMO_INVITATION_TOKEN);
    expect(invitation).not.toBeNull();

    const projected = projectWeddingForInvitation(getYardstickWedding(), {
      ...invitation!,
      allowedEventIds: ["vow"],
    });
    expect(projected.events.map((event) => event.id)).toEqual(["vow"]);
  });

  it("does not disclose a recipient for an invalid credential", () => {
    expect(resolveInvitation("the_ogranyas", "invalid")).toBeNull();
  });

  it("keeps the public projection generic", () => {
    expect(getPublicInvitation()).toMatchObject({
      kind: "public",
      guestDisplayName: null,
    });
  });

  it("does not encode the recipient name in the fixture credential", () => {
    expect(DEMO_INVITATION_TOKEN.toLowerCase()).not.toContain("dyrane");
    expect(DEMO_INVITATION_TOKEN.length).toBeGreaterThanOrEqual(32);
  });
});
