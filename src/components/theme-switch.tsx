/* Theme switch: a rocker for light and dark. A tall pill split in two, a sun half and a moon half;
 * the half for the theme you are in is pressed in, the other stands proud and catches the light.
 * Dark: a black rocker on a green under-glow. Light: a pale rocker with a green lip underneath.
 * Flip it and the other theme grows out of the switch as a circle until it fills the window.
 *
 * Storyboard (one flip):
 *    0ms   the halves rock over (260ms ease); the switch plays its click
 *    0ms   a copy of the page in the new theme is clipped to a circle at the switch, r = 0
 *  620ms   the circle has grown past the farthest corner (cubic-bezier(.2,0,0,1)); the copy
 *          becomes the page
 *
 * The little window starts in the theme of the page around it (and follows it when that changes),
 * but flipping the rocker only changes the little window, never the page.
 *
 * One file, React and framer-motion. Render it inside a positioned box. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { play } from "../sound/sound";

type Mode = "dark" | "light";

/* two palettes for the little window. Light is a cool OKLCH neutral (hue 264), Linear style */
const P = {
  dark: { page: "#141514", bar: "#1b1c1b", ink: "rgba(255,255,255,.1)", inkStrong: "rgba(255,255,255,.28)", card: "#1d1e1d", cardLine: "rgba(255,255,255,.07)", frame: "0 0 0 1px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06), var(--ts-drop-dark)" },
  light: { page: "oklch(0.982 0.002 264)", bar: "oklch(1 0 0)", ink: "oklch(0.22 0.008 264 / .1)", inkStrong: "oklch(0.22 0.008 264 / .34)", card: "oklch(1 0 0)", cardLine: "oklch(0.22 0.008 264 / .08)", frame: "0 0 0 1px oklch(0.22 0.008 264 / .12), var(--ts-drop-light)" },
};

/* the window's drop shadow depends on the page it floats over, not on its own theme */
const CSS = `
.theme-switch { --ts-drop-dark: 0 24px 48px -16px rgba(0,0,0,.7); --ts-drop-light: 0 24px 48px -16px rgba(0,0,0,.55); }
:root[data-theme="light"] .theme-switch { --ts-drop-dark: 0 2px 4px oklch(0.22 0.008 264 / .1), 0 20px 40px -16px oklch(0.22 0.008 264 / .38); --ts-drop-light: 0 2px 4px oklch(0.22 0.008 264 / .05), 0 20px 40px -16px oklch(0.22 0.008 264 / .2); }`;
const siteMode = (): Mode => (typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark");

const W = 320, H = 210;
const SWITCH = { x: W - 30, y: 26 }; // the rocker's centre inside the window
const R = Math.hypot(SWITCH.x, H - SWITCH.y) + 4; // far enough to cover the farthest corner

const Bar = ({ w, h = 6, c }: { w: number | string; h?: number; c: string }) => <span style={{ display: "block", width: w, height: h, borderRadius: 4, background: c }} />;

/** the little page: a nav, a heading, two lines and three cards, all as skeleton bars */
function Page({ m }: { m: Mode }) {
  const p = P[m];
  return (
    <div style={{ position: "absolute", inset: 0, background: p.page, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", background: p.bar, boxShadow: `inset 0 -1px 0 ${p.cardLine}` }}>
        <span style={{ width: 18, height: 18, borderRadius: 6, background: p.inkStrong }} />
        <Bar w={40} h={5} c={p.ink} /><Bar w={30} h={5} c={p.ink} /><Bar w={34} h={5} c={p.ink} />
      </div>
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 7 }}>
        <Bar w="52%" h={11} c={p.inkStrong} /><Bar w="70%" c={p.ink} /><Bar w="44%" c={p.ink} />
      </div>
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: "auto" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 46, borderRadius: 9, background: p.card, boxShadow: `inset 0 0 0 1px ${p.cardLine}`, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4, padding: 8 }}>
            <Bar w="60%" h={4} c={p.inkStrong} /><Bar w="40%" h={4} c={p.ink} />
          </div>
        ))}
      </div>
    </div>
  );
}

const Sun = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="2.8" fill="currentColor" stroke="none" />
    <path d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" />
  </svg>
);
const Moon = () => <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true"><path d="M10.9 10.6A5.2 5.2 0 0 1 5.4 2.2a5.6 5.6 0 1 0 8.4 6.3 5.2 5.2 0 0 1-2.9 2.1z" fill="currentColor" /></svg>;

