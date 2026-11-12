// No furniture saved: a simple two seat sofa seen from the front and a little to one side: a tall back, two round topped arms, two seat cushions. Hover and it gives a little hop and settles while two sparkles blink.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const DX = 3.4, DY = 2.6; // one step back into the picture: up and to the right
/** a box front from (u0, v0) to (u1, v1), its top corners rounded by r */
const front = (u0: number, v0: number, u1: number, v1: number, r: number): P2[] => {
  const out: P2[] = [[u0, v0], [u1, v0]];
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); out.push([u1 - r + Math.cos(a) * r, v1 - r + Math.sin(a) * r]); }
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 + (i / 6) * (Math.PI / 2); out.push([u0 + r + Math.cos(a) * r, v1 - r + Math.sin(a) * r]); }
  return out;
};
/** a front pushed back by k steps and made d steps deep: the top and side we can see, then the front with a cut round it */
function slab(p: Pen, pts: P2[], k: number, d: number, face: number) {
  const q = pts.map(([u, v]) => [u + DX * k, v + DY * k] as P2);
  // walls in runs of one tone, so each reads as one surface
  let run: P2[] = [], tone = 0;
  const flush = () => { if (run.length > 1) p.face([...run.map(B), ...run.slice().reverse().map(([x, y]) => B([x + DX * d, y + DY * d]))], tone, 0); run = []; };
  for (let i = 0; i < q.length; i++) {
    const [x0, y0] = q[i], [x1, y1] = q[(i + 1) % q.length];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = (y1 - y0) / L, ny = -(x1 - x0) / L;
    if (nx * DX + ny * DY <= 0.001) { flush(); continue; }
    const tn = ny > 0.45 ? 0.28 : 0.06;
    if (run.length && tn !== tone) flush();
    if (!run.length) { run.push([x0, y0]); tone = tn; }
    run.push([x1, y1]);
  }
  flush();
  p.face(q.map(B), face, 0);
  p.line([...q, q[0]].map(B), SH.edge, 0.8);
}

export const sofa: Illustration = {
  k: "sofa", name: "Sofa", title: "No furniture saved", body: "Save a piece of furniture and it will sit here until you are ready.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.push(); p.translate(0, 0, -19); p.shadow(0, 0, 30, 12, 0.12); p.pop();
    // a hop: up, down, a small second bounce
    const k = Math.min(1, h * 1.2);
    p.translate(-K * 2, K * 2, -1 + (k < 0.6 ? Math.sin((k / 0.6) * Math.PI) * 4.5 : Math.sin(((k - 0.6) / 0.4) * Math.PI) * 1.2));
    // the legs, then the back: tall and wide, behind everything
    for (const u of [-22.5, 19.5]) p.face([[u, -17.5], [u + 3, -17.5], [u + 3, -14], [u, -14]].map((q) => B(q as P2)), 0.26, 0);
    p.face([[23.5, -15.6], [26, -15.6], [26, -12.5], [23.5, -12.5]].map((q) => B(q as P2)), 0.12, 0);
    slab(p, front(-20, -6, 20, 14.5, 3), 1.25, 0.75, 0.12);
    // the seat: its front, and the two cushions on top, parted down the middle
    p.face([[-17, -14], [17, -14], [17, -4.5], [-17, -4.5]].map((q) => B(q as P2)), 0.062, 0);
    const top: P2[] = [[-17, -4.5], [17, -4.5], [17 + DX * 1.25, -4.5 + DY * 1.25], [-17 + DX * 1.25, -4.5 + DY * 1.25]];
    p.face(top.map(B), 0.3, 0);
    p.line([...top, top[0]].map(B), SH.edge, 0.8);
    p.line([[0, -14], [0, -4.5], [DX * 1.25, -4.5 + DY * 1.25], [DX * 1.25, 14.5 + DY * 1.25]].map((q) => B(q as P2)), SH.edge, 1);
    // the arms, in front
    slab(p, front(-25, -14, -16.5, 3.5, 3.4), 0, 1.3, 0.13);
    slab(p, front(16.5, -14, 25, 3.5, 3.4), 0, 1.3, 0.13);
    // two sparkles above the back once it lands
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) for (const [u, v, ph] of [[-19, 22, 0], [22, 24, 2.1]]) p.dot(B([u, v]), b * (1.3 + 0.5 * Math.sin(t * 3.4 + ph)), 1);
  },
};
