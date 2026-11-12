// Motorbike: a motorbike in pure side view, two big wheels, a fat tank, a seat, a fork with its bar, a headlight and an exhaust. Hover and it pulls forward, its wheels turning and its headlight coming on.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 1 / 1.2247; // the side faces us square on, so x is drawn a little short to keep circles round
const v = (x: number, z: number, y = 0): V3 => [x * K, y, z];
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const R = 10.5, AZ = 10.5, RX = -17, FX = 17; // wheel radius, axle height, rear and front axles
const ring = (cx: number, cz: number, r: number, y: number): V3[] => Array.from({ length: 44 }, (_, i) => { const q = (i / 44) * Math.PI * 2; return v(cx + Math.cos(q) * r, cz + Math.sin(q) * r, y); });
// a bright bar with a dark gap round it, so it stays apart from whatever it crosses
function bar(p: Pen, pts: V3[], lw: number, gap = 2.2) {
  if (p.ink) { p.line(pts, SH.edge, 1); return; }
  const q = pts.map((a) => p.pt(a));
  const run = (g: CanvasRenderingContext2D, w: number, c: string) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
  p.screen((g) => { run(g, lw + gap, "#000"); run(g, lw, "#fff"); });
}
// a flat shape in the side plane with a little depth: a dark gap round it, its top in shade, its side lit
function slab(p: Pen, o: P2[], y0: number, y1: number, front = 0.3, top = 0.12) {
  const at = (y: number): V3[] => o.map(([x, z]) => v(x, z, y));
  const f = at(y1), b = at(y0);
  if (p.ink) { p.face(b, top, 0); p.face(f, front, 0); return; }
  p.line([...b, b[0]], SH.edge, 1.7);
  p.line([...f, f[0]], SH.edge, 1.7);
  for (let y = y0; y < y1; y += 0.5) p.face(at(y), top, 0);
  p.face(f, front, 0);
}
// a wheel: a fat tyre, a dark gap, a solid hub and four spokes that turn
function wheel(p: Pen, x: number, a: number) {
  if (!p.ink) for (let y = -1.5; y < 1.5; y += 0.5) p.face(ring(x, AZ, R, y), 0.12, 0);
  p.face(ring(x, AZ, R, 1.5), 0.3, 0);
  p.clear(ring(x, AZ, R - 3.8, 1.53));
  for (let s = 0; s < 2; s++) {
    const q = a + (s * Math.PI) / 2, c = Math.cos(q) * (R - 3.4), d = Math.sin(q) * (R - 3.4);
    bar(p, [v(x + c, AZ + d, 1.5), v(x - c, AZ - d, 1.5)], 1.2, 0);
  }
  p.face(ring(x, AZ, 2.4, 1.56), 0.3, 0);
  p.dot(v(x, AZ, 1.6), 1, 0);
}

export const motorbike: Illustration = {
  k: "motorbike", name: "Motorbike", title: "No bikes available", body: "Bikes you can book will show up here as soon as one is free.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp(h)), dx = -1 + 2 * k;
    p.translate(0, 0, -17);
    p.shadow(0, 3, 30, 9, 0.12);
    p.rotate("z", -Math.PI / 4);
    p.translate(dx * K, 0, 0);
    const a = -(dx + h * t * 3) / R;
    wheel(p, RX, a);
    wheel(p, FX, a);
    // the fork down to the front axle
    bar(p, [v(8, 31.5), v(FX, AZ)], 2.6, 1.6);
    // the exhaust, low, sweeping back through the rear wheel to its tyre
    bar(p, [v(2, 5.6), v(-9, 5), v(-24.5, 6.8)], 2.6, 0);
    // the engine, a solid block between the wheels, one fin cut in
    slab(p, [[-4, 4.6], [4.6, 4.6], [7, 10], [5.4, 16.4], [-5.4, 16.4], [-6.6, 10]], -1.8, 1.8);
    p.line([v(-6.4, 10.4, 1.83), v(6.8, 10.4, 1.83)], SH.edge, 0.9);
    // the seat, then the fat tank
    slab(p, [[-24, 22.4], [-21, 19.6], [-5.6, 18.6], [-5.6, 22.6], [-12, 24.6], [-22.5, 25.8]], -2, 2);
    slab(p, [[-3.4, 18.6], [10, 18.6], [13, 21.5], [12, 26], [7, 28.6], [0, 28], [-4, 24.5]], -2.4, 2.4);
    // the headlight and the handlebar
    const lit = clamp((h - 0.1) / 0.4);
    p.dot(v(14.6, 27.6, 1), 4.2, 0);
    p.dot(v(14.6, 27.6, 1), 3 + 0.5 * lit + 0.25 * Math.sin(t * 6) * lit, 1);
    bar(p, [v(8, 31.5), v(3.4, 33.6)], 2.8);
  },
};
