// Calendar: the task widget. Tick a task (fill, ring, emoji burst, WebGL glow ripple),
// tap the calendar icon and the widget morphs into a week picker with tabbed tasks,
// tap the avatar stack and it morphs into the guest list.
// Ported from ~/Documents/Calendar animation (TaskWidget, CalendarExpanded, GuestsExpanded, CardRipple).
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig, useReducedMotion } from "framer-motion";

/* ── tokens ─────────────────────────────────────────────── */
const T = {
  surface: "#242624",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  raisedShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  text: "#e3e8e3",
  text2: "#c2cbc4",
  muted: "#8b968f",
  faint: "#5d6862",
  green: "#34b562",
  primary: "linear-gradient(180deg,#3cc06b,#22994c)",
  primaryShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.4)",
  badge: "rgba(255,255,255,.05)",
  well: "rgba(0,0,0,.22)",
  wellShadow: "inset 0 1px 2px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.05)",
};

/* ── springs (verbatim) ─────────────────────────────────── */
const SPRING_ENTRY = { type: "spring" as const, visualDuration: 0.45, bounce: 0.14 };
const SPRING_LAYOUT = { type: "spring" as const, stiffness: 240, damping: 22 };
const SPRING_PRESS = { type: "spring" as const, stiffness: 500, damping: 28 };
const SPRING = { type: "spring" as const, stiffness: 240, damping: 22 };
const SPRING_SOFT = { type: "spring" as const, stiffness: 200, damping: 24 };
const SPRING_FILL = { type: "spring" as const, stiffness: 420, damping: 22, bounce: 0.35 };
const SPRING_MARK = { type: "spring" as const, stiffness: 380, damping: 24 };
const RING_EASE = [0.22, 1, 0.36, 1] as const;
const IN: [number, number, number, number] = [0.4, 0, 1, 1];

type View = "closed" | "calendar" | "guests";

const TASKS = [
  { id: 1, label: "Design landing page", time: "Today, 1:00PM" },
  { id: 2, label: "Create dashboard", time: "Today, 2:00PM" },
  { id: 3, label: "Build AI skills", time: "Today, 3:00PM" },
  { id: 4, label: "Review code", time: "Today, 4:00PM" },
];
const PEOPLE = [
  { i: "J", bg: "#ffecc0" },
  { i: "J", bg: "#c0d5ff" },
  { i: "J", bg: "#c0eaff" },
  { i: "T", bg: "#cac0ff" },
];
const GUESTS = [
  { id: 1, name: "John tony", role: "Can view", bg: "#ffecc0" },
  { id: 2, name: "James imade", role: "Can view", bg: "#c0d5ff" },
  { id: 3, name: "Johnson eve", role: "Can view", bg: "#c0eaff" },
  { id: 4, name: "Tima sbdhs", role: "Can edit", bg: "#cac0ff" },
];

