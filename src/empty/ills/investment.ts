// Nothing invested yet: a short stack of coins with a small sprout on top. Hover and the sprout shoots up and opens two broad leaves; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
const CR = 10, CH = 2.4, NC = 3; // coin radius, thickness, coins in the stack
const A: V3 = [Math.SQRT1_2, -Math.SQRT1_2, 0]; // level, across the screen

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
const front = (r: number, z: number): V3[] => Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
/** a leaf in the plane facing us, from base b, leaning out to side s at angle up, length len */
function leaf(p: Pen, b: V3, s: 1 | -1, up: number, len: number) {
  const dx = Math.cos(up) * s, dz = Math.sin(up);
  const P2 = (q: number, w: number): V3 => [b[0] + A[0] * (dx * q - dz * w * s), b[1] + A[1] * (dx * q - dz * w * s), b[2] + dz * q + dx * w * s];
  const N = 12, wid = len * 0.42;
  const edge1 = Array.from({ length: N + 1 }, (_, i) => { const q = i / N; return P2(q * len, Math.sin(q * Math.PI) * wid * (1 - q * 0.25)); });
  const edge2 = Array.from({ length: N + 1 }, (_, i) => { const q = 1 - i / N; return P2(q * len, -Math.sin(q * Math.PI) * wid * 0.55 * (1 - q * 0.25)); });
  const pts = [...edge1, ...edge2];
  p.face(pts, 0.32, SH.edge, 0.6);
  p.line([...pts, pts[0]], SH.edge, 0.7);
  p.line([P2(0.1 * len, 0), P2(0.85 * len, 0)], SH.edge, 0.6);
}

export const investment: Illustration = {
  k: "investment", name: "Investment", title: "Nothing invested yet", body: "Make your first investment and watch it grow here over time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const g = back(clamp(h / 0.75)), sway = h * Math.sin(t * 2.2) * 0.06;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 25, 12.5, 0.12);
    // the coins, each a little off true, rims cut
    const off = [[0, 0], [0.5, -0.4], [-0.3, 0.3]];
    off.forEach(([x, y], i) => {
      p.push(); p.translate(x, y, 0);
      p.cylinder(0, 0, i * CH, CR, CH, { side: 0.12, top: 0.22, edge: 0 });
      p.line(front(CR, i * CH), SH.edge, 0.6);
      p.pop();
    });
    const Z = NC * CH + 0.03;
    p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [-0.3 + Math.cos(a) * (CR - 1.8), 0.3 + Math.sin(a) * (CR - 1.8), Z] as V3; }), SH.edge, 0.6);
    // a little mound of soil where the sprout comes up
    p.cylinder(-0.3, 0.3, Z - 0.03, 3, 0.9, { side: 0.065, top: 0.09, edge: 0 });
    // the sprout: a stem and two leaves, small at rest, tall and open on hover
    const sh = 3 + 7 * g, base: V3 = [-0.3, 0.3, Z + 0.9];
    p.push();
    p.rotate("x", sway, base); p.rotate("y", sway * 0.6, base);
    p.box(base[0] - 0.55, base[1] - 0.55, base[2], 1.1, 1.1, sh, { top: 0.3, left: 0.28, right: 0.14, lw: 0.5 });
    const tip: V3 = [base[0], base[1], base[2] + sh];
    leaf(p, tip, -1, 0.55, 4 + 5.5 * g);
    leaf(p, tip, 1, 0.75, 3.4 + 4.8 * g);
    p.pop();
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) badge(p, [9, -9, 22], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
