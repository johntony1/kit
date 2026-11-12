// Dev only (dots.html#key,key): each piece is loaded on its own, so one broken file never hides the
// rest. A row per piece: three moments in stipple, then halftone, line on its stage, and card size.
import { paintFrame, windowOf, THEMES, type DotStyle, type Illustration } from "./dots";

const files = import.meta.glob<Record<string, Illustration>>(["./ills/*.ts", "!./ills/index.ts"]);
const root = document.getElementById("lab")!;
const px = Number(new URLSearchParams(location.search).get("px") ?? 3.4);

function cell(row: HTMLElement, note: string, paint: (c: CanvasRenderingContext2D) => { w: number; h: number }) {
  const box = document.createElement("div");
  box.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px;border-radius:12px;background:#111";
  const cv = document.createElement("canvas");
  cv.width = 10; cv.height = 10;
  try {
    // size first, then paint
    const probe = paint(cv.getContext("2d")!);
    cv.width = Math.ceil(probe.w); cv.height = Math.ceil(probe.h);
    paint(cv.getContext("2d")!);
  } catch (e) { note = `${note}: ERROR ${(e as Error).message}`; box.style.color = "#ff6b6b"; }
  const cap = document.createElement("span"); cap.textContent = note;
  box.append(cv, cap); row.append(box);
}

async function show(k: string) {
  const wrap = document.createElement("section");
  wrap.style.cssText = "padding:12px 14px;border-bottom:1px solid #222";
  const head = document.createElement("div"); head.style.cssText = "margin-bottom:8px;color:#e3e8e3";
  const row = document.createElement("div"); row.style.cssText = "display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap";
  wrap.append(head, row); root.append(wrap);
  const load = files[`./ills/${k}.ts`];
  if (!load) { head.textContent = `${k}: NO FILE src/empty/ills/${k}.ts`; head.style.color = "#ff6b6b"; return; }
  let ill: Illustration | undefined;
  try { const m = await load(); ill = m[k] ?? Object.values(m).find((v) => v && typeof v === "object" && "draw" in v); }
  catch (e) { head.textContent = `${k}: FAILED TO LOAD ${(e as Error).message}`; head.style.color = "#ff6b6b"; return; }
  if (!ill) { head.textContent = `${k}: no Illustration exported`; head.style.color = "#ff6b6b"; return; }
  const it = ill;
  const P = it.period ?? 3;
  const warn = [it.k !== k && `k is "${it.k}", file is ${k}.ts`, /[—–]/.test(it.title + it.body + it.name) && "dash in copy", it.kind === "loop" && !it.period && "loop without a period"].filter(Boolean);
  head.textContent = `${it.k} · ${it.name} · ${it.kind}${it.kind === "loop" ? ` ${P}s` : ""} · “${it.title}” · ${it.body}${warn.length ? `  ⚠ ${warn.join("; ")}` : ""}`;
  if (warn.length) head.style.color = "#ffb86b";
  const frames: [string, number, number][] = it.kind === "loop"
    ? [["t 0", 0, 0], [`t ${(P / 3).toFixed(1)}`, P / 3, 0], [`t ${((2 * P) / 3).toFixed(1)}`, (2 * P) / 3, 0]]
    : [["rest", 0, 0], ["hover half", 0.6, 0.5], ["hover full", 1.7, 1]];
  const draw = (style: DotStyle, t: number, h: number, size: number, stage = false) => (c: CanvasRenderingContext2D) => {
    const w = windowOf(it, style, stage);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = style === "line" ? "#0e0f11" : "#0b0b0b"; c.fillRect(0, 0, w.w * size, w.h * size);
    paintFrame(c, it, t, h, THEMES[0], size, style, 1, "dark", stage);
    return { w: w.w * size, h: w.h * size };
  };
  for (const [n, t, h] of frames) cell(row, `stipple, ${n}`, draw("stipple", t, h, px));
  const [, lt, lh] = frames[2];
  cell(row, "halftone", draw("halftone", lt, lh, px));
  cell(row, "line, staged", draw("line", lt, lh, px, true));
  cell(row, "card size", draw("stipple", lt, lh, px * 0.5));
}

/** ?grid=1: a contact sheet, one small stipple tile per piece (its last moment), to scan many at once */
async function tile(k: string, T = 150) {
  const box = document.createElement("div");
  box.style.cssText = `width:${T}px;height:${T}px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:6px 4px;border-radius:10px;background:#141414;box-sizing:border-box`;
  const cap = document.createElement("span"); cap.textContent = k;
  root.append(box);
  try {
    const m = await files[`./ills/${k}.ts`]();
    const it = m[k];
    const P = it.period ?? 3, t = it.kind === "loop" ? P / 3 : 1.7, h = it.kind === "loop" ? 0 : 1;
    const w = windowOf(it, "stipple", false);
    const size = Math.min((T - 26) / w.w, (T - 32) / w.h);
    const cv = document.createElement("canvas"); cv.width = Math.ceil(w.w * size); cv.height = Math.ceil(w.h * size);
    paintFrame(cv.getContext("2d")!, it, t, h, THEMES[0], size, "stipple", 1, "dark", false);
    box.append(cv);
  } catch (e) { cap.textContent = `${k} ERROR ${(e as Error).message}`; cap.style.color = "#ff6b6b"; }
  box.append(cap);
}

(async () => {
  const keys = location.hash.slice(1).split(",").map((s) => s.trim()).filter(Boolean);
  if (new URLSearchParams(location.search).has("grid")) {
    root.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;padding:8px";
    for (const k of keys) await tile(k, Number(new URLSearchParams(location.search).get("grid")) || 150);
    document.title = "ready";
    return;
  }
  if (!keys.length) root.textContent = "Add keys after the hash: dots.html#bank,broken";
  for (const k of keys) await show(k);
  document.title = "ready";
})();
