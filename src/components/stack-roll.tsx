import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { play } from "../sound/sound";

/* ─────────────────────────────────────────────────────────
 * STACK ROLL
 *
 *  A pill on top, the open card, a pill below. One number, `p`,
 *  says where the stack is; every row reads its place from it, so
 *  scroll, drag, taps and the autoplay all move the same thing and
 *  can interrupt each other mid-way.
 *
 *    scroll / drag   p follows the gesture through a soft spring,
 *                    then snaps to the nearest card
 *    every 3.4s      p += 1: the top pill grows into the card, the
 *                    card folds into the bottom pill
 *    tap a pill      p moves to that card
 *
 *  Along the way, per row:
 *    |off| 0 → .3    the open card's content fades out
 *    |off| .25 → .7  the pill's header fades in
 *    settled         the new card builds in (staggered, springy)
 * ───────────────────────────────────────────────────────── */

const W = 420, H = 568;
const CARD_W = 360, PILL_W = 304, PH = 48, GAP = 12, R_CARD = 28;
const DWELL = 3400;
const FOLLOW = { stiffness: 190, damping: 30, mass: 1 };   // critically damped, no bounce
const WHEEL_PER_CARD = 220;                                // px of scroll per card
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const GREEN = "#3fc06c";

type Item = { id: "delivery" | "mesh" | "apps" | "invite" | "task"; h: number; dark?: boolean };
const ITEMS: Item[] = [
  { id: "delivery", h: 404 },
  { id: "mesh", h: 318 },
  { id: "apps", h: 352, dark: true },
  { id: "invite", h: 326 },
  { id: "task", h: 272 },
];
const N = ITEMS.length;
const mod = (a: number) => ((a % N) + N) % N;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* ── geometry ───────────────────────────────────────────── */
type Geo = { y: number; w: number; h: number; o: number; s: number };
function slot(k: number, openH: number): Geo {
  const top = (H - (PH + GAP + openH + GAP + PH)) / 2;
  const cardY = top + PH + GAP, bottomY = cardY + openH + GAP;
  if (k === 0) return { y: cardY, w: CARD_W, h: openH, o: 1, s: 1 };
  if (k === 1) return { y: top, w: PILL_W, h: PH, o: 1, s: 1 };
  if (k === -1) return { y: bottomY, w: PILL_W, h: PH, o: 1, s: 1 };
  if (k >= 2) return { y: top - 34, w: PILL_W * 0.94, h: PH, o: 0, s: 0.94 };
  return { y: bottomY + 34, w: PILL_W * 0.94, h: PH, o: 0, s: 0.94 };
}
const openHeight = (p: number) => {
  const a = Math.floor(p), t = p - a;
  return lerp(ITEMS[mod(a)].h, ITEMS[mod(a + 1)].h, t);
};
// offset of item i from the open slot, wrapped into [-2.5, 2.5)
const offsetOf = (i: number, p: number) => { let d = (i - p) % N; if (d < -N / 2) d += N; if (d >= N / 2) d -= N; return d; };
function geo(i: number, p: number) {
  const f = offsetOf(i, p), oh = openHeight(p);
  const lo = Math.floor(f), t = f - lo;
  const a = slot(lo, oh), b = slot(lo + 1, oh);
  const g = { y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), o: lerp(a.o, b.o, t), s: lerp(a.s, b.s, t) };
  return { ...g, f, open: 1 - clamp01(Math.abs(f)) };
}

/* ── small parts ────────────────────────────────────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const up = (d: number, y = 8) => ({
  initial: { opacity: 0, y, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.55, delay: d, ease: EASE_OUT },
});
const pop = (d: number, r = 0) => ({
  initial: { opacity: 0, scale: 0.6, rotate: r - 8 },
  animate: { opacity: 1, scale: 1, rotate: r },
  transition: { type: "spring", duration: 0.55, bounce: 0.35, delay: d } as const,
});
function Check({ size = 18 }: { size?: number }) {
  return (
    <span className="hs-check" style={{ width: size, height: size }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 10 10" aria-hidden="true"><path d="M2.4 5.2 4.2 7l3.4-3.8" {...S} strokeWidth={1.7} /></svg>
    </span>
  );
}
function Flag() {
  return <span className="hs-flag" aria-hidden="true"><i /><i /></span>;
}
function Avatar({ k, size = 28, ring = true }: { k: "lj" | "a" | "b" | "c"; size?: number; ring?: boolean }) {
  return <span className="hs-av" data-k={k} data-ring={ring || undefined} style={{ width: size, height: size }} aria-hidden="true"><i /></span>;
}
function MeshLogo({ size = 16 }: { size?: number }) {
  const dots = [[3, 6], [6, 4], [9, 3], [12, 5], [4, 9], [7, 8], [10, 7], [13, 9], [6, 12], [9, 11], [12, 12]];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.35} fill="oklch(0.72 0.13 175)" />)}
    </svg>
  );
}
function AppTile({ k, size }: { k: 0 | 1 | 2 | 3; size: number }) {
  const g: ReactNode[] = [
    <g key="0"><circle cx="12" cy="12" r="6.5" fill="#f2f2f2" /><path d="M6.4 10.5h11.2M6 13h12M6.8 15.5h10.4" stroke="#2b2b2e" strokeWidth="1.2" /></g>,
    <g key="1"><circle cx="12" cy="12" r="6.5" fill="#fff" opacity=".95" /><path d="M7.5 11c2-1.4 6.6-1.4 9 0M7.5 13.2c2-1.4 6.6-1.4 9 0" stroke="#7b3fe4" strokeWidth="1.4" fill="none" strokeLinecap="round" /></g>,
    <g key="2"><rect x="8" y="6.5" width="8" height="11" rx="1.6" fill="#fff" /><rect x="9.8" y="10.4" width="4.4" height="3.6" rx=".6" fill="none" stroke="#f0a400" strokeWidth="1.1" /></g>,
    <g key="3">{[["#36c5f0", 9, 9], ["#2eb67d", 15, 9], ["#ecb22e", 15, 15], ["#e01e5a", 9, 15]].map(([c, x, y]) => <rect key={c as string} x={(x as number) - 2.6} y={(y as number) - 2.6} width="5.2" height="5.2" rx="2.6" fill={c as string} />)}</g>,
  ];
  return (
    <span className="hs-app" data-k={k} style={{ width: size, height: size, borderRadius: size * 0.28 }}>
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 24 24" aria-hidden="true">{g[k]}</svg>
    </span>
  );
}

/* deterministic little QR-looking grid with the three finder squares */
function useQR(n = 25) {
  return useMemo(() => {
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const cells: [number, number][] = [];
    const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) cells.push([x, y]);
    return cells;
  }, [n]);
}
function QR() {
  const cells = useQR();
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x + 0.5} y={y + 0.5} width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
    </g>
  );
  return (
    <svg viewBox="0 0 25 25" width="76" height="76" shapeRendering="crispEdges" aria-hidden="true">
      {cells.map(([x, y]) => <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />)}
      {finder(0, 0)}{finder(18, 0)}{finder(0, 18)}
    </svg>
  );
}

