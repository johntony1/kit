import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import rippleTs from "./ripple/ripple.ts?raw";
import rippleTsx from "./ripple/RippleCanvas.tsx?raw";
import confettiTs from "./confetti/confetti.ts?raw";
import confettiTsx from "./confetti/ConfettiPop.tsx?raw";
import { PROMPT as RIPPLE_PROMPT } from "./ripple/prompt";
import { CONFETTI_PROMPT } from "./confetti/prompt";
import { RIPPLE_DEFAULTS } from "./ripple/ripple";
import { CONFETTI_DEFAULTS } from "./confetti/confetti";
import type { RippleHandle } from "./ripple/RippleCanvas";
import { OrbRipple, QrRipple, TypeRipple } from "./demos/RippleDemos";
import { LikePop, SuccessCard, TaskPop } from "./demos/ConfettiDemos";

const REPO = "https://github.com/johntony1/qr-code-animatio";

/* ── Routing: #/ripple, #/confetti, #/introduction ── */
type Route = "intro" | "ripple" | "confetti";
const ORDER: Route[] = ["intro", "ripple", "confetti"];
function useRoute(): [Route, (r: Route) => void] {
  const read = (): Route => {
    const h = location.hash.replace(/^#\/?/, "");
    return h === "ripple" || h === "confetti" ? h : h === "introduction" ? "intro" : "ripple";
  };
  const [r, setR] = useState<Route>(read);
  useEffect(() => {
    const on = () => { setR(read()); window.scrollTo(0, 0); };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return [r, (next) => { location.hash = `/${next === "intro" ? "introduction" : next}`; }];
}

/* ── Small pieces ── */
function useCopy() {
  const [done, setDone] = useState(false);
  return {
    done,
    copy: async (text: string) => {
      try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); } catch { /* still selectable */ }
    },
  };
}

function CopyIcon({ done }: { done: boolean }) {
  return done ? (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#46a758" strokeWidth="1.8" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2" /><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" /></svg>
  );
}

function Code({ code, max, label }: { code: string; max?: number; label?: string }) {
  const { done, copy } = useCopy();
  return (
    <div className="code">
      <pre style={max ? { maxHeight: max } : undefined}><code>{code.replace(/\n$/, "")}</code></pre>
      <button type="button" className="iconBtn codeCopy" onClick={() => copy(code)} aria-label={done ? "Copied" : `Copy ${label ?? "code"}`}><CopyIcon done={done} /></button>
    </div>
  );
}

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
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

function Slider({ label, value, min, max, step, onChange, unit = "" }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  const digits = step < 0.01 ? 3 : step < 1 ? 2 : 0;
  return (
    <div className="group">
      <div className="groupLabel">{label}</div>
      <label className="slider" style={{ ["--p" as string]: `${pct}%` }}>
        <span className="sliderName">{label}</span>
        <span className="sliderVal">{value.toFixed(digits)}{unit}</span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
      </label>
    </div>
  );
}

/* ── Icons ── */
function RippleIcon() {
  return <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="#8b7dff" /><circle cx="12" cy="12" r="6.5" stroke="#8b7dff" strokeOpacity=".6" strokeWidth="1.3" /><circle cx="12" cy="12" r="10" stroke="#8b7dff" strokeOpacity=".3" strokeWidth="1.3" /></svg>;
}
function ConfettiIcon() {
  return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><circle cx="12" cy="13" r="3.4" fill="#fff" /><rect x="4" y="4" width="3" height="3" rx=".6" fill="#1fc16b" transform="rotate(20 5.5 5.5)" /><rect x="17" y="3.5" width="2.4" height="3.6" rx=".6" fill="#fa7319" transform="rotate(-30 18 5)" /><circle cx="19.5" cy="14" r="1.4" fill="#f5c028" /><circle cx="4.6" cy="15" r="1.3" fill="#b197fc" /><rect x="11" y="2.5" width="2" height="3" rx=".5" fill="#f5c028" /></svg>;
}
function IntroIcon() {
  return <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 5.5h14M5 12h14M5 18.5h9" strokeLinecap="round" /></svg>;
}

const LIBS = {
  ripple: { name: "Ripple", icon: <RippleIcon />, desc: "A ring of light that bursts out of a point, bends whatever is under it and splits its colours." },
  confetti: { name: "Confetti pop", icon: <ConfettiIcon />, desc: "An element pops in with a blur and an overshoot, confetti bursts out of it and a glow blooms behind." },
} as const;

/* ── Install tab ── */
function Install({ lib, fw }: { lib: "ripple" | "confetti"; fw: "React" | "JavaScript" }) {
  const files = lib === "ripple"
    ? (fw === "React" ? [["ripple.ts", rippleTs], ["RippleCanvas.tsx", rippleTsx]] : [["ripple.ts", rippleTs]])
    : (fw === "React" ? [["confetti.ts", confettiTs], ["ConfettiPop.tsx", confettiTsx]] : [["confetti.ts", confettiTs]]);
  const usage = lib === "ripple"
    ? fw === "React"
      ? `import { Ripple } from "./RippleCanvas";\n\n<Ripple src="/your-image.png" width={320} height={320} fireOn="click" />`
      : `import { createRipple } from "./ripple";\n\nconst ripple = createRipple(canvas, image, { glowColor: "#1d9fff" });\nripple.fire();            // from the centre\nripple.fire(0.2, 0.8);    // from a point`
    : fw === "React"
      ? `import { ConfettiPop } from "./ConfettiPop";\n\n<ConfettiPop trigger={done}>\n  <CheckBadge />\n</ConfettiPop>`
      : `import { confettiPop } from "./confetti";\n\nconfettiPop(document.querySelector(".badge"));`;
  return (
    <div className="panel installPanel">
      <h3 className="installHead">Installation</h3>
      <p className="installNote">No package. Copy {files.length === 1 ? "this file" : "these files"} into your project. No dependencies{fw === "React" ? " beyond React" : ""}.</p>
      {files.map(([name, src]) => (
        <div key={name} className="file">
          <div className="fileName">{name}</div>
          <Code code={src} max={260} label={name} />
        </div>
      ))}
      <h3 className="installHead">Usage</h3>
      <Code code={usage} label="usage" />
    </div>
  );
}

/* ── Ripple ── */
const R_SOURCES = ["Orb", "QR code", "Type"] as const;
const R_COLORS = { Violet: "#7b6cff", Blue: "#1d9fff", Pink: "#ff4fa3", Orange: "#ff7a1a", Green: "#22c55e", White: "#ffffff" } as const;

function RipplePreview() {
  return (
    <div className="previewGrid">
      <div className="panel hero"><OrbRipple /></div>
      <div className="panel small"><QrRipple /><span className="panelHint">Click the code</span></div>
      <div className="panel wide"><TypeRipple /><span className="panelHint">Click anywhere</span></div>
    </div>
  );
}

function RipplePlayground() {
  const [src, setSrc] = useState<(typeof R_SOURCES)[number]>("Orb");
  const [color, setColor] = useState<keyof typeof R_COLORS>("Violet");
  const [o, setO] = useState({ intensity: 0.07, frequency: RIPPLE_DEFAULTS.frequency, reach: RIPPLE_DEFAULTS.reach, fade: RIPPLE_DEFAULTS.fade, aberration: RIPPLE_DEFAULTS.aberration, glow: 1.3 });
  const ref = useRef<RippleHandle>(null);
  const options = { ...o, glowColor: R_COLORS[color] };
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v });
  const props = Object.entries(options)
    .filter(([k, v]) => RIPPLE_DEFAULTS[k as keyof typeof RIPPLE_DEFAULTS] !== v)
    .map(([k, v]) => `  ${k}=${typeof v === "string" ? `"${v}"` : `{${v}}`}`);
  const code = `<Ripple\n  src="/your-image.png"\n  width={320}\n  height={320}\n  fireOn="click"${props.length ? "\n" + props.join("\n") : ""}\n/>`;
  return (
    <>
      <h2 className="h2">Playground</h2>
      <div className="playground">
        <div className="panel playStage">
          {src === "Orb" && <OrbRipple options={options} auto={false} rippleRef={ref} />}
          {src === "QR code" && <QrRipple options={options} rippleRef={ref} />}
          {src === "Type" && <TypeRipple options={options} rippleRef={ref} />}
          <button type="button" className="pill playBtn" onClick={() => ref.current?.fire()}>Play</button>
        </div>
        <div className="panel controls">
          <Chips label="Source" value={src} options={R_SOURCES} onChange={setSrc} />
          <Chips label="Glow" value={color} options={Object.keys(R_COLORS) as (keyof typeof R_COLORS)[]} onChange={(c) => { setColor(c); requestAnimationFrame(() => ref.current?.fire()); }} />
          <Slider label="Intensity" value={o.intensity} min={0} max={0.15} step={0.005} onChange={set("intensity")} />
          <Slider label="Frequency" value={o.frequency} min={4} max={60} step={1} onChange={set("frequency")} />
          <Slider label="Reach" value={o.reach} min={0.2} max={1.5} step={0.05} onChange={set("reach")} />
          <Slider label="Fade" value={o.fade} min={0.2} max={3} step={0.05} onChange={set("fade")} />
          <Slider label="Colour split" value={o.aberration} min={0} max={0.05} step={0.001} onChange={set("aberration")} />
          <Slider label="Brightness" value={o.glow} min={0} max={6} step={0.1} onChange={set("glow")} unit="×" />
        </div>
      </div>
      <Code code={code} label="these settings" />
    </>
  );
}

