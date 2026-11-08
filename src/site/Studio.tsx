// The Studio: one workbench for every effect. A schema per effect drives the panel
// (DialKit style: sliders, chips, toggles, colours, text in folders), the preview runs
// live, and the result exports as code, a prompt, or a link.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Ripple, type RippleHandle } from "../ripple/RippleCanvas";
import { RIPPLE_DEFAULTS } from "../ripple/ripple";
import { PROMPT as RIPPLE_PROMPT } from "../ripple/prompt";
import { CONFETTI_DEFAULTS } from "../confetti/confetti";
import { CONFETTI_PROMPT } from "../confetti/prompt";
import { OrbRipple, QrRipple } from "../demos/RippleDemos";
import { SuccessCard } from "../demos/ConfettiDemos";
import { TYPE_EFFECTS, type TypeEffectKey } from "../type/effects";
import { TYPE_META } from "../type/meta";
import { typePrompt } from "../type/prompt";
import { TypeCanvas } from "../type/TypeCanvas";
import { CopyIcon, Seg, Slider, Switch, useCopy } from "./ui";

export type StudioLib = "ripple" | "confetti" | TypeEffectKey;
type V = Record<string, string | number | boolean>;

/* ── the schema ── */
type Tag = "strength" | "speed" | "slow" | "size" | "accent" | "fg" | "bg";
type Control =
  | { key: string; label: string; kind: "slider"; min: number; max: number; step: number; unit?: string; tag?: Tag }
  | { key: string; label: string; kind: "chips"; options: string[] }
  | { key: string; label: string; kind: "toggle" }
  | { key: string; label: string; kind: "color"; tag?: Tag }
  | { key: string; label: string; kind: "text" };
interface Group { title: string; controls: Control[] }
interface Spec {
  name: string;
  groups: Group[];
  defaults: V;
  presets: { name: string; values: Partial<V> }[];
  code: (v: V) => string;
  prompt: (v: V) => string;
}

const PALETTES: Record<string, string[]> = {
  Mint: CONFETTI_DEFAULTS.colors,
  Party: ["#1fc16b", "#fa7319", "#f5c028", "#b197fc", "#38bdf8"],
  Mono: ["#ffffff", "#e5e5e5", "#a3a3a3", "#d4d4d4"],
  Ocean: ["#38bdf8", "#22d3ee", "#818cf8", "#e0f2fe", "#7dd3fc"],
  Sunset: ["#fb7185", "#f97316", "#facc15", "#fda4af", "#fdba74"],
};

const fmt = (v: unknown) => (typeof v === "string" ? `"${v}"` : `{${v}}`);
const changed = (v: V, d: V, keys: string[]) => keys.filter((k) => v[k] !== d[k]);
const valuesBlock = (v: V, d: V) => {
  const c = Object.keys(v).filter((k) => v[k] !== d[k]);
  return c.length ? `\n\n## Use these values (tuned in the Studio)\n${c.map((k) => `- ${k}: ${v[k]}`).join("\n")}\n` : "";
};

