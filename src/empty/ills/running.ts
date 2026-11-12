// No runs yet: a running shoe seen from the side. Hover and it kicks up onto its toe and bounces along, speed lines trailing behind.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const YAW = -0.5, D = 4.2; // the turn of the shoe, half its width
// the shoe from the side, toe to the right: sole, toe box, laces up to the collar, heel tab
const SHOE: P2[] = [[-14, 0], [13, 0], [15.6, 1.4], [16.2, 4], [14.6, 6.6], [10.5, 8.4], [5.6, 10.8], [2, 14.2], [-0.6, 16.6], [-4.6, 16.2], [-9.4, 15.2], [-12.6, 18.4], [-14.6, 17.4], [-14.2, 11], [-15.2, 5.4], [-15.2, 1.4]];
const SOLE: P2[] = [[-14, 0], [13, 0], [15.6, 1.4], [16.1, 3.4], [-15.3, 3.4], [-15.2, 1.4]];

const wire = (p: Pen, pts: V3[], w: number, v: number) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((c) => {
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = w; c.lineCap = "round"; c.stroke();
  });
};
/** a profile in [x, z] pushed through from y0 (back) to y1 (front); walls shaded by where they face */
function extrude(p: Pen, prof: P2[], y0: number, y1: number, front: number) {
  const n = prof.length, kx = Math.cos(YAW) + Math.sin(YAW);
  for (let i = 0; i < n; i++) {
    const [xa, za] = prof[i], [xb, zb] = prof[(i + 1) % n];
    const L = Math.hypot(xb - xa, zb - za) || 1, nx = (zb - za) / L, nz = -(xb - xa) / L;
    if (nx * kx + nz <= 0) continue;
    p.face([[xa, y0, za], [xb, y0, zb], [xb, y1, zb], [xa, y1, za]], nz > 0.3 ? 0.26 : 0.065, 0);
  }
  p.face(prof.map(([x, z]) => [x, y1, z] as V3), front, SH.edge, 0.7);
}

export const running: Illustration = {
  k: "running", name: "Running shoe", title: "No runs yet", body: "Head out for a run and your distance and pace will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl(h / 0.5)), step = Math.abs(Math.sin(t * 4.2));
    const tip = k * (0.3 + 0.12 * Math.sin(t * 4.2 * 2)), up = k * (2 + 3 * step);
    p.translate(0, 0, -10);
    p.shadow(0, 1, 26 - up, 10, 0.12);
    p.rotate("z", YAW);
    // the shoe turns about its toe: every point of the side view is tipped, then lifted
    const c = Math.cos(tip), s = Math.sin(tip);
    const tf = ([x, z]: P2): P2 => [12 + (x - 12) * c + z * s, -(x - 12) * s + z * c + up];
    const at = (x: number, z: number): V3 => { const q = tf([x, z]); return [q[0], D + 0.03, q[1]]; };
    // speed lines behind the heel
    const sp = cl((h - 0.35) / 0.4);
    if (sp > 0) for (let i = 0; i < 3; i++) {
      const u = (t * 1.3 + i * 0.37) % 1, x = -19 - u * 9, z = 4 + i * 5.5;
      wire(p, [[x, 0, z + up], [x - 5 - i, 0, z + up]], 1.1, Math.round(255 * sp * Math.sin(u * Math.PI)));
    }
    extrude(p, SHOE.map(tf), -D, D, 0.12);
    // the sole, bright, with a cut above it and treads below
    p.face(SOLE.map(([x, z]) => at(x, z)), 0.3, 0);
    p.line([at(-15.3, 3.5), at(16.1, 3.5)], SH.edge, 0.9);
    for (let x = -12; x <= 12; x += 3) p.line([at(x, 0), at(x + 0.8, 1.5)], SH.edge, 0.6);
    // the toe cap, the side stripes and the laces
    p.line([at(9.6, 3.6), at(10.8, 6.4), at(10.5, 8.3)], SH.edge, 0.8);
    for (const x of [-6.5, -2.4]) p.face([at(x, 3.7), at(x + 2.2, 3.7), at(x + 6, 11.4), at(x + 3.8, 11.4)], 0.3, 0);
    for (let i = 0; i < 4; i++) { const f = i / 3, x = 6.2 - f * 6.4, z = 10 + f * 5.6; p.line([at(x, z), at(x - 2.4, z - 2.6)], SH.edge, 0.9); }
    p.line([at(-14.3, 11.5), at(-11.2, 12.4), at(-9.6, 15)], SH.edge, 0.7);
  },
};
