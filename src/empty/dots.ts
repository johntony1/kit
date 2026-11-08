// dots.ts
// Dot matrix illustrations. A scene is drawn in isometric 3D with a small pen (boxes, faces,
// cylinders, lines), rasterised offscreen, and every cell of the grid becomes one dot whose size
// and brightness follow how much of the scene covers it. Unlit dots stay faintly visible, so the
// matrix always reads. No dependencies.
//
//   const art = renderGrid(ill, t, hover);       // brightness per dot, 0..1
//   drawDots(canvas, art, ill, THEMES.white, 6); // paint it
//
// Free to use in anything.

export type V3 = [number, number, number];

export interface Illustration {
  k: string;
  name: string;
  /** a line for the empty state that uses it */
  title: string;
  body: string;
  /** loop: always moving. hover: rests, and plays while the pointer is over it */
  kind: "loop" | "hover";
  /** seconds per loop (loop kind), used for the GIF too */
  period?: number;
  /** grid size in dots */
  cols: number;
  rows: number;
  /** dots per world unit (scenes are drawn in units; default 1) */
  zoom?: number;
  /** draw the scene. t: seconds. h: hover 0..1 (eased). Draw back to front. */
  draw: (p: Pen, t: number, h: number) => void;
}

/* ── shades: faces are dim, edges are bright, so objects read like line art in dots ── */
export const SH = { top: 0.2, left: 0.12, right: 0.065, edge: 1, soft: 0.55, glow: 1 };

type M = number[]; // 3x4 affine, row major
const I: M = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
const mul = (a: M, b: M): M => {
  const r = new Array(12);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) r[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j] + (j === 3 ? a[i * 4 + 3] : 0);
  }
  return r;
};

export interface BoxStyle { top?: number; left?: number; right?: number; edge?: number; lw?: number; open?: boolean }

/** the isometric pen. x runs down-right, y runs down-left, z is up. 1 unit = 1 dot */
export class Pen {
  private m: M = I;
  private stack: M[] = [];
  constructor(private c: CanvasRenderingContext2D, private ox: number, private oy: number) {}

  push() { this.stack.push(this.m); }
  pop() { this.m = this.stack.pop() ?? I; }
  translate(x: number, y: number, z: number) { this.m = mul(this.m, [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z]); }
  /** rotate around an axis through `at` (radians) */
  rotate(axis: "x" | "y" | "z", a: number, at: V3 = [0, 0, 0]) {
    const c = Math.cos(a), s = Math.sin(a);
    const R: M = axis === "x" ? [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0] : axis === "y" ? [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0] : [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0];
    this.translate(at[0], at[1], at[2]);
    this.m = mul(this.m, R);
    this.translate(-at[0], -at[1], -at[2]);
  }
  scale(k: number, at: V3 = [0, 0, 0]) {
    this.translate(at[0], at[1], at[2]);
    this.m = mul(this.m, [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0]);
    this.translate(-at[0], -at[1], -at[2]);
  }

  /** world point to screen (in dots) */
  pt([x, y, z]: V3): [number, number] {
    const m = this.m;
    const X = m[0] * x + m[1] * y + m[2] * z + m[3];
    const Y = m[4] * x + m[5] * y + m[6] * z + m[7];
    const Z = m[8] * x + m[9] * y + m[10] * z + m[11];
    return [this.ox + (X - Y) * 0.866, this.oy + (X + Y) * 0.5 - Z];
  }

  private path(pts: V3[], close = true) {
    const c = this.c;
    c.beginPath();
    pts.forEach((p, i) => { const [sx, sy] = this.pt(p); if (i) c.lineTo(sx, sy); else c.moveTo(sx, sy); });
    if (close) c.closePath();
  }
  private g(v: number) { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; }

