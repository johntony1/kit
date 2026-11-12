// The mark at the top of a component's sheet: one small glyph per component, drawn in our tones
// on a dark tile. A component with no glyph of its own gets the stacked layers, never a blank tile.
import type { ReactNode } from "react";

const G = "#3fc06c"; // the one green
const S = { fill: "none", stroke: "#c2cbc4", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const A = { ...S, stroke: G }; // an accent stroke

const GLYPH: Record<string, ReactNode> = {
  "card-fan": <><rect x="6.5" y="9" width="11" height="8" rx="1.8" {...S} /><path d="M8 9 9.2 6.2 16 7.4 15.6 9" {...A} /></>,
  currency: <><path d="M6 9.5h11m0 0-2.6-2.6M18 14.5H7m0 0 2.6 2.6" {...S} /><circle cx="6" cy="9.5" r=".1" {...A} /></>,
  printer: <><rect x="5" y="6" width="14" height="5.5" rx="1.6" {...S} /><path d="M8 11.5v6.5l1.3-1 1.4 1 1.3-1 1.3 1 1.4-1 1.3 1v-6.5" {...A} /></>,
  "task-tick": <><rect x="6" y="6" width="12" height="12" rx="3.5" {...S} /><path d="m9.3 12.2 2 2 3.5-4.2" {...A} /></>,
  "copy-link": <><path d="M10.5 13.5a3 3 0 0 0 4.2 0l2.3-2.3a3 3 0 0 0-4.2-4.2l-.8.8" {...S} /><path d="M13.5 10.5a3 3 0 0 0-4.2 0L7 12.8a3 3 0 0 0 4.2 4.2l.8-.8" {...A} /></>,
  segmented: <><rect x="4.5" y="8" width="15" height="8" rx="4" {...S} /><rect x="6.5" y="10" width="5.5" height="4" rx="2" fill={G} /></>,
  "add-money": <><circle cx="12" cy="12" r="6.5" {...S} /><path d="M12 9v6M9 12h6" {...A} /></>,
  scheduler: <><circle cx="12" cy="12" r="6.5" {...S} /><path d="M12 8.5V12l2.5 1.5" {...A} /></>,
  menu: <><path d="M6.5 8.5h11M6.5 12h11" {...S} /><path d="M6.5 15.5h6" {...A} /></>,
  "week-picker": <><rect x="5.5" y="6.5" width="13" height="11.5" rx="2.5" {...S} /><path d="M5.5 10.5h13M9 5v3M15 5v3" {...S} /><circle cx="12" cy="14.2" r="1.3" fill={G} /></>,
  attach: <path d="m16.5 11.3-4.6 4.6a2.8 2.8 0 0 1-4-4l5-5a1.9 1.9 0 0 1 2.7 2.7l-5 5a.9.9 0 0 1-1.3-1.3l4.3-4.3" {...S} />,
  "share-access": <><circle cx="10" cy="9.5" r="2.5" {...S} /><path d="M5.5 17.5a4.5 4.5 0 0 1 9 0" {...S} /><path d="M17 8.5v5M14.5 11h5" {...A} /></>,
  "date-ruler": <><path d="M5 15.5h14M7 15.5v-2.5M10.3 15.5v-4M13.7 15.5v-2.5M17 15.5v-4" {...S} /><path d="M12 6v3.5" {...A} /></>,
  balance: <><path d="M7 17v-4M12 17V7M17 17v-6.5" {...S} strokeWidth={2.2} /><path d="M12 17V7" {...A} strokeWidth={2.2} /></>,
  chat: <><path d="M6 8.5A2.5 2.5 0 0 1 8.5 6h7A2.5 2.5 0 0 1 18 8.5v4a2.5 2.5 0 0 1-2.5 2.5H11l-3.5 3v-3A2.5 2.5 0 0 1 6 12.5Z" {...S} /><path d="M9.5 10.5h5" {...A} /></>,
  "swipe-delete": <><rect x="8.5" y="8" width="10" height="8" rx="2.2" {...S} /><path d="M5.5 12h-1m3.5-2.5L5.5 12 8 14.5" {...A} /></>,
  "guest-list": <><circle cx="9.5" cy="10.5" r="3" {...S} /><circle cx="14.5" cy="10.5" r="3" {...A} fill="#1b1d1b" /><path d="M6 17.5c.6-1.7 2-2.5 3.5-2.5M18 17.5c-.6-1.7-2-2.5-3.5-2.5" {...S} /></>,
  "slash-menu": <><rect x="5.5" y="5.5" width="13" height="13" rx="3.5" {...S} /><path d="m13.5 8.5-3 7" {...A} /></>,
  "theme-switch": <><circle cx="12" cy="12" r="6.5" {...S} /><path d="M12 5.5a6.5 6.5 0 0 1 0 13Z" fill="#c2cbc4" /></>,
  keycap: <><rect x="6" y="6" width="12" height="12" rx="3" {...S} /><rect x="8.5" y="8" width="7" height="6.5" rx="1.8" {...A} /></>,
  "macro-pad": <><rect x="5.5" y="5.5" width="5" height="5" rx="1.4" {...S} /><rect x="13.5" y="5.5" width="5" height="5" rx="1.4" {...A} /><rect x="5.5" y="13.5" width="5" height="5" rx="1.4" {...S} /><rect x="13.5" y="13.5" width="5" height="5" rx="1.4" {...S} /></>,
  "glass-toggle": <><rect x="4.5" y="8" width="15" height="8" rx="4" {...S} /><circle cx="15.5" cy="12" r="2.3" fill={G} /></>,
  dial: <><circle cx="12" cy="12" r="6.5" {...S} /><path d="M12 12 15 8.5" {...A} /><circle cx="12" cy="12" r="1" fill="#c2cbc4" /></>,
  "soft-rocker": <><rect x="6.5" y="5.5" width="11" height="13" rx="3" {...S} /><path d="M6.5 12h11" {...S} /><path d="M10.5 8.8h3" {...A} /></>,
  "toggle-switch": <><circle cx="12" cy="14.5" r="3.5" {...S} /><path d="M12 13V6" {...A} strokeWidth={2.2} /></>,
  transcription: <><path d="M6 10.5v3M9 8v8M12 10v4M15 7v10M18 10.5v3" {...S} /><path d="M12 10v4" {...A} /></>,
  bookshelf: <><path d="M7 6v11.5M10.5 6v11.5M5 17.5h14" {...S} /><path d="m13.8 7.3 3.4 9.7" {...A} /></>,
  cube: <><path d="M12 5.5 17.5 8.7v6.6L12 18.5 6.5 15.3V8.7Z" {...S} /><path d="M6.5 8.7 12 12l5.5-3.3M12 12v6.5" {...A} /></>,
  shutter: <><rect x="5.5" y="6" width="13" height="12" rx="2.5" {...S} /><path d="M5.5 13c3.5-3 9.5-3 13 0" {...A} /></>,
};

const FALLBACK = <><path d="M12 6 18 9.3 12 12.6 6 9.3Z" {...S} /><path d="M6 12.5 12 15.8 18 12.5" {...A} /></>;

export function CompIcon({ k }: { k: string }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#1b1d1b" />
      {GLYPH[k] ?? FALLBACK}
    </svg>
  );
}
