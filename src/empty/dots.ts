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
  /** a piece made of real UI rather than a drawn scene: the name of its component in empty/flat.
   *  draw then only gives a small stand in for the dot exports */
  flat?: string;
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
  /** tone: faces are filled with light-shaded tones (no outlines), details become darker lines */
  constructor(private c: CanvasRenderingContext2D, private ox: number, private oy: number, private tone = false, private lineTone = 0.08, private gaps = false) {}
  /** line art (the "line" style): pale faces with hairline outlines, details as grey strokes and
   *  the brightest marks in the accent. u: world units per css pixel, so strokes stay one pixel */
  ink: Ink | null = null;
  private u = 1;
  private plated = false;
  /** the stage: a rounded slab under the piece, on when a caller asks for it (see withStage) */
  private staged = STAGE.on;
  stage: { x0: number; x1: number; y0: number; y1: number } | null = STAGE.geom;
  private measuring = false;
  setInk(ink: Ink, u: number) { this.ink = ink; this.u = u; return this; }
  /** a pass that draws nothing and only records where the floor shadows fall */
  measure() { this.measuring = true; this.staged = false; this.stage = null; return this; }
  private inkFill(f: number) {
    const k = this.ink!;
    return f < 0.05 ? k.hole : f < 0.1 ? k.right : f < 0.16 ? k.left : f < 0.3 ? k.top : k.accentFill;
  }
  private stroke(col: string, px = 1, dash?: number[]) {
    const c = this.c;
    c.strokeStyle = col; c.lineWidth = px * this.u; c.lineJoin = "round"; c.lineCap = "round";
    c.setLineDash(dash ? dash.map((d) => d * this.u) : []);
    c.stroke();
    if (dash) c.setLineDash([]);
  }
  /** a face's line-art fill to a lit tone: top brightest, left wall mid, right wall darkest */
  private toneOf(f: number) { return f < 0.05 ? 0.3 : Math.min(1, 0.45 + f * 2.8); }

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

  /** a polygon's area on screen, in dots squared */
  private area(pts: V3[]) {
    const q = pts.map((p) => this.pt(p));
    let a = 0;
    for (let i = 0; i < q.length; i++) { const [x0, y0] = q[i], [x1, y1] = q[(i + 1) % q.length]; a += x0 * y1 - x1 * y0; }
    return Math.abs(a) / 2;
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
    if (this.ink) {
      if (fill > 0) { this.c.fillStyle = this.inkFill(fill); this.c.fill(); }
      // small borderless pieces are slices of one curved surface (a head, a barrel): seal their seams
      // in their own colour so the surface reads as one, instead of a mesh of outlines
      if (edge <= 0 && fill > 0 && this.area(pts) < 5) { this.stroke(this.inkFill(fill), 1); return; }
      if (fill > 0 || edge > 0) this.stroke(fill >= 0.3 ? this.ink.accent : this.ink.edge, 1);
      return;
    }
    if (this.tone) {
      if (fill > 0) { this.c.fillStyle = this.g(this.toneOf(fill)); this.c.fill(); }
      else if (edge > 0) { this.c.strokeStyle = this.g(this.lineTone); this.c.lineWidth = lw; this.c.lineJoin = "round"; this.c.stroke(); }
      return;
    }
    if (fill > 0) { this.c.fillStyle = this.g(fill); this.c.fill(); }
    if (edge > 0) { this.c.strokeStyle = this.g(edge); this.c.lineWidth = lw; this.c.lineJoin = "round"; this.c.stroke(); }
  }
  /** a hole or a cut-out: paints black */
  clear(pts: V3[]) {
    this.path(pts);
    if (this.ink) { this.c.fillStyle = this.ink.hole; this.c.fill(); this.stroke(this.ink.edge, 1); return; }
    this.c.fillStyle = "#000"; this.c.fill();
  }
  /** a dashed guide line: a construction mark in the line style, left out of the dot styles */
  guide(pts: V3[], accent = false) {
    if (!this.ink) return;
    this.path(pts, false);
    this.stroke(accent ? this.ink.accent : this.ink.detail, 1, [3, 3]);
  }
  /** a line between points */
  line(pts: V3[], shade = SH.edge, lw = 0.55) {
    this.path(pts, false);
    if (this.ink) { this.stroke(this.ink.detail, lw > 0.8 ? 1.5 : 1); return; }
    this.c.strokeStyle = this.g(this.tone ? (shade > 0.9 || this.gaps ? this.lineTone : Math.min(1, 0.45 + shade)) : shade); this.c.lineWidth = lw; this.c.lineCap = "round"; this.c.lineJoin = "round"; this.c.stroke();
  }
  /** a solid dot in 3D */
  dot(p: V3, r: number, shade = SH.glow) {
    const [sx, sy] = this.pt(p);
    this.c.beginPath(); this.c.arc(sx, sy, r, 0, Math.PI * 2);
    if (this.ink) { this.c.fillStyle = shade >= 0.9 ? this.ink.accent : this.ink.detail; this.c.fill(); return; }
    this.c.fillStyle = this.g(shade); this.c.fill();
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
    if (this.measuring) {
      // a shadow's footprint in world units, at the floor this shadow sits on
      const [wx, wy] = [this.m[0] * cx + this.m[1] * cy + this.m[3], this.m[4] * cx + this.m[5] * cy + this.m[7]], r = rx * 0.5;
      const s = this.stage ?? (this.stage = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity });
      s.x0 = Math.min(s.x0, wx - r); s.x1 = Math.max(s.x1, wx + r); s.y0 = Math.min(s.y0, wy - r); s.y1 = Math.max(s.y1, wy + r);
      return;
    }
    if (this.staged) {
      // one slab under every shadow, drawn in place of the first
      if (this.plated) return;
      this.plated = true;
      const st = this.stage, fz = this.m[11];
      if (st) { this.push(); this.m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, fz]; this.plate((st.x0 + st.x1) / 2, (st.y0 + st.y1) / 2, (st.x1 - st.x0) / 2, (st.y1 - st.y0) / 2); this.pop(); }
      else this.plate(cx, cy, rx * 0.5, rx * 0.5);
      return;
    }
    const [sx, sy] = this.pt([cx, cy, 0]);
    const c = this.c;
    c.save(); c.translate(sx, sy); c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, this.ink ? this.ink.shadow : this.g(k)); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.fill(); c.restore();
  }
  /** the line style's stage: a rounded slab the piece stands on, with a thinner ghost layer under it
   *  and a soft shadow. Drawn in place of the first floor shadow */
  plate(cx: number, cy: number, sx: number, sy: number) {
    const c = this.c, T = 2.6, s = Math.max(sx, sy), rr = Math.min(sx, sy) * 0.26;
    // the same slab in every style: inked in the line style, shaded faces and cut edges in the dot styles
    const tone = (f: number) => this.g(this.tone ? this.toneOf(f) : f);
    const k = this.ink ?? { top: tone(SH.top), left: tone(SH.left), right: tone(SH.right), edge: this.g(this.tone ? this.lineTone : SH.edge), ghost: this.g(this.tone ? this.lineTone : SH.edge), shadow: this.g(0.1) };
    const rounded = (z: number, grow = 0): V3[] => {
      const X = sx + grow, Y = sy + grow, R = rr + grow, out: V3[] = [];
      const corners: [number, number, number][] = [[X - R, Y - R, 0], [-(X - R), Y - R, 0.5], [-(X - R), -(Y - R), 1], [X - R, -(Y - R), 1.5]];
      for (const [x, y, q] of corners) for (let i = 0; i <= 6; i++) { const a = (q + i / 12) * Math.PI; out.push([cx + x + Math.cos(a) * R, cy + y + Math.sin(a) * R, z]); }
      return out;
    };
    const slab = (z0: number, h: number, grow: number, side: string, top: string, edge: string) => {
      for (let d = h; d >= 0; d -= 0.5) { this.path(rounded(z0 + h - d, grow)); c.fillStyle = side; c.fill(); }
      this.path(rounded(z0, grow)); this.stroke(edge, this.ink ? 1 : 0.55 / this.u);
      // the two silhouette verticals: the slab's left and right extremes
      const lo = rounded(z0, grow).map((p) => this.pt(p)), xs = lo.map((p) => p[0]);
      const il = xs.indexOf(Math.min(...xs)), ir = xs.indexOf(Math.max(...xs));
      for (const i of [il, ir]) { const b = lo[i]; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0], b[1] - h); this.stroke(edge, this.ink ? 1 : 0.55 / this.u); }
      this.path(rounded(z0 + h, grow)); c.fillStyle = top; c.fill(); this.stroke(edge, this.ink ? 1 : 0.55 / this.u);
    };
    // the shadow under it all
    const [hx, hy] = this.pt([cx, cy, -T - 2.2]);
    c.save(); c.translate(hx, hy); c.scale(1, 0.5);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 1.5);
    g.addColorStop(0, k.shadow); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, s * 1.5, 0, Math.PI * 2); c.fill(); c.restore();
    slab(-T - 1.6, 1.2, -0.4, k.right, k.left, k.ghost);
    slab(-T, T, 0, k.right, k.top, k.edge);
  }
  /** raw 2D access in screen dots, for sparkles and text-free marks. In the line style bright marks
   *  turn accent and dim ones grey, so the same drawing works on a pale stage */
  screen(fn: (c: CanvasRenderingContext2D) => void) {
    this.c.save();
    if (this.ink) {
      const k = this.ink, c = this.c, u = this.u;
      const map = (v: unknown) => {
        if (typeof v !== "string") return v;
        const m = v.match(/rgba?\((\d+)/), x = v.match(/^#([0-9a-f]{2})/i);
        const n = m ? +m[1] : x ? parseInt(x[1], 16) : -1;
        return n < 0 ? v : n > 150 ? k.accent : k.detail;
      };
      const proxy = new Proxy(c, {
        get: (o, p) => { const v = Reflect.get(o, p, o); return typeof v === "function" ? v.bind(o) : v; },
        set: (o, p, v) => Reflect.set(o, p, p === "strokeStyle" || p === "fillStyle" ? map(v) : p === "lineWidth" ? Math.min(1.5 * u, Math.max(u, (v as number) * 0.6)) : v, o),
      });
      fn(proxy);
    } else fn(this.c);
    this.c.restore();
  }
}

/* ── raster: draw the scene supersampled, then average each dot's cell ── */
const SS = 4;
let scratch: HTMLCanvasElement | OffscreenCanvas | null = null;

/** pad: extra dots on every side, so a piece that reaches past its own grid is still measured */
export function renderGrid(ill: Illustration, t: number, h: number, pad = 0): Float32Array {
  const C = ill.cols + pad * 2, Rw = ill.rows + pad * 2;
  const W = C * SS, H = Rw * SS;
  if (!scratch) scratch = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : document.createElement("canvas");
  if (scratch.width !== W) scratch.width = W;
  if (scratch.height !== H) scratch.height = H;
  const c = scratch.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
  c.setTransform(SS, 0, 0, SS, 0, 0);
  const z = ill.zoom ?? 1;
  c.setTransform(SS * z, 0, 0, SS * z, pad * SS, pad * SS);
  ill.draw(new Pen(c, ill.cols / 2 / z, ill.rows / 2 / z), t, h);
  const px = c.getImageData(0, 0, W, H).data;
  const out = new Float32Array(C * Rw);
  for (let r = 0; r < Rw; r++) {
    for (let q = 0; q < C; q++) {
      let sum = 0;
      for (let y = 0; y < SS; y++) { const row = ((r * SS + y) * W + q * SS) * 4; for (let x = 0; x < SS; x++) sum += px[row + x * 4]; }
      out[r * C + q] = sum / (SS * SS * 255);
    }
  }
  return out;
}

/** the scene in grey at display resolution, for the smooth layer. px: pixels per dot */
let hiCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
/** gaps: every detail line is cut out of the face (stipple reads details as gaps, not as brighter dots) */
export function renderHi(ill: Illustration, t: number, h: number, px: number, win: { q0: number; r0: number; w: number; h: number }, tone = false, lineTone = 0.08, gaps = false) {
  const W = Math.max(1, Math.round(win.w * px)), H = Math.max(1, Math.round(win.h * px));
  if (!hiCanvas) hiCanvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : document.createElement("canvas");
  if (hiCanvas.width !== W) hiCanvas.width = W;
  if (hiCanvas.height !== H) hiCanvas.height = H;
  const c = hiCanvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
  const z = ill.zoom ?? 1;
  c.setTransform(px * z, 0, 0, px * z, -win.q0 * px, -win.r0 * px);
  ill.draw(new Pen(c, ill.cols / 2 / z, ill.rows / 2 / z, tone, lineTone, gaps), t, h);
  return c.getImageData(0, 0, W, H);
}

/* ── line: the scene as clean line art on a pale (or dark) stage ── */
export interface Ink { top: string; left: string; right: string; hole: string; edge: string; ghost: string; detail: string; accent: string; accentFill: string; shadow: string }
export type Mode = "dark" | "light";
const mixHex = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * k)).join(",")})`; };
export function inkOf(theme: Theme, mode: Mode): Ink {
  // white has no hue of its own: the line style then takes a calm blue as its accent
  const acc = theme.name === "White" ? (mode === "light" ? "#4a6cf7" : "#7d95ff") : theme.a;
  return mode === "light"
    ? { top: "#ffffff", left: "#f6f7f9", right: "#eceef2", hole: "#f1f3f6", edge: "#a9b0ba", ghost: "#d0d4da", detail: "#bcc2ca", accent: acc, accentFill: mixHex("#ffffff", acc, 0.14), shadow: "rgba(30,40,60,.10)" }
    : { top: "#232528", left: "#1d1f22", right: "#17181b", hole: "#141517", edge: "#4a4e56", ghost: "#33363c", detail: "#41454c", accent: acc, accentFill: mixHex("#232528", acc, 0.2), shadow: "rgba(0,0,0,.45)" };
}
/** whether pens made now draw the stage, and where it goes. Set around a render with withStage */
const STAGE: { on: boolean; geom: Pen["stage"] } = { on: false, geom: null };
export function withStage<T>(ill: Illustration, on: boolean, fn: () => T): T {
  const was = { ...STAGE };
  STAGE.geom = on ? stageOf(ill) : null; STAGE.on = on;
  try { return fn(); } finally { STAGE.on = was.on; STAGE.geom = was.geom; }
}
/** the window a piece needs in a style, stage or not */
export const windowOf = (ill: Illustration, style: DotStyle, stage = false) => withStage(ill, stage, () => (style === "line" ? lineBounds(ill) : bounds(ill)));
/** the stage under a piece: one slab under every floor shadow it casts. Measured once at rest, so
 *  the slab never moves while the piece does */
const stageCache = new Map<string, Pen["stage"]>();
let measureCv: OffscreenCanvas | HTMLCanvasElement | null = null;
function stageOf(ill: Illustration): Pen["stage"] {
  if (stageCache.has(ill.k)) return stageCache.get(ill.k)!;
  measureCv ??= typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(4, 4) : document.createElement("canvas");
  const p = new Pen(measureCv.getContext("2d") as CanvasRenderingContext2D, 0, 0).measure();
  ill.draw(p, 0, 0);
  stageCache.set(ill.k, p.stage);
  return p.stage;
}
/** the piece's window in the line style, measured from the line drawing itself (stage included)
 *  over the whole motion, in grid dots */
const lineCache = new Map<string, { q0: number; r0: number; w: number; h: number }>();
export function lineBounds(ill: Illustration, margin = 3) {
  const key = `${ill.k}|${+STAGE.on}`, hit = lineCache.get(key);
  if (hit) return hit;
  const K = 2, W = ill.cols * K * 2, H = ill.rows * K * 2, ox = ill.cols * K / 2, oy = ill.rows * K / 2;
  const cv = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(W, H) : Object.assign(document.createElement("canvas"), { width: W, height: H });
  const c = cv.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  const z = ill.zoom ?? 1, ink = inkOf(THEMES[0], "light");
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  const per = ill.period ?? 3;
  for (let i = 0; i < 8; i++) for (const h of ill.kind === "hover" ? [0, 0.5, 1] : [0]) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    c.setTransform(K * z, 0, 0, K * z, ox, oy);
    ill.draw(new Pen(c, ill.cols / 2 / z, ill.rows / 2 / z).setInk(ink, 1 / (K * z)), (i / 8) * per, h);
    const d = c.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (d[(y * W + x) * 4 + 3] < 3) continue; // faint too: the stage's shadow must never end in a straight edge
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const b = x1 < 0 ? bounds(ill) : { q0: Math.floor((x0 - ox) / K) - margin, r0: Math.floor((y0 - oy) / K) - margin, w: Math.ceil((x1 - x0) / K) + margin * 2 + 1, h: Math.ceil((y1 - y0) / K) + margin * 2 + 1 };
  lineCache.set(key, b);
  return b;
}
/** draw one frame of the line style onto ctx (already scaled so 1 unit = 1 css px) */
export function paintLine(ctx: CanvasRenderingContext2D, ill: Illustration, t: number, h: number, theme: Theme, px: number, mode: Mode) {
  const win = lineBounds(ill), z = ill.zoom ?? 1;
  ctx.save();
  ctx.transform(px * z, 0, 0, px * z, -win.q0 * px, -win.r0 * px);
  const ink = inkOf(theme, mode);
  ill.draw(new Pen(ctx, ill.cols / 2 / z, ill.rows / 2 / z).setInk(ink, 1 / (px * z)), t, h);
  ctx.restore();
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

export type DotStyle = "stipple" | "halftone" | "line";

/** halftone cell size, in grid dots: bigger cells, fewer and bolder dots */
export const CELL = 2;

/** the scene as halftone tones: one value per cell over the piece's window */
export function toneGrid(ill: Illustration, t: number, h: number, cell = CELL) {
  const win = bounds(ill);
  const img = renderHi(ill, t, h, SS / cell, win, true, 0.04);
  const gw = Math.floor(img.width / SS), gh = Math.floor(img.height / SS);
  const out = new Float32Array(gw * gh), d = img.data;
  for (let r = 0; r < gh; r++) for (let q = 0; q < gw; q++) {
    let s = 0;
    for (let y = 0; y < SS; y++) { const row = ((r * SS + y) * img.width + q * SS) * 4; for (let x = 0; x < SS; x++) s += d[row + x * 4]; }
    out[r * gw + q] = s / (SS * SS * 255);
  }
  return { g: out, gw, gh, cellPx: (px: number) => px * cell };
}

/** halftone: each cell is one round dot whose size follows the tone. No outlines; details are gaps */
function eachHalftoneDot(ill: Illustration, t: number, h: number, theme: Theme, px: number, fn: (x: number, y: number, r: number, col: string) => void) {
  const { g, gw, gh, cellPx } = toneGrid(ill, t, h);
  const cp = cellPx(px);
  const A = hex(theme.a), B = hex(theme.b ?? theme.a);
  for (let r = 0; r < gh; r++) for (let q = 0; q < gw; q++) {
    const v = g[r * gw + q];
    if (v < 0.07) continue;
    // a little stepping keeps it a matrix rather than a blur
    const s = Math.max(1, Math.round(Math.min(1, v) * 8)) / 8;
    const k = (r / gh) * 0.75 + (q / gw) * 0.25;
    const col = `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * k)).join(",")})`;
    // lit faces get full dots, walls in shade get smaller ones, so the volume reads from dot size alone
    fn((q + 0.5) * cp, (r + 0.5) * cp, cp * 0.5 * (0.2 + 0.78 * Math.pow(s, 1.8)), col);
  }
}

/** paint one frame in a style onto ctx (already scaled so 1 unit = 1 css px). px: css px per grid dot */
export function paintFrame(ctx: CanvasRenderingContext2D, ill: Illustration, t: number, h: number, theme: Theme, px: number, style: DotStyle, dpr = 1, mode: Mode = "dark", stage = false): void {
  if (stage !== STAGE.on) return withStage(ill, stage, () => paintFrame(ctx, ill, t, h, theme, px, style, dpr, mode, stage));
  if (style === "line") return paintLine(ctx, ill, t, h, theme, px, mode);
  const win = bounds(ill);
  if (style === "stipple") {
    const st = new Stipple(ill, theme, px, dpr, false, stage);
    st.setTone(t, h);
    if (!layer) layer = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(st.W, st.H) : document.createElement("canvas");
    layer.width = st.W; layer.height = st.H;
    st.draw(layer.getContext("2d") as CanvasRenderingContext2D);
    ctx.drawImage(layer as CanvasImageSource, 0, 0, win.w * px, win.h * px);
    return;
  }
  if (style === "halftone") {
    eachHalftoneDot(ill, t, h, theme, px, (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
    return;
  }
}
let layer: HTMLCanvasElement | OffscreenCanvas | null = null;

/* ── stipple: tiny square dots, one bit each. Tone is how many cells are lit, not how big a dot is.
 * Every cell has a fixed threshold from a blue noise map, so sparse tones scatter evenly with no
 * pattern, and the dots never shimmer while the scene moves. Each dot keeps its own tint (a little
 * brighter or dimmer, warmer or cooler), so a flat face reads as many colours up close.
 * The pointer pushes through the dots like a finger through sand: they part around it, drag along
 * with it into streaks, and spring back when it lets go. ── */

const BNS = 64;
let BN: Float32Array | null = null;
/** a 64x64 blue noise threshold map (void and cluster, built once, about 40ms) */
function blueNoise() {
  if (BN) return BN;
  const N = BNS, n = N * N, E = new Float32Array(n), on = new Uint8Array(n), out = new Float32Array(n);
  const R = 5, s2 = 2 * 1.9 * 1.9, K: number[] = [];
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) K.push(Math.exp(-(dx * dx + dy * dy) / s2));
  let seed = 7;
  for (let i = 0; i < n; i++) { seed = (seed * 16807) % 2147483647; E[i] = (seed / 2147483647) * 1e-3; }
  for (let rank = 0; rank < n; rank++) {
    let best = 0, bv = Infinity;
    for (let i = 0; i < n; i++) if (!on[i] && E[i] < bv) { bv = E[i]; best = i; }
    on[best] = 1; out[best] = (rank + 0.5) / n;
    const bx = best % N, by = (best / N) | 0;
    let k = 0;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++, k++) E[((by + dy + N) % N) * N + ((bx + dx + N) % N)] += K[k];
  }
  return (BN = out);
}

/** how cells are chosen: atkinson diffuses error (crisp, high contrast, the classic Mac look);
 *  blue noise thresholds each cell on its own (steadier while a scene moves) */
export let DITHER: "atkinson" | "blue" = "blue";
export const setDither = (d: "atkinson" | "blue") => { DITHER = d; };
/** atkinson error diffusion in place: values end as on (>= .5) or off. Cells marked -1 are empty space */
function atkinson(a: Float32Array, w: number, h: number) {
  // serpentine: every other row runs right to left, which breaks up the herringbone
  for (let y = 0; y < h; y++) {
    const s = y & 1 ? -1 : 1;
    for (let k = 0; k < w; k++) {
      const x = s > 0 ? k : w - 1 - k, i = y * w + x, v = a[i];
      if (v < 0) continue;
      const o = v >= 0.5 ? 1 : 0, e = (v - o) / 8;
      a[i] = o;
      const add = (dx: number, dy: number) => { const X = x + dx * s, Y = y + dy; if (X >= 0 && X < w && Y < h) { const j = Y * w + X; if (a[j] >= 0) a[j] += e; } };
      add(1, 0); add(2, 0); add(-1, 1); add(0, 1); add(1, 1); add(0, 2);
    }
  }
}

/** face tone to dot density: right walls sparse, left walls dense, lit tops nearly solid */
const CURVE: [number, number][] = [[0.05, 0], [0.3, 0.08], [0.55, 0.26], [0.63, 0.36], [0.7, 0.66], [0.76, 0.86], [0.85, 0.92], [1, 0.975]];
function toneCurve(v: number) {
  for (let i = 1; i < CURVE.length; i++) {
    const [x1, y1] = CURVE[i];
    if (v <= x1) { const [x0, y0] = CURVE[i - 1]; return y0 + ((v - x0) / (x1 - x0)) * (y1 - y0); }
  }
  return CURVE[CURVE.length - 1][1];
}

const hash = (x: number, y: number, s = 0) => ((((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 10007) / 10007;

/** the stipple feel: dot size, how far the pointer reaches, how it drags, carves and heals */
export const STIPPLE = {
  cell: 0.38, // css px per cell, as a share of the art's pitch
  pad: 0.14, // room around the art (share of its width) so dots can be pulled out past its edge
  reach: 0.07, // pointer radius, as a share of the width
  drag: 0.9, // hovering: how much of the pointer's motion the dots under it take (pulls edges like taffy)
  hover: 0.22, // hovering: how far dots lean away from the pointer, in radii
  carve: 1.05, // pressed: the hole the pointer clears, in radii (dots inside are packed onto its rim)
  burst: 120, // a click throws the dots out, cells per second at the centre
  heal: 3.4, // how fast a carved crack closes once the pointer has moved on (per second)
  spring: 36, // pull back home: low, so cracks zip shut rather than snap
  damping: 7.4, // a little under critical: shapes settle with one soft jelly wobble
};

export class Stipple {
  /** canvas size in device pixels (the art plus room around it) */
  W: number; H: number;
  /** the room around the art, in device pixels on each side */
  padX: number; padY: number;
  private cell: number; private dot: number; private cols: number; private rows: number; private ox: number; private oy: number;
  private ac: number; private ar: number; private aq: number; private arow: number;
  private dens: Float32Array | null = null; private vals: Float32Array | null = null; private was: Uint8Array | null = null;
  private on = new Int32Array(0); private col = new Uint32Array(0); private jit = new Float32Array(0); private n = 0;
  private img: ImageData | null = null; private buf: Uint32Array | null = null;
  // the displacement field: one node every F cells, each a damped spring
  private F = 2; private fw: number; private fh: number;
  private Dx: Float32Array; private Dy: Float32Array; private Vx: Float32Array; private Vy: Float32Array;
  // the opening a press carves stays carved for a moment after the pointer moves on, then zips shut
  private Mx: Float32Array; private My: Float32Array; private ph = [0, 0, 0];
  private px = 0; private py = 0; private inside = false; private pressed = false; private kick = false; private mx = 0; private my = 0; private R: number;
  /** true while the dots are away from home or the pointer is on them */
  active = false;

  constructor(private ill: Illustration, private theme: Theme, pitch: number, dpr: number, roomy = true, private stage = false) {
    const win = windowOf(ill, "stipple", stage);
    const aw = win.w * pitch * dpr, ah = win.h * pitch * dpr;
    this.padX = roomy ? Math.round(aw * STIPPLE.pad) : 0; this.padY = roomy ? Math.round(ah * STIPPLE.pad) : 0;
    this.W = Math.max(1, Math.round(aw) + this.padX * 2); this.H = Math.max(1, Math.round(ah) + this.padY * 2);
    this.cell = Math.max(3, Math.round(pitch * dpr * STIPPLE.cell));
    this.dot = this.cell <= 4 ? this.cell - 1 : Math.round(this.cell * 0.72);
    this.cols = Math.floor(this.W / this.cell); this.rows = Math.floor(this.H / this.cell);
    this.ox = Math.floor((this.W - this.cols * this.cell) / 2); this.oy = Math.floor((this.H - this.rows * this.cell) / 2);
    // the art's own cells inside the padded grid
    this.aq = Math.round((this.padX - this.ox) / this.cell); this.arow = Math.round((this.padY - this.oy) / this.cell);
    this.ac = Math.max(1, Math.round(aw / this.cell)); this.ar = Math.max(1, Math.round(ah / this.cell));
    this.fw = Math.ceil(this.cols / this.F) + 2; this.fh = Math.ceil(this.rows / this.F) + 2;
    const m = this.fw * this.fh;
    this.Dx = new Float32Array(m); this.Dy = new Float32Array(m); this.Vx = new Float32Array(m); this.Vy = new Float32Array(m);
    this.Mx = new Float32Array(m); this.My = new Float32Array(m);
    this.R = Math.max(5, this.ac * STIPPLE.reach);
  }

  /** sample the scene at time t, hover h, and decide which cells are lit and in what tint */
  setTone(t: number, h: number): void {
    if (this.stage !== STAGE.on) return withStage(this.ill, this.stage, () => this.setTone(t, h));
    const win = bounds(this.ill), ac = this.ac, ar = this.ar, cols = this.cols;
    // two by two samples per cell: steadier edges while things move. A detail line anywhere in the
    // cell pulls it down hard, so lines stay crisp gaps rather than turning grey
    const ss = 2;
    const img = renderHi(this.ill, t, h, (ac * ss) / win.w, win, true, 0.02, true);
    const d = img.data, iw = img.width, ih = img.height, bn = blueNoise();
    const A = hex(this.theme.a), B = hex(this.theme.b ?? this.theme.a);
    const ink = A[0] + A[1] + A[2] < 300;
    const size = this.cols * this.rows;
    if (this.on.length < size) { this.on = new Int32Array(size); this.col = new Uint32Array(size); this.jit = new Float32Array(size); }
    if (!this.dens || this.dens.length < ac * ar) { this.dens = new Float32Array(ac * ar); this.vals = new Float32Array(ac * ar); this.was = new Uint8Array(ac * ar); }
    const dn = this.dens, vals = this.vals!, was = this.was!;
    for (let r = 0; r < ar; r++) for (let q = 0; q < ac; q++) {
      let sum = 0, lo = 1;
      for (let y = 0; y < ss; y++) {
        const yy = Math.min(ih - 1, r * ss + y);
        for (let x = 0; x < ss; x++) { const g = d[(yy * iw + Math.min(iw - 1, q * ss + x)) * 4] / 255; sum += g; if (g < lo) lo = g; }
      }
      const avg = sum / (ss * ss), v = Math.min(avg, (avg + lo) / 2);
      vals[r * ac + q] = v;
      const u = q / ac, w = r / ar;
      // tones are kept apart, never parked at half: lit faces nearly solid, left walls dense, right
      // walls clearly sparse. Half density is where dithering turns into mazes, so it only appears in
      // the light ramp across a face (top left brighter), which is what makes the dither read as shape
      const light = 1.12 - 0.3 * (u * 0.45 + w * 0.55);
      dn[r * ac + q] = v < 0.05 ? -1 : Math.min(0.985, toneCurve(v) * light);
    }
    if (DITHER === "atkinson") atkinson(dn, ac, ar);
    let n = 0;
    for (let r = 0; r < ar; r++) for (let q = 0; q < ac; q++) {
      const i = r * ac + q, dens = dn[i];
      if (dens < 0) { was[i] = 0; continue; }
      const v = vals[i];
      const u = q / ac, w = r / ar;
      const gq = q + this.aq, gr = r + this.arow;
      // hysteresis: a dot only changes state when its tone moves clearly past its threshold, so
      // tiny tone changes between frames never make it blink
      const th = bn[(gr % BNS) * BNS + (gq % BNS)];
      const lit = DITHER === "atkinson" ? dens >= 0.5 : was[i] ? dens > th - 0.05 : dens > th + 0.05;
      was[i] = lit ? 1 : 0;
      if (!lit) continue;
      // the dot's own tint: the theme across the art, brighter on lit faces, with a small personal drift
      const k = w * 0.75 + u * 0.25, j = hash(q, r) - 0.5, j2 = hash(q, r, 1) - 0.5;
      const L = (0.6 + 0.4 * Math.min(1, v)) * (1 + j * 0.16);
      const wh = ink ? 0 : Math.max(0, v - 0.85) * 0.9 + 0.05; // the brightest dots lean toward white (not dark ink on a light page)
      const ch = (i: number) => {
        let c = A[i] + (B[i] - A[i]) * k;
        c += (255 - c) * wh;
        c += (i === 0 ? 1 : i === 2 ? -1 : 0) * j2 * 22; // warmer or cooler
        return Math.max(0, Math.min(255, Math.round(c * L)));
      };
      this.on[n] = gr * cols + gq;
      this.col[n] = ((255 << 24) | (ch(2) << 16) | (ch(1) << 8) | ch(0)) >>> 0;
      // each dot travels a little more or less than its neighbours: torn edges come out hairy, like sand
      this.jit[n] = 0.74 + 0.52 * hash(q, r, 2);
      n++;
    }
    this.n = n;
  }

  private toCells(cx: number, cy: number, rect: DOMRect) {
    return [((cx - rect.left) * (this.W / rect.width) - this.ox) / this.cell, ((cy - rect.top) * (this.H / rect.height) - this.oy) / this.cell];
  }
  /** the pointer, in client coordinates over a box of rect */
  point(cx: number, cy: number, rect: DOMRect) {
    const [x, y] = this.toCells(cx, cy, rect);
    if (this.inside) { this.mx += x - this.px; this.my += y - this.py; }
    this.px = x; this.py = y; this.inside = true; this.active = true;
  }
  /** a press: the dots burst out from under it and stay parted while it is held */
  down(cx: number, cy: number, rect: DOMRect) {
    this.point(cx, cy, rect); this.pressed = true; this.kick = true;
    // every press splats differently
    this.ph = [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28];
  }
  up() { this.pressed = false; }
  leave() { this.inside = false; this.pressed = false; this.mx = this.my = 0; }

  /** move the springs on by dt seconds */
  step(dt: number) {
    const { F, fw, fh, R, Dx, Dy, Vx, Vy, Mx, My, pressed, ph } = this;
    const heal = Math.exp(-dt * STIPPLE.heal);
    const lim = R * 1.2;
    const mx = Math.max(-lim, Math.min(lim, this.mx)), my = Math.max(-lim, Math.min(lim, this.my));
    this.mx = this.my = 0;
    const kick = this.kick; this.kick = false;
    const K = STIPPLE.spring, C = STIPPLE.damping, R2 = R * R;
    const r0 = R * STIPPLE.carve, lean = R * STIPPLE.hover, drag = pressed ? STIPPLE.drag * 0.38 : STIPPLE.drag;
    let moving = this.inside;
    for (let gy = 0; gy < fh; gy++) for (let gx = 0; gx < fw; gx++) {
      const i = gy * fw + gx;
      let tx = 0, ty = 0, k = K;
      if (this.inside) {
        const dx = (gx - 1) * F - this.px, dy = (gy - 1) * F - this.py, d2 = dx * dx + dy * dy;
        if (d2 < R2 * 12) {
          const w = Math.exp(-d2 / R2), dd = Math.sqrt(d2) + 1e-3, ux = dx / dd, uy = dy / dd;
          Dx[i] += mx * w * drag; Dy[i] += my * w * drag;
          if (pressed) {
            // carve: a splat, not a circle. The rim wanders with the angle, so the hole has lobes and spikes
            const a = Math.atan2(dy, dx);
            const rr = r0 * (1 + 0.2 * Math.sin(3 * a + ph[0]) + 0.13 * Math.sin(7 * a + ph[1]) + 0.08 * Math.sin(13 * a + ph[2]));
            // everything inside is packed onto the rim, the rim bulges outward and fades
            const o = dd < rr ? rr - dd + rr * 0.16 : rr * 0.16 * Math.exp(-((dd - rr) * (dd - rr)) / R2);
            const cx = ux * o, cy = uy * o;
            // remember the opening, so a pressed drag leaves a crack that closes behind it
            if (cx * cx + cy * cy > Mx[i] * Mx[i] + My[i] * My[i]) { Mx[i] = cx; My[i] = cy; }
            k = K * 2.4; // held open firmly
            if (kick) { const b = STIPPLE.burst * Math.exp(-d2 / (R2 * 2.2)); Vx[i] += ux * b; Vy[i] += uy * b; }
          } else { const o = lean * Math.exp(-d2 / (R2 * 0.6)); tx = ux * o; ty = uy * o; }
        }
      }
      // the carved opening heals from the outside in: its memory fades, so the crack narrows and zips shut
      if (!pressed || !this.inside) { Mx[i] *= heal; My[i] *= heal; }
      else { Mx[i] *= Math.exp(-dt * STIPPLE.heal * 0.5); My[i] *= Math.exp(-dt * STIPPLE.heal * 0.5); }
      if (Mx[i] * Mx[i] + My[i] * My[i] > tx * tx + ty * ty) { tx = Mx[i]; ty = My[i]; }
      Vx[i] += (-k * (Dx[i] - tx) - C * Vx[i]) * dt; Vy[i] += (-k * (Dy[i] - ty) - C * Vy[i]) * dt;
      Dx[i] += Vx[i] * dt; Dy[i] += Vy[i] * dt;
      if (!moving && (Math.abs(Mx[i]) + Math.abs(My[i]) > 0.05 || Math.abs(Dx[i]) + Math.abs(Dy[i]) > 0.02 || Math.abs(Vx[i]) + Math.abs(Vy[i]) > 0.05)) moving = true;
    }
    if (!moving) { Dx.fill(0); Dy.fill(0); Vx.fill(0); Vy.fill(0); Mx.fill(0); My.fill(0); }
    this.active = moving;
  }

  /** every lit dot, displaced, in device pixels */
  private place(fn: (x: number, y: number, i: number) => void) {
    const { F, fw, fh, Dx, Dy, cols, cell, ox, oy, jit } = this;
    const live = this.active;
    for (let k = 0; k < this.n; k++) {
      const idx = this.on[k], q = idx % cols, r = (idx / cols) | 0;
      let x = q, y = r;
      if (live) {
        const fx = q / F + 1, fy = r / F + 1, x0 = Math.min(fw - 2, fx | 0), y0 = Math.min(fh - 2, fy | 0), ax = fx - x0, ay = fy - y0;
        const i = y0 * fw + x0, j = jit[k];
        x += ((Dx[i] * (1 - ax) + Dx[i + 1] * ax) * (1 - ay) + (Dx[i + fw] * (1 - ax) + Dx[i + fw + 1] * ax) * ay) * j;
        y += ((Dy[i] * (1 - ax) + Dy[i + 1] * ax) * (1 - ay) + (Dy[i + fw] * (1 - ax) + Dy[i + fw + 1] * ax) * ay) * j;
      }
      fn(Math.round(ox + x * cell), Math.round(oy + y * cell), k);
    }
  }

  /** paint into a canvas the size of W by H (device pixels; transforms are ignored) */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.img) { this.img = new ImageData(this.W, this.H); this.buf = new Uint32Array(this.img.data.buffer); }
    const buf = this.buf!, W = this.W, H = this.H, s = this.dot, col = this.col;
    buf.fill(0);
    this.place((x, y, k) => {
      if (x < 0 || y < 0 || x + s > W || y + s > H) return;
      const c = col[k];
      for (let yy = 0; yy < s; yy++) { const row = (y + yy) * W + x; for (let xx = 0; xx < s; xx++) buf[row + xx] = c; }
    });
    ctx.putImageData(this.img, 0, 0);
  }

  /** every dot as a square, for SVG: x, y, size in device pixels and a css colour */
  each(fn: (x: number, y: number, s: number, col: string) => void) {
    this.place((x, y, k) => { const c = this.col[k]; fn(x, y, this.dot, `rgb(${c & 255},${(c >> 8) & 255},${(c >> 16) & 255})`); });
  }
}

/** the part of the grid the piece ever lights (sampled over its motion), plus a margin of dots */
const boundsCache = new Map<string, { q0: number; r0: number; w: number; h: number }>();
export function bounds(ill: Illustration, margin = 3) {
  const key = `${ill.k}|${+STAGE.on}`, hit = boundsCache.get(key);
  if (hit) return hit;
  // measured on a grid padded by a quarter on every side: art that reaches past the piece's own grid
  // (a tall lanyard, a wide stage) is measured too, never cut flat at the grid's edge
  const P = Math.round(Math.max(ill.cols, ill.rows) / 4), C = ill.cols + P * 2, Rw = ill.rows + P * 2;
  let q0 = C, r0 = Rw, q1 = -1, r1 = -1;
  const per = ill.period ?? 3;
  // sample enough moments that nothing that moves gets cropped mid motion
  const N = 12;
  for (let i = 0; i < N; i++) {
    for (const h of ill.kind === "hover" ? [0, 0.35, 0.7, 1] : [0]) {
      const g = renderGrid(ill, (i / N) * per, h, P);
      for (let r = 0; r < Rw; r++) for (let q = 0; q < C; q++) {
        if (g[r * C + q] < 0.035) continue;
        if (q < q0) q0 = q; if (q > q1) q1 = q; if (r < r0) r0 = r; if (r > r1) r1 = r;
      }
    }
  }
  if (q1 < 0) return { q0: 0, r0: 0, w: ill.cols, h: ill.rows };
  const b = { q0: q0 - P - margin, r0: r0 - P - margin, w: q1 - q0 + 1 + margin * 2, h: r1 - r0 + 1 + margin * 2 };
  boundsCache.set(key, b);
  return b;
}

/* ── themes: a dot colour (or a gradient across the art) ── */
export interface Theme { name: string; a: string; b?: string; bg: string }
export const THEMES: Theme[] = [
  { name: "White", a: "#f2f4f2", bg: "#0b0b0b" },
  { name: "Duotone", a: "#6b74ff", b: "#ff6a3d", bg: "#0b0b0b" },
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

/** the current frame as an SVG: halftone is pure circles; soft is an embedded image */
export function toSVG(ill: Illustration, t: number, h: number, theme: Theme, pitch = 8, style: DotStyle = "stipple", mode: Mode = "dark", stage = false): string {
  if (stage !== STAGE.on) return withStage(ill, stage, () => toSVG(ill, t, h, theme, pitch, style, mode, stage));
  const bx = style === "line" ? lineBounds(ill) : bounds(ill);
  const W = bx.w * pitch, H = bx.h * pitch;
  const parts: string[] = [];
  if (style === "stipple") {
    const st = new Stipple(ill, theme, pitch, 1, false, stage);
    st.setTone(t, h);
    st.each((x, y, s, col) => parts.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${col}"/>`));
  } else if (style === "halftone") {
    eachHalftoneDot(ill, t, h, theme, pitch, (x, y, r, col) => parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${col}"/>`));
  } else {
    const cv = document.createElement("canvas"); cv.width = W * 2; cv.height = H * 2;
    const c = cv.getContext("2d")!; c.scale(2, 2);
    paintLine(c, ill, t, h, theme, pitch, mode);
    parts.push(`<image href="${cv.toDataURL("image/png")}" x="0" y="0" width="${W}" height="${H}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="${style === "line" ? (mode === "light" ? "#f7f8fa" : "#0e0f11") : mode === "light" ? "#f7f8fa" : theme.bg}"/>${parts.join("")}</svg>`;
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
export async function toGIF(ill: Illustration, theme: Theme, pitch = 6, fps = 24, style: DotStyle = "stipple", mode: Mode = "dark", stage = false): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const dur = ill.kind === "loop" ? ill.period ?? 3 : 3.2;
  const n = Math.round(dur * fps);
  const bx = windowOf(ill, style, stage);
  const W = bx.w * pitch, H = bx.h * pitch;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d", { willReadFrequently: true })!;
  const gif = GIFEncoder();
  let palette: number[][] | null = null;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    c.fillStyle = mode === "light" ? "#f7f8fa" : style === "line" ? "#0e0f11" : theme.bg; c.fillRect(0, 0, W, H);
    paintFrame(c, ill, u * dur, ill.kind === "loop" ? 0 : hoverAt(u), theme, pitch, style, 1, mode, stage);
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