function rippleSpec(): Spec {
  const defaults: V = { source: "Orb", glowColor: "#7b6cff", intensity: 0.07, frequency: RIPPLE_DEFAULTS.frequency, reach: RIPPLE_DEFAULTS.reach, burst: RIPPLE_DEFAULTS.burst, fade: RIPPLE_DEFAULTS.fade, aberration: RIPPLE_DEFAULTS.aberration, glow: 1.3, duration: RIPPLE_DEFAULTS.duration, fireOn: "click", autoEvery: 0 };
  const keys = ["glowColor", "intensity", "frequency", "reach", "burst", "fade", "aberration", "glow", "duration", "fireOn"];
  return {
    name: "Ripple",
    defaults,
    groups: [
      { title: "Source", controls: [{ key: "source", label: "What it ripples", kind: "chips", options: ["Orb", "QR code", "Your image"] }] },
      { title: "Wave", controls: [
        { key: "intensity", label: "Intensity", kind: "slider", min: 0, max: 0.25, step: 0.005, tag: "strength" },
        { key: "frequency", label: "Frequency", kind: "slider", min: 2, max: 90, step: 1 },
        { key: "aberration", label: "Colour split", kind: "slider", min: 0, max: 0.08, step: 0.001, tag: "strength" },
      ] },
      { title: "Motion", controls: [
        { key: "reach", label: "Reach", kind: "slider", min: 0.1, max: 2, step: 0.05, tag: "size" },
        { key: "burst", label: "Burst", kind: "slider", min: 0.3, max: 12, step: 0.1, tag: "speed" },
        { key: "fade", label: "Fade", kind: "slider", min: 0.1, max: 4, step: 0.05, tag: "speed" },
        { key: "duration", label: "Lifetime", kind: "slider", min: 0.5, max: 6, step: 0.1, unit: "s", tag: "slow" },
      ] },
      { title: "Glow", controls: [
        { key: "glowColor", label: "Colour", kind: "color", tag: "accent" },
        { key: "glow", label: "Brightness", kind: "slider", min: 0, max: 8, step: 0.1, unit: "×", tag: "strength" },
      ] },
      { title: "Trigger", controls: [
        { key: "fireOn", label: "Fire on", kind: "chips", options: ["click", "hover", "none"] },
        { key: "autoEvery", label: "Auto, every", kind: "slider", min: 0, max: 6, step: 0.5, unit: "s" },
      ] },
    ],
    presets: [
      { name: "Original", values: {} },
      { name: "Subtle", values: { intensity: 0.03, glow: 0.6, aberration: 0.004, frequency: 18 } },
      { name: "Electric", values: { intensity: 0.12, glow: 4, aberration: 0.03, frequency: 40, glowColor: "#1d9fff" } },
      { name: "Slow water", values: { burst: 1.2, fade: 0.4, duration: 5, intensity: 0.05, glow: 0.4, frequency: 14, glowColor: "#ffffff" } },
    ],
    code: (v) => {
      const c = changed(v, { ...RIPPLE_DEFAULTS, fireOn: "none" } as unknown as V, keys);
      return `<Ripple\n  src="/your-image.png"\n  width={320}\n  height={320}${c.map((k) => `\n  ${k}=${fmt(v[k])}`).join("")}\n/>`;
    },
    prompt: (v) => RIPPLE_PROMPT + valuesBlock(v, defaults),
  };
}

function confettiSpec(): Spec {
  const defaults: V = { colors: "Mint", count: CONFETTI_DEFAULTS.count, spread: 1, gravity: CONFETTI_DEFAULTS.gravity, duration: CONFETTI_DEFAULTS.duration, pop: true, glow: true, glowColor: "#4ade80" };
  return {
    name: "Confetti pop",
    defaults,
    groups: [
      { title: "Confetti", controls: [
        { key: "colors", label: "Colours", kind: "chips", options: Object.keys(PALETTES) },
        { key: "count", label: "Pieces", kind: "slider", min: 5, max: 300, step: 1, tag: "size" },
        { key: "spread", label: "Spread", kind: "slider", min: 0.2, max: 3, step: 0.05, unit: "×", tag: "strength" },
      ] },
      { title: "Physics", controls: [
        { key: "gravity", label: "Gravity", kind: "slider", min: 0, max: 0.8, step: 0.01, tag: "speed" },
        { key: "duration", label: "Duration", kind: "slider", min: 0.4, max: 8, step: 0.1, unit: "s", tag: "slow" },
      ] },
      { title: "Pop and glow", controls: [
        { key: "pop", label: "Pop the badge", kind: "toggle" },
        { key: "glow", label: "Glow", kind: "toggle" },
        { key: "glowColor", label: "Glow colour", kind: "color", tag: "accent" },
      ] },
    ],
    presets: [
      { name: "Original", values: {} },
      { name: "Gentle", values: { count: 30, spread: 0.7, gravity: 0.1, duration: 2.4 } },
      { name: "Party", values: { colors: "Party", count: 160, spread: 1.4 } },
      { name: "Snow", values: { colors: "Mono", count: 120, spread: 0.6, gravity: 0.04, duration: 6, glow: false } },
    ],
    code: (v) => {
      const props = [
        v.colors !== "Mint" && `  colors={${JSON.stringify(PALETTES[v.colors as string]).replace(/,/g, ", ")}}`,
        ...["count", "spread", "gravity", "duration"].filter((k) => v[k] !== defaults[k]).map((k) => `  ${k}={${v[k]}}`),
        v.pop === false && "  pop={false}",
        v.glow === false ? "  glow={false}" : v.glowColor !== defaults.glowColor && `  glow="${v.glowColor}"`,
      ].filter(Boolean);
      return `<ConfettiPop within={card} trigger={done}${props.length ? "\n" + props.join("\n") + "\n" : ""}>\n  <CheckBadge />\n</ConfettiPop>`;
    },
    prompt: (v) => CONFETTI_PROMPT + valuesBlock(v, defaults),
  };
}

