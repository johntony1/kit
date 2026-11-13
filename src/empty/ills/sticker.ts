// No stickers yet: a big round smiley sticker standing up, a white die cut rim round it and its lower right edge peeled back. Hover and the peel lifts further across the face.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const RZ = -0.45, CS = Math.cos(RZ) + Math.sin(RZ);
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

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 21, NX = Math.SQRT1_2, NZ = -Math.SQRT1_2; // radius; the peel runs toward the lower right

// keep the part of a shape on the near side of the fold line (n . p <= d)
function keep(pts: P2[], d: number): P2[] {
  const out: P2[] = [], side = (q: P2) => q[0] * NX + q[1] * NZ - d;
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length], sa = side(a), sb = side(b);
    if (sa <= 0) out.push(a);
    if (sa * sb < 0) { const k = sa / (sa - sb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
  });
  return out;
}
// the peeled flap: the part past the fold, folded back over the face
function flap(d: number): P2[] {
  const cap = keep(arc(0, 0, R, R, 0, Math.PI * 2, 72).map(([x, z]) => [-x, -z] as P2), -d).map(([x, z]) => [-x, -z] as P2);
  return cap.map(([x, z]) => { const s = x * NX + z * NZ - d; return [x - 2 * s * NX, z - 2 * s * NZ] as P2; });
}

export const sticker: Illustration = {
  k: "sticker", name: "Sticker", title: "No stickers yet", body: "Stickers you collect or make will be kept here, ready to send.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -2);
    p.shadow(0, 2, 26, 12, 0.1);
    p.rotate("z", RZ);
    const d = R * (0.76 - 0.16 * ease(h)) + h * Math.sin(t * 3) * 0.4;
    const disc = (r: number) => keep(arc(0, 0, r, r, 0, Math.PI * 2, 72), d);
    // the white rim, then the face inside it
    slab(p, disc(R), 0, 1.6, 0.42, 0.3, 0.12);
    const inner = disc(R - 2.4);
    p.face(inner.map(([x, z]) => [x, 0.03, z] as V3), 0.22, 0);
    p.line(inner.map(([x, z]) => [x, 0.04, z] as V3), SH.edge, 0.7);
    // eyes and a wide smile, cut out
    for (const s of [-1, 1]) p.clear(arc(s * 6.5, 4.5, 2.4, 3.6, 0, Math.PI * 2, 20).map(([x, z]) => [x, 0.06, z] as V3));
    const smile = [...arc(0, 1, 12, 11, Math.PI * 1.13, Math.PI * 1.87, 20), ...arc(0, 1, 9, 6.5, Math.PI * 1.87, Math.PI * 1.13, 20)];
    p.clear(smile.map(([x, z]) => [x, 0.06, z] as V3));
    // the flap: the paper back of the sticker, folded over, with a dark crease along the fold
    const f = flap(d);
    if (f.length > 2) {
      p.face(f.map(([x, z]) => [x, 0.5, z] as V3), 0.075, 0);
      p.line([...f, f[0]].map(([x, z]) => [x, 0.55, z] as V3), SH.edge, 0.7);
    }
  },
};
