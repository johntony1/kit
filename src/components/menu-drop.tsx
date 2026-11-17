/* Menu drop: a screen's menu bar. Hover an icon and a drop of the bar itself runs down beneath it,
 * shoulders flowing out of the bar like a bead of ink, and shows what the icon holds. Move along and
 * the one drop flows to the next icon, taking that one's width; its contents slide over in the
 * direction you went. Leave and it draws back up into the icon.
 *
 *  SCREEN          380 × 214, radius 12, inside a 6px frame; menu bar 28 tall across the top
 *  DROP            one path with the bar: S shoulders (up to 24 wide) into straight walls,
 *                  11px bottom corners, 34 deep; widths per icon (music 186, weather 172, wifi 150, battery 140)
 *
 *  OPEN      0ms   from the icon's own width at depth 0: depth → 34 (spring .46s, a little give),
 *                  width → the icon's (spring .42s, no bounce)
 *           60ms   contents arrive: opacity 0 → 1, blur 4 → 0, y −5 → 0 (spring .35s)
 *  MOVE      0ms   centre and width spring together (.42s, no bounce); old contents leave the way
 *                  you went (x ∓10, blur 4), new ones come in from the other side
 *  MUSIC   2.4s    controls give way to the song's title, which glides to show its end and back
 *  LEAVE   140ms   grace, so the gap between icons never blinks; then depth → 0 and width → the
 *                  icon's (spring .34s, no bounce), contents fade with blur as it draws up
 *
 * The drop is three motion values (centre, width, depth) feeding one path, so every move can be
 * turned mid flight and keeps its speed. Keyboard: Tab onto an icon opens its drop. Touch: tap. */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig, animate, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { play } from "../sound/sound";

/* ── sizes ─────────────────────────────────────────────── */
const SCREEN_W = 380, SCREEN_H = 214, FRAME = 6, BAR = 28;
const DEPTH = 34, CORNER = 11, SHOULDER = 24, EDGE = 6;

/* ── motion ────────────────────────────────────────────── */
const GLIDE = { type: "spring", visualDuration: 0.42, bounce: 0 } as const;
const POUR = { type: "spring", visualDuration: 0.46, bounce: 0.16 } as const;
const DRAW_UP = { type: "spring", visualDuration: 0.34, bounce: 0 } as const;
const SWAP = { type: "spring", visualDuration: 0.35, bounce: 0 } as const;
const GRACE = 140, MUSIC_TURN = 2400;

