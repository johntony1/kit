// People: three simple figures standing together, one in front of two. Hover and they hop one after another.
import { type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
/** a surface of revolution around a vertical axis, in crisp bands: up lit, left dense, right sparse */
function lathe(p: Pen, prof: [number, number][], N = 44) {
  const strips: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [za, ra] = prof[i], [zb, rb] = prof[i + 1];
    const dz = zb - za, dr = rb - ra, L = Math.hypot(dz, dr) || 1, nr = dz / L, nz = -dr / L;
    for (let j = 0; j < N; j++) {
      const a0 = (j / N) * Math.PI * 2 - 0.01, a1 = ((j + 1) / N) * Math.PI * 2 + 0.01, m = (a0 + a1) / 2;
      const nx = Math.cos(m) * nr, ny = Math.sin(m) * nr;
      if (nx + ny + nz <= 0.02) continue;
      const f = nz > 0.6 ? 0.26 : ny > nx ? 0.2 : 0.1;
      const P = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
      strips.push({ d: (Math.cos(m) + Math.sin(m)) * (ra + rb) / 2 + (za + zb) / 2, pts: [P(a0, ra, za), P(a1, ra, za), P(a1, rb, zb), P(a0, rb, zb)], f });
    }
  }
  strips.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
}
const BODY: [number, number][] = [[0, 4.5], [1.5, 4.5], [3, 4.5], [4.4, 4.5], [5.5, 4.35], [6.6, 4.1], [7.4, 3.7], [8.2, 3.2], [9.3, 2], [9.8, 0.8]];
const HR = 3.1, HZ = 13.7; // head radius, head centre height
const HEAD: [number, number][] = Array.from({ length: 17 }, (_, i) => { const a = -Math.PI / 2 + (Math.PI * i) / 16; return [HZ + Math.sin(a) * HR, Math.max(0.001, Math.cos(a) * HR)] as [number, number]; });

function figure(p: Pen, x: number, y: number, z: number, s: number) {
  p.push();
  p.translate(x, y, z);
  p.scale(s);
  lathe(p, BODY);
  lathe(p, HEAD);
  p.pop();
}

export const people: Illustration = {
  k: "people", name: "People", title: "No people yet", body: "People you add or invite will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -1, -13);
    p.scale(1.55);
    const hop = (i: number) => Math.sin(cl(h * 1.7 - i * 0.3) * Math.PI) * 4.5 + h * Math.max(0, Math.sin(t * 2.6 - i * 0.9)) * 0.7;
    // the two at the back, then the one in front
    const who: [number, number, number, number][] = [[-9.4, 5, 0.9, 0], [5, -9.4, 0.9, 2], [3.2, 3.2, 1.08, 1]];
    for (const [x, y] of who) p.shadow(x, y, 9, 5, 0.12);
    for (const [x, y, s, i] of who) figure(p, x, y, hop(i), s);
  },
};
