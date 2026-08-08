export const motionDuration = {
  instant: 0.08,
  quick: 0.16,
  standard: 0.28,
  chapter: 0.6,
} as const;

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const motionTransition = {
  instant: { duration: motionDuration.instant, ease: motionEase },
  quick: { duration: motionDuration.quick, ease: motionEase },
  standard: { duration: motionDuration.standard, ease: motionEase },
  chapter: { duration: motionDuration.chapter, ease: motionEase },
} as const;