/* ── week data ──────────────────────────────────────────── */
const BASE_DATE = new Date(2026, 2, 31);
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;
function getWeekDays(offset: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(BASE_DATE);
    d.setDate(BASE_DATE.getDate() + offset * 5 + i);
    return { key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, day: DAY_NAMES[d.getDay()], date: String(d.getDate()).padStart(2, "0"), month: d.getMonth(), year: d.getFullYear() };
  });
}
const TODAY_KEY = "2026-3-2";
const TABS = ["Home", "Work", "Family"] as const;
type Tab = (typeof TABS)[number];
type TaskItem = { id: number; label: string; time: string };
const TASK_POOL: Record<Tab, TaskItem[]> = {
  Home: [{ id: 1, label: "Design landing page", time: "1:00 PM" }, { id: 2, label: "Create dashboard", time: "2:00 PM" }, { id: 3, label: "Review prototype", time: "4:00 PM" }, { id: 4, label: "Update components", time: "10:00 AM" }, { id: 5, label: "Fix layout bugs", time: "11:00 AM" }, { id: 6, label: "Write blog post", time: "3:00 PM" }],
  Work: [{ id: 1, label: "Team standup", time: "9:00 AM" }, { id: 2, label: "Review pull request", time: "11:00 AM" }, { id: 3, label: "Deploy to staging", time: "3:00 PM" }, { id: 4, label: "Client check-in", time: "1:00 PM" }, { id: 5, label: "Sprint planning", time: "10:00 AM" }, { id: 6, label: "Write API docs", time: "4:00 PM" }],
  Family: [{ id: 1, label: "Pick up groceries", time: "5:00 PM" }, { id: 2, label: "School pickup", time: "3:30 PM" }, { id: 3, label: "Movie night", time: "7:00 PM" }, { id: 4, label: "Cook dinner", time: "6:00 PM" }, { id: 5, label: "Morning walk", time: "7:00 AM" }, { id: 6, label: "Call parents", time: "8:00 PM" }],
};
function hashKey(k: string) { let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; return h; }
function getTasksForDay(tab: Tab, dayKey: string) { const pool = TASK_POOL[tab]; const s = hashKey(dayKey) % (pool.length - 2); return pool.slice(s, s + 3); }
function parseKey(k: string) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m, d).getTime(); }
const TASK_SLIDE = {
  enter: (dir: number) => ({ x: dir * 28, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
  exit: (dir: number) => ({ x: dir * -28, opacity: 0, transition: { duration: 0.13, ease: IN } }),
};

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

/* ── icons ──────────────────────────────────────────────── */
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.75" y="3.75" width="14.5" height="13.5" rx="3.25" fill="rgba(255,255,255,.06)" stroke={T.muted} strokeWidth="1.5" />
    <path d="M2.75 8h14.5" stroke={T.muted} strokeWidth="1.5" />
    <path d="M6.5 2.25v3M13.5 2.25v3" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="12.5" r="1.25" fill={T.green} />
  </svg>
);
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const Chev = ({ dir }: { dir: "left" | "right" | "down" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ transform: dir === "left" ? "rotate(90deg)" : dir === "right" ? "rotate(-90deg)" : undefined }}>
    <path d="M5 6.5l3 3 3-3" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { if (trigger.key > 0) pendingRef.current = { x: trigger.x, y: trigger.y }; }, [trigger.key, trigger.x, trigger.y]);
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    const compile = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vert = compile(gl.VERTEX_SHADER, VERT), frag = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert); gl.attachShader(prog, frag); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
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
    return () => { clearInterval(poll); cancelAnimationFrame(raf); gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteShader(vert); gl.deleteShader(frag); };
  }, [reduced, glowColor, gain]);
  if (reduced) return null;
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", display: "block" }} />;
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
function Checkbox({ checked, onToggle, burst = true, idle = "rgba(255,255,255,.1)", hover = "rgba(255,255,255,.17)" }: { checked: boolean; onToggle: (e: React.MouseEvent) => void; burst?: boolean; idle?: string; hover?: string }) {
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
    <motion.button type="button" className="calendar-focus" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onToggle}
      aria-label={checked ? "Mark incomplete" : "Mark complete"} aria-pressed={checked}
      style={{ position: "relative", flexShrink: 0, width: 20, height: 20, border: 0, padding: 0, background: "none", cursor: "pointer", borderRadius: 4 }}
      whileTap={{ scale: 0.95 }} transition={SPRING_PRESS}>
      <div style={{ position: "absolute", inset: "10%", borderRadius: 4, background: checked ? "transparent" : hovered ? hover : idle, boxShadow: checked ? "none" : "inset 0 1px 1px rgba(0,0,0,.25)", transition: "background 120ms ease" }} />
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
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2px 6px", borderRadius: 8, flexShrink: 0, background: T.badge, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.03)" }}>
    <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", letterSpacing: "-0.078px", color: T.muted, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{children}</span>
  </div>
);

