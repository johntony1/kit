// Nothing to watch: a retro tv on little legs, its screen full of static, a bright bar rolling down it and the antennas hunting for a signal.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const X0 = -11, X1 = 11, Y0 = -7, Y1 = 6, Z0 = 3, Z1 = 19; // the cabinet
const SX0 = -9, SX1 = 3.6, SZ0 = 5.2, SZ1 = 17; // the screen, on the front (the left wall)

/** a rounded rectangle on the front wall */
function rrect(x0: number, x1: number, z0: number, z1: number, r: number, y: number): V3[] {
  const out: V3[] = [];
  const cs: [number, number, number][] = [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 0.5], [x0 + r, z0 + r, 1], [x1 - r, z0 + r, 1.5]];
  for (const [cx, cz, q] of cs) for (let i = 0; i <= 5; i++) { const a = (q + i / 10) * Math.PI; out.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  return out;
}
/** a thin rod between two points: a flat strip facing the viewer, solid in every style */
function rod(p: Pen, a: V3, b: V3, w: number, fill: number) {
  const k = w * 0.5 * Math.SQRT1_2;
  p.face([[a[0] - k, a[1] + k, a[2]], [a[0] + k, a[1] - k, a[2]], [b[0] + k, b[1] - k, b[2]], [b[0] - k, b[1] + k, b[2]]], fill, 0);
}
/** a small seeded hash, so the static repeats every loop */
const hash = (a: number, b: number, c: number) => { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); };

export const tv: Illustration = {
  k: "tv", name: "Retro tv", title: "Nothing to watch yet", body: "Shows you follow will appear here when new episodes air.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = (Math.PI * 2) / P;
    const u = (t % P) / P;
    const frame = Math.floor(u * 30); // static changes 30 times a loop
    p.translate(0, 0, -14);
    p.shadow(0, 0, 30, 15, 0.12);
    // the legs: back pair first
    for (const [x, y] of [[X0 + 2, Y0 + 2], [X1 - 3, Y0 + 2], [X0 + 2, Y1 - 3], [X1 - 3, Y1 - 3]]) p.box(x, y, 0, 1.2, 1.2, Z0, { top: 0.2, left: 0.14, right: 0.08 });
    // the cabinet
    p.box(X0, Y0, Z0, X1 - X0, Y1 - Y0, Z1 - Z0, { top: 0.2, left: 0.12, right: 0.065 });
    // vents on the top
    for (let i = 0; i < 3; i++) p.line([[X0 + 3 + i * 1.8, Y0 + 3, Z1 + 0.02], [X0 + 3 + i * 1.8, Y0 + 7, Z1 + 0.02]], 1, 0.55);
    // the screen: a lit bezel round a dark tube
    const fy = Y1 + 0.02;
    p.face(rrect(SX0 - 0.9, SX1 + 0.9, SZ0 - 0.9, SZ1 + 0.9, 2.6, fy), 0.22, 1);
    p.face(rrect(SX0, SX1, SZ0, SZ1, 2, fy + 0.02), 0.02, 1);
    // static: specks over the tube, thicker in the rolling bar
    const bar = SZ1 - u * (SZ1 - SZ0 + 4) + 2;
    for (let i = 0; i < 14; i++) for (let j = 0; j < 12; j++) {
      const x = SX0 + 0.8 + i * ((SX1 - SX0 - 1.6) / 13), z = SZ0 + 0.7 + j * ((SZ1 - SZ0 - 1.4) / 11);
      const inBar = Math.abs(z - bar) < 1.6;
      const r = hash(i, j, frame);
      if (r < (inBar ? 0.7 : 0.3)) p.dot([x + (hash(j, i, frame) - 0.5) * 0.6, fy + 0.05, z], inBar ? 0.36 : 0.3, r < 0.1 || (inBar && r < 0.35) ? 1 : 0.62);
    }
    // the side panel: two knobs and a speaker
    for (const [z, a] of [[14.6, t * w], [10.4, -0.6]] as [number, number][]) {
      p.ringV("y", [7, fy, z], 1.7, 0.24, 1, 0.5);
      p.line([[7, fy + 0.03, z], [7 + Math.cos(a) * 1.4, fy + 0.03, z + Math.sin(a) * 1.4]], 1, 0.55);
    }
    p.face([[5.2, fy, 5], [8.8, fy, 5], [8.8, fy, 8], [5.2, fy, 8]], 0.2, 1);
    for (let i = 0; i < 3; i++) p.line([[5.8, fy + 0.03, 5.8 + i * 0.85], [8.2, fy + 0.03, 5.8 + i * 0.85]], 1, 0.45);

    // the antennas: a little dome and two rods that sway as they hunt for a signal
    p.cylinder(0, -1, Z1, 2, 1.2, { top: 0.22, side: 0.13 });
    const sway = Math.sin(t * w) * 0.22;
    const tips: V3[] = [];
    for (const [ax, ay, k] of [[-0.55, 0.35, 1], [0.6, -0.2, -1]] as [number, number, number][]) {
      const a = Math.atan2(ay, ax) + sway * k, L = 11;
      const dir: V3 = [Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.78];
      const tip: V3 = [dir[0] * L, -1 + dir[1] * L, Z1 + 1.2 + dir[2] * L];
      rod(p, [0, -1, Z1 + 1.2], tip, 1.1, 0.24);
      p.dot(tip, 0.85, 1);
      tips.push(tip);
    }
    // the signal it is looking for: dashed arcs over the tips
    for (const tip of tips) for (let r = 2; r <= 3.6; r += 1.6) {
      p.guide(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.2 + 0.6 * (i / 8)); return [tip[0] + Math.cos(a) * r * 0.7, tip[1] - Math.cos(a) * r * 0.7, tip[2] + Math.sin(a) * r] as V3; }));
    }
  },
};