const EASE = "260ms cubic-bezier(.2,0,0,1)";
/** the rocker itself: 22 by 38, the pressed half sunk, the raised half lit */
export function Rocker({ mode, onFlip }: { mode: Mode; onFlip: () => void }) {
  const dark = mode === "dark";
  const half = (pressed: boolean): React.CSSProperties => ({
    flex: 1, display: "grid", placeItems: "center", transition: `background ${EASE}, color ${EASE}, box-shadow ${EASE}`,
    ...(dark
      ? pressed ? { background: "linear-gradient(180deg,#050605,#0e100e)", color: "#8ff5b6", boxShadow: "inset 0 2px 3px rgba(0,0,0,.8)" }
        : { background: "linear-gradient(180deg,#2a2d2a,#181a18)", color: "rgba(233,238,233,.55)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), 0 1px 0 rgba(0,0,0,.9)" }
      : pressed ? { background: "linear-gradient(180deg, oklch(0.89 0.004 264), oklch(0.925 0.004 264))", color: "oklch(0.53 0.011 264)", boxShadow: "inset 0 2px 3px oklch(0.22 0.008 264 / .16)" }
        : { background: "linear-gradient(180deg, oklch(1 0 0), oklch(0.965 0.003 264))", color: "oklch(0.38 0.009 264 / .6)", boxShadow: "inset 0 1px 0 #fff" }),
  });
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label={dark ? "Dark. Switch to light" : "Light. Switch to dark"} onClick={onFlip}
      style={{ position: "relative", width: 22, height: 38, padding: 0, border: 0, background: "none", cursor: "pointer", borderRadius: 11 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: 11, overflow: "hidden", display: "flex", flexDirection: "column", transition: `box-shadow ${EASE}, background ${EASE}`,
        background: dark ? "#0b0c0b" : "oklch(0.93 0.004 264)",
        boxShadow: dark ? "0 0 0 1px rgba(93,255,154,.55), 0 0 6px rgba(93,255,154,.45), 0 0 16px rgba(61,220,132,.28)" : "0 0 0 1px oklch(0.22 0.008 264 / .1), 0 2px 0 oklch(0.72 0.17 150), 0 3px 6px -1px oklch(0.62 0.16 150 / .35)",
      }}>
        {/* light: the sun half is pressed; dark: the moon half is pressed */}
        <span style={half(!dark)}><Sun /></span>
        <span style={half(dark)}><span style={{ display: "grid", filter: dark ? "drop-shadow(0 0 3px rgba(93,255,154,.7))" : "none" }}><Moon /></span></span>
      </span>
    </button>
  );
}

export default function ThemeSwitch({ size = "card" }: { size?: "card" | "big" }) {
  const box = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const [mode, setMode] = useState<Mode>(siteMode);
  const [next, setNext] = useState<Mode | null>(null);
  const busy = useRef(false);

  // follow the page's theme when it changes (one way: the rocker never sets the page's theme)
  useEffect(() => {
    const mo = new MutationObserver(() => { if (!busy.current) setMode(siteMode()); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  const r = useMotionValue(0);
  const clip = useMotionTemplate`circle(${r}px at ${SWITCH.x}px ${SWITCH.y}px)`;

  useLayoutEffect(() => {
    const el = box.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(Math.min(size === "big" ? 2 : 1.25, (el.clientWidth - 48) / W, (el.clientHeight - (size === "big" ? 80 : 110)) / H)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const flip = () => {
    if (next) return;
    const to: Mode = mode === "dark" ? "light" : "dark";
    play(to === "dark" ? "on" : "off");
    setNext(to);
    busy.current = true;
    r.set(0);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    animate(r, R, { duration: still ? 0 : 0.62, ease: [0.2, 0, 0, 1], onComplete: () => { setMode(to); setNext(null); busy.current = false; } });
  };

  return (
    <div ref={box} data-own-click className="theme-switch" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <style>{CSS}</style>
      <div style={{ width: W * s, height: H * s, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${s})`, transformOrigin: "0 0", borderRadius: 16, overflow: "hidden", boxShadow: P[mode].frame }}>
          <Page m={mode} />
          {next && <motion.div style={{ position: "absolute", inset: 0, clipPath: clip, WebkitClipPath: clip }}><Page m={next} /></motion.div>}
          <div style={{ position: "absolute", left: SWITCH.x - 11, top: SWITCH.y - 19, zIndex: 2 }}>
            <Rocker mode={next ?? mode} onFlip={flip} />
          </div>
        </div>
      </div>
    </div>
  );
}