/* ── pills (closed state) ───────────────────────────────── */
function Pill({ id }: { id: Item["id"] }) {
  switch (id) {
    case "delivery": return (<><Check size={20} /><span className="hs-pt">Out for delivery</span><span className="hs-pm"><Flag />Poland</span></>);
    case "mesh": return (<><span className="hs-pi"><MeshLogo /></span><span className="hs-pt">MeshMind</span><span className="hs-tag" data-c="teal">Content</span></>);
    case "apps": return (<><span className="hs-pstack"><AppTile k={0} size={20} /><AppTile k={1} size={20} /><AppTile k={3} size={20} /></span><span className="hs-pt">Integrations</span><span className="hs-pm">4 apps</span></>);
    case "invite": return (<><Avatar k="lj" size={24} /><span className="hs-pt">Lisa Jones</span><span className="hs-pm">Sun, 8:00 pm</span></>);
    case "task": return (<><span className="hs-ring" /><span className="hs-pt">To-do</span><span className="hs-tag" data-c="red">High</span></>);
  }
}

/* ── open cards: built in on arrival ────────────────────── */
function Delivery() {
  return (
    <div className="hs-card">
      <svg className="hs-belt" viewBox="0 0 360 260" aria-hidden="true">
        <defs>
          <linearGradient id="hs-fadeb" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <mask id="hs-beltm"><rect width="360" height="260" fill="url(#hs-fadeb)" /></mask>
          <clipPath id="hs-beltc"><rect x="-200" y="-52" width="800" height="104" /></clipPath>
          <linearGradient id="hs-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--hs-box-hi)" /><stop offset="1" stopColor="var(--hs-box-top)" /></linearGradient>
          <linearGradient id="hs-left" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--hs-box-l)" /><stop offset="1" stopColor="var(--hs-box-l2)" /></linearGradient>
          <linearGradient id="hs-right" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--hs-box-r)" /><stop offset="1" stopColor="var(--hs-box-r2)" /></linearGradient>
        </defs>
        <g mask="url(#hs-beltm)">
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: EASE_OUT }} transform="translate(180 150) rotate(27)">
            <rect x="-300" y="-52" width="600" height="104" fill="var(--hs-belt)" />
            <g clipPath="url(#hs-beltc)">
              <g className="hs-run">
                {Array.from({ length: 22 }, (_, i) => (
                  <path key={i} d={`M${-320 + i * 30} -46l12 46-12 46`} fill="none" stroke="var(--hs-belt-line)" strokeWidth="1.2" />
                ))}
              </g>
            </g>
            <path d="M-300 -52h600M-300 52h600" stroke="var(--hs-belt-edge)" strokeWidth="1.5" />
            <path d="M-300 -58h600M-300 58h600" stroke="var(--hs-belt-line)" strokeWidth="1" />
          </motion.g>
        </g>
        <motion.g initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", duration: 0.7, bounce: 0.25, delay: 0.12 }}>
          <g className="hs-bob">
            <ellipse cx="182" cy="206" rx="56" ry="14" fill="var(--hs-box-shadow)" />
            <path d="M180 88 236 115 180 142 124 115Z" fill="url(#hs-top)" />
            <path d="M124 115 180 142v70l-56-27Z" fill="url(#hs-left)" />
            <path d="M236 115 180 142v70l56-27Z" fill="url(#hs-right)" />
            <path d="M145 104.8 201 131.8 213 126 157 99Z" fill="var(--hs-tape)" />
            <path d="M201 131.8v70l12-5.8v-70Z" fill="var(--hs-tape2)" />
            <path d="M180 142v70M124 115l56 27 56-27" stroke="var(--hs-box-edge)" strokeWidth="1" fill="none" />
            <g transform="translate(150 170) skewY(26)" stroke="var(--hs-doodle)" strokeWidth="1.2" fill="none" strokeLinecap="round">
              <circle cx="0" cy="-6" r="3.6" /><path d="M0-13v2M0 -1v2M-7-6h2M5-6h2M-5-11l1.4 1.4M3.6-2.6 5-1.2M-5-1l1.4-1.4M3.6-9.4 5-10.8" />
              <path d="M-8 6c3 3 13 3 16 0" />
            </g>
          </g>
        </motion.g>
      </svg>
      <motion.div className="hs-track" {...up(0.18, -8)}><Check size={18} />Show full tracking</motion.div>
      <div style={{ position: "absolute", left: 22, top: 248 }}>
        <motion.span className="hs-chip" {...up(0.26)}><Flag />Poland</motion.span>
        <motion.div className="hs-h1" {...up(0.32)}>Out for delivery</motion.div>
        <motion.div className="hs-mute" {...up(0.38)}>Package number<br /><span className="hs-num">4902 9880 1508 1012</span></motion.div>
        <motion.div className="hs-mute" style={{ marginTop: 8 }} {...up(0.44)}>Poland, 01/06/25</motion.div>
      </div>
      <motion.div className="hs-qr" {...pop(0.4, 0)}><QR /></motion.div>
    </div>
  );
}

