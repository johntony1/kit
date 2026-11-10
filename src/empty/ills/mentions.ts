// No mentions yet: a chunky key with an @ cut into its top, seated in a base. Hover and the key pops up out of its socket and a badge with a count lands on its corner.
import { SH, type Illustration, type V3 } from "../dots";

const B = 13.5, BH = 2.6; // base half size, height
const K = 9.5, KH = 7.5; // key half size, height
const S = Math.SQRT1_2;

export const mentions: Illustration = {
  k: "mentions", name: "Mentions", title: "No mentions yet", body: "When someone mentions you in a comment or a chat, you will find it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -10);
    p.scale(1.12, [0, 0, 6]);
    p.shadow(0, 0, B * 2, B, 0.12);
    // the base with a dark socket
    p.box(-B, -B, 0, B * 2, B * 2, BH, { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    p.clear([[-K - 0.8, -K - 0.8, BH + 0.02], [K + 0.8, -K - 0.8, BH + 0.02], [K + 0.8, K + 0.8, BH + 0.02], [-K - 0.8, K + 0.8, BH + 0.02]]);
    // the key: lifts with a little overshoot and bobs while hovered
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = (h > 0 ? 6.5 * back(h) : 0) + h * Math.sin(t * 2.6) * 0.5;
    const z0 = BH - 1.5 + lift;
    if (lift > 1.5) {
      for (const [x, y] of [[-K, K], [K, K], [K, -K]] as [number, number][]) p.guide([[x, y, z0], [x, y, BH]]);
    }
    p.box(-K, -K, Math.max(BH, z0), K * 2, K * 2, KH - Math.max(0, BH - z0), { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 });
    const zt = z0 + KH + 0.02;
    // the @, in glyph space on the key top: u to screen right, v to screen up
    const g = (u: number, v: number): V3 => [(u - v) * S, (-u - v) * S, zt];
    const arc = (cu: number, cv: number, r: number, a0: number, a1: number, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return g(cu + Math.cos(a) * r, cv + Math.sin(a) * r); });
    p.line(arc(0, 0, 2.5, 0, Math.PI * 2), SH.edge, 1.3);
    p.line([g(2.5, 2.6), g(2.5, -0.6), ...arc(4.1, -0.6, 1.6, Math.PI, Math.PI * 2, 8).slice(1), ...arc(0, 0, 5.7, -0.1, Math.PI * 1.62, 34)], SH.edge, 1.3);
    // the badge: a small accent puck that drops onto the key's back corner
    const k = Math.max(0, Math.min(1, (h - 0.4) / 0.4));
    if (k > 0.02) {
      const bx = K - 2.2, by = -K + 2.2, bz = zt + 9 * (1 - k) * (1 - k);
      p.push(); p.scale(0.4 + 0.6 * k, [bx, by, bz]);
      p.cylinder(bx, by, bz, 2.8, 1.4, { side: 0.13, top: 0.34, lw: 0.6 });
      const gb = (u: number, v: number): V3 => [bx + (u - v) * S, by + (-u - v) * S, bz + 1.42];
      p.line([gb(-0.7, 0.6), gb(0.15, 1.2), gb(0.15, -1.2)], SH.edge, 0.8);
      p.pop();
      ([[-15, 2, zt + 8], [12, -14, zt + 10]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.3 * Math.sin(t * 3 + i * 2), k));
    }
  },
};
