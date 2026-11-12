// No workouts yet: a dumbbell resting on the floor. Hover and it lifts off and pumps up and down, tipping a little with each rep.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const N = 48;
const ring = (x: number, r: number): V3[] => Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [x, Math.cos(a) * r, Math.sin(a) * r] as V3; });

/** a drum lying along x from x0 (far) to x1 (near): the side it shows, then its near end */
function drum(p: Pen, x0: number, x1: number, r: number, side: number, cap: number) {
  const far = ring(x0, r), near = ring(x1, r), o = p.pt([x0, 0, 0]), e = p.pt([x1, 0, 0]);
  const dx = e[0] - o[0], dy = e[1] - o[1];
  // the two points where the outline leaves the far rim, and the half of the rim between them that faces away
  const q = far.map((v) => p.pt(v)), cr = q.map(([x, y]) => dx * (y - o[1]) - dy * (x - o[0]));
  const a = cr.indexOf(Math.max(...cr)), b = cr.indexOf(Math.min(...cr));
  const walk = (from: number, to: number) => { const out: number[] = []; for (let i = from; ; i = (i + 1) % N) { out.push(i); if (i === to) break; } return out; };
  let idx = walk(a, b);
  const mid = q[idx[idx.length >> 1]];
  if ((mid[0] - o[0]) * dx + (mid[1] - o[1]) * dy > 0) idx = walk(b, a);
  p.face([...idx.map((i) => far[i]), ...idx.slice().reverse().map((i) => near[i])], side, SH.edge, 0.55);
  p.face(near, cap, SH.edge, 0.6);
}

export const dumbbell: Illustration = {
  k: "dumbbell", name: "Dumbbell", title: "No workouts yet", body: "Log your first workout and your training history will build up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl(h / 0.5)), rep = h * Math.sin(t * 3.4);
    const lift = 9 * k + 3 * rep * k;
    p.translate(0, 0, -11);
    p.scale(1.22);
    p.shadow(-11, 0, 13 - lift * 0.3, 7, 0.12); p.shadow(11, 0, 13 - lift * 0.3, 7, 0.12);
    p.rotate("z", -0.12);
    p.translate(0, 0, 8 + lift);
    p.rotate("y", 0.12 * rep * k);
    // far end, the handle, near end: each a stack of drums drawn back to front
    drum(p, -16, -14.8, 2.4, 0.2, 0.1);
    drum(p, -14.8, -12.2, 6, 0.2, 0.07);
    drum(p, -12.2, -9, 8, 0.2, 0.07);
    drum(p, -9, -7.8, 3, 0.14, 0.1);
    drum(p, -7.8, 7.8, 1.6, 0.24, 0.1);
    for (let i = -2; i <= 2; i++) p.line(ring(i * 2, 1.62).filter((_, j) => j <= 18 || j >= 42), SH.edge, 0.5); // the grip's knurls
    drum(p, 7.8, 9, 3, 0.14, 0.1);
    drum(p, 9, 12.2, 8, 0.2, 0.07);
    p.line([...ring(12.22, 6.3), ring(12.22, 6.3)[0]], SH.edge, 0.7);
    drum(p, 12.2, 14.8, 6, 0.2, 0.07);
    drum(p, 14.8, 16, 2.4, 0.2, 0.3);
  },
};
