import { describe, expect, it } from "vitest";

import { getPublicInvitation } from "@/domains/invitations/invitation";
import { getPublicWeddingMetadata } from "@/domains/invitations/public-metadata";
import {
  getDyraneWeddingsMetadata,
  ROOT_SHARE_CARD_PATH,
} from "@/domains/invitations/root-metadata";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";

describe("public wedding metadata", () => {
  it("keeps the couple page on the approved OGB and logo identities", () => {
    const wedding = getYardstickWedding();
    const invitation = getPublicInvitation();
    const slugMetadata = getPublicWeddingMetadata(
      wedding,
      invitation,
      `/${wedding.slug}`,
    );

    expect(slugMetadata.openGraph).toMatchObject({
      url: "/the_ogranyas",
      images: [
        {
          url: expect.stringContaining(
            "/the_ogranyas/card/3?day=",
          ),
        },
      ],
    });
    expect(slugMetadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [expect.stringContaining("v=approved-ogb-20260809-3")],
    });
    expect(slugMetadata.icons).toMatchObject({
      icon: expect.arrayContaining([
        expect.objectContaining({
          url: "/the_ogranyas/icon/32?v=monogram-4-revision-1",
        }),
      ]),
    });
  });

  it("gives the bare domain its own Dyrane Weddings OGB", () => {
    const metadata = getDyraneWeddingsMetadata();

    expect(metadata.openGraph).toMatchObject({
      title: "Dyrane Weddings",
      url: "/",
      images: [{ url: ROOT_SHARE_CARD_PATH }],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [ROOT_SHARE_CARD_PATH],
    });
  });
});
