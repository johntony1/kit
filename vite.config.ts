import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** `virtual:ills-meta`: the key, name and title of every empty state, read from its file's header.
 *  The site lists and searches 500 pieces from this, and loads a piece's drawing code only when
 *  the piece is on screen. */
function illsMeta(): Plugin {
  const dir = fileURLToPath(new URL("./src/empty/ills", import.meta.url));
  const ID = "virtual:ills-meta", RES = "\0" + ID;
  const str = (s: string, n: string) => {
    const m = s.match(new RegExp(`\\b${n}: "((?:[^"\\\\]|\\\\.)*)"`));
    if (!m) return undefined;
    try { return JSON.parse(`"${m[1]}"`) as string; } catch { return m[1]; }
  };
  return {
    name: "ills-meta",
    resolveId(id) { return id === ID ? RES : undefined; },
    load(id) {
      if (id !== RES) return;
      const out: Record<string, string>[] = [];
      for (const f of fs.readdirSync(dir).sort()) {
        if (!f.endsWith(".ts") || f === "index.ts") continue;
        const file = path.join(dir, f);
        this.addWatchFile(file);
        const s = fs.readFileSync(file, "utf8");
        const k = str(s, "k"), flat = str(s, "flat");
        if (!k || k !== f.slice(0, -3)) continue;
        out.push({ k, name: str(s, "name") ?? k, title: str(s, "title") ?? "", kind: str(s, "kind") ?? "hover", ...(flat ? { flat } : {}) });
      }
      return `export default ${JSON.stringify(out)};`;
    },
  };
}

export default defineConfig({
  plugins: [illsMeta(), react(), tailwindcss()],
});