  /** a flat polygon in 3D, filled with `fill` and outlined with `edge` */
  face(pts: V3[], fill: number, edge = SH.edge, lw = 0.55) {
    this.path(pts);
    if (fill > 0) { this.c.fillStyle = this.g(fill); this.c.fill(); }
    if (edge > 0) { this.c.strokeStyle = this.g(edge); this.c.lineWidth = lw; this.c.lineJoin = "round"; this.c.stroke(); }
  }
  /** a hole or a cut-out: paints black */
  clear(pts: V3[]) { this.path(pts); this.c.fillStyle = "#000"; this.c.fill(); }
  /** a line between points */
  line(pts: V3[], shade = SH.edge, lw = 0.55) {
    this.path(pts, false);
    this.c.strokeStyle = this.g(shade); this.c.lineWidth = lw; this.c.lineCap = "round"; this.c.lineJoin = "round"; this.c.stroke();
  }
  /** a solid dot in 3D */
  dot(p: V3, r: number, shade = SH.glow) {
    const [sx, sy] = this.pt(p);
    this.c.beginPath(); this.c.arc(sx, sy, r, 0, Math.PI * 2); this.c.fillStyle = this.g(shade); this.c.fill();
  }
  /** an axis-aligned box from (x,y,z) with size (w,d,h); only the three visible faces are drawn */
  box(x: number, y: number, z: number, w: number, d: number, h: number, s: BoxStyle = {}) {
    const e = s.edge ?? SH.edge, lw = s.lw ?? 0.55;
    const X = x + w, Y = y + d, Z = z + h;
    if (s.open) {
      // an open top: the inside walls show, darker
      this.face([[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], 0.04, e, lw);
      this.face([[x, y, z + h * 0.15], [X, y, z + h * 0.15], [X, y, Z], [x, y, Z]], (s.left ?? SH.left) * 0.8, e, lw);
      this.face([[x, y, z + h * 0.15], [x, Y, z + h * 0.15], [x, Y, Z], [x, y, Z]], (s.right ?? SH.right) * 1.4, e, lw);
    } else {
      this.face([[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], s.top ?? SH.top, e, lw);
    }
    this.face([[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]], s.left ?? SH.left, e, lw);
    this.face([[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], s.right ?? SH.right, e, lw);
  }
  /** a vertical cylinder (axis along z) centred on (cx,cy) */
  cylinder(cx: number, cy: number, z: number, r: number, h: number, s: { side?: number; top?: number; edge?: number; lw?: number } = {}) {
    const N = 40, e = s.edge ?? SH.edge, lw = s.lw ?? 0.55;
    const ring = (zz: number) => Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, zz] as V3; });
    const lo = ring(z), hi = ring(z + h);
    // the visible half of the side: the half facing +x+y
    const side: V3[] = [];
    for (let i = 0; i <= N / 2; i++) side.push(lo[(i + N - N / 8) % N]);
    for (let i = N / 2; i >= 0; i--) side.push(hi[(i + N - N / 8) % N]);
    this.face(side, s.side ?? SH.left, e, lw);
    this.face(hi, s.top ?? SH.top, e, lw);
  }
  /** a flat ellipse (a disc lying on the floor at height z) */
  disc(cx: number, cy: number, z: number, r: number, fill: number, edge = 0) {
    const N = 40;
    this.face(Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; }), fill, edge);
  }
  /** a circle standing in a vertical plane: "x" faces +x (the right wall), "y" faces +y (the left wall) */
  ringV(plane: "x" | "y", c: V3, r: number, fill: number, edge = SH.edge, lw = 0.55) {
    const N = 36;
    this.face(Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2, u = Math.cos(a) * r, v = Math.sin(a) * r;
      return (plane === "x" ? [c[0], c[1] + u, c[2] + v] : [c[0] + u, c[1], c[2] + v]) as V3;
    }), fill, edge, lw);
  }
  /** a shadow on the floor: a soft dim ellipse */
  shadow(cx: number, cy: number, rx: number, ry: number, k = 0.12) {
    const [sx, sy] = this.pt([cx, cy, 0]);
    const c = this.c;
    c.save(); c.translate(sx, sy); c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, this.g(k)); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.fill(); c.restore();
  }
  /** raw 2D access in screen dots, for sparkles and text-free marks */
  screen(fn: (c: CanvasRenderingContext2D) => void) { this.c.save(); fn(this.c); this.c.restore(); }
}

/* ── raster: draw the scene supersampled, then average each dot's cell ── */
const SS = 4;
let scratch: HTMLCanvasElement | OffscreenCanvas | null = null;

