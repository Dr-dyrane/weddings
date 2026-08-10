import { describe, expect, it } from "vitest";

import { isTrustedStudioMutation } from "./studio-auth";

describe("Studio mutation origin boundary", () => {
  it("accepts same-origin mutations", () => {
    const request = new Request(
      "https://weddings.example/api/studio/the_ogranyas/celebration",
      { headers: { Origin: "https://weddings.example" }, method: "POST" },
    );

    expect(isTrustedStudioMutation(request)).toBe(true);
  });

  it("rejects cross-origin mutations", () => {
    const request = new Request(
      "https://weddings.example/api/studio/the_ogranyas/celebration",
      { headers: { Origin: "https://attacker.example" }, method: "POST" },
    );

    expect(isTrustedStudioMutation(request)).toBe(false);
  });
});
