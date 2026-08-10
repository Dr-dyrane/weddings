import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

describe("private credential route headers", () => {
  it.each([
    "/the_ogranyas/invite/opaque-invitation-credential",
    `/the_ogranyas/celebration/photos/${"c".repeat(43)}`,
    `/api/weddings/the_ogranyas/celebration/photos/${"c".repeat(43)}`,
    "/api/weddings/the_ogranyas/rsvp",
    "/the_ogranyas/studio/celebration",
    "/api/studio/the_ogranyas/celebration",
  ])("protects %s from caches, referrers, and crawlers", (pathname) => {
    const response = proxy(
      new NextRequest(new URL(pathname, "https://weddings.example")),
    );

    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-robots-tag")).toBe(
      "noindex, nofollow, noarchive, nosnippet",
    );
  });

  it("does not classify the ordinary no-scan fallback as a credential route", () => {
    const response = proxy(
      new NextRequest(
        "https://weddings.example/the_ogranyas/celebration/photos",
      ),
    );

    expect(response.headers.get("cache-control")).toBeNull();
    expect(response.headers.get("referrer-policy")).toBeNull();
  });
});
