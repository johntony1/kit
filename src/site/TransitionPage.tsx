import { useEffect, useState } from "react";
import transitionsSrc from "../transitions/transitions.ts?raw";
import pageSwapSrc from "../transitions/PageSwap.tsx?raw";
import { DURATIONS, type TransitionKind } from "../transitions/transitions";
import { PageSwap } from "../transitions/PageSwap";
import { DemoPage, PAGE_COUNT } from "../demos/Pages";
import { Code, Slider } from "./ui";
import { Later } from "./sheet";
import { play } from "../sound/sound";
import { TRANS_CUE } from "../demos/MiniSite";
import type { ReactNode } from "react";

export const TRANS_KEYS: TransitionKind[] = ["burn", "paper", "reveal", "ink", "curtain", "pixels", "zoom", "tilt"];

export const TRANS_META: Record<TransitionKind, { name: string; desc: string; how: string }> = {
  burn: { name: "Burn", desc: "The page burns away from where you click: a ragged charred edge, a flickering ember line and a little smoke, with the next page underneath.",
    how: "Mask the old page with a hole whose edge radius is a sum of sines around the circle, regenerated every frame as an SVG mask. Draw the char (soft brown rings), the burnt lip, a flickering ember line with an orange glow, and rising smoke on a canvas above. The hole grows with an ease-in (t^1.55) over 2.2 s, because fire speeds up as it spreads." },
  paper: { name: "Paper flip", desc: "The page turns over like a sheet of paper: it bends as it lifts, the light runs across it, and it throws a shadow on the next page as it goes.",
    how: "Cut a copy of the old page into 40 thin vertical strips, each a child of the one before, transform-origin at its left edge, preserve-3d, with a front (its slice of the page) and a back (paper colour) using backface-visibility: hidden. Each frame give strip i the absolute angle A = π·p + 0.55·sin(πp)·(s^1.8 − 0.25)·1.2 (s = its position 0..1, clamped 0..π) and rotate it by A minus its parent's angle, so the sheet bends with the free edge leading. Darken each face by 0.5·sin(A)^1.2. Cast a gradient shadow on the next page at the sheet's projected edge (sum of strip width·cos A). Perspective 2200px from the left edge. 1.1 s, ease in and out." },
  reveal: { name: "Reveal", desc: "The next page grows out of the click as a circle.", how: "Animate clip-path: circle(0 at x y) to circle(farthest corner at x y) on the new page, 700 ms, cubic-bezier(.76,0,.24,1)." },
  ink: { name: "Ink", desc: "A wobbly blob of the next page spreads out from the click like ink.", how: "The burn mask without the fire: a noisy circle (sum of sines, rough 1.4) grows over 1 s with an ease in and out." },
  curtain: { name: "Curtain", desc: "Five panels sweep up to cover the page, the page changes, and they sweep away.", how: "Five flex columns scaleY 0 to 1 from the bottom, staggered, swap at full cover, then scaleY 1 to 0 from the top. 1.1 s, cubic-bezier(.76,0,.24,1)." },
  pixels: { name: "Pixels", desc: "The page breaks into squares that fill in, then clear to the next page.", how: "A 14 column grid of squares fades in with a random delay biased along the diagonal, swap at full cover, then out in reverse order. 1 s." },
  zoom: { name: "Zoom through", desc: "The page dives towards you and blurs away as the next one settles in.", how: "Old: scale 1 to 1.35, blur 0 to 10px, opacity 1 to 0 from the click. New: scale 0.92 to 1, opacity 0 to 1, 15% later. 700 ms, cubic-bezier(.7,0,.3,1)." },
  tilt: { name: "Tilt", desc: "The page tips back into the distance as the next one slides over it.", how: "Old: translateX(-14%) rotateY(18deg) scale(.86) and darkens. New: slides in from translateX(100%) with a shadow. 650 ms, cubic-bezier(.32,.72,0,1)." },
};

export function transPrompt(k: TransitionKind, values?: Record<string, string | number>) {
  const m = TRANS_META[k];
  return `# Add a "${m.name}" page transition

${m.desc}

Build it as a reusable transition in this project's stack. It swaps two real DOM pages
stacked in one container (position relative, overflow hidden; both pages absolute, inset 0).
The new page is underneath; the old one is on top until the transition ends, then hidden.
No screenshots, no libraries.

## How it works
${m.how}

## API
- transition(kind, container, fromEl, toEl, { x, y, duration, color, rough, smoke }) returns
  a promise. x and y (0..1) are where it starts, usually the click.
- A component for this framework that keeps the old page mounted while the transition runs.
- prefers-reduced-motion: swap instantly.
${values ? `\n## Use these values\n${Object.entries(values).map(([a, b]) => `- ${a}: ${b}`).join("\n")}\n` : ""}`;
}

