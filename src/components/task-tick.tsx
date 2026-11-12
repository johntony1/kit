// Task tick: today's task card from the calendar widget. Tick a task and the box fills with
// a spring, a ring spreads, emojis burst and a WebGL glow ripples out from the click across
// the card; tick it again to undo.
// Split out of the old calendar.tsx (ported from ~/Documents/Calendar animation: TaskWidget,
// CardRipple), same springs and timings.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { play } from "../sound/sound";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  surface: "var(--tt-shell)",
  raised: "var(--k-raised)",
  raisedShadow: "var(--k-lift)",
  text: "var(--k-text)",
  muted: "var(--k-muted)",
  green: "#34b562",
  badge: "var(--tt-badge)",
};

/* ── theme ──────────────────────────────────────────────────
 * The label colour is tweened by framer-motion and the glow is drawn in WebGL, so both are
 * picked here as plain values. Everything else is painted with the --k tokens and the --tt
 * variables below. */
const DARK = { label: "#e3e8e3", done: "#5d6862", glow: "#34b562", gain: 0.32 };
const LIGHT: typeof DARK = { label: "#191b1e", done: "#898c92", glow: "#2fae5c", gain: 0.42 };
const readTheme = () => (typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark");
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(readTheme()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    setTheme(readTheme());
    return () => mo.disconnect();
  }, []);
  return theme;
}
const CSS = `.tasktick-focus:focus-visible{outline:2px solid #34b562;outline-offset:2px}
.tasktick-root{--tt-shell:#242624;--tt-shell-sh:inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.6);--tt-badge:rgba(255,255,255,.05);--tt-badge-ring:rgba(255,255,255,.03);--tt-strike:#5d6862;--tt-box:rgba(255,255,255,.1);--tt-box-hover:rgba(255,255,255,.17);--tt-box-sh:inset 0 1px 1px rgba(0,0,0,.25);--tt-row-hover:rgba(255,255,255,0.025)}
:root[data-theme="light"] .tasktick-root{--tt-shell:oklch(0.972 0.003 264);--tt-shell-sh:inset 0 1px 0 oklch(1 0 0), 0 0 0 1px oklch(0.22 0.008 264 / 0.08), 0 12px 32px -14px oklch(0.22 0.008 264 / 0.18);--tt-badge:oklch(0.22 0.008 264 / 0.05);--tt-badge-ring:oklch(0.22 0.008 264 / 0.04);--tt-strike:oklch(0.64 0.009 264);--tt-box:oklch(0.22 0.008 264 / 0.07);--tt-box-hover:oklch(0.22 0.008 264 / 0.13);--tt-box-sh:inset 0 0 0 1px oklch(0.22 0.008 264 / 0.16), inset 0 1px 1px oklch(0.22 0.008 264 / 0.08);--tt-row-hover:oklch(0.22 0.008 264 / 0.03)}`;

/* ── springs (verbatim) ─────────────────────────────────── */
const SPRING_ENTRY = { type: "spring" as const, visualDuration: 0.45, bounce: 0.14 };
const SPRING_PRESS = { type: "spring" as const, stiffness: 500, damping: 28 };
const SPRING_FILL = { type: "spring" as const, stiffness: 420, damping: 22, bounce: 0.35 };
const SPRING_MARK = { type: "spring" as const, stiffness: 380, damping: 24 };
const RING_EASE = [0.22, 1, 0.36, 1] as const;

const TASKS = [
  { id: 1, label: "Design landing page", time: "Today, 1:00PM" },
  { id: 2, label: "Create dashboard", time: "Today, 2:00PM" },
  { id: 3, label: "Build AI skills", time: "Today, 3:00PM" },
  { id: 4, label: "Review code", time: "Today, 4:00PM" },
];

/* ── fit ────────────────────────────────────────────────── */
function useFit(size: "card" | "big") {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const rest = useRef({ h: 0, W: 0, H: 0 });
  useLayoutEffect(() => {
    const root = rootRef.current, inner = innerRef.current;
    if (!root || !inner) return;
    const update = () => {
      const W = root.clientWidth, H = root.clientHeight, w = inner.offsetWidth, h = inner.offsetHeight;
      if (!W || !H || !w || !h) return;
      const r = rest.current;
      if (r.W !== W || r.H !== H) { r.W = W; r.H = H; r.h = h; setBox({ w: W, h: H }); }
      if (h < r.h) r.h = h;
      const big = size === "big";
      const clear = big ? 120 : H < 260 ? 84 : 116;
      setScale(Math.min(big ? 1.6 : 1, (W - 32) / w, (H - clear) / r.h, (H - 16) / h));
    };
    const ro = new ResizeObserver(update);
    ro.observe(root); ro.observe(inner); update();
    return () => ro.disconnect();
  }, [size]);
  return { rootRef, innerRef, box, scale };
}

