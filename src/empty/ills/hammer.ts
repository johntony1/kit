// Nothing to fix: a claw hammer over a nail in a block of wood. It lifts, swings down and taps the nail with a little burst of sparks, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per tap
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
type P2 = [number, number];
/** screen winding: > 0 when a face listed counter clockwise round its outward normal looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s > 0;
};
/** a flat shape in the x z plane (counter clockwise), made y0..y1 thick: lit walls on top, shaded walls to the side, then its front */
function prism(p: Pen, prof: P2[], y0: number, y1: number, front: number, top: number, side: number, cut = true) {
  for (let i = 0; i < prof.length; i++) {
    const [ax, az] = prof[i], [bx, bz] = prof[(i + 1) % prof.length];
    const q: V3[] = [[ax, y0, az], [ax, y1, az], [bx, y1, bz], [bx, y0, bz]];
    if (facing(p, q)) p.face(q, bx < ax ? top : side, 0);
  }
  const f = prof.map(([x, z]) => [x, y1, z] as V3).reverse();
  p.face(f, front, 0);
  if (cut) p.line([...f, f[0]], 1, 0.7);
}
// the head: a striking face at the bottom, a claw curling back at the top
const HEAD: P2[] = [[6.5, 1.5], [11.5, 1.5], [11.5, 10.5], [10.6, 12.4], [7.8, 14], [4.6, 17], [2.6, 18], [2.3, 16.8], [5.2, 13.2], [6.5, 10.5]];
const HANDLE: P2[] = [[-24, 5.6], [7, 5.8], [7, 10.2], [-24, 10.4]];

export const hammer: Illustration = {
  k: "hammer", name: "Hammer", title: "Nothing to fix", body: "No issues right now. Anything that needs fixing will appear here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // raised slowly, brought down fast, a tiny rebound, then rest on the nail
    const ang = u < 0.5 ? 0.62 * ease(u / 0.5) : u < 0.68 ? 0.62 * (1 - ((u - 0.5) / 0.18) ** 2) : u < 0.8 ? 0.05 * Math.sin(((u - 0.68) / 0.12) * Math.PI) : 0;
    p.translate(0, 0, -6);
    p.shadow(4, 0, 22, 10, 0.1);
    p.rotate("z", -0.62); // laid out facing us: x to the right, y toward us
    p.translate(2, 0, 0);
    // the block of wood, with a grain line, and the nail standing in it
    p.box(1, -6, -6, 16, 12, 6, { top: 0.24, left: 0.12, right: 0.06, edge: 0 });
    p.line([[1, 6.03, -3.5], [17, 6.03, -2.8]], 1, 0.7);
    p.box(8.5, -0.5, 0, 1, 1, 1.5, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.disc(9, 0, 1.5, 1.6, 0.3);
    // the hammer, swinging about the hand
    p.push();
    p.rotate("y", -ang, [-22, 0, 8]);
    prism(p, HANDLE, -1.8, 1.8, 0.3, 0.3, 0.1, false);
    p.line([[-16, 1.83, 5.6], [-16, 1.83, 10.4]], 1, 0.9);
    prism(p, HEAD, -2.8, 2.8, 0.24, 0.3, 0.07);
    p.pop();
    // sparks right after the hit
    if (u > 0.67 && u < 0.84) {
      const k = (u - 0.67) / 0.17, [x, y] = p.pt([9, 3, 1.2]), r0 = 3 + k * 4, r1 = r0 + 3.2 * (1 - k);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath();
        for (const a of [-2.8, -2.4, -0.75, -0.35]) { g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); }
        g.stroke();
      });
    }
  },
};