/* ── Confetti ── */
const C_PALETTES = {
  Party: CONFETTI_DEFAULTS.colors,
  Mono: ["#ffffff", "#d4d4d4", "#8a8a8a"],
  Ocean: ["#38bdf8", "#22d3ee", "#818cf8", "#e0f2fe"],
  Sunset: ["#fb7185", "#f97316", "#facc15", "#fda4af"],
  Forest: ["#22c55e", "#84cc16", "#bef264", "#14b8a6"],
} as const;

function ConfettiPreview() {
  return (
    <div className="previewGrid">
      <div className="panel hero"><SuccessCard /></div>
      <div className="panel small"><LikePop /><span className="panelHint">Like it</span></div>
      <div className="panel wide"><TaskPop /><span className="panelHint">Tick a task</span></div>
    </div>
  );
}

function ConfettiPlayground() {
  const [pal, setPal] = useState<keyof typeof C_PALETTES>("Party");
  const [glow, setGlow] = useState<"On" | "Off">("On");
  const [pop, setPop] = useState<"On" | "Off">("On");
  const [o, setO] = useState({ count: CONFETTI_DEFAULTS.count, spread: CONFETTI_DEFAULTS.spread, duration: CONFETTI_DEFAULTS.duration });
  const [n, setN] = useState(0);
  const options = { ...o, colors: [...C_PALETTES[pal]], glow: glow === "On" ? CONFETTI_DEFAULTS.glow : (false as const), pop: pop === "On" };
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v });
  const props = [
    pal !== "Party" && `  colors={${JSON.stringify(C_PALETTES[pal]).replace(/,/g, ", ")}}`,
    ...Object.entries(o).filter(([k, v]) => CONFETTI_DEFAULTS[k as keyof typeof o] !== v).map(([k, v]) => `  ${k}={${v}}`),
    glow === "Off" && "  glow={false}",
    pop === "Off" && "  pop={false}",
  ].filter(Boolean);
  const code = `<ConfettiPop trigger={done}${props.length ? "\n" + props.join("\n") + "\n" : ""}>\n  <CheckBadge />\n</ConfettiPop>`;
  return (
    <>
      <h2 className="h2">Playground</h2>
      <div className="playground">
        <div className="panel playStage">
          <SuccessCard options={options} trigger={n} />
          <button type="button" className="pill playBtn" onClick={() => setN(n + 1)}>Play</button>
        </div>
        <div className="panel controls">
          <Chips label="Colors" value={pal} options={Object.keys(C_PALETTES) as (keyof typeof C_PALETTES)[]} onChange={(p) => { setPal(p); setN((x) => x + 1); }} />
          <Chips label="Pop" value={pop} options={["On", "Off"] as const} onChange={setPop} />
          <Chips label="Glow" value={glow} options={["On", "Off"] as const} onChange={setGlow} />
          <Slider label="Pieces" value={o.count} min={6} max={60} step={1} onChange={set("count")} />
          <Slider label="Spread" value={o.spread} min={0.4} max={2} step={0.05} onChange={set("spread")} unit="×" />
          <Slider label="Duration" value={o.duration} min={0.4} max={1.6} step={0.02} onChange={set("duration")} unit="s" />
        </div>
      </div>
      <Code code={code} label="these settings" />
    </>
  );
}

