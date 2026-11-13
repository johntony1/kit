// No devices nearby: an earbuds case standing open, two round buds sitting in it and a pairing light on its front. Hover and the buds rise out of the case on their stems while the light blinks.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const W = 14, D = 5.5, ZS = 13.5; // half width, half depth, seam height, top
const cl = (x: number) => Math.min(1, Math.max(0, x));
const back = (x: number) => (x <= 0 ? 0 : 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2));

/** a quarter round corner from angle a0, centred at (cu, cv) */
const arc = (cu: number, cv: number, r: number, a0: number): P2[] =>
  Array.from({ length: 7 }, (_, i) => { const a = a0 + (i / 6) * (Math.PI / 2); return [cu + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
// the body: round bottom corners, flat at the top
const BODY: P2[] = [...arc(-W + 7, 7, 7, Math.PI), ...arc(W - 7, 7, 7, Math.PI * 1.5), [W, ZS], [-W, ZS]];

const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a counter clockwise profile at the front (y = D), pushed back to y = -D: its visible walls, then its face */
function ext(p: Pen, prof: P2[], front: number) {
  const n = prof.length;
  for (let i = 0; i < n; i++) {
    const [u0, v0] = prof[i], [u1, v1] = prof[(i + 1) % n], L = Math.hypot(u1 - u0, v1 - v0) || 1;
    const nu = (v1 - v0) / L, nv = -(u1 - u0) / L;
    const q: V3[] = [[u0, D, v0], [u1, D, v1], [u1, -D, v1], [u0, -D, v0]];
    if (facing(p, q) !== 0 && (nv > 0.2 || nu > 0.2)) p.face(q, nv > 0.55 ? 0.22 : 0.065, 0);
  }
  p.face(prof.map(([u, v]) => [u, D, v] as V3), front, SH.edge, 0.6);
}

export const bluetooth: Illustration = {
  k: "bluetooth", name: "Bluetooth", title: "No devices nearby", body: "Turn on your device and keep it close to pair it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lift = 5 * back(cl((h - 0.1) / 0.6));
    p.translate(0, 0, -12);
    p.scale(1.25);
    p.shadow(0, 0, 22, 9, 0.12);
    p.rotate("z", -0.5);
    // the lid, swung open on its hinge at the back: its dark inside faces us, lit rim on top
    p.push();
    p.rotate("x", -0.22, [0, -D, ZS]);
    p.box(-W, -D - 5, ZS, W * 2, 5, D * 2, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    p.clear([[-W + 1.6, -D + 0.03, ZS + 1.4], [W - 1.6, -D + 0.03, ZS + 1.4], [W - 1.6, -D + 0.03, ZS + D * 2 - 1.6], [-W + 1.6, -D + 0.03, ZS + D * 2 - 1.6]]);
    p.pop();
    // the body: its round cornered front, and a dark open top
    ext(p, BODY, 0.2);
    p.clear([[-W + 1.4, -D + 1.2, ZS + 0.02], [W - 1.4, -D + 1.2, ZS + 0.02], [W - 1.4, D - 1.2, ZS + 0.02], [-W + 1.4, D - 1.2, ZS + 0.02]]);
    // the two buds: bright round heads, rising out of the case on their stems
    for (const x of [-6.4, 6.4]) {
      if (lift > 0.2) p.box(x - 0.9, -0.9, ZS - 1, 1.8, 1.8, lift + 1, { top: 0.4, left: 0.3, right: 0.14, edge: 0 });
      p.cylinder(x, 0, ZS + lift, 3.4, 2.4, { side: 0.16, top: 0.45, edge: 0 });
      p.disc(x, 0, ZS + lift + 2.43, 1.2, 0.03);
    }
    // the seam under the rim, and the pairing light, blinking while hovered
    p.line([[-W, D + 0.04, ZS - 1.6], [W, D + 0.04, ZS - 1.6]], SH.edge, 0.9);
    const on = h > 0.1 && Math.sin(t * 8) > -0.2;
    p.dot([0, D + 0.06, 6.5], 1.5, on ? SH.glow : 0.04);
  },
};
