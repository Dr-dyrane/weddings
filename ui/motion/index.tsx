"use client";

import { MotionConfig } from "motion/react";

export { motionDuration, motionEase, motionTransition } from "./tokens";

export function DyraneMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
