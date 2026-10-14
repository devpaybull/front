import type { MotionProps } from "motion/react";

export const listItemMotion: MotionProps = {
  layout: "position",
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
  transition: { layout: { type: "spring", bounce: 0, duration: 0.3 } },
};
