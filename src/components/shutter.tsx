// Shutter: the curved shutter wipe. The next screen sweeps over the current
// one behind an elliptical edge cut into the hero's 24 slat columns (each
// column's travel offset by the ellipse's sagitta, BULGE 0.34), so the curve
// breaks into shutter steps. Moonlytics hero → wordmark (per-letter build) →
// cards, the cards leg peeling off top-down the way the reveal mode does.
// Auto-plays; drag or wheel over it to scrub, press to step.
// Sound: one whoosh as each wipe starts under the user's drag, wheel, press or
// key (never on the auto-play).
import { play } from "../sound/sound";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

const SW = 384; // screen width (design px), 1440x1024 artboard ratio-ish
const SH = 252;
const COLS = 24;
const BULGE = 0.34;
const N = 3;

const clamp = (n: number, a = 0, b = 1) => (n < a ? a : n > b ? b : n);
const mapRange = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const ellipse = (t: number) => Math.sqrt(Math.max(0, 1 - t * t));

type Mode = "cover" | "reveal";
function colScale(i: number, p: number, mode: Mode) {
  const t = ((i + 0.5) / COLS) * 2 - 1;
  const lead = ellipse(t);
  if (mode === "cover") return clamp(p * (1 + BULGE) - BULGE * (1 - lead));
  return 1 - clamp(p * (1 + BULGE) - BULGE * lead);
}
// The panel's silhouette: union of the 24 columns at progress p.
function clipPath(p: number, mode: Mode) {
  const x = (i: number) => ((i / COLS) * 100).toFixed(3) + "%";
  const pts: string[] = [];
  if (mode === "reveal") {
    pts.push("0% 0%");
    for (let i = 0; i < COLS; i++) { const y = (colScale(i, p, "reveal") * 100).toFixed(3) + "%"; pts.push(`${x(i)} ${y}`, `${x(i + 1)} ${y}`); }
    pts.push("100% 0%");
  } else {
    pts.push("0% 100%");
    for (let i = 0; i < COLS; i++) { const y = ((1 - colScale(i, p, "cover")) * 100).toFixed(3) + "%"; pts.push(`${x(i)} ${y}`, `${x(i + 1)} ${y}`); }
    pts.push("100% 100%");
  }
  return `polygon(${pts.join(",")})`;
}

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const clear = size === "big" ? 150 : h >= 300 ? 118 : 30;
      setS(Math.min((w - 110) / SW, (h - clear) / SH, size === "big" ? 1.9 : 1.15));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return { ref, s };
}

/* ── screens ─────────────────────────────────────────────────────────── */

const font = "Inter, ui-sans-serif, system-ui, sans-serif";
const fill: CSSProperties = { position: "absolute", inset: 0, overflow: "hidden", fontFamily: font };
const SLAT = "linear-gradient(to left, rgba(248,247,248,0.10) 0%, rgba(248,247,248,0) 100%)";
const HERO_BG = "linear-gradient(180deg, #e3f5fb 0%, #a9dbf8 16%, #5aa9f3 40%, #2a7ff0 68%, #1a68e6 100%)";

function Slats() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      {Array.from({ length: COLS }, (_, i) => <div key={i} style={{ flex: 1, background: SLAT }} />)}
    </div>
  );
}

function Sparks() {
  // the edge glow and the scatter of sparkles low on both sides
  const dots = "radial-gradient(1px 1px at 12% 70%, #fff, transparent), radial-gradient(1px 1px at 7% 82%, #fff, transparent), radial-gradient(1.4px 1.4px at 16% 90%, #fff, transparent), radial-gradient(1px 1px at 4% 64%, #fff, transparent), radial-gradient(1px 1px at 20% 78%, #fff, transparent), radial-gradient(1px 1px at 88% 72%, #fff, transparent), radial-gradient(1.4px 1.4px at 93% 84%, #fff, transparent), radial-gradient(1px 1px at 84% 92%, #fff, transparent), radial-gradient(1px 1px at 96% 66%, #fff, transparent), radial-gradient(1px 1px at 80% 81%, #fff, transparent)";
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(30% 45% at 0% 78%, rgba(160,240,255,.75), transparent 70%), radial-gradient(30% 45% at 100% 78%, rgba(160,240,255,.75), transparent 70%)", mixBlendMode: "plus-lighter" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: dots, opacity: 0.9 }} />
    </>
  );
}

