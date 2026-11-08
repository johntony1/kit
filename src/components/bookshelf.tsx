// Bookshelf: books standing on a wooden plank. Hover a spine and the book
// straightens and swings open to show its cover (500ms ease, as the original
// .shelf-book-* CSS); click pulls it off the shelf, cover square to you.
// Sounds: a very quiet slide as a book turns on hover, a soft land when one is
// pulled out, close when it goes back.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { play } from "../sound/sound";

type Book = { title: string; author: string; color: string; h: number; w: number };

const BOOKS: Book[] = [
  { title: "Pride and Prejudice", author: "Jane Austen", color: "#7B6BA8", h: 216, w: 42 },
  { title: "Frankenstein", author: "Mary Shelley", color: "#2A4BA0", h: 200, w: 34 },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", color: "#0F7060", h: 198, w: 30 },
  { title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", color: "#C4511A", h: 196, w: 28 },
  { title: "Dracula", author: "Bram Stoker", color: "#1A1A1A", h: 222, w: 46 },
  { title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", color: "#6B4226", h: 210, w: 36 },
  { title: "Treasure Island", author: "Robert Louis Stevenson", color: "#1A4A3A", h: 206, w: 34 },
  { title: "The Picture of Dorian Gray", author: "Oscar Wilde", color: "#3D1F6E", h: 204, w: 32 },
  { title: "A Tale of Two Cities", author: "Charles Dickens", color: "#8B1A1A", h: 220, w: 44 },
];

const TILTS = [-2.2, 1.4, -1.0, 2.6, -1.7, 0.9, -2.4, 1.1, -0.5, 2.1];
const DW = 540; // design width of the shelf
const DH = 290; // books (tallest 222) + room to pull one out + plank

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const clear = size === "big" ? 140 : h >= 300 ? 116 : 28;
      setS(Math.min((w - 40) / DW, (h - clear) / DH, size === "big" ? 1.5 : 1.05));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return { ref, s };
}

const CSS = `
.bs-row{display:flex;align-items:flex-end;justify-content:center;gap:2px;position:relative;z-index:2;isolation:isolate}
.bs-wrap{flex-shrink:0;transform-origin:bottom center;transform:rotateZ(var(--tilt));transition:transform 500ms ease;padding:8px;margin:-8px;position:relative}
.bs-wrap.is-hov,.bs-wrap.is-open{transform:rotateZ(0deg);z-index:40}
.bs-btn{display:flex;flex-direction:row;align-items:flex-end;justify-content:flex-start;flex-shrink:0;outline:none;border:none;background:none;padding:0;cursor:pointer;gap:0;width:var(--cw);perspective:1000px;transition:width 500ms ease,transform 200ms ease}
.bs-wrap.is-hov .bs-btn{width:var(--ow);transform:translateY(-2px)}
.bs-wrap.is-open .bs-btn{width:var(--ow);transform:translateY(-34px);transition:width 500ms ease,transform 520ms cubic-bezier(.3,1.35,.55,1)}
.bs-btn:active{transform:scale(.96)}
.bs-btn:focus-visible{outline:2px solid #34b562;outline-offset:3px;border-radius:2px}
.bs-spine,.bs-cover{flex-shrink:0;overflow:hidden;position:relative;will-change:transform}
.bs-spine>*,.bs-cover>*{filter:brightness(.8) contrast(2);transition:filter 500ms ease}
.bs-spine{display:flex;align-items:flex-start;justify-content:center;transform-origin:right center;transform:rotateY(0deg);transition:transform 500ms ease}
.bs-cover{transform-origin:left center;transform:rotateY(80deg);backface-visibility:hidden;opacity:0;visibility:hidden;transition:transform 500ms ease,opacity 120ms ease,visibility 0s linear 120ms}
.bs-wrap.is-hov .bs-spine{transform:rotateY(-60deg)}
.bs-wrap.is-hov .bs-cover{transform:rotateY(30deg);opacity:1;visibility:visible;transition:transform 500ms ease,opacity 80ms ease 40ms,visibility 0s}
.bs-wrap.is-open .bs-spine{transform:rotateY(-90deg)}
.bs-wrap.is-open .bs-cover{transform:rotateY(0deg);opacity:1;visibility:visible;transition:transform 500ms ease,opacity 80ms ease 40ms,visibility 0s}
.bs-wrap.is-open .bs-cover>*{filter:brightness(.86) contrast(1.8)}
.bs-wrap.is-open .bs-btn::after{opacity:1}
.bs-btn::after{content:"";position:absolute;left:10%;right:10%;bottom:-30px;height:18px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.55),transparent);opacity:0;transition:opacity 400ms ease;pointer-events:none}
.bs-row.has-open .bs-wrap:not(.is-open){opacity:.55}
.bs-wrap{transition:transform 500ms ease,opacity 400ms ease}
.bs-linen::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.09) 0 1px,transparent 1px 3px),repeating-linear-gradient(0deg,rgba(0,0,0,.07) 0 1px,transparent 1px 3px)}
.bs-linen::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:3;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 1px,transparent 1px 4px),repeating-linear-gradient(45deg,rgba(0,0,0,.03) 0 1px,transparent 1px 4px)}
.bs-paper{pointer-events:none;position:absolute;inset:0;opacity:.06;z-index:10;background:#fff}
.bs-binding{pointer-events:none;position:absolute;inset:0;z-index:5;background:linear-gradient(to right,rgba(255,255,255,0) 2px,rgba(255,255,255,.5) 3px,rgba(255,255,255,.25) 4px,rgba(255,255,255,.25) 6px,transparent 7px,transparent 9px,rgba(255,255,255,.25) 9px,transparent 12px)}
.bs-title{position:relative;z-index:11;writing-mode:vertical-rl;transform:rotate(180deg);font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;overflow:hidden;user-select:none;margin-top:12px;color:#fff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
.bs-plank{position:relative;height:22px;border-radius:3px;background-color:#c89968;background-image:linear-gradient(to bottom,#ecc995 0%,#dcb37a 22%,#6e4622 30%,#4a2d12 32%,#8c6238 34%,#c79865 38%,#b6884f 70%,#9c6e3a 100%);box-shadow:inset 0 1px 0 rgba(255,244,218,.85),inset 0 -1px 0 rgba(40,22,6,.45),0 6px 10px -3px rgba(0,0,0,.55),0 22px 36px -10px rgba(0,0,0,.6);filter:saturate(.85) brightness(.82)}
.bs-shadow{height:36px;margin-top:4px;background:radial-gradient(ellipse 60% 100% at top,rgba(0,0,0,.4) 0%,rgba(0,0,0,.16) 40%,transparent 80%)}
:root[data-theme="light"] .bs-plank{filter:saturate(.9) brightness(.97);box-shadow:inset 0 1px 0 rgba(255,244,218,.85),inset 0 -1px 0 rgba(40,22,6,.35),0 0 0 .5px oklch(0.3 0.04 60 / .25),0 6px 10px -4px oklch(0.22 0.008 264 / .22),0 18px 30px -12px oklch(0.22 0.008 264 / .2)}
:root[data-theme="light"] .bs-shadow{background:radial-gradient(ellipse 60% 100% at top,oklch(0.22 0.008 264 / .14) 0%,oklch(0.22 0.008 264 / .05) 40%,transparent 80%)}
:root[data-theme="light"] .bs-btn::after{background:radial-gradient(closest-side,oklch(0.22 0.008 264 / .22),transparent)}
:root[data-theme="light"] .bs-row.has-open .bs-wrap:not(.is-open){opacity:.68}
@media (prefers-reduced-motion: reduce){.bs-wrap,.bs-btn,.bs-spine,.bs-cover,.bs-btn::after{transition:none!important}}
`;

function Spine({ b, i, hov, open, onHover, onToggle }: { b: Book; i: number; hov: boolean; open: boolean; onHover: (v: boolean) => void; onToggle: () => void }) {
  const coverW = Math.round(b.h * 0.68);
  return (
    <div
      className={`bs-wrap${hov && !open ? " is-hov" : ""}${open ? " is-open" : ""}`}
      onMouseEnter={() => { if (!open) play("slide", { gap: 120, vol: 0.6 }); onHover(true); }}
      onMouseLeave={() => onHover(false)}
      style={{ "--tilt": `${TILTS[i % TILTS.length]}deg`, "--cw": `${b.w}px`, "--ow": `${b.w + coverW}px` } as CSSProperties}
    >
      <button
        type="button"
        className="bs-btn"
        aria-label={`${open ? "Put back" : "Pull out"} ${b.title}`}
        aria-pressed={open}
        onClick={(e) => { e.currentTarget.blur(); onToggle(); }}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        style={{ position: "relative" }}
      >
        <div className="bs-spine" style={{ width: b.w, height: b.h, background: b.color }}>
          <span className="bs-linen" style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: b.color }} />
          <span className="bs-title" style={{ maxHeight: b.h - 24 }}>{b.title}</span>
        </div>
        <div className="bs-cover" style={{ width: coverW, height: b.h }}>
          <Cover b={b} />
          <span className="bs-binding" />
        </div>
      </button>
    </div>
  );
}

