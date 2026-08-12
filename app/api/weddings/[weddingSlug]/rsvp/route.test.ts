import { afterEach, describe, expect, it } from "vitest";

import { POST } from "./route";

const validResponse = {
  attendance: "yes",
  guestName: "Preview Guest",
  idempotencyKey: "preview-response-1234",
  menuChoice: "Celebration menu",
  note: "With love",
};

function clearEventBindings() {
  delete (
    globalThis as typeof globalThis & {
      __dyraneEventBindings?: unknown;
    }
  ).__dyraneEventBindings;
}

describe("public RSVP route", () => {
  afterEach(clearEventBindings);

  it("does not acknowledge a response when hosted storage is unavailable", async () => {
    clearEventBindings();

    const result = await POST(
      new Request("https://weddings.dyrane.tech/api/weddings/the_ogranyas/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validResponse),
      }),
      { params: Promise.resolve({ weddingSlug: "the_ogranyas" }) },
    );

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({
      code: "rsvp_storage_unavailable",
      error:
        "Your response was not saved. RSVP delivery is temporarily unavailable; please try again later.",
    });
  });

  it("still rejects malformed responses", async () => {
    const result = await POST(
      new Request("https://weddings.dyrane.tech/api/weddings/the_ogranyas/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validResponse, guestName: "" }),
      }),
      { params: Promise.resolve({ weddingSlug: "the_ogranyas" }) },
    );

    expect(result.status).toBe(400);
  });
});
