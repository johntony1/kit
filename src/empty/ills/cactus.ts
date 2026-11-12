// It is empty out here: one classic cactus with two raised arms, in a round pot. Hover and it stretches a little and a flower opens on top.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a round ended limb from a to b, r thick */
const limb = (a: P2, b: P2, r: number, n = 10): P2[] => {
  const g = Math.atan2(b[1] - a[1], b[0] - a[0]), out: P2[] = [];
  for (let i = 0; i <= n; i++) { const q = g - Math.PI / 2 + (Math.PI * i) / n; out.push([b[0] + Math.cos(q) * r, b[1] + Math.sin(q) * r]); }
  for (let i = 0; i <= n; i++) { const q = g + Math.PI / 2 + (Math.PI * i) / n; out.push([a[0] + Math.cos(q) * r, a[1] + Math.sin(q) * r]); }
  return out;
};
// an upright limb: lit, with a shaded right side and a rib cut down it
function upright(p: Pen, u: number, v0: number, v1: number, r: number) {
  const o = limb([u, v0], [u, v1], r);
  p.face(o.map(B), 0.26, 0);
  p.face(limb([u + r * 0.52, v0], [u + r * 0.52, v1 - r * 0.25], r * 0.48).map(B), 0.1, 0);
  p.line([...o, o[0]].map(B), SH.edge, 0.7);
  p.line([[u - r * 0.3, v0 - r * 0.4], [u - r * 0.3, v1 + r * 0.45]].map((q) => B(q as P2)), SH.edge, 0.7);
}

export const cactus: Illustration = {
  k: "cactus", name: "Cactus", title: "It is empty out here", body: "Nothing has been added yet. Create something and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(Math.min(1, h * 1.4));
    p.translate(0, 0, -23);
    p.shadow(0, 0, 24, 11, 0.12);
    // the pot: a body, a wider rim, dark soil
    p.cylinder(0, 0, 0, 8.2, 8, { side: 0.12, top: 0.12, edge: 0 });
    p.cylinder(0, 0, 8, 10, 3, { side: 0.26, top: 0.26, edge: 0 });
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * 10, Math.sin(a) * 10, 8] as V3; }), SH.edge, 0.7);
    p.disc(0, 0, 11.03, 8.3, 0.04, 0);
    // the arms: each runs out from the trunk, then up
    const top = 35 + e * 1.4;
    const arm = (s: number, v: number, out: number, up: number) => {
      const j = limb([0, v], [s * out, v], 3.9);
      p.face(j.map(B), 0.26, 0);
      p.line([...j, j[0]].map(B), SH.edge, 0.7);
      upright(p, s * out, v, v + up, 3.9);
    };
    arm(-1, 20.5, 14.5, 8.5 + e * 1.2);
    arm(1, 24.5, 14, 7 + e * 1.2);
    upright(p, 0, 12.5, top, 6.4);
    // the flower
    const f = Math.max(0, (h - 0.45) / 0.55), pop = f < 0.65 ? ease(f / 0.65) * 1.18 : 1.18 - 0.18 * ease((f - 0.65) / 0.35);
    if (f > 0) {
      const [x, y] = p.pt(B([0.6, top + 5.4])), r = 3.7 * pop * (1 + 0.05 * Math.sin(t * 3));
      p.screen((g) => {
        g.fillStyle = "#000"; g.beginPath(); g.arc(x, y, r * 1.45, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#fff";
        for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = "#000"; g.beginPath(); g.arc(x, y, r * 0.3, 0, Math.PI * 2); g.fill();
      });
    }
  },
};