const BLOBS: [number, number, number, number][] = [[86, 52, 44, 26], [186, 34, 40, 22], [282, 58, 46, 30], [140, 98, 34, 19], [236, 104, 32, 18], [330, 112, 22, 14]];
function Mesh() {
  const [on, setOn] = useState(true);
  const blobs = useMemo(() => BLOBS.map(([cx, cy, rx, ry]) => {
    const dots: [number, number, number][] = [];
    for (let y = cy - ry; y <= cy + ry; y += 6.5) for (let x = cx - rx; x <= cx + rx; x += 6.5) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d <= 1) dots.push([x, y, 1 - d * 0.55]);
    }
    return { cx, cy, dots };
  }), []);
  return (
    <div className="hs-card">
      <div className="hs-mesh">
        <svg viewBox="0 0 360 140" width="360" height="140" aria-hidden="true">
          {blobs.map((b, i) => (
            <motion.g key={i} style={{ transformOrigin: `${b.cx}px ${b.cy}px` }} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.7, bounce: 0.2, delay: 0.08 + Math.abs(b.cx - 180) / 900 + i * 0.03 }}>
              {b.dots.map(([x, y, o], j) => <rect key={j} x={x - 1.6} y={y - 1.6} width="3.2" height="3.2" rx=".8" fill="var(--hs-teal)" opacity={0.25 + o * 0.6} />)}
            </motion.g>
          ))}
        </svg>
      </div>
      <motion.span className="hs-logo" {...pop(0.2)}><MeshLogo size={26} /></motion.span>
      <div style={{ position: "absolute", left: 22, right: 22, top: 172 }}>
        <motion.div className="hs-row-t" {...up(0.26)}><span className="hs-h2">MeshMind</span><span className="hs-tag" data-c="teal">Content management</span></motion.div>
        <motion.p className="hs-p" {...up(0.32)}>Connect tools, organise media and polish your content with an AI that thinks ahead.</motion.p>
      </div>
      <motion.button type="button" className="hs-btn" data-on={on || undefined} {...up(0.4)} whileTap={{ scale: 0.97 }}
        onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setOn((v) => !v); play(on ? "off" : "on", { vol: 0.5 }); }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={on ? "d" : "c"} className="hs-btn-in" initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }} transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              {on ? <path d="M5.6 8.4 8.4 5.6M6 3.8l.9-.9a2.3 2.3 0 0 1 3.2 3.2l-.9.9M8 10.2l-.9.9a2.3 2.3 0 0 1-3.2-3.2l.9-.9M2.5 2.5l1.2 1.2M10.3 10.3l1.2 1.2" {...S} /> : <path d="M5.6 8.4 8.4 5.6M6 3.8l.9-.9a2.3 2.3 0 0 1 3.2 3.2l-.9.9M8 10.2l-.9.9a2.3 2.3 0 0 1-3.2-3.2l.9-.9" {...S} />}
            </svg>
            {on ? "Disconnect" : "Connect"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

const TILES: { k: 0 | 1 | 2 | 3; x: number; y: number; s: number; r: number }[] = [
  { k: 0, x: 44, y: 88, s: 46, r: -10 }, { k: 1, x: 128, y: 136, s: 34, r: 4 }, { k: 2, x: 214, y: 70, s: 32, r: 6 }, { k: 3, x: 270, y: 54, s: 50, r: 8 },
];
function Apps() {
  return (
    <div className="hs-card hs-dark">
      <div className="hs-seg">
        {[0, 1, 2, 3].map((i) => (
          <span key={i}><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.85, delay: 0.2 + i * 0.85, ease: [0.4, 0, 0.2, 1] }} /></span>
        ))}
      </div>
      <svg className="hs-sky" viewBox="0 0 360 200" aria-hidden="true">
        <defs>
          <radialGradient id="hs-glow" cx=".5" cy="1" r=".6"><stop offset="0" stopColor="oklch(0.55 0.2 300 / .45)" /><stop offset="1" stopColor="oklch(0.55 0.2 300 / 0)" /></radialGradient>
          <linearGradient id="hs-hz" x1="0" x2="1"><stop offset="0" stopColor="oklch(0.6 0.2 290 / 0)" /><stop offset=".5" stopColor="#fff" /><stop offset="1" stopColor="oklch(0.6 0.2 290 / 0)" /></linearGradient>
          <linearGradient id="hs-vl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".12" /></linearGradient>
        </defs>
        <rect x="0" y="100" width="360" height="100" fill="url(#hs-glow)" />
        {[56, 150, 250, 316].map((x, i) => <rect key={x} x={x} y={70 + i * 12} width="1" height={120 - i * 12} fill="url(#hs-vl)" />)}
        {[[60, 40], [124, 26], [190, 120], [236, 140], [300, 150], [330, 92], [94, 160]].map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="1.1" fill="#fff" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.3, 0.8] }} transition={{ duration: 3, delay: i * 0.15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} />
        ))}
        <motion.rect x="40" y="190" width="280" height="1" fill="url(#hs-hz)" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} style={{ transformOrigin: "180px 190px" }} transition={{ duration: 0.8, ease: EASE_OUT }} />
      </svg>
      {TILES.map((t, i) => (
        <motion.div key={t.k} className="hs-float" style={{ left: t.x, top: t.y }}
          initial={{ opacity: 0, y: 50, scale: 0.7, rotate: 0 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: t.r }} transition={{ type: "spring", duration: 0.8, bounce: 0.25, delay: 0.12 + i * 0.07 }}>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.9 + i * 0.2 }}>
            <AppTile k={t.k} size={t.s} />
          </motion.div>
        </motion.div>
      ))}
      <div style={{ position: "absolute", left: 24, right: 24, top: 222 }}>
        <motion.div className="hs-h2" {...up(0.3)}>Integrations</motion.div>
        <motion.p className="hs-p" {...up(0.36)}>Connect your apps to create, automate and command from one place.</motion.p>
      </div>
      <motion.button type="button" className="hs-btn hs-btn-dark" {...up(0.44)} whileTap={{ scale: 0.97 }} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        Connect integrations
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8m-3.2-3.2L11 7l-3.2 3.2" {...S} /></svg>
      </motion.button>
    </div>
  );
}

