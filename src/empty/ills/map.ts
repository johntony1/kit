// No places saved: a folded paper map standing open like a screen. A dashed route draws itself across the folds to an empty marker, then fades and starts again.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4.5; // seconds per loop
const NP = 4, PW = 10, A = 4.2, HM = 25; // panels, panel width, fold depth, map height
const X0 = -(NP * PW) / 2;

const S = Math.SQRT1_2;
/** a point on the paper: s runs along the unfolded map (toward screen right), z up its height, lifted off the paper a touch */
const on = (s: number, z: number, lift = 0.06): V3 => {
  const c = Math.max(0, Math.min(NP * PW - 0.001, s)), i = Math.floor(c / PW), f = c / PW - i;
  const d0 = i % 2 ? -A : 0, d1 = i % 2 ? 0 : -A;
  // along runs screen right, depth runs toward the viewer; push the point off the panel toward us
  const na = i % 2 ? -A : A, nd = PW, l = Math.hypot(na, nd);
  const a = X0 + c + (na / l) * lift, d = d0 + (d1 - d0) * f + (nd / l) * lift;
  return [a * S + d * S, -a * S + d * S, z];
};
// the route across the map, in (s, z)
const ROUTE: [number, number][] = [[3.6, 8], [9, 8], [12.2, 14], [18, 16.5], [22.2, 10.5], [27.2, 8.5], [31.4, 13.5], [34.6, 19]];

export const map: Illustration = {
  k: "map", name: "Map", title: "No places saved", body: "Save a place and it will be pinned here for next time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 30, 12, 0.12);
    p.rotate("z", -0.32);
    // the panels: the ones turned toward the light are lit, the others dense
    for (let i = 0; i < NP; i++) {
      const a = on(i * PW, 0, 0), b = on((i + 1) * PW - 0.001, 0, 0);
      p.face([a, b, [b[0], b[1], HM], [a[0], a[1], HM]], i % 2 ? 0.24 : SH.left, 0);
    }
    // the folds and the paper's edge, cut
    for (let i = 1; i < NP; i++) p.line([on(i * PW, 0.4), on(i * PW, HM - 0.4)], SH.edge, 0.6);
    // roads and a river, fine cuts
    const path = (f: (s: number) => number, s0 = 0, s1 = NP * PW, lw = 0.55) =>
      p.line(Array.from({ length: 61 }, (_, k) => { const s = s0 + ((s1 - s0) * k) / 60; return on(s, f(s)); }), SH.edge, lw);
    path((s) => 21.5 - s * 0.08, 0, NP * PW, 0.55);
    path((s) => 4.2 + Math.sin(s * 0.3) * 1.4, 0, NP * PW, 0.9);
    p.line([on(15, 0.5), on(15, HM - 0.5)], SH.edge, 0.55);
    p.line([on(25.5, 0.5), on(25.5, HM - 0.5)], SH.edge, 0.55);
    // the route draws itself, dash by dash, then fades out at the end of the loop
    const draw = Math.min(1, u / 0.55), fade = u > 0.86 ? 1 - (u - 0.86) / 0.14 : 1;
    let total = 0;
    const segs = ROUTE.slice(1).map(([s, z], i) => { const [s0, z0] = ROUTE[i]; const l = Math.hypot(s - s0, z - z0); total += l; return { s0, z0, s, z, l }; });
    if (fade > 0.05) {
      const upto = total * draw;
      let run = 0;
      for (const g of segs) {
        for (let d = 0; d + 1.2 < g.l; d += 3.2) {
          if (run + d + 1.2 > upto) break;
          const f0 = d / g.l, f1 = (d + 1.4) / g.l;
          p.line([on(g.s0 + (g.s - g.s0) * f0, g.z0 + (g.z - g.z0) * f0), on(g.s0 + (g.s - g.s0) * f1, g.z0 + (g.z - g.z0) * f1)], SH.edge, 0.95 * fade + 0.2);
        }
        run += g.l;
      }
      // the start: a small ring
      p.line(Array.from({ length: 17 }, (_, k) => { const a = (k / 16) * Math.PI * 2; return on(ROUTE[0][0] + Math.cos(a) * 1.4, ROUTE[0][1] + Math.sin(a) * 1.4); }), SH.edge, 0.8);
    }
    // the end: an empty marker ring that pops in once the route arrives, and pulses
    const arrive = (u - 0.55) / 0.08;
    if (arrive > 0 && fade > 0.05) {
      const [es, ez] = ROUTE[ROUTE.length - 1];
      const r = (2.6 + 0.5 * Math.sin(t * 6)) * Math.min(1, arrive) * fade;
      p.line(Array.from({ length: 25 }, (_, k) => { const a = (k / 24) * Math.PI * 2; return on(es + Math.cos(a) * r, ez + Math.sin(a) * r); }), SH.edge, 1.1);
      p.line([on(es - r * 0.45, ez), on(es + r * 0.45, ez)], SH.edge, 0.7);
      p.line([on(es, ez - r * 0.45), on(es, ez + r * 0.45)], SH.edge, 0.7);
    }
  },
};
