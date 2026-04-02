// TextShimmer.tsx
// A bright highlight sweeps left-to-right through text on trigger.
// Uses background-clip: text + animated backgroundPosition.
// One-shot, ease-out-quart — resolves to clean text. No loop.

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/* ─── Tuning ────────────────────────────────────────────── */
const DURATION  = 1.1;
const EASE      = [0.37, 0, 0.63, 1] as const; // ease-in-out sine — slow start, gentle peak, slow exit
const TEXT_COLOR  = "#5c5c5c";
const GLOW_MID    = "#bfdbfe"; // blue-200
const GLOW_BRIGHT = "#eff6ff"; // blue-50 (near-white core)

/* ─── Props ─────────────────────────────────────────────── */
export interface TextShimmerProps {
  children:   React.ReactNode;
  triggerKey: number;
  className?: string;
  style?:     React.CSSProperties;
}

/* ─── Component ─────────────────────────────────────────── */
export function TextShimmer({ children, triggerKey, className, style }: TextShimmerProps) {
  // bgX: the X-offset of the gradient, in percent.
  // 150 = highlight fully off to the right (idle/reset state)
  // -50 = highlight fully off to the left (end state, then snap back)
  const bgX               = useMotionValue(150);
  const backgroundPosition = useTransform(bgX, x => `${x}% center`);

  useEffect(() => {
    if (triggerKey === 0) return;
    // Snap to start, then sweep through
    bgX.set(150);
    const anim = animate(bgX, -50, {
      duration: DURATION,
      ease: EASE,
      onComplete: () => bgX.set(150), // reset for next trigger
    });
    return () => anim.stop();
  }, [triggerKey, bgX]);

  return (
    <motion.span
      className={className}
      style={{
        /* Gradient: base color on both sides, bright sweep in the center.
         * backgroundSize: 300% makes the highlight narrow (≈20% of text width)
         * so it reads as a focused ray of light, not a broad wash. */
        backgroundImage: [
          "linear-gradient(90deg,",
          `${TEXT_COLOR} 0%,`,
          `${TEXT_COLOR} 30%,`,
          `${GLOW_MID} 44%,`,
          `${GLOW_BRIGHT} 50%,`,
          `${GLOW_MID} 56%,`,
          `${TEXT_COLOR} 70%,`,
          `${TEXT_COLOR} 100%)`,
        ].join(" "),
        backgroundSize:      "300% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip:       "text",
        // color: transparent — the background gradient IS the text color.
        // This has no effect on screen readers (text is still in DOM).
        color:               "transparent",
        display:             "inline",
        backgroundPosition,
        ...style,
      }}
    >
      {children}
    </motion.span>
  );
}

export default TextShimmer;
