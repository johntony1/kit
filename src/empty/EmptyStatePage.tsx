// The detail sheet of a dot matrix empty state: the piece big, in a real empty state, in every
// colour, with its code, a prompt, and SVG and GIF downloads.
import { useEffect, useState } from "react";
import { Chips, Code, CopyIcon, Seg, Slider, Stable, Switch, useCopy } from "../site/ui";
import { Later } from "../site/sheet";
import { DotArt } from "./DotArt";
import { theme as siteTheme } from "../site/theme";
import { THEMES, toGIF, toSVG, type DotShape, type DotStyle, type Illustration, type Mode, type Theme } from "./dots";
import { loadIllSrc } from "./ills";
import { FLAT_SRC } from "./flat/src";
import dotsSrc from "./dots.ts?raw";
import artSrc from "./DotArt.tsx?raw";


function usage(ill: Illustration, tag = `<DotArt ill={${ill.k}} />`) {
  return `import { DotArt } from "./empty/DotArt";
import { ${ill.k} } from "./empty/ills/${ill.k}";

export function EmptyState() {
  return (
    <div className="empty">
      <div style={{ position: "relative", width: 240, height: 210 }}>
        ${tag}
      </div>
      <h3>${ill.title}</h3>
      <p>${ill.body}</p>
    </div>
  );
}`;
}

function flatPrompt(ill: Illustration) {
  const f = FLAT_SRC[ill.flat!];
  return `# Add the "${ill.name}" empty state

Use it for: ${ill.title}. ${ill.body}

It is made of real UI, not a drawing: ${ill.k === "workforce" ? "a row of agent cards slides past; the middle card arrives as a skeleton\nand its agent resolves out of a blur, the card before it drifts off faded and the next waits as a skeleton." : ill.body}
It works on a light or a dark page (pass mode="light" or mode="dark"). Keep the timings in its storyboard.

Add the file below as it is (React and framer-motion), render it inside a positioned box with a size, and
put the title and the line of copy under it with one primary button.

## ${f.file}
\`\`\`tsx
${f.src}
\`\`\`
`;
}

export function emptyPrompt(ill: Illustration, ui = false, tag = "", src = "") {
  if (ui && ill.flat && FLAT_SRC[ill.flat]) return flatPrompt(ill);
  return `# Add the "${ill.name}" dot matrix empty state

Use it for: ${ill.title}. ${ill.body}

It is a ${ill.kind === "loop" ? "looping" : "hover"} illustration. A small isometric 3D scene is drawn with a pen
(boxes, faces, lines) and rendered in one of three styles: stipple (tiny square dots, one bit each,
tone from how many are lit through a blue noise map, every dot its own slight tint, and the dots
part around the pointer, smear along with it and spring back), halftone (one round dot per cell
sized by the shading) or line (clean isometric line art: pale faces with one pixel outlines, the
piece standing on a rounded slab, dashed guides and one accent colour). Each works on a light or a
dark page (pass mode="light" or mode="dark"), and any style can stand on the rounded stage (pass
stage).
${ill.kind === "loop" ? `It loops every ${ill.period ?? 3} seconds.` : "It rests, and plays while the pointer is over it."}
Style: stipple by default (pass look="halftone" or look="line" for the other two).

Add the three files below as they are (no dependencies beyond React), then render
<DotArt ill={${ill.k}} /> inside a positioned box with a size. Keep the dot style, the timings
and the empty state copy; match the colour to this project (pass a theme: { a: "#hex", bg: "#hex" }).
The dots can be square, round or rounded (pass shape) and finer or coarser (pass res: 1 is as drawn,
2 is twice as many dots across).
${tag ? `
## Use these settings (tuned on the site)
\`\`\`tsx
${tag}
\`\`\`
` : ""}
## ${ill.k}.ts
\`\`\`ts
${src}
\`\`\`

## dots.ts
\`\`\`ts
${dotsSrc}
\`\`\`

## DotArt.tsx
\`\`\`tsx
${artSrc}
\`\`\`
`;
}

const save = (blob: Blob, name: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};

/** the piece's mark at the top of its sheet: a few dots in the chosen colour and shape */
function DotsIcon({ theme, shape }: { theme: Theme; shape: DotShape }) {
  const r = shape === "square" ? 0 : shape === "round" ? 2 : 1.1;
  const lit = [1, 1, 0.45, 1, 0.45, 0.2, 0.45, 0.2, 0];
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <defs><linearGradient id="esIco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={theme.a} /><stop offset="1" stopColor={theme.b ?? theme.a} /></linearGradient></defs>
      <rect width="24" height="24" rx="5" fill="#0b0b0b" />
      {lit.map((o, i) => o > 0 && <rect key={i} x={5 + (i % 3) * 5} y={5 + Math.floor(i / 3) * 5} width="4" height="4" rx={r} fill="url(#esIco)" opacity={o} />)}
    </svg>
  );
}