export function renderGrid(ill: Illustration, t: number, h: number): Float32Array {
  const W = ill.cols * SS, H = ill.rows * SS;
  if (!scratch) scratch = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : document.createElement("canvas");
  if (scratch.width !== W) scratch.width = W;
  if (scratch.height !== H) scratch.height = H;
  const c = scratch.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
  c.setTransform(SS, 0, 0, SS, 0, 0);
  const z = ill.zoom ?? 1;
  c.setTransform(SS * z, 0, 0, SS * z, 0, 0);
  ill.draw(new Pen(c, ill.cols / 2 / z, ill.rows / 2 / z), t, h);
  const px = c.getImageData(0, 0, W, H).data;
  const out = new Float32Array(ill.cols * ill.rows);
  for (let r = 0; r < ill.rows; r++) {
    for (let q = 0; q < ill.cols; q++) {
      let sum = 0;
      for (let y = 0; y < SS; y++) { const row = ((r * SS + y) * W + q * SS) * 4; for (let x = 0; x < SS; x++) sum += px[row + x * 4]; }
      out[r * ill.cols + q] = sum / (SS * SS * 255);
    }
  }
  return out;
}

/** the scene in grey at display resolution, for the smooth layer. px: pixels per dot */
let hiCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
export function renderHi(ill: Illustration, t: number, h: number, px: number, win: { q0: number; r0: number; w: number; h: number }) {
  const W = Math.max(1, Math.round(win.w * px)), H = Math.max(1, Math.round(win.h * px));
  if (!hiCanvas) hiCanvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : document.createElement("canvas");
  if (hiCanvas.width !== W) hiCanvas.width = W;
  if (hiCanvas.height !== H) hiCanvas.height = H;
  const c = hiCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
  const z = ill.zoom ?? 1;
  c.setTransform(px * z, 0, 0, px * z, -win.q0 * px, -win.r0 * px);
  ill.draw(new Pen(c, ill.cols / 2 / z, ill.rows / 2 / z), t, h);
  return c.getImageData(0, 0, W, H);
}

/** grey to theme colour, alpha from brightness. cap: the brightest the smooth layer gets */
export function colorize(img: ImageData, theme: Theme, cap = 1, gain = 1) {
  const A = hex(theme.a), B = hex(theme.b ?? theme.a);
  const d = img.data, W = img.width, H = img.height;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      // fade out near the window's edges so soft shadows never end in a straight line
      const ex = Math.min(x, W - 1 - x) / (W * 0.08), ey = Math.min(y, H - 1 - y) / (H * 0.08);
      const edge = Math.min(1, ex, ey);
      const v = Math.min(cap, (d[i] / 255) * gain) * (edge < 1 ? edge * edge * (3 - 2 * edge) : 1);
      const k = (x / W) * 0.6 + (y / H) * 0.4;
      d[i] = A[0] + (B[0] - A[0]) * k; d[i + 1] = A[1] + (B[1] - A[1]) * k; d[i + 2] = A[2] + (B[2] - A[2]) * k;
      d[i + 3] = v * 255;
    }
  }
  return img;
}

export type DotStyle = "dots" | "solid";
/** the dots style: bodies are a smooth soft tint, only edges and accents (bright parts) become dots */
export const EDGE_MIN = 0.36;
export const BODY_CAP = 0.3;

