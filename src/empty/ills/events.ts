// No upcoming events: one big admission ticket standing up, a star on it and a notched stub. Hover and the stub tears off and swings away.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const HT = 21, CUT = 7, NR = 2.8, YF = 1.4, YB = -1.4; // ticket height, where the stub starts, notch radius, thickness

// a flat shape standing in the plane y = yF, pushed back to yB: lit top edges, dark sides, an outlined front
function slab(p: Pen, s: P2[], yF: number, yB: number, front: number) {
  let a = 0;
  for (let i = 0; i < s.length; i++) { const [x0, z0] = s[i], [x1, z1] = s[(i + 1) % s.length]; a += x0 * z1 - x1 * z0; }
  const o = a > 0 ? 1 : -1;
  for (let i = 0; i < s.length; i++) {
    const [x0, z0] = s[i], [x1, z1] = s[(i + 1) % s.length];
    const l = Math.hypot(x1 - x0, z1 - z0) || 1, nx = (o * (z1 - z0)) / l, nz = (-o * (x1 - x0)) / l;
    if (nx * 0.45 + nz <= 0) continue;
    p.face([[x0, yB, z0], [x1, yB, z1], [x1, yF, z1], [x0, yF, z0]], nz > 0.3 ? 0.05 + 0.25 * nz : 0.05, 0);
  }
  const f = s.map(([x, z]) => [x, yF, z] as V3);
  p.face(f, front, 0);
  p.line([...f, f[0]], SH.edge, 0.5);
}
const arc = (cx: number, cz: number, a0: number, a1: number): P2[] =>
  Array.from({ length: 7 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 6; return [cx + Math.cos(a) * NR, cz + Math.sin(a) * NR] as P2; });

const MAIN: P2[] = [[-18, 0], ...arc(CUT, 0, Math.PI, Math.PI / 2), ...arc(CUT, HT, -Math.PI / 2, -Math.PI), [-18, HT]];
const STUB: P2[] = [...arc(CUT, 0, Math.PI / 2, 0), [18, 0], [18, HT], ...arc(CUT, HT, 0, -Math.PI / 2)];

export const events: Illustration = {
  k: "events", name: "Event tickets", title: "No upcoming events", body: "Events you book or get invited to will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 2, 30, 12, 0.11);
    p.rotate("z", -0.5);
    p.translate(0, 0, 4);
    p.rotate("y", 0.1, [0, 0, HT / 2]);
    // the main part, with a star cut in it
    slab(p, MAIN, YF, YB, 0.2);
    const y = YF + 0.03, sx = -5.6, sz = HT / 2, tw = h * Math.sin(t * 4) * 0.12;
    p.clear(Array.from({ length: 10 }, (_, i) => {
      const a = Math.PI / 2 + tw + (i / 10) * Math.PI * 2, r = i % 2 ? 2.9 : 6.8;
      return [sx + Math.cos(a) * r, y, sz + Math.sin(a) * r] as V3;
    }));
    // the perforation
    for (let z = NR + 1.2; z < HT - NR - 1; z += 2.6) p.line([[CUT - 0.5, y, z], [CUT - 0.5, y, z + 1.2]], SH.edge, 0.7);
    // the stub tears off: slides out, drops a little and swings
    const k = ease(h);
    p.push();
    p.translate(5 * k, 0, -2.5 * k);
    p.rotate("y", 0.3 * k + h * Math.sin(t * 3) * 0.04, [CUT, 0, HT]);
    slab(p, STUB, YF, YB, 0.2);
    for (const x of [11, 13.3, 15.6]) p.line([[x, y, 5], [x, y, HT - 5]], SH.edge, 1);
    p.pop();
  },
};
