// The home page: every effect as a live card in an Apple-style bento. Click a card and it
// grows into the detail sheet (one continuous shape); close it and it shrinks back.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { OrbRipple } from "../demos/RippleDemos";
import { SuccessCard } from "../demos/ConfettiDemos";
import { TYPE_EFFECTS, type TypeEffectKey } from "../type/effects";
import { TypeCanvas } from "../type/TypeCanvas";
import { SwapDemo, TRANS_META } from "./TransitionPage";
import type { TransitionKind } from "../transitions/transitions";

export type BentoLib = "ripple" | "confetti" | TypeEffectKey | TransitionKind;
type Group = "Libraries" | "Type" | "Transitions";
interface Tile { k: BentoLib; group: Group; c: number; r: number; tag?: string }

// the arrangement: 6 columns. Big features, halves, thirds, and one full-width row to end
export const TILES: Tile[] = [
  { k: "ripple", group: "Libraries", c: 4, r: 3, tag: "Library" }, { k: "confetti", group: "Libraries", c: 2, r: 3, tag: "Library" },
  { k: "bubble", group: "Type", c: 3, r: 2 }, { k: "lens", group: "Type", c: 3, r: 2 },
  { k: "burn", group: "Transitions", c: 2, r: 2, tag: "New" }, { k: "paper", group: "Transitions", c: 2, r: 2, tag: "New" }, { k: "liquid", group: "Type", c: 2, r: 2 },
  { k: "rings", group: "Type", c: 2, r: 2 }, { k: "contour", group: "Type", c: 4, r: 2 },
  { k: "slice", group: "Type", c: 2, r: 2 }, { k: "smear", group: "Type", c: 2, r: 2 }, { k: "lines", group: "Type", c: 2, r: 2 },
  { k: "reveal", group: "Transitions", c: 3, r: 2 }, { k: "ink", group: "Transitions", c: 3, r: 2 },
  { k: "curtain", group: "Transitions", c: 2, r: 2 }, { k: "pixels", group: "Transitions", c: 2, r: 2 }, { k: "zoom", group: "Transitions", c: 2, r: 2 },
  { k: "tilt", group: "Transitions", c: 6, r: 2 },
];

export function nameOf(k: BentoLib) {
  if (k === "ripple") return "Ripple";
  if (k === "confetti") return "Confetti pop";
  if (k in TYPE_EFFECTS) return TYPE_EFFECTS[k as TypeEffectKey].name;
  return TRANS_META[k as TransitionKind].name;
}

/** true while the element is on screen (with a little margin) */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

// what plays inside a card. Hover is always live; anything with its own clicks is marked
// data-own-click so those clicks stay with the component and don't open the card
function Preview({ t }: { t: Tile }) {
  const [replay, setReplay] = useState(0);
  if (t.k === "ripple") return <OrbRipple fireOn="hover" />;
  if (t.k === "confetti") return (
    <div className="bnConfetti">
      <div className="bnScale" data-own-click onClick={() => setReplay((n) => n + 1)}><SuccessCard trigger={replay} /></div>
    </div>
  );
  if (t.k in TYPE_EFFECTS) {
    const e = TYPE_EFFECTS[t.k as TypeEffectKey];
    return <div className="bnFill" style={{ background: e.look.bg }}><TypeCanvas effect={e} fit={(e.look.fit ?? 0.78) * 0.78} /></div>;
  }
  // the demo site in a window, under the tag, the way Apple sits a device in a tile; its links work
  return <div className="bnWindow" data-own-click><div className="bnWindowBar"><i /><i /><i /></div><div className="bnWindowBody"><SwapDemo kind={t.k as TransitionKind} compact={t.c <= 2} auto={3200 + (t.k.length % 4) * 300} /></div></div>;
}

const SPRING = { type: "spring", duration: 0.5, bounce: 0.1 } as const;

function Card({ t, open, paused, onOpen }: { t: Tile; open: boolean; paused: boolean; onOpen: () => void }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const live = seen && !paused;
  return (
    <div ref={ref} className="bnSlot" style={{ gridColumn: `span ${t.c}`, gridRow: `span ${t.r}` }}>
      {!open && (
        <motion.div role="button" tabIndex={0} layoutId={`bn-${t.k}`} transition={SPRING} className="bnCard" style={{ borderRadius: 28 }}
          onClick={(e) => { if (!(e.target as HTMLElement).closest("[data-own-click]")) onOpen(); }}
          onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(); } }} aria-label={`${nameOf(t.k)}. Press Enter to open.`}>
          <div className="bnPreview">{live ? <Preview t={t} /> : null}</div>
          <span className="bnTag">{t.tag ?? (t.group === "Type" ? "Type" : t.group === "Transitions" ? "Transition" : "Library")}</span>
          <span className="bnName">{nameOf(t.k)}</span>
          <span className="bnGo" aria-hidden="true" onClick={(e) => { e.stopPropagation(); onOpen(); }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 11 11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        </motion.div>
      )}
    </div>
  );
}

export function Home({ open, onOpen, onClose, detail }: { open: BentoLib | null; onOpen: (k: BentoLib) => void; onClose: () => void; detail: (k: BentoLib) => ReactNode }) {
  const [filter, setFilter] = useState<"All" | Group>("All");
  const tiles = TILES.filter((t) => filter === "All" || t.group === filter);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", esc);
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${sb}px`;
    return () => { removeEventListener("keydown", esc); document.body.style.overflow = ""; document.body.style.paddingRight = ""; };
  }, [open, onClose]);

  return (
    <MotionConfig reducedMotion="user">
      <section className="bnHero">
        <span className="bnPill">Free and open source</span>
        <h1 className="bnH">Effects you can copy</h1>
        <p className="bnSub">Ripples, confetti, type that bends and pages that turn. Every one is a file and a prompt for <span>your own project</span>.</p>
      </section>
      <div className="bnChips" role="radiogroup" aria-label="Filter effects">
        {(["All", "Libraries", "Type", "Transitions"] as const).map((f) => (
          <button key={f} type="button" role="radio" aria-checked={f === filter} className={`bnChip ${f === filter ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="bnGrid">
        {tiles.map((t) => <Card key={t.k} t={t} open={open === t.k} paused={open !== null} onOpen={() => onOpen(t.k)} />)}
      </div>

      <AnimatePresence>
        {open && (
          <div className="bnLayer" key="layer">
            <motion.div className="bnScrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} />
            <motion.div layoutId={`bn-${open}`} transition={SPRING} className="bnSheet" style={{ borderRadius: 28 }} role="dialog" aria-modal="true" aria-label={nameOf(open)}>
              {/* the card's live preview rides along as the card grows, then hands over to the page */}
              <motion.div layout className="bnGhost" initial={{ opacity: 1 }} animate={{ opacity: 0, transition: { delay: 0.22, duration: 0.18 } }} exit={{ opacity: 1, transition: { duration: 0.1 } }}>
                <Preview t={TILES.find((x) => x.k === open)!} />
              </motion.div>
              <motion.div className="bnSheetInner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.34, duration: 0.28, ease: [0.2, 0, 0, 1] } }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                {detail(open)}
              </motion.div>
              <button type="button" className="bnClose" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" /></svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