function Invite() {
  return (
    <div className="hs-card hs-bezel">
      <div className="hs-inner">
        <div className="hs-inv-row">
          <motion.span {...pop(0.12)}><Avatar k="lj" size={36} /></motion.span>
          <motion.span className="hs-inv-strong" {...up(0.16)}>Lisa Jones</motion.span>
        </div>
        <motion.div className="hs-inv-soft" {...up(0.24)}>is going to join you for:</motion.div>
        <div className="hs-inv-row">
          <motion.span className="hs-inv-strong" {...up(0.3)}>Yoga: Sunset class</motion.span>
          <motion.span className="hs-thumb" {...pop(0.38, 7)} aria-hidden="true">
            <svg viewBox="0 0 34 34" width="34" height="34">
              <defs><linearGradient id="hs-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9cdfa" /><stop offset=".7" stopColor="#f7d6c8" /><stop offset="1" stopColor="#f3b48f" /></linearGradient></defs>
              <rect width="34" height="34" fill="url(#hs-sun)" />
              <path d="M0 28c8-2 26-2 34 0v6H0Z" fill="#2c2433" />
              <path d="M17.5 27.5v-6.6l-1.6-3.4M17.5 20.9l3.6-4.8 1.4-3.5M15.9 17.5l-1.6-4.2" stroke="#2c2433" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <circle cx="17.4" cy="13.4" r="1.4" fill="#2c2433" />
            </svg>
          </motion.span>
        </div>
        <motion.hr className="hs-hr" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT }} />
        {["Sun Jun 21", "8:00 to 9:00 pm", "Brooklyn studio"].map((t, i) => (
          <motion.div key={t} className="hs-inv-meta" {...up(0.46 + i * 0.06)}>{t}</motion.div>
        ))}
      </div>
    </div>
  );
}

function Task() {
  return (
    <div className="hs-card hs-col">
      <motion.div className="hs-col-h" {...up(0.08)}>
        <motion.span className="hs-ring" initial={{ rotate: -120 }} animate={{ rotate: 0 }} transition={{ duration: 0.9, ease: EASE_OUT }} />
        <span className="hs-col-t">To-do</span>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ color: "var(--k-text)" }}><path d="M8 3.5v9M3.5 8h9" {...S} /></svg>
      </motion.div>
      <motion.div className="hs-task" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", duration: 0.6, bounce: 0.15, delay: 0.12 }}>
        <div className="hs-task-top">
          <motion.span className="hs-chip2" {...pop(0.24)}><svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 10.5v-8.5h6l-1.4 2.5L9 7H3" {...S} strokeWidth={1.2} /></svg>To-do</motion.span>
          <motion.span className="hs-chip2" data-c="red" {...pop(0.3)}><svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 10.5v-8.5h6l-1.4 2.5L9 7H3" {...S} strokeWidth={1.2} /></svg>High</motion.span>
          <span className="hs-kebab" aria-hidden="true"><i /><i /><i /></span>
        </div>
        <motion.div className="hs-task-t" {...up(0.3)}>Create homepage design</motion.div>
        <motion.p className="hs-p" style={{ marginTop: 6 }} {...up(0.36)}>Design a new homepage for Wayform v2 with the updated branding.</motion.p>
        <motion.hr className="hs-hr" style={{ margin: "16px 0 12px", width: "100%" }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT }} />
        <div className="hs-task-foot">
          <span className="hs-avs">
            {(["a", "b", "c"] as const).map((k, i) => <motion.span key={k} {...pop(0.46 + i * 0.06)}><Avatar k={k} size={24} /></motion.span>)}
          </span>
          <motion.span className="hs-mute" {...up(0.5)}>Oct 12, 2026</motion.span>
        </div>
      </motion.div>
    </div>
  );
}
const CARDS: Record<Item["id"], () => ReactNode> = { delivery: Delivery, mesh: Mesh, apps: Apps, invite: Invite, task: Task };

