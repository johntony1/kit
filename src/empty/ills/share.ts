// Nothing shared yet: the share mark built from three thick tokens joined by two bars. Hover and a pulse runs out along each bar and the two far tokens hop as it reaches them.
import { type Illustration, type V3 } from "../dots";

const Q = Math.SQRT1_2;
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
/** glyph space on the floor: u to screen right, v to screen up */
const g = (u: number, v: number, z = 0): V3 => [(u - v) * Q, (-u - v) * Q, z];

export const share: Illustration = {
  k: "share", name: "Share", title: "Nothing shared yet", body: "Share a file or a link with someone and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -3);
    const src: [number, number] = [-10, 0], far: [number, number][] = [[10, 13], [10, -13]];
    p.shadow(g(...src)[0], g(...src)[1], 12, 6, 0.12);
    for (const f of far) p.shadow(g(...f)[0], g(...f)[1], 12, 6, 0.12);
    const R = 5.4, H = 3.4;
    const hop = (i: number) => { const k = seg(h, 0.38 + i * 0.14, 0.72 + i * 0.14); return k > 0 && k < 1 ? Math.sin(k * Math.PI) * 4.5 : 0; };
    const lit = (i: number) => seg(h, 0.4 + i * 0.14, 0.6 + i * 0.14);
    // a bar from the source to a far token, a flat strip with a little height
    const bar = (i: number) => {
      const [u0, v0] = src, [u1, v1] = far[i], L = Math.hypot(u1 - u0, v1 - v0), nu = (-(v1 - v0) / L) * 1.5, nv = ((u1 - u0) / L) * 1.5;
      for (const z of [0, 0.7, 1.4]) p.face([g(u0 + nu, v0 + nv, z), g(u1 + nu, v1 + nv, z), g(u1 - nu, v1 - nv, z), g(u0 - nu, v0 - nv, z)], z < 1.4 ? 0.1 : 0.16, 0);
      // the pulse running out
      const k = seg(h, 0.05 + i * 0.14, 0.42 + i * 0.14);
      if (k > 0 && k < 1) { const a = 0.22 + 0.6 * k; p.dot(g(u0 + (u1 - u0) * a, v0 + (v1 - v0) * a, 1.5), 1.7, 0); }
    };
    const token = (c: [number, number], z: number, top: number, r = R) => { const q = g(c[0], c[1]); p.cylinder(q[0], q[1], z, r, H, { side: 0.12, top, lw: 0.6 }); };
    // back to front: the upper bar and token, the source, the lower bar and token
    bar(0);
    token(far[0], hop(0), 0.2 + 0.14 * lit(0));
    bar(1);
    token(src, 0, 0.32, R + 0.6 + h * Math.sin(t * 3) * 0.2);
    token(far[1], hop(1), 0.2 + 0.14 * lit(1));
    // sparks where they land
    const s = seg(h, 0.75, 1);
    if (s > 0) ([g(17, 19, 7), g(18, -8, 9), g(1, 20, 6)] as V3[]).forEach((q, i) => p.dot(q, (0.8 + 0.3 * Math.sin(t * 3 + i * 2)) * s, 1));
  },
};
