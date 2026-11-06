import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QrCodeModal } from "../QrCodeModal";
import rippleTs from "./ripple/ripple.ts?raw";
import rippleTsx from "./ripple/RippleCanvas.tsx?raw";
import { RIPPLE_SHADER } from "./ripple/ripple";
import { PROMPT } from "./ripple/prompt";
import { AvatarDemo, PayDemo, Playground, PlayerDemo, TicketDemo, TouchDemo } from "./examples/Examples";

const REPO = "https://github.com/johntony1/qr-code-animatio";

const TABS = [
  { name: "Prompt", file: "ripple-prompt.md", note: "Paste into Claude Code, Codex, Cursor or any agent. It builds it in your stack.", text: PROMPT },
  { name: "React", file: "RippleCanvas.tsx", note: "RippleCanvas.tsx. Put ripple.ts from the next tab beside it.", text: rippleTsx },
  { name: "JavaScript", file: "ripple.ts", note: "ripple.ts. No framework, no dependencies. Works anywhere.", text: rippleTs },
  { name: "Shader", file: "ripple.frag", note: "The fragment shader on its own, for three.js, Pixi or your own WebGL.", text: RIPPLE_SHADER },
];

function useCopy() {
  const [done, setDone] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* the text is still selectable */
    }
  };
  return { done, copy };
}

function CopyIcon({ done }: { done: boolean }) {
  return done ? (
    <svg viewBox="0 0 16 16" className="copied" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2" /><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" /></svg>
  );
}

