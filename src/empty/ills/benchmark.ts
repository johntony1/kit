// No runs yet: a big stopwatch standing in front of three score bars. The hand sweeps a full turn while the bars rise one after another to new scores and sink back, over and over.
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

const P = 3.6, R = 14, CZ = 15; // loop seconds, face radius, face centre height
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const benchmark: Illustration = {
  k: "benchmark", name: "Benchmark", title: "No runs yet", body: "Run your first benchmark to see how each model scores side by side.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -15);
    p.shadow(4, 0, 30, 13, 0.11);
    p.rotate("z", RZ);
    // three bars behind and to the right, each rising in turn and sinking back
    const base = [16, 24, 31];
    base.forEach((hgt, i) => {
      const k = Math.max(0, Math.min(1, (u - i * 0.1) / 0.35)), back = Math.max(0, Math.min(1, (u - 0.7) / 0.25));
      const hh = hgt * (0.55 + 0.45 * ease(k) - 0.45 * ease(back));
      p.box(6 + i * 6.5, -14, 0, 5, 5, hh, { top: 0.3, left: 0.2, right: 0.075, edge: 0 });
    });
    // the crown and side button
    p.box(-1.6, -2.5, CZ + R + 0.5, 3.2, 2.6, 2.6, { top: 0.3, left: 0.2, right: 0.08, edge: 0 });
    p.box(-2.8, -2.8, CZ + R + 2.8, 5.6, 3.2, 1.8, { top: 0.32, left: 0.24, right: 0.1, edge: 0 });
    // the case: a bright rim, then the lit face inside a dark cut
    slab(p, arc(0, CZ, R + 2, R + 2, 0, Math.PI * 2, 56), 0, 4, 0.4, 0.3, 0.1);
    const face = arc(0, CZ, R, R, 0, Math.PI * 2, 56).map(([x, z]) => [x, 0.04, z] as V3);
    p.face(face, 0.22, 0);
    p.line(face, SH.edge, 0.8);
    // four ticks, then the hand from the centre
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? R - 2 : R - 3.6;
      p.line([[Math.cos(a) * r0, 0.06, CZ + Math.sin(a) * r0], [Math.cos(a) * (R - 0.8), 0.06, CZ + Math.sin(a) * (R - 0.8)]], SH.edge, i % 3 ? 0.6 : 1.1);
    }
    const a = Math.PI / 2 - u * Math.PI * 2;
    p.line([[0, 0.08, CZ], [Math.cos(a) * (R - 3), 0.08, CZ + Math.sin(a) * (R - 3)]], SH.edge, 1.4);
    p.dot([0, 0.1, CZ], 1.4, 0);
  },
};
