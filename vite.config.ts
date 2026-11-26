import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** `virtual:ills-meta`: the key, name and title of every empty state, read from its file's header.
 *  The site lists and searches every piece from this, and loads a piece's drawing code only when
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
    // a piece added or removed while the dev server runs: rebuild the list and reload the page
    configureServer(server) {
      server.watcher.add(dir);
      const changed = (file: string) => {
        if (path.dirname(file) !== dir || !file.endsWith(".ts")) return;
        const mod = server.moduleGraph.getModuleById(RES);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", changed);
      server.watcher.on("unlink", changed);
    },
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

/** Clearlook analytics: the tag goes in the built site only, so local dev and OG captures don't count as visits. */
function clearlook(): Plugin {
  return {
    name: "clearlook",
    apply: "build",
    transformIndexHtml: () => [{ tag: "script", attrs: { defer: true, src: "https://app.clearlook.dev/s/0.3.3/w.js", integrity: "sha384-LFGTVXp8ZYutqdOno2N8tMemfvjl08KkM4SEV9n6hGgoyq5+2XD/0yRASrnaj8FH", crossorigin: "anonymous", "data-key": "pk_live_I98CdgGlTjs3WmnMBM71qvYn" }, injectTo: "head" }],
  };
}

// the deploy's commit, so Clearlook's errors line up with a release
const commit = process.env.COMMIT || (() => { try { return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return "dev"; } })();

export default defineConfig({
  plugins: [illsMeta(), clearlook(), react(), tailwindcss()],
  define: { __COMMIT__: JSON.stringify(commit) },
});
