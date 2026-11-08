// Native, dark versions of the components: one file each in src/components/<key>.tsx,
// default export ({ size }) => JSX. Found automatically by file name.
import type { ComponentType } from "react";

export type NativeSize = "card" | "big";
const MODS = import.meta.glob("../components/*.tsx", { eager: true, import: "default" }) as Record<string, ComponentType<{ size?: NativeSize }>>;
const RAW = import.meta.glob("../components/*.tsx", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

const key = (p: string) => p.split("/").pop()!.replace(/\.tsx$/, "");
export const NATIVE: Record<string, ComponentType<{ size?: NativeSize }>> = Object.fromEntries(Object.entries(MODS).map(([p, m]) => [key(p), m]));
export const NATIVE_SRC: Record<string, string> = Object.fromEntries(Object.entries(RAW).map(([p, m]) => [key(p), m]));
