/* Theme switch: a physical rocker lying on a surface, seen from above at an angle. OFF on the far
 * half, ON on the near half, and a row of dots on the floor beside it running from SÜ to ER.
 * Like a real rocker one half is pressed flat and the other tips up, showing the wall beneath
 * it. The surface it sits on is the theme:
 *
 *   light (off)  a clean pale floor. OFF pressed flat, its label glowing white. ON tipped up, its
 *                face grey, its green wall shaded round the curve (mint where it faces the
 *                light, deep green where it turns away) and a soft contact shadow under it.
 *   dark (on)    a black floor. ON pressed flat inside a glowing green rim, its label bold
 *                white. OFF tipped up, the wall under it lit white fading to green, and green
 *                light spilling over the floor round it.
 *
 * Storyboard (press it while it is light):
 *   down   the raised end gives a little under the finger (140ms spring); slide off and it springs back
 *    0ms   on release the switch clicks and rocks over (280ms spring): ON goes down, OFF tips up
 *    0ms   the dots light white from SÜ toward ER, one after another
 *  700ms   the last dot lights at ER and the whole surface cuts to dark
 *
 * Press it while it is dark: it rocks back, the dots go out from ER toward SÜ, and at the last
 * one the surface cuts back to light. Press again mid-way and it runs back the way it came.
 * It starts in the theme of the page around it; it changes only its own surface, never the page.
 *
 * Drawn on a canvas: the rocker is real geometry (two hinged halves with rounded ends) projected
 * through a camera, each strip of the wall shaded by the way it faces. One file, React and
 * framer-motion. Render it inside a positioned box: it fills the box. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { play } from "../sound/sound";

type Mode = "dark" | "light";
type V3 = [number, number, number];
type P2 = { x: number; y: number; z: number; k: number };
const siteMode = (): Mode => (typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark");

/* the switch, in its own units: x across, y along (OFF far at y 0), z up from the floor */
const PW = 100, R = PW / 2, PH = 256, L = PH / 2;   // the rocker; each half is L long
const BASE = 3;                                      // the body's thickness under a pressed half
const TILT = 15 * (Math.PI / 180);                   // how far a raised half tips up
const DX = PW + 26, DOTS = 19, DOT_TOP = 26, DOT_BOT = 230;
const CENTER = { x: R, y: PH / 2 };   // the camera looks straight down the rocker, so it stands square
/* the camera: turned so the switch lies across the view (ON left, OFF right, the dots in front),
 * looking down 52 degrees from straight overhead */
const PHI = 90 * (Math.PI / 180), THETA = 52 * (Math.PI / 180), FOCAL = 1500;
const CHARGE = 0.7;                                  // seconds for the dots to fill or drain
const ROCK = { type: "spring", duration: 0.28, bounce: 0 } as const;
const GIVE = { amount: 0.16, spring: { type: "spring", duration: 0.14, bounce: 0 } } as const; // the dip under a finger
const FONT = '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgb = (a: number[], b: number[], t: number, alpha = 1) => `rgba(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",")},${alpha})`;

/** world point to screen, before the final fit: x right, y down, z toward the camera */
function project([x, y, z]: V3): P2 {
  const wx = x - CENTER.x, wy = y - CENTER.y;
  const x1 = wx * Math.cos(PHI) - wy * Math.sin(PHI);
  const y1 = wx * Math.sin(PHI) + wy * Math.cos(PHI);
  const sy = y1 * Math.cos(THETA) - z * Math.sin(THETA);
  const depth = y1 * Math.sin(THETA) + z * Math.cos(THETA);
  const k = FOCAL / (FOCAL - depth);
  return { x: x1 * k, y: sy * k, z: depth, k };
}
/* the floor direction the light comes from: screen left and a little toward the camera */
const LIGHT = (() => { const a = [-Math.cos(PHI) + 0.5 * Math.sin(PHI), Math.sin(PHI) + 0.5 * Math.cos(PHI)]; const n = Math.hypot(a[0], a[1]); return [a[0] / n, a[1] / n]; })();

/** how much screen the whole switch takes at scale 1, tipped either way, with its row of dots and
 * words: used to centre it in its box and to size the button over it */
