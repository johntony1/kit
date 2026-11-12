// No one blocked: an avatar token standing upright with a small no entry mark at its corner. Hover and the mark grows and swings across the whole face, striking it out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const circ = (cu: number, cv: number, r: number, n = 28): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
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

export const blocked: Illustration = {
  k: "blocked", name: "Blocked list", title: "No one blocked", body: "People you block will be listed here. You can unblock them at any time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = ease(h);
    p.translate(0, 0, -14);
    p.shadow(0, 1, 24, 10, 0.1);
    p.rotate("z", -0.5);
    const on = (pts: P2[], y: number) => pts.map(([u, v]) => [u, y, v] as V3);
    // the token: a thick coin, a dark window, a head and shoulders
    const zc = 13.5, R = 13.5;
    slabY(p, circ(0, zc, R, 48), 0, 3, 0.2);
    p.face(on(circ(0, zc, R - 2.4, 40), 0.03), 0.04, SH.edge, 0.6);
    const tone = 0.32 - 0.12 * e;
    p.face(on(circ(0, zc + 3, 3.6, 22), 0.05), tone, 0);
    p.face(Array.from({ length: 17 }, (_, i) => { const a = (Math.PI * i) / 16; return [Math.cos(a) * 7.2, 0.05, zc - 8.2 + Math.sin(a) * 6.4] as V3; }), tone, 0);
    // the no entry mark: a ring with a bar, from the corner to the whole face
    const r = 4.6 + 7.9 * e, cu = 10.5 * (1 - e), cz = 4 + (zc - 4) * e, y = 1.2 + 1.6 * e;
    const w = r * 0.2, q = Math.SQRT1_2;
    const outer = circ(cu, cz, r, 44), inner = circ(cu, cz, r - w, 44);
    // a dark gap round the ring and the bar, so the mark reads over the face behind it
    const gap = (ro: number, ri: number) => { const o = circ(cu, cz, ro, 44), i = circ(cu, cz, ri, 44); return on([...o, o[0], i[0], ...i.slice().reverse()], y - 0.02); };
    if (e < 0.35) p.clear(on(circ(cu, cz, r + 0.9, 44), y - 0.02));
    else p.clear(gap(r + 0.9, r - w - 0.9));
    // the bar, from upper left to lower right
    const bar = (hw: number): P2[] => { const a = (r - w * 0.5) * q, b = hw * q; return [[cu - a - b, cz + a - b], [cu - a + b, cz + a + b], [cu + a + b, cz - a + b], [cu + a - b, cz - a - b]]; };
    p.clear(on(bar(w * 0.5 + 0.9), y - 0.01));
    p.face(on([...outer, outer[0], inner[0], ...inner.slice().reverse()], y), 0.32, 0);
    p.face(on(bar(w * 0.5), y + 0.02), 0.32, 0);
  },
};
