// The detail sheet of a dot matrix empty state: the piece big, in a real empty state, in every
// colour, with its code, a prompt, and SVG and GIF downloads.
import { useState } from "react";
import { Code, CopyIcon, Seg, useCopy } from "../site/ui";
import { Later } from "../site/sheet";
import { DotArt } from "./DotArt";
import { THEMES, toGIF, toSVG, type DotStyle, type Illustration, type Mode, type Theme } from "./dots";
import { ILL_SRC } from "./ills";
import { FLAT_SRC } from "./flat";
import dotsSrc from "./dots.ts?raw";
import artSrc from "./DotArt.tsx?raw";

const fileOf = (k: string) => Object.entries(ILL_SRC).find(([, s]) => s.includes(`k: "${k}"`));

function usage(ill: Illustration) {
  return `import { DotArt } from "./empty/DotArt";
import { ${ill.k} } from "./empty/ills/${ill.k}";

export function EmptyState() {
  return (
    <div className="empty">
      <div style={{ position: "relative", width: 240, height: 210 }}>
        <DotArt ill={${ill.k}} />
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

export function emptyPrompt(ill: Illustration, ui = false) {
  if (ui && ill.flat && FLAT_SRC[ill.flat]) return flatPrompt(ill);
  const src = fileOf(ill.k)?.[1] ?? "";
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

export function EmptyStatePage({ ill }: { ill: Illustration }) {
  const [tab, setTab] = useState<"Preview" | "Code">("Preview");
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [gif, setGif] = useState<"idle" | "busy">("idle");
  const [look, setLook] = useState<"Stipple" | "Halftone" | "Line" | "UI">("Stipple");
  const [shade, setShade] = useState<"Dark" | "Light">("Dark");
  // the stage: the rounded slab the piece stands on. Line starts with it; any style can have it
  const [stage, setStage] = useState(false);
  const pick = (l: typeof look) => { setLook(l); if (l === "Line") setStage(true); };
  const style = (look === "UI" ? "stipple" : look.toLowerCase()) as DotStyle;
  const mode = shade.toLowerCase() as Mode;
  const prompt = useCopy();
  const file = fileOf(ill.k);
  const slug = `${ill.k}-${style}-${theme.name.toLowerCase()}-${mode}`;

  const svg = () => save(new Blob([toSVG(ill, (ill.period ?? 3) * 0.5, 0, theme, 8, style, mode, stage)], { type: "image/svg+xml" }), `${slug}.svg`);
  const makeGif = async () => {
    if (gif === "busy") return;
    setGif("busy");
    try { save(await toGIF(ill, theme, 6, 24, style, mode, stage), `${slug}.gif`); } finally { setGif("idle"); }
  };

  // pieces that also come as real UI get a fourth style, "UI", which shows that component instead
  const flat = ill.flat && look === "UI" ? FLAT_SRC[ill.flat] : undefined;
  return (
    <div className="sheetPage">
      <h1 className="h1">{ill.name}</h1>
      <p className="lede">For “{ill.title}”. {ill.kind === "loop" ? "It loops on its own." : "It rests, and plays when you hover it."} {flat ? "It is real UI: copy the prompt or the code." : "Copy the prompt or the code, or download it as an SVG or a GIF."}</p>
      <div className="bar">
        <div className="esSegs">
          <Seg label="View" value={tab} options={["Preview", "Code"] as const} onChange={setTab} />
          <Seg label="Style" value={look} options={ill.flat ? (["Stipple", "Halftone", "Line", "UI"] as const) : (["Stipple", "Halftone", "Line"] as const)} onChange={pick} />
          <Seg label="Mode" value={shade} options={["Dark", "Light"] as const} onChange={setShade} />
          {!flat && <Seg label="Stage" value={stage ? "Stage" : "No stage"} options={["No stage", "Stage"] as const} onChange={(v) => setStage(v === "Stage")} />}
        </div>
        <div className="barRight">
          {!flat && <>
          <div className="esSwatches" role="radiogroup" aria-label="Dot colour">
            {THEMES.map((t) => (
              <button key={t.name} type="button" role="radio" aria-checked={t === theme} aria-label={t.name} className={`esSwatch ${t === theme ? "on" : ""}`}
                style={{ background: t.b ? `linear-gradient(135deg, ${t.a}, ${t.b})` : t.a }} onClick={() => setTheme(t)} />
            ))}
          </div>
          <button type="button" className="btn line" onClick={svg}>SVG</button>
          <button type="button" className="btn line" onClick={makeGif} aria-busy={gif === "busy"}>{gif === "busy" ? "Rendering" : "GIF"}</button>
          </>}
          <button type="button" className="btn primary" onClick={() => prompt.copy(emptyPrompt(ill, !!flat))}><CopyIcon done={prompt.done} />{prompt.done ? "Copied" : "Copy prompt"}</button>
        </div>
      </div>
      {tab === "Preview" ? (
        <>
          <div className={`panel esBig ${mode} ${flat ? "line" : style}`}>
            <DotArt ill={ill} theme={theme} maxPitch={8} fit={0.92} look={style} mode={mode} stage={stage} ui={!!flat} touch />
            {flat ? null : style === "stipple" ? (
              <span className="esHint"><span className="onHover">Move through the dots, press to dig in</span><span className="onTouch">Press and drag through the dots</span></span>
            ) : ill.kind === "hover" && <span className="esHint">Hover to play</span>}
          </div>
          <Later>
            <div className={`panel esContext ${mode} ${flat ? "line" : style}`}>
              <div className="esEmpty">
                <div className="esEmptyArt"><DotArt ill={ill} theme={theme} fit={1} look={style} mode={mode} stage={stage} ui={!!flat} /></div>
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
          <Code code={usage(ill)} label="usage" />
          {file && <div className="file"><div className="fileName">empty/ills/{ill.k}.ts</div><Code code={file[1]} max={320} label={`${ill.k}.ts`} /></div>}
          <div className="file"><div className="fileName">empty/dots.ts</div><Code code={dotsSrc} max={300} label="dots.ts" /></div>
          <div className="file"><div className="fileName">empty/DotArt.tsx</div><Code code={artSrc} max={300} label="DotArt.tsx" /></div>
          </>}
        </div>
      )}
    </div>
  );
}
