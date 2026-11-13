// No savings yet: a stout money jar with a big currency label and a screw lid. Hover and the lid lifts off and tips back, a coin drops into the empty jar and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const R = 10.5, ZT = 20; // body radius, top of the shoulder
// the jar's outline from the floor up: [radius, height]
const BODY: [number, number][] = [[9, 0], [R, 1.6], [R, 17], [9.4, 19], [7.4, ZT], [7.4, 21.4]];

/** a solid of revolution, drawn as small quads back to front in the three face tones */
function lathe(p: Pen, prof: [number, number][], nu = 36) {
  const qs: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < nu; i++) {
    const u0 = (i / nu) * Math.PI * 2, u1 = ((i + 1) / nu) * Math.PI * 2, um = (u0 + u1) / 2;
    for (let j = 0; j < prof.length - 1; j++) {
      const [r0, z0] = prof[j], [r1, z1] = prof[j + 1];
      const L = Math.hypot(r1 - r0, z1 - z0), nr = (z1 - z0) / L, nz = -(r1 - r0) / L;
      const n: V3 = [Math.cos(um) * nr, Math.sin(um) * nr, nz];
      if (n[0] + n[1] + n[2] < -0.05) continue;
      const pts: V3[] = [[r0 * Math.cos(u0), r0 * Math.sin(u0), z0], [r0 * Math.cos(u1), r0 * Math.sin(u1), z0], [r1 * Math.cos(u1), r1 * Math.sin(u1), z1], [r1 * Math.cos(u0), r1 * Math.sin(u0), z1]];
      const m = pts.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4, a[2] + q[2] / 4] as V3, [0, 0, 0] as V3);
      qs.push({ d: m[0] + m[1] + m[2], pts: pts.map((q) => q.map((x, k) => m[k] + (x - m[k]) * 1.1) as V3), f: nz > 0.5 ? SH.top : n[1] >= n[0] ? SH.left : SH.right });
    }
  }
  qs.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
}
/** a point on the jar's wall: s across (positive to screen right), z up */
const wall = (s: number, z: number, r = R + 0.08): V3 => { const a = Math.PI / 4 - s / r; return [Math.cos(a) * r, Math.sin(a) * r, z]; };
const DOLLAR: [number, number][][] = [
  [[2.3, 3], [1, 3.9], [-1.2, 3.8], [-2.3, 2.6], [-1.6, 1], [1.6, -0.6], [2.4, -2.2], [1.3, -3.6], [-1, -3.8], [-2.4, -2.8]],
  [[0, 5.2], [0, -5.2]],
];

export const savingsjar: Illustration = {
  k: "savingsjar", name: "Savings jar", title: "No savings yet", body: "Put a little aside and your savings will start to fill this jar.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 25, 12, 0.12);
    lathe(p, BODY);
    // the label: a lit band round the front, edged with cuts, a big currency mark on it
    const band: V3[] = [];
    for (let i = 0; i <= 16; i++) band.push(wall(-8.6 + (17.2 * i) / 16, 5));
    for (let i = 16; i >= 0; i--) band.push(wall(-8.6 + (17.2 * i) / 16, 15));
    p.face(band, 0.22, 0);
    p.line(band.slice(0, 17), SH.edge, 0.6);
    p.line(band.slice(17), SH.edge, 0.6);
    for (const s of DOLLAR) p.line(s.map(([x, z]) => wall(x, 10 + z * 0.9, R + 0.14)), SH.edge, 1.6);
    // the open mouth, dark, seen once the lid is off
    const open = ease(clamp(h / 0.4));
    p.disc(0, 0, 21.45, 7.4, 0.02, 0);
    p.disc(0, 0, 21.46, 6.2, 0, SH.edge);
    // the coin: drops into the mouth once the lid is clear
    const c = clamp((h - 0.35) / 0.35);
    if (c > 0 && c < 1) {
      const z = 21.4 + 4.2 + 16 * (1 - c * c);
      const [x, y] = p.pt([0, 0, z]), [, ym] = p.pt([0, 6.2, 21.4]);
      p.screen((g) => {
        g.beginPath(); g.rect(x - 8, y - 8, 16, ym - y + 8); g.clip();
        g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = 0.6; g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.stroke();
      });
    }
    // the lid: a ridged screw cap that lifts and tips back over its far edge
    p.push();
    p.translate(-3 * open, -3 * open, 6 * open + h * Math.sin(t * 3) * 0.4);
    p.rotate("y", 0.28 * open, [0, 0, 21.4]);
    p.cylinder(0, 0, 21.4, 8.2, 3.4, { side: 0.22, top: 0.2, edge: 0 });
    for (let i = 1; i < 10; i++) {
      const a = -Math.PI / 4 + (Math.PI * i) / 10;
      p.line([[Math.cos(a) * 8.45, Math.sin(a) * 8.45, 22.2], [Math.cos(a) * 8.45, Math.sin(a) * 8.45, 24.2]], SH.edge, 0.6);
    }
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [Math.cos(a) * 8.4, Math.sin(a) * 8.2, 24.8] as V3; }), SH.edge, 0.6);
    p.pop();
    // the plus badge, tight to the jar's shoulder
    const b = clamp((h - 0.72) / 0.28);
    if (b > 0) {
      const pop = (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)) * 4.4;
      const [x, y] = p.pt([9, -5, 22]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, pop, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = pop * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - pop * 0.5, y); g.lineTo(x + pop * 0.5, y); g.moveTo(x, y - pop * 0.5); g.lineTo(x, y + pop * 0.5); g.stroke();
      });
    }
  },
};