const BOUNDS = (() => {
  const pts: V3[] = [];
  for (const up of [0, 1]) for (const far of [true, false]) for (const o of [{ u: 0, d: 0 }, { u: PW, d: 0 }, { u: 0, d: L - R }, { u: PW, d: L - R }, { u: R, d: L }, { u: 0, d: L - R / 2 }, { u: PW, d: L - R / 2 }]) {
    const a = TILT * up, y = L + (far ? -1 : 1) * o.d * Math.cos(a);
    pts.push([o.u, y, 0], [o.u, y, BASE + o.d * Math.sin(a)]);
  }
  pts.push([DX + 8, DOT_TOP - 36, 0], [DX + 8, DOT_BOT + 36, 0]);
  const p = pts.map(project);
  const x0 = Math.min(...p.map((q) => q.x)), x1 = Math.max(...p.map((q) => q.x)), y0 = Math.min(...p.map((q) => q.y)), y1 = Math.max(...p.map((q) => q.y));
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
})();

/** the outline of one half, from the hinge round its rounded end and back: [u across, d from the hinge, outward normal] */
const OUTLINE: { u: number; d: number; n: [number, number] }[] = (() => {
  const pts: { u: number; d: number; n: [number, number] }[] = [];
  for (let i = 0; i <= 6; i++) pts.push({ u: 0, d: ((L - R) * i) / 6, n: [-1, 0] });
  for (let i = 1; i < 90; i++) { const a = Math.PI - (Math.PI * i) / 90; pts.push({ u: R + R * Math.cos(a), d: L - R + R * Math.sin(a), n: [Math.cos(a), Math.sin(a)] }); }
  for (let i = 6; i >= 0; i--) pts.push({ u: PW, d: ((L - R) * i) / 6, n: [1, 0] });
  return pts;
})();

/** a point on one half: far = the OFF half (toward y 0). up tips it about the hinge */
function onHalf(far: boolean, up: number, u: number, d: number, top: boolean): V3 {
  const a = TILT * up;
  const y = L + (far ? -1 : 1) * d * Math.cos(a);
  return [u, y, top ? BASE + d * Math.sin(a) : 0];
}

