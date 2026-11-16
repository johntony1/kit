// Draw every item's link card (1200 × 630 JPEG) into public/og/<path>.jpg.
// One headless Chrome, a few tabs at once, driven over the DevTools protocol; each tab opens the
// item's #/og/<path> view, lets it play for a moment, and takes the picture.
// Cards that already exist are kept, so a run only draws new items.
//
//   npm run dev                 (in another terminal; or pass --base for any server)
//   node scripts/og.mjs         [--force] [--only component/printer,type/bubble] [--base http://localhost:5173]

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadPages } from "./site-pages.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i < 0 ? d : process.argv[i + 1]; };
const FORCE = process.argv.includes("--force");
const ONLY = arg("only", "")?.split(",").filter(Boolean);
const BASE = arg("base", "http://localhost:5173");
const TABS = +arg("tabs", 4);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.resolve("public/og");
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** how long a card plays before its picture: long enough for its entrance to settle */
const wait = (p) => (p.kind === "Empty state" ? 1600 : p.kind === "Transition" ? 3600 : 2600);

const { pages } = await loadPages();
const todo = pages.filter((p) => (ONLY?.length ? ONLY.includes(p.path) : true) && (FORCE || !fs.existsSync(path.join(OUT, `${p.path}.jpg`))));
console.log(`${todo.length} cards to draw (${pages.length} pages)`);
if (!todo.length) process.exit(0);

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "kit-og-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
  "--hide-scrollbars", "--no-first-run", "--mute-audio", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
  "--window-size=1200,630", "about:blank"], { stdio: "ignore" });
const done = () => { try { chrome.kill(); } catch { /* gone */ } try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* Chrome still closing: the OS clears tmp */ } };
process.on("exit", done);
process.on("SIGINT", () => process.exit(130));

for (let i = 0; ; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch { if (i > 50) throw new Error("Chrome did not start"); await sleep(200); } }

/** one tab: a websocket to its page, with a promise per command */
async function tab() {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const wait = new Map(), events = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && wait.has(d.id)) { const [r, j] = wait.get(d.id); wait.delete(d.id); d.error ? j(new Error(d.error.message)) : r(d.result); }
    else if (d.method && events.has(d.method)) { events.get(d.method)(d.params); events.delete(d.method); }
  };
  const send = (method, params = {}) => new Promise((r, j) => { const n = ++id; wait.set(n, [r, j]); ws.send(JSON.stringify({ id: n, method, params })); });
  const once = (method) => new Promise((r) => events.set(method, r));
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  return { send, once, close: () => ws.close() };
}

let n = 0, failed = 0;
const started = Date.now();
const limit = (ms) => new Promise((_, j) => setTimeout(() => j(new Error(`no picture after ${ms / 1000}s`)), ms));
async function worker() {
  let t = await tab();
  for (let p; (p = todo.shift()); ) {
    try {
      await Promise.race([draw(t, p), limit(25000)]);
    } catch (e) {
      failed++; console.warn(`failed ${p.path}: ${e.message}`);
      // a stuck tab is dropped for a fresh one
      t.close(); t = await tab();
    }
  }
  t.close();
}
async function draw(t, p) {
    {
      const loaded = t.once("Page.loadEventFired");
      await t.send("Page.navigate", { url: `${BASE}/?theme=dark&og=${Date.now()}#/og/${p.path}` });
      await Promise.race([loaded, sleep(15000)]);
      await sleep(wait(p));
      const { data } = await t.send("Page.captureScreenshot", { format: "jpeg", quality: 80, clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
      const file = path.join(OUT, `${p.path}.jpg`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(data, "base64"));
      n++;
      if (n % 25 === 0) console.log(`${n} drawn, ${Math.round((Date.now() - started) / 1000)}s`);
    }
}
await Promise.all(Array.from({ length: TABS }, worker));
console.log(`done: ${n} drawn, ${failed} failed, ${Math.round((Date.now() - started) / 1000)}s`);
process.exit(failed ? 1 : 0);
