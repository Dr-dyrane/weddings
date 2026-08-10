import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

let eventStore: typeof import("./event-store");
let eventPolicy: typeof import("./event-policy");

beforeAll(async () => {
  eventStore = await import("./event-store");
  eventPolicy = await import("./event-policy");
});

describe("event collaboration storage boundary", () => {
  it("hashes bearer collection credentials deterministically without storing them", async () => {
    const first = await eventStore.hashCollectionCredential("c".repeat(43));
    const second = await eventStore.hashCollectionCredential("c".repeat(43));

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain("c".repeat(10));
  });

  it("accepts a real JPEG signature independently of the browser MIME claim", async () => {
    const file = new File(
      [new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 1, 2, 3])],
      "moment.txt",
      { type: "text/plain" },
    );

    await expect(eventPolicy.validatePhoto(file)).resolves.toMatchObject({
      extension: "jpg",
      mediaType: "image/jpeg",
    });
  });

  it("rejects extension-only image spoofing", async () => {
    const file = new File(["not an image"], "moment.jpg", {
      type: "image/jpeg",
    });

    await expect(eventPolicy.validatePhoto(file)).rejects.toThrow(
      "Use a JPEG, PNG, WebP, or HEIC photo.",
    );
  });
});