type Look = "Stipple" | "Halftone" | "Line" | "UI";
const SHAPES = { Square: "square", Dots: "round", Rounded: "rounded" } as const;
type ShapeName = keyof typeof SHAPES;
/** the shape each style is drawn in unless you choose another */
const OWN_SHAPE: Record<DotStyle, ShapeName> = { stipple: "Square", halftone: "Dots", line: "Square" };

export function EmptyStatePage({ ill }: { ill: Illustration }) {
  const [tab, setTab] = useState<"Preview" | "Code">("Preview");
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [gif, setGif] = useState<"idle" | "busy">("idle");
  const [look, setLook] = useState<Look>("Stipple");
  // the preview starts on the site's own theme, and follows it when the site is switched
  const [shade, setShade] = useState<"Dark" | "Light">(() => (siteTheme.get() === "light" ? "Light" : "Dark"));
  useEffect(() => siteTheme.subscribe(() => setShade(siteTheme.get() === "light" ? "Light" : "Dark")), []);
  // the stage: the rounded slab the piece stands on. Line starts with it; any style can have it
  const [stage, setStage] = useState(false);
  const [shapeName, setShapeName] = useState<ShapeName>("Square");
  const [res, setRes] = useState(1);
  const style = (look === "UI" ? "stipple" : look.toLowerCase()) as DotStyle;
  // a style brings its own dot with it (stipple square, halftone round); the choice after that is yours
  const pick = (l: Look) => {
    setLook(l);
    if (l === "Line") setStage(true);
    if (l === "Stipple" || l === "Halftone") setShapeName(OWN_SHAPE[l.toLowerCase() as DotStyle]);
  };
  const reset = () => { setLook("Stipple"); setShapeName("Square"); setRes(1); setShade("Dark"); setStage(false); setTheme(THEMES[0]); };
  const mode = shade.toLowerCase() as Mode;
  const shape = SHAPES[shapeName];
  const prompt = useCopy(), code = useCopy();
  // the piece's own source text arrives a moment after the sheet opens
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    setSrc("");
    loadIllSrc(ill.k).then((s) => { if (live) setSrc(s); });
    return () => { live = false; };
  }, [ill.k]);
  const slug = `${ill.k}-${style}-${theme.name.toLowerCase()}-${mode}`;
  // pieces that also come as real UI get a fourth style, "UI", which shows that component instead
  const flat = ill.flat && look === "UI" ? FLAT_SRC[ill.flat] : undefined;
  const dots = !flat && style !== "line"; // shape and resolution are the dot styles' own
  const opts = dots ? { shape, res } : {};

  // the component with only what was changed here
  const props = flat ? [] : [
    style !== "stipple" && `look="${style}"`,
    dots && shapeName !== OWN_SHAPE[style] && `shape="${shape}"`,
    dots && res !== 1 && `res={${res}}`,
    mode !== "dark" && `mode="${mode}"`,
    stage && "stage",
    theme !== THEMES[0] && `theme={{ a: "${theme.a}", ${theme.b ? `b: "${theme.b}", ` : ""}bg: "${theme.bg}" }}`,
  ].filter(Boolean) as string[];
  // one line, always: the code under the preview never changes height as settings change
  const tag = `<DotArt ill={${ill.k}} ${props.length ? `${props.join(" ")} ` : ""}/>`;

  const svg = () => save(new Blob([toSVG(ill, (ill.period ?? 3) * 0.5, 0, theme, 16, style, mode, stage, opts)], { type: "image/svg+xml" }), `${slug}.svg`);
  const makeGif = async () => {
    if (gif === "busy") return;
    setGif("busy");
    try { save(await toGIF(ill, theme, 6, 24, style, mode, stage, opts), `${slug}.gif`); } finally { setGif("idle"); }
  };

  return (
    <div className="sheetPage">
      <div className="head"><div className="headIcon"><DotsIcon theme={theme} shape={dots ? shape : "square"} /></div></div>
      <h1 className="h1">{ill.name}</h1>
      <p className="lede">For “{ill.title}”. {ill.kind === "loop" ? "It loops on its own." : "It rests, and plays when you hover it."} {flat ? "It is real UI: copy the prompt or the code." : "Tune it on the right, then copy the prompt or the code, or download it as an SVG or a GIF."}</p>
      <div className="studioBar esBar">
        <Seg label="View" value={tab} options={["Preview", "Code"] as const} onChange={setTab} />
        <div className="studioBarRight">
          <button type="button" className="round" aria-label="Reset to the original" title="Reset" onClick={reset}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.5-3.6M3 3v3h3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {!flat && <>
            <button type="button" className="topPill small" onClick={svg}>SVG</button>
            <button type="button" className="topPill small" onClick={makeGif} aria-busy={gif === "busy"}><Stable value={gif === "busy" ? "Rendering" : "GIF"} options={["GIF", "Rendering"]} /></button>
          </>}
          <button type="button" className="btn primary" onClick={async () => prompt.copy(emptyPrompt(ill, !!flat, props.length ? tag : "", src || (await loadIllSrc(ill.k))))}><CopyIcon done={prompt.done} /><Stable value={prompt.done ? "Copied" : "Copy prompt"} options={["Copy prompt", "Copied"]} /></button>
        </div>
      </div>

      <div className="studioBody">
        <div className="studioLeft">
          {tab === "Preview" ? (
            <>
              <div className={`panel esBig ${mode} ${flat ? "line" : style}`}>
                <DotArt ill={ill} theme={theme} maxPitch={8} fit={0.92} look={style} mode={mode} stage={stage} ui={!!flat} touch {...opts} />
                {flat ? null : style === "stipple" ? (
                  <span className="esHint"><span className="onHover">Move through the dots, press to dig in</span><span className="onTouch">Press and drag through the dots</span></span>
                ) : ill.kind === "hover" && <span className="esHint">Hover to play</span>}
              </div>
              {!flat && (
                <div className="code studioCode">
                  <pre><code>{tag}</code></pre>
                  <button type="button" className="iconBtn codeCopy" onClick={() => code.copy(tag)} aria-label={code.done ? "Copied" : "Copy code"}><CopyIcon done={code.done} /></button>
                </div>
              )}
              <Later>
                <div className={`panel esContext ${mode} ${flat ? "line" : style}`}>
                  <div className="esEmpty">
                    <div className="esEmptyArt"><DotArt ill={ill} theme={theme} fit={1} look={style} mode={mode} stage={stage} ui={!!flat} {...opts} /></div>
                    <h3>{ill.title}</h3>
                    <p>{ill.body}</p>
                    <button type="button" className="btn primary">Get started</button>
                  </div>
                </div>
              </Later>
            </>
          ) : (
            <div className="panel installPanel">
              <h3 className="installHead">Use it</h3>
              {flat ? <>
              <p className="installNote">One file, React and framer-motion. Render it inside a positioned box with a size.</p>
              <div className="file"><div className="fileName">empty/flat/{flat.file}</div><Code code={flat.src} max={420} label={flat.file} /></div>
              </> : <>
              <p className="installNote">Three files, React only. The engine and the component are shared by every piece; each piece is one small file.</p>
              <Code code={usage(ill, tag)} label="usage" />
              {src && <div className="file"><div className="fileName">empty/ills/{ill.k}.ts</div><Code code={src} max={320} label={`${ill.k}.ts`} /></div>}
              <div className="file"><div className="fileName">empty/dots.ts</div><Code code={dotsSrc} max={300} label="dots.ts" /></div>
              <div className="file"><div className="fileName">empty/DotArt.tsx</div><Code code={artSrc} max={300} label="DotArt.tsx" /></div>
              </>}
            </div>
          )}
        </div>

        <aside className="panel studioPanel esPanel" aria-label="Settings">
          <div className="studioGroups">
            <section className="studioGroup">
              <h3 className="studioGroupTitle">Style</h3>
              <Chips label="How it is drawn" value={look} options={ill.flat ? (["Stipple", "Halftone", "Line", "UI"] as const) : (["Stipple", "Halftone", "Line"] as const)} onChange={pick} />
            </section>
            {!flat && (
              // Line has no dots to shape: the group stays where it is, dimmed, so nothing below it jumps
              <section className={`studioGroup esDots ${dots ? "" : "off"}`} inert={!dots}>
                <h3 className="studioGroupTitle">Dots</h3>
                <Chips label="Shape" value={shapeName} options={Object.keys(SHAPES) as ShapeName[]} onChange={setShapeName} />
                <Slider label="Resolution" value={res} min={0.4} max={2} step={0.05} unit="×" onChange={setRes} />
              </section>
            )}
            <section className="studioGroup">
              <h3 className="studioGroupTitle">Page</h3>
              <Chips label="Mode" value={shade} options={["Dark", "Light"] as const} onChange={setShade} />
              {!flat && (
                <div className="colorCtl switchCtl" onClick={(e) => { if (!(e.target as HTMLElement).closest("button")) setStage(!stage); }}>
                  <span className="colorName">Stage</span>
                  <Switch checked={stage} onChange={setStage} label="Stage" />
                </div>
              )}
            </section>
            {!flat && (
              <section className="studioGroup">
                <h3 className="studioGroupTitle">Colour</h3>
                <div className="esSwatches" role="radiogroup" aria-label="Dot colour">
                  {THEMES.map((t) => (
                    <button key={t.name} type="button" role="radio" aria-checked={t === theme} aria-label={t.name} title={t.name} className={`esSwatch ${t === theme ? "on" : ""}`}
                      style={{ background: t.b ? `linear-gradient(135deg, ${t.a}, ${t.b})` : t.a }} onClick={() => setTheme(t)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
