import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isOpenTypeFontData,
  readRuntimeAsset,
  readRuntimeFontAsset,
} from "@/domains/weddings/runtime-assets";

const originalSiteOrigin = process.env.SITE_ORIGIN;

function ttfData() {
  return Uint8Array.from([0x00, 0x01, 0x00, 0x00, 0x44, 0x59, 0x52, 0x41])
    .buffer;
}

beforeEach(() => {
  process.env.SITE_ORIGIN = "https://weddings.dyrane.tech";
  delete (
    globalThis as typeof globalThis & {
      __dyraneEventBindings?: unknown;
    }
  ).__dyraneEventBindings;
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalSiteOrigin === undefined) delete process.env.SITE_ORIGIN;
  else process.env.SITE_ORIGIN = originalSiteOrigin;
});

describe("runtime assets", () => {
  it("recognizes the supported OpenType container signatures", () => {
    expect(isOpenTypeFontData(ttfData())).toBe(true);
    expect(
      isOpenTypeFontData(new TextEncoder().encode("OTTOfont").buffer),
    ).toBe(true);
    expect(
      isOpenTypeFontData(new TextEncoder().encode("wOF2font").buffer),
    ).toBe(true);
    expect(
      isOpenTypeFontData(new TextEncoder().encode("<!DOCTYPE html>").buffer),
    ).toBe(false);
  });

  it("uses the canonical public origin instead of a protected deployment page", async () => {
    const requests: string[] = [];
    vi.stubGlobal("fetch", async (input: string | URL | Request) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      requests.push(url.href);

      if (url.origin === "https://weddings.dyrane.tech") {
        return new Response(ttfData(), {
          headers: { "Content-Type": "font/ttf" },
        });
      }

      return new Response("<!DOCTYPE html><html>Access required</html>", {
        headers: { "Content-Type": "text/html" },
      });
    });

    const data = await readRuntimeFontAsset(
      "/fonts/dyrane-space-grotesk.ttf",
      "https://weddings-git-main-protected.vercel.app/the_ogranyas/icon/512",
    );

    expect(isOpenTypeFontData(data)).toBe(true);
    expect(requests[0]).toBe(
      "https://weddings.dyrane.tech/fonts/dyrane-space-grotesk.ttf",
    );
    expect(requests).not.toContain(
      "https://weddings-git-main-protected.vercel.app/fonts/dyrane-space-grotesk.ttf",
    );
  });

  it("rejects an access page even when it returns 200", async () => {
    vi.stubGlobal("fetch", async () =>
      new Response("<!DOCTYPE html><html>Access required</html>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );

    await expect(
      readRuntimeAsset(
        "/fonts/dyrane-space-grotesk.ttf",
        "https://protected.example.test/the_ogranyas/icon/512",
      ),
    ).rejects.toThrow("returned HTML instead of a binary asset");
  });
});
