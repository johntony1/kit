/* Download: two download buttons each its own glimm scope. Press one and its icon gives way to the
 * download, a progress ring on the first and a spinner on the second. While it runs the button leans
 * in; when it lands, glimm's band breaks away up the button and the check is
 * already there behind it.
 *
 * The band is glimm itself (npm i glimm): each button is its own <GlimmScope>, so the band plays
 * inside that button only, and play() runs one action.
 *   work     the download; the button gathers while it runs
 *   change   the check, set the moment the work is done, revealed behind the band
 *   onLeave  everything settled: hold the check, then go back to download
 * Where Chrome has HTML-in-Canvas the buttons themselves ripple as the band passes; everywhere
 * else it is a plain band over the same button. With reduced motion there is no band.
 *
 *  BUTTON          44 × 44, radius 12, Kit's surface and lift; icons 20px at 1.5 stroke
 *  PRESS      0ms  icon leaves: opacity 1 → 0, scale 1 → .6, blur 0 → 4px, y 0 → 3 (spring .3s)
 *                  ring: the track fades in and the arc fills, quick, slow, quick, 2.4s in all
 *                  spinner: the arrow shrinks into a dot at the top and the dot opens into an arc
 *  LAND            the check is set, the band breaks away bottom to top (1s run), the check draws
 *  HOLD     1.6s   after the band has gone, the check stays
 *  RESET           check leaves with blur, the download icon comes back (spring .3s) */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, MotionConfig, animate, useMotionValue, useReducedMotion } from "framer-motion";
import { GlimmScope, type GlimmScopeHandle } from "glimm/react";
import { play } from "../sound/sound";

/* ── sizes ─────────────────────────────────────────────── */
const B = 44, R = 12, GAP = 40;

/* ── motion ────────────────────────────────────────────── */
const SWAP = { type: "spring", visualDuration: 0.3, bounce: 0 } as const;
const RING = { duration: 2.4, times: [0, 0.28, 0.5, 0.8, 1], ease: "easeInOut" as const };
const SPIN_MS = 2300, HOLD = 1600;
/** glimm's band, sized to fill one button: up it, nearly straight, broad and full */
const BAND = { direction: "btt", sweepMs: 1100, curve: 0.04, bandTight: 9, peakAlpha: 1.15 } as const;
/** the scope reaches this far past the button on every side, so glimm's soft fade at a box's
 *  edges falls outside it and the band fills the button right to its corners */
const BLEED = 18;

/* ── this piece's colours: dark, then light ─────────────── */
const CSS = `
.dl { --dl-btn: var(--k-surface); --dl-shadow: var(--k-lift), 0 8px 18px -8px rgba(0,0,0,.6); --dl-ink: var(--k-text);
  --dl-track: rgba(255,255,255,.14); --dl-check: oklch(0.2 0.02 150); }
:root[data-theme="light"] .dl { --dl-btn: oklch(1 0 0); --dl-shadow: var(--k-lift), 0 8px 18px -10px oklch(0.22 0.008 264 / .22);
  --dl-track: oklch(0.22 0.008 264 / .12); --dl-check: oklch(1 0 0); }
.dl-btn { position: relative; overflow: hidden; isolation: isolate; appearance: none; border: 0; padding: 0; width: calc(${B}px * var(--z)); height: calc(${B}px * var(--z)); border-radius: calc(${R}px * var(--z));
  background: var(--dl-btn); box-shadow: var(--dl-shadow); color: var(--dl-ink); cursor: pointer;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.dl-btn[aria-busy="true"] { cursor: default; }
.dl-btn:focus-visible { outline: 2px solid #3fc06c; outline-offset: 3px; }
.dl-layer svg { width: calc(20px * var(--z)); height: calc(20px * var(--z)); }
.dl-layer { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.dl-spin { animation: dl-turn 1.1s linear infinite; }
.dl-spin circle { animation: dl-arc 1.5s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
@keyframes dl-turn { to { transform: rotate(360deg); } }
@keyframes dl-arc { 0% { stroke-dasharray: 1 60; stroke-dashoffset: 0; } 50% { stroke-dasharray: 30 60; stroke-dashoffset: -9; } 100% { stroke-dasharray: 1 60; stroke-dashoffset: -50; } }
@media (prefers-reduced-motion: reduce) { .dl-spin, .dl-spin circle { animation-duration: 3s; } }
`;

