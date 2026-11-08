// Cube deck: four Moonlytics screens are the faces of one cube. Drag (or
// wheel) to roll it a quarter turn, hinged on the shared edge, the cube pulling
// back to 1.6x depth at mid-fold on a half-sine and the turn eased in and out,
// exactly as CubeDeck.tsx does with page scroll. Idle, it rolls on its own.
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

const ink = "#e9eefc";
const faceBase: CSSProperties = { position: "absolute", inset: 0, overflow: "hidden", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", color: ink, background: "#020718" };

function Glow() {
  // the blue light frame the Moonlytics stage sits in
  return <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(59,130,246,.55), transparent 7%, transparent 93%, rgba(59,130,246,.55)), linear-gradient(180deg, rgba(37,99,235,.7), transparent 9%)", pointerEvents: "none" }} />;
}

function Moon() {
  // a dotted moon: a dot grid cut to a sphere, lit from the upper left
  const m = "radial-gradient(circle at 50% 50%, #000 49.5%, transparent 50.5%)";
  return (
    <div style={{ position: "absolute", right: 22, top: 40, width: 118, height: 118 }}>
      <div style={{ position: "absolute", inset: -30, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(59,130,246,.22), transparent)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 34% 30%, transparent 16%, rgba(2,7,24,.5) 50%, rgba(2,7,24,.92) 72%), radial-gradient(rgba(170,205,255,.95) 0.9px, transparent 1.2px)", backgroundSize: "100% 100%, 4px 4px", WebkitMaskImage: m, maskImage: m }} />
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
          <span style={{ color: "#8ea3c4" }}>Smart insights for every</span> memecoin move.
        </div>
        <div style={{ font: "400 7.5px/1.45 Inter, system-ui", color: "#a8b6cc", marginTop: 22, width: 150 }}>A new analytics platform that tracks and predicts memecoin markets in real time.</div>
        <div style={{ display: "inline-block", marginTop: 10, padding: "5px 8px", borderRadius: 5, font: "500 7px/1 Inter, system-ui", background: "linear-gradient(#1c2233,#111624)", boxShadow: "inset 0 0 0 .5px rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.4)" }}>Explore Dashboard</div>
      </div>
    </div>
  );
}

function InsightsFace() {
  const bars = [38, 52, 44, 70, 58, 84, 66, 92, 74, 60, 80, 96];
  return (
    <div style={{ ...faceBase, background: "radial-gradient(90% 70% at 80% 0%, #0d2a6b, #020718 70%)" }}>
      <Glow />
      <div style={{ position: "absolute", left: 22, top: 26, font: "500 7px/1 Inter, system-ui", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7fa2e0" }}>Insights</div>
      <div style={{ position: "absolute", left: 22, top: 40, font: "400 15px/1.15 Inter, system-ui", letterSpacing: "-0.03em", width: 170 }}>Know the move before it moves.</div>
      <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, height: 92, display: "flex", alignItems: "flex-end", gap: 5, borderBottom: "1px solid rgba(255,255,255,.1)" }}>
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
    <div style={{ ...faceBase, background: "#030a1d" }}>
      <Glow />
      <div style={{ position: "absolute", left: 22, right: 22, top: 26, display: "flex", justifyContent: "space-between", font: "500 7px/1 Inter, system-ui", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7fa2e0" }}>
        <span>Trending</span><span style={{ color: "#5b6b86" }}>24h</span>
      </div>
      <div style={{ position: "absolute", left: 22, right: 22, top: 46 }}>
        {rows.map(([t, p, c, up], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderTop: i ? "1px solid rgba(255,255,255,.07)" : undefined, font: "500 9px/1 Inter, system-ui" }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: `linear-gradient(135deg, hsl(${210 + i * 24} 80% 62%), hsl(${230 + i * 24} 70% 38%))` }} />
            <span style={{ flex: 1 }}>{t}</span>
            <span style={{ color: "#a8b6cc", fontVariantNumeric: "tabular-nums" }}>{p}</span>
            <span style={{ width: 44, textAlign: "right", color: up ? "#4ade80" : "#f87171", fontVariantNumeric: "tabular-nums" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VolumeFace() {
  return (
    <div style={{ ...faceBase, background: "radial-gradient(80% 90% at 10% 100%, #0b3a8a, #020718 65%)" }}>
      <Glow />
      <div style={{ position: "absolute", left: 22, top: 26, font: "500 7px/1 Inter, system-ui", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7fa2e0" }}>Volume tracked</div>
      <div style={{ position: "absolute", left: 22, top: 42, font: "400 36px/1 Inter, system-ui", letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>$2.48B</div>
      <div style={{ position: "absolute", left: 22, top: 84, font: "500 8px/1 Inter, system-ui", color: "#4ade80" }}>+12.6% this week</div>
      <svg viewBox="0 0 300 80" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 90 }}>
        <defs>
          <linearGradient id="cube-vol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b82f6" stopOpacity=".45" /><stop offset="1" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
        </defs>
        <path d="M0 62 C30 58 40 40 70 44 S110 60 140 38 S190 30 210 22 S260 30 300 8 L300 80 L0 80Z" fill="url(#cube-vol)" />
        <path d="M0 62 C30 58 40 40 70 44 S110 60 140 38 S190 30 210 22 S260 30 300 8" fill="none" stroke="#60a5fa" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

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

  const paint = (p: number) => {
    const base = Math.floor(p);
    const f = p - base;
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
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * Math.max(0.8, s), transform: size === "card" ? "translateY(2px)" : undefined }}>
        <div style={{ width: 8 }} />
        <div
          ref={wheelWrap}
          data-own-click
          role="button"
          tabIndex={0}
          aria-label="Cube of four screens. Drag up or down, scroll, or press to roll it."
          onKeyDown={(e) => {
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
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
                  }}
                >
                  {f.node}
                  <div ref={(el) => { shadeRefs.current[i] = el; }} style={{ position: "absolute", inset: 0, background: "#020408", opacity: i ? 1 : 0, pointerEvents: "none" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* which face is square to the camera */}
        <div aria-hidden style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FACES.map((f, i) => (
            <span key={f.key} style={{ width: 4, height: i === active ? 16 : 4, borderRadius: 2, background: i === active ? "#34b562" : "rgba(255,255,255,.16)", transition: "height 300ms cubic-bezier(.2,.8,.2,1), background 300ms" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
