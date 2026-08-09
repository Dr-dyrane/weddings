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
  it("produces stable public and personalized card paths", () => {
    const wedding = getYardstickWedding();
    const publicInvitation = getPublicInvitation();
    const personalized = resolveInvitation(
      wedding.slug,
      DEMO_INVITATION_TOKEN,
    );
    expect(personalized).not.toBeNull();

    expect(getPublicCardPath(wedding, publicInvitation)).toBe(
      "/the_ogranyas/card/2",
    );
    expect(
      getPersonalizedCardPath(
        wedding,
        DEMO_INVITATION_TOKEN,
        personalized!,
      ),
    ).toContain(`/invite/${DEMO_INVITATION_TOKEN}/card/2`);
  });

  it("matches only canonical numeric editions", () => {
    expect(cardEditionMatches("1", 1)).toBe(true);
    expect(cardEditionMatches("01", 1)).toBe(false);
    expect(cardEditionMatches("1.0", 1)).toBe(false);
    expect(cardEditionMatches("not-an-edition", 1)).toBe(false);
  });
});