/* ── this piece's colours: dark, then light ─────────────── */
const CSS = `
.mdrop { --md-frame: var(--k-surface); --md-frame-shadow: var(--k-lift), 0 18px 40px -18px rgba(0,0,0,.7);
  --md-wall: radial-gradient(120% 90% at 85% 0%, oklch(0.42 0.09 152) 0%, oklch(0.28 0.06 165) 45%, oklch(0.2 0.03 200) 100%);
  --md-bar: oklch(0.13 0.004 150); --md-ink: var(--k-text); --md-mute: var(--k-muted); --md-hover: rgba(255,255,255,.09);
  --md-drop-shadow: none; --md-art: linear-gradient(140deg, #3fc06c, oklch(0.5 0.1 190)); }
:root[data-theme="light"] .mdrop { --md-frame-shadow: var(--k-lift), 0 18px 40px -20px oklch(0.22 0.008 264 / .25);
  --md-wall: radial-gradient(120% 90% at 85% 0%, oklch(0.9 0.07 150) 0%, oklch(0.94 0.04 170) 45%, oklch(0.96 0.015 210) 100%);
  --md-bar: oklch(1 0 0); --md-hover: oklch(0.22 0.008 264 / .06);
  --md-drop-shadow: drop-shadow(0 1px 0 oklch(0.22 0.008 264 / .06)) drop-shadow(0 8px 14px oklch(0.22 0.008 264 / .1)); }
.md-item { appearance: none; border: 0; padding: 0 7px; height: 22px; min-width: 26px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center;
  background: transparent; color: var(--md-ink); font: 500 12px/1 var(--font, system-ui); letter-spacing: -0.01em; font-variant-numeric: tabular-nums; cursor: default;
  transition: background-color 200ms cubic-bezier(0.16, 1, 0.3, 1); touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.md-item[data-on="true"] { background: var(--md-hover); }
.md-item:focus-visible, .md-ctl:focus-visible { outline: 2px solid #3fc06c; outline-offset: 1px; }
.md-item svg { width: 16px; height: 16px; }
.md-row { position: absolute; inset: 0; display: flex; align-items: center; gap: 8px; padding: 0 12px; white-space: nowrap;
  color: var(--md-ink); font: 500 12px/1 var(--font, system-ui); letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.md-row .mute { color: var(--md-mute); }
.md-ctl { appearance: none; border: 0; padding: 0; width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; background: transparent;
  color: var(--md-ink); cursor: pointer; transition: background-color 200ms cubic-bezier(0.16, 1, 0.3, 1), scale 160ms cubic-bezier(0.16, 1, 0.3, 1); }
@media (hover: hover) { .md-ctl:hover { background: var(--md-hover); } }
.md-ctl:active { scale: .96; }
.md-ctl svg { width: 14px; height: 14px; }
.md-art { width: 20px; height: 20px; border-radius: 5px; flex: none; background: var(--md-art); box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); position: relative; }
.md-art::after { content: ""; position: absolute; inset: 6px; border-radius: 50%; background: rgba(255,255,255,.85); box-shadow: 0 0 0 2px rgba(0,0,0,.12); }
.md-title { flex: 1; min-width: 0; overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 8px, #000 calc(100% - 14px), transparent); }
`;

/* ── Kit's line icons, 16px, 1.5 stroke ─────────────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICON = {
  music: <><path d="M6 13.5V4.5l7-1.5v9" {...S} /><circle cx="4.5" cy="13.5" r="1.75" {...S} /><circle cx="11.5" cy="12" r="1.75" {...S} /></>,
  cloud: <path d="M5 13.5h6.5a3 3 0 0 0 .4-6A4 4 0 0 0 4.3 8.6 2.5 2.5 0 0 0 5 13.5Z" {...S} />,
  wifi: <><path d="M2.5 6.5a8 8 0 0 1 11 0M4.6 8.9a5 5 0 0 1 6.8 0" {...S} /><circle cx="8" cy="11.6" r=".9" fill="currentColor" /></>,
  battery: <><rect x="1.75" y="5" width="11" height="6.5" rx="1.9" {...S} /><path d="M14.5 7.3v2" {...S} /><rect x="3.4" y="6.6" width="6.4" height="3.3" rx=".8" fill="currentColor" stroke="none" /></>,
  search: <><circle cx="7" cy="7" r="4" {...S} /><path d="m10 10 3 3" {...S} /></>,
  prev: <><path d="M4 3.5v9" {...S} /><path d="M12.5 4 6.5 8l6 4Z" {...S} fill="currentColor" /></>,
  next: <><path d="M12 3.5v9" {...S} /><path d="M3.5 4l6 4-6 4Z" {...S} fill="currentColor" /></>,
};

type Key = "music" | "weather" | "wifi" | "battery" | "search";
const ITEMS: { k: Key; label: string; face: ReactNode; width?: number }[] = [
  { k: "music", label: "Now playing", face: <svg viewBox="0 0 16 16" aria-hidden="true">{ICON.music}</svg>, width: 186 },
  { k: "weather", label: "Weather", face: <>78°</>, width: 172 },
  { k: "wifi", label: "Wi-Fi", face: <svg viewBox="0 0 16 16" aria-hidden="true">{ICON.wifi}</svg>, width: 150 },
  { k: "battery", label: "Battery", face: <svg viewBox="0 0 16 16" aria-hidden="true">{ICON.battery}</svg>, width: 140 },
  { k: "search", label: "Search", face: <svg viewBox="0 0 16 16" aria-hidden="true">{ICON.search}</svg> },
];

/** the bar and its drop as one outline: S shoulders out of the bar, straight walls, round bottom */
function outline(cx: number, w: number, d: number) {
  if (d < 0.4) return `M0 0H${SCREEN_W}V${BAR}H0Z`;
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const rc = Math.min(CORNER, d * 0.42), sx = Math.min(SHOULDER, d * 0.75);
  const yb = BAR + d, yw = yb - rc, ym = BAR + (yw - BAR) * 0.3;
  const f = (n: number) => n.toFixed(2);
  return `M0 0H${SCREEN_W}V${BAR}H${f(x1 + sx)}C${f(x1 + sx * 0.5)} ${BAR} ${f(x1)} ${f(ym)} ${f(x1)} ${f(yw)}`
    + `C${f(x1)} ${f(yw + rc * 0.55)} ${f(x1 - rc * 0.45)} ${f(yb)} ${f(x1 - rc)} ${f(yb)}H${f(x0 + rc)}`
    + `C${f(x0 + rc * 0.45)} ${f(yb)} ${f(x0)} ${f(yw + rc * 0.55)} ${f(x0)} ${f(yw)}`
    + `C${f(x0)} ${f(ym)} ${f(x0 - sx * 0.5)} ${BAR} ${f(x0 - sx)} ${BAR}H0Z`;
}