/* ── Kit's line icons, 20px, 1.5 stroke ─────────────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ARROW = "M10 3.5v9M6.5 9 10 12.5 13.5 9";
const TRAY = "M4 13v1.75c0 .97.78 1.75 1.75 1.75h8.5c.97 0 1.75-.78 1.75-1.75V13";
const CHECK = "M6.6 10.3 8.9 12.6 13.4 7.7"; // inside the green disc
const TICK = "M5.25 10.5 8.4 13.6 14.75 6.9"; // on its own, full size

const SHOWN = { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" };
const GONE = { opacity: 0, scale: 0.6, y: 3, filter: "blur(4px)" };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** follows the site's light and dark switch */
function useLight() {
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === "light");
  useEffect(() => {
    const el = document.documentElement;
    const mo = new MutationObserver(() => setLight(el.dataset.theme === "light"));
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return light;
}

/* ── one button ────────────────────────────────────────── */
type Stage = "idle" | "busy" | "done";

function DownloadButton({ kind, name, light, z }: { kind: "ring" | "spin"; name: string; light: boolean; z: number }) {
  const reduced = useReducedMotion();
  const scope = useRef<GlimmScopeHandle>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const progress = useMotionValue(0);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  /** one action through glimm: the button gathers while the work runs, then the band breaks away */
  const through = (work: () => Promise<void>, change: () => void) => new Promise<void>((resolve) => {
    if (reduced || !scope.current) { work().then(change).then(resolve); return; }
    scope.current.play({ at: [(B * z) / 2 + BLEED, (B * z) / 2 + BLEED], work, change, onLeave: () => resolve(), onFail: () => resolve() });
  });

  const run = async () => {
    if (stage !== "idle") return;
    play("tap", { vol: 0.6 });
    progress.set(0);
    setStage("busy");
    const work = async () => {
      if (kind === "ring") await animate(progress, [0, 0.36, 0.52, 0.86, 1], RING);
      else await wait(SPIN_MS);
    };
    const change = () => { if (alive.current) { setStage("done"); play("check", { vol: 0.7 }); } };
    await through(work, change);
    await wait(HOLD);
    if (alive.current) setStage("idle");
  };

  const busy = stage === "busy", done = stage === "done";
  const label = stage === "idle" ? name : busy ? `Downloading ${name.toLowerCase()}` : `${name} downloaded`;

  return (
    <motion.button type="button" className="dl-btn" aria-label={label} aria-busy={busy}
      whileTap={stage === "idle" ? { scale: 0.96 } : undefined} transition={{ type: "spring", visualDuration: 0.25, bounce: 0 }}
      onClick={run}>
      <GlimmScope ref={scope} {...BAND} brightness={light ? 1 : 0.85}
        style={{ position: "absolute", inset: -BLEED, background: "var(--dl-btn)" }}>
      <div style={{ position: "absolute", inset: BLEED }}>
      {/* the download icon */}
      <motion.div className="dl-layer" initial={false} animate={stage === "idle" ? SHOWN : kind === "spin" ? { opacity: 0 } : GONE}
        transition={kind === "spin" && stage !== "idle" ? { duration: 0.18, delay: 0.16 } : SWAP}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <motion.path d={ARROW} {...S} initial={false} style={{ transformOrigin: "10px 4px", transformBox: "view-box" }}
            animate={kind === "spin" && stage !== "idle" ? { scaleY: 0.02, scaleX: 0.25 } : { scaleY: 1, scaleX: 1 }} transition={SWAP} />
          <motion.path d={TRAY} {...S} initial={false}
            animate={kind === "spin" && stage !== "idle" ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }} transition={SWAP} />
        </svg>
      </motion.div>

      {/* while it downloads: the ring, or the spinner */}
      <motion.div className="dl-layer" initial={false}
        animate={busy ? SHOWN : kind === "spin" ? { opacity: 0 } : GONE}
        transition={done ? { duration: 0 } : kind === "spin" ? { duration: 0.2, delay: 0.12 } : SWAP}>
        {kind === "ring" ? (
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="10" cy="10" r="8" {...S} stroke="var(--dl-track)" />
            <motion.circle cx="10" cy="10" r="8" {...S} style={{ pathLength: progress }} />
          </svg>
        ) : (
          busy && <svg className="dl-spin" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" {...S} transform="rotate(-90 10 10)" /></svg>
        )}
      </motion.div>

      {/* landed: the check, already there behind the band */}
      <motion.div className="dl-layer" initial={false} animate={done ? SHOWN : GONE} transition={done ? { duration: 0 } : SWAP}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          {kind === "ring" && <circle cx="10" cy="10" r="8.75" fill="#3fc06c" />}
          <motion.path d={kind === "ring" ? CHECK : TICK} {...S} strokeWidth={kind === "ring" ? 1.75 : 1.5} stroke={kind === "ring" ? "var(--dl-check)" : "currentColor"}
            initial={false} animate={{ pathLength: done ? 1 : 0 }}
            transition={done ? { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.12 } : { duration: 0 }} />
        </svg>
      </motion.div>
      </div>
      </GlimmScope>
    </motion.button>
  );
}

/* ── fit: scale into the tile ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const w = B * 2 + GAP, h = B;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight;
      if (!W || !H) return;
      const big = size === "big";
      setScale(Math.min(big ? 2.6 : 1.9, (W - 48) / w, (H - 48) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, scale };
}

/* ── component ──────────────────────────────────────────── */
export default function Download({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, scale } = useFit(size);
  const light = useLight();
  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div data-own-click className="dl" style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%", display: "flex", gap: GAP * scale,
          transform: "translate(-50%, -50%)", ["--z" as string]: scale }}>
          <DownloadButton kind="ring" name="Download" light={light} z={scale} />
          <DownloadButton kind="spin" name="Save" light={light} z={scale} />
        </div>
      </div>
    </MotionConfig>
  );
}
