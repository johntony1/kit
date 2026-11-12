// No tastings: a wine bottle and an empty glass. Hover and wine pours into the glass in a thin stream until it is a third full.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const Q = Math.PI / 4, S2 = Math.SQRT1_2, SPLIT = Math.PI / 6;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const arc = (r: number, z: number, a0: number, a1: number, n = 22): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
type Prof = [number, number][]; // radius and height, bottom to top

/** a turned shape on the origin: a dense side toward +y, a sparse side toward +x, bright outlines */
function lathe(p: Pen, prof: Prof, fl: number = SH.left, fr: number = SH.right) {
  const L = prof.map(([r, z]) => [-r * S2, r * S2, z] as V3), R = prof.map(([r, z]) => [r * S2, -r * S2, z] as V3);
  const [r0, z0] = prof[0], [r1, z1] = prof[prof.length - 1];
  if (p.ink) p.face([...arc(r0, z0, 3 * Q, -Q), ...R, ...arc(r1, z1, -Q, 3 * Q), ...L.slice().reverse()], fl, 0);
  else for (let i = 0; i < prof.length - 1; i++) {
    const [ra, za] = prof[i], [rb, zb] = prof[i + 1];
    p.face([...arc(ra, za, -Q, SPLIT), ...arc(rb, zb, -Q, SPLIT).reverse()], fr, 0);
    p.face([...arc(ra, za, SPLIT, 3 * Q), ...arc(rb, zb, SPLIT, 3 * Q).reverse()], fl, 0);
  }
  p.line(L, SH.edge, 0.6); p.line(R, SH.edge, 0.6); p.line(arc(r0, z0, -Q, 3 * Q), SH.edge, 0.6);
}
const BOTTLE: Prof = [[4.6, 0], [4.6, 15], [4.1, 17.5], [1.9, 21.5], [1.7, 27], [2.2, 27], [2.2, 28.8]];
const BOWL: Prof = [[0.7, 9], [3.6, 10], [5.8, 12.6], [6.5, 16], [6.1, 19.5], [5.4, 22.5]];
/** the bowl's radius at a height */
const rAt = (z: number) => {
  for (let i = 0; i < BOWL.length - 1; i++) { const [r0, z0] = BOWL[i], [r1, z1] = BOWL[i + 1]; if (z <= z1) return r0 + ((r1 - r0) * (z - z0)) / (z1 - z0); }
  return BOWL[BOWL.length - 1][0];
};

export const wine: Illustration = {
  k: "wine", name: "Wine glass", title: "No tastings", body: "Tastings you book or host will be listed here. Add your first one to get started.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.scale(1.12);
    p.shadow(-1, 1, 24, 11, 0.12);
    // the bottle, behind and to the left: body, shoulder, neck and a label
    p.push();
    p.translate(-7.5, 1.5, 0);
    lathe(p, BOTTLE, 0.14, 0.07);
    p.face([...arc(4.63, 4.5, 0.25, 3 * Q - 0.12), ...arc(4.63, 11.5, 0.25, 3 * Q - 0.12).reverse()], 0.3, SH.edge, 0.5);
    p.line(arc(4.66, 9.2, 0.7, 3 * Q - 0.5), 0.02, 0.5);
    p.line(arc(4.66, 7, 0.7, 3 * Q - 0.9), 0.02, 0.5);
    p.line(arc(1.75, 25, -Q, 3 * Q), SH.edge, 0.45);
    p.face(arc(2.2, 28.8, 0, Math.PI * 2, 30), SH.top, SH.edge, 0.5);
    p.pop();
    // the glass: foot, stem, bowl
    p.push();
    p.translate(6.5, -2.5, 0);
    lathe(p, [[5.6, 0], [5.6, 0.7]]);
    p.face(arc(5.6, 0.7, 0, Math.PI * 2, 40), SH.top, SH.edge, 0.55);
    lathe(p, [[0.9, 0.7], [0.7, 9]], 0.2, 0.12);
    lathe(p, BOWL, 0.12, 0.07);
    p.face(arc(5.4, 22.5, 0, Math.PI * 2, 40), 0.2, 0);
    p.face(arc(4.6, 22.45, 0, Math.PI * 2, 40), 0.035, 0);
    // the wine: rises as it is poured, its surface lit
    const k = ease(seg(h, 0.12, 0.92)), lvl = 10 + k * 6.6 + (k > 0.05 ? Math.sin(t * 3.2) * 0.12 * h : 0);
    if (k > 0.02) {
      const cut: Prof = [...BOWL.filter(([, z]) => z < lvl), [rAt(lvl), lvl]];
      lathe(p, cut.map(([r, z]) => [Math.max(0.3, r - 0.5), z] as [number, number]), 0.3, 0.2);
      p.face(arc(rAt(lvl) - 0.5, lvl, 0, Math.PI * 2, 36), 0.36, SH.edge, 0.5);
      const pour = Math.min(seg(h, 0.12, 0.25), 1 - seg(h, 0.8, 0.92));
      if (pour > 0) { const w = 0.25 + 0.35 * pour; p.face([[-w, w, lvl], [w, -w, lvl], [w, -w, lvl + 34], [-w, w, lvl + 34]], 0.34, 0); }
    }
    // the rim, seen through the glass, and a glint on the bowl
    p.face(arc(5.4, 22.5, 0, Math.PI * 2, 40), 0, SH.edge, 0.6);
    p.line(arc(6.2, 17.5, 1.5, 2.1, 6).map(([x, y], i) => [x, y, 15 + i * 0.75] as V3), SH.edge, 0.5);
    p.pop();
  },
};