/** paint one frame in a style onto ctx (already scaled so 1 unit = 1 css px). px: css px per dot */
export function paintFrame(ctx: CanvasRenderingContext2D, ill: Illustration, t: number, h: number, theme: Theme, px: number, style: DotStyle, dpr = 1) {
  const win = bounds(ill);
  const smoothPx = px * (style === "solid" ? dpr : Math.min(dpr, 1.25));
  const img = colorize(renderHi(ill, t, h, smoothPx, win), theme, style === "solid" ? 1 : BODY_CAP, style === "solid" ? 1.15 : 1);
  if (!layer) layer = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(img.width, img.height) : document.createElement("canvas");
  layer.width = img.width; layer.height = img.height;
  (layer.getContext("2d") as CanvasRenderingContext2D).putImageData(img, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(layer as CanvasImageSource, 0, 0, win.w * px, win.h * px);
  ctx.restore();
  if (style === "dots") paintDots(ctx, renderGrid(ill, t, h), ill.cols, ill.rows, theme, px, false, win, EDGE_MIN);
}
let layer: HTMLCanvasElement | OffscreenCanvas | null = null;

/** the part of the grid the piece ever lights (sampled over its motion), plus a margin of dots */
const boundsCache = new Map<string, { q0: number; r0: number; w: number; h: number }>();
export function bounds(ill: Illustration, margin = 3) {
  const hit = boundsCache.get(ill.k);
  if (hit) return hit;
  let q0 = ill.cols, r0 = ill.rows, q1 = -1, r1 = -1;
  const per = ill.period ?? 3;
  for (let i = 0; i < 8; i++) {
    for (const h of ill.kind === "hover" ? [0, 0.5, 1] : [0]) {
      const g = renderGrid(ill, (i / 8) * per, h);
      for (let r = 0; r < ill.rows; r++) for (let q = 0; q < ill.cols; q++) {
        if (g[r * ill.cols + q] < 0.035) continue;
        if (q < q0) q0 = q; if (q > q1) q1 = q; if (r < r0) r0 = r; if (r > r1) r1 = r;
      }
    }
  }
  if (q1 < 0) return { q0: 0, r0: 0, w: ill.cols, h: ill.rows };
  q0 = Math.max(0, q0 - margin); r0 = Math.max(0, r0 - margin);
  const b = { q0, r0, w: Math.min(ill.cols, q1 + margin + 1) - q0, h: Math.min(ill.rows, r1 + margin + 1) - r0 };
  boundsCache.set(ill.k, b);
  return b;
}

/* ── themes: a dot colour (or a gradient across the art) ── */
export interface Theme { name: string; a: string; b?: string; bg: string }
export const THEMES: Theme[] = [
  { name: "White", a: "#f2f4f2", bg: "#0b0b0b" },
  { name: "Green", a: "#3ddc84", bg: "#0b0b0b" },
  { name: "Amber", a: "#ffcf6e", b: "#ff7a45", bg: "#0b0b0b" },
  { name: "Blue", a: "#2f8bff", bg: "#0b0b0b" },
  { name: "Aqua", a: "#5ef2c8", b: "#3aa8ff", bg: "#0b0b0b" },
  { name: "Dusk", a: "#7b6cff", b: "#ff5fa2", bg: "#0b0b0b" },
];
const hex = (s: string) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

/** brightness to dot level, quantised into steps so it reads as a matrix, not a blur.
 * The curve pushes faces down and edges up: faces become small faint dots, edges big bright ones */
const LEVELS = 8;
export function dotOf(b: number) {
  if (b < 0.03) return 0;
  const v = Math.pow(Math.min(1, b / 0.55), 1.5);
  return Math.max(1, Math.round(v * LEVELS)) / LEVELS;
}
/** a lit dot's radius (in pitches) and opacity for its level */
export const litDot = (v: number) => ({ r: 0.13 + 0.33 * v, a: 0.16 + 0.84 * v });
/** unlit dots: faint, and fading out toward the edges of the art so no box shows */
export const baseAlpha = (u: number, w: number) => {
  const d = Math.hypot(u, w); // u, w in -1..1 across the window
  const k = Math.max(0, 1 - Math.pow(d / 1.05, 2.2));
  return 0.055 * k;
};

/** paint the grid as dots. pitch: px per dot. Returns nothing; draws onto `ctx` at (0,0) */
export function paintDots(ctx: CanvasRenderingContext2D, grid: Float32Array, cols: number, rows: number, theme: Theme, pitch: number, base = true, win?: { q0: number; r0: number; w: number; h: number }, minB = 0) {
  const A = hex(theme.a), B = hex(theme.b ?? theme.a);
  const W = win ?? { q0: 0, r0: 0, w: cols, h: rows };
  for (let r = W.r0; r < W.r0 + W.h; r++) {
    for (let q = W.q0; q < W.q0 + W.w; q++) {
      const b0 = grid[r * cols + q];
      const v = minB ? (b0 < minB ? 0 : dotOf(0.25 + ((b0 - minB) / (1 - minB)) * 0.75)) : dotOf(b0);
      const cx = (q - W.q0 + 0.5) * pitch, cy = (r - W.r0 + 0.5) * pitch;
      if (v === 0) {
        if (!base) continue;
        const a = baseAlpha(((q - W.q0 + 0.5) / W.w) * 2 - 1, ((r - W.r0 + 0.5) / W.h) * 2 - 1);
        if (a < 0.004) continue;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(cx, cy, pitch * 0.14, 0, Math.PI * 2); ctx.fill();
        continue;
      }
      const k = ((q - W.q0) / W.w) * 0.6 + ((r - W.r0) / W.h) * 0.4;
      const col = A.map((x, i) => Math.round(x + (B[i] - x) * k));
      const d = litDot(v);
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${d.a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(cx, cy, pitch * d.r, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/* ── exports ── */

/** the current frame as an SVG: the dots as circles over the smooth body (or the solid render) */
export function toSVG(ill: Illustration, t: number, h: number, theme: Theme, pitch = 8, style: DotStyle = "dots") {
  const bx = bounds(ill);
  const W = bx.w * pitch, H = bx.h * pitch;
  const img = colorize(renderHi(ill, t, h, pitch * 2, bx), theme, style === "solid" ? 1 : BODY_CAP, style === "solid" ? 1.15 : 1);
  const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
  cv.getContext("2d")!.putImageData(img, 0, 0);
  const parts: string[] = [`<image href="${cv.toDataURL("image/png")}" x="0" y="0" width="${W}" height="${H}"/>`];
  if (style === "dots") {
    const g = renderGrid(ill, t, h);
    const A = hex(theme.a), B = hex(theme.b ?? theme.a);
    for (let r = bx.r0; r < bx.r0 + bx.h; r++) {
      for (let q = bx.q0; q < bx.q0 + bx.w; q++) {
        const b0 = g[r * ill.cols + q];
        if (b0 < EDGE_MIN) continue;
        const v = dotOf(0.25 + ((b0 - EDGE_MIN) / (1 - EDGE_MIN)) * 0.75);
        const k = ((q - bx.q0) / bx.w) * 0.6 + ((r - bx.r0) / bx.h) * 0.4;
        const col = A.map((x, i) => Math.round(x + (B[i] - x) * k).toString(16).padStart(2, "0")).join("");
        const d = litDot(v);
        parts.push(`<circle cx="${((q - bx.q0 + 0.5) * pitch).toFixed(1)}" cy="${((r - bx.r0 + 0.5) * pitch).toFixed(1)}" r="${(pitch * d.r).toFixed(2)}" fill="#${col}" fill-opacity="${d.a.toFixed(2)}"/>`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="${theme.bg}"/>${parts.join("")}</svg>`;
}

/** the hover curve used for GIFs of hover pieces: rest, play in, hold, play out */
export function hoverAt(u: number) {
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  if (u < 0.1) return 0;
  if (u < 0.4) return ease((u - 0.1) / 0.3);
  if (u < 0.7) return 1;
  return 1 - ease((u - 0.7) / 0.3);
}

/** the loop (or the hover played in and out) as an animated GIF */
export async function toGIF(ill: Illustration, theme: Theme, pitch = 6, fps = 24, style: DotStyle = "dots"): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const dur = ill.kind === "loop" ? ill.period ?? 3 : 3.2;
  const n = Math.round(dur * fps);
  const bx = bounds(ill);
  const W = bx.w * pitch, H = bx.h * pitch;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d", { willReadFrequently: true })!;
  const gif = GIFEncoder();
  let palette: number[][] | null = null;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    c.fillStyle = theme.bg; c.fillRect(0, 0, W, H);
    paintFrame(c, ill, u * dur, ill.kind === "loop" ? 0 : hoverAt(u), theme, pitch, style, 1);
    const data = c.getImageData(0, 0, W, H).data;
    palette ??= quantize(data, 64);
    gif.writeFrame(applyPalette(data, palette), W, H, { palette, delay: Math.round(1000 / fps) });
    if (i % 8 === 7) await new Promise((r) => setTimeout(r, 0));
  }
  gif.finish();
  return new Blob([gif.bytes() as Uint8Array<ArrayBuffer>], { type: "image/gif" });
}

export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** 0..1..0 over a period, resting at both ends: good for loops that open and close */
export const pulse = (t: number, period: number, rest = 0.35) => {
  const u = (t % period) / period;
  const half = (1 - rest) / 2;
  if (u < half) return easeInOut(u / half);
  if (u < half + rest / 2) return 1;
  if (u < 1 - rest / 2) return 1 - easeInOut((u - half - rest / 2) / half);
  return 0;
};
