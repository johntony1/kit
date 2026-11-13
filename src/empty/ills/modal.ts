// Nothing to show: an app window, dimmed, with a bright dialog card in front of it. Hover and the dialog lifts out toward you and grows a little, and its button lights up.
import { type Illustration, type Pen, type V3 } from "../dots";

const facing = (p: Pen, q: V3[]) => {
  const s = q.map((v) => p.pt(v));
  let a = 0;
  for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; }
  return a;
};
const depth = (q: V3[]) => q.reduce((s, v) => s + v[0] + v[1] + v[2], 0) / q.length;
/** a slab: the outline B pushed along d. The sides it shows are shaded by where they face, then the cap */
function prism(p: Pen, B: V3[], d: V3, cap: number) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < B.length; i++) {
    const a = B[i], b = B[(i + 1) % B.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  if (nx * d[0] + ny * d[1] + nz * d[2] < 0) B = B.slice().reverse();
  const F = B.map(([x, y, z]) => [x + d[0], y + d[1], z + d[2]] as V3);
  const sides = B.map((b, i) => [b, B[(i + 1) % B.length], F[(i + 1) % B.length], F[i]] as V3[]).filter((q) => facing(p, q) > 0).sort((a, b) => depth(a) - depth(b));
  for (const q of sides) {
    const e = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]];
    const n = [e[1] * d[2] - e[2] * d[1], e[2] * d[0] - e[0] * d[2], e[0] * d[1] - e[1] * d[0]], l = Math.hypot(n[0], n[1], n[2]) || 1;
    p.face(q, n[2] / l > 0.55 ? 0.16 : n[1] > n[0] ? 0.1 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
const rect = (x0: number, x1: number, z0: number, z1: number, y: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);

export const modal: Illustration = {
  k: "modal", name: "Modal", title: "Nothing to show", body: "When there is something that needs your attention, it will open here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 2, 30, 13, 0.12);
    p.rotate("z", -0.42);
    const W = 19, Z = 29;
    // the window: a thick panel, its face dimmed behind the dialog
    p.box(-W, -3, 0, W * 2, 3, Z, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.face(rect(-W + 1.6, W - 1.6, 1.6, Z - 4.5, 0.03), 0.03, 0);
    // the title bar: a lit strip along the top of the face, with three dark dots
    p.face(rect(-W, W, Z - 4.5, Z, 0.03), 0.24, 0);
    p.line([[-W, 0.05, Z - 4.5], [W, 0.05, Z - 4.5]], 1, 0.6);
    for (let i = 0; i < 3; i++) p.dot([-W + 2.8 + i * 2.8, 0.06, Z - 2.25], 0.9, 0);
    // the dialog card: lifts toward us and grows a little, with a bounce
    const k = back(Math.min(1, h * 1.1));
    p.push();
    p.translate(0, 0.4 + 4.5 * k, 0);
    p.scale(0.9 + 0.1 * k, [0, 0, 12.5]);
    prism(p, rect(-12.5, 12.5, 3.5, 21.5, 0), [0, 2.2, 0], 0.3);
    const y = 2.24;
    p.line([...rect(-12.5, 12.5, 3.5, 21.5, y), [-12.5, y, 3.5]], 1, 0.6);
    // a heading, a close cross, two lines of text
    p.line([[-9.5, y, 18], [1.5, y, 18]], 1, 1.1);
    p.line([[7.6, y, 17], [9.6, y, 19]], 1, 0.75); p.line([[7.6, y, 19], [9.6, y, 17]], 1, 0.75);
    p.line([[-9.5, y, 13.2], [8, y, 13.2]], 1, 0.9);
    // the button: a dark block, its label lights up once the dialog is out
    p.face(rect(1.5, 10, 5.6, 8.6, y + 0.02), 0.035, 0);
    if (h > 0.55) {
      const a = p.pt([3.6, y + 0.04, 7.1]), b = p.pt([7.9, y + 0.04, 7.1]);
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.1; g.lineCap = "round"; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
    }
    p.pop();
  },
};
