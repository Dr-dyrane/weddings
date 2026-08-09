import { describe, expect, it } from "vitest";

import {
  cardEditionMatches,
  getPersonalizedCardPath,
  getPublicCardPath,
} from "@/domains/invitations/card-edition";
import {
  DEMO_INVITATION_TOKEN,
  getPublicInvitation,
  resolveInvitation,
} from "@/domains/invitations/invitation";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

describe("share-card editions", () => {
  it("produces daily-versioned public and personalized card paths", () => {
    const wedding = getYardstickWedding();
    const publicInvitation = getPublicInvitation();
    const now = new Date("2026-08-09T12:00:00.000Z");
    const personalized = resolveInvitation(
      wedding.slug,
      DEMO_INVITATION_TOKEN,
    );
    expect(personalized).not.toBeNull();

    expect(getPublicCardPath(wedding, publicInvitation, now)).toBe(
      "/the_ogranyas/card/2?day=2026-08-09",
    );
    expect(
      getPersonalizedCardPath(
        wedding,
        DEMO_INVITATION_TOKEN,
        personalized!,
        now,
      ),
    ).toContain(
      `/invite/${DEMO_INVITATION_TOKEN}/card/2?day=2026-08-09`,
    );
  });

  it("matches only canonical numeric editions", () => {
    expect(cardEditionMatches("1", 1)).toBe(true);
    expect(cardEditionMatches("01", 1)).toBe(false);
    expect(cardEditionMatches("1.0", 1)).toBe(false);
    expect(cardEditionMatches("not-an-edition", 1)).toBe(false);
  });
});
