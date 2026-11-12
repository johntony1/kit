// Every illustration is one file in this folder. The site knows each one's name and copy up front
// (virtual:ills-meta, read from the files at build time) and loads a piece's drawing code only when
// it is needed: when its card is on screen, or its sheet is open.
import { useEffect, useState } from "react";
import META from "virtual:ills-meta";
import type { Illustration } from "../dots";

export type IllMeta = (typeof META)[number];
const ORDER = ["notfound", "gift", "terminal", "bell", "tower", "card", "cabinet", "database", "ghost", "warning", "sync", "mailbox"];
export const ILLS: IllMeta[] = [...META].sort((a, b) => (ORDER.indexOf(a.k) + 1 || 99) - (ORDER.indexOf(b.k) + 1 || 99) || a.k.localeCompare(b.k));
const BY = new Map(ILLS.map((i) => [i.k, i]));
export const illOf = (k: string) => BY.get(k);

const mods = import.meta.glob<Record<string, Illustration>>(["./*.ts", "!./index.ts"]);
const raws = import.meta.glob<string>(["./*.ts", "!./index.ts"], { query: "?raw", import: "default" });
const ready = new Map<string, Illustration>();
const pending = new Map<string, Promise<Illustration | undefined>>();

/** a piece's drawing code, fetched once */
export function loadIll(k: string): Promise<Illustration | undefined> {
  const hit = ready.get(k);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(k);
  if (!p) {
    const load = mods[`./${k}.ts`];
    p = load ? load().then((m) => { const ill = m[k]; if (ill) ready.set(k, ill); return ill; }).catch(() => undefined) : Promise.resolve(undefined);
    pending.set(k, p);
  }
  return p;
}

/** a piece's source file as text, for the Code tab and the prompt */
export const loadIllSrc = (k: string): Promise<string> => raws[`./${k}.ts`]?.() ?? Promise.resolve("");

/** the piece once its code has arrived (null until then) */
export function useIll(k: string | undefined): Illustration | null {
  const [ill, setIll] = useState<Illustration | null>(() => (k ? ready.get(k) ?? null : null));
  useEffect(() => {
    if (!k) { setIll(null); return; }
    const hit = ready.get(k);
    if (hit) { setIll(hit); return; }
    let live = true;
    setIll(null);
    loadIll(k).then((i) => { if (live && i) setIll(i); });
    return () => { live = false; };
  }, [k]);
  return ill;
}
