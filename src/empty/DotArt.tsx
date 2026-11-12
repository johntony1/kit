// DotArt: a live dot matrix illustration that fits its box. Loop pieces always move (while on
// screen); hover pieces rest and play while the pointer is over them (or `hover` is set).
// In the stipple style the dots also follow the pointer: they part around it, smear along with it
// and spring back home.
import { Suspense, useEffect, useLayoutEffect, useRef, useMemo, useState, useSyncExternalStore, type ComponentProps } from "react";
import { theme as siteTheme } from "../site/theme";
import { play } from "../sound/sound";
import { FLAT } from "./flat";
import { useIll } from "./ills";
import { paintFrame, windowOf, Stipple, THEMES, type DotOpts, type DotShape, type DotStyle, type Illustration, type Mode, type Theme } from "./dots";

export function DotArt({ ill, theme: chosen = THEMES[0], hover, fit = 1, maxPitch = 9, look = "stipple", touch = false, mode, stage = false, ui = false, shape, res = 1 }: { ill: Illustration; shape?: DotShape; res?: number; theme?: Theme; hover?: boolean; fit?: number; maxPitch?: number; look?: DotStyle; touch?: boolean; mode?: Mode; stage?: boolean; ui?: boolean }) {
  // on a light page white dots would vanish: the White colour becomes ink there
  const siteLight = useSyncExternalStore(siteTheme.subscribe, () => siteTheme.get() === "light", () => false);
  const light = mode ? mode === "light" : siteLight;
  const md: Mode = light ? "light" : "dark";
  const theme: Theme = useMemo(() => (light && chosen.name === "White" ? { ...chosen, a: "#262a31", bg: "#f7f8f9" } : chosen), [light, chosen]);
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [pitch, setPitch] = useState(5);
  const [over, setOver] = useState(false);
  const [seen, setSeen] = useState(true);
  const h = useRef(0);
  const want = hover ?? over;
  const st = useRef<Stipple | null>(null);
  const wantRef = useRef(want);
  wantRef.current = want;

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const b = windowOf(ill, look, stage);
    // measured before the first paint, so a piece never shows one frame at the wrong size
    const size = () => { if (el.clientWidth && el.clientHeight) setPitch(Math.max(2, Math.min(maxPitch, (el.clientWidth * fit) / b.w, (el.clientHeight * fit) / b.h))); };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, [ill, fit, maxPitch, look, stage]);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const win = windowOf(ill, look, stage);
    const opts: DotOpts = { shape, res };
    if (look === "stipple") return runStipple(c, ill, theme, pitch, dpr, seen, ill.kind, h, wantRef, st, stage, opts);
    const W = win.w * pitch, H = win.h * pitch;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    c.style.width = `${W}px`; c.style.height = `${H}px`; c.style.margin = "0";
    const ctx = c.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now(), t = 0, drawn = -1;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const target = wantRef.current ? 1 : 0;
      // a critically damped approach to the hover target
      h.current += (target - h.current) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - h.current) < 0.002) h.current = target;
      const moving = ill.kind === "loop" ? !still : h.current !== drawn || (target === 1 && !still);
      if (ill.kind === "loop" || target === 1) t += dt;
      if (moving || drawn < 0) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        paintFrame(ctx, ill, still ? (ill.period ?? 3) * 0.3 : t, still ? Math.round(h.current) : h.current, theme, pitch, look, dpr, md, stage, opts);
        drawn = h.current;
      }
      raf = requestAnimationFrame(frame);
    };
    if (seen) raf = requestAnimationFrame(frame);
    else { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); paintFrame(ctx, ill, 0, 0, theme, pitch, look, dpr, md, stage, opts); }
    return () => cancelAnimationFrame(raf);
  }, [ill, theme, pitch, seen, look, md, stage, shape, res]);

  if (ui && ill.flat && ill.flat in FLAT) { const F = FLAT[ill.flat as keyof typeof FLAT]; return <div ref={box} className="dotArt flatArt"><Suspense fallback={null}><F mode={md} /></Suspense></div>; }
  return (
    <div ref={box} className="dotArt" onPointerEnter={(e) => e.pointerType !== "touch" && setOver(true)}
      onPointerMove={(e) => {
        const c = cv.current;
        // a finger only moves the dots while it is down (and only where touch is on); a mouse moves them by hovering
        if (!c || !st.current || (e.pointerType === "touch" && !(touch && e.buttons))) return;
        st.current.point(e.clientX, e.clientY, c.getBoundingClientRect());
      }}
      onPointerDown={(e) => {
        const c = cv.current;
        if (!c || !st.current || (e.pointerType === "touch" && !touch) || e.button !== 0) return;
        st.current.down(e.clientX, e.clientY, c.getBoundingClientRect());
        play("rustle", { gap: 90, pitch: 0.9 + Math.random() * 0.2 });
      }}
      onPointerUp={(e) => { st.current?.up(); if (e.pointerType === "touch") st.current?.leave(); }}
      onPointerCancel={() => st.current?.leave()}
      onPointerLeave={() => { setOver(false); st.current?.leave(); }}>
      <canvas ref={cv} aria-label={ill.name} role="img" style={touch && look === "stipple" ? { touchAction: "none" } : undefined} />
    </div>
  );
}

/** the stipple loop: re-sample the scene only when it changes, move the springs every frame they
 *  are live, and paint only when something moved */
function runStipple(c: HTMLCanvasElement, ill: Illustration, theme: Theme, pitch: number, dpr: number, seen: boolean, kind: Illustration["kind"],
  h: { current: number }, want: { current: boolean }, ref: { current: Stipple | null }, stage = false, opts: DotOpts = {}) {
  const s = new Stipple(ill, theme, pitch, dpr, true, stage, opts);
  ref.current = s;
  c.width = s.W; c.height = s.H;
  // the canvas is bigger than the art by the room dots can be pulled into; that room hangs outside the layout box
  c.style.width = `${s.W / dpr}px`; c.style.height = `${s.H / dpr}px`;
  c.style.margin = `${-s.padY / dpr}px ${-s.padX / dpr}px`;
  const ctx = c.getContext("2d")!;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) s.leave();
  let raf = 0, last = performance.now(), t = 0, toned = -1, live = false;
  const frame = (now: number) => {
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    const target = want.current ? 1 : 0;
    h.current += (target - h.current) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - h.current) < 0.002) h.current = target;
    const playing = !still && (kind === "loop" || target === 1);
    if (playing) t += dt;
    let dirty = false;
    if (playing || h.current !== toned || toned < 0) { s.setTone(still ? (ill.period ?? 3) * 0.3 : t, still ? Math.round(h.current) : h.current); toned = h.current; dirty = true; }
    if (!still && (s.active || live)) { s.step(dt); dirty = true; }
    live = s.active;
    if (dirty) s.draw(ctx);
    raf = requestAnimationFrame(frame);
  };
  if (seen) raf = requestAnimationFrame(frame);
  else { s.setTone(0, 0); s.draw(ctx); }
  return () => { cancelAnimationFrame(raf); if (ref.current === s) ref.current = null; };
}

/** DotArt by key: fetches the piece's drawing code the first time it is shown, then draws it */
export function LazyDot({ k, ...rest }: { k: string } & Omit<ComponentProps<typeof DotArt>, "ill">) {
  const ill = useIll(k);
  return ill ? <DotArt ill={ill} {...rest} /> : null;
}
