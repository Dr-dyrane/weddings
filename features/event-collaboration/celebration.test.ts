import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { projectWeddingForCelebration } from "@/domains/event-collaboration/celebration";
import { getYardstickWedding } from "@/domains/weddings/published-wedding";
import { CelebrationHub } from "@/features/event-collaboration/celebration-hub";
import { GuestPhotoEntry } from "@/features/event-collaboration/guest-photo-entry";

describe("event collaboration surfaces", () => {
  const celebration = projectWeddingForCelebration(getYardstickWedding());

  it("renders an honest published empty state without demo credits", () => {
    const markup = renderToStaticMarkup(
      createElement(CelebrationHub, { celebration }),
    );

    expect(markup).toContain("The wedding circle will unfold here");
    expect(markup).toContain("The creative credits will appear");
    expect(markup).not.toContain("preview");
    expect(markup).not.toContain("sample");
    expect(markup).toContain('href="/the_ogranyas/celebration/photos"');
  });

  it("renders a truthful, accessible public entry state", () => {
    const markup = renderToStaticMarkup(
      createElement(GuestPhotoEntry, {
        celebration,
        fallbackUrl:
          "https://weddings.example/the_ogranyas/celebration/photos",
      }),
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Event QR required");
    expect(markup).toContain("No upload happens on this public page.");
    expect(markup).toContain(
      "https://weddings.example/the_ogranyas/celebration/photos",
    );
    expect(markup).not.toContain('type="file"');
    expect(markup).not.toContain("Upload photo");
    expect(markup).toContain('href="/the_ogranyas"');
    expect(markup).not.toContain('href="/the_ogranyas/celebration"');
  });
});