function TaskRow({ label, time, delayS, onRipple }: { label: string; time: string; delayS: number; onRipple: (e: React.MouseEvent) => void }) {
  const [checked, setChecked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();
  return (
    <motion.div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderRadius: 8, padding: "0 2px", minHeight: 28, background: hovered ? "rgba(255,255,255,0.025)" : "transparent", transition: "background 120ms ease" }}
      initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: delayS }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 0 0", minWidth: 0 }}>
        <Checkbox checked={checked} onToggle={(e) => { setChecked((v) => !v); onRipple(e); }} />
        <div style={{ position: "relative", flexShrink: 0 }}>
          <motion.span style={{ display: "block", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", whiteSpace: "nowrap", userSelect: "none" }}
            animate={{ color: checked ? T.faint : T.text }} transition={reduced ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}>{label}</motion.span>
          <motion.div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: T.faint, transformOrigin: "left center", pointerEvents: "none" }}
            initial={false} animate={{ scaleX: checked ? 1 : 0 }} transition={reduced ? { duration: 0 } : { type: "spring", visualDuration: 0.22, bounce: 0 }} />
        </div>
      </div>
      <div style={{ marginLeft: 8 }}><Badge>{time}</Badge></div>
    </motion.div>
  );
}

function AvatarStack({ onClick, triggerRef }: { onClick: () => void; triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <motion.button ref={triggerRef} type="button" onClick={onClick} aria-label="View guests" aria-haspopup="dialog" className="calendar-focus"
      style={{ display: "flex", alignItems: "flex-start", paddingRight: 4, border: 0, background: "none", cursor: "pointer", borderRadius: 6 }}
      whileTap={{ scale: 0.94 }} transition={SPRING_PRESS}>
      {PEOPLE.map((p, i) => (
        <div key={i} style={{ width: 20, height: 20, borderRadius: 999, border: `2px solid ${T.surface}`, background: p.bg, marginLeft: i === 0 ? 0 : -4, zIndex: PEOPLE.length - i, display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700, color: "#1c1d1c", flexShrink: 0 }}>{p.i}</div>
      ))}
      <div style={{ width: 20, height: 20, borderRadius: 999, border: `2px solid ${T.surface}`, background: "#3a3d3a", marginLeft: -4, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <span aria-hidden="true" style={{ fontSize: 8, fontWeight: 500, lineHeight: "12px", color: T.text2, fontVariantNumeric: "tabular-nums" }}>+9</span>
      </div>
    </motion.button>
  );
}

const CloseButton = ({ onClose, refEl, label }: { onClose: () => void; refEl: React.RefObject<HTMLButtonElement | null>; label: string }) => (
  <motion.button ref={refEl} type="button" onClick={onClose} aria-label={label} className="calendar-focus"
    style={{ width: 20, height: 20, display: "grid", placeItems: "center", borderRadius: 4, border: 0, padding: 0, background: "rgba(255,255,255,0)", cursor: "pointer" }}
    whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.88 }} transition={SPRING_PRESS}>
    <CloseIcon />
  </motion.button>
);

/* ── Calendar view ──────────────────────────────────────── */
function DayCell({ day, date, selected, onSelect }: { day: string; date: string; selected: boolean; onSelect: () => void }) {
  const reduced = useReducedMotion();
  const [hov, setHov] = useState(false);
  return (
    <motion.button type="button" onClick={onSelect} aria-label={`Select ${day} ${date}`} aria-pressed={selected} className="calendar-focus"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 4px", borderRadius: 8, border: 0, background: "transparent", cursor: "pointer" }}
      whileTap={{ scale: 0.94 }} transition={SPRING_PRESS}>
      {selected && (
        <motion.div layoutId="calendar-day-selected" style={{ position: "absolute", inset: 0, borderRadius: 8, background: T.primary, boxShadow: T.primaryShadow }} transition={reduced ? { duration: 0.15 } : SPRING} />
      )}
      {!selected && <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "rgba(255,255,255,0.05)", opacity: hov ? 1 : 0, transition: "opacity 120ms ease", pointerEvents: "none" }} />}
      <span style={{ position: "relative", fontSize: 12, lineHeight: "16px", color: selected ? "rgba(255,255,255,.85)" : T.muted, transition: "color 150ms ease" }}>{day}</span>
      <span style={{ position: "relative", fontWeight: 500, fontSize: 16, lineHeight: "24px", letterSpacing: "-0.176px", color: selected ? "#fff" : T.text, fontVariantNumeric: "tabular-nums", transition: "color 150ms ease" }}>{date}</span>
    </motion.button>
  );
}
function NavArrow({ dir, label, onClick }: { dir: "left" | "right"; label: string; onClick: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} aria-label={label} className="calendar-focus"
      style={{ display: "grid", placeItems: "center", padding: 2, borderRadius: 6, border: 0, cursor: "pointer", background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08), 0 1px 2px rgba(0,0,0,.3)" }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.09)" }} whileTap={{ scale: 0.9 }} transition={SPRING_PRESS}>
      <Chev dir={dir} />
    </motion.button>
  );
}
function TaskLine({ task, onRipple }: { task: TaskItem; onRipple: (e: React.MouseEvent) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 0 0" }}>
        <Checkbox checked={checked} burst={false} idle="rgba(255,255,255,.12)" hover="rgba(255,255,255,.2)" onToggle={(e) => { setChecked((v) => !v); onRipple(e); }} />
        <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: T.text, whiteSpace: "nowrap", userSelect: "none" }}>{task.label}</span>
      </div>
      <Badge>{task.time}</Badge>
    </div>
  );
}

