// Nothing to tune: a panel standing up with three slider tracks cut into it, a big bright round knob on each at its own height. Hover and the knobs glide to new settings one after another.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const RZ = -0.5, CS = Math.cos(RZ) + Math.sin(RZ);
type P2 = [number, number];
// a flat shape drawn in the x-z plane, standing up and facing the viewer, given depth back along -y.
// The sides that face us are shaded by where they point (up: lit, right: in shade), then the front goes on top
function slab(p: Pen, pts: P2[], y0: number, d: number, front: number, top = SH.top, side = SH.right) {
  let a = 0;
  pts.forEach(([x0, z0], i) => { const [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; });
  const o = a > 0 ? 1 : -1, sides: { k: number; q: V3[]; f: number }[] = [];
  pts.forEach(([x0, z0], i) => {
    const [x1, z1] = pts[(i + 1) % pts.length], L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = (o * (z1 - z0)) / L, nz = (-o * (x1 - x0)) / L;
    if (nx * CS + nz <= 0.02) return;
    sides.push({ k: ((x0 + x1) / 2) * CS + (z0 + z1) / 2, q: [[x0, y0, z0], [x1, y0, z1], [x1, y0 - d, z1], [x0, y0 - d, z0]], f: nz > 0.55 ? top : side });
  });
  sides.sort((u, v) => u.k - v.k).forEach((s) => p.face(s.q, s.f, 0));
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, 0);
}
const arc = (cx: number, cz: number, rx: number, rz: number, a0 = 0, a1 = Math.PI * 2, n = 40): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * rx, cz + Math.sin(a) * rz] as P2; });

const W = 18, H = 36, Z0 = 6, Z1 = 30; // half width and height of the panel, the track ends
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a rounded rectangle
const rrect = (x0: number, z0: number, x1: number, z1: number, r: number): P2[] => [
  ...arc(x1 - r, z0 + r, r, r, -Math.PI / 2, 0, 6), ...arc(x1 - r, z1 - r, r, r, 0, Math.PI / 2, 6),
  ...arc(x0 + r, z1 - r, r, r, Math.PI / 2, Math.PI, 6), ...arc(x0 + r, z0 + r, r, r, Math.PI, Math.PI * 1.5, 6),
];

export const sliders: Illustration = {
  k: "sliders", name: "Sliders", title: "Nothing to tune", body: "Once there is something to adjust, its controls will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -18);
    p.shadow(0, 0, 28, 12, 0.11);
    p.rotate("z", RZ);
    // the panel: a thick slab with a shaded face
    slab(p, rrect(-W, 0, W, H, 4), 0, 5, 0.06, 0.24, 0.1);
    const from = [0.25, 0.75, 0.45], to = [0.8, 0.3, 0.65];
    [-11, 0, 11].forEach((x, i) => {
      // the track: a dark slot with a lit groove filled up to the knob
      p.clear(rrect(x - 1.3, Z0, x + 1.3, Z1, 1.3).map(([a, z]) => [a, 0.04, z] as V3));
      const k = ease(Math.max(0, Math.min(1, (h - i * 0.2) / 0.6)));
      const z = Z0 + (Z1 - Z0) * (from[i] + (to[i] - from[i]) * k);
      p.face(rrect(x - 0.6, Z0 + 0.6, x + 0.6, z, 0.6).map(([a, zz]) => [a, 0.06, zz] as V3), 0.4, 0);
      // the knob: a bright round cap standing out from the panel, a grip cut across it
      const cap = arc(x, z, 4.6, 4.6, 0, Math.PI * 2, 32);
      slab(p, cap, 3, 3, 0.42, 0.3, 0.16);
      p.line(cap.map(([a, zz]) => [a, 3.04, zz] as V3), SH.edge, 0.6);
      p.line([[x - 2.2, 3.05, z], [x + 2.2, 3.05, z]], SH.edge, 0.9);
    });
  },
};
