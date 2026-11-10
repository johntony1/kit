// Every illustration file in this folder registers itself: export one Illustration per file.
import type { Illustration } from "../dots";

const mods = import.meta.glob<Record<string, Illustration>>(["./*.ts", "!./index.ts"], { eager: true });
const ORDER = ["notfound", "gift", "terminal", "bell", "tower", "card", "cabinet", "database", "ghost", "warning", "sync", "mailbox"];
const all = Object.values(mods).flatMap((m) => Object.values(m).filter((v): v is Illustration => !!v && typeof v === "object" && "draw" in v));
export const ILLS: Illustration[] = all.sort((a, b) => (ORDER.indexOf(a.k) + 1 || 99) - (ORDER.indexOf(b.k) + 1 || 99) || a.k.localeCompare(b.k));
export const illOf = (k: string) => ILLS.find((i) => i.k === k);

/** the raw source of each illustration file, for the Code tab */
export const ILL_SRC = import.meta.glob<string>(["./*.ts", "!./index.ts"], { query: "?raw", import: "default", eager: true });