/* ── what each drop holds ──────────────────────────────── */
const fmt = (s: number) => `-${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Title({ text }: { text: string }) {
  const box = useRef<HTMLDivElement>(null), line = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const over = (line.current?.scrollWidth ?? 0) - (box.current?.clientWidth ?? 0);
    if (over <= 0 || reduced) return;
    // glide to the end, rest, glide back: eased both ways, never a constant crawl
    const a = animate(x, [0, 0, -over - 14, -over - 14, 0], { duration: 4.6, times: [0, 0.12, 0.5, 0.62, 1], ease: [0.45, 0, 0.25, 1], repeat: Infinity });
    return () => a.stop();
  }, [text, reduced, x]);
  return (
    <div ref={box} className="md-title">
      <motion.span ref={line} style={{ x, display: "inline-block", paddingLeft: 2 }}>{text}</motion.span>
    </div>
  );
}

function Music({ playing, left, turn, onToggle }: { playing: boolean; left: number; turn: boolean; onToggle: () => void }) {
  return (
    <div className="md-row" style={{ gap: 10 }}>
      <span className="md-art" aria-hidden="true" />
      <div style={{ position: "relative", flex: 1, height: 22 }}>
        <AnimatePresence initial={false} mode="popLayout">
          {turn ? (
            <motion.div key="title" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(4px)" }} transition={SWAP}>
              <Title text="Slow Light Through the Blinds · Ana Rivers" />
            </motion.div>
          ) : (
            <motion.div key="controls" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 2 }}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(4px)" }} transition={SWAP}>
              <button type="button" className="md-ctl" aria-label="Previous"><svg viewBox="0 0 16 16" aria-hidden="true">{ICON.prev}</svg></button>
              <button type="button" className="md-ctl" aria-label={playing ? "Pause" : "Play"} onClick={onToggle} style={{ color: "#3fc06c" }}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.g key={playing ? "pause" : "play"} style={{ transformOrigin: "8px 8px", transformBox: "view-box" }}
                      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
                      {playing ? <path d="M5.5 4v8M10.5 4v8" {...S} strokeWidth={2} /> : <path d="M5.5 3.8v8.4L12.2 8Z" {...S} fill="currentColor" />}
                    </motion.g>
                  </AnimatePresence>
                </svg>
              </button>
              <button type="button" className="md-ctl" aria-label="Next"><svg viewBox="0 0 16 16" aria-hidden="true">{ICON.next}</svg></button>
              <span style={{ marginLeft: "auto" }}>{fmt(left)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Holds({ k, music }: { k: Key; music: ReactNode }) {
  if (k === "music") return <>{music}</>;
  if (k === "weather") return (
    <div className="md-row"><span>78° Cloudy</span><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">{ICON.cloud}</svg><span className="mute">San Diego</span></div>
  );
  if (k === "wifi") return (
    <div className="md-row"><span style={{ width: 6, height: 6, borderRadius: 3, background: "#3fc06c", flex: "none" }} /><span>Studio</span><span className="mute" style={{ marginLeft: "auto" }}>5 GHz</span></div>
  );
  return (
    <div className="md-row">
      <span style={{ position: "relative", width: 22, height: 11, borderRadius: 3.5, boxShadow: "inset 0 0 0 1.5px currentColor", flex: "none" }}>
        <span style={{ position: "absolute", left: 2.5, top: 2.5, bottom: 2.5, width: 13, borderRadius: 1.5, background: "#3fc06c" }} />
      </span>
      <span>82%</span><span className="mute" style={{ marginLeft: "auto" }}>2:40 left</span>
    </div>
  );
}

/* ── the drop: one path from three motion values ─────────── */
function Drop({ cx, w, d }: { cx: MotionValue<number>; w: MotionValue<number>; d: MotionValue<number> }) {
  const path = useTransform([cx, w, d] as MotionValue<number>[], ([a, b, c]: number[]) => outline(a, b, c));
  return (
    <svg width={SCREEN_W} height={BAR + DEPTH + 8} viewBox={`0 0 ${SCREEN_W} ${BAR + DEPTH + 8}`} aria-hidden="true"
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "var(--md-drop-shadow)" }}>
      <motion.path d={path} fill="var(--md-bar)" />
    </svg>
  );
}

/* ── fit: scale into the tile ── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const w = SCREEN_W + FRAME * 2, h = SCREEN_H + FRAME * 2;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight;
      if (!W || !H) return;
      setScale(Math.min(size === "big" ? 1.8 : 1.3, (W - 32) / w, (H - 32) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, scale };
}

/* ── component ──────────────────────────────────────────── */
export default function MenuDrop({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, scale } = useFit(size);
  const reduced = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [on, setOn] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const onRef = useRef<number | null>(null);
  const timer = useRef<number>(0);
  const cx = useMotionValue(0), w = useMotionValue(0), d = useMotionValue(0);

  // music: counts down while it plays, and turns to the title now and then
  const [playing, setPlaying] = useState(true);
  const [left, setLeft] = useState(73);
  const [turn, setTurn] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setLeft((s) => (s <= 1 ? 214 : s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [playing]);
  const musicOpen = on !== null && ITEMS[on].k === "music";
  useEffect(() => {
    if (!musicOpen) { setTurn(false); return; }
    const t = window.setInterval(() => setTurn((v) => !v), MUSIC_TURN);
    return () => window.clearInterval(t);
  }, [musicOpen]);

  const centre = (i: number) => { const b = refs.current[i]; return b ? b.offsetLeft + b.offsetWidth / 2 : SCREEN_W / 2; };
  const iconW = (i: number) => refs.current[i]?.offsetWidth ?? 26;
  const go = (mv: MotionValue<number>, to: number, t: object) => (reduced ? mv.set(to) : animate(mv, to, t));

  const open = (i: number) => {
    window.clearTimeout(timer.current);
    const width = ITEMS[i].width;
    if (!width) { close(0); return; }
    const prev = onRef.current;
    if (prev === i) return;
    onRef.current = i;
    setDir(prev === null ? 0 : Math.sign(centre(i) - centre(prev)));
    setOn(i);
    if (prev === null) play("tick", { vol: 0.35 });
    const room = width / 2 + SHOULDER + EDGE;
    const to = Math.min(SCREEN_W - room, Math.max(room, centre(i)));
    if (d.get() < 0.5) { cx.set(centre(i)); w.set(iconW(i)); }
    go(cx, to, GLIDE); go(w, width, GLIDE); go(d, DEPTH, POUR);
  };
  const close = (after = GRACE) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const i = onRef.current;
      if (i === null) return;
      onRef.current = null;
      setOn(null);
      go(d, 0, DRAW_UP); go(w, iconW(i), DRAW_UP); go(cx, centre(i), DRAW_UP);
    }, after);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const touch = useRef(false);
  const item = ITEMS[on ?? 0];
  const left0 = useTransform([cx, w] as MotionValue<number>[], ([a, b]: number[]) => a - b / 2);

  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div data-own-click className="mdrop" style={{ pointerEvents: "auto", position: "absolute", left: "50%", top: "50%", padding: FRAME, borderRadius: 12 + FRAME,
          background: "var(--md-frame)", boxShadow: "var(--md-frame-shadow)", transform: `translate(-50%, -50%) scale(${scale})` }}>
          <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H, borderRadius: 12, overflow: "hidden", background: "var(--md-wall)" }}
            onPointerDown={(e) => { touch.current = e.pointerType !== "mouse"; if (touch.current && e.target === e.currentTarget) close(0); }}>
            <Drop cx={cx} w={w} d={d} />
            <div onPointerLeave={(e) => { if (e.pointerType === "mouse") close(); }} onPointerEnter={() => window.clearTimeout(timer.current)}>
              {/* the bar: the app on the left, the icons on the right */}
              <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, height: BAR, display: "flex", alignItems: "center", padding: "0 6px 0 12px",
                font: "500 12px/1 var(--font, system-ui)", color: "var(--md-ink)", letterSpacing: "-0.01em" }}>
                <span style={{ fontWeight: 650, marginRight: 14 }} onPointerEnter={() => close(0)}>Kit</span>
                <span style={{ color: "var(--md-mute)", display: "flex", gap: 14 }} onPointerEnter={() => close(0)}><span>File</span><span>Edit</span><span>View</span></span>
                <div role="menubar" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                  {ITEMS.map((it, i) => (
                    <button key={it.k} ref={(el) => { refs.current[i] = el; }} type="button" role="menuitem" className="md-item" aria-label={it.label}
                      aria-expanded={it.width ? on === i : undefined} data-on={on === i}
                      onPointerEnter={(e) => { if (e.pointerType === "mouse") open(i); }}
                      onClick={() => { if (touch.current) (on === i ? close(0) : open(i)); }}
                      onFocus={() => { if (!touch.current) open(i); }} onBlur={() => close()}
                      onKeyDown={(e) => { if (e.key === "Escape") close(0); }}>
                      {it.face}
                    </button>
                  ))}
                  <span style={{ padding: "0 7px", fontVariantNumeric: "tabular-nums" }}>9:41</span>
                </div>
              </div>

              {/* what the drop holds, clipped to its body */}
              <motion.div style={{ position: "absolute", top: BAR, left: left0, width: w, height: d, overflow: "hidden",
                borderBottomLeftRadius: CORNER, borderBottomRightRadius: CORNER, pointerEvents: on === null ? "none" : "auto" }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: DEPTH - 2 }}>
                  <AnimatePresence initial={false} mode="popLayout" custom={dir}>
                    {on !== null && (
                      <motion.div key={item.k} custom={dir} role="status" aria-label={item.label} style={{ position: "absolute", inset: 0 }}
                        variants={{
                          in: (s: number) => ({ opacity: 0, x: s * 10, y: s ? 0 : -5, filter: "blur(4px)" }),
                          at: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { ...SWAP, delay: dir ? 0 : 0.06 } },
                          out: (s: number) => ({ opacity: 0, x: s * -10, filter: "blur(4px)", transition: { type: "spring", visualDuration: 0.22, bounce: 0 } }),
                        }}
                        initial="in" animate="at" exit="out">
                        <Holds k={item.k} music={<Music playing={playing} left={left} turn={turn} onToggle={() => { setPlaying((p) => !p); play(playing ? "pause" : "play", { vol: 0.5 }); }} />} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
