/* Glass toggle: a pill with a soft grey rim and a big frosted glass thumb. Dark theme: a near
 * black well in a graphite rim. Light theme: a pale grey well in a brushed aluminium rim.
 * Behind the glass sits an orange light, a glowing disc with a warm band trailing it, and the
 * glass blurs it into a soft orange wash. On: the thumb rests right, "ON" shows on the left and
 * the light burns. Off: the thumb slides left, the light dims out and "OFF" shows on the right.
 * The thumb carries a 3 x 5 grid of raised dots and a striped, sunken circle.
 *
 * Motion: one spring drives the throw (slight overshoot); the thumb stretches along the travel
 * with its speed and flattens a touch while pressed. Layered HTML so backdrop-filter can frost
 * the glow underneath. */
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { play } from "../sound/sound";

/* design units (px at scale 1) */
const TW = 566, TH = 164; // track
const KW = 340, KH = 184; // thumb, taller than the track
const PAD = 12; // stage padding around the track
const SW = TW + PAD * 2, SH = KH + PAD * 2;
const X_OFF = -6, X_ON = TW - KW + 6; // thumb left edge, relative to the track
const DOT_COLS = [48, 74, 100, 126, 152], DOT_ROWS = [66, 92, 118];

export function GlassToggle({ on, onToggle, scale = 1 }: { on: boolean; onToggle: () => void; scale?: number }) {
  const reduced = useReducedMotion();
  const p = useSpring(on ? 1 : 0, { stiffness: 260, damping: 19, mass: 1 });
  useEffect(() => { if (reduced) p.jump(on ? 1 : 0); else p.set(on ? 1 : 0); }, [on, p, reduced]);
  const [pressed, setPressed] = useState(false);

  const x = useTransform(p, (v) => X_OFF + (X_ON - X_OFF) * v);
  const vel = useVelocity(p);
  const stretch = useTransform(vel, (v) => Math.min(0.07, Math.abs(v) * 0.012));
  const sx = useTransform(stretch, (s) => 1 + s + (pressed ? 0.025 : 0));
  const sy = useTransform(stretch, (s) => 1 - s * 0.8 - (pressed ? 0.035 : 0));
  const lit = useTransform(p, (v) => Math.min(1, Math.max(0, v)));
  const lit2 = useTransform(lit, (v) => v * v);
  const onLabel = useTransform(p, (v) => Math.min(1, Math.max(0, (v - 0.35) / 0.65)));
  const offLabel = useTransform(p, (v) => Math.min(1, Math.max(0, (0.65 - v) / 0.65)));
  const dim = useTransform(lit, (v) => 1 - v);

  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Glow" className="gt-root"
      onClick={onToggle}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
      style={{ width: SW * scale, height: SH * scale, padding: 0, border: 0, background: "none", cursor: "pointer", position: "relative", borderRadius: (SH * scale) / 2, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
      <style>{`
        .gt-root{outline:none;
          --gt-rim:linear-gradient(180deg,#5b5c5f 0%,#3a3b3e 38%,#2b2c2e 70%,#46474a 100%);
          --gt-rim-shadow:0 18px 40px -18px rgba(0,0,0,.9);
          --gt-rim-sheen:linear-gradient(90deg,rgba(255,255,255,.14),rgba(255,255,255,0) 30%);
          --gt-well:linear-gradient(180deg,#0b0b0c 0%,#121213 60%,#18181a 100%);
          --gt-well-shadow:inset 0 3px 8px rgba(0,0,0,.9), inset 0 -1px 0 rgba(255,255,255,.06), 0 0 0 1px rgba(0,0,0,.55);
          --gt-on:#d4d4d6;--gt-on-fill:linear-gradient(180deg,#f0f0f2,#b9babd);
          --gt-off:#6d6e71;--gt-off-fill:linear-gradient(180deg,#8a8b8e,#5c5d60);
          --gt-glass:linear-gradient(90deg,rgba(255,255,255,.12) 0%,rgba(255,240,238,.28) 60%,rgba(255,245,245,.36) 100%),linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,0) 50%,rgba(255,255,255,.08));
          --gt-glass-shadow:inset 0 0 0 1.5px rgba(255,255,255,.55),inset 0 0 0 9px rgba(255,255,255,.13),inset 0 3px 2px rgba(255,255,255,.55),inset -3px 0 3px rgba(255,255,255,.35),inset 0 -6px 14px rgba(0,0,0,.18),0 14px 30px -10px rgba(0,0,0,.65),0 2px 4px rgba(0,0,0,.35);
          --gt-glass-off:linear-gradient(180deg,rgba(170,172,178,.26),rgba(120,122,128,.22));
          --gt-disc:repeating-linear-gradient(135deg,rgba(255,255,255,.16) 0 3px,rgba(255,255,255,0) 3px 9px),linear-gradient(160deg,rgba(246,226,224,.62),rgba(226,204,204,.5));
          --gt-disc-shadow:inset 0 3px 6px rgba(0,0,0,.18), inset 0 -2px 2px rgba(255,255,255,.4), 0 0 0 1px rgba(255,255,255,.28), 0 1px 0 rgba(255,255,255,.35);
        }
        :root[data-theme="light"] .gt-root{
          --gt-rim:linear-gradient(180deg,oklch(0.995 0.001 264) 0%,oklch(0.95 0.003 264) 38%,oklch(0.915 0.004 264) 70%,oklch(0.965 0.003 264) 100%);
          --gt-rim-shadow:0 0 0 1px oklch(0.22 0.008 264 / .1),0 2px 4px oklch(0.22 0.008 264 / .06),0 18px 34px -18px oklch(0.22 0.008 264 / .3);
          --gt-rim-sheen:linear-gradient(90deg,oklch(1 0 0 / .9),oklch(1 0 0 / 0) 30%);
          --gt-well:linear-gradient(180deg,oklch(0.9 0.005 264) 0%,oklch(0.93 0.004 264) 60%,oklch(0.955 0.003 264) 100%);
          --gt-well-shadow:inset 0 3px 8px oklch(0.22 0.008 264 / .16), inset 0 -1px 0 oklch(1 0 0 / .8), 0 0 0 1px oklch(0.22 0.008 264 / .1);
          --gt-on:oklch(0.3 0.008 264);--gt-on-fill:linear-gradient(180deg,oklch(0.4 0.009 264),oklch(0.22 0.008 264));
          --gt-off:oklch(0.6 0.01 264);--gt-off-fill:linear-gradient(180deg,oklch(0.66 0.009 264),oklch(0.53 0.011 264));
          --gt-glass:linear-gradient(90deg,oklch(1 0 0 / .3) 0%,oklch(1 0 0 / .5) 60%,oklch(1 0 0 / .62) 100%),linear-gradient(180deg,oklch(1 0 0 / .35),oklch(1 0 0 / 0) 50%,oklch(1 0 0 / .15));
          --gt-glass-shadow:inset 0 0 0 1.5px oklch(1 0 0 / .85),inset 0 0 0 9px oklch(1 0 0 / .28),inset 0 3px 2px oklch(1 0 0 / .9),inset -3px 0 3px oklch(1 0 0 / .5),inset 0 -6px 14px oklch(0.22 0.008 264 / .07),0 0 0 1px oklch(0.22 0.008 264 / .1),0 14px 28px -12px oklch(0.22 0.008 264 / .3),0 2px 4px oklch(0.22 0.008 264 / .1);
          --gt-glass-off:linear-gradient(180deg,oklch(0.97 0.003 264 / .5),oklch(0.9 0.005 264 / .4));
          --gt-disc:repeating-linear-gradient(135deg,oklch(1 0 0 / .55) 0 3px,oklch(1 0 0 / 0) 3px 9px),linear-gradient(160deg,oklch(0.96 0.006 30 / .7),oklch(0.9 0.008 30 / .6));
          --gt-disc-shadow:inset 0 3px 6px oklch(0.22 0.008 264 / .12), inset 0 -2px 2px oklch(1 0 0 / .7), 0 0 0 1px oklch(1 0 0 / .6), 0 1px 0 oklch(1 0 0 / .7);
        }
        .gt-root:focus-visible .gt-track{box-shadow:0 0 0 4px var(--k-card),0 0 0 7px rgba(255,140,60,.85),var(--gt-rim-shadow)}
        @font-face{font-family:gtInter;src:local("Inter"),local("SF Pro Display"),local("Helvetica Neue")}
      `}</style>
      <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {/* the track: soft grey rim around a sunken well */}
        <div className="gt-track" style={{
          position: "absolute", left: PAD, top: (SH - TH) / 2, width: TW, height: TH, borderRadius: TH / 2,
          background: "var(--gt-rim)",
          boxShadow: "var(--gt-rim-shadow)",
        }}>
          <div style={{ position: "absolute", inset: 1, borderRadius: TH / 2, background: "var(--gt-rim-sheen)", filter: "blur(1px)" }} />
          <div style={{
            position: "absolute", inset: 13, borderRadius: TH / 2, overflow: "hidden",
            background: "var(--gt-well)",
            boxShadow: "var(--gt-well-shadow)",
          }}>
            {/* warm band trailing the disc, inside the well */}
            <motion.div style={{
              position: "absolute", top: -6, bottom: -6, width: 170, x: useTransform(x, (v) => v - 120), opacity: lit,
              background: "linear-gradient(90deg,rgba(255,110,20,0) 0%,rgba(255,105,20,.45) 55%,rgba(255,118,24,.95) 100%)",
              filter: "blur(10px)",
            }} />
            {/* labels */}
            <motion.span style={{ ...label, left: 0, width: 200, opacity: onLabel }}>ON</motion.span>
            <motion.span style={{ ...label, right: 0, width: 200, opacity: offLabel, color: "var(--gt-off)", backgroundImage: "var(--gt-off-fill)" }}>OFF</motion.span>
          </div>
        </div>

        {/* the light: a glowing disc that leads the thumb, plus a wide halo */}
        <motion.div style={{ position: "absolute", left: PAD, top: SH / 2, x, opacity: lit, pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: -70, top: -150, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,110,30,.2),rgba(255,100,20,.06) 55%,rgba(255,90,10,0))", filter: "blur(6px)" }} />
          <div style={{ position: "absolute", left: -36, top: -68, width: 136, height: 136, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%,#ffb062 0%,#ff8a1e 38%,#ff6a08 72%,#f45400 100%)", boxShadow: "0 0 22px 4px rgba(255,110,20,.5), 0 0 50px 10px rgba(255,90,10,.18)" }} />
          <div style={{ position: "absolute", left: 30, top: -70, width: 200, height: 140, borderRadius: 70, background: "radial-gradient(closest-side,rgba(255,92,30,.95),rgba(255,85,30,.5) 60%,rgba(255,90,20,0))", filter: "blur(8px)" }} />
        </motion.div>

        {/* the glass thumb */}
        <motion.div style={{
          position: "absolute", left: PAD, top: (SH - KH) / 2, width: KW, height: KH, borderRadius: KH / 2,
          x, scaleX: sx, scaleY: sy, transformOrigin: "50% 50%",
          backdropFilter: "blur(14px) saturate(1.25)", WebkitBackdropFilter: "blur(14px) saturate(1.25)",
          background: "var(--gt-glass)",
          boxShadow: "var(--gt-glass-shadow)",
          pointerEvents: "none",
        }}>
          {/* neutral grey of the glass when the light is out */}
          <motion.div style={{ position: "absolute", inset: 0, borderRadius: KH / 2, background: "var(--gt-glass-off)", opacity: dim }} />
          {/* inner rim: a soft second ring a little in from the edge */}
          <div style={{ position: "absolute", inset: 9, borderRadius: KH / 2, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18), 0 0 0 1px rgba(0,0,0,.04)" }} />
          {/* raised dots */}
          {DOT_ROWS.map((cy) => DOT_COLS.map((cx) => (
            <span key={`${cx}-${cy}`} style={{
              position: "absolute", left: cx - 6.5, top: cy - 6.5, width: 13, height: 13, borderRadius: "50%",
              background: "radial-gradient(circle at 40% 32%,rgba(255,255,255,.75),rgba(255,236,220,.32) 55%,rgba(255,220,200,.18))",
              boxShadow: "0 1.5px 1.5px rgba(70,20,0,.35), inset 0 -1px 1px rgba(120,40,0,.18), inset 0 1px 0 rgba(255,255,255,.6)",
            }} />
          )))}
          {/* the striped, sunken circle */}
          <div style={{
            position: "absolute", left: 250 - 68, top: KH / 2 - 68, width: 136, height: 136, borderRadius: "50%",
            background: "var(--gt-disc)",
            boxShadow: "var(--gt-disc-shadow)",
          }} />
          {/* specular sweep along the top of the glass */}
          <div style={{ position: "absolute", left: 30, right: 30, top: 4, height: 30, borderRadius: "50%", background: "linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0))", filter: "blur(2px)" }} />
        </motion.div>
        {/* glow tint on the thumb itself, so the left half reads warm even through the blur */}
        <motion.div style={{ position: "absolute", left: PAD, top: (SH - KH) / 2, width: KW, height: KH, borderRadius: KH / 2, x, scaleX: sx, scaleY: sy, opacity: lit2, pointerEvents: "none", 
          background: "linear-gradient(90deg,rgba(255,92,40,.5) 0%,rgba(250,100,60,.34) 38%,rgba(240,130,110,.12) 62%,rgba(240,150,140,0) 80%)" }} />
      </div>
    </button>
  );
}

const label: React.CSSProperties = {
  position: "absolute", top: 0, bottom: 0, display: "grid", placeItems: "center",
  font: "600 44px/1 gtInter, Inter, system-ui, sans-serif", letterSpacing: "-0.01em",
  color: "var(--gt-on)", backgroundImage: "var(--gt-on-fill)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
  pointerEvents: "none", userSelect: "none",
};

/** the block: one glass toggle, scaled to the tile, with a sound on each flip */
export default function GlassToggleBlock({ size = "card" }: { size?: "card" | "big" }) {
  const [on, setOn] = useState(true);
  return (
    <div data-own-click style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <GlassToggle on={on} scale={size === "big" ? 1.45 : 0.6} onToggle={() => { play(on ? "off" : "on"); setOn(!on); }} />
    </div>
  );
}
