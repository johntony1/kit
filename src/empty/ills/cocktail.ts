// No drinks on the tab: a cocktail in a wide glass, an olive on a pick. The pick stirs slowly round the glass and bubbles rise.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const Q = Math.PI / 4, S2 = Math.SQRT1_2, SPLIT = Math.PI / 6;
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
const Z0 = 11, Z1 = 25, RIM = 11.5, LV = 20.5; // the bowl: its point, its rim, the rim's radius; the drink's level
const rAt = (z: number) => 0.7 + ((RIM - 0.7) * (z - Z0)) / (Z1 - Z0);

export const cocktail: Illustration = {
  k: "cocktail", name: "Cocktail", title: "No drinks on the tab", body: "Order a drink and it will be added to your tab here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, a = ph * Math.PI * 2;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 20, 10, 0.12);
    // the foot and the stem
    lathe(p, [[6.6, 0], [6.6, 0.8]]);
    p.face(arc(6.6, 0.8, 0, Math.PI * 2, 40), SH.top, SH.edge, 0.55);
    lathe(p, [[1, 0.8], [0.8, Z0]], 0.26, 0.14);
    // the bowl: a wide cone, its inside dark above the drink
    lathe(p, [[0.7, Z0], [RIM, Z1]], 0.13, 0.075);
    p.face(arc(RIM, Z1, 0, Math.PI * 2, 44), 0.07, 0);
    // the drink, lit, with bubbles rising in it
    const r = rAt(LV) - 0.6;
    lathe(p, [[0.5, Z0 + 0.9], [r, LV]], 0.3, 0.2);
    p.face(arc(r, LV, 0, Math.PI * 2, 40), 0.38, SH.edge, 0.5);
    for (let i = 0; i < 4; i++) {
      const u = (ph * 2 + i / 4) % 1, z = Z0 + 3 + u * (LV - Z0 - 3.4), q = rAt(z) * 0.55, b = 0.8 + i * 1.3;
      p.dot([-Math.sin(b) * q * S2 + q * 0.5, Math.sin(b) * q * S2 + q * 0.5, z], 0.6, 0.02);
    }
    // the pick, leaning on the rim as it goes round, an olive on it
    const foot: V3 = [Math.cos(a + Math.PI) * 2.4, Math.sin(a + Math.PI) * 2.4, LV], tip: V3 = [Math.cos(a) * (RIM + 2), Math.sin(a) * (RIM + 2), Z1 + 9];
    const [fx, fy] = p.pt(foot), [tx, ty] = p.pt(tip);
    p.screen((c) => {
      c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.lineCap = "round";
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(tx, ty); c.stroke();
    });
    p.dot([foot[0] + (tip[0] - foot[0]) * 0.86, foot[1] + (tip[1] - foot[1]) * 0.86, foot[2] + (tip[2] - foot[2]) * 0.86], 2.4, 1);
    // the rim, over it all
    p.face(arc(RIM, Z1, 0, Math.PI * 2, 44), 0, SH.edge, 0.6);
  },
};