const THEME = {
  light: {
    floor: ["#dedee1", "#d3d3d6", "#c8c8cb"],
    faceFlat: [221, 221, 224], faceUp: [168, 168, 172], faceUpLit: [190, 190, 194],
    wallDark: [22, 104, 54], wallLit: [184, 244, 206],
    ink: { bright: "#ffffff", dim: "#6a6a70" }, dot: "rgba(52, 150, 92, .5)", word: "#9a9aa0",
  },
  dark: {
    floor: ["#121214", "#0e0e0f", "#0b0b0c"],
    faceFlat: [17, 17, 17], faceUp: [29, 29, 30], faceUpLit: [32, 32, 33],
    wallDark: [46, 178, 96], wallLit: [242, 255, 246],
    ink: { bright: "#ffffff", dim: "#96969b" }, dot: "rgba(80, 180, 120, .28)", word: "#ffffff",
  },
};

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, s: number, mode: Mode, rock: number, lit: number, dpr: number) {
  const t = THEME[mode], dark = mode === "dark";
  const ox = w / 2 - BOUNDS.cx * s, oy = h / 2 - BOUNDS.cy * s;
  const scr = (p: V3) => { const q = project(p); return { x: ox + q.x * s, y: oy + q.y * s, z: q.z, k: q.k }; };
  const path = (pts: { x: number; y: number }[]) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); };
  /* a soft blob without ctx.filter (Safari): draw the shape far off canvas and keep only its blurred shadow */
  const blob = (pts: { x: number; y: number }[], color: string, blur: number, dx = 0, dy = 0) => {
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur * dpr; ctx.shadowOffsetX = (10000 + dx) * dpr; ctx.shadowOffsetY = dy * dpr;
    ctx.fillStyle = "#000"; path(pts.map((p) => ({ x: p.x - 10000, y: p.y }))); ctx.fill(); ctx.restore();
  };
  /** text lying on a plane: o is the label's centre, ax the reading direction, ay its up, all in world units */
  const label = (text: string, o: V3, ax: V3, ay: V3, size: number, weight: number, color: string, glow?: string, at?: { x: number; y: number }) => {
    const c = scr(o), px = scr([o[0] + ax[0], o[1] + ax[1], o[2] + ax[2]]), py = scr([o[0] - ay[0], o[1] - ay[1], o[2] - ay[2]]);
    const cx = at?.x ?? c.x, cy = at?.y ?? c.y;
    ctx.save();
    ctx.transform(px.x - c.x, px.y - c.y, py.x - c.x, py.y - c.y, cx, cy);
    ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = color;
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 6 * s * dpr; }
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  /* the floor */
  const g = ctx.createRadialGradient(w * 0.35, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
  g.addColorStop(0, t.floor[0]); g.addColorStop(0.55, t.floor[1]); g.addColorStop(1, t.floor[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  const halves = [{ far: true, up: rock, word: "OFF" }, { far: false, up: 1 - rock, word: "ON" }];
  const foot = (far: boolean, up: number) => OUTLINE.map((o) => scr(onHalf(far, up, o.u, o.d, false)));

  /* light and shadow on the floor round the raised half */
  for (const hf of halves) {
    if (hf.up < 0.02) continue;
    const f = foot(hf.far, hf.up);
    if (dark) {
      // a wide green haze round the raised end, then softer blooms closer in; no hard ring
      const mid = scr(onHalf(hf.far, hf.up, R, L * 0.62, false));
      const haze = ctx.createRadialGradient(mid.x, mid.y, 0, mid.x, mid.y, 190 * s);
      haze.addColorStop(0, `rgba(40, 150, 82, ${0.42 * hf.up})`); haze.addColorStop(0.35, `rgba(30, 120, 66, ${0.24 * hf.up})`); haze.addColorStop(0.7, `rgba(20, 84, 46, ${0.08 * hf.up})`); haze.addColorStop(1, "rgba(20, 84, 46, 0)");
      ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h);
      blob(f, `rgba(50, 180, 98, ${0.7 * hf.up})`, 80 * s);
      blob(f, `rgba(63, 192, 108, ${0.6 * hf.up})`, 40 * s);
      blob(f, `rgba(110, 222, 152, ${0.45 * hf.up})`, 20 * s);
    } else {
      blob(f, `rgba(36, 40, 38, ${0.22 * hf.up})`, 34 * s, 14 * s, 12 * s);
      blob(f, `rgba(30, 34, 32, ${0.28 * hf.up})`, 8 * s, 4 * s, 4 * s);
    }
  }
  /* the pressed half glows faintly round its foot in the dark */
  if (dark) for (const hf of halves) if (hf.up < 0.98) blob(foot(hf.far, hf.up), `rgba(63, 192, 108, ${0.4 * (1 - hf.up)})`, 22 * s);

  /* ER, the dots and SÜ on the floor */
  const along: V3 = [0, -1, 0], away: V3 = [-1, 0, 0];
  label("ER", [DX, DOT_TOP - 22, 0], along, away, 15, dark ? 700 : 400, t.word);
  label("SÜ", [DX, DOT_BOT + 22, 0], along, away, 15, dark ? 700 : 400, t.word);
  for (let i = 0; i < DOTS; i++) {
    const on = DOTS - i <= lit;
    const p = scr([DX, DOT_TOP + (i * (DOT_BOT - DOT_TOP)) / (DOTS - 1), 0]);
    ctx.save();
    ctx.beginPath(); ctx.ellipse(p.x, p.y, (on ? 2.1 : 1.6) * s * p.k, (on ? 2.1 : 1.6) * s * p.k * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = on ? "#fff" : t.dot;
    if (on) { ctx.shadowColor = dark ? "rgba(255,255,255,.85)" : "rgba(255,255,255,1)"; ctx.shadowBlur = 5 * s * dpr; }
    ctx.fill(); ctx.restore();
  }

  /* the rocker: the far half first, then the near one over it */
  const rims: { x: number; y: number }[][] = [];
  for (const hf of halves) {
    const tops = OUTLINE.map((o) => scr(onHalf(hf.far, hf.up, o.u, o.d, true)));
    const bots = foot(hf.far, hf.up);
    // the wall, strip by strip, farthest first
    const strips = [];
    for (let i = 0; i < OUTLINE.length - 1; i++) {
      const n = OUTLINE[i].n, nn: [number, number] = [n[0], hf.far ? -n[1] : n[1]]; // the normal in the floor, across and along
      strips.push({ i, z: (tops[i].z + tops[i + 1].z + bots[i].z + bots[i + 1].z) / 4, shade: Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1]) });
    }
    strips.sort((a, b) => a.z - b.z);
    // the dark wall is lit from inside: green at the hinge, white where it stands tallest
    const hinge = bots[0], tip = tops[Math.floor(OUTLINE.length / 2)];
    const wallGlow = ctx.createLinearGradient(hinge.x, hinge.y, tip.x, tip.y);
    wallGlow.addColorStop(0, rgb(t.wallDark, t.wallLit, 0.25)); wallGlow.addColorStop(0.45, rgb(t.wallDark, t.wallLit, 0.75)); wallGlow.addColorStop(1, rgb(t.wallDark, t.wallLit, 1));
    for (const st of strips) {
      const { i } = st;
      const q = [bots[i], bots[i + 1], tops[i + 1], tops[i]];
      if (dark) {
        ctx.fillStyle = wallGlow;
      } else {
        const lift = Math.pow(st.shade, 0.75);
        const gr = ctx.createLinearGradient(0, Math.max(bots[i].y, bots[i + 1].y), 0, Math.min(tops[i].y, tops[i + 1].y));
        gr.addColorStop(0, rgb(t.wallDark, t.wallLit, lift * 0.78)); gr.addColorStop(1, rgb(t.wallDark, t.wallLit, Math.min(1, lift * 1.05 + 0.08)));
        ctx.fillStyle = gr;
      }
      path(q); ctx.fill();
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); // closes hairline gaps between strips
    }
    // the face
    const face = [...tops];
    const bright = hf.up < 0.5;
    // each half keeps its own shade, as in the reference: they meet in a crisp, straight crease.
    // A raised face catches a little more light toward its end
    const mine = t.faceFlat.map((v, j) => lerp(v, t.faceUp[j], hf.up));
    const lit = mine.map((v) => v + (dark ? 4 : 10) * hf.up);
    const hingeMid = scr(onHalf(hf.far, hf.up, R, 0, true)), endMid = scr(onHalf(hf.far, hf.up, R, L, true));
    const fc = ctx.createLinearGradient(hingeMid.x, hingeMid.y, endMid.x, endMid.y);
    fc.addColorStop(0, rgb(mine, mine, 0)); fc.addColorStop(1, rgb(lit, lit, 0));
    path(face); ctx.fillStyle = fc; ctx.fill();
    // close the hairline along the crease with this face's own shade, so it reads as one body
    const h0 = scr(onHalf(hf.far, hf.up, 0, 0, true)), h1 = scr(onHalf(hf.far, hf.up, PW, 0, true));
    ctx.save(); ctx.strokeStyle = rgb(mine, mine, 0); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(h0.x, h0.y); ctx.lineTo(h1.x, h1.y); ctx.stroke(); ctx.restore();
    rims.push(tops);
    // the label, near the far end of its half, reading across
    const a = TILT * hf.up, dl = L - 30, sgn = hf.far ? -1 : 1;
    const o: V3 = [R, L + sgn * dl * Math.cos(a), BASE + dl * Math.sin(a) + 0.2];
    const read: V3 = [0, -Math.cos(a), hf.far ? Math.sin(a) : -Math.sin(a)]; // left to right on its face
    // seen at an angle the true centre line looks off to one side, so centre the label on what the
    // eye sees: the middle of the end's visible face, between its two rims, measured on screen
    const capPts = OUTLINE.filter((p) => p.d >= dl - 34).map((p) => scr(onHalf(hf.far, hf.up, p.u, p.d, true)));
    const cut = [scr(onHalf(hf.far, hf.up, 0, dl - 34, true)), scr(onHalf(hf.far, hf.up, PW, dl - 34, true))];
    const poly = [cut[0], ...capPts, cut[1]];
    let A = 0, gx = 0, gy = 0;
    for (let k = 0; k < poly.length; k++) { const p0 = poly[k], p1 = poly[(k + 1) % poly.length], cr = p0.x * p1.y - p1.x * p0.y; A += cr; gx += (p0.x + p1.x) * cr; gy += (p0.y + p1.y) * cr; }
    const at = A ? { x: gx / (3 * A), y: gy / (3 * A) } : undefined;
    label(hf.word, o, read, away, 23, bright ? 700 : 400, bright ? t.ink.bright : t.ink.dim,
      bright ? (dark ? "rgba(255,255,255,.55)" : "rgba(255,255,255,1)") : undefined, at);
  }
  /* one rim round the whole top, unbroken over the hinge: a glowing green line in the dark, a soft
   * bevel in the light. Far half round its end, then the near half back round its end */
  ctx.save();
  path([...rims[0], ...[...rims[1]].reverse()]);
  if (dark) {
    ctx.strokeStyle = "rgba(120, 228, 160, .85)"; ctx.lineWidth = 1.3 * s; ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(63, 192, 108, .9)"; ctx.shadowBlur = 10 * s * dpr;
  } else {
    ctx.strokeStyle = "rgba(255, 255, 255, .7)"; ctx.lineWidth = 1.1 * s; ctx.lineJoin = "round";
  }
  ctx.stroke(); ctx.restore();
}