const FAMILIES = ["Inter", "Fredoka", "Instrument Serif", "JetBrains Mono"];
function typeSpec(k: TypeEffectKey): Spec {
  const e = TYPE_EFFECTS[k];
  const L = e.look;
  const defaults: V = {
    text: L.text ?? "", family: L.family ?? "Inter", weight: Number(L.weight ?? 800), tracking: L.tracking ?? -0.04, leading: L.leading ?? 0.92,
    fit: L.fit ?? 0.78, uppercase: L.uppercase ?? false, fg: L.fg ?? "#ffffff", bg: L.bg ?? "#000000",
    ...Object.fromEntries(Object.entries(e.params).map(([n, p]) => [n, p.value])),
  };
  const paramKeys = Object.keys(e.params);
  const tagOf = (n: string): Tag | undefined => (/speed/.test(n) ? "speed" : /every|rate/.test(n) ? "slow" : /size|band|width|pitch|reach/.test(n) ? "size" : /strength|amount|split|wave|bend|turn|zoom|ghosts|grain|tint|stretch/.test(n) ? "strength" : undefined);
  return {
    name: e.name,
    defaults,
    groups: [
      { title: "Text", controls: [
        { key: "text", label: "Words", kind: "text" },
        { key: "family", label: "Font", kind: "chips", options: FAMILIES },
        { key: "uppercase", label: "Capitals", kind: "toggle" },
      ] },
      { title: "Typography", controls: [
        { key: "weight", label: "Weight", kind: "slider", min: 300, max: 900, step: 100 },
        { key: "fit", label: "Size", kind: "slider", min: 0.2, max: 1.2, step: 0.01, tag: "size" },
        { key: "tracking", label: "Tracking", kind: "slider", min: -0.12, max: 0.2, step: 0.005, unit: "em" },
        { key: "leading", label: "Leading", kind: "slider", min: 0.7, max: 1.4, step: 0.01 },
      ] },
      { title: "Colour", controls: [
        { key: "fg", label: "Text", kind: "color", tag: "fg" },
        { key: "bg", label: "Background", kind: "color", tag: "bg" },
      ] },
      { title: "Effect", controls: paramKeys.map((n) => {
        const p = e.params[n];
        const span = p.max - p.min;
        return { key: n, label: p.label, kind: "slider" as const, min: Math.max(p.min >= 0 ? 0 : -Infinity, p.min - span * 0.25), max: p.max + span * 0.5, step: p.step, tag: tagOf(n) };
      }) },
    ],
    presets: [
      { name: "Original", values: {} },
      ...TYPE_META[k].swatches.slice(1).map(([fg, bg], i) => ({ name: `Colours ${i + 2}`, values: { fg, bg } })),
      { name: "Small variant", values: { ...(TYPE_META[k].small as Partial<V>), ...(TYPE_META[k].small.params ?? {}) } },
      { name: "Wide variant", values: { ...(TYPE_META[k].wide as Partial<V>), ...(TYPE_META[k].wide.params ?? {}) } },
    ].map((p) => ({ ...p, values: Object.fromEntries(Object.entries(p.values).filter(([key]) => key in defaults)) as Partial<V> })),
    code: (v) => {
      const top = ["text", "family", "weight", "tracking", "leading", "fit", "uppercase", "fg", "bg"].filter((n) => v[n] !== defaults[n])
        .map((n) => `  ${n}=${n === "weight" ? `"${v[n]}"` : n === "text" ? JSON.stringify(v[n]) : fmt(v[n])}`);
      const ps = paramKeys.filter((n) => v[n] !== defaults[n]);
      return `<TypeCanvas\n  effect={${k}}${top.length ? "\n" + top.join("\n") : ""}${ps.length ? `\n  params={{ ${ps.map((n) => `${n}: ${v[n]}`).join(", ")} }}` : ""}\n  style={{ width: "100%", height: 400 }}\n/>`;
    },
    prompt: (v) => typePrompt(e, TYPE_META[k].desc) + valuesBlock(v, defaults),
  };
}

