// No groups yet: a big speech bubble with three little people on it, two smaller bubbles tucked behind. Hover and the back bubbles slide out to the sides and the people hop one after another.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
/** a rounded rectangle with a tail under one end, as [u, v] */
function bubble(w: number, h: number, r: number, tail: "l" | "r", tl = 4.5): P2[] {
  const pts: P2[] = tail === "l" ? [[r - 1, 0], [-0.5, -tl], [r + tl + 0.5, 0]] : [[w - r - tl - 0.5, 0], [w + 0.5, -tl], [w - r + 1, 0]];
  const corner = (cu: number, cv: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (Math.PI / 2) * (i / 6); pts.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); } };
  corner(w - r, r, -Math.PI / 2); corner(w - r, h - r, 0); corner(r, h - r, Math.PI / 2); corner(r, r, Math.PI);
  return pts;
}
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slabY(p: Pen, pts: P2[], y0: number, T: number, front: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? SH.top : SH.right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, SH.edge, 0.6);
}

export const groupchat: Illustration = {
  k: "groupchat", name: "Group chat", title: "No groups yet", body: "Create a group to talk with several people at once. Your groups will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = ease(seg(h, 0, 0.6));
    p.translate(0, 0, -16);
    p.shadow(0, 2, 28, 11, 0.1);
    p.rotate("z", -0.5);
    // the two back bubbles: they slide out and up
    const small = (u0: number, z0: number, y: number, tail: "l" | "r", front: number) => {
      slabY(p, bubble(15, 10.5, 3.6, tail, 3.2).map(([u, v]) => [u0 + u, z0 + v] as P2), y, 2.4, front);
      p.line([[u0 + 3.5, y + 0.03, z0 + 6.6], [u0 + 11.5, y + 0.03, z0 + 6.6]], SH.edge, 1);
      p.line([[u0 + 3.5, y + 0.03, z0 + 3.8], [u0 + 8.5, y + 0.03, z0 + 3.8]], SH.edge, 1);
    };
    small(-14 - 5 * e, 18 + 3 * e, -5, "l", 0.07);
    small(0 + 6 * e, 20.5 + 3.5 * e, -2.5, "r", 0.12);
    // the front bubble
    slabY(p, bubble(26, 15.5, 5, "l").map(([u, v]) => [u - 13, v + 5] as P2), 2, 3.4, 0.2);
    // three people: a head and shoulders each, hopping in turn
    for (let i = 0; i < 3; i++) {
      const k = seg(h, 0.3 + i * 0.16, 0.62 + i * 0.16), hop = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 2.4 : 0;
      const u = -7.2 + i * 7.2, z = 12.4 + hop, y = 2.04;
      p.face(Array.from({ length: 18 }, (_, j) => { const a = (j / 18) * Math.PI * 2; return [u + Math.cos(a) * 1.75, y, z + 2.2 + Math.sin(a) * 1.75] as V3; }), 0.03, 0);
      p.face(Array.from({ length: 13 }, (_, j) => { const a = (Math.PI * j) / 12; return [u + Math.cos(a) * 2.9, y, z - 3 + Math.sin(a) * 2.7] as V3; }), 0.03, 0);
    }
  },
};
