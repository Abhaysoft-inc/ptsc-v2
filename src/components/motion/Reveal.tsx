"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Animate on mount instead of when scrolled into view (for above the fold). */
  onMount?: boolean;
}

// Fades + lifts a single element into place. Wrap a card rather than putting
// this on it, so the card's own hover transforms don't fight the animation.
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  onMount = false,
}: RevealProps) {
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(onMount
        ? { animate: target }
        : {
            whileInView: target,
            viewport: { once: true, margin: "0px 0px -80px 0px" },
          })}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