export default function ThemeSwitch({ size = "card" }: { size?: "card" | "big" }) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>(siteMode);
  const dark = mode === "dark";
  // c: how full the dots are (0 none, 1 all). r: which half is up (0 ON up, 1 OFF up)
  const c = useMotionValue(dark ? 1 : 0);
  const r = useMotionValue(dark ? 1 : 0);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const goal = useRef<Mode | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [hit, setHit] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const paint = useCallback(() => {
    const el = box.current, canvas = cv.current;
    if (!el || !canvas) return;
    const w = el.clientWidth, h = el.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // fit the switch: about 290 by 220 units on screen at scale 1
    const s = Math.min(size === "big" ? 2 : 1.15, (w - 48) / BOUNDS.w, (h - (size === "big" ? 60 : 120)) / BOUNDS.h);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, w, h, s, modeRef.current, Math.min(1, Math.max(0, r.get())), Math.round(c.get() * DOTS), dpr);
  }, [size, c, r]);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      paint();
      const w = el.clientWidth, h = el.clientHeight;
      const s = Math.min(size === "big" ? 2 : 1.15, (w - 48) / BOUNDS.w, (h - (size === "big" ? 60 : 120)) / BOUNDS.h);
      setHit({ x: w / 2 - (BOUNDS.w / 2) * s, y: h / 2 - (BOUNDS.h / 2) * s, w: BOUNDS.w * s, h: BOUNDS.h * s });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paint, size]);
  useEffect(() => { paint(); }, [mode, paint]);
  // stop a charge that is still running when the switch goes away, so it never sets state after
  useEffect(() => () => { run.current?.stop(); r.stop(); }, [r]);
  useEffect(() => {
    const a = r.on("change", paint), b = c.on("change", paint);
    return () => { a(); b(); };
  }, [r, c, paint]);

  /* pointer down: the raised end gives a little, as a real rocker does before it snaps over */
  const rest = () => (modeRef.current === "dark" ? 1 : 0);
  const give = () => {
    if (goal.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = rest();
    animate(r, from + (1 - 2 * from) * GIVE.amount, GIVE.spring);
  };
  /* slid off without letting go: spring back to rest */
  const settle = () => { if (!goal.current && Math.abs(r.get() - rest()) > 0.001) animate(r, rest(), ROCK); };

  const press = () => {
    const to: Mode = (goal.current ?? mode) === "dark" ? "light" : "dark";
    play(to === "dark" ? "on" : "off");
    run.current?.stop();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const end = to === "dark" ? 1 : 0;
    animate(r, end, still ? { duration: 0 } : ROCK);
    // pressed again while it charges: rock back and run the dots back; the theme stays
    if (goal.current && to === mode) {
      goal.current = null;
      run.current = animate(c, end, { duration: CHARGE * Math.abs(end - c.get()), ease: "linear" });
      return;
    }
    goal.current = to;
    run.current = animate(c, end, {
      duration: still ? 0 : CHARGE * Math.abs(end - c.get()), ease: "linear",
      onComplete: () => { goal.current = null; setMode(to); },
    });
  };

  return (
    <div ref={box} data-own-click className="theme-switch" style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", background: dark ? "#0e0e0f" : "#d3d3d6" }}>
      <canvas ref={cv} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <button type="button" role="switch" aria-checked={dark} aria-label={dark ? "Dark. Switch to light" : "Light. Switch to dark"} onClick={press} onPointerDown={give} onPointerLeave={settle} onPointerCancel={settle} className="tsRocker"
        style={{ position: "absolute", left: hit.x, top: hit.y, width: hit.w, height: hit.h, padding: 0, border: 0, background: "none", cursor: "pointer", borderRadius: 24 }} />
      <style>{`.tsRocker { touch-action: manipulation; -webkit-tap-highlight-color: transparent; } .tsRocker:focus-visible { outline: 2px solid ${dark ? "#6fdc97" : "#1c7a3f"}; outline-offset: 2px; }`}</style>
    </div>
  );
}
