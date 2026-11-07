import { useState } from "react";

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
  const pct = ((value - min) / (max - min)) * 100;
  const digits = step < 0.01 ? 3 : step < 1 ? 2 : 0;
  return (
    <label className="sld">
      <span className="sldFill" style={{ width: `max(108px, ${pct}%)` }}>
        <span>{label}</span>
        <b />
      </span>
      <span className="sldDots" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</span>
      <em>{value.toFixed(digits)}{unit}</em>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </label>
  );
}
