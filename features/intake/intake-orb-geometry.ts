export type OrbPoint = readonly [number, number, number];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Builds a restrained spiral that sits just above a unit sphere.
 * Keeping this pure makes the progress contract testable without WebGL.
 */
export function createOrbProgressPoints(
  progress: number,
  samples = 72,
): OrbPoint[] {
  const safeProgress = clamp(progress);
  const pointCount = Math.max(4, Math.round(samples * Math.max(0.055, safeProgress)));

  return Array.from({ length: pointCount }, (_, index) => {
    const local = pointCount === 1 ? 0 : index / (pointCount - 1);
    const travel = local * Math.max(0.055, safeProgress);
    const angle = -Math.PI * 0.62 + travel * Math.PI * 2.24;
    const y = 0.46 - travel * 0.92;
    const radius = Math.sqrt(Math.max(0.12, 1 - y * y)) * 1.025;

    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as const;
  });
}
