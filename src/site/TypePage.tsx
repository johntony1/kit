import { useMemo, useState } from "react";
import typeCore from "../type/type-core.ts?raw";
import effectsSrc from "../type/effects.ts?raw";
import typeCanvas from "../type/TypeCanvas.tsx?raw";
import { TYPE_EFFECTS, type TypeEffectKey } from "../type/effects";
import { TYPE_META } from "../type/meta";
import { TypeCanvas } from "../type/TypeCanvas";
import { Code, Slider } from "./ui";

export function TypeIcon({ k }: { k: TypeEffectKey }) {
  const [fg, bg] = TYPE_META[k].swatches[0];
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill={bg} />
      <text x="12" y="16.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="12" fill={fg}>Aa</text>
    </svg>
  );
}

export function TypePreview({ k }: { k: TypeEffectKey }) {
  const e = TYPE_EFFECTS[k];
  const m = TYPE_META[k];
  const bg = (v: { bg?: string }) => v.bg ?? e.look.bg;
  return (
    <div className="previewGrid">
      <div className="panel hero flushPanel" style={{ background: e.look.bg }}>
        <TypeCanvas effect={e} />
        <span className="panelHint onArt" style={{ color: e.look.fg }}>{m.hint}</span>
      </div>
      <div className="panel small flushPanel" style={{ background: bg(m.small) }}><TypeCanvas effect={e} {...m.small} /></div>
      <div className="panel wide flushPanel" style={{ background: bg(m.wide) }}><TypeCanvas effect={e} {...m.wide} /></div>
    </div>
  );
}

export function TypePlayground({ k }: { k: TypeEffectKey }) {
  const e = TYPE_EFFECTS[k];
  const m = TYPE_META[k];
  const [text, setText] = useState(e.look.text ?? "");
  const names = m.swatches.map((_, i) => `${i + 1}`);
  const [sw, setSw] = useState("1");
  const [fg, bg] = m.swatches[Number(sw) - 1];
  const [params, setParams] = useState<Record<string, number>>(() => Object.fromEntries(Object.entries(e.params).map(([n, p]) => [n, p.value])));
  const changed = Object.entries(params).filter(([n, v]) => e.params[n].value !== v);
  const props = [
    text !== e.look.text && `  text=${JSON.stringify(text)}`,
    sw !== "1" && `  fg="${fg}"\n  bg="${bg}"`,
    changed.length > 0 && `  params={{ ${changed.map(([n, v]) => `${n}: ${v}`).join(", ")} }}`,
  ].filter(Boolean);
  const code = `<TypeCanvas\n  effect={${k}}${props.length ? "\n" + props.join("\n") : ""}\n  style={{ width: "100%", height: 400 }}\n/>`;
  const opts = useMemo(() => ({ text, fg, bg, params }), [text, fg, bg, params]);
  return (
    <>
      <h2 className="h2">Playground</h2>
      <div className="playground">
        <div className="panel playStage flushPanel" style={{ background: bg }}>
          <TypeCanvas effect={e} {...opts} />
        </div>
        <div className="panel controls">
          <div className="group">
            <label className="groupLabel" htmlFor={`text-${k}`}>Text</label>
            <textarea id={`text-${k}`} className="textIn" rows={2} value={text} onChange={(ev) => setText(ev.target.value)} spellCheck={false} />
          </div>
          <div className="group">
            <div className="groupLabel">Colours</div>
            <div className="chips" role="radiogroup" aria-label="Colours">
              {m.swatches.map(([f, b], i) => (
                <button key={i} type="button" role="radio" aria-checked={sw === names[i]} aria-label={`${f} on ${b}`} className={`swatchPair ${sw === names[i] ? "on" : ""}`} onClick={() => setSw(names[i])} style={{ background: b, color: f }}>Aa</button>
              ))}
            </div>
          </div>
          {Object.entries(e.params).map(([n, p]) => (
            <Slider key={n} label={p.label} value={params[n]} min={p.min} max={p.max} step={p.step} onChange={(v) => setParams({ ...params, [n]: v })} />
          ))}
        </div>
      </div>
      <Code code={code} label="these settings" />
    </>
  );
}

export function TypeInstall({ k, fw }: { k: TypeEffectKey; fw: "React" | "JavaScript" }) {
  const files: [string, string][] = fw === "React"
    ? [["type-core.ts", typeCore], ["effects.ts", effectsSrc], ["TypeCanvas.tsx", typeCanvas]]
    : [["type-core.ts", typeCore], ["effects.ts", effectsSrc]];
  const text = (TYPE_EFFECTS[k].look.text ?? "").replace(/\n/g, "\\n");
  const usage = fw === "React"
    ? `import { TypeCanvas } from "./TypeCanvas";\nimport { ${k} } from "./effects";\n\n<TypeCanvas effect={${k}} text="${text}" style={{ width: "100%", height: 400 }} />`
    : `import { createType } from "./type-core";\nimport { ${k} } from "./effects";\n\nconst fx = createType(document.querySelector("canvas"), ${k}, { text: "${text}" });\n// fx.set({ text: "new words", params: { ... } })\n// fx.fire(0.5, 0.5)   (effects that react to clicks)`;
  return (
    <div className="panel installPanel">
      <h3 className="installHead">Installation</h3>
      <p className="installNote">No package. Copy these files into your project. effects.ts holds all eight type effects, keep the ones you use. No dependencies{fw === "React" ? " beyond React" : ""}.</p>
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
