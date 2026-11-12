import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, useSyncExternalStore } from "react";
import rippleTs from "./ripple/ripple.ts?raw";
import rippleTsx from "./ripple/RippleCanvas.tsx?raw";
import confettiTs from "./confetti/confetti.ts?raw";
import confettiTsx from "./confetti/ConfettiPop.tsx?raw";
import { PROMPT as RIPPLE_PROMPT } from "./ripple/prompt";
import { CONFETTI_PROMPT } from "./confetti/prompt";
import { RIPPLE_DEFAULTS } from "./ripple/ripple";
import { CONFETTI_DEFAULTS } from "./confetti/confetti";
import type { RippleHandle } from "./ripple/RippleCanvas";
import { OrbRipple, QrRipple } from "./demos/RippleDemos";
import { LikePop, SuccessCard, TaskPop } from "./demos/ConfettiDemos";
import { Chips, Code, CopyIcon, Seg, Slider, useCopy } from "./site/ui";
import { TypeInstall, TypePlayground, TypePreview, TypeIcon } from "./site/TypePage";
import { TYPE_EFFECTS, type TypeEffectKey } from "./type/effects";
import { TYPE_META } from "./type/meta";
import { typePrompt } from "./type/prompt";
import { TypeCanvas } from "./type/TypeCanvas";
import type { StudioLib } from "./site/Studio";
import { CardPreview, ES_COUNT, Home, KINDS, type BentoLib, type Kind } from "./site/Bento";
import { ThemeToggle } from "./site/VintageSwitch";
import { ILLS, illOf, useIll } from "./empty/ills";
import { catOf } from "./empty/cats";
import { compOf, COMPS } from "./site/components";
import { TRANS_KEYS, TRANS_META, TransInstall, TransPlayground, TransPreview, transPrompt } from "./site/TransitionPage";
import type { TransitionKind } from "./transitions/transitions";
import { Later } from "./site/sheet";
import { play, sound } from "./sound/sound";

// the heavy pages arrive when they are first opened (and are fetched quietly once the home page is idle)
const loadStudio = () => import("./site/Studio").then((m) => ({ default: m.Studio }));
const loadEmptyPage = () => import("./empty/EmptyStatePage").then((m) => ({ default: m.EmptyStatePage }));
const loadComponentPage = () => import("./site/ComponentPage").then((m) => ({ default: m.ComponentPage }));
const Studio = lazy(loadStudio);
const EmptyStatePage = lazy(loadEmptyPage);
const ComponentPage = lazy(loadComponentPage);

/** what a sheet shows for the moment before its page has arrived: the title, in place */
function SheetStub({ name }: { name: string }) {
  return <div className="sheetPage"><div className="head"><div className="headIcon" /></div><h1 className="h1">{name}</h1></div>;
}
/** an empty state's sheet: its drawing code and its page both load on demand */
function EmptySheet({ k }: { k: string }) {
  const ill = useIll(k);
  const stub = <SheetStub name={illOf(k)?.name ?? ""} />;
  return ill ? <Suspense fallback={stub}><EmptyStatePage ill={ill} /></Suspense> : stub;
}

const REPO = "https://github.com/johntony1/effects-free";

