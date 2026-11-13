// No discounts yet: a big solid percent sign standing up. It rocks from side to side and bobs, showing its thickness.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const DY = 2.4; // half thickness
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
const circle = (cx: number, cz: number, r: number): [number, number][] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
const at = (pts: [number, number][], y: number): V3[] => pts.map(([x, z]) => [x, y, z] as V3);

/** the walls of a profile pushed through the thickness: only the strips turned toward us */
function walls(p: Pen, prof: [number, number][], inner: boolean) {
  const s = Math.sign(facing(p, at(prof, DY))) * (inner ? -1 : 1);
  prof.forEach((a, i) => {
    const b = prof[(i + 1) % prof.length];
    const q: V3[] = [[b[0], DY, b[1]], [a[0], DY, a[1]], [a[0], -DY, a[1]], [b[0], -DY, b[1]]];
    if (facing(p, q) * s <= 0) return;
    const dx = Math.abs(b[0] - a[0]), dz = Math.abs(b[1] - a[1]);
    p.face(q, inner ? 0.04 : SH.right + (SH.top - SH.right) * (dx / (dx + dz || 1)), 0);
  });
}
function ring(p: Pen, cx: number, cz: number) {
  const o = circle(cx, cz, 5.4), i = circle(cx, cz, 2.4);
  walls(p, o, false);
  walls(p, i, true);
  const O = at(o, DY), I = at(i, DY);
  p.face([...O, O[0], I[0], ...I.slice().reverse()], 0.3, 0);
}

const SLASH: [number, number][] = [[-9.4, -14], [-4.6, -14], [9.4, 14], [4.6, 14]];

export const percent: Illustration = {
  k: "percent", name: "Discount", title: "No discounts yet", body: "When a deal or promo code applies to you, it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 22, 10, 0.12);
    p.translate(0, 0, 15.5 + 1.2 * Math.abs(Math.sin(u)));
    p.rotate("z", -0.62 + 0.42 * Math.sin(u)); // rocking round its upright axis
    walls(p, SLASH, false);
    ring(p, -7.4, 8);
    ring(p, 7.4, -8);
    p.face(at(SLASH, DY), 0.3, 0);
  },
};
