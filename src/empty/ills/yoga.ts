// No sessions yet: a yoga mat, half rolled. Hover and it rolls out flat toward you, the roll shrinking as it goes.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const N = 48, W = 10; // half the mat's width
const ring = (x: number, r: number): V3[] => Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [x, Math.cos(a) * r, Math.sin(a) * r] as V3; });

/** a drum lying along x from x0 (far) to x1 (near): the side it shows, then its near end */
function drum(p: Pen, x0: number, x1: number, r: number, side: number, cap: number) {
  const far = ring(x0, r), near = ring(x1, r), o = p.pt([x0, 0, 0]), e = p.pt([x1, 0, 0]);
  const dx = e[0] - o[0], dy = e[1] - o[1];
  const q = far.map((v) => p.pt(v)), cr = q.map(([x, y]) => dx * (y - o[1]) - dy * (x - o[0]));
  const a = cr.indexOf(Math.max(...cr)), b = cr.indexOf(Math.min(...cr));
  const walk = (from: number, to: number) => { const out: number[] = []; for (let i = from; ; i = (i + 1) % N) { out.push(i); if (i === to) break; } return out; };
  let idx = walk(a, b);
  const mid = q[idx[idx.length >> 1]];
  if ((mid[0] - o[0]) * dx + (mid[1] - o[1]) * dy > 0) idx = walk(b, a);
  p.face([...idx.map((i) => far[i]), ...idx.slice().reverse().map((i) => near[i])], side, SH.edge, 0.55);
  p.face(near, cap, SH.edge, 0.6);
}

export const yoga: Illustration = {
  k: "yoga", name: "Yoga mat", title: "No sessions yet", body: "Start a session and it will be saved here for next time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const u = ease(cl(h / 0.8)), settle = cl((h - 0.8) / 0.2);
    const end = -4 + 17 * u, R = 5.6 - 2.6 * u; // where the flat part ends, the roll's radius
    p.translate(0, 0, -5);
    p.rotate("z", 0.16);
    p.translate(0, 4, 0);
    p.shadow(0, -4, 28, 14, 0.11);
    // the flat part, with two stripes across its far end
    p.box(-W, -24, 0, W * 2, end + 24, 0.8, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    p.line([[-W, -20.5, 0.83], [W, -20.5, 0.83]], SH.edge, 1.1);
    p.line([[-W, -18, 0.83], [W, -18, 0.83]], SH.edge, 0.7);
    // the roll, its end showing the spiral
    p.push();
    p.translate(0, end + R * 0.25, R + 0.4 + settle * Math.sin(t * 3) * 0.15);
    drum(p, -W, W, R, 0.12, 0.26);
    const turns = 2.6 - 1.2 * u, sp: V3[] = [];
    for (let i = 0; i <= 60; i++) { const f = i / 60, a = -Math.PI / 2 - f * turns * Math.PI * 2, r = R * (1 - 0.82 * f); sp.push([W + 0.03, Math.cos(a) * r, Math.sin(a) * r]); }
    p.line(sp, SH.edge, 0.8);
    // a strap mark round the roll
    p.line(ring(-W + 5, R + 0.03).filter((_, j) => j <= 18 || j >= 42), SH.edge, 0.7);
    p.pop();
    // dust kicked up as it rolls
    const d = Math.sin(cl(h / 0.8) * Math.PI);
    if (d > 0.05) for (let i = 0; i < 4; i++) p.dot([-7 + i * 5, end + R * 1.7 + 2 + (i % 2) * 2, 0.8 + (i % 3) * 1.4 * d], 0.8, d);
  },
};
