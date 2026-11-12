// Cube deck: four Moonlytics screens are the faces of one cube. Drag (or
// wheel) to roll it a quarter turn, hinged on the shared edge, the cube pulling
// back to 1.6x depth at mid-fold on a half-sine and the turn eased in and out,
// exactly as CubeDeck.tsx does with page scroll. Idle, it rolls on its own.
// Sound: one roll as each quarter turn starts under a drag, wheel, click or key
// (never on the idle roll).
import { play } from "../sound/sound";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const FW = 340; // face width (design px)
const FH = 212; // face height
const D = FH / 2; // half the cube's edge: the axis is x, so the hinge swings across the height
const LIFT = 0.6; // DEFAULT_FOLD.lift
const HINGE = -1; // with drag-down = forward, this drops the next face in from above and tips the outgoing one down
const N = 4;

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const clear = size === "big" ? 170 : h >= 300 ? 120 : 30;
      setS(Math.min((w - 110) / FW, (h - clear) / FH, size === "big" ? 2 : 1.15));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return { ref, s };
}

/* ── the four faces: drawn, not exported ─────────────────────────────── */

const ink = "var(--cu-ink)";
const faceBase: CSSProperties = { position: "absolute", inset: 0, overflow: "hidden", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: ink, background: "var(--cu-bg)" };

function Glow() {
  // the blue light frame the Moonlytics stage sits in
  return <div style={{ position: "absolute", inset: 0, background: "var(--cu-glow)", pointerEvents: "none" }} />;
}

function Moon() {
  // a dotted moon: a dot grid cut to a sphere, lit from the upper left
  const m = "radial-gradient(circle at 50% 50%, #000 49.5%, transparent 50.5%)";
  return (
    <div style={{ position: "absolute", right: 22, top: 40, width: 118, height: 118 }}>
      <div style={{ position: "absolute", inset: -30, borderRadius: "50%", background: "var(--cu-halo)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "var(--cu-moon)", backgroundSize: "100% 100%, 4px 4px", WebkitMaskImage: m, maskImage: m }} />
    </div>
  );
}

function HeroFace() {
  return (
    <div style={faceBase}>
      <Glow />
      <Moon />
      <div style={{ position: "absolute", left: 22, top: 30, width: 190 }}>
        <div style={{ font: "400 17px/1.15 Inter, system-ui", letterSpacing: "-0.03em" }}>
          Introducing Moonlytics<br />
          <span style={{ color: "var(--cu-sub)" }}>Smart insights for every</span> memecoin move.
        </div>
        <div style={{ font: "400 7.5px/1.45 Inter, system-ui", color: "var(--cu-body)", marginTop: 22, width: 150 }}>A new analytics platform that tracks and predicts memecoin markets in real time.</div>
        <div style={{ display: "inline-block", marginTop: 10, padding: "5px 8px", borderRadius: 5, font: "500 7px/1 Inter, system-ui", background: "var(--cu-btn)", boxShadow: "var(--cu-btn-shadow)" }}>Explore Dashboard</div>
      </div>
    </div>
  );
}

function InsightsFace() {
  const bars = [38, 52, 44, 70, 58, 84, 66, 92, 74, 60, 80, 96];
  return (
    <div style={{ ...faceBase, background: "var(--cu-bg-insights)" }}>
      <Glow />
      <div style={{ position: "absolute", left: 22, top: 26, font: "500 7px/1 Inter, system-ui", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cu-label)" }}>Insights</div>
      <div style={{ position: "absolute", left: 22, top: 40, font: "400 15px/1.15 Inter, system-ui", letterSpacing: "-0.03em", width: 170 }}>Know the move before it moves.</div>
      <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, height: 92, display: "flex", alignItems: "flex-end", gap: 5, borderBottom: "1px solid var(--cu-axis)" }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i === 11 ? "linear-gradient(#60a5fa,#2563eb)" : "linear-gradient(rgba(96,165,250,.5), rgba(37,99,235,.15))" }} />
        ))}
      </div>
    </div>
  );
}

