// The components: each is its own small app, embedded live from its deployment so it runs
// exactly as built. Their main source files are vendored as text for the Code tab.

import meta from "../components-src/meta.json";

const SRC = import.meta.glob("../components-src/*/*.txt", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export interface Comp {
  k: string;
  name: string;
  desc: string;
  url: string;
  repo: string;
  /** tile size in the bento: columns of 6, rows of 150px */
  c: number;
  r: number;
  /** full-page sites are shown scaled down to fit */
  zoom: number;
  /** the app's own page colour */
  bg: string;
  deps: string[];
}

const GH = "https://github.com/johntony1/";
const M = meta as Record<string, { deps: string[] }>;

export const COMPS: Comp[] = [
  { k: "card-funding", name: "Card funding", desc: "A stack of currency cards fans out; pick one and add money to it.", url: "https://card-funding-theta.vercel.app/", repo: GH + "card-funding", c: 3, r: 3, zoom: 1, bg: "#ffffff", deps: M["card-funding"].deps },
  { k: "currency", name: "Currency swap", desc: "Swap two currencies with a flip, review the summary, slide to confirm and land on a confetti success.", url: "https://currency-exchange-silk.vercel.app/", repo: GH + "currency-exchange", c: 3, r: 3, zoom: 1, bg: "#ffffff", deps: M["currency"].deps },
  { k: "printer", name: "Pay slip printer", desc: "Payment successful: slide to print, and the slip feeds out of the printer.", url: "https://printer-animation.vercel.app/", repo: GH + "printer-animation", c: 2, r: 3, zoom: 1, bg: "#ffffff", deps: M["printer"].deps },
  { k: "scheduler", name: "Scheduler", desc: "Weekly availability: switch a day on and its time picker unfolds.", url: "https://scheduler-murex-nine.vercel.app/", repo: GH + "SCHEDULER", c: 2, r: 3, zoom: 1, bg: "#ffffff", deps: M["scheduler"].deps },
  { k: "share", name: "Share sheet", desc: "A share sheet: open access up and copy the link.", url: "https://share-animation.vercel.app/", repo: GH + "share-animation", c: 2, r: 3, zoom: 1, bg: "#ffffff", deps: M["share"].deps },
  { k: "calendar", name: "Calendar task", desc: "A task card that expands into a calendar and a guest list.", url: "https://calendar-animation.vercel.app/", repo: GH + "calendar-animation", c: 3, r: 3, zoom: 1, bg: "#ffffff", deps: M["calendar"].deps },
  { k: "segmented", name: "Segmented tabs", desc: "Tabs with a highlight that slides and stretches between them.", url: "https://segmented-tab-animation.vercel.app/", repo: GH + "segmented-tab-animation", c: 3, r: 2, zoom: 1, bg: "#ffffff", deps: ["framer-motion", "gsap"] },
  { k: "menu", name: "Menu expand", desc: "One small Menu pill that opens into the full menu.", url: "https://menu-expand.vercel.app/", repo: GH + "menu-expand", c: 2, r: 2, zoom: 1, bg: "#ffffff", deps: M["menu"].deps },
  { k: "document", name: "Document input", desc: "A message field that takes images and documents, each attachment animating in.", url: "https://document-input-field-interaction.vercel.app/", repo: GH + "document-input-field-interaction", c: 2, r: 2, zoom: 1, bg: "#f7f7f7", deps: M["document"].deps },
  { k: "chat", name: "Chat composer", desc: "A chat composer that wakes up as you start to write.", url: "https://music-animation-gamma.vercel.app/", repo: GH + "music-animation", c: 2, r: 2, zoom: 1, bg: "#f0f0f0", deps: M["chat"].deps },
  { k: "balance", name: "Balance card", desc: "A balance card with a live bar chart and a share step.", url: "https://modal-animation-steel.vercel.app/", repo: GH + "modal-animation", c: 3, r: 3, zoom: 1, bg: "#ffffff", deps: M["balance"].deps },
  { k: "transcription", name: "Voice transcription", desc: "A voice note whose waveform plays while the words are written out.", url: "https://music-transcription-lyart.vercel.app/", repo: GH + "music-transcription", c: 3, r: 2, zoom: 1, bg: "#ffffff", deps: M["transcription"].deps },
  { k: "bookshelf", name: "Bookshelf", desc: "Books on a shelf in 3D: pull one out and it opens to read.", url: "https://bookshelf-six-livid.vercel.app/", repo: GH + "bookshelf", c: 6, r: 3, zoom: 0.62, bg: "#ffffff", deps: ["@react-three/fiber", "@react-three/drei", "three", "framer-motion", "next"] },
  { k: "cube", name: "Cube deck", desc: "A landing page whose 3D cubes turn and stack as you scroll.", url: "https://3d-cube-rotate.vercel.app/", repo: GH + "3d-cube-rotate", c: 3, r: 3, zoom: 0.5, bg: "#020513", deps: M["cube"].deps },
  { k: "shutter", name: "Shutter scroll", desc: "Screens behind a curved shutter that wipes open as you scroll.", url: "https://shutter-scroll-plus-curved.vercel.app/", repo: GH + "shutter-scroll-plus-curved", c: 3, r: 3, zoom: 0.5, bg: "#0069ed", deps: ["gsap", "lenis", "motion", "tailwindcss"] },
];

export const compOf = (k: string) => COMPS.find((c) => c.k === k);

/** the vendored source files of a component, largest first */
export function sourcesOf(k: string): [string, string][] {
  return Object.entries(SRC)
    .filter(([p]) => p.split("/").slice(-2)[0] === k)
    .map(([p, text]) => [p.split("/").pop()!.replace(/\.txt$/, "").replace(/__/g, "/"), text] as [string, string])
    .sort((a, b) => b[1].length - a[1].length);
}

export function compPrompt(c: Comp, own?: string) {
  const [main] = own ? [[`${c.k}.tsx (dark version)`, own] as [string, string]] : sourcesOf(c.k);
  return `# Add the "${c.name}" component

${c.desc}

It is open source: ${c.repo} (live: ${c.url}).
Rebuild it in this project's stack and style, keeping the motion exactly: the same timings,
springs and easing as the source below. It uses: ${c.deps.join(", ") || "React only"}.

${main ? `## ${main[0]}\n\`\`\`tsx\n${main[1]}\n\`\`\`\n` : ""}`;
}
