import { useLayoutEffect, useRef, useState } from "react";

/* ── Small pieces ── */
export function useCopy() {
  const [done, setDone] = useState(false);
  return {
    done,
    copy: async (text: string) => {
      try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); } catch { /* still selectable */ }
    },
  };
}

export function CopyIcon({ done }: { done: boolean }) {
  return done ? (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#46a758" strokeWidth="1.8" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2" /><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" /></svg>
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
  const [drag, setDrag] = useState(false);
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
      <span className="sldName">{label}</span>
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