function specFor(lib: StudioLib): Spec {
  return lib === "ripple" ? rippleSpec() : lib === "confetti" ? confettiSpec() : typeSpec(lib);
}

/* ── describe it: words move the right knobs (runs here, no AI service) ── */
const COLOR_WORDS: Record<string, string> = { blue: "#1d9fff", violet: "#7b6cff", purple: "#8b5cf6", pink: "#ff4fa3", red: "#ef4444", orange: "#ff7a1a", gold: "#f5c028", yellow: "#facc15", green: "#22c55e", mint: "#4ade80", white: "#ffffff", black: "#0b0b0b" };
function describe(text: string, spec: Spec, v: V): { next: V; said: string } {
  const t = text.toLowerCase();
  const next = { ...v };
  const notes: string[] = [];
  const sliders = spec.groups.flatMap((g) => g.controls).filter((c): c is Extract<Control, { kind: "slider" }> => c.kind === "slider");
  const scale = (tag: Tag, k: number, why: string) => {
    const hit = sliders.filter((c) => c.tag === tag);
    for (const c of hit) next[c.key] = Number(Math.min(c.max, Math.max(c.min, (next[c.key] as number) * k)).toFixed(4));
    if (hit.length) notes.push(`${why}: ${hit.map((c) => c.label.toLowerCase()).join(", ")}`);
  };
  if (/subtle|soft|calm|gentle|less|quiet|tone it down/.test(t)) scale("strength", 0.6, "softer");
  if (/bold|strong|intense|more|punch|loud|dramatic/.test(t)) scale("strength", 1.5, "stronger");
  if (/fast|quick|snappy/.test(t)) { scale("speed", 1.5, "faster"); scale("slow", 0.67, "shorter"); }
  if (/slow|lazy|relaxed|floaty/.test(t)) { scale("speed", 0.67, "slower"); scale("slow", 1.5, "longer"); }
  if (/big|large|wide|huge/.test(t)) scale("size", 1.3, "bigger");
  if (/small|tiny|tight|narrow/.test(t)) scale("size", 0.75, "smaller");
  for (const [w, hex] of Object.entries(COLOR_WORDS)) {
    if (!new RegExp(`\\b${w}\\b`).test(t)) continue;
    const accent = spec.groups.flatMap((g) => g.controls).find((c) => c.kind === "color" && (c.tag === "accent" || (/background|bg/.test(t) ? c.tag === "bg" : c.tag === "fg")));
    if (accent) { next[accent.key] = hex; notes.push(`${accent.label.toLowerCase()} ${w}`); }
    break;
  }
  if (/reset|original|start over/.test(t)) return { next: { ...spec.defaults }, said: "Back to the original." };
  return { next, said: notes.length ? `Changed ${notes.join("; ")}.` : "I didn't catch that. Try words like subtle, bolder, faster, slower, bigger, smaller, or a colour." };
}