// Drawn cover: no network images. Colour field, a frame, the title set in a serif.
function Cover({ b }: { b: Book }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 80% at 70% 15%, rgba(255,255,255,.22), transparent 60%), linear-gradient(160deg, ${b.color}, ${b.color} 55%, rgba(0,0,0,.35))`, backgroundColor: b.color, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "18px 14px 14px 18px", boxSizing: "border-box", color: "#fff", textAlign: "left" }}>
      <span className="bs-linen" style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.8 }} />
      <span style={{ position: "absolute", inset: "9px 9px 9px 13px", border: "1px solid rgba(255,255,255,.35)", pointerEvents: "none" }} />
      <span style={{ position: "relative", zIndex: 4, font: "600 7.5px/1 Inter, ui-sans-serif, system-ui", letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.75 }}>Classics</span>
      <span style={{ position: "relative", zIndex: 4 }}>
        <span style={{ display: "block", font: "500 17px/1.08 'Iowan Old Style', 'Palatino Linotype', Georgia, serif", letterSpacing: "-0.01em", textWrap: "balance" } as CSSProperties}>{b.title}</span>
        <span style={{ display: "block", width: 22, height: 1, background: "rgba(255,255,255,.55)", margin: "9px 0 7px" }} />
        <span style={{ display: "block", font: "500 9px/1.2 Inter, ui-sans-serif, system-ui", opacity: 0.75 }}>{b.author}</span>
      </span>
    </div>
  );
}

export default function Bookshelf({ size = "card" }: { size?: "card" | "big" }) {
  const { ref, s } = useFit(size);
  const [hov, setHov] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  // Escape puts the pulled book back.
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { play("close"); setOpen(null); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div style={{ width: DW * s, height: DH * s, position: "relative", transform: size === "card" ? "translateY(2px)" : undefined }}>
        <div
          data-own-click
          onMouseLeave={() => setHov(null)}
          style={{ pointerEvents: "auto", position: "absolute", left: 0, top: 0, width: DW, height: DH, transform: `scale(${s})`, transformOrigin: "0 0", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
        >
          <div className={`bs-row${open !== null ? " has-open" : ""}`}>
            {BOOKS.map((b, i) => (
              <Spine
                key={b.title}
                b={b}
                i={i}
                hov={hov === i}
                open={open === i}
                onHover={(v) => setHov((h) => (v ? i : h === i ? null : h))}
                onToggle={() => { if (open === i) play("close"); else play("land", { vol: 0.5 }); setOpen(open === i ? null : i); }}
              />
            ))}
          </div>
          <div style={{ position: "relative", margin: "0 0 0", zIndex: 1 }}>
            <div className="bs-plank" style={{ marginTop: -2 }} />
            <div className="bs-shadow" style={{ position: "absolute", left: 0, right: 0, top: 22 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