function MarketsFace() {
  const rows: [string, string, string, boolean][] = [["PEPE", "$0.0000121", "+18.4%", true], ["BONK", "$0.0000302", "+6.1%", true], ["WIF", "$2.41", "-3.7%", false], ["DOGE", "$0.162", "+2.2%", true]];
  return (
    <div style={{ ...faceBase, background: "var(--cu-bg-markets)" }}>
      <Glow />
      <div style={{ position: "absolute", left: 22, right: 22, top: 26, display: "flex", justifyContent: "space-between", font: "500 7px/1 Inter, system-ui", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cu-label)" }}>
        <span>Trending</span><span style={{ color: "var(--cu-dim)" }}>24h</span>
      </div>
      <div style={{ position: "absolute", left: 22, right: 22, top: 46 }}>
        {rows.map(([t, p, c, up], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderTop: i ? "1px solid var(--cu-rule)" : undefined, font: "500 9px/1 Inter, system-ui" }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: `linear-gradient(135deg, hsl(${210 + i * 24} 80% 62%), hsl(${230 + i * 24} 70% 38%))` }} />
            <span style={{ flex: 1 }}>{t}</span>
            <span style={{ color: "var(--cu-body)", fontVariantNumeric: "tabular-nums" }}>{p}</span>
            <span style={{ width: 44, textAlign: "right", color: up ? "var(--cu-up)" : "var(--cu-down)", fontVariantNumeric: "tabular-nums" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VolumeFace() {
  return (
    <div style={{ ...faceBase, background: "var(--cu-bg-volume)" }}>
      <Glow />
      <div style={{ position: "absolute", left: 22, top: 26, font: "500 7px/1 Inter, system-ui", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cu-label)" }}>Volume tracked</div>
      <div style={{ position: "absolute", left: 22, top: 42, font: "400 36px/1 Inter, system-ui", letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>$2.48B</div>
      <div style={{ position: "absolute", left: 22, top: 84, font: "500 8px/1 Inter, system-ui", color: "var(--cu-up)" }}>+12.6% this week</div>
      <svg viewBox="0 0 300 80" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 90 }}>
        <defs>
          <linearGradient id="cube-vol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b82f6" stopOpacity=".45" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
        </defs>
        <path d="M0 62 C30 58 40 40 70 44 S110 60 140 38 S190 30 210 22 S260 30 300 8 L300 80 L0 80Z" fill="url(#cube-vol)" />
        <path d="M0 62 C30 58 40 40 70 44 S110 60 140 38 S190 30 210 22 S260 30 300 8" fill="none" style={{ stroke: "var(--cu-stroke)" }} strokeWidth="1.6" />
      </svg>
    </div>
  );
}

// The screens' palette: night blue in dark, a daylight version of the same screens in light.
const CSS = `
.cube-root{
  --cu-ink:#e9eefc;--cu-sub:#8ea3c4;--cu-body:#a8b6cc;--cu-label:#7fa2e0;--cu-dim:#5b6b86;
  --cu-up:#4ade80;--cu-down:#f87171;--cu-stroke:#60a5fa;
  --cu-axis:rgba(255,255,255,.1);--cu-rule:rgba(255,255,255,.07);
  --cu-bg:#020718;--cu-bg-markets:#030a1d;
  --cu-bg-insights:radial-gradient(90% 70% at 80% 0%, #0d2a6b, #020718 70%);
  --cu-bg-volume:radial-gradient(80% 90% at 10% 100%, #0b3a8a, #020718 65%);
  --cu-glow:linear-gradient(90deg, rgba(59,130,246,.55), transparent 7%, transparent 93%, rgba(59,130,246,.55)), linear-gradient(180deg, rgba(37,99,235,.7), transparent 9%);
  --cu-halo:radial-gradient(closest-side, rgba(59,130,246,.22), transparent);
  --cu-moon:radial-gradient(circle at 34% 30%, transparent 16%, rgba(2,7,24,.5) 50%, rgba(2,7,24,.92) 72%), radial-gradient(rgba(170,205,255,.95) 0.9px, transparent 1.2px);
  --cu-btn:linear-gradient(#1c2233,#111624);--cu-btn-shadow:inset 0 0 0 .5px rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.4);
  --cu-edge:inset 0 0 0 1px rgba(255,255,255,.08);--cu-shade:#020408;
}
:root[data-theme="light"] .cube-root{
  --cu-ink:oklch(0.22 0.008 264);--cu-sub:oklch(0.53 0.011 264);--cu-body:oklch(0.38 0.009 264);--cu-label:oklch(0.5 0.17 262);--cu-dim:oklch(0.53 0.011 264);
  --cu-up:oklch(0.52 0.15 150);--cu-down:oklch(0.55 0.19 25);--cu-stroke:#3b82f6;
  --cu-axis:oklch(0.22 0.008 264 / .13);--cu-rule:oklch(0.22 0.008 264 / .08);
  --cu-bg:oklch(0.995 0.002 264);--cu-bg-markets:oklch(0.995 0.002 264);
  --cu-bg-insights:radial-gradient(90% 70% at 80% 0%, oklch(0.9 0.05 258), oklch(0.995 0.002 264) 70%);
  --cu-bg-volume:radial-gradient(80% 90% at 10% 100%, oklch(0.88 0.06 258), oklch(0.995 0.002 264) 65%);
  --cu-glow:linear-gradient(90deg, rgba(59,130,246,.2), transparent 7%, transparent 93%, rgba(59,130,246,.2)), linear-gradient(180deg, rgba(37,99,235,.24), transparent 9%);
  --cu-halo:radial-gradient(closest-side, rgba(59,130,246,.16), transparent);
  --cu-moon:radial-gradient(circle at 34% 30%, transparent 16%, oklch(0.995 0.002 264 / .5) 50%, oklch(0.995 0.002 264 / .92) 72%), radial-gradient(rgba(37,99,235,.85) 0.9px, transparent 1.2px);
  --cu-btn:linear-gradient(oklch(1 0 0),oklch(0.975 0.002 264));--cu-btn-shadow:inset 0 0 0 .5px oklch(0.22 0.008 264 / .16), 0 1px 2px oklch(0.22 0.008 264 / .1);
  --cu-edge:inset 0 0 0 1px oklch(0.22 0.008 264 / .12);--cu-shade:oklch(0.62 0.03 262);
}
`;

const FACES: { key: string; node: ReactNode }[] = [
  { key: "hero", node: <HeroFace /> },
  { key: "insights", node: <InsightsFace /> },
  { key: "markets", node: <MarketsFace /> },
  { key: "volume", node: <VolumeFace /> },
];

/* ── the deck ────────────────────────────────────────────────────────── */

export default function Cube({ size = "card" }: { size?: "card" | "big" }) {
  const { ref, s } = useFit(size);
  const reduce = useReducedMotion();
  const pos = useMotionValue(0); // 0 = face 0 square on; 1 = one quarter turn later
  const cubeRef = useRef<HTMLDivElement>(null);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const lastInput = useRef(0);
  const [active, setActive] = useState(0);
  const userDriven = useRef(false); // the current motion comes from the user, not the idle timer
  const rollKey = useRef<number | null>(null); // the quarter turn we already played a roll for

  const paint = (p: number) => {
    const base = Math.floor(p);
    const f = p - base;
    if (f < 1e-3 || f > 1 - 1e-3) rollKey.current = null; // square on: the next turn may sound
    else if (!userDriven.current) rollKey.current = base; // the auto-play owns this turn: grabbing it mid-way stays quiet
    else if (rollKey.current !== base) { rollKey.current = base; play("roll", { gap: 200 }); }
    const turn = HINGE * 90 * (base + (reduce ? Math.round(f) : easeInOut(f)));
    const z = -D * (1 + (reduce ? 0 : LIFT * Math.sin(Math.PI * f)));
    if (cubeRef.current) cubeRef.current.style.transform = `translateZ(${z.toFixed(2)}px) rotateX(${turn.toFixed(3)}deg)`;
    // each face darkens as it turns away from the camera
    shadeRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = ((turn - HINGE * 90 * i) * Math.PI) / 180;
      el.style.opacity = (Math.min(1, 1 - Math.cos(a)) * 0.85).toFixed(3);
    });
    const idx = ((Math.round(p) % N) + N) % N;
    setActive((a) => (a === idx ? a : idx));
  };
  useMotionValueEvent(pos, "change", paint);
  useLayoutEffect(() => paint(pos.get()), []); // eslint-disable-line react-hooks/exhaustive-deps

  // A quarter turn takes ~1s; scrubbed by the eased map, so the tween itself is linear.
  const go = (target: number) => {
    anim.current?.stop();
    const dist = Math.abs(target - pos.get());
    if (reduce || dist < 1e-3) { pos.set(target); return; }
    anim.current = animate(pos, target, { duration: Math.max(0.28, 1.05 * dist), ease: "linear" });
  };

  // Idle: roll on by one every few seconds.
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastInput.current < 3200 || drag.current) return;
      userDriven.current = false;
      go(Math.round(pos.get()) + 1);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drag: the face follows the pointer, a face height per quarter turn.
  const drag = useRef<{ y: number; p: number; moved: boolean; t: number; v: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    anim.current?.stop();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, p: pos.get(), moved: false, t: performance.now(), v: 0 };
    userDriven.current = true;
    lastInput.current = Date.now();
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    const next = d.p + dy / (FH * s * 0.8);
    const now = performance.now();
    d.v = (next - pos.get()) / Math.max(1, now - d.t);
    d.t = now;
    pos.set(next);
    lastInput.current = Date.now();
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    lastInput.current = Date.now();
    if (!d) return;
    if (!d.moved) { go(Math.round(pos.get()) + 1); return; } // click: next face
    const p = pos.get();
    const fling = d.v * 220; // a quick flick carries to the next face
    go(Math.round(p + Math.max(-0.6, Math.min(0.6, fling))));
  };

  // Wheel over the card scrubs like the page scroll did, then settles.
  const wheelWrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wheelWrap.current;
    if (!el) return;
    let t = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      anim.current?.stop();
      lastInput.current = Date.now();
      userDriven.current = true;
      if (reduce) {
        window.clearTimeout(t);
        t = window.setTimeout(() => go(Math.round(pos.get()) + Math.sign(e.deltaY)), 60);
        return;
      }
      pos.set(pos.get() + e.deltaY / (FH * s * 0.9));
      window.clearTimeout(t);
      t = window.setTimeout(() => go(Math.round(pos.get())), 160);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); window.clearTimeout(t); };
  }, [s, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const W = FW * s, H = FH * s;
  return (
    <div ref={ref} className="cube-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <style>{`.cube-dot{background:rgba(255,255,255,.16)}:root[data-theme="light"] .cube-dot{background:oklch(0.22 0.008 264 / .2)}`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * Math.max(0.8, s), transform: size === "card" ? "translateY(2px)" : undefined }}>
        <div style={{ width: 8 }} />
        <div
          ref={wheelWrap}
          data-own-click
          role="button"
          tabIndex={0}
          aria-label="Cube of four screens. Drag up or down, scroll, or press to roll it."
          onKeyDown={(e) => {
            userDriven.current = true;
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); lastInput.current = Date.now(); go(Math.round(pos.get()) + 1); }
            if (e.key === "ArrowUp") { e.preventDefault(); lastInput.current = Date.now(); go(Math.round(pos.get()) - 1); }
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ pointerEvents: "auto", width: W, height: H, position: "relative", cursor: "grab", touchAction: "none", outline: "none", perspective: `${W}px`, perspectiveOrigin: "50% 50%", userSelect: "none" }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: FW, height: FH, transform: `scale(${s})`, transformOrigin: "0 0", transformStyle: "preserve-3d" }}>
            <div ref={cubeRef} style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transformOrigin: "50% 50%", willChange: "transform" }}>
              {FACES.map((f, i) => (
                <div
                  key={f.key}
                  style={{
                    position: "absolute", inset: 0, borderRadius: 6, overflow: "hidden",
                    transform: `rotateX(${-HINGE * 90 * i}deg) translateZ(${D + i * 0.5}px)`,
                    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                    boxShadow: "var(--cu-edge)",
                  }}
                >
                  {f.node}
                  <div ref={(el) => { shadeRefs.current[i] = el; }} style={{ position: "absolute", inset: 0, background: "var(--cu-shade)", opacity: i ? 1 : 0, pointerEvents: "none" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* which face is square to the camera */}
        <div aria-hidden style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FACES.map((f, i) => (
            <span key={f.key} className="cube-dot" style={{ width: 4, height: i === active ? 16 : 4, borderRadius: 2, background: i === active ? "#34b562" : undefined, transition: "height 300ms cubic-bezier(.2,.8,.2,1), background 300ms" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