/* ── A library page ── */
function LibraryPage({ lib, go }: { lib: "ripple" | "confetti"; go: (r: Route) => void }) {
  const [tab, setTab] = useState<"Preview" | "Install">("Preview");
  const [fw, setFw] = useState<"React" | "JavaScript">("React");
  const { done, copy } = useCopy();
  const L = LIBS[lib];
  const i = ORDER.indexOf(lib);
  return (
    <>
      <div className="head">
        <div className="headIcon">{L.icon}</div>
        <div className="arrows">
          <button type="button" className="round" aria-label="Previous" disabled={i === 0} onClick={() => go(ORDER[i - 1])}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M13 8H3m0 0 4-4M3 8l4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className="round" aria-label="Next" disabled={i === ORDER.length - 1} onClick={() => go(ORDER[i + 1])}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 8h10m0 0L9 4m4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <h1 className="h1">{L.name}</h1>
      <p className="lede">{L.desc}</p>

      <div className="bar">
        <div className="seg" role="tablist" aria-label="View">
          {(["Preview", "Install"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={t === tab} className={`segBtn ${t === tab ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div className="barRight">
          <div className="fw" role="radiogroup" aria-label="Framework">
            {(["React", "JavaScript"] as const).map((f) => (
              <button key={f} type="button" role="radio" aria-checked={f === fw} className={`fwBtn ${f === fw ? "on" : ""}`} onClick={() => setFw(f)}>{f}</button>
            ))}
          </div>
          <button type="button" className="pill" onClick={() => copy(lib === "ripple" ? RIPPLE_PROMPT : CONFETTI_PROMPT)}>
            <CopyIcon done={done} />
            {done ? "Copied" : "Copy prompt"}
          </button>
        </div>
      </div>

      {tab === "Preview" ? (
        <>
          {lib === "ripple" ? <RipplePreview /> : <ConfettiPreview />}
          {lib === "ripple" ? <RipplePlayground /> : <ConfettiPlayground />}
        </>
      ) : (
        <Install lib={lib} fw={fw} />
      )}
    </>
  );
}

function Intro({ go }: { go: (r: Route) => void }) {
  return (
    <>
      <div className="head"><div className="headIcon plain"><IntroIcon /></div></div>
      <h1 className="h1">Introduction</h1>
      <p className="lede">Motion effects I made for my own work, free for yours. Each one is a file with no dependencies, a React component, and a prompt your agent can build from.</p>
      <div className="introGrid">
        {(["ripple", "confetti"] as const).map((k) => (
          <button key={k} type="button" className="panel introCard" onClick={() => go(k)}>
            <span className="introIcon">{LIBS[k].icon}</span>
            <span className="introName">{LIBS[k].name}</span>
            <span className="introDesc">{LIBS[k].desc}</span>
          </button>
        ))}
      </div>
      <h2 className="h2">How to use</h2>
      <div className="panel installPanel">
        <ol className="steps">
          <li><b>Copy prompt</b> and paste it into Claude Code, Codex or Cursor. It carries the timing, curves and numbers, so your agent builds it in your stack.</li>
          <li><b>Install</b> has the files to drop into your project, in React or plain JavaScript.</li>
          <li><b>Playground</b> lets you tune it, then copy only the settings you changed.</li>
        </ol>
        <p className="installNote">Everything respects reduced motion. Free for personal and commercial work.</p>
      </div>
    </>
  );
}

/* ── Shell ── */
function NavItem({ active, icon, children, onClick }: { active: boolean; icon?: ReactNode; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className={`navItem ${active ? "on" : ""} ${icon ? "" : "bare"}`} aria-current={active ? "page" : undefined} onClick={onClick}>
      {icon && <span className="navIcon">{icon}</span>}
      {children}
    </button>
  );
}

function Brand() {
  return (
    <>
      <span className="brandMark"><RippleIcon /></span>
      <span>Effects<span className="dim">.free</span></span>
    </>
  );
}

export default function App() {
  const [route, go] = useRoute();
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <div className="site">
      <header className="top">
        <a className="brand" href="#/ripple" aria-label="Effects, home"><Brand /></a>
        <nav className="topLinks" aria-label="Main">
          <button type="button" className={`topLink ${route !== "intro" ? "on" : ""}`} onClick={() => go("ripple")}>Libraries</button>
          <button type="button" className={`topLink ${route === "intro" ? "on" : ""}`} onClick={() => go("intro")}>How to use</button>
        </nav>
        <div className="topRight">
          <a className="pill" href={REPO} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M8 .2a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2" /></svg>
            GitHub
          </a>
        </div>
      </header>

      <div className="layout">
        <aside className="side" aria-label="Libraries">
          <div className="sideLabel">Getting started</div>
          <NavItem active={route === "intro"} onClick={() => go("intro")}>Introduction</NavItem>
          <div className="sideLabel">Libraries</div>
          <NavItem active={route === "ripple"} icon={<RippleIcon />} onClick={() => go("ripple")}>Ripple</NavItem>
          <NavItem active={route === "confetti"} icon={<ConfettiIcon />} onClick={() => go("confetti")}>Confetti pop</NavItem>
        </aside>
        <main className="main" key={route}>
          {route === "intro" ? <Intro go={go} /> : <LibraryPage lib={route} go={go} />}
        </main>
      </div>

      <footer className="foot">
        <div className="footLeft">
          <div className="brand"><Brand /></div>
          <p className="footTag">Free motion effects for the web</p>
          <p className="footBy">Created by <a href="https://orevbajohn.me" target="_blank" rel="noopener noreferrer">John Orevba</a> · {year}</p>
        </div>
        <div className="footCols">
          <div>
            <div className="footHead">Libraries</div>
            <a href="#/ripple">Ripple</a>
            <a href="#/confetti">Confetti pop</a>
          </div>
          <div>
            <div className="footHead">Links</div>
            <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://orevbajohn.me" target="_blank" rel="noopener noreferrer">Portfolio</a>
            <a href="https://x.com/orevbajohn_" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
