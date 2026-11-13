import { Suspense, useEffect, useState } from "react";
import { compPrompt, loadSources, loadTokens, type Comp } from "./components";
import { NATIVE, loadNativeSrc } from "./native";
import { Code, CopyIcon, Seg, useCopy } from "./ui";
import { CompIcon } from "./CompIcon";

/** the detail sheet of a component: the live app, its code, its links */
export function ComponentPage({ c }: { c: Comp }) {
  const [tab, setTab] = useState<"Preview" | "Code">("Preview");
  const prompt = useCopy("prompt");
  const C = NATIVE[c.k];
  // the source text arrives a moment after the sheet opens
  const [own, setOwn] = useState<string>();
  const [files, setFiles] = useState<[string, string][]>([]);
  useEffect(() => {
    let live = true;
    setOwn(undefined); setFiles([]);
    loadNativeSrc(c.k).then((s) => { if (live) setOwn(s); });
    loadSources(c.k).then((f) => { if (live) setFiles(f); });
    return () => { live = false; };
  }, [c.k]);
  const slug = c.repo.split("/").pop();
  return (
    <div className="sheetPage">
      <div className="head"><div className="headIcon"><CompIcon k={c.k} /></div></div>
      <h1 className="h1">{c.name}</h1>
      <p className="lede">{c.desc}</p>
      <div className="bar">
        <Seg label="View" value={tab} options={["Preview", "Code"] as const} onChange={setTab} />
        <div className="barRight">
          <a className="btn line" href={c.url} target="_blank" rel="noopener noreferrer">Open live</a>
          <a className="btn line" href={c.repo} target="_blank" rel="noopener noreferrer">GitHub</a>
          <button type="button" className="btn primary" onClick={async () => prompt.copy(compPrompt(c, own ?? (await loadNativeSrc(c.k)), files.length ? files : await loadSources(c.k), await loadTokens()))}><CopyIcon done={prompt.done} />{prompt.done ? "Copied" : "Copy prompt"}</button>
        </div>
      </div>
      {tab === "Preview" ? (
        <div className="panel cmpBig"><Suspense fallback={null}>{C ? <C size="big" /> : null}</Suspense></div>
      ) : (
        <div className="panel installPanel">
          {own && <>
            <h3 className="installHead">This version</h3>
            <p className="installNote">One file, React with {/gsap/.test(own) ? "framer-motion and gsap" : /framer-motion/.test(own) ? "framer-motion" : "nothing else"}. Drop it in and render it inside a positioned box. It has a light and a dark look: its colours come from the variables in tokens.css, which the prompt includes.</p>
            <div className="file"><div className="fileName">{c.k}.tsx</div><Code code={own} max={320} label={`${c.k}.tsx`} /></div>
          </>}
          <h3 className="installHead">The original</h3>
          <p className="installNote">The original is a standalone React app. Clone it and run it, or lift its files.</p>
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