/* ── one row ────────────────────────────────────────────── */
function Row({ i, p, active, onPick }: { i: number; p: MotionValue<number>; active: boolean; onPick: (off: number) => void }) {
  const item = ITEMS[i];
  const g = useTransform(p, (v) => geo(i, v));
  const x = useTransform(g, (o) => (W - o.w) / 2), y = useTransform(g, (o) => o.y);
  const width = useTransform(g, (o) => o.w), height = useTransform(g, (o) => o.h);
  const opacity = useTransform(g, (o) => o.o), scale = useTransform(g, (o) => o.s);
  const radius = useTransform(g, (o) => lerp(PH / 2, R_CARD, o.open));
  const zIndex = useTransform(g, (o) => Math.round(10 - Math.abs(o.f) * 3));
  const pillO = useTransform(g, (o) => smooth(0.25, 0.7, Math.abs(o.f)));
  const cardO = useTransform(g, (o) => 1 - smooth(0.04, 0.3, Math.abs(o.f)));
  const pillY = useTransform(g, (o) => (1 - smooth(0.25, 0.7, Math.abs(o.f))) * -6);
  const Card = CARDS[item.id];
  return (
    <motion.div className="hs-rowx" data-dark={item.dark || undefined} style={{ x, y, width, height, opacity, scale, borderRadius: radius, zIndex }}
      onClick={() => { const o = Math.round(g.get().f); if (o !== 0) onPick(o); }}>
      <motion.div className="hs-pill" style={{ opacity: pillO, y: pillY }} aria-hidden="true"><Pill id={item.id} /></motion.div>
      <motion.div className="hs-cardwrap" style={{ opacity: cardO, height: item.h }}><AnimatePresence initial={false}>{active && <Card key="card" />}</AnimatePresence></motion.div>
    </motion.div>
  );
}

/* ── component ──────────────────────────────────────────── */
const LABELS: Record<Item["id"], string> = {
  delivery: "Out for delivery. Package 4902 9880 1508 1012, Poland.",
  mesh: "MeshMind integration, connected.",
  apps: "Integrations. Connect your apps.",
  invite: "Lisa Jones is joining you for Yoga: Sunset class, Sun Jun 21, 8:00 to 9:00 pm, Brooklyn studio.",
  task: "To-do: Create homepage design, high priority, due Oct 12, 2026.",
};

export default function StackRoll({ size = "card" }: { size?: "card" | "big" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const reduce = !!useReducedMotion();
  const target = useMotionValue(0);
  const p = useSpring(target, FOLLOW);
  const [active, setActive] = useState(0);
  const hovered = useRef(false), seen = useRef(true), lastInput = useRef(0);

  useLayoutEffect(() => {
    const root = rootRef.current!;
    const update = () => {
      const w = root.clientWidth, h = root.clientHeight;
      if (w && h) setScale(Math.min(size === "big" ? 1.35 : 1, (w - 16) / W, (h - 4) / H));
    };
    const ro = new ResizeObserver(update); ro.observe(root); update();
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting; }); io.observe(root);
    return () => { ro.disconnect(); io.disconnect(); };
  }, [size]);

  // which card is open: the nearest one once p has nearly arrived
  useEffect(() => p.on("change", (v) => {
    const r = Math.round(v);
    if (Math.abs(v - r) < 0.16) setActive((a) => {
      const n = mod(r);
      if (n !== a && Date.now() - lastInput.current < 1500) play("tick", { vol: 0.35, gap: 90 });
      return n;
    });
  }), [p]);

  const go = (to: number) => { target.set(to); if (reduce) p.jump(to); };
  const user = () => { lastInput.current = Date.now(); };

  // autoplay
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (hovered.current || !seen.current || document.hidden || Date.now() - lastInput.current < DWELL) return;
      go(Math.round(target.get()) + 1);
    }, DWELL);
    return () => clearInterval(id);
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  // scroll: the stack follows the wheel, then settles on the nearest card
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let t = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      user();
      const d = Math.max(-80, Math.min(80, e.deltaY));
      window.clearTimeout(t);
      if (reduce) { t = window.setTimeout(() => go(Math.round(target.get()) - Math.sign(d)), 60); return; }
      target.set(target.get() - d / WHEEL_PER_CARD);
      t = window.setTimeout(() => go(Math.round(target.get())), 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); window.clearTimeout(t); };
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  // drag: pull the stack down to roll forward, up to roll back
  const drag = useRef<{ y0: number; t0: number; moved: boolean; v: number; ly: number; lt: number } | null>(null);
  const suppress = useRef(false);
  const perPx = 1 / (170 * scale);
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    user();
    drag.current = { y0: e.clientY, t0: target.get(), moved: false, v: 0, ly: e.clientY, lt: performance.now() };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y0;
    if (!d.moved && Math.abs(dy) > 5) { d.moved = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }
    if (!d.moved) return;
    const now = performance.now();
    d.v = ((e.clientY - d.ly) / Math.max(1, now - d.lt)) * 1000; d.ly = e.clientY; d.lt = now;
    target.set(d.t0 + dy * perPx);
    user();
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    suppress.current = true; setTimeout(() => { suppress.current = false; }, 0);
    const projected = target.get() + d.v * perPx * 0.18;
    go(Math.round(Math.max(d.t0 - 2, Math.min(d.t0 + 2, projected))));
    user();
  };
  const pick = (off: number) => { if (suppress.current) return; user(); play("slide", { vol: 0.4 }); go(Math.round(target.get()) + off); };

  return (
    <div
      ref={rootRef}
      className="hs"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Card stack. Scroll, drag, or use the up and down keys."
      onPointerEnter={() => { hovered.current = true; }}
      onPointerLeave={() => { hovered.current = false; }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") { e.preventDefault(); user(); go(Math.round(target.get()) + 1); }
        if (e.key === "ArrowDown") { e.preventDefault(); user(); go(Math.round(target.get()) - 1); }
      }}
    >
      <style>{CSS}</style>
      <div className="hs-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {ITEMS.map((_, i) => <Row key={i} i={i} p={p} active={active === i} onPick={pick} />)}
      </div>
      <div aria-live="polite" className="hs-sr">{LABELS[ITEMS[active].id]}</div>
    </div>
  );
}

