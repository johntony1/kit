// No supplements yet: one big two tone capsule lying on a diagonal, two round tablets in front of it. It rocks gently on its low end and a gleam runs along it, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const R = 7.4, L = 10.5; // capsule radius, half length of its straight part
type P2 = [number, number];

/** one half of the capsule in its own axis coordinates: the round end at side d (+1 or -1), flat at the middle */
const half = (d: number, gap: number): P2[] => {
  const o: P2[] = [[d * gap, -R]];
  for (let i = 0; i <= 18; i++) { const a = -Math.PI / 2 + (i / 18) * Math.PI; o.push([d * (L + Math.cos(a) * R), Math.sin(a) * R]); }
  o.push([d * gap, R]);
  return o;
};
/** the shaded lower band of a half, so the capsule reads round */
const belly = (d: number, gap: number): P2[] => {
  const o: P2[] = [[d * gap, -R]];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * (Math.PI * 0.38); o.push([d * (L + Math.cos(a) * R), Math.sin(a) * R]); }
  o.push([d * gap, -R * 0.35]);
  return o;
};

function tablet(p: Pen, x: number, y: number, r: number) {
  p.cylinder(x, y, 0, r, 3, { side: 0.065, top: 0.3, edge: 0 });
  p.line([[x - r * 0.8, y + r * 0.6, 2.63], [x + r * 0.8, y - r * 0.6, 3.03]], SH.edge, 0.9);
}

export const vitamins: Illustration = {
  k: "vitamins", name: "Vitamins", title: "No supplements yet", body: "Add the vitamins you take and we will remind you when it is time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = Math.sin(u * Math.PI * 2);
    const ang = 0.5 + 0.07 * w, gap = 0.5;
    p.translate(0, 0, -13);
    p.shadow(0, 2, 30, 14, 0.12);
    p.rotate("z", -0.42);
    // the capsule, standing in the plane that faces us, its low end resting on the floor
    const c = Math.cos(ang), s = Math.sin(ang), x0 = -3;
    const zc = L * s + R + 0.2;
    const put = (pts: P2[], y = 0): V3[] => pts.map(([a, q]) => [x0 + a * c - q * s, y, zc + a * s + q * c] as V3);
    p.face(put(half(-1, gap)), 0.3, SH.edge, 0.6);
    p.face(put(belly(-1, gap), 0.03), 0.14, 0);
    p.face(put(half(1, gap)), 0.18, SH.edge, 0.6);
    p.face(put(belly(1, gap), 0.03), 0.075, 0);
    // a long white gleam along the top, and a short one running along it
    const run = (a0: number, a1: number) => [0, 1, 2, 3, 4].map((i) => p.pt(put([[a0 + ((a1 - a0) * i) / 4, R * 0.52]], 0.08)[0]));
    const g0 = -L - 1, g1 = L + 1, k = (u * 1.4) % 1.4, ga = g0 + (g1 - g0) * Math.min(1, k), gb = Math.min(g1, ga + 5);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round";
      const stroke = (q: [number, number][], lw: number) => { g.lineWidth = lw; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
      stroke(run(-L - 1, -2), 1.5);
      stroke(run(2, L + 1), 1.5);
      if (k < 1) stroke(run(ga, gb), 2.4);
    });
    // two tablets in front, the far one first
    tablet(p, 11, 4, 6.4);
    tablet(p, 0, 12, 6.4);
  },
};
