import { describe, expect, it } from "vitest";

import {
  getResolvedPackageBenefits,
  weddingPackages,
} from "@/domains/offers/wedding-packages";

describe("wedding packages", () => {
  it("keeps the offer progressive without dropping lower-tier benefits", () => {
    const resolved = weddingPackages.map((weddingPackage) =>
      getResolvedPackageBenefits(weddingPackage.id),
    );

    expect(resolved[1]).toEqual(
      expect.arrayContaining(resolved[0]),
    );
    expect(resolved[2]).toEqual(
      expect.arrayContaining(resolved[1]),
    );
    expect(resolved[0].length).toBeLessThan(resolved[1].length);
    expect(resolved[1].length).toBeLessThan(resolved[2].length);
  });

  it("keeps the public Nigerian price ladder explicit", () => {
    expect(weddingPackages.map(({ price }) => price)).toEqual([
      "₦650,000",
      "₦900,000",
      "₦1,500,000",
    ]);
  });
});
