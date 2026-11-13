// No messages read: one thick speech bubble standing up with a bold tick on its face. Hover and a second tick draws in beside it, read.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 34, H = 24, R = 8, Y0 = -4; // bubble width, height, corner radius, back of the slab

// a rounded rectangle with a tail at its lower left, in the x-z plane, as [x, z] pairs
function bubble(): [number, number][] {
  const pts: [number, number][] = [[R, 0], [0, -7], [R + 9, 0]];
  const corner = (cx: number, cz: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (Math.PI / 2) * (i / 6); pts.push([cx + Math.cos(a) * R, cz + Math.sin(a) * R]); } };
  corner(W - R, R, -Math.PI / 2); corner(W - R, H - R, 0); corner(R, H - R, Math.PI / 2); corner(R, R, Math.PI);
  return pts.map(([u, v]) => [u - W / 2, v - H / 2]);
}

// the part of a polyline up to fraction k of its length
function part(pts: [number, number][], k: number) {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let left = k * seg.reduce((a, b) => a + b, 0);
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i]);
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
    left -= seg[i];
  }
  return out;
}

function tick(p: Pen, dx: number, k: number) {
  if (k <= 0.01) return;
  const pts = part([[-7 + dx, 0.5], [-3 + dx, -3.5], [5 + dx, 5]], k);
  p.line(pts.map(([u, v]) => [u, 0.08, v] as V3), SH.edge, 1.7);
}

export const readreceipt: Illustration = {
  k: "readreceipt", name: "Read receipt", title: "No messages read", body: "When someone opens a message you sent, it will be marked as read here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -1);
    p.push(); p.translate(0, 0, -19); p.shadow(0, 1, 26, 8, 0.1); p.pop();
    const hop = h > 0.85 ? Math.sin(t * 3) * 0.4 : 0;
    p.translate(0, 0, hop);
    p.rotate("z", -0.55);
    const shape = bubble();
    const at = (y: number) => shape.map(([u, v]) => [u, y, v] as V3);
    p.face(at(Y0), SH.right, SH.edge, 0.55);
    for (let y = Y0 + 0.4; y < 0; y += 0.4) p.face(at(y), 0.08, 0);
    p.face(at(0), 0.24, SH.edge, 0.65);
    // the ticks: one at rest, the second draws in on hover
    const k = easeInOut(Math.min(1, h * 1.4));
    const shift = -3 * k;
    tick(p, shift, 1);
    tick(p, shift + 6, k);
  },
};