/* ── controls ── */
function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="colorCtl">
      <span className="colorName">{label}</span>
      <span className="colorVal">{value.toUpperCase()}</span>
      <span className="colorDot" style={{ background: value }} />
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    </label>
  );
}

function ControlView({ c, v, set }: { c: Control; v: V; set: (k: string, x: string | number | boolean) => void }) {
  if (c.kind === "slider") return <Slider label={c.label} value={v[c.key] as number} min={c.min} max={c.max} step={c.step} unit={c.unit} onChange={(x) => set(c.key, x)} />;
  if (c.kind === "color") return <ColorControl label={c.label} value={v[c.key] as string} onChange={(x) => set(c.key, x)} />;
  if (c.kind === "text") return <textarea className="textIn" rows={2} value={v[c.key] as string} onChange={(e) => set(c.key, e.target.value)} aria-label={c.label} spellCheck={false} />;
  if (c.kind === "toggle") return (
    <div className="colorCtl switchCtl" onClick={(e) => { if (!(e.target as HTMLElement).closest("button")) set(c.key, !v[c.key]); }}>
      <span className="colorName">{c.label}</span>
      <Switch checked={!!v[c.key]} onChange={(x) => set(c.key, x)} label={c.label} />
    </div>
  );
  const opts = c.options;
  const cur = v[c.key] as string;
  return (
    <div className="group">
      <div className="groupLabel">{c.label}</div>
      <div className="chips" role="radiogroup" aria-label={c.label}>
        {opts.map((o) => <button key={o} type="button" role="radio" aria-checked={o === cur} className={`chip ${o === cur ? "on" : ""}`} onClick={() => set(c.key, o)}>{o}</button>)}
      </div>
    </div>
  );
}

/* ── previews ── */
function Preview({ lib, v, playKey }: { lib: StudioLib; v: V; playKey: number }) {
  const ref = useRef<RippleHandle>(null);
  const [img, setImg] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const every = Number(v.autoEvery ?? 0);
  useEffect(() => {
    if (lib !== "ripple" || !every) return;
    const id = setInterval(() => ref.current?.fire(0.5, 0.5), every * 1000);
    return () => clearInterval(id);
  }, [lib, every]);
  useEffect(() => { if (playKey && lib === "ripple") ref.current?.fire(); }, [playKey, lib]);

  if (lib === "ripple") {
    const o = { intensity: v.intensity as number, frequency: v.frequency as number, reach: v.reach as number, burst: v.burst as number, fade: v.fade as number, aberration: v.aberration as number, glow: v.glow as number, glowColor: v.glowColor as string, duration: v.duration as number };
    const fireOn = v.fireOn as "click" | "hover" | "none";
    return (
      <div className="studioStage" style={{ background: v.source === "Orb" ? "#000" : undefined }}>
        {v.source === "Orb" && <OrbRipple options={{ ...o }} rippleRef={ref} />}
        {v.source === "QR code" && <div className="studioCenter"><QrRipple options={o} rippleRef={ref} /></div>}
        {v.source === "Your image" && (
          <div className="studioCenter">
            {img ? <Ripple key={img} ref={ref} src={img} width={420} height={420} radius={16} fireOn={fireOn} {...o} label="Your image. Click to ripple." style={{ maxWidth: "80%", height: "auto" }} />
              : <button type="button" className="dropZone" onClick={() => file.current?.click()}>Choose an image<br /><span>PNG, JPG or a screenshot</span></button>}
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setImg(URL.createObjectURL(f)); }} />
            {img && <button type="button" className="btn line swapImg" onClick={() => file.current?.click()}>Change image</button>}
          </div>
        )}
      </div>
    );
  }
  if (lib === "confetti") {
    const options = { colors: PALETTES[v.colors as string], count: v.count as number, spread: v.spread as number, gravity: v.gravity as number, duration: v.duration as number, pop: v.pop as boolean, glow: v.glow ? (v.glowColor as string) : (false as const) };
    return <div className="studioStage"><div className="studioCenter"><SuccessCard options={options} trigger={playKey} /></div></div>;
  }
  const e = TYPE_EFFECTS[lib];
  const params = Object.fromEntries(Object.keys(e.params).map((n) => [n, v[n] as number]));
  return (
    <div className="studioStage" style={{ background: v.bg as string }}>
      <TypeCanvas effect={e} text={v.text as string} family={v.family as string} weight={String(v.weight)} tracking={v.tracking as number}
        leading={v.leading as number} fit={v.fit as number} uppercase={v.uppercase as boolean} fg={v.fg as string} bg={v.bg as string} params={params} />
    </div>
  );
}

