// DotArt: a live dot matrix illustration that fits its box. Loop pieces always move (while on
// screen); hover pieces rest and play while the pointer is over them (or `hover` is set).
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { bounds, paintDots, renderGrid, THEMES, type Illustration, type Theme } from "./dots";

export function DotArt({ ill, theme = THEMES[0], hover, fit = 1, maxPitch = 9 }: { ill: Illustration; theme?: Theme; hover?: boolean; fit?: number; maxPitch?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [pitch, setPitch] = useState(5);
  const [over, setOver] = useState(false);
  const [seen, setSeen] = useState(true);
  const h = useRef(0);
  const want = hover ?? over;
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
        const g = renderGrid(ill, still ? (ill.period ?? 3) * 0.3 : t, still ? Math.round(h.current) : h.current);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        paintDots(ctx, g, ill.cols, ill.rows, theme, pitch, true, win);
        drawn = h.current;
      }
      raf = requestAnimationFrame(frame);
    };
    if (seen) raf = requestAnimationFrame(frame);
    else { const g = renderGrid(ill, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); paintDots(ctx, g, ill.cols, ill.rows, theme, pitch, true, win); }
    return () => cancelAnimationFrame(raf);
  }, [ill, theme, pitch, seen]);

  return (
    <div ref={box} className="dotArt" onPointerEnter={() => setOver(true)} onPointerLeave={() => setOver(false)}>
      <canvas ref={cv} aria-label={ill.name} role="img" />
    </div>
  );
}