function Phone() {
  return (
    <div style={{ position: "absolute", left: "50%", top: 136, width: 128, height: 150, marginLeft: -64, borderRadius: "22px 22px 0 0", background: "#2b2530", padding: 3, boxSizing: "border-box", boxShadow: "0 10px 30px rgba(8,30,90,.35)" }}>
      <div style={{ position: "absolute", inset: 3, borderRadius: "19px 19px 0 0", background: "#121214", overflow: "hidden", color: "#f2f2f4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px 0", font: `600 7px/1 ${font}` }}>
          <span>9:41</span>
          <span style={{ width: 36, height: 10, borderRadius: 6, background: "#000" }} />
          <span style={{ display: "flex", gap: 2 }}><i style={{ width: 8, height: 4, borderRadius: 1, background: "#f2f2f4" }} /></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 10px 0", font: `600 7.5px/1 ${font}` }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: "#2c2c30" }} /> Withdraw <span style={{ marginLeft: "auto", opacity: 0.7 }}>×</span>
        </div>
        <div style={{ margin: "9px 8px 0", padding: 6, borderRadius: 7, background: "#1b1b1e", boxShadow: "inset 0 0 0 .5px rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", font: `500 5.5px/1 ${font}`, color: "#a6a6ad" }}><span>Amount</span><span>$2000</span></div>
          <div style={{ marginTop: 5, padding: "6px 5px", borderRadius: 5, background: "#222226", display: "flex", justifyContent: "space-between", font: `500 6px/1 ${font}`, color: "#8d8d94" }}>
            <span>Enter amount</span><span style={{ color: "#f2f2f4" }}>USDC</span>
          </div>
        </div>
        <div style={{ margin: "6px 8px 0", padding: 6, borderRadius: 7, background: "#1b1b1e", display: "flex", alignItems: "center", gap: 5, font: `600 6px/1.2 ${font}` }}>
          <span style={{ width: 13, height: 13, borderRadius: 3, background: "#e8590c" }} />
          <span>Gt Bank<br /><span style={{ fontWeight: 500, color: "#a6a6ad" }}>01928777474</span></span>
          <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: 2, background: "#3b82f6" }} />
        </div>
      </div>
    </div>
  );
}

function HeroScreen() {
  return (
    <div style={{ ...fill, background: HERO_BG }}>
      <Slats />
      <Sparks />
      <div style={{ position: "absolute", left: 0, right: 0, top: 46, textAlign: "center", color: "#fff", font: `500 21px/1.06 ${font}`, letterSpacing: "-0.05em" }}>
        As Simple as sending a<br />quick text message.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 100, textAlign: "center", color: "rgba(255,255,255,.85)", font: `400 6.5px/1.45 ${font}` }}>
        So easy you don't even need an app. Send and receive money<br />like it was a text, free and fast.
      </div>
      <Phone />
    </div>
  );
}

