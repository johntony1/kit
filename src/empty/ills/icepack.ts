// Nothing to soothe: a puffy gel ice pack with a snowflake on it, standing on its edge. Hover and it lifts with a soft bounce, the snowflake turns and frost glints at its corners.
import { type Illustration, type V3 } from "../dots";

const W = 15, H = 21, RR = 5.5, TH = 4; // half width, height, corner radius, thickness
const F = (u: number, v: number, d = 0): V3 => [u * 0.577 + d, -u * 0.577 + d, v];
const cl = (x: number) => Math.max(0, Math.min(1, x));
/** a rounded rectangle in the plane that faces us */
const rect = (w: number, h0: number, h1: number, r: number, d = 0): V3[] => {
  const out: V3[] = [];
  const cs: [number, number, number][] = [[w - r, h1 - r, 0], [-(w - r), h1 - r, 0.5], [-(w - r), h0 + r, 1], [w - r, h0 + r, 1.5]];
  for (const [cu, cv, q] of cs) for (let i = 0; i <= 6; i++) { const a = (q + i / 12) * Math.PI; out.push(F(cu + Math.cos(a) * r, cv + Math.sin(a) * r, d)); }
  return out;
};

export const icepack: Illustration = {
  k: "icepack", name: "Ice pack", title: "Nothing to soothe", body: "No aches logged today. When you add one, your treatments will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.6);
    const lift = 3.5 * Math.sin(k * Math.PI * 0.5) + h * Math.sin(t * 3) * 0.6;
    p.translate(0, 0, -H / 2 - 1);
    p.shadow(0, 0, 26 - lift, 9, 0.12);
    p.translate(0, 0, lift);
    p.rotate("z", 0.12);
    // the pack's thickness: copies stepping back, the top rim lit
    for (let d = -TH; d < 0; d += 0.5) p.face(rect(W, 0, H, RR, d), 0.2, 0);
    // the sealed border, then the puffed middle with a lit upper half
    p.face(rect(W, 0, H, RR), 0.1, 0);
    p.face(rect(W - 2.2, 2.2, H - 2.2, RR - 2, 0.1), 0.18, 0);
    p.face(rect(W - 3.2, H * 0.5, H - 3.2, RR - 2.6, 0.15), 0.26, 0);
    // the snowflake: six arms with little forks, turning on hover
    const sc = H / 2, rot = h * Math.PI / 6;
    for (let i = 0; i < 6; i++) {
      const a = rot + (i * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a);
      const P = (r: number, q: number): V3 => F(c * r - s * q, sc + s * r + c * q, 0.3);
      p.line([P(0.6, 0), P(6.4, 0)], 1, 1.3);
      p.line([P(3.6, 0), P(5.4, 1.7)], 1, 1);
      p.line([P(3.6, 0), P(5.4, -1.7)], 1, 1);
    }
    p.dot(F(0, sc, 0.3), 0.9, 0);
    // frost glints in the corners
    const g = cl((h - 0.4) / 0.6);
    if (g > 0) ([[-W + 2.5, H - 2.5], [W - 2.5, H - 2.5], [-W + 2.5, 2.5]] as const).forEach(([u, v], i) => {
      const r = (0.6 + 0.5 * Math.sin(t * 4 + i * 2)) * g;
      if (r > 0.05) p.dot(F(u, v, 0.4), 0.5 + r, 1);
    });
  },
};