/* ── Routing: #/ripple, #/confetti, #/introduction ── */
type Lib = "ripple" | "confetti" | TypeEffectKey | TransitionKind;
type Route = "intro" | Lib | `studio:${Lib}` | `cmp-${string}` | `es-${string}`;
const TYPE_KEYS = ["bubble", "lens", "liquid", "rings", "slice", "smear", "lines", "contour"] as TypeEffectKey[];
const ORDER: Route[] = ["intro", "ripple", "confetti", ...TYPE_KEYS, ...TRANS_KEYS];
const isTrans = (r: string): r is TransitionKind => (TRANS_KEYS as string[]).includes(r);
const isType = (r: string): r is TypeEffectKey => (TYPE_KEYS as string[]).includes(r);
function useRoute(): [Route, (r: Route) => void] {
  const read = (): Route => {
    const h = location.hash.replace(/^#\/?/, "").split("?")[0];
    if (h.startsWith("studio")) { const k = h.split("/")[1] ?? "ripple"; return (k === "ripple" || k === "confetti" || isType(k) ? `studio:${k}` : "studio:ripple") as Route; }
    const k = h.replace(/^type\//, "");
    if (h.startsWith("component/") && compOf(h.slice(10))) return `cmp-${h.slice(10)}` as Route;
    if (h.startsWith("empty/") && illOf(h.slice(6))) return `es-${h.slice(6)}` as Route;
    const tk = h.replace(/^transition\//, "");
    if (h.startsWith("transition/") && isTrans(tk)) return tk;
    return h === "ripple" || h === "confetti" ? h : h.startsWith("type/") && isType(k) ? k : "intro";
  };
  const [r, setR] = useState<Route>(read);
  useEffect(() => {
    // keep the scroll when a sheet opens or closes over the bento; only jump to the top for the Studio
    let was = read();
    const on = () => { const now = read(); if (now.startsWith("studio:") !== was.startsWith("studio:")) window.scrollTo(0, 0); was = now; setR(now); };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return [r, (next) => { location.hash = `/${next === "intro" ? "" : next.startsWith("cmp-") ? `component/${next.slice(4)}` : next.startsWith("es-") ? `empty/${next.slice(3)}` : next.startsWith("studio:") ? `studio/${next.slice(7)}` : isType(next) ? `type/${next}` : isTrans(next) ? `transition/${next}` : next}`; }];
}

/* ── Icons ── */
function RippleIcon() {
  return <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="#8b7dff" /><circle cx="12" cy="12" r="6.5" stroke="#8b7dff" strokeOpacity=".6" strokeWidth="1.3" /><circle cx="12" cy="12" r="10" stroke="#8b7dff" strokeOpacity=".3" strokeWidth="1.3" /></svg>;
}
function ConfettiIcon() {
  return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><circle cx="12" cy="13" r="3.4" fill="#fff" /><rect x="4" y="4" width="3" height="3" rx=".6" fill="#1fc16b" transform="rotate(20 5.5 5.5)" /><rect x="17" y="3.5" width="2.4" height="3.6" rx=".6" fill="#fa7319" transform="rotate(-30 18 5)" /><circle cx="19.5" cy="14" r="1.4" fill="#f5c028" /><circle cx="4.6" cy="15" r="1.3" fill="#b197fc" /><rect x="11" y="2.5" width="2" height="3" rx=".5" fill="#f5c028" /></svg>;
}
function TransIcon({ k }: { k: TransitionKind }) {
  const g: Record<TransitionKind, ReactNode> = {
    burn: <path d="M12 3c1 3 4 4.5 4 8.5A4 4 0 0 1 8 11.5c0-1.5.7-2.6 1.5-3.5.2 1.6 1 2.4 2 2.6C11 8 11.5 5.5 12 3Z" fill="#ff8a3d" />,
    paper: <><path d="M5 4h10l4 4v12H5z" fill="#e9e6dc" /><path d="M15 4v4h4" fill="#c9c4b4" /></>,
    reveal: <><circle cx="12" cy="12" r="7" fill="#34b562" /><circle cx="12" cy="12" r="3" fill="#1b1d1b" /></>,
    ink: <path d="M12 4c3 0 7 2 7 6.5S16 20 12 20s-7-4-7-9 4-7 7-7Z" fill="#7b6cff" />,
    curtain: <>{[0, 1, 2, 3].map((i) => <rect key={i} x={4 + i * 4.2} y={5 + (i % 2) * 3} width="3.4" height={14 - (i % 2) * 3} rx="1" fill="#34b562" />)}</>,
    pixels: <>{[0, 1, 2].flatMap((x) => [0, 1, 2].map((y) => <rect key={`${x}${y}`} x={5 + x * 5} y={5 + y * 5} width="4" height="4" rx="1" fill="#34b562" opacity={(x + y) % 2 ? 0.45 : 1} />))}</>,
    zoom: <><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#c2cbc4" strokeWidth="1.5" /><rect x="8" y="8" width="8" height="8" rx="2" fill="#c2cbc4" /></>,
    tilt: <><path d="M4 7l7 2v8l-7 2z" fill="#5d6862" /><rect x="12" y="5" width="8" height="14" rx="2" fill="#c2cbc4" /></>,
  };
  return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#1b1d1b" />{g[k]}</svg>;
}

function IntroIcon() {
  return <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 5.5h14M5 12h14M5 18.5h9" strokeLinecap="round" /></svg>;
}

const LIBS = {
  ripple: { name: "Ripple", icon: <RippleIcon />, desc: "A ring of light that bursts out of a point, bends whatever is under it and splits its colours." },
  confetti: { name: "Confetti pop", icon: <ConfettiIcon />, desc: "An element pops in with a blur and an overshoot, a glow springs in behind it, and ribbons of confetti burst out, tumble and fall." },
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
      ? `import { ConfettiPop } from "./ConfettiPop";\n\nconst card = useRef<HTMLDivElement>(null);\n\n<div ref={card} style={{ position: "relative", overflow: "hidden", borderRadius: 20 }}>\n  <ConfettiPop within={card} trigger={done}>\n    <CheckBadge />\n  </ConfettiPop>\n</div>`
      : `import { confettiPop } from "./confetti";\n\nconfettiPop(document.querySelector(".badge"), { within: document.querySelector(".card") });`;
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
const R_SOURCES = ["Orb", "QR code"] as const;
const R_COLORS = { Violet: "#7b6cff", Blue: "#1d9fff", Pink: "#ff4fa3", Orange: "#ff7a1a", Green: "#22c55e", White: "#ffffff" } as const;

function RipplePreview({ hero }: { hero?: ReactNode }) {
  return (
    <div className="previewGrid">
      {hero ? <div className="panel hero flushPanel"><div className="bnPreview">{hero}</div></div> : <div className="panel hero"><OrbRipple /></div>}
      <div className="panel small"><Later>{hero ? <OrbRipple /> : <QrRipple />}<span className="panelHint">{hero ? "Click the orb" : "Click the code"}</span></Later></div>
      <div className="panel wide flushPanel" style={{ background: "#eef0f3" }}><Later><TypeCanvas effect={TYPE_EFFECTS.bubble} text="ripple" fit={0.66} /><span className="panelHint onArt" style={{ color: "#0b0b0b" }}>Click anywhere</span></Later></div>
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
          <button type="button" className="btn line playBtn" onClick={() => ref.current?.fire()}>Play</button>
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
  Mint: CONFETTI_DEFAULTS.colors,
  Party: ["#1fc16b", "#fa7319", "#f5c028", "#b197fc", "#38bdf8"],
  Mono: ["#ffffff", "#e5e5e5", "#a3a3a3", "#d4d4d4"],
  Ocean: ["#38bdf8", "#22d3ee", "#818cf8", "#e0f2fe", "#7dd3fc"],
  Sunset: ["#fb7185", "#f97316", "#facc15", "#fda4af", "#fdba74"],
} as const;

function ConfettiPreview({ hero }: { hero?: ReactNode }) {
  return (
    <div className="previewGrid">
      {hero ? <div className="panel hero flushPanel"><div className="bnPreview">{hero}</div></div> : <div className="panel hero"><SuccessCard /></div>}
      <div className="panel small"><Later><LikePop /><span className="panelHint">Like it</span></Later></div>
      <div className="panel wide"><Later><TaskPop /><span className="panelHint">Tick a task</span></Later></div>
    </div>
  );
}

function ConfettiPlayground() {
  const [pal, setPal] = useState<keyof typeof C_PALETTES>("Mint");
  const [glow, setGlow] = useState<"On" | "Off">("On");
  const [pop, setPop] = useState<"On" | "Off">("On");
  const [o, setO] = useState({ count: CONFETTI_DEFAULTS.count, spread: CONFETTI_DEFAULTS.spread, gravity: CONFETTI_DEFAULTS.gravity, duration: CONFETTI_DEFAULTS.duration });
  const [n, setN] = useState(0);
  const options = { ...o, colors: [...C_PALETTES[pal]], glow: glow === "On" ? CONFETTI_DEFAULTS.glow : (false as const), pop: pop === "On" };
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v });
  const props = [
    pal !== "Mint" && `  colors={${JSON.stringify(C_PALETTES[pal]).replace(/,/g, ", ")}}`,
    ...Object.entries(o).filter(([k, v]) => CONFETTI_DEFAULTS[k as keyof typeof o] !== v).map(([k, v]) => `  ${k}={${v}}`),
    glow === "Off" && "  glow={false}",
    pop === "Off" && "  pop={false}",
  ].filter(Boolean);
  const code = `<ConfettiPop within={card} trigger={done}${props.length ? "\n" + props.join("\n") + "\n" : ""}>\n  <CheckBadge />\n</ConfettiPop>`;
  return (
    <>
      <h2 className="h2">Playground</h2>
      <div className="playground">
        <div className="panel playStage">
          <SuccessCard options={options} trigger={n} />
          <button type="button" className="btn line playBtn" onClick={() => setN(n + 1)}>Play</button>
        </div>
        <div className="panel controls">
          <Chips label="Colours" value={pal} options={Object.keys(C_PALETTES) as (keyof typeof C_PALETTES)[]} onChange={(p) => { setPal(p); setN((x) => x + 1); }} />
          <Chips label="Pop" value={pop} options={["On", "Off"] as const} onChange={setPop} />
          <Chips label="Glow" value={glow} options={["On", "Off"] as const} onChange={setGlow} />
          <Slider label="Pieces" value={o.count} min={10} max={200} step={1} onChange={set("count")} />
          <Slider label="Spread" value={o.spread} min={0.3} max={2} step={0.05} onChange={set("spread")} unit="×" />
          <Slider label="Gravity" value={o.gravity} min={0.02} max={0.5} step={0.01} onChange={set("gravity")} />
          <Slider label="Duration" value={o.duration} min={0.6} max={6} step={0.1} onChange={set("duration")} unit="s" />
        </div>
      </div>
      <Code code={code} label="these settings" />
    </>
  );
}

/* ── A library page ── */
function LibraryPage({ lib, go, inSheet = false, hero }: { lib: Lib; go: (r: Route) => void; inSheet?: boolean; hero?: ReactNode }) {
  const [tab, setTab] = useState<"Preview" | "Install">("Preview");
  const [fw, setFw] = useState<"React" | "JavaScript">("React");
  const { done, copy } = useCopy();
  const L = isTrans(lib) ? { name: TRANS_META[lib].name, icon: <TransIcon k={lib} />, desc: TRANS_META[lib].desc } : isType(lib) ? { name: TYPE_EFFECTS[lib].name, icon: <TypeIcon k={lib} />, desc: TYPE_META[lib].desc } : LIBS[lib];
  const i = ORDER.indexOf(lib);
  return (
    <>
      <div className="head">
        <div className="headIcon">{L.icon}</div>
        {!inSheet && <div className="arrows">
          <button type="button" className="round" aria-label="Previous" disabled={i === 0} onClick={() => go(ORDER[i - 1])}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M13 8H3m0 0 4-4M3 8l4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className="round" aria-label="Next" disabled={i === ORDER.length - 1} onClick={() => go(ORDER[i + 1])}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 8h10m0 0L9 4m4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>}
      </div>
      <h1 className="h1">{L.name}</h1>
      <p className="lede">{L.desc}</p>

      <div className="bar">
        <Seg label="View" value={tab} options={["Preview", "Install"] as const} onChange={setTab} />
        <div className="barRight">
          <Seg label="Framework" role="radiogroup" value={fw} options={["React", "JavaScript"] as const} onChange={setFw} />
          {!isTrans(lib) && <button type="button" className="btn line" onClick={() => go(`studio:${lib}` as Route)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2.5 4.5h6m3 0h2M2.5 11.5h2m3 0h6" strokeLinecap="round" /><circle cx="10" cy="4.5" r="1.6" /><circle cx="6" cy="11.5" r="1.6" /></svg>
            Tune in Studio
          </button>}
          <button type="button" className="btn primary" onClick={() => copy(isTrans(lib) ? transPrompt(lib) : isType(lib) ? typePrompt(TYPE_EFFECTS[lib], TYPE_META[lib].desc) : lib === "ripple" ? RIPPLE_PROMPT : CONFETTI_PROMPT)}>
            <CopyIcon done={done} />
            {done ? "Copied" : "Copy prompt"}
          </button>
        </div>
      </div>

      {tab === "Preview" ? (
        <>
          {isTrans(lib) ? <TransPreview k={lib} hero={hero} /> : isType(lib) ? <TypePreview k={lib} hero={hero} /> : lib === "ripple" ? <RipplePreview hero={hero} /> : <ConfettiPreview hero={hero} />}
          <Later>{isTrans(lib) ? <TransPlayground key={lib} k={lib} /> : isType(lib) ? <TypePlayground key={lib} k={lib} /> : lib === "ripple" ? <RipplePlayground /> : <ConfettiPlayground />}</Later>
        </>
      ) : isTrans(lib) ? (
        <TransInstall k={lib} fw={fw} />
      ) : isType(lib) ? (
        <TypeInstall k={lib} fw={fw} />
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
      <p className="lede">Motion and type effects I made for my own work, free for yours. Each one is a file with no dependencies, a React component, and a prompt your agent can build from.</p>
      <div className="introGrid">
        {(["ripple", "confetti", ...TYPE_KEYS, ...TRANS_KEYS] as Lib[]).map((k) => {
          const L = isTrans(k) ? { name: TRANS_META[k].name, icon: <TransIcon k={k} />, desc: TRANS_META[k].desc } : isType(k) ? { name: TYPE_EFFECTS[k].name, icon: <TypeIcon k={k} />, desc: TYPE_META[k].desc } : LIBS[k];
          return (
            <button key={k} type="button" className="panel introCard" onClick={() => go(k)}>
              <span className="introIcon">{L.icon}</span>
              <span className="introName">{L.name}</span>
              <span className="introDesc">{L.desc}</span>
            </button>
          );
        })}
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
      <span className="brandMark"><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="currentColor" /><circle cx="12" cy="12" r="6.6" stroke="currentColor" strokeOpacity=".7" strokeWidth="1.6" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.6" /></svg></span>
      <span>Kit</span>
    </>
  );
}

/** the repo's star count, if GitHub answers */

function useStars() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    fetch("https://api.github.com/repos/johntony1/effects-free").then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && typeof j.stargazers_count === "number") setStars(j.stargazers_count); }).catch(() => {});
  }, []);
  return stars;
}

/** Search ⌘K: a small palette that jumps to any effect */
function SearchButton({ go }: { go: (r: Route) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const all = useMemo(() => [
    { r: "intro" as Route, name: "Introduction", group: "Getting started" },
    { r: "studio:ripple" as Route, name: "Studio", group: "Tune" },
    { r: "ripple" as Route, name: "Ripple", group: "Libraries" },
    { r: "confetti" as Route, name: "Confetti pop", group: "Libraries" },
    ...TYPE_KEYS.map((k) => ({ r: k as Route, name: TYPE_EFFECTS[k].name, group: "Type" })),
    ...TRANS_KEYS.map((k) => ({ r: k as Route, name: TRANS_META[k].name, group: "Transitions" })),
    ...COMPS.map((c) => ({ r: `cmp-${c.k}` as Route, name: c.name, group: "Components" })),
    ...ILLS.map((i) => ({ r: `es-${i.k}` as Route, name: i.name, sub: i.title, group: "Empty states", more: catOf(i.k) })),
  ] as { r: Route; name: string; sub?: string; group: string; more?: string }[], []);
  // every word typed has to appear somewhere (name, headline, kind or category); names that start
  // with the query come first
  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return all;
    const hits = all.filter((x) => { const hay = `${x.name} ${x.sub ?? ""} ${x.group} ${x.more ?? ""}`.toLowerCase(); return words.every((w) => hay.includes(w)); });
    const head = q.trim().toLowerCase();
    return hits.sort((a, b) => Number(!a.name.toLowerCase().startsWith(head)) - Number(!b.name.toLowerCase().startsWith(head)));
  }, [all, q]);
  const listRef = useRef<HTMLDivElement>(null);
  // the highlighted row stays in view as the arrow keys move it
  useEffect(() => { listRef.current?.querySelector<HTMLElement>(".palItem.on")?.scrollIntoView({ block: "nearest" }); }, [hi]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    const show = () => setOpen(true);
    addEventListener("keydown", on);
    addEventListener("kit:search", show);
    return () => { removeEventListener("keydown", on); removeEventListener("kit:search", show); };
  }, []);
  useEffect(() => { if (open) { setQ(""); setHi(0); } }, [open]);
  const pick = (r: Route) => { setOpen(false); go(r); };
  return (
    <>
      <button type="button" className="topPill search" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.75" /><path d="m10.5 10.5 3 3" strokeLinecap="round" /></svg>
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="palScrim" onPointerDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="pal" role="dialog" aria-label="Search the library">
            <input autoFocus className="palIn" placeholder="Search the library" value={q}
              onChange={(e) => { setQ(e.target.value); setHi(0); }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(Math.min(list.length, 80) - 1, h + 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
                if (e.key === "Enter" && list[hi]) pick(list[hi].r);
              }} />
            <div className="palList" role="listbox" ref={listRef}>
              {list.slice(0, 80).map((x, i) => (
                <button key={x.r} type="button" role="option" aria-selected={i === hi} className={`palItem ${i === hi ? "on" : ""}`} onMouseMove={() => setHi(i)} onClick={() => pick(x.r)}>
                  <span className="palName">{x.name}{x.sub && <small>{x.sub}</small>}</span><em>{x.more ?? x.group}</em>
                </button>
              ))}
              {!list.length && <p className="palEmpty">Nothing called that yet.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [route, go] = useRoute();
  const [kind, setKind] = useState<Kind>("All");
  const inStudio = route.startsWith("studio:");
  const stars = useStars();
  useEffect(() => {
    // warm the sheets' code once the page has settled, so opening one is instant
    const warm = () => { void loadEmptyPage(); void loadComponentPage(); };
    // Safari has no requestIdleCallback: a short timer does the same job there
    const idle = "requestIdleCallback" in window;
    const id = idle ? window.requestIdleCallback(warm, { timeout: 4000 }) : window.setTimeout(warm, 2500);
    return () => { if (idle) window.cancelIdleCallback(id); else clearTimeout(id); };
  }, []);
  // the raised pill under the chosen kind slides to the next one; measured, so any label width works
  const navRef = useRef<HTMLElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const place = () => { const b = el.querySelector<HTMLElement>(".topLink.on"); setThumb(b ? { x: b.offsetLeft, w: b.offsetWidth } : null); };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [kind, inStudio]);
  // the magic wand over the hero's words: loaded once the page has settled, so it costs the first paint nothing
  useEffect(() => {
    let stop = () => {};
    let live = true;
    const id = window.setTimeout(() => import("./site/wand").then((m) => { if (live) stop = m.startWand(); }), 600);
    return () => { live = false; clearTimeout(id); stop(); };
  }, []);
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <div className="site">
      <header className="top">
        <a className="brand" href="#/" aria-label="Kit, home" onClick={() => setKind("All")}><Brand /></a>
        <nav className="topLinks" aria-label="Main" ref={navRef}>
          <span className="topThumb" aria-hidden="true" data-show={!!thumb} style={thumb ? { transform: `translateX(${thumb.x}px)`, width: thumb.w } : undefined} />
          {KINDS.filter((k) => k !== "All").map((k) => (
            <button key={k} type="button" className={`topLink ${!inStudio && kind === k ? "on" : ""}`} aria-current={!inStudio && kind === k ? "page" : undefined}
              onClick={() => { setKind(k); if (route !== "intro") go("intro"); }}>{k}</button>
          ))}
        </nav>
        <div className="topRight">
          <ThemeToggle />
          <SearchButton go={go} />
          <a className="topPill" href={REPO} target="_blank" rel="noopener noreferrer" aria-label={stars !== null ? `GitHub, ${stars} stars` : "GitHub"}>
            <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M8 .2a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2" /></svg>
            {stars !== null ? <span>{stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}</span> : <span>GitHub</span>}
          </a>
        </div>
      </header>

      {route.startsWith("studio:") ? (
        <Suspense fallback={<div className="studio" style={{ minHeight: "70vh" }} />}>
          <Studio key={route} lib={route.slice(7) as StudioLib} go={(k) => go(`studio:${k}` as Route)}
            libs={[{ k: "ripple", name: "Ripple", group: "Libraries" }, { k: "confetti", name: "Confetti pop", group: "Libraries" }, ...TYPE_KEYS.map((k) => ({ k, name: TYPE_EFFECTS[k].name, group: "Type" }))]} />
        </Suspense>
      ) : (
        <Home kind={kind} onKind={setKind} open={route === "intro" ? null : (route as BentoLib)} onOpen={(k) => go(k as Route)} onClose={() => go("intro")}
          detail={(k) => k.startsWith("cmp-") ? <Suspense fallback={<SheetStub name={compOf(k.slice(4))?.name ?? ""} />}><ComponentPage c={compOf(k.slice(4))!} /></Suspense> : k.startsWith("es-") ? <EmptySheet k={k.slice(3)} /> : <div className="sheetPage"><LibraryPage lib={k as Lib} go={go} inSheet hero={<CardPreview k={k} />} /></div>} />
      )}

      <footer className="foot">
        <div className="footLeft">
          <div className="brand"><Brand /></div>
          <p className="footTag">Free components, illustrations and effects for the web</p>
          <p className="footBy">Created by <a href="https://orevbajohn.me" target="_blank" rel="noopener noreferrer">John Orevba</a> · {year}</p>
        </div>
        <div className="footCols">
          <div>
            <div className="footHead">Libraries</div>
            <a href="#/ripple">Ripple</a>
            <a href="#/confetti">Confetti pop</a>
          </div>
          <div>
            <div className="footHead">Type</div>
            {TYPE_KEYS.map((k) => <a key={k} href={`#/type/${k}`}>{TYPE_EFFECTS[k].name}</a>)}
          </div>
          <div>
            <div className="footHead">Transitions</div>
            {TRANS_KEYS.map((k) => <a key={k} href={`#/transition/${k}`}>{TRANS_META[k].name}</a>)}
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
