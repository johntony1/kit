// No certificates issued: an open padlock with an empty rosette on its front. Hover and the shackle swings round and drops shut, the rosette fills and a tick is drawn in it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const X = 10, Y = 4.5, Z = 17; // half width, half depth, height of the body
const LX = 5.6, LEG = 4.4; // leg centre, straight leg length

/** the shackle: a round bar bent into a U, drawn as a tube. lift raises it; the left leg stays in its hole */
function shackle(p: Pen, lift: number) {
  const top = Z + LEG + lift, path: V3[] = [[LX, 0, Z + lift + 0.5], [LX, 0, top]];
  for (let i = 1; i < 16; i++) { const a = (Math.PI * i) / 16; path.push([Math.cos(a) * LX, 0, top + Math.sin(a) * LX]); }
  path.push([-LX, 0, top], [-LX, 0, Z + 0.5]);
  const q = path.map((v) => p.pt(v));
  p.screen((c) => {
    c.lineCap = "round"; c.lineJoin = "round";
    for (const [w, v] of [[4.6, 0], [3.2, 0.75]]) {
      const n = Math.round(v * 255);
      c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = w;
      c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    }
  });
}

export const ssl: Illustration = {
  k: "ssl", name: "Certificate lock", title: "No certificates issued", body: "Issue a certificate and connections to your site will be encrypted.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const shut = ease(cl(h / 0.55)), seal = ease(cl((h - 0.5) / 0.25)), tick = cl((h - 0.68) / 0.3);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 11, 0.12);
    p.rotate("z", -0.3);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.22, left: 0.12, right: 0.065, lw: 0.6 });
    const fy = Y + 0.03, C: V3 = [0, fy + 0.02, 9.6];
    // the rosette's two ribbon tails, then its scalloped disc
    for (const s of [-1, 1]) p.face([[s * 0.4, fy, 6], [s * 4, fy, 6], [s * 4.6, fy, 0.9], [s * 2.6, fy, 2.2], [s * 1.2, fy, 0.9]], 0.26, SH.edge, 0.5);
    p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2, r = i % 2 ? 5.9 : 5; return [C[0] + Math.cos(a) * r, C[1], C[2] + Math.sin(a) * r] as V3; }), 0.03 + 0.5 * seal, SH.edge, 0.6);
    p.ringV("y", [C[0], C[1] + 0.02, C[2]], 3.6, 0, SH.edge, 0.5);
    if (tick > 0) {
      const pts: V3[] = [[-1.9, C[1] + 0.04, C[2] + 0.1], [-0.6, C[1] + 0.04, C[2] - 1.4], [2, C[1] + 0.04, C[2] + 1.6]];
      const a = cl(tick / 0.4), b = cl((tick - 0.4) / 0.6);
      const mid: V3 = [pts[0][0] + (pts[1][0] - pts[0][0]) * a, pts[0][1], pts[0][2] + (pts[1][2] - pts[0][2]) * a];
      const line: V3[] = [pts[0], mid];
      if (b > 0) line.push([pts[1][0] + (pts[2][0] - pts[1][0]) * b, pts[1][1], pts[1][2] + (pts[2][2] - pts[1][2]) * b]);
      p.screen((g) => {
        const q = line.map((v) => p.pt(v));
        g.strokeStyle = "#000"; g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      });
    }
    // the holes on top, and the shackle: open and swung aside at rest
    for (const x of [-LX, LX]) p.disc(x, 0, Z + 0.02, 2, 0.02);
    p.push();
    p.rotate("z", -1.05 * (1 - shut), [-LX, 0, 0]);
    shackle(p, 5 * (1 - shut));
    p.pop();
  },
};
