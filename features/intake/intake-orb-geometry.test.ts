import { describe, expect, it } from "vitest";

import { createOrbProgressPoints } from "@/features/intake/intake-orb-geometry";

describe("createOrbProgressPoints", () => {
  it("clamps progress and always returns enough points for a smooth curve", () => {
    expect(createOrbProgressPoints(-1)).toHaveLength(4);
    expect(createOrbProgressPoints(2)).toHaveLength(72);
  });

  it("extends the path as the conversation advances", () => {
    const beginning = createOrbProgressPoints(1 / 6);
    const ending = createOrbProgressPoints(1);

    expect(ending.length).toBeGreaterThan(beginning.length);
    expect(ending.at(-1)).not.toEqual(beginning.at(-1));
  });

  it("keeps every point on the orb surface", () => {
    for (const [x, y, z] of createOrbProgressPoints(0.72)) {
      const radius = Math.sqrt(x * x + y * y + z * z);
      expect(radius).toBeGreaterThan(1);
      expect(radius).toBeLessThan(1.04);
    }
  });
});
