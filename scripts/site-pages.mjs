// The list of item pages (src/site/pages.ts), loaded in Node through Vite so the app's own
// imports (import.meta.glob, the empty states' virtual module) work as they do in the browser.
import { createServer } from "vite";

export async function loadPages() {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
  try {
    const m = await vite.ssrLoadModule("/src/site/pages.ts");
    return { pages: m.pages(), SITE: m.SITE, ogPath: m.ogPath };
  } finally {
    await vite.close();
  }
}