/* ── CardRipple: transparent WebGL glow ring from the click point ── */
const MAX_RIPPLES = 4;
const VERT = `attribute vec2 a_pos; attribute vec2 a_uv; varying vec2 vUv; void main(){ vUv=a_uv; gl_Position=vec4(a_pos,0.0,1.0); }`;
const FRAG = `
  precision highp float;
  uniform float u_time; uniform vec2 u_ripplePositions[${MAX_RIPPLES}]; uniform float u_rippleStartTimes[${MAX_RIPPLES}];
  uniform int u_rippleCount; uniform float u_frequency; uniform float u_speed; uniform float u_easeK; uniform float u_fadeRate;
  uniform float u_glowGain; uniform float u_aspect; uniform vec3 u_glowColor; varying vec2 vUv;
  void main(){
    vec2 uv=vUv; float glow=0.0;
    for(int i=0;i<${MAX_RIPPLES};i++){
      if(i>=u_rippleCount) break;
      float age=u_time-u_rippleStartTimes[i]; if(age<0.0) continue;
      vec2 diff=uv-u_ripplePositions[i]; vec2 sd=vec2(diff.x*u_aspect,diff.y); float dist=length(sd); if(dist<0.001) continue;
      float waveRadius=u_speed*(1.0-exp(-u_easeK*age)); float waveDist=dist-waveRadius; float fade=exp(-age*u_fadeRate);
      float halfThick=0.42;
      float band=smoothstep(-halfThick*4.0,-halfThick*0.3,waveDist)*(1.0-smoothstep(halfThick*0.3,halfThick*4.0,waveDist));
      float angle=atan(diff.y,diff.x*u_aspect);
      float v1=sin(dist*u_frequency-u_time*6.0); float v2=sin(dist*u_frequency*0.55+angle*3.0-u_time*4.0)*0.4;
      float vibration=(v1+v2)*0.10;
      float core=1.0-smoothstep(0.0,halfThick*0.6,abs(waveDist)); core=core*core*0.18;
      float glowMod=abs(vibration)*0.2+0.75;
      glow+=(band*glowMod*0.70+core)*fade;
    }
    float g=clamp(glow*u_glowGain,0.0,1.0);
    gl_FragColor=vec4(u_glowColor,g);
  }`;
type RippleTrigger = { x: number; y: number; key: number };
function computeRippleUV(e: React.MouseEvent, el: HTMLElement | null) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}
function CardRipple({ trigger, glowColor = "#34b562", gain = 0.32 }: { trigger: RippleTrigger; glowColor?: string; gain?: number }) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { if (trigger.key > 0) pendingRef.current = { x: trigger.x, y: trigger.y }; }, [trigger.key, trigger.x, trigger.y]);
  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;
    // a fresh canvas per mount, so its context can be freed on unmount (a lost context can't be reused)
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", display: "block" });
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    host.appendChild(canvas);
    const free = () => { gl.getExtension("WEBGL_lose_context")?.loseContext(); canvas.remove(); };
    const compile = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vert = compile(gl.VERTEX_SHADER, VERT), frag = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert); gl.attachShader(prog, frag); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { free(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos"), aUv = gl.getAttribLocation(prog, "a_uv");
    gl.enableVertexAttribArray(aPos); gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = U("u_time"), uPos = U("u_ripplePositions"), uTimes = U("u_rippleStartTimes"), uCount = U("u_rippleCount"), uAspect = U("u_aspect");
    gl.uniform1f(U("u_frequency"), 7.0); gl.uniform1f(U("u_speed"), 2.2); gl.uniform1f(U("u_easeK"), 1.6); gl.uniform1f(U("u_fadeRate"), 0.55); gl.uniform1f(U("u_glowGain"), gain);
    gl.uniform3f(U("u_glowColor"), parseInt(glowColor.slice(1, 3), 16) / 255, parseInt(glowColor.slice(3, 5), 16) / 255, parseInt(glowColor.slice(5, 7), 16) / 255);
    const posFlat = new Float32Array(MAX_RIPPLES * 2).fill(0.5), timFlat = new Float32Array(MAX_RIPPLES).fill(-999);
    let ripples: { x: number; y: number; startTime: number }[] = [];
    let raf = 0, running = false;
    const stop = () => { cancelAnimationFrame(raf); raf = 0; running = false; gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); };
    const render = (now: number) => {
      const t = now / 1000;
      if (pendingRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform1f(uAspect, canvas.width / Math.max(1, canvas.height));
        ripples.push({ ...pendingRef.current, startTime: t }); pendingRef.current = null;
        if (ripples.length > MAX_RIPPLES) ripples.shift();
      }
      ripples = ripples.filter((r) => t - r.startTime < 3.5);
      if (!ripples.length) { stop(); return; }
      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (i < ripples.length) { posFlat[i * 2] = ripples[i].x; posFlat[i * 2 + 1] = 1 - ripples[i].y; timFlat[i] = ripples[i].startTime; } else timFlat[i] = -999;
      }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t); gl.uniform2fv(uPos, posFlat); gl.uniform1fv(uTimes, timFlat); gl.uniform1i(uCount, ripples.length);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    const poll = setInterval(() => { if (pendingRef.current && !running) { running = true; raf = requestAnimationFrame(render); } }, 16);
    return () => { clearInterval(poll); cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteShader(vert); gl.deleteShader(frag); free(); };
  }, [reduced, glowColor, gain]);
  if (reduced) return null;
  return <div ref={hostRef} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}