const WORD = "Moonlytics";
function WordmarkScreen({ wm }: { wm: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div style={{ ...fill, background: "radial-gradient(70% 60% at 50% 110%, rgba(42,127,240,.35), transparent 70%), #0a1222" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div ref={wm} aria-label={WORD} style={{ font: `500 50px/1.2 ${font}`, letterSpacing: "-0.06em", color: "#d6e7ff", whiteSpace: "nowrap" }}>
          {WORD.split("").map((c, i) => <span key={i} aria-hidden data-wm-char style={{ display: "inline-block" }}>{c}</span>)}
        </div>
      </div>
    </div>
  );
}

function CardsScreen() {
  const cards: [string, string, number, number][] = [["Send", "To any phone number", -7, 10], ["Receive", "Straight to your wallet", 0, 0], ["Save", "Earn while you hold", 7, 10]];
  return (
    <div style={{ ...fill, background: "linear-gradient(0deg, #e3f5fb 0%, #a9dbf8 12%, #5aa9f3 34%, #2a7ff0 62%, #1550c8 100%)" }}>
      <Slats />
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", color: "#fff", font: `500 17px/1.1 ${font}`, letterSpacing: "-0.045em" }}>Get more with Moonlytics</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 78, display: "flex", justifyContent: "center", gap: 12 }}>
        {cards.map(([t, sub, r, y], i) => (
          <div key={t} style={{ width: 96, height: 124, transform: `translateY(${y}px) rotate(${r}deg)`, borderRadius: 9, boxShadow: "inset 0 0 0 .5px rgba(234,236,240,.32), 0 12px 26px rgba(10,40,120,.25)", background: "linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,.06))", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px 0", boxSizing: "border-box", color: "#fff" }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 1px 2px rgba(10,13,20,.06)" }}>
              <div style={{ width: 16, height: 16, borderRadius: i === 1 ? 8 : 4, background: "linear-gradient(135deg,#4f8ff7,#1d4ed8)", transform: i === 0 ? "rotate(45deg)" : undefined }} />
            </div>
            <div style={{ marginTop: 14, font: `600 9px/1 ${font}` }}>{t}</div>
            <div style={{ marginTop: 5, font: `400 6px/1.3 ${font}`, color: "rgba(255,255,255,.8)", textAlign: "center" }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── the wipe ────────────────────────────────────────────────────────── */

export default function Shutter({ size = "card" }: { size?: "card" | "big" }) {
  const { ref, s } = useFit(size);
  const reduce = useReducedMotion();
  const pos = useMotionValue(0); // integer = resting on screen pos%3; fraction = mid-wipe to the next
  const scr = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const wm = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const lastInput = useRef(0);
  const [active, setActive] = useState(0);
  const userDriven = useRef(false); // the current wipe comes from the user, not the auto-play
  const wipeKey = useRef<number | null>(null); // the wipe we already played a whoosh for

  const letters = (build: number, exit: number) => {
    const el = wm.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>("[data-wm-char]");
    const n = chars.length;
    for (let i = 0; i < n; i++) {
      const b = smooth(mapRange(build, 0.15 + (i / n) * 0.45, 0.55 + (i / n) * 0.45));
      const e = smooth(mapRange(exit, (i / n) * 0.25, 0.7 + (i / n) * 0.3));
      const o = b * (1 - e);
      const y = (1 - b) * 0.45 - e * 0.9;
      const blur = (1 - b) * 7 + e * 4;
      chars[i].style.opacity = o.toFixed(3);
      chars[i].style.transform = `translate3d(0, ${y.toFixed(3)}em, 0)`;
      chars[i].style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "";
    }
  };

  const paint = (p: number) => {
    const base = Math.floor(p);
    const k = ((base % N) + N) % N;
    const f = p - base;
    if (f < 1e-3 || f > 1 - 1e-3) wipeKey.current = null; // at rest: the next wipe may sound
    else if (!userDriven.current) wipeKey.current = base; // the auto-play owns this turn: grabbing it mid-way stays quiet
    else if (wipeKey.current !== base) { wipeKey.current = base; play("whoosh", { gap: 250 }); }
    const next = (k + 1) % N;
    const mode: Mode = k === 1 ? "reveal" : "cover"; // the wordmark frame peels off top-down onto the cards
    const top = mode === "cover" ? next : k;
    const under = mode === "cover" ? k : next;
    scr.forEach((r, i) => {
      const el = r.current;
      if (!el) return;
      if (i === top) { el.style.visibility = "visible"; el.style.zIndex = "2"; el.style.clipPath = clipPath(f, mode); }
      else if (i === under) { el.style.visibility = "visible"; el.style.zIndex = "1"; el.style.clipPath = "none"; }
      else el.style.visibility = "hidden";
    });
    // wordmark surfs in on its panel, then the letters rise out as it leaves
    if (wm.current) {
      if (k === 0) {
        const t = smooth(mapRange(f, 0.3, 0.92));
        wm.current.style.transform = `translate3d(0, ${((1 - t) * SH * 0.4).toFixed(2)}px, 0)`;
        letters(t, 0);
      } else if (k === 1) {
        wm.current.style.transform = "none";
        letters(1, f);
      } else letters(0, 0);
    }
    const idx = ((Math.round(p) % N) + N) % N;
    setActive((a) => (a === idx ? a : idx));
  };
  useMotionValueEvent(pos, "change", paint);
  useLayoutEffect(() => paint(pos.get()), []); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (target: number, auto = false) => {
    anim.current?.stop();
    if (auto) userDriven.current = false;
    const dist = Math.abs(target - pos.get());
    if (reduce || dist < 1e-3) { pos.set(target); return; }
    // The columns shape their own easing from the ellipse, so the scrub runs
    // close to linear; a soft in/out keeps the auto-play from lurching.
    anim.current = animate(pos, target, auto ? { duration: 1.9, ease: [0.42, 0, 0.58, 1] } : { duration: Math.max(0.3, 1.4 * dist), ease: [0.25, 0.1, 0.25, 1] });
  };

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastInput.current < 3000 || drag.current || anim.current?.state === "running") return;
      go(Math.round(pos.get()) + 1, true);
    }, 3300);
    const first = window.setTimeout(() => { if (Date.now() - lastInput.current > 1000) go(1, true); }, 900);
    return () => { window.clearInterval(id); window.clearTimeout(first); };
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drag up pulls the panel up (forward), down pushes it back.
  const drag = useRef<{ y: number; p: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    anim.current?.stop();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, p: pos.get(), moved: false };
    userDriven.current = true;
    lastInput.current = Date.now();
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    pos.set(d.p - dy / (SH * s * 0.9));
    lastInput.current = Date.now();
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    lastInput.current = Date.now();
    if (!d) return;
    if (!d.moved) { go(Math.round(pos.get()) + 1); return; }
    const p = pos.get();
    go(p > d.p ? Math.ceil(p - 0.25) : Math.floor(p + 0.25));
  };

  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let t = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      anim.current?.stop();
      lastInput.current = Date.now();
      userDriven.current = true;
      if (reduce) { window.clearTimeout(t); t = window.setTimeout(() => go(Math.round(pos.get()) + Math.sign(e.deltaY)), 60); return; }
      pos.set(pos.get() + e.deltaY / (SH * s * 1.6));
      window.clearTimeout(t);
      t = window.setTimeout(() => go(Math.round(pos.get())), 180);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); window.clearTimeout(t); };
  }, [s, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{`.sh-dot{background:rgba(255,255,255,.16)}:root[data-theme="light"] .sh-dot{background:oklch(0.22 0.008 264 / .2)}.sh-frame{box-shadow:0 0 0 1px rgba(255,255,255,.08), 0 18px 40px rgba(0,0,0,.45)}:root[data-theme="light"] .sh-frame{box-shadow:0 0 0 1px var(--k-ring), 0 2px 4px var(--k-shadow-soft), 0 18px 40px -10px var(--k-shadow)}`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * Math.max(0.8, s), transform: size === "card" ? "translateY(2px)" : undefined }}>
        <div style={{ width: 8 }} />
        <div
          ref={wrap}
          className="sh-frame"
          data-own-click
          role="button"
          tabIndex={0}
          aria-label="Curved shutter wipe between three screens. Drag, scroll, or press to wipe to the next."
          onKeyDown={(e) => {
            userDriven.current = true;
            if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") { e.preventDefault(); lastInput.current = Date.now(); go(Math.round(pos.get()) + 1); }
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); lastInput.current = Date.now(); go(Math.round(pos.get()) - 1); }
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ pointerEvents: "auto", width: SW * s, height: SH * s, position: "relative", cursor: "grab", touchAction: "none", outline: "none", userSelect: "none", borderRadius: 14 * s, overflow: "hidden", isolation: "isolate" }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${s})`, transformOrigin: "0 0" }}>
            <div ref={scr[0]} style={fill}><HeroScreen /></div>
            <div ref={scr[1]} style={fill}><WordmarkScreen wm={wm} /></div>
            <div ref={scr[2]} style={fill}><CardsScreen /></div>
          </div>
        </div>
        <div aria-hidden style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="sh-dot" style={{ width: 4, height: i === active ? 16 : 4, borderRadius: 2, background: i === active ? "#34b562" : undefined, transition: "height 300ms cubic-bezier(.2,.8,.2,1), background 300ms" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
