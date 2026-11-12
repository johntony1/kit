// Native, dark versions of the components: one file each in src/components/<key>.tsx,
// default export ({ size }) => JSX. Found automatically by file name, and each loaded on its own
// the first time it is shown.
import { lazy, type ComponentType } from "react";

export type NativeSize = "card" | "big";
type Native = ComponentType<{ size?: NativeSize }>;
const MODS = import.meta.glob<{ default: Native }>("../components/*.tsx");
const RAW = import.meta.glob<string>("../components/*.tsx", { query: "?raw", import: "default" });

const key = (p: string) => p.split("/").pop()!.replace(/\.tsx$/, "");
export const NATIVE: Record<string, Native> = Object.fromEntries(Object.entries(MODS).map(([p, load]) => [key(p), lazy(load)]));
/** a component's source file as text, for the Code tab and the prompt */
export const loadNativeSrc = (k: string): Promise<string | undefined> => RAW[`../components/${k}.tsx`]?.() ?? Promise.resolve(undefined);