const CSS = `
.hs { position: absolute; inset: 0; overflow: hidden; outline: none; touch-action: none; user-select: none; -webkit-user-select: none;
  font-family: var(--font, system-ui); -webkit-font-smoothing: antialiased; color: var(--k-text);
  --hs-shadow: 0 0 0 1px rgba(255,255,255,.06), 0 1px 2px rgba(0,0,0,.4), 0 14px 34px -10px rgba(0,0,0,.55);
  --hs-soft: rgba(255,255,255,.05);
  --hs-belt: oklch(0.42 0.05 245 / .28); --hs-belt-line: oklch(0.7 0.06 240 / .22); --hs-belt-edge: oklch(0.75 0.05 240 / .3);
  --hs-box-hi: oklch(0.56 0.04 240); --hs-box-top: oklch(0.5 0.045 240); --hs-box-l: oklch(0.42 0.045 242); --hs-box-l2: oklch(0.38 0.045 242);
  --hs-box-r: oklch(0.36 0.045 244); --hs-box-r2: oklch(0.32 0.045 244); --hs-box-edge: oklch(0.62 0.04 240 / .5); --hs-box-shadow: rgba(0,0,0,.35);
  --hs-tape: oklch(0.6 0.05 238); --hs-tape2: oklch(0.44 0.05 240); --hs-doodle: oklch(0.72 0.08 240);
  --hs-teal: oklch(0.74 0.13 175); }
:root[data-theme="light"] .hs {
  --hs-shadow: 0 0 0 1px oklch(0.22 0.008 264 / .05), 0 1px 2px oklch(0.22 0.008 264 / .05), 0 14px 34px -12px oklch(0.22 0.008 264 / .16);
  --hs-soft: oklch(0.22 0.008 264 / .035);
  --hs-belt: oklch(0.93 0.025 240 / .8); --hs-belt-line: oklch(0.82 0.04 240 / .7); --hs-belt-edge: oklch(0.86 0.035 240);
  --hs-box-hi: oklch(0.995 0.004 240); --hs-box-top: oklch(0.965 0.016 240); --hs-box-l: oklch(0.935 0.025 240); --hs-box-l2: oklch(0.91 0.03 240);
  --hs-box-r: oklch(0.9 0.035 240); --hs-box-r2: oklch(0.87 0.04 240); --hs-box-edge: oklch(1 0 0 / .9); --hs-box-shadow: oklch(0.6 0.05 240 / .16);
  --hs-tape: oklch(0.9 0.03 240); --hs-tape2: oklch(0.84 0.04 240); --hs-doodle: oklch(0.72 0.09 240);
  --hs-teal: oklch(0.7 0.13 175); }
.hs-stage { position: absolute; left: 50%; top: 50%; width: ${W}px; height: ${H}px; transform-origin: center; }
.hs-rowx { position: absolute; left: 0; top: 0; overflow: hidden; background: var(--k-surface); box-shadow: var(--hs-shadow); cursor: pointer;
  will-change: transform; -webkit-tap-highlight-color: transparent; }
.hs-rowx[data-dark] { background: oklch(0.17 0.006 285); color: #f1f1f4;
  box-shadow: 0 0 0 1px rgba(255,255,255,.07), inset 0 1px 0 rgba(255,255,255,.06), 0 14px 34px -10px rgba(0,0,0,.5); }
.hs:focus-visible .hs-stage { outline: 2px solid ${GREEN}; outline-offset: 6px; border-radius: 24px; }
.hs-pill { position: absolute; left: 0; right: 0; top: 0; height: ${PH}px; display: flex; align-items: center; gap: 10px; padding: 0 16px 0 12px; pointer-events: none; }
.hs-pt { flex: 1; font-size: 13.5px; font-weight: 600; letter-spacing: -0.01em; white-space: nowrap; }
.hs-pm { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--k-muted); white-space: nowrap; }
.hs-rowx[data-dark] .hs-pm { color: rgba(255,255,255,.5); }
.hs-pi { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--k-surface); box-shadow: 0 0 0 1px var(--k-line), 0 2px 6px var(--k-shadow-soft); }
.hs-pstack { display: flex; }
.hs-pstack > * + * { margin-left: -6px; }
.hs-pstack .hs-app { box-shadow: 0 0 0 1.5px oklch(0.17 0.006 285); }
.hs-cardwrap { position: absolute; left: 0; top: 0; width: ${CARD_W}px; pointer-events: auto; }
.hs-card { position: absolute; inset: 0; cursor: default; }
.hs-check { display: inline-grid; place-items: center; border-radius: 50%; background: ${GREEN}; color: #fff; flex: none; box-shadow: 0 1px 2px rgba(20,90,50,.3), inset 0 1px 0 rgba(255,255,255,.3); }
.hs-flag { width: 16px; height: 11px; border-radius: 2.5px; overflow: hidden; display: inline-flex; flex-direction: column; flex: none; box-shadow: 0 0 0 1px var(--k-line); }
.hs-flag i { flex: 1; background: #f4f4f6; }
.hs-flag i + i { background: #dc3b3b; }
.hs-tag { font-size: 9.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; padding: 4px 7px; border-radius: 6px; white-space: nowrap; }
.hs-tag[data-c="teal"] { color: oklch(0.55 0.11 175); background: oklch(0.74 0.13 175 / .14); }
.hs-tag[data-c="red"] { color: oklch(0.58 0.19 25); background: oklch(0.64 0.2 25 / .12); }
:root:not([data-theme="light"]) .hs-tag[data-c="teal"] { color: oklch(0.8 0.12 175); }
:root:not([data-theme="light"]) .hs-tag[data-c="red"] { color: oklch(0.76 0.15 25); }
.hs-ring { width: 18px; height: 18px; border-radius: 50%; border: 1.5px dashed var(--k-faint); flex: none; display: inline-block; }
.hs-av { position: relative; display: inline-block; border-radius: 50%; flex: none; overflow: hidden; vertical-align: middle; }
.hs-av[data-ring] { box-shadow: 0 0 0 2px var(--k-surface), 0 2px 6px var(--k-shadow-soft); }
.hs-av i { position: absolute; left: 50%; bottom: -22%; width: 70%; height: 62%; transform: translateX(-50%); border-radius: 50% 50% 40% 40%; background: rgba(255,255,255,.55); }
.hs-av i::before { content: ""; position: absolute; left: 50%; top: -58%; width: 62%; height: 70%; transform: translateX(-50%); border-radius: 50%; background: rgba(255,255,255,.75); }
.hs-av[data-k="lj"] { background: linear-gradient(150deg, oklch(0.62 0.09 145), oklch(0.42 0.07 160)); }
.hs-av[data-k="a"] { background: linear-gradient(150deg, oklch(0.82 0.06 30), oklch(0.66 0.1 20)); }
.hs-av[data-k="b"] { background: linear-gradient(150deg, oklch(0.6 0.16 290), oklch(0.42 0.16 280)); }
.hs-av[data-k="c"] { background: linear-gradient(150deg, oklch(0.88 0.01 260), oklch(0.7 0.02 260)); }
.hs-h1 { font-size: 25px; font-weight: 600; letter-spacing: -0.025em; margin: 12px 0 10px; }
.hs-h2 { font-size: 19px; font-weight: 600; letter-spacing: -0.02em; }
.hs-p { font-size: 12.5px; line-height: 1.5; color: var(--k-muted); margin: 8px 0 0; text-wrap: pretty; }
.hs-mute { font-size: 12.5px; line-height: 1.5; color: var(--k-muted); }
.hs-num { font-variant-numeric: tabular-nums; letter-spacing: .01em; }
.hs-chip { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 500; color: var(--k-text2); padding: 6px 11px 6px 9px; border-radius: 99px;
  background: var(--k-surface); box-shadow: 0 0 0 1px var(--k-line), 0 2px 8px var(--k-shadow-soft); }
.hs-belt { position: absolute; left: 0; top: 0; width: 360px; height: 260px; }
.hs-run { animation: hs-run 1.6s linear infinite; }
@keyframes hs-run { to { transform: translateX(30px); } }
.hs-bob { animation: hs-bob 3.2s ease-in-out infinite; }
@keyframes hs-bob { 50% { transform: translateY(-2.5px); } }
.hs-track { position: absolute; left: 50%; top: 18px; translate: -50% 0; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
  font-size: 13px; font-weight: 500; color: var(--k-muted); padding: 7px 14px 7px 8px; border-radius: 99px; background: var(--k-surface);
  box-shadow: 0 0 0 1px var(--k-line), 0 4px 14px var(--k-shadow-soft); }
.hs-qr { position: absolute; right: 20px; bottom: 20px; padding: 9px; border-radius: 14px; background: #fff; color: #121214; line-height: 0;
  box-shadow: 0 0 0 1px oklch(0.22 0.008 264 / .06), 0 6px 16px oklch(0.22 0.008 264 / .12); }
.hs-mesh { position: absolute; left: 0; right: 0; top: 0; height: 140px; background: var(--hs-soft); border-bottom: 1px solid var(--k-line); }
.hs-logo { position: absolute; left: 22px; top: 116px; width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: var(--k-surface);
  box-shadow: 0 0 0 1px var(--k-line), 0 4px 14px var(--k-shadow-soft); }
.hs-row-t { display: flex; align-items: center; gap: 10px; }
.hs-btn { position: absolute; left: 16px; right: 16px; bottom: 16px; height: 42px; border: 0; border-radius: 13px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
  background: var(--k-well); color: var(--k-text2); display: flex; align-items: center; justify-content: center; gap: 8px; transition: background-color .25s, color .25s; }
.hs-btn[data-on] { background: oklch(0.75 0.13 40 / .14); color: oklch(0.58 0.15 38); }
:root:not([data-theme="light"]) .hs-btn[data-on] { color: oklch(0.78 0.12 45); }
.hs-btn:focus-visible { outline: 2px solid ${GREEN}; outline-offset: 2px; }
.hs-btn-in { display: inline-flex; align-items: center; gap: 8px; }
.hs-dark { color: #f1f1f4; }
.hs-dark .hs-p { color: rgba(255,255,255,.5); }
.hs-seg { position: absolute; left: 24px; right: 24px; top: 20px; display: flex; gap: 8px; }
.hs-seg span { flex: 1; height: 2px; border-radius: 1px; background: rgba(255,255,255,.14); overflow: hidden; }
.hs-seg i { display: block; height: 100%; background: rgba(255,255,255,.9); transform-origin: left; }
.hs-sky { position: absolute; left: 0; top: 10px; width: 360px; height: 200px; }
.hs-float { position: absolute; }
.hs-app { display: grid; place-items: center; flex: none; }
.hs-app[data-k="0"] { background: linear-gradient(160deg, #4a4a50, #2a2a2e); box-shadow: inset 0 1px 0 rgba(255,255,255,.15), 0 6px 16px rgba(0,0,0,.5); }
.hs-app[data-k="1"] { background: linear-gradient(160deg, #9b5cf6, #6a2fd6); box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 6px 16px rgba(80,30,180,.45); }
.hs-app[data-k="2"] { background: linear-gradient(160deg, #ffc533, #f5a300); box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 6px 16px rgba(200,120,0,.35); }
.hs-app[data-k="3"] { background: linear-gradient(160deg, #ffffff, #e9e9ee); box-shadow: inset 0 -1px 0 rgba(0,0,0,.08), 0 6px 16px rgba(0,0,0,.45); }
.hs-btn-dark { background: linear-gradient(180deg, #232327, #1a1a1d); color: #f1f1f4; border-radius: 99px; height: 46px;
  box-shadow: 0 0 0 1px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.06), 0 4px 12px rgba(0,0,0,.4); }
.hs-bezel { background: var(--k-well); }
.hs-inner { position: absolute; inset: 9px; border-radius: ${R_CARD - 9}px; background: var(--k-surface); box-shadow: 0 0 0 1px var(--k-line), 0 6px 18px var(--k-shadow-soft);
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; }
.hs-inv-row { display: flex; align-items: center; gap: 10px; }
.hs-inv-strong { font-size: 22px; font-weight: 600; letter-spacing: -0.025em; }
.hs-inv-soft { font-size: 20px; font-weight: 600; letter-spacing: -0.025em; color: var(--k-faint); }
.hs-thumb { width: 34px; height: 34px; border-radius: 9px; overflow: hidden; display: inline-block; line-height: 0; flex: none;
  box-shadow: 0 0 0 2px var(--k-surface), 0 6px 14px var(--k-shadow); }
.hs-hr { width: 74%; height: 1px; border: 0; margin: 14px 0 10px; background: var(--k-line2); transform-origin: center; }
.hs-inv-meta { font-size: 15px; font-weight: 500; color: var(--k-faint); line-height: 1.5; font-variant-numeric: tabular-nums; }
.hs-col { background: var(--hs-soft); }
.hs-col-h { position: absolute; left: 20px; right: 18px; top: 0; height: 58px; display: flex; align-items: center; gap: 10px; }
.hs-col-t { flex: 1; font-size: 16px; font-weight: 600; letter-spacing: -0.015em; }
.hs-task { position: absolute; left: 10px; right: 10px; top: 58px; bottom: 10px; border-radius: ${R_CARD - 10}px; background: var(--k-surface); padding: 16px 18px;
  box-shadow: 0 0 0 1px var(--k-line), 0 4px 14px var(--k-shadow-soft); }
.hs-task-top { display: flex; align-items: center; gap: 6px; }
.hs-chip2 { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 500; padding: 4px 8px; border-radius: 7px; background: var(--k-well); color: var(--k-text2); }
.hs-chip2[data-c="red"] { background: oklch(0.64 0.2 25 / .1); color: oklch(0.58 0.19 25); }
:root:not([data-theme="light"]) .hs-chip2[data-c="red"] { color: oklch(0.76 0.15 25); }
.hs-kebab { margin-left: auto; display: flex; flex-direction: column; gap: 2px; padding: 4px 6px; }
.hs-kebab i { width: 3px; height: 3px; border-radius: 50%; background: var(--k-muted); }
.hs-task-t { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; margin-top: 16px; }
.hs-task-foot { display: flex; align-items: center; justify-content: space-between; }
.hs-avs { display: flex; }
.hs-avs > * + * { margin-left: -7px; }
.hs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
@media (prefers-reduced-motion: reduce) { .hs-run, .hs-bob { animation: none; } }
`;
