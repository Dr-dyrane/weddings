import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { GET as getWeddingIcon } from "@/app/[weddingSlug]/icon/[size]/route";
import { GET as getWeddingLogo } from "@/app/[weddingSlug]/logo.svg/route";
import { GET as getWeddingManifest } from "@/app/[weddingSlug]/manifest.webmanifest/route";
import {
  getWeddingBrandAssets,
  getWeddingBrandMetadata,
  isWeddingIconSize,
} from "@/domains/weddings/couple-brand";
import {
  getCoupleMonogramDataUri,
  getCoupleMonogramText,
  getCoupleInitials,
  renderCoupleMonogramSvg,
} from "@/ui/brand/couple-monogram";

const yardstickParams = Promise.resolve({ weddingSlug: "the_ogranyas" });

describe("dynamic couple brand", () => {
  it("keeps the checked-in root favicon on the approved mark", async () => {
    const favicon = await readFile(
      path.join(process.cwd(), "public/favicon.svg"),
      "utf8",
    );

    expect(favicon).toContain("Dyrane Space Grotesk");
    expect(favicon).toContain('stroke="#ffd21e"');
    expect(favicon).toContain(">A &amp; C</text>");
    expect(favicon).not.toContain("Cinzel");
    expect(favicon).not.toContain("∞");
  });

  it("derives Unicode-safe first-name initials with a product fallback", () => {
    expect(getCoupleInitials(" Alexander ", "Chioma")).toEqual({
      first: "A",
      second: "C",
    });
    expect(getCoupleInitials("O\u0323\u0300ranyanwụ", "Chịọma")).toEqual({
      first: "Ọ̀",
      second: "C",
    });
    expect(getCoupleInitials("Dyrane", "Weddings")).toEqual({
      first: "D",
      second: "W",
    });
    expect(getCoupleMonogramText("alexander", "chioma")).toBe("A & C");
  });

  it("serializes an accessible Space Grotesk circle mark", () => {
    const svg = renderCoupleMonogramSvg({
      firstName: "Ada",
      secondName: "Chidi",
      title: "Ada & Chidi <wedding>",
    });

    expect(svg).toContain("Ada &amp; Chidi &lt;wedding&gt;");
    expect(svg).toContain(">A &amp; C</text>");
    expect(svg).toContain("Dyrane Space Grotesk");
    expect(svg).toContain('<circle cx="80" cy="80" r="60"');
    expect(svg).toContain('stroke="#ffd21e"');
    expect(svg).not.toContain("skewX");
    expect(svg).not.toContain("∞");
    expect(getCoupleMonogramDataUri({ firstName: "Ada", secondName: "Chidi" })).toMatch(
      /^data:image\/svg\+xml/,
    );
  });

  it("produces stable deep-page logo, icon and manifest metadata", () => {
    const source = { revision: 1, slug: "the_ogranyas" };
    const assets = getWeddingBrandAssets(source);
    const metadata = getWeddingBrandMetadata(source);

    expect(assets).toEqual({
      appleIcon: "/the_ogranyas/icon/180?v=monogram-3-revision-1",
      favicon: "/the_ogranyas/icon/32?v=monogram-3-revision-1",
      icon192: "/the_ogranyas/icon/192?v=monogram-3-revision-1",
      icon512: "/the_ogranyas/icon/512?v=monogram-3-revision-1",
      logo: "/the_ogranyas/logo.svg?v=monogram-3-revision-1",
      manifest:
        "/the_ogranyas/manifest.webmanifest?v=monogram-3-revision-1",
    });
    expect(metadata.manifest).toBe(assets.manifest);
    expect(metadata.icons).toBeTruthy();
    expect(isWeddingIconSize(32)).toBe(true);
    expect(isWeddingIconSize(64)).toBe(false);
  });

  it("serves the couple logo and manifest from the wedding route", async () => {
    const logoResponse = await getWeddingLogo(new Request("https://example.test"), {
      params: yardstickParams,
    });
    const manifestResponse = await getWeddingManifest(
      new Request("https://example.test"),
      { params: yardstickParams },
    );
    const manifest = await manifestResponse.json();

    expect(logoResponse.status).toBe(200);
    expect(logoResponse.headers.get("content-type")).toContain("image/svg+xml");
    const logo = await logoResponse.text();
    expect(logo).toContain(">A &amp; C</text>");
    expect(logo).toContain('stroke="#ffd21e"');
    expect(logo).toContain("data:font/ttf;base64,");
    expect(manifestResponse.headers.get("content-type")).toContain(
      "application/manifest+json",
    );
    expect(manifest.short_name).toBe("AC Wedding");
    expect(manifest.background_color).toBe("#000000");
    expect(manifest.theme_color).toBe("#000000");
    expect(manifest.icons).toHaveLength(3);
    expect(manifest.start_url).toBe("/the_ogranyas/");
    expect(JSON.stringify(manifest)).not.toContain("invite/");
  });

  it("renders a real compact PNG app icon", async () => {
    const response = await getWeddingIcon(new Request("https://example.test"), {
      params: Promise.resolve({ size: "32", weddingSlug: "the_ogranyas" }),
    });
    const image = await response.arrayBuffer();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(image.byteLength).toBeGreaterThan(500);
  });
});
