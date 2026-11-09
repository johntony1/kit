// DotArt: a live dot matrix illustration that fits its box. Loop pieces always move (while on
// screen); hover pieces rest and play while the pointer is over them (or `hover` is set).
// In the stipple style the dots also follow the pointer: they part around it, smear along with it
// and spring back home.
import { useEffect, useLayoutEffect, useRef, useMemo, useState, useSyncExternalStore } from "react";
import { theme as siteTheme } from "../site/theme";
import { bounds, paintFrame, Stipple, THEMES, type DotStyle, type Illustration, type Theme } from "./dots";

export function DotArt({ ill, theme: chosen = THEMES[0], hover, fit = 1, maxPitch = 9, look = "stipple" }: { ill: Illustration; theme?: Theme; hover?: boolean; fit?: number; maxPitch?: number; look?: DotStyle }) {
  // on a light page white dots would vanish: the White colour becomes ink there
  const light = useSyncExternalStore(siteTheme.subscribe, () => siteTheme.get() === "light", () => false);
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
    const b = bounds(ill);
    const ro = new ResizeObserver(() => setPitch(Math.max(2, Math.min(maxPitch, (el.clientWidth * fit) / b.w, (el.clientHeight * fit) / b.h))));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, [ill, fit, maxPitch]);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const win = bounds(ill);
    if (look === "stipple") return runStipple(c, ill, theme, pitch, dpr, seen, ill.kind, h, wantRef, st);
    const W = win.w * pitch, H = win.h * pitch;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    c.style.width = `${W}px`; c.style.height = `${H}px`;
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
        paintFrame(ctx, ill, still ? (ill.period ?? 3) * 0.3 : t, still ? Math.round(h.current) : h.current, theme, pitch, look, dpr);
        drawn = h.current;
      }
      raf = requestAnimationFrame(frame);
    };
    if (seen) raf = requestAnimationFrame(frame);
    else { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); paintFrame(ctx, ill, 0, 0, theme, pitch, look, dpr); }
    return () => cancelAnimationFrame(raf);
  }, [ill, theme, pitch, seen, look]);

  return (
    <div ref={box} className="dotArt" onPointerEnter={() => setOver(true)}
      onPointerMove={(e) => { const c = cv.current; if (c && st.current && e.pointerType !== "touch") st.current.point(e.clientX, e.clientY, c.getBoundingClientRect()); }}
      onPointerLeave={() => { setOver(false); st.current?.leave(); }}>
      <canvas ref={cv} aria-label={ill.name} role="img" />
    </div>
  );
}

/** the stipple loop: re-sample the scene only when it changes, move the springs every frame they
 *  are live, and paint only when something moved */
function runStipple(c: HTMLCanvasElement, ill: Illustration, theme: Theme, pitch: number, dpr: number, seen: boolean, kind: Illustration["kind"],
  h: { current: number }, want: { current: boolean }, ref: { current: Stipple | null }) {
  const s = new Stipple(ill, theme, pitch, dpr);
  ref.current = s;
  c.width = s.W; c.height = s.H;
  c.style.width = `${s.W / dpr}px`; c.style.height = `${s.H / dpr}px`;
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
