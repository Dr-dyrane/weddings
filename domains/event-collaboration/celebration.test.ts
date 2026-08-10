import { describe, expect, it } from "vitest";

import {
  getGuestPhotoFallbackPath,
  getGuestPhotoFallbackUrl,
  getGuestPhotoQrTargetPath,
  getGuestPhotoQrTargetPathTemplate,
  projectPublishedCreditsForCelebration,
  projectWeddingForCelebration,
} from "@/domains/event-collaboration/celebration";
import { DEMO_INVITATION_TOKEN } from "@/domains/invitations/invitation";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

describe("event collaboration projection", () => {
  it("projects the published wedding without inventing credits", () => {
    const wedding = getYardstickWedding();
    const projection = projectWeddingForCelebration(wedding);

    expect(projection.contentState).toBe("published");
    expect(projection.peopleGroups).toEqual([]);
    expect(projection.vendors).toEqual([]);
    expect(projection).not.toHaveProperty("events");
    expect(projection).not.toHaveProperty("invitation");
  });

  it("keeps the ordinary fallback public and free of guest credentials", () => {
    const wedding = getYardstickWedding();
    const path = getGuestPhotoFallbackPath(wedding);
    const url = getGuestPhotoFallbackUrl(
      wedding,
      new URL("https://weddings.example/"),
    );

    expect(path).toBe("/the_ogranyas/celebration/photos");
    expect(url).toBe("https://weddings.example/the_ogranyas/celebration/photos");
    expect(url).not.toContain("/invite/");
    expect(url).not.toContain(DEMO_INVITATION_TOKEN);
    expect(new URL(url).search).toBe("");
  });

  it("models the live QR route with a distinct opaque collection credential", () => {
    const wedding = getYardstickWedding();
    const simulatedCollectionCredential = "c".repeat(43);
    const target = getGuestPhotoQrTargetPath(
      wedding,
      simulatedCollectionCredential,
    );

    expect(getGuestPhotoQrTargetPathTemplate(wedding)).toBe(
      "/the_ogranyas/celebration/photos/[opaqueCollectionCredential]",
    );
    expect(target).toBe(
      `/the_ogranyas/celebration/photos/${simulatedCollectionCredential}`,
    );
    expect(target).not.toContain(DEMO_INVITATION_TOKEN);
    expect(() => getGuestPhotoQrTargetPath(wedding, "short-token")).toThrow(
      "A valid opaque collection credential is required.",
    );
  });

  it("publishes only explicitly approved credit records", () => {
    const wedding = getYardstickWedding();
    const projection = projectPublishedCreditsForCelebration(wedding, [
      {
        id: "approved-person",
        weddingId: wedding.id,
        kind: "person",
        displayName: "Approved Person",
        role: "Maid of Honour",
        groupName: "wedding-party",
        sortOrder: 1,
        visibility: "public",
        consent: "approved",
      },
      {
        id: "private-vendor",
        weddingId: wedding.id,
        kind: "vendor",
        displayName: "Private Vendor",
        role: "Photography",
        groupName: "vendors",
        sortOrder: 2,
        visibility: "private",
        consent: "pending",
      },
    ]);

    expect(projection.peopleGroups[0]?.people[0]?.displayName).toBe(
      "Approved Person",
    );
    expect(JSON.stringify(projection)).not.toContain("Private Vendor");
  });

  it("keeps public entry separate from credentialed contribution intake", () => {
    const projection = projectWeddingForCelebration(getYardstickWedding());

    expect(projection.photoContribution).toEqual({
      state: "credential-required",
      fallbackPath: "/the_ogranyas/celebration/photos",
      qrTargetPathTemplate:
        "/the_ogranyas/celebration/photos/[opaqueCollectionCredential]",
    });
  });
});