/* ── Checkbox: fill spring, ring, emoji burst, path draw ── */
const BURST_EMOJIS = ["✨", "⭐", "💫", "🌟", "🎉", "✨", "💥", "🌟"];
function makeParticles() {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist = 30 + Math.random() * 22;
    return { emoji: BURST_EMOJIS[i % 8], x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 10 + Math.random() * 6, rotate: (Math.random() - 0.5) * 80, delay: i * 0.018 + Math.random() * 0.025 };
  });
}
function CheckboxBurst({ burstId }: { burstId: number }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const particles = useMemo(makeParticles, [burstId]);
  return (
    <>
      {particles.map((p, i) => (
        <motion.span key={i} aria-hidden="true" style={{ position: "absolute", pointerEvents: "none", userSelect: "none", fontSize: p.size, lineHeight: 1, top: "50%", left: "50%", marginTop: -(p.size / 2), marginLeft: -(p.size / 2), zIndex: 20 }}
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, scale: [0.2, 1.2, 0], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{
            x: { duration: 0.58, ease: RING_EASE, delay: p.delay }, y: { duration: 0.58, ease: RING_EASE, delay: p.delay }, rotate: { duration: 0.58, ease: RING_EASE, delay: p.delay },
            scale: { duration: 0.58, ease: RING_EASE, delay: p.delay, times: [0, 0.25, 1] }, opacity: { duration: 0.58, ease: "easeIn", delay: p.delay, times: [0, 0.5, 1] },
          }}>
          {p.emoji}
        </motion.span>
      ))}
    </>
  );
}
function Checkbox({ checked, onToggle, burst = true, idle = "var(--tt-box)", hover = "var(--tt-box-hover)" }: { checked: boolean; onToggle: (e: React.MouseEvent) => void; burst?: boolean; idle?: string; hover?: string }) {
  const [hovered, setHovered] = useState(false);
  const [fx, setFx] = useState({ on: false, id: 0 });
  const prev = useRef(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (checked && !prev.current && !reduced) {
      setFx((f) => ({ on: true, id: f.id + 1 }));
      const t = setTimeout(() => setFx((f) => ({ ...f, on: false })), burst ? 750 : 700);
      prev.current = checked;
      return () => clearTimeout(t);
    }
    prev.current = checked;
  }, [checked, reduced, burst]);
  return (
    <motion.button type="button" className="tasktick-focus" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onToggle}
      aria-label={checked ? "Mark incomplete" : "Mark complete"} aria-pressed={checked}
      style={{ position: "relative", flexShrink: 0, width: 20, height: 20, border: 0, padding: 0, background: "none", cursor: "pointer", borderRadius: 4 }}
      whileTap={{ scale: 0.95 }} transition={SPRING_PRESS}>
      <div style={{ position: "absolute", inset: "10%", borderRadius: 4, background: checked ? "transparent" : hovered ? hover : idle, boxShadow: checked ? "none" : "var(--tt-box-sh)", transition: "background 120ms ease" }} />
      <motion.div style={{ position: "absolute", inset: "10%", borderRadius: 4, background: T.green, boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)" }} initial={false} animate={{ scale: checked ? 1 : 0 }} transition={reduced ? { duration: 0.08 } : SPRING_FILL} />
      <AnimatePresence>
        {fx.on && (
          <motion.div key={fx.id} style={{ position: "absolute", inset: "10%", borderRadius: 4, border: `1.5px solid ${T.green}`, pointerEvents: "none" }}
            initial={{ scale: 0.85, opacity: 0.5 }} animate={{ scale: 2.8, opacity: 0 }} exit={{}} transition={{ duration: 0.62, ease: RING_EASE }} />
        )}
      </AnimatePresence>
      <AnimatePresence>{burst && fx.on && <CheckboxBurst key={fx.id} burstId={fx.id} />}</AnimatePresence>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }} viewBox="0 0 20 20" fill="none">
        <motion.path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transformBox: "fill-box", transformOrigin: "center" }} initial={false}
          animate={checked ? { pathLength: 1, opacity: 1, scale: 1 } : { pathLength: 0, opacity: 0, scale: 0.6 }}
          transition={reduced ? { duration: 0.1 } : checked ? { pathLength: SPRING_MARK, opacity: { duration: 0.06 }, scale: { type: "spring", stiffness: 360, damping: 20, delay: 0.05 } } : { duration: 0.1, ease: "easeIn" }} />
      </svg>
    </motion.button>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2px 6px", borderRadius: 8, flexShrink: 0, background: T.badge, boxShadow: "inset 0 0 0 1px var(--tt-badge-ring)" }}>
    <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", letterSpacing: "-0.078px", color: T.muted, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{children}</span>
  </div>
);