function CalendarExpanded({ onClose, closeRef }: { onClose: () => void; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const [selectedDay, setSelectedDay] = useState(TODAY_KEY);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const taskDir = useRef(1);
  const dayDir = useRef(1);
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState<RippleTrigger>({ x: 0.5, y: 0.5, key: 0 });
  const fireRipple = (e: React.MouseEvent) => { const uv = computeRippleUV(e, sectionRef.current); if (uv) setRipple((p) => ({ ...uv, key: p.key + 1 })); };
  const weekDays = getWeekDays(weekOffset);
  const mid = weekDays[2];
  const switchTab = (t: Tab) => { taskDir.current = TABS.indexOf(t) > TABS.indexOf(activeTab) ? 1 : -1; setActiveTab(t); };
  const selectDay = (k: string) => {
    if (k === selectedDay) return;
    const n = weekDays.findIndex((d) => d.key === k), o = weekDays.findIndex((d) => d.key === selectedDay);
    taskDir.current = n !== -1 && o !== -1 ? (n > o ? 1 : -1) : parseKey(k) > parseKey(selectedDay) ? 1 : -1;
    setSelectedDay(k);
  };
  return (
    <>
      <motion.div role="dialog" aria-label="Calendar"
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: 12, width: "100%", overflow: "hidden", borderRadius: "20px 20px 16px 16px", background: T.raised, boxShadow: T.raisedShadow }}
        initial={{ opacity: 0, y: reduced ? 0 : -10 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.08 } }}
        exit={{ opacity: 0, y: reduced ? 0 : -6, transition: { duration: 0.14, ease: IN, delay: 0.1 } }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, userSelect: "none" }}>
            <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: T.text2, fontVariantNumeric: "tabular-nums" }}>{MONTH_NAMES[mid.month]} {mid.year}</span>
            <Chev dir="down" />
          </div>
          <CloseButton onClose={onClose} refEl={closeRef} label="Close calendar" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavArrow dir="left" label="Previous week" onClick={() => { dayDir.current = -1; setWeekOffset((w) => w - 1); }} />
          <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
            <AnimatePresence custom={dayDir.current} mode="popLayout" initial={false}>
              <motion.div key={weekOffset} custom={dayDir.current} variants={reduced ? undefined : TASK_SLIDE} initial="enter" animate="center" exit="exit" style={{ display: "flex", flex: 1, alignItems: "center", gap: 4 }}>
                {weekDays.map((d) => <DayCell key={d.key} day={d.day} date={d.date} selected={selectedDay === d.key} onSelect={() => selectDay(d.key)} />)}
              </motion.div>
            </AnimatePresence>
          </div>
          <NavArrow dir="right" label="Next week" onClick={() => { dayDir.current = 1; setWeekOffset((w) => w + 1); }} />
        </div>
      </motion.div>

      <motion.div ref={sectionRef}
        style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", borderRadius: 16, padding: "8px 0", background: T.well, boxShadow: T.wellShadow, overflow: "hidden", position: "relative" }}
        initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.16 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 4, transition: { duration: 0.1, ease: IN, delay: 0.055 } }}>
        <div style={{ padding: "0 12px" }}><span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.faint, userSelect: "none" }}>Tasks</span></div>
        <AnimatePresence custom={taskDir.current} mode="popLayout" initial={false}>
          <motion.div key={`${activeTab}-${selectedDay}`} custom={taskDir.current} variants={reduced ? undefined : TASK_SLIDE} initial="enter" animate="center" exit="exit" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {getTasksForDay(activeTab, selectedDay).map((t) => <TaskLine key={t.id} task={t} onRipple={fireRipple} />)}
          </motion.div>
        </AnimatePresence>
        <CardRipple trigger={ripple} />
      </motion.div>

      <motion.div role="tablist" aria-label="Task lists"
        style={{ display: "flex", width: "100%", borderRadius: 999, padding: 4, minHeight: 44, background: T.well, boxShadow: T.wellShadow }}
        initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.24 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 5, transition: { duration: 0.08, ease: IN, delay: 0 } }}>
        {TABS.map((tab) => {
          const on = tab === activeTab;
          return (
            <motion.button type="button" role="tab" aria-selected={on} key={tab} onClick={() => switchTab(tab)} className="calendar-focus"
              style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, border: 0, background: "none", cursor: "pointer" }}
              whileTap={{ scale: 0.96 }} transition={SPRING_PRESS}>
              <AnimatePresence initial={false}>
                {on && <motion.div layoutId="calendar-seg-pill" style={{ position: "absolute", inset: 0, borderRadius: 999, background: "linear-gradient(180deg,#363936,#2b2d2b)", boxShadow: T.raisedShadow }} transition={reduced ? { duration: 0.15 } : SPRING} />}
              </AnimatePresence>
              <span style={{ position: "relative", fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: on ? T.text : T.faint, transition: "color 180ms ease", userSelect: "none" }}>{tab}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </>
  );
}

