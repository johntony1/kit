// Trash is empty: a round ribbed bin. Hover and the lid lifts and floats; a few specks drift out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R0 = 8.6, R1 = 10.6, H = 23; // radius at the foot, radius at the rim, height
const rAt = (z: number) => R0 + ((R1 - R0) * z) / H;
const at = (a: number, z: number, r = rAt(z)): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
/** one slice of the bin's side between angles a0..a1 */
const side = (p: Pen, a0: number, a1: number, z0: number, z1: number, fill: number, k = 0) => {
  const n = 14, pts: V3[] = [];
  for (let i = 0; i <= n; i++) pts.push(at(a0 + ((a1 - a0) * i) / n, z0, rAt(z0) + k));
  for (let i = n; i >= 0; i--) pts.push(at(a0 + ((a1 - a0) * i) / n, z1, rAt(z1) + k));
  p.face(pts, fill, SH.edge, 0.5);
};
const ring = (r: number, z: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const trash: Illustration = {
  k: "trash", name: "Trash bin", title: "Trash is empty", body: "Things you delete land here, and you can bring them back any time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.scale(0.86, [0, 0, 16]);
    p.shadow(0, 0, 22, 11, 0.12);
    const A = -Math.PI / 4, M = Math.PI / 4, B = (3 * Math.PI) / 4; // right edge, front, left edge
    // the side: the half facing +y is the lit wall, the half facing +x the dark one
    side(p, M, B, 0, H, 0.13);
    side(p, A, M, 0, H, 0.065);
    // ribs pressed into the side, as cut lines
    for (let i = 1; i < 10; i++) {
      const a = A + (Math.PI * i) / 10;
      p.line([at(a, 2.4), at(a, H - 3.2)], SH.edge, 0.7);
    }
    // a rolled band near the foot
    side(p, A, B, 0, 1.6, 0.2, 0.05);
    // the rim: a bright collar
    side(p, A, B, H - 2, H, 0.22, 0.25);
    // the opening, dark, with the far inside wall faintly lit
    const lid = h;
    if (lid > 0.02) {
      p.face(ring(R1 + 0.25, H), 0.03, SH.edge, 0.5);
      const inner: V3[] = [];
      for (let i = 0; i <= 16; i++) inner.push(at(Math.PI * 0.75 + (Math.PI * i) / 16, H, R1 - 0.3));
      for (let i = 16; i >= 0; i--) inner.push(at(Math.PI * 0.75 + (Math.PI * i) / 16, H - 4, R1 - 1.0));
      p.face(inner, 0.07, 0, 0.5);
    }
    // the lid: lifts and floats, tilting a little as it bobs
    const bob = Math.sin(t * 2.4) * 0.9 * lid;
    p.push();
    p.translate(0, 0, lid * 11 + bob);
    p.rotate("x", lid * (0.12 + Math.sin(t * 1.7) * 0.05), [0, 0, H]);
    p.rotate("y", -lid * 0.12, [0, 0, H]);
    p.cylinder(0, 0, H, R1 + 0.7, 1.6, { side: 0.12, top: 0.21 });
    // a shallow dome and the handle
    p.cylinder(0, 0, H + 1.6, R1 - 2.2, 1.1, { side: 0.15, top: 0.24 });
    p.line(ring(R1 - 4.5, H + 2.75, 40).concat([ring(R1 - 4.5, H + 2.75, 40)[0]]), SH.edge, 0.6);
    p.line([[-2.4, 0, H + 2.75], [2.4, 0, H + 2.75]], SH.edge, 1.1); // the grip
    p.pop();
    // specks drifting up out of the empty bin
    const k = Math.max(0, (lid - 0.4) / 0.6);
    if (k > 0) for (let i = 0; i < 5; i++) {
      const u = (t * 0.32 + i / 5) % 1;
      const a = [2.6, -0.9, 1.9, 0.2, 3.4][i] + Math.sin(t * 0.8 + i) * 0.15;
      const r = R1 + 1 + u * 5;
      p.dot([Math.cos(a) * r, Math.sin(a) * r * 0.6 - 3, H + 1 + u * 12], 0.9, k * Math.min(1, Math.sin(u * Math.PI) * 1.8));
    }
  },
};
