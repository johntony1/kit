// Nothing to build yet: a big cordless pistol drill side on, a fat motor body, a grip down to a battery block, the chuck and a long bit pointing left. The bit spins, its flutes running along it, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
type P2 = [number, number];
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s > 0;
};
/** a flat shape in the x z plane (counter clockwise), made y0..y1 thick: lit walls facing up, shaded walls elsewhere, then its front */
function prism(p: Pen, prof: P2[], y0: number, y1: number, front: number) {
  for (let i = 0; i < prof.length; i++) {
    const [ax, az] = prof[i], [bx, bz] = prof[(i + 1) % prof.length];
    const q: V3[] = [[ax, y0, az], [ax, y1, az], [bx, y1, bz], [bx, y0, bz]];
    const len = Math.hypot(bx - ax, bz - az), nz = -(bx - ax) / len;
    if (facing(p, q)) p.face(q, nz > 0.3 ? 0.26 : 0.065, 0);
  }
  p.face(prof.map(([x, z]) => [x, y1, z] as V3).reverse(), front, 0);
}
// the bit points to -x. The body with a rounded back, the grip slanting down, the battery block under it
const BODY: P2[] = [[-7, 20.5], [9, 20.5], [12, 22], [13.5, 26.5], [12, 31], [9, 32.5], [-7, 32.5], [-8.5, 31], [-8.5, 22]];
const GRIP: P2[] = [[0, 7.5], [8.5, 7.5], [10.5, 20.7], [2, 20.7]];
const BATT: P2[] = [[-4, 0], [13, 0], [13, 7.5], [-4, 7.5]];
const ZC = 26.5; // height of the drill's axis

export const drill: Illustration = {
  k: "drill", name: "Drill", title: "Nothing to build yet", body: "Start your first build and it will take shape here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p: Pen, t) {
    const u = (t / P) % 1;
    const buzz = Math.sin(u * Math.PI * 24) * 0.1; // a fine shake while it runs
    p.translate(3, -3, -17);
    p.shadow(-4, 2, 26, 9, 0.1);
    p.rotate("z", -0.62);
    p.translate(0, 0, buzz);
    // battery block, then the grip, then the body over them
    prism(p, BATT, -5, 5, 0.2);
    p.line([[-4, 5.03, 2.4], [13, 5.03, 2.4]], SH.edge, 0.7);
    prism(p, GRIP, -3.4, 3.4, 0.2);
    for (const z of [11, 14, 17]) p.line([[1.2 + (z - 7.5) * 0.15, 3.43, z], [8 + (z - 7.5) * 0.15, 3.43, z]], SH.edge, 0.6); // grip ribs
    p.box(-1, -1.2, 15, 2.8, 2.4, 5.5, { top: 0.3, left: 0.32, right: 0.1, edge: 0 }); // the trigger
    prism(p, BODY, -4.6, 4.6, 0.2);
    p.line([[-8.5, 4.63, 23.4], [0, 4.63, 23.4]], SH.edge, 0.7);
    p.line([[9, 4.63, 20.5], [9, 4.63, 32.5]], SH.edge, 0.8); // the seam of the motor cap
    // the chuck: a stepped lit barrel along x, its grooves sliding round as it spins
    const barrel = (x0: number, x1: number, r: number, fill: number) => {
      p.face([[x1, 0, ZC + r], [x0, 0, ZC + r], [x0, r * 0.75, ZC - r * 0.66], [x1, r * 0.75, ZC - r * 0.66]], fill, 0);
      p.ringV("x", [x0, 0, ZC], r, 0.16, 0);
    };
    barrel(-13.5, -8.5, 4.2, 0.3);
    p.line([[-8.55, 3.2, ZC - 2.6], [-8.55, 0, ZC + 4.2]], SH.edge, 0.9);
    barrel(-16.5, -13.5, 2.7, 0.26);
    const sp = (u * 6) % 1;
    for (let i = 0; i < 3; i++) { const x = -12.9 + ((i + sp) / 3) * 4; p.line([[x, 3.1, ZC - 2.8], [x, 2.2, ZC + 2.6]], SH.edge, 0.7); }
    // the bit: a bright shaft drawn flat to the screen, its flutes running along it as it turns
    const [bx0, by0] = p.pt([-16.5, 0.4, ZC]), [bx1, by1] = p.pt([-25, 0.4, ZC]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineWidth = 2.8;
      g.beginPath(); g.moveTo(bx0, by0); g.lineTo(bx1, by1); g.stroke();
      g.strokeStyle = "#000"; g.lineWidth = 0.7;
      for (let i = 0; i < 3; i++) {
        const k = (i + 0.3 + sp) / 3.4, x = bx0 + (bx1 - bx0) * k, y = by0 + (by1 - by0) * k;
        g.beginPath(); g.moveTo(x + 0.6, y + 1.2); g.lineTo(x - 0.6, y - 1.2); g.stroke();
      }
    });
  },
};