/* ── presets (saved in this browser) ── */
function usePresets(lib: StudioLib) {
  const key = `studio-presets-${lib}`;
  const read = () => { try { return JSON.parse(localStorage.getItem(key) ?? "[]") as { name: string; values: V }[]; } catch { return []; } };
  const [list, setList] = useState(read);
  useEffect(() => setList(read()), [lib]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = (next: { name: string; values: V }[]) => { setList(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* private mode */ } };
  return { list, save };
}

function Menu({ label, children, open, setOpen }: { label: ReactNode; children: ReactNode; open: boolean; setOpen: (o: boolean) => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    addEventListener("pointerdown", off);
    return () => removeEventListener("pointerdown", off);
  }, [open, setOpen]);
  return (
    <div className="menuWrap" ref={box}>
      <button type="button" className="topPill small" aria-expanded={open} onClick={() => setOpen(!open)}>{label}<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 4 5 6.5 7.5 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      {open && <div className="menu" role="menu">{children}</div>}
    </div>
  );
}

/* ── the Studio ── */
export function Studio({ lib, libs, go }: { lib: StudioLib; libs: { k: StudioLib; name: string; group: string }[]; go: (lib: StudioLib) => void }) {
  const spec = useMemo(() => specFor(lib), [lib]);
  const fromHash = () => {
    try { const q = new URLSearchParams(location.hash.split("?")[1] ?? "").get("s"); return q ? (JSON.parse(decodeURIComponent(atob(q))) as V) : null; } catch { return null; }
  };
  const [v, setV] = useState<V>(() => ({ ...spec.defaults, ...(fromHash() ?? {}) }));
  const set = (k: string, x: string | number | boolean) => setV((p) => ({ ...p, [k]: x }));
  const [tab, setTab] = useState<"Manual controls" | "Describe">("Manual controls");
  const [playKey, setPlayKey] = useState(0);
  const [pickOpen, setPickOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const { list, save } = usePresets(lib);
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>([]);
  const [ask, setAsk] = useState("");
  const code = useCopy(), prompt = useCopy(), link = useCopy();
  const codeText = spec.code(v);

  const send = () => {
    if (!ask.trim()) return;
    const { next, said } = describe(ask, spec, v);
    setV(next);
    setChat((c) => [...c, { me: true, text: ask }, { me: false, text: said }]);
    setAsk("");
    setPlayKey((n) => n + 1);
  };
  const share = () => {
    const s = btoa(encodeURIComponent(JSON.stringify(v)));
    const url = `${location.origin}${location.pathname}#/studio/${lib}?s=${s}`;
    link.copy(url);
  };

  return (
    <div className="studio">
      <div className="studioBar">
        <Menu open={pickOpen} setOpen={setPickOpen} label={<span className="pickName">{spec.name}</span>}>
          {["Libraries", "Type"].map((g) => (
            <div key={g}>
              <div className="menuHead">{g}</div>
              {libs.filter((x) => x.group === g).map((x) => (
                <button key={x.k} type="button" role="menuitem" className={`menuItem ${x.k === lib ? "on" : ""}`} onClick={() => { setPickOpen(false); go(x.k); }}>{x.name}</button>
              ))}
            </div>
          ))}
        </Menu>
        <div className="studioBarRight">
          <Menu open={presetOpen} setOpen={setPresetOpen} label="Presets">
            <div className="menuHead">Built in</div>
            {spec.presets.map((p) => (
              <button key={p.name} type="button" role="menuitem" className="menuItem" onClick={() => { setV({ ...spec.defaults, ...p.values } as V); setPresetOpen(false); setPlayKey((n) => n + 1); }}>{p.name}</button>
            ))}
            <div className="menuHead">Yours</div>
            {list.length === 0 && <p className="menuEmpty">None saved yet.</p>}
            {list.map((p, i) => (
              <div key={p.name + i} className="menuRow">
                <button type="button" role="menuitem" className="menuItem" onClick={() => { setV({ ...spec.defaults, ...p.values }); setPresetOpen(false); setPlayKey((n) => n + 1); }}>{p.name}</button>
                <button type="button" className="menuX" aria-label={`Delete ${p.name}`} onClick={() => save(list.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <form className="menuSave" onSubmit={(e) => { e.preventDefault(); save([...list, { name: presetName.trim() || `Preset ${list.length + 1}`, values: v }]); setPresetName(""); }}>
              <input className="menuIn" placeholder={`Preset ${list.length + 1}`} value={presetName} onChange={(e) => setPresetName(e.target.value)} aria-label="Preset name" />
              <button type="submit" className="btn line">Save</button>
            </form>
          </Menu>
          <button type="button" className="round" aria-label="Reset to the original" title="Reset" onClick={() => { setV({ ...spec.defaults }); setPlayKey((n) => n + 1); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.5-3.6M3 3v3h3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className="topPill small" onClick={share}><CopyIcon done={link.done} />{link.done ? "Link copied" : "Share link"}</button>
          <button type="button" className="btn primary" onClick={() => prompt.copy(spec.prompt(v))}><CopyIcon done={prompt.done} />{prompt.done ? "Copied" : "Copy prompt"}</button>
        </div>
      </div>

      <div className="studioBody">
        <div className="studioLeft">
          <div className="panel studioCanvas">
            <Preview lib={lib} v={v} playKey={playKey} />
            {(lib === "ripple" || lib === "confetti") && <button type="button" className="btn line playBtn" onClick={() => setPlayKey((n) => n + 1)}>Play</button>}
          </div>
          <div className="code studioCode">
            <pre><code>{codeText}</code></pre>
            <button type="button" className="iconBtn codeCopy" onClick={() => code.copy(codeText)} aria-label={code.done ? "Copied" : "Copy code"}><CopyIcon done={code.done} /></button>
          </div>
        </div>

        <aside className="panel studioPanel">
          <div className="studioTabs">
            <Seg label="Mode" value={tab} options={["Manual controls", "Describe"] as const} onChange={setTab} />
          </div>
          {tab === "Manual controls" ? (
            <div className="studioGroups">
              {spec.groups.map((g) => (
                <section key={g.title} className="studioGroup">
                  <h3 className="studioGroupTitle">{g.title}</h3>
                  {g.controls.map((c) => <ControlView key={c.key} c={c} v={v} set={set} />)}
                </section>
              ))}
            </div>
          ) : (
            <div className="describe">
              <div className="chat">
                {chat.length === 0 && <p className="chatHint">Say how it should feel, and the right knobs move. Try "more subtle", "faster", "bigger" or "pink". It reads your words here in the browser; nothing is sent anywhere.</p>}
                {chat.map((m, i) => <p key={i} className={`bubble ${m.me ? "me" : ""}`}>{m.text}</p>)}
              </div>
              <form className="askRow" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <input className="askIn" placeholder="Make it more subtle" value={ask} onChange={(e) => setAsk(e.target.value)} aria-label="Describe the change" />
                <button type="submit" className="btn primary" disabled={!ask.trim()}>Send</button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
