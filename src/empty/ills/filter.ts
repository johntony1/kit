// No matches: a funnel over an empty jar. Dots drop into the funnel one by one, and nothing ever comes out of the bottom.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const ZT = 38, RT = 11; // the funnel's mouth: height and radius
const ZN = 21, RN = 1.9; // where the cone narrows into the spout
const JR = 7.5, JH = 12; // the jar
const S = Math.SQRT1_2;
const rgt = (r: number, z: number): V3 => [r * S, -r * S, z];
const lft = (r: number, z: number): V3 => [-r * S, r * S, z];
// half a horizontal ring, from the right of the outline to the left, through the front (or the back)
const half = (r: number, z: number, back = false, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n * (back ? -1 : 1); return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
const ring = (r: number, z: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const filter: Illustration = {
  k: "filter", name: "Funnel", title: "No matches", body: "Nothing fits these filters. Try loosening them a little.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -25);
    p.shadow(0, 0, 18, 8, 0.12);
    // the jar: a dark empty mouth, a dense body, a lit rim
    p.face(ring(JR, JH), 0.03, 0);
    p.face([rgt(JR, 0), rgt(JR, JH), ...half(JR, JH).slice(1, -1), lft(JR, JH), lft(JR, 0), ...half(JR, 0).reverse()], SH.left, 0);
    p.face([rgt(JR, JH - 2.2), rgt(JR, JH), ...half(JR, JH).slice(1, -1), lft(JR, JH), lft(JR, JH - 2.2), ...half(JR, JH - 2.2).reverse()], SH.top, 0);
    p.line(half(JR, JH - 2.2), SH.edge, 0.6);
    // the glass's shine and a measuring mark: cuts
    p.line(half(JR, 4).slice(4, 10), SH.edge, 0.7);
    p.line(half(JR, 7.5).slice(4, 8), SH.edge, 0.7);
    // the spout, sitting in the jar's mouth
    p.face([rgt(RN * 0.75, JH - 0.5), rgt(RN * 0.75, ZN), lft(RN * 0.75, ZN), lft(RN * 0.75, JH - 0.5)], SH.left, 0);
    // the cone: a sparse body with a lit band down the front
    const body: V3[] = [rgt(RN, ZN), rgt(RT, ZT), ...half(RT, ZT, true).slice(1, -1), lft(RT, ZT), lft(RN, ZN), ...half(RN, ZN).reverse()];
    p.face(body, SH.left, 0);
    const band = (a: number): V3[] => [[Math.cos(a) * RN, Math.sin(a) * RN, ZN], [Math.cos(a) * RT, Math.sin(a) * RT, ZT]];
    const b0 = band(-0.6), b1 = band(0.05);
    p.face([b0[0], b0[1], b1[1], b1[0]], SH.right, 0);
    const c0 = band(0.35), c1 = band(0.95);
    p.face([c0[0], c0[1], c1[1], c1[0]], SH.top, 0);
    // the mouth: the far inside wall catches the light, the throat is dark
    p.face(ring(RT, ZT), SH.top, 0);
    p.screen((c) => {
      const q = ring(RT, ZT).map((v) => p.pt(v));
      c.beginPath(); q.forEach(([sx, sy], i) => (i ? c.lineTo(sx, sy) : c.moveTo(sx, sy))); c.closePath(); c.clip();
      p.face(ring(RT - 2.6, ZT - 2.6 * ((ZT - ZN) / (RT - RN))), 0.03, 0);
    });
    // the rolled lip around the mouth
    p.line(half(RT, ZT), SH.edge, 0.8);
    p.line(half(RT - 1.4, ZT + 0.01), SH.edge, 0.55);
    // dots dropping in from above: each one vanishes at the mouth
    for (let i = 0; i < 4; i++) {
      const u = ((t / P) + i / 4) % 1;
      const z = ZT + 13 - u * 17;
      const x = [-2.2, 1.6, 0.2, -0.8][i], y = [1.2, -1.4, 2.4, -0.4][i];
      if (z > ZT - 2) p.dot([x, y, z], Math.min(1.25, u * 8), 1);
    }
  },
};
