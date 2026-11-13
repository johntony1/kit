import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { track } from "./track";

/* ── Small pieces ── */
export function useCopy(what: "prompt" | "code" = "code") {
  const [done, setDone] = useState(false);
  return {
    done,
    copy: async (text: string) => {
      try { await navigator.clipboard.writeText(text); setDone(true); track("copy", undefined, what); setTimeout(() => setDone(false), 1400); } catch { /* still selectable */ }
    },
  };
}

/** the copy glyph and its tick trade places: one shrinks and blurs out as the other comes in */
const ICON_OUT = { opacity: 0, scale: 0.25, filter: "blur(4px)" };
const ICON_IN = { opacity: 1, scale: 1, filter: "blur(0px)" };
export function CopyIcon({ done }: { done: boolean }) {
  const reduced = useReducedMotion();
  const swap = reduced ? { duration: 0 } : ({ type: "spring", duration: 0.3, bounce: 0 } as const);
  return (
    <span className="copyIco" aria-hidden="true">
      <AnimatePresence initial={false}>
        {done ? (
          <motion.svg key="done" initial={ICON_OUT} animate={ICON_IN} exit={ICON_OUT} transition={swap} viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#46a758" strokeWidth="1.8"><path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>
        ) : (
          <motion.svg key="copy" initial={ICON_OUT} animate={ICON_IN} exit={ICON_OUT} transition={swap} viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="5.5" y="5.5" width="8" height="8" rx="2" /><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" /></motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}

/** a label that changes without changing its button's width: every wording takes the same cell,
 *  so the widest sets the size and only the current one shows */
export function Stable({ value, options }: { value: string; options: readonly string[] }) {
  return (
    <span className="stable">
      {options.map((o) => <span key={o} aria-hidden={o !== value} style={o === value ? undefined : { visibility: "hidden" }}>{o}</span>)}
    </span>
  );
}

export function Code({ code, max, label }: { code: string; max?: number; label?: string }) {
  const { done, copy } = useCopy();
  return (
    <div className="code">
      <pre style={max ? { maxHeight: max } : undefined}><code>{code.replace(/\n$/, "")}</code></pre>
      <button type="button" className="iconBtn codeCopy" onClick={() => copy(code)} aria-label={done ? "Copied" : `Copy ${label ?? "code"}`}><CopyIcon done={done} /></button>
    </div>
  );
}

export function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div className="group">
      <div className="groupLabel">{label}</div>
      <div className="chips" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={o === value} className={`chip ${o === value ? "on" : ""}`} onClick={() => onChange(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

export function Slider({ label, value, min, max, step, onChange, unit = "" }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLSpanElement>(null);
  const [drag, setDrag] = useState(false);
  // the name rests at the left; when the handle comes down onto it, it steps to the handle's right
  const [nameLeft, setNameLeft] = useState(14);
  useLayoutEffect(() => {
    const t = track.current, n = name.current;
    if (!t || !n) return;
    const place = () => {
      const k = Math.min(1, Math.max(0, (value - min) / (max - min)));
      const handle = 6 + (t.clientWidth - 22) * k; // the handle's left edge
      setNameLeft(handle < 14 + n.offsetWidth + 8 ? Math.round(handle + 22) : 14);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(t);
    return () => ro.disconnect();
  }, [value, min, max, label]);
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const digits = step < 0.01 ? 3 : step < 1 ? 2 : 0;
  const snap = (v: number) => Number(Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min)).toFixed(6));
  // the handle travels from 6 px in on the left to 6 px in on the right; map the pointer onto that
  const fromX = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    const k = (x - r.left - 11) / Math.max(1, r.width - 22);
    return snap(min + Math.min(1, Math.max(0, k)) * (max - min));
  };
  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(true);
    onChange(fromX(e.clientX));
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => { if (drag) onChange(fromX(e.clientX)); };
  const up = () => setDrag(false);
  const key = (e: React.KeyboardEvent) => {
    const big = (max - min) / 10;
    const d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big }[e.key];
    if (d !== undefined) { e.preventDefault(); onChange(snap(value + d)); }
    if (e.key === "Home") { e.preventDefault(); onChange(min); }
    if (e.key === "End") { e.preventDefault(); onChange(max); }
  };
  return (
    <div ref={track} className={`sld ${drag ? "drag" : ""}`} role="slider" tabIndex={0} aria-label={label}
      aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value.toFixed(digits)}${unit}`}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
      <span className="sldFill" style={{ width: `calc(22px + (100% - 22px) * ${pct})` }}><b /></span>
      <span ref={name} className="sldName" style={{ left: nameLeft }}>{label}</span>
      <span className="sldDots" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</span>
      <em>{value.toFixed(digits)}{unit}</em>
    </div>
  );
}

/** segmented tabs whose highlight slides to the chosen option */
export function Seg<T extends string>({ value, options, onChange, label, role = "tablist" }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string; role?: "tablist" | "radiogroup" }) {
  const box = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const el = box.current?.querySelector<HTMLButtonElement>(`[data-v="${CSS.escape(value)}"]`);
    if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth });
  }, [value, options]);
  const item = role === "tablist" ? "tab" : "radio";
  return (
    <div ref={box} className="seg" role={role} aria-label={label}>
      {thumb && <span className="segThumb" aria-hidden="true" style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }} />}
      {options.map((o) => (
        <button key={o} type="button" role={item} data-v={o}
          {...(item === "tab" ? { "aria-selected": o === value } : { "aria-checked": o === value })}
          className={`segBtn ${o === value ? "on" : ""}`} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

/* ── Switch ───────────────────────────────────────────────
 * A rounded rectangle, not a pill: the track is 23:16, the thumb is a near-square with its own
 * hairline border and a soft drop shadow, as tall as the track so it sits on the edge.
 * Off: a dark inset well. On: a green gradient with a darker green rim and a top highlight.
 * Press and the thumb stretches toward where it is going; release and it springs across.
 * The hit area is padded to at least 24px tall around the 16px (or larger) body. */
const SW_SPRING = { type: "spring", stiffness: 700, damping: 42, mass: 0.7 } as const;
export function Switch({ checked, onChange, label, h = 16, focus }: { checked: boolean; onChange: (v: boolean) => void; label: string; h?: number; focus?: string }) {
  const w = Math.round(h * 1.45), tw = Math.round(h * 0.84), travel = w - tw;
  const [press, setPress] = useState(false);
  const reduced = useReducedMotion();
  const stretch = press ? Math.round(h * 0.2) : 0;
  const r = h * 0.3, rt = h * 0.27;
  const up = () => setPress(false);
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={focus}
      onClick={() => onChange(!checked)} onPointerDown={() => setPress(true)} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}
      style={{ position: "relative", width: w, height: h, padding: 0, border: 0, background: "transparent", cursor: "pointer", flexShrink: 0, borderRadius: r, WebkitTapHighlightColor: "transparent" }}>
      <span aria-hidden style={{ position: "absolute", inset: `${-Math.max(4, (24 - h) / 2)}px -6px` }} />
      <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: r, background: "var(--sw-track, linear-gradient(180deg,#363936,#414441))", boxShadow: "var(--sw-ring, inset 0 1px 2px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.04))" }} />
      <motion.span aria-hidden initial={false} animate={{ opacity: checked ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.16, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: r, background: "linear-gradient(180deg,#3ccb73,#1c9747)", boxShadow: "inset 0 0 0 1px #12753a, inset 0 1px 0 rgba(255,255,255,.3), 0 0 0 .5px rgba(0,0,0,.45)" }} />
      <motion.span aria-hidden initial={false} animate={{ x: checked ? travel - stretch : 0, width: tw + stretch }} transition={reduced ? { duration: 0 } : SW_SPRING}
        style={{ position: "absolute", top: 0, left: 0, height: h, borderRadius: rt, background: "linear-gradient(180deg,#ffffff,#eaedea)",
          boxShadow: `inset 0 0 0 1px ${checked ? "rgba(18,117,58,.85)" : "rgba(0,0,0,.32)"}, inset 0 1.5px 0 #fff, 0 1px 1.5px rgba(0,0,0,.35), 0 3px 6px -2px rgba(0,0,0,.45)`,
          transition: "box-shadow 160ms ease" }} />
    </button>
  );
}