/* ── Guests view ────────────────────────────────────────── */
function GuestsExpanded({ onClose, closeRef }: { onClose: () => void; closeRef: React.RefObject<HTMLButtonElement | null> }) {
  const reduced = useReducedMotion();
  return (
    <>
      <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}
        initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.08 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 4, transition: { duration: 0.1, ease: IN, delay: 0.14 } }}>
        <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, userSelect: "none" }}>Guests</span>
        <CloseButton onClose={onClose} refEl={closeRef} label="Close guests" />
      </motion.div>
      <motion.div role="dialog" aria-label="Guests"
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, padding: 12, width: "100%", overflow: "hidden", borderRadius: "16px 16px 20px 20px", background: T.raised, boxShadow: T.raisedShadow }}
        initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.16 } }}
        exit={{ opacity: 0, y: reduced ? 0 : 6, transition: { duration: 0.14, ease: IN, delay: 0 } }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {GUESTS.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div aria-hidden="true" style={{ width: 20, height: 20, borderRadius: 999, background: g.bg, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, color: "#1c1d1c", flexShrink: 0 }}>{g.name.slice(0, 1).toUpperCase()}</div>
                <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "-0.084px", color: T.text, whiteSpace: "nowrap", userSelect: "none" }}>{g.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, whiteSpace: "nowrap", userSelect: "none" }}>{g.role}</span>
                <Chev dir="down" />
              </div>
            </div>
          ))}
        </div>
        <motion.button type="button" className="calendar-focus"
          style={{ width: "100%", padding: 6, borderRadius: 8, border: 0, cursor: "pointer", background: T.primary, boxShadow: T.primaryShadow, color: "#fff", fontWeight: 500, fontSize: 14, lineHeight: "20px" }}
          whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.98 }} transition={SPRING_PRESS}>
          Share link
        </motion.button>
      </motion.div>
    </>
  );
}

