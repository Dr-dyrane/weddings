import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteOrigin } from "@/domains/weddings/site-origin";

describe("metadata origin", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the current Vercel preview instead of production metadata", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "weddings-preview.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://weddings.dyrane.tech");

    expect(getSiteOrigin().href).toBe(
      "https://weddings-preview.vercel.app/",
    );
  });

  it("uses the configured public origin outside previews", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://weddings.dyrane.tech");

    expect(getSiteOrigin().href).toBe("https://weddings.dyrane.tech/");
  });
});
