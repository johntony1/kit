// No ties yet: a striped necktie knotted under a shirt collar. Hover and the blade swings out and settles; a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ZK = 30; // height of the top of the knot

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
const at = (pts: [number, number][], y: number): V3[] => pts.map(([x, z]) => [x, y, z] as V3);

const BLADE: [number, number][] = [[-1.8, ZK - 5], [1.8, ZK - 5], [5, 4], [0, 0], [-5, 4]];
const KNOT: [number, number][] = [[-3.6, ZK], [3.6, ZK], [2, ZK - 5.4], [-2, ZK - 5.4]];

export const tie: Illustration = {
  k: "tie", name: "Tie", title: "No ties yet", body: "Ties you save or buy will hang here, ready for the next occasion.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 18, 8, 0.1);
    p.rotate("z", -0.62); // turned so it faces us
    // the collar: two wide points either side of the knot, and the band behind
    p.face(at([[-9, ZK + 2.4], [9, ZK + 2.4], [9, ZK - 0.6], [-9, ZK - 0.6]], -1.6), 0.08, 0);
    p.face(at([[-3, ZK + 3], [-10.5, ZK + 2.6], [-8, ZK - 6], [-2.4, ZK - 1]], 0.4), 0.22, 0);
    p.face(at([[3, ZK + 3], [10.5, ZK + 2.6], [8, ZK - 6], [2.4, ZK - 1]], 0.4), 0.14, 0);
    // the blade swings out round the knot and settles
    const ang = k * 0.26 * Math.sin(h * Math.PI * 2.4) * (1 - 0.6 * h) + h * 0.03 * Math.sin(t * 2.6);
    p.push();
    p.rotate("y", ang, [0, 0, ZK - 5]);
    p.face(at(BLADE, -0.9), 0.06, 0); // thickness behind
    p.face(at(BLADE, 0.6), 0.22, 0);
    // the stripes, cut on the diagonal, and the keeper seam down the middle
    for (const z of [8, 13, 18, 23]) p.line([[-5, 0.65, z - 2.4], [5, 0.65, z + 2.4]], 1, 0.75);
    p.line([[-5, 0.65, 4], [0, 0.65, 0.6], [5, 0.65, 4]], 1, 0.5);
    p.pop();
    // the knot over the blade, a fold across it
    p.face(at(KNOT, 1), 0.3, 0);
    p.line([[-2.6, 1.05, ZK - 3.6], [2.4, 1.05, ZK - 1.6]], 1, 0.6);
    const b = Math.max(0, (h - 0.65) / 0.35);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [-9, 1, 14], 4.4 * pop);
    }
  },
};