/* ── component ──────────────────────────────────────────── */
export default function Calendar({ size = "card" }: { size?: "card" | "big" }) {
  const { rootRef, innerRef, box, scale } = useFit(size);
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>("closed");
  const groupId = useId();
  const tasks = size === "card" && box.h && box.h < 260 ? TASKS.slice(0, 2) : TASKS;

  const cardRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState<RippleTrigger>({ x: 0.5, y: 0.5, key: 0 });
  const fireRipple = (e: React.MouseEvent) => { const uv = computeRippleUV(e, cardRef.current); if (uv) setRipple((p) => ({ ...uv, key: p.key + 1 })); };

  const calendarTriggerRef = useRef<HTMLButtonElement>(null);
  const avatarTriggerRef = useRef<HTMLButtonElement>(null);
  const calendarCloseRef = useRef<HTMLButtonElement>(null);
  const guestsCloseRef = useRef<HTMLButtonElement>(null);
  const prevView = useRef<View>("closed");
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; } // never steal focus on page load
    if (view === "calendar") { prevView.current = "calendar"; const id = setTimeout(() => calendarCloseRef.current?.focus({ preventScroll: true }), 50); return () => clearTimeout(id); }
    if (view === "guests") { prevView.current = "guests"; const id = setTimeout(() => guestsCloseRef.current?.focus({ preventScroll: true }), 50); return () => clearTimeout(id); }
    (prevView.current === "guests" ? avatarTriggerRef : calendarTriggerRef).current?.focus({ preventScroll: true });
  }, [view]);

  return (
    <MotionConfig reducedMotion="user"><LayoutGroup id={groupId}>
      <style>{`.calendar-focus:focus-visible{outline:2px solid ${T.green};outline-offset:2px}`}</style>
      <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div ref={innerRef} data-own-click style={{ pointerEvents: "auto", width: 358, position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center", color: T.text }}>
          <motion.div layout
            style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 24, width: "100%", background: T.surface, boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.6)", gap: view === "calendar" ? 4 : 12, paddingTop: view === "calendar" ? 4 : 12, paddingLeft: 4, paddingRight: 4, paddingBottom: 4 }}
            transition={SPRING_LAYOUT} initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {view === "closed" ? (
                <motion.div key="closed" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: IN } }}>
                  <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}
                    initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.08 }}>
                    <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: T.muted, userSelect: "none" }}>Today</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <motion.button ref={calendarTriggerRef} type="button" onClick={() => setView("calendar")} aria-label="Open calendar" aria-haspopup="dialog" className="calendar-focus"
                        style={{ display: "grid", placeItems: "center", border: 0, padding: 0, background: "none", cursor: "pointer", borderRadius: 4 }}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }} transition={SPRING_PRESS}>
                        <CalendarIcon />
                      </motion.button>
                      <AvatarStack triggerRef={avatarTriggerRef} onClick={() => setView("guests")} />
                    </div>
                  </motion.div>
                  <motion.div ref={cardRef}
                    style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: 12, width: "100%", overflow: "hidden", borderRadius: "16px 16px 20px 20px", background: T.raised, boxShadow: T.raisedShadow }}
                    initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0.15 } : { ...SPRING_ENTRY, delay: 0.16 }}>
                    {tasks.map((t, i) => <TaskRow key={t.id} label={t.label} time={t.time} delayS={0.26 + i * 0.07} onRipple={fireRipple} />)}
                    <CardRipple trigger={ripple} />
                  </motion.div>
                </motion.div>
              ) : view === "calendar" ? (
                <motion.div key="calendar" style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }} exit={{ opacity: 0, transition: { duration: 0.08 } }}>
                  <CalendarExpanded onClose={() => setView("closed")} closeRef={calendarCloseRef} />
                </motion.div>
              ) : (
                <motion.div key="guests" style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }} exit={{ opacity: 0, transition: { duration: 0.08 } }}>
                  <GuestsExpanded onClose={() => setView("closed")} closeRef={guestsCloseRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </LayoutGroup></MotionConfig>
  );
}
