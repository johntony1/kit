// Every item's own page: its path, the words a search engine and a link card show, and its card
// image. The build writes one HTML file per page from this list (scripts/pages.mjs), and the
// card images are drawn from the same list (scripts/og.mjs, the #/og/<path> view).

import { COMPS } from "./components";
import { ILLS } from "../empty/ills";
import { catOf } from "../empty/cats";
import { TYPE_EFFECTS, type TypeEffectKey } from "../type/effects";
import { TYPE_META } from "../type/meta";
import { TRANS_KEYS, TRANS_META } from "./TransitionPage";

export const SITE = "https://kit.orevbajohn.me";

export const LIB_META = {
  ripple: { name: "Ripple", desc: "A ring of light that bursts out of a point, bends whatever is under it and splits its colours." },
  confetti: { name: "Confetti pop", desc: "An element pops in with a blur and an overshoot, a glow springs in behind it, and ribbons of confetti burst out, tumble and fall." },
} as const;

export const TYPE_KEYS = ["bubble", "lens", "liquid", "rings", "slice", "smear", "lines", "contour"] as TypeEffectKey[];

export interface Page {
  /** "component/printer" (no leading slash) */
  path: string;
  /** the bento key the card image draws (cmp-printer, es-gift, bubble…) */
  k: string;
  name: string;
  /** "Component", "Empty state", "Type effect", "Transition", "Library" */
  kind: string;
  title: string;
  desc: string;
}

const COPY = "Free to copy as code, or as a prompt for Claude Code, Codex or Cursor.";
const clip = (s: string, n = 158) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(" ", n - 1))}…`);

export function pages(): Page[] {
  const out: Page[] = [];
  for (const c of COMPS) out.push({ path: `component/${c.k}`, k: `cmp-${c.k}`, name: c.name, kind: "Component",
    title: `${c.name}, a free React component | Kit`, desc: clip(`${c.desc} ${COPY}`) });
  for (const k of ["ripple", "confetti"] as const) out.push({ path: k, k, name: LIB_META[k].name, kind: "Library",
    title: `${LIB_META[k].name}, a free animation library | Kit`, desc: clip(`${LIB_META[k].desc} ${COPY}`) });
  for (const k of TYPE_KEYS) out.push({ path: `type/${k}`, k, name: TYPE_EFFECTS[k].name, kind: "Type effect",
    title: `${TYPE_EFFECTS[k].name}, a free type effect | Kit`, desc: clip(`${TYPE_META[k].desc} ${COPY}`) });
  for (const k of TRANS_KEYS) out.push({ path: `transition/${k}`, k, name: TRANS_META[k].name, kind: "Transition",
    title: `${TRANS_META[k].name}, a free page transition | Kit`, desc: clip(`${TRANS_META[k].desc} ${COPY}`) });
  for (const i of ILLS) {
    const cat = catOf(i.k);
    const plays = i.kind === "loop" ? "It loops on its own." : "It plays when you hover it.";
    out.push({ path: `empty/${i.k}`, k: `es-${i.k}`, name: i.name, kind: "Empty state",
      title: `${i.name}, a free empty state illustration | Kit`,
      desc: clip(`A dot matrix illustration for the “${i.title}” empty state${cat ? `, from the ${cat} set` : ""}. ${plays} Copy the code or the prompt, or download it as SVG or GIF.`) });
  }
  return out;
}

/** where a page's card image lives, from the site root */
export const ogPath = (p: Page) => `/og/${p.path}.jpg`;
