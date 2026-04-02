// TextRipple.tsx
// SVG displacement-filter ripple + blue drop-shadow glow for text/content.
// No WebGL — feDisplacementMap + feComposite runs on the GPU via the browser's
// SVG filter pipeline. Framer Motion is NOT used for distortion itself; it
// only manages state. The effect is driven by a plain requestAnimationFrame loop.

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *   0%   calm      — no distortion, no glow
 *  30%   build     — displacement ramps up, glow begins
 *  50%   PEAK      — max warp + max blue glow
 *  57%   glow peak — glow lags distortion by GLOW_LAG
 * 100%   resolve   — fully sharp, filter cleared
 *
 * Duration: DURATION ms (800)
 * ───────────────────────────────────────────────────────── */

import { useRef, useEffect } from "react";

/* ─── Tuning ────────────────────────────────────────────── */
const DURATION   = 800;   // total animation ms
const PEAK_SCALE = 18;    // feDisplacementMap max scale (pixels of source space)
const PEAK_BLUR  = 8;     // drop-shadow blur radius at glow peak (px)
const GLOW_ALPHA = 0.88;  // drop-shadow opacity at glow peak
const GLOW_LAG   = 0.07;  // glow phase offset — peaks just after distortion
const GLOW_COLOR = "59,130,246"; // #3B82F6

/* ─── Props ─────────────────────────────────────────────── */
export interface TextRippleProps {
  children:    React.ReactNode;
  /** Increment to fire the animation. 0 = idle (no animation on mount). */
  triggerKey:  number;
  className?:  string;
  style?:      React.CSSProperties;
}

/* ─── Component ─────────────────────────────────────────── */
export function TextRipple({ children, triggerKey, className, style }: TextRippleProps) {
  // Stable per-instance ID so multiple TextRipple elements don't share a filter.
  const id      = useRef(`tr-${Math.random().toString(36).slice(2, 8)}`).current;
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const divRef  = useRef<HTMLDivElement>(null);
  const rafRef  = useRef(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    cancelAnimationFrame(rafRef.current);

    const start = performance.now();

    function tick(now: number) {
      const p = Math.min((now - start) / DURATION, 1);

      /* sin(π * p): smooth bell curve 0 → 1 → 0 over the full duration.
       * No easing math needed — the sine IS the ease. */
      const distBump = Math.sin(Math.PI * p);

      /* Glow peaks slightly after distortion (GLOW_LAG phase offset). */
      const glowBump = Math.max(0, Math.sin(Math.PI * Math.max(0, p - GLOW_LAG)));

      /* ── Displacement ───────────────────────────────────── */
      if (dispRef.current)
        dispRef.current.setAttribute("scale", (distBump * PEAK_SCALE).toFixed(2));

      /* ── Glow (additive drop-shadow) ────────────────────── */
      if (divRef.current) {
        const alpha = glowBump * GLOW_ALPHA;
        const blur  = glowBump * PEAK_BLUR;
        divRef.current.style.filter = alpha > 0.01
          ? `url(#${id}) drop-shadow(0 0 ${blur.toFixed(1)}px rgba(${GLOW_COLOR},${alpha.toFixed(2)}))`
          : `url(#${id})`;
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        /* Fully resolved — clear both effects so the element is crisp. */
        if (dispRef.current) dispRef.current.setAttribute("scale", "0");
        if (divRef.current)  divRef.current.style.filter = "none";
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [triggerKey, id]);

  return (
    <div
      className={className}
      style={{ position: "relative", display: "inline-flex", width: "100%", alignItems: "center", justifyContent: "center", ...style }}
    >
      {/* Zero-size SVG — only holds the filter definition, never painted. */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={id}
            /* Generous region so displaced pixels aren't clipped by the filter bounds. */
            x="-25%" y="-60%"
            width="150%" height="220%"
            colorInterpolationFilters="sRGB"
          >
            {/*
              feTurbulence type="turbulence" creates Perlin-noise-based
              organic turbulence — anisotropic (X < Y frequency) so the
              distortion reads as a horizontal wave sweeping through the text.

              baseFrequency="0.025 0.09":
                X=0.025 → wide horizontal variation (wave-like bands)
                Y=0.09  → tighter vertical variation (keeps text readable)
              numOctaves=2 → two noise layers blended (richer, not too chaotic)
              seed=4       → controls the specific noise pattern
            */}
            <feTurbulence
              type="turbulence"
              baseFrequency="0.025 0.09"
              numOctaves="2"
              seed="4"
              result="noise"
            />

            {/*
              feDisplacementMap maps the R channel of the noise to X displacement
              and the G channel to Y displacement.
              scale=0 at rest → no distortion; animated to PEAK_SCALE at click.
            */}
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Content wrapper — this is the element that receives filter + drop-shadow. */}
      <div
        ref={divRef}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "inherit" }}
      >
        {children}
      </div>
    </div>
  );
}

export default TextRipple;