/** light syntax colour: comments dim, strings warm, keywords blue */
function Line({ text, md }: { text: string; md: boolean }) {
  if (md) {
    if (/^#/.test(text)) return <span className="cKey">{text}</span>;
    if (/^```/.test(text)) return <span className="cDim">{text}</span>;
    return <span>{text}</span>;
  }
  const i = text.indexOf("//");
  const code = i >= 0 && !/https?:$/.test(text.slice(0, i)) ? text.slice(0, i) : text;
  const comment = code === text ? "" : text.slice(i);
  const parts = code.split(/("[^"]*"|`[^`]*`|\b(?:const|let|function|return|export|import|from|if|for|else|new|interface|type|uniform|varying|float|vec2|vec3|vec4|int|void|attribute|precision|highp|sampler2D|break|continue)\b)/g);
  return (
    <>
      {parts.map((p, k) => k % 2 ? <span key={k} className={p[0] === '"' || p[0] === "`" ? "cStr" : "cKey"}>{p}</span> : p)}
      {comment && <span className="cDim">{comment}</span>}
    </>
  );
}

/** the copy box: pick prompt or code, copy it, or download the file */
function CodeBox() {
  const [tab, setTab] = useState(0);
  const { done, copy } = useCopy();
  const t = TABS[tab];
  const lines = useMemo(() => t.text.replace(/\n$/, "").split("\n"), [t]);
  const download = () => {
    const url = URL.createObjectURL(new Blob([t.text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = t.file;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="install">
      <div className="installInner">
        <div className="tabsRow">
          <div role="tablist" aria-label="Prompt or code" className="tabs">
            {TABS.map((x, i) => (
              <button key={x.name} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)} className={`tab ${i === tab ? "tabOn" : ""}`}>{x.name}</button>
            ))}
          </div>
          <button type="button" onClick={() => copy(t.text)} className="copyBtn" aria-label={done ? "Copied" : `Copy the ${t.name.toLowerCase()}`}>
            <CopyIcon done={done} />
          </button>
        </div>
        <p className="tabNote">{t.note}</p>
        <div role="tabpanel" className="codeScroll">
          {lines.map((l, i) => (
            <div key={i} className="codeRow">
              <span className="codeNum">{i + 1}</span>
              <span className="codeText"><Line text={l} md={tab === 0} /></span>
            </div>
          ))}
        </div>
      </div>
      <div className="installLinks">
        <button type="button" className="installLink" onClick={() => copy(t.text)}>
          <CopyIcon done={done} />
          {done ? "Copied" : `Copy ${t.name === "Prompt" ? "prompt" : "code"}`}
        </button>
        <button type="button" className="installLink" onClick={download}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 2.5v8m0 0L4.8 7.3M8 10.5l3.2-3.2M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Download {t.file}
        </button>
      </div>
    </div>
  );
}

function Snippet({ code }: { code: string }) {
  const { done, copy } = useCopy();
  return (
    <div className="snippet">
      <pre className="snippetCode">{code}</pre>
      <button type="button" onClick={() => copy(code)} className="copyBtn" aria-label={done ? "Copied" : "Copy these settings"}><CopyIcon done={done} /></button>
    </div>
  );
}

function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="figure">
      {children}
      <figcaption className="figcaption">{caption}</figcaption>
    </figure>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  const [tuned, setTuned] = useState("");

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  return (
    <div className="page">
      <div className="edgeTop" aria-hidden="true">
        <div className="edgeBlurSoft" />
        <div className="edgeBlurStrong" />
        <div className="edgeTint" />
      </div>

      <nav className="nav">
        <a href="https://orevbajohn.me" className="navBack">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 2.5L4.5 7L9 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          John Orevba
        </a>
        <button className="themeToggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </nav>

      <article className="article">
        <header className="header">
          <h1 className="title">Ripple</h1>
          <p className="date">November, 2026</p>
        </header>

        <p className="body lead">
          Ripple is a distortion effect I made for a QR code. When the code is ready, a ring of light bursts out of the middle, bends the code as it passes, splits its colours at the edge and fades. It is free. Copy the code into your project, or copy the prompt and let your agent build it in your stack.
        </p>

        <Figure caption="The QR code it was made for. Open it, then pick a colour.">
          <div className="stage tall">
            <QrCodeModal url="https://qr-code-animatio.vercel.app" />
          </div>
        </Figure>

        <CodeBox />

        <p className="body">
          It works on anything you can turn into an image: a photo, a canvas you drew, a frame of video. The content is drawn as a texture on a WebGL canvas the same size, so nothing on your page moves or reflows. It only draws while a ripple is alive and on screen, and with reduced motion on it shows the content and never fires.
        </p>

        <section className="section">
          <h2 className="sectionTitle">Where it fits.</h2>
          <p className="body">
            A ripple says something just happened. It works best on a single moment the person was waiting for, once, from the place it happened. Here are the places I would use it. Every one of them is drawn in code and running the same file you can copy.
          </p>
        </section>

        <section className="section">
          <h2 className="sectionTitle">A payment that went through.</h2>
          <p className="body">
            The ring starts at the contactless mark, where the card would touch the reader, and the glow is green for done.
          </p>
          <Figure caption="Pay, wait, and the card answers.">
            <PayDemo />
          </Figure>
        </section>

        <section className="section">
          <h2 className="sectionTitle">A song that starts.</h2>
          <p className="body">
            Press play and the cover wakes up. The glow takes its colour from the artwork, so every track feels like its own.
          </p>
          <Figure caption="Play, or skip to the next track.">
            <PlayerDemo />
          </Figure>
        </section>

        <section className="section">
          <h2 className="sectionTitle">A photo you just changed.</h2>
          <p className="body">
            Small things work too. On an avatar it reads as the new photo settling into place.
          </p>
          <Figure caption="Change the photo.">
            <AvatarDemo />
          </Figure>
        </section>

        <section className="section">
          <h2 className="sectionTitle">A ticket that scans.</h2>
          <p className="body">
            At the gate, the ring leaves from the barcode the reader just read.
          </p>
          <Figure caption="Scan it at the gate.">
            <TicketDemo />
          </Figure>
        </section>

        <section className="section">
          <h2 className="sectionTitle">Wherever you touch.</h2>
          <p className="body">
            Set <code className="kbd">fireOn="click"</code> and it fires from the point under the pointer. Six can run at once, and where they meet they interfere like water.
          </p>
          <Figure caption="Click a few times, quickly.">
            <TouchDemo />
          </Figure>
        </section>

        <section className="section">
          <h2 className="sectionTitle">Make it yours.</h2>
          <p className="body">
            Every number that shapes it is an option. Move them until it feels right, then copy what you changed.
          </p>
          <Figure caption="Release a slider to fire. Click the preview to fire from that point.">
            <Playground onCode={setTuned} />
          </Figure>
          <Snippet code={tuned} />
        </section>

        <section className="section">
          <h2 className="sectionTitle">How it moves.</h2>
          <p className="body">
            The ring does not travel at a steady speed. Its radius is <code className="kbd">0.75 × (1 − e<sup>−3.2t</sup>)</code>, so it bursts out in the first fifth of a second and then slows almost to a stop while it fades. That is most of why it feels like an impact and not a loading spinner.
          </p>
          <p className="body">
            The edge is four waves stacked at different speeds, two of them turning with the angle around the point. They drift against each other, so the ring shimmers and writhes instead of being a clean circle. Pixels are pushed mostly outward with a little swirl, the red and blue channels are read a hair apart, and a glow rides on top, brightest where the waves crest.
          </p>
        </section>

        <section className="section">
          <h2 className="sectionTitle">Take it.</h2>
          <p className="body">
            Ripple is free and open source, for personal and commercial work. No credit needed, though I would love to see where you put it.
          </p>
          <CodeBox />
          <div className="notes">
            <p>Images from another domain need CORS, or WebGL will refuse to read them. Without WebGL the content is drawn flat, so nothing disappears.</p>
            <p>Use it for a moment, not a mood. One ripple when something finishes feels great. One every few seconds becomes noise.</p>
          </div>
        </section>
      </article>

      <footer className="footer">
        <a href="https://orevbajohn.me" className="footerBack">← Back to portfolio</a>
        <div className="footerLinks">
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="footerLink">GitHub</a>
          <a href="mailto:orevbajohnt@gmail.com" className="footerLink">Get in touch</a>
          <a href="https://x.com/orevbajohn_" target="_blank" rel="noopener noreferrer" className="footerLink">Twitter</a>
        </div>
      </footer>
    </div>
  );
}