function TaskRow({ label, time, delayS, onRipple }: { label: string; time: string; delayS: number; onRipple: (e: React.MouseEvent) => void }) {
  const [checked, setChecked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();
  const P = useTheme() === "light" ? LIGHT : DARK;
  return (
    <motion.div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderRadius: 8, padding: "0 2px", minHeight: 28, background: hovered ? "var(--tt-row-hover)" : "transparent", transition: "background 120ms ease" }}
      initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: delayS }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 0 0", minWidth: 0 }}>
        <Checkbox checked={checked} onToggle={(e) => { play(checked ? "tap" : "check"); setChecked(!checked); onRipple(e); }} />
        <div style={{ position: "relative", flexShrink: 0 }}>
          <motion.span style={{ display: "block", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", whiteSpace: "nowrap", userSelect: "none" }}
            animate={{ color: checked ? P.done : P.label }} transition={reduced ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}>{label}</motion.span>
          <motion.div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--tt-strike)", transformOrigin: "left center", pointerEvents: "none" }}
            initial={false} animate={{ scaleX: checked ? 1 : 0 }} transition={reduced ? { duration: 0 } : { type: "spring", visualDuration: 0.22, bounce: 0 }} />
        </div>
      </div>
      <div style={{ marginLeft: 8 }}><Badge>{time}</Badge></div>
    </motion.div>
  );
}

/* ── component ──────────────────────────────────────────── */
export default function TaskTick({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, innerRef, box, scale } = useFit(size);
  const reduced = useReducedMotion();
  const tasks = size === "card" && box.h && box.h < 260 ? TASKS.slice(0, 2) : TASKS;
  const cardRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState<RippleTrigger>({ x: 0.5, y: 0.5, key: 0 });
  const P = useTheme() === "light" ? LIGHT : DARK;
  const fireRipple = (e: React.MouseEvent) => { const uv = computeRippleUV(e, cardRef.current); if (uv) setRipple((p) => ({ ...uv, key: p.key + 1 })); };

  return (
    <MotionConfig reducedMotion="user">
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click className="tasktick-root" style={{ pointerEvents: "auto", width: 358, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", borderRadius: 24, width: "100%", background: T.surface, boxShadow: "var(--tt-shell-sh)", padding: "12px 4px 4px" }}
            initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_ENTRY}>
            <motion.div style={{ padding: "0 10px" }}
              initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.08 }}>
              <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, userSelect: "none" }}>Today</span>
            </motion.div>
            <motion.div ref={cardRef}
              style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: 12, width: "100%", overflow: "hidden", borderRadius: "16px 16px 20px 20px", background: T.raised, boxShadow: T.raisedShadow }}
              initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.16 }}>
              {tasks.map((t, i) => <TaskRow key={t.id} label={t.label} time={t.time} delayS={0.26 + i * 0.07} onRipple={fireRipple} />)}
              <CardRipple trigger={ripple} glowColor={P.glow} gain={P.gain} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