/** a stage that turns to the next page wherever you click (or by itself, every few seconds) */
export function SwapDemo({ kind, options, compact, start = 0, auto = 0 }: { kind: TransitionKind; options?: Record<string, number | string>; compact?: boolean; start?: number; auto?: number }) {
  const [page, setPage] = useState(start);
  const [origin, setOrigin] = useState({ x: 0.5, y: 0.5 });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!auto || busy) return;
    const id = setTimeout(() => { setOrigin({ x: 0.3 + Math.random() * 0.4, y: 0.35 + Math.random() * 0.3 }); setBusy(true); setPage((p) => (p + 1) % PAGE_COUNT); }, auto);
    return () => clearTimeout(id);
  }, [auto, busy, page]);
  return (
    <div className="swapStage" role="button" tabIndex={0} aria-label="Go to the next page"
      onPointerDown={(e) => {
        if (busy) return;
        const r = e.currentTarget.getBoundingClientRect();
        const go = (e.target as HTMLElement).closest("[data-go]")?.getAttribute("data-go");
        const target = go !== null && go !== undefined ? Number(go) : (page + 1) % PAGE_COUNT;
        if (target === page) return;
        play(TRANS_CUE[kind]);
        setOrigin({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
        setBusy(true);
        setPage(target);
      }}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !busy) { e.preventDefault(); play(TRANS_CUE[kind]); setOrigin({ x: 0.5, y: 0.5 }); setBusy(true); setPage((p) => (p + 1) % PAGE_COUNT); } }}>
      <PageSwap kind={kind} page={page} origin={origin} options={options} onDone={() => setBusy(false)}
        render={(p) => <DemoPage n={p} compact={compact} />} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

export function TransPreview({ k, hero }: { k: TransitionKind; hero?: ReactNode }) {
  return (
    <div className="previewGrid">
      {hero ? <div className="panel hero flushPanel"><div className="bnPreview">{hero}</div></div> : <div className="panel hero flushPanel"><SwapDemo kind={k} /><span className="panelHint">Click a link, or anywhere</span></div>}
      <div className="panel small flushPanel"><Later><SwapDemo kind={k} compact start={1} /></Later></div>
      <div className="panel wide flushPanel"><Later><SwapDemo kind={k} start={2} /><span className="panelHint">Next page</span></Later></div>
    </div>
  );
}

export function TransPlayground({ k }: { k: TransitionKind }) {
  const [duration, setDuration] = useState(DURATIONS[k]);
  const [rough, setRough] = useState(0.5);
  const [smoke, setSmoke] = useState(0.6);
  const [color, setColor] = useState("#34b562");
  const COLORS = ["#34b562", "#1b1d1b", "#f4f2ec", "#7b6cff"];
  const options: Record<string, number | string> = { duration, ...(k === "burn" ? { rough, smoke } : {}), ...(k === "curtain" || k === "pixels" ? { color } : {}) };
  const props = [
    duration !== DURATIONS[k] && `duration: ${duration}`,
    k === "burn" && rough !== 0.5 && `rough: ${rough}`,
    k === "burn" && smoke !== 0.6 && `smoke: ${smoke}`,
    (k === "curtain" || k === "pixels") && color !== "#34b562" && `color: "${color}"`,
  ].filter(Boolean);
  const code = `<PageSwap\n  kind="${k}"\n  page={route}\n  origin={click}${props.length ? `\n  options={{ ${props.join(", ")} }}` : ""}\n  render={(r) => <Page route={r} />}\n/>`;
  return (
    <>
      <h2 className="h2">Playground</h2>
      <div className="playground">
        <div className="panel playStage flushPanel"><SwapDemo key={JSON.stringify(options)} kind={k} options={options} /><span className="panelHint">Click anywhere</span></div>
        <div className="panel controls">
          <Slider label="Duration" value={duration} min={0.2} max={k === "burn" ? 5 : 2.5} step={0.05} unit="s" onChange={setDuration} />
          {k === "burn" && <Slider label="Rough edge" value={rough} min={0} max={1.5} step={0.05} onChange={setRough} />}
          {k === "burn" && <Slider label="Smoke" value={smoke} min={0} max={2} step={0.05} onChange={setSmoke} />}
          {(k === "curtain" || k === "pixels") && (
            <div className="group">
              <div className="groupLabel">Colour</div>
              <div className="chips">
                {COLORS.map((c) => <button key={c} type="button" className={`swatchPair ${c === color ? "on" : ""}`} style={{ background: c }} aria-label={c} onClick={() => setColor(c)} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <Code code={code} label="these settings" />
    </>
  );
}

export function TransInstall({ k, fw }: { k: TransitionKind; fw: "React" | "JavaScript" }) {
  const files: [string, string][] = fw === "React" ? [["transitions.ts", transitionsSrc], ["PageSwap.tsx", pageSwapSrc]] : [["transitions.ts", transitionsSrc]];
  const usage = fw === "React"
    ? `import { PageSwap } from "./PageSwap";\n\n<PageSwap kind="${k}" page={route} origin={click} render={(r) => <Page route={r} />} />`
    : `import { transition } from "./transitions";\n\n// both pages inside one container; the new one is already rendered\nawait transition("${k}", container, oldPage, newPage, { x: 0.5, y: 0.5 });\noldPage.remove();`;
  return (
    <div className="panel installPanel">
      <h3 className="installHead">Installation</h3>
      <p className="installNote">No package. Copy {files.length > 1 ? "these files" : "this file"} into your project. transitions.ts holds all eight transitions. No dependencies{fw === "React" ? " beyond React" : ""}.</p>
      {files.map(([name, src]) => (
        <div key={name} className="file"><div className="fileName">{name}</div><Code code={src} max={260} label={name} /></div>
      ))}
      <h3 className="installHead">Usage</h3>
      <Code code={usage} label="usage" />
    </div>
  );
}
