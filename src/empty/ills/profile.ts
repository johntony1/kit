// No profile yet: an ID card standing in its dock, an avatar and name lines on its face. Hover and the card lifts out, a check badge pops on its corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** a rounded rectangle in a plane, as [u, v] points, counter clockwise */
const rr = (u0: number, v0: number, u1: number, v1: number, r: number, n = 5): P2[] => {
  const out: P2[] = [];
  const c: [number, number, number][] = [[u0 + r, v0 + r, Math.PI], [u1 - r, v0 + r, Math.PI * 1.5], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI * 0.5]];
  for (const [cu, cv, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
};
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slabY(p: Pen, pts: P2[], y0: number, T: number, front: number, top = SH.top, right = SH.right) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? top : right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, SH.edge, 0.6);
}

const CW = 12, CH = 16.5; // card half width, height

export const profile: Illustration = {
  k: "profile", name: "Profile card", title: "Your profile is empty", body: "Add a photo and a few details so people know who they are working with.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.scale(1.14, [0, 0, 12]);
    p.shadow(-7, 0, 14, 9, 0.12); p.shadow(7, 0, 14, 9, 0.12);
    // the dock: a low block with a dark slot along its top
    p.box(-14.5, -4, 0, 29, 8, 4, { top: 0.22, left: 0.13, right: 0.07 });
    p.clear([[-13, -0.9, 4.02], [13, -0.9, 4.02], [13, 0.9, 4.02], [-13, 0.9, 4.02]]);
    const lift = 9 * h + h * Math.sin(t * 2.4) * 0.6;
    const zb = 4 + lift, y = 0.6;
    // dashed drops from the card to the slot, only once it has lifted
    if (lift > 1) {
      p.guide([[-CW, y, zb], [-CW, y, 4]]);
      p.guide([[CW, y, zb], [CW, y, 4]]);
    }
    // the card
    slabY(p, rr(-CW, zb, CW, zb + CH, 1.6), y, 1.2, 0.24);
    const f = y + 0.03;
    // the lanyard slot
    p.line([[-2.4, f, zb + CH - 2], [2.4, f, zb + CH - 2]], SH.edge, 1.2);
    // the avatar: a dark round window with a lit head and shoulders in it
    const ax = -5.6, az = zb + 8.6, R = 4.9;
    const circ = (cx: number, cz: number, r: number, a0 = 0, a1 = Math.PI * 2, n = 32): V3[] =>
      Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, f, cz + Math.sin(a) * r] as V3; });
    p.face(circ(ax, az, R), 0.04, SH.edge, 0.6);
    p.face(circ(ax, az + 1.4, 1.9), 0.32, 0);
    p.face([...circ(ax, az - 4.2, 3.3, 0, Math.PI, 16)].map(([x, , z]) => [x, f + 0.01, Math.min(z, az - 1.1)] as V3), 0.32, 0);
    // name and details, cut into the card
    p.line([[0.6, f, zb + 11.6], [9, f, zb + 11.6]], SH.edge, 1.2);
    p.line([[0.6, f, zb + 8.6], [7, f, zb + 8.6]], SH.edge, 0.7);
    p.line([[0.6, f, zb + 6.2], [8.4, f, zb + 6.2]], SH.edge, 0.7);
    p.line([[-9.6, f, zb + 2.4], [9.6, f, zb + 2.4]], SH.edge, 0.6);
    // the check badge on the top corner, popping in on hover
    const k = Math.max(0, Math.min(1, (h - 0.45) / 0.4));
    if (k > 0.02) {
      const s = k * (1 + 0.25 * Math.sin(k * Math.PI));
      const bx = CW - 1, bz = zb + CH - 1, by = y + 0.4;
      p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [bx + Math.cos(a) * 3.2 * s, by, bz + Math.sin(a) * 3.2 * s] as V3; }), 0.26, SH.edge, 0.6);
      p.line([[bx - 1.5 * s, by + 0.03, bz], [bx - 0.4 * s, by + 0.03, bz - 1.2 * s], [bx + 1.6 * s, by + 0.03, bz + 1.2 * s]], SH.edge, 0.9);
      ([[-15, 2, zb + 17], [14, -8, zb + 19]] as V3[]).forEach((q, i) => p.dot(q, 0.9 + 0.3 * Math.sin(t * 3 + i * 2), k));
    }
  },
};
