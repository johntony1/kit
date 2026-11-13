// No prices set: a big chunky price tag lying on the floor, a string looped through its hole and a currency mark on its face. Hover and the tag hops up and turns toward us, and a plus badge pops in.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const T = 2; // thickness
// the tag's outline, [x, y], counter clockwise from above: the pointed end at -x, the square end at +x
const TAG: [number, number][] = [[-18, 0], [-9, -10], [15, -10], [15, 10], [-9, 10]];

export const pricetag: Illustration = {
  k: "pricetag", name: "Price tag", title: "No prices set", body: "Add a price to your first product and it will appear here, ready to sell.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -4);
    p.shadow(0, 0, 30, 15, 0.12);
    const k = clamp(h / 0.6), hop = Math.sin(Math.PI * k) * 5 + ease(k) * 1.5 + h * Math.sin(t * 2.6) * 0.4;
    p.push();
    p.translate(0, 0, hop);
    p.rotate("x", -0.45 - 0.25 * ease(k), [0, 0, 0]);
    p.rotate("z", -0.12 * ease(k));
    // the rim: the walls facing us
    for (let i = 0; i < TAG.length; i++) {
      const [ax, ay] = TAG[i], [bx, by] = TAG[(i + 1) % TAG.length];
      const nx = by - ay, ny = -(bx - ax); // outward for a counter clockwise outline
      if (nx + ny <= 0) continue;
      p.face([[ax, ay, 0], [bx, by, 0], [bx, by, T], [ax, ay, T]], ny >= nx ? SH.left : SH.right, 0);
    }
    p.face(TAG.map(([x, y]) => [x, y, T] as V3), 0.22, 0);
    const z = T + 0.03;
    // the hole with its bright ring, near the point
    const ring = (r: number): V3[] => Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [-10 + Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
    p.face(ring(2.8), 0.34, 0);
    p.clear(ring(1.4));
    // the currency mark, big, as cuts
    const S: [number, number][] = [[2.3, 3], [1, 3.9], [-1.2, 3.8], [-2.3, 2.6], [-1.6, 1], [1.6, -0.6], [2.4, -2.2], [1.3, -3.6], [-1, -3.8], [-2.4, -2.8]];
    const at = ([a, b]: [number, number]): V3 => [4 - b * 1.45, -a * 1.45, z]; // the mark reads along the tag
    p.line(S.map(at), SH.edge, 1.4);
    p.line([at([0, 5.4]), at([0, -5.4])], SH.edge, 1.4);
    // the string: a loop through the hole, trailing off the point
    const q = ([[-10, 0, z + 0.2], [-14.5, -3, z + 1.2], [-20.5, -2, z + 0.4], [-23.5, 4, 0.4], [-18.5, 8, 0.6]] as V3[]).map((v) => p.pt(v));
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(q[0][0], q[0][1]);
      for (let i = 1; i < q.length - 1; i++) g.quadraticCurveTo(q[i][0], q[i][1], (q[i][0] + q[i + 1][0]) / 2, (q[i][1] + q[i + 1][1]) / 2);
      g.stroke();
    });
    p.pop();
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) {
      const r = (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)) * 4.4;
      const [x, y] = p.pt([15, -10, 9]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
