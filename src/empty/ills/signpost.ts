// Nothing here: a wooden signpost on a grassy mound. Hover and its two arrows swing round the post to point new ways.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** the visible half of a cone section around the z axis */
const frustum = (p: Pen, z0: number, r0: number, z1: number, r1: number, fill: number, edge = SH.edge) => {
  const N = 40, pts: V3[] = [];
  for (let i = 0; i <= N / 2; i++) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([Math.cos(a) * r0, Math.sin(a) * r0, z0]); }
  for (let i = N / 2; i >= 0; i--) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([Math.cos(a) * r1, Math.sin(a) * r1, z1]); }
  p.face(pts, fill, edge, 0.5);
};
/** an arrow board pointing along +x from the post, at height z, turned by a about the post */
const sign = (p: Pen, z: number, a: number, len: number) => {
  p.push();
  p.rotate("z", a);
  const t = 0.55, hh = 2.4, x0 = 1.2, x1 = x0 + len;
  const shape: [number, number][] = [[x0, hh], [x1 - 3, hh], [x1, 0], [x1 - 3, -hh], [x0, -hh]]; // (x, z), counter clockwise seen from +y
  const fr: V3[] = shape.map(([x, dz]) => [x, t, z + dz]);
  const bk: V3[] = shape.map(([x, dz]) => [x, -t, z + dz] as V3).reverse();
  for (let i = 0; i < shape.length; i++) {
    const a1 = fr[i], b1 = fr[(i + 1) % shape.length];
    const side: V3[] = [a1, [a1[0], -t, a1[2]], [b1[0], -t, b1[2]], b1];
    if (facing(p, side) > 0) p.face(side, 0.12, SH.edge, 0.5);
  }
  const face = facing(p, fr) > 0 ? fr : facing(p, bk) > 0 ? bk : null;
  if (face) {
    const y = face === fr ? t + 0.05 : -t - 0.05;
    p.face(face, 0.2, SH.edge, 0.6);
    // the wood grain: two lines along the board
    p.line([[x0 + 1.4, y, z + 0.8], [x1 - 3.4, y, z + 0.8]], 0.55, 0.45);
    p.line([[x0 + 1.4, y, z - 0.8], [x1 - 4.6, y, z - 0.8]], 0.55, 0.45);
    // a nail where it meets the post
    p.dot([x0 + 0.8, y, z], 0.5, 1);
  }
  p.pop();
};
const backOut = (x: number) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

export const signpost: Illustration = {
  k: "signpost", name: "Signpost", title: "Nothing here", body: "There's nothing to show yet. Try a different filter or head back to start.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = backOut(h);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 18, 9, 0.1);
    // the grassy mound
    const M = 13, MH = 3.2, n = 6;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * (Math.PI / 2), a1 = ((i + 1) / n) * (Math.PI / 2);
      frustum(p, Math.sin(a0) * MH, Math.cos(a0) * M, Math.sin(a1) * MH, Math.max(0.01, Math.cos(a1) * M), 0.09 + 0.03 * i, i === 0 ? SH.edge : 0);
    }
    // tufts of grass on the near slope
    for (const [ga, gr] of [[0.2, 10.5], [0.9, 8], [1.6, 11], [2.3, 9], [-0.4, 8.5], [1.25, 5.5]] as [number, number][]) {
      const gx = Math.cos(ga) * gr, gy = Math.sin(ga) * gr, gz = MH * Math.sqrt(Math.max(0, 1 - (gr / M) ** 2));
      p.line([[gx - 1.1, gy + 1.1, gz + 2], [gx, gy, gz], [gx + 0.1, gy - 0.1, gz + 2.8], [gx, gy, gz], [gx + 1.2, gy - 1.2, gz + 1.9]], 0.85, 0.5);
    }

    // the post and the arrows, ordered by depth so a sign turned behind the post is drawn first
    const a1 = k * Math.PI * 0.75, a2 = Math.PI / 2 - k * Math.PI * 0.75; // they swap sides, ending face on
    const depth = (a: number) => Math.cos(a) + Math.sin(a);
    const parts: [number, () => void][] = [
      [0, () => {
        p.box(-1.1, -1.1, 0, 2.2, 2.2, 28, { top: 0.25, left: 0.18, right: 0.1 });
        p.face([[-1.1, 1.1, 28], [1.1, 1.1, 28], [0, 0, 30]], 0.18, SH.edge, 0.5); // pointed cap
        p.face([[1.1, -1.1, 28], [1.1, 1.1, 28], [0, 0, 30]], 0.1, SH.edge, 0.5);
      }],
      [depth(a1) * 0.6, () => sign(p, 24, a1, 13)],
      [depth(a2) * 0.6, () => sign(p, 17.5, a2, 11)],
    ];
    parts.sort((x, y) => x[0] - y[0]).forEach(([, f]) => f());
  },
};
