// Nothing stitched yet: a classic sewing machine seen from the side, a C shaped arm over a flat bed with a clear gap under it, a big hand wheel on the right and the needle down on the left. The needle runs up and down and the wheel turns.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
type P2 = [number, number];
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s > 0;
};
/** a flat shape in the x z plane made y0..y1 thick: lit walls on top, shaded walls to the side, then its front */
function prism(p: Pen, prof: P2[], y0: number, y1: number, front: number, top: number, side: number) {
  for (let i = 0; i < prof.length; i++) {
    const [ax, az] = prof[i], [bx, bz] = prof[(i + 1) % prof.length];
    const q: V3[] = [[ax, y0, az], [ax, y1, az], [bx, y1, bz], [bx, y0, bz]];
    if (facing(p, q)) p.face(q, bx < ax ? top : side, 0);
  }
  p.face(prof.map(([x, z]) => [x, y1, z] as V3).reverse(), front, 0);
}
// the body: a pillar on the right, the arm across the top with a rounded shoulder, the head hanging down on the left
const BODY: P2[] = [[6, 3], [14, 3], [14, 20], [13, 23], [10.5, 25], [-13, 25], [-15.5, 23.5], [-16, 21], [-16, 12], [-10, 12], [-10, 19], [4.5, 19], [6, 17.5]];

export const sewingmachine: Illustration = {
  k: "sewingmachine", name: "Sewing machine", title: "Nothing stitched yet", body: "Start your first piece and it will be stitched together here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, c = u * 2; // two stitches per loop
    const lift = 3 * (0.5 + 0.5 * Math.cos(c * Math.PI * 2)); // how high the needle is lifted
    p.translate(-1, 0, -12);
    p.shadow(0, 0, 32, 13, 0.12);
    p.rotate("z", -0.5);
    // the bed: a thin slab, darker than the body so the body stands off it
    p.box(-21, -7, 0, 39, 14, 3, { top: 0.12, left: 0.065, right: 0.05, edge: 0 });
    // the spool on its pin on top of the arm
    p.box(-0.4, -0.4, 25, 0.8, 0.8, 2, { top: 0.3, left: 0.3, right: 0.2, edge: 0 });
    p.cylinder(0, 0, 26.5, 2.6, 4.4, { side: 0.3, top: 0.26, edge: 0 });
    // the body: a lit top, a lit front, its outer side in shade, a cut where it stands on the bed
    prism(p, BODY, -4.5, 4, 0.22, 0.3, 0.065);
    p.line([[6, 4.03, 3.2], [14, 4.03, 3.2]], SH.edge, 0.9);
    // the needle bar and the needle, sliding up and down, and the presser foot
    p.box(-13.9, -0.6, 5.5 + lift, 1.8, 1.8, 12 - 5.5 - lift, { top: 0.4, left: 0.36, right: 0.14, edge: 0 });
    const [nx, ny] = p.pt([-13, 0.3, 5.6 + lift]), [mx, my] = p.pt([-13, 0.3, 3.4 + lift * 0.7]);
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.beginPath(); g.moveTo(nx, ny); g.lineTo(mx, my); g.stroke(); });
    p.box(-15.8, -1.5, 3, 5, 4, 1.2, { top: 0.4, left: 0.24, right: 0.1, edge: 0 });
    // the hand wheel: a fat disc standing out of the right side, a bright face, a dark hub, a turning spoke
    const WZ = 18, WR = 6.8;
    for (let x = 14.2; x < 17.4; x += 0.3) p.ringV("x", [x, -0.5, WZ], WR, 0.2, 0);
    p.ringV("x", [17.5, -0.5, WZ], WR, 0.4, 0);
    p.ringV("x", [17.55, -0.5, WZ], 2.3, 0.03, 0);
    const a = u * Math.PI * 4;
    p.line([[17.6, -0.5 + Math.cos(a) * 2.5, WZ + Math.sin(a) * 2.5], [17.6, -0.5 + Math.cos(a) * 6, WZ + Math.sin(a) * 6]], SH.edge, 1.2);
  },
};
