// No face added: the face scan symbol standing up, four bold corner brackets round a round smiley face. The brackets close in, a bright scan line sweeps down the face and back, and the face blinks, over and over.
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

const P = 3.2, S = 21, A = 9.5, T = 3.4; // loop seconds, half size of the frame, bracket arm, bracket thickness
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const faceid: Illustration = {
  k: "faceid", name: "Face scan", title: "No face added", body: "Set up face scan to unlock and approve payments with a look.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // the brackets squeeze in and ease back out; the scan runs down then up between
    const pinch = 1.8 * Math.sin(Math.PI * Math.min(1, u / 0.5)) ** 2;
    const scan = u < 0.5 ? ease(u / 0.5) : 1 - ease((u - 0.5) / 0.5);
    p.translate(0, 0, -1);
    p.shadow(0, 2, 26, 12, 0.1);
    p.rotate("z", RZ);
    // four L brackets at the corners
    const s = S - pinch;
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]] as const) {
      const L: P2[] = [[0, 0], [A, 0], [A, -T], [T, -T], [T, -A], [0, -A]];
      slab(p, L.map(([x, z]) => [sx * (s - x), sz * (s + z)] as P2), 0, 2.4, 0.3, 0.24, 0.1);
    }
    // the face: a lit disc with eyes and a smile cut out
    slab(p, arc(0, 0, 12.5, 12.5, 0, Math.PI * 2, 48), 0, 2, 0.22, 0.2, 0.09);
    const blink = u > 0.82 && u < 0.9 ? 0.15 : 1;
    for (const e of [-1, 1]) p.clear(arc(e * 4.6, 3.2, 1.7, 2.8 * blink, 0, Math.PI * 2, 18).map(([x, z]) => [x, 0.05, z] as V3));
    const smile = [...arc(0, 0.5, 7.5, 7, Math.PI * 1.15, Math.PI * 1.85, 16), ...arc(0, 0.5, 5.4, 4, Math.PI * 1.85, Math.PI * 1.15, 16)];
    p.clear(smile.map(([x, z]) => [x, 0.05, z] as V3));
    // the scan line: a bright bar across the face, inside the brackets
    const z = (s - 4) - scan * (2 * s - 8);
    const a = p.pt([-s + 3, 0.3, z]), b = p.pt([s - 3, 0.3, z]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round";
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    });
    p.line([[-s + 3, 0.35, z - 1.2], [s - 3, 0.35, z - 1.2]], SH.edge, 0.6);
  },
};
