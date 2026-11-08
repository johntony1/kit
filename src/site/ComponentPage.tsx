import { useState } from "react";
import { compPrompt, sourcesOf, type Comp } from "./components";
import { NATIVE, NATIVE_SRC } from "./native";
import { Code, CopyIcon, Seg, useCopy } from "./ui";

/** the detail sheet of a component: the live app, its code, its links */
export function ComponentPage({ c }: { c: Comp }) {
  const [tab, setTab] = useState<"Preview" | "Code">("Preview");
  const prompt = useCopy();
  const files = sourcesOf(c.k);
  const C = NATIVE[c.k];
  const own = NATIVE_SRC[c.k];
  const slug = c.repo.split("/").pop();
  return (
    <div className="sheetPage">
      <div className="head"><div className="headIcon cmpIcon" style={{ background: c.bg }} /></div>
      <h1 className="h1">{c.name}</h1>
      <p className="lede">{c.desc}</p>
      <div className="bar">
        <Seg label="View" value={tab} options={["Preview", "Code"] as const} onChange={setTab} />
        <div className="barRight">
          <a className="btn line" href={c.url} target="_blank" rel="noopener noreferrer">Open live</a>
          <a className="btn line" href={c.repo} target="_blank" rel="noopener noreferrer">GitHub</a>
          <button type="button" className="btn primary" onClick={() => prompt.copy(compPrompt(c, own))}><CopyIcon done={prompt.done} />{prompt.done ? "Copied" : "Copy prompt"}</button>
        </div>
      </div>
      {tab === "Preview" ? (
        <div className="panel cmpBig">{C ? <C size="big" /> : null}</div>
      ) : (
        <div className="panel installPanel">
          {own && <>
            <h3 className="installHead">This dark version</h3>
            <p className="installNote">One file, React with {/gsap/.test(own) ? "framer-motion and gsap" : /framer-motion/.test(own) ? "framer-motion" : "nothing else"}. Drop it in and render it inside a positioned box.</p>
            <div className="file"><div className="fileName">{c.k}.tsx</div><Code code={own} max={320} label={`${c.k}.tsx`} /></div>
          </>}
          <h3 className="installHead">The original</h3>
          <p className="installNote">The full light version is a standalone React app. Clone it and run it, or lift its files.</p>
          <Code code={`git clone ${c.repo}.git\ncd ${slug}\nnpm install\nnpm run dev`} label="clone" />
          <p className="installNote cmpDeps">Uses {c.deps.length ? c.deps.join(", ") : "React only"}.</p>
          {files.map(([name, src]) => (
            <div key={name} className="file"><div className="fileName">src/{name}</div><Code code={src} max={300} label={name} /></div>
          ))}
        </div>
      )}
    </div>
  );
}
