// The component blocks: each does one or two things, and is taken from one of the apps
// below. Those apps' main source files are vendored as text for the Code tab.

import meta from "../components-src/meta.json";

const SRC = import.meta.glob("../components-src/*/*.txt", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** the app a block was taken from: its repo, its live site, its dependencies */
interface Source { url: string; repo: string; bg: string; deps: string[] }

export type Verb = "Hover" | "Press" | "Drag" | "Slide" | "Swipe" | "Type" | "Select" | "Scroll";

export interface Comp extends Source {
  k: string;
  name: string;
  desc: string;
  /** the source app key (src/components-src/<from>) */
  from: string;
  /** what you do to it */
  verb: Verb;
  /** tile size in the bento: columns of 6, rows of 150px */
  c: number;
  r: number;
}

const GH = "https://github.com/johntony1/";
const M = meta as Record<string, { deps: string[] }>;
const src = (from: string, url: string, repo: string, bg = "#ffffff", deps?: string[]): [string, Source] =>
  [from, { url, repo: GH + repo, bg, deps: deps ?? M[from]?.deps ?? [] }];
const SOURCES: Record<string, Source> = Object.fromEntries([
  src("card-funding", "https://card-funding-theta.vercel.app/", "card-funding"),
  src("currency", "https://currency-exchange-silk.vercel.app/", "currency-exchange"),
  src("printer", "https://printer-animation.vercel.app/", "printer-animation"),
  src("scheduler", "https://scheduler-murex-nine.vercel.app/", "SCHEDULER"),
  src("share", "https://share-animation.vercel.app/", "share-animation"),
  src("calendar", "https://calendar-animation.vercel.app/", "calendar-animation"),
  src("segmented", "https://segmented-tab-animation.vercel.app/", "segmented-tab-animation", "#ffffff", ["framer-motion", "gsap"]),
  src("menu", "https://menu-expand.vercel.app/", "menu-expand"),
  src("document", "https://document-input-field-interaction.vercel.app/", "document-input-field-interaction", "#f7f7f7"),
  src("chat", "https://music-animation-gamma.vercel.app/", "music-animation", "#f0f0f0"),
  src("balance", "https://modal-animation-steel.vercel.app/", "modal-animation"),
  src("transcription", "https://music-transcription-lyart.vercel.app/", "music-transcription"),
  src("bookshelf", "https://bookshelf-six-livid.vercel.app/", "bookshelf", "#ffffff", ["@react-three/fiber", "@react-three/drei", "three", "framer-motion", "next"]),
  src("cube", "https://3d-cube-rotate.vercel.app/", "3d-cube-rotate", "#020513"),
  src("shutter", "https://shutter-scroll-plus-curved.vercel.app/", "shutter-scroll-plus-curved", "#0069ed", ["gsap", "lenis", "motion", "tailwindcss"]),
]);

type B = [k: string, name: string, desc: string, from: string, verb: Verb, c: number, r: number];
// one or two interactions each, in the order they sit in the bento
const BLOCKS: B[] = [
  ["card-fan", "Card fan", "Hover the wallet and the currency cards fan out and tilt toward you.", "card-funding", "Hover", 3, 3],
  ["currency", "Currency swap", "Swap two currencies: the card tips over and the values trade places.", "currency", "Press", 3, 3],
  ["printer", "Pay slip printer", "Slide to print, and the slip feeds out of the printer.", "printer", "Slide", 2, 3],
  ["task-tick", "Task tick", "Tick a task: it fills, rings and bursts.", "calendar", "Press", 2, 3],
  ["copy-link", "Copy link", "Copy the link: the button squishes, flips to Copied and throws dots.", "share", "Press", 2, 2],
  ["sliding-tabs", "Sliding tabs", "A highlight that slides and stretches from tab to tab.", "segmented", "Select", 4, 2],
  ["add-money", "Add money", "Add money: the wallet lifts, the sheet springs up and the amount rolls.", "card-funding", "Press", 3, 3],
  ["day-toggle", "Day toggle", "Switch a day on and its hours unfold.", "scheduler", "Press", 3, 3],
  ["menu", "Menu expand", "One small Menu pill that opens into the full menu.", "menu", "Press", 2, 3],
  ["week-picker", "Week picker", "Tap the calendar and the task card opens into a week.", "calendar", "Press", 2, 3],
  ["attach", "Attachment", "Attach a file: it blurs in, uploads with a ring and turns into a close button.", "document", "Press", 2, 3],
  ["status-pill", "Status picker", "Pick a status from the popover and the pill morphs to fit it.", "segmented", "Select", 3, 2],
  ["share-access", "Invite field", "Switch off Anyone and the invite field springs open.", "share", "Press", 3, 2],
  ["bar-chart", "Bar chart", "Hover the bars for each day's value.", "balance", "Hover", 3, 2],
  ["time-picker", "Time drum", "Turn the drum to pick a time.", "scheduler", "Drag", 2, 2],
  ["song-drawer", "Recent songs", "Pull the handle and the recent songs slide up.", "chat", "Drag", 2, 2],
  ["swipe-delete", "Swipe to delete", "Swipe a member away and the list closes the gap.", "share", "Swipe", 2, 2],
  ["guest-list", "Guest list", "Tap the faces and they open into the guest list.", "calendar", "Press", 3, 3],
  ["record-sleeve", "Record sleeve", "Hover a sleeve and the record slides out. Tap it to play.", "chat", "Hover", 3, 3],
  ["date-ruler", "Date ruler", "Drag the ruler to pick a date.", "balance", "Drag", 3, 2],
  ["slash-menu", "Slash command", "Type a slash and the command menu opens.", "document", "Type", 3, 2],
  ["share-step", "Share card", "Share the balance as a card.", "balance", "Press", 2, 2],
  ["transcription", "Voice note", "Play a voice note: the waveform runs while the words are written out.", "transcription", "Press", 4, 2],
  ["bookshelf", "Bookshelf", "Books on a shelf. Hover one and it turns to show its cover, click to pull it out.", "bookshelf", "Hover", 6, 3],
  ["cube", "Cube deck", "Drag the cube and it rolls to the next screen.", "cube", "Drag", 3, 3],
  ["shutter", "Shutter scroll", "Scroll and the next screen wipes in behind a curved shutter.", "shutter", "Scroll", 3, 3],
];

/** only blocks whose file exists in src/components are listed */
const HAVE = new Set(Object.keys(import.meta.glob("../components/*.tsx")).map((p) => p.split("/").pop()!.replace(/\.tsx$/, "")));
export const COMPS: Comp[] = BLOCKS.filter((b) => HAVE.has(b[0])).map(([k, name, desc, from, verb, c, r]) => ({ k, name, desc, from, verb, c, r, ...SOURCES[from] }));

export const compOf = (k: string) => COMPS.find((c) => c.k === k);

/** the vendored source files of a component, largest first */
export function sourcesOf(k: string): [string, string][] {
  return Object.entries(SRC)
    .filter(([p]) => p.split("/").slice(-2)[0] === (compOf(k)?.from ?? k))
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
