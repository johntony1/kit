// No beauty items yet: one lipstick standing with its angled bullet up, its cap lying beside it. Hover and the bullet twists up further with a sparkle.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735, Q = 1.2247;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// the near half of a round edge at height z, as a cut
const seam = (p: Pen, x: number, y: number, z: number, r: number) => p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [x + Math.cos(a) * r, y + Math.sin(a) * r, z] as V3; }), SH.edge, 0.8);
const RB = 6.6, RS = 5.2, RL = 4.1, CR = 6.9, CL = 13; // radii of the base, the sleeve and the bullet; the cap's radius and length

export const lipstick: Illustration = {
  k: "lipstick", name: "Lipstick", title: "No beauty items yet", body: "Beauty items you save will be lined up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(-2, 2, -22);
    p.scale(1.22);
    p.shadow(0, 0, 25, 12, 0.12);
    // the cap, lying on its side with its open end toward us
    const cx = 3, cy = -11.5;
    const ring = (x: number, a: number, r = CR): V3 => [x, cy + Math.cos(a) * r, CR + Math.sin(a) * r];
    const arc = (x: number, a0: number, a1: number, n = 18) => Array.from({ length: n + 1 }, (_, i) => ring(x, a0 + ((a1 - a0) * i) / n));
    p.face([...arc(cx, -Math.PI / 4, Math.PI * 0.75), ring(cx + CL, Math.PI * 0.75), ring(cx + CL, -Math.PI / 4)], 0.12, 0);
    p.face([...arc(cx, Math.PI * 0.3, Math.PI * 0.75), ...arc(cx + CL, Math.PI * 0.75, Math.PI * 0.3)], 0.26, 0);
    p.ringV("x", [cx + CL, cy, CR], CR, 0.26, 0);
    p.clear(arc(cx + CL, 0, Math.PI * 2, 30).map(([x, y, z]) => [x + 0.02, cy + (y - cy) * 0.74, CR + (z - CR) * 0.74] as V3));
    p.line(arc(cx + CL, 0, Math.PI * 2, 30), SH.edge, 0.7);
    // the lipstick: a base, a narrower bright sleeve, then the bullet
    const x = -7, y = 6, zs = 15, zb = zs + 5.5;
    p.cylinder(x, y, 0, RB, zs, { side: 0.12, top: 0.26, edge: 0 });
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [x + Math.cos(a) * RB, y + Math.sin(a) * RB, zs - 2.2] as V3; }), SH.edge, 0.7);
    p.cylinder(x, y, zs, RS, 5.5, { side: 0.28, top: 0.12, edge: 0 });
    seam(p, x, y, zs, RS);
    // the bullet: a round stick cut at a slant, higher on the left
    const hl = 12.5 + e * 3.5, hr = hl - 6, w = RL * Q, mid = (hl + hr) / 2, s = (hl - hr) / 2;
    p.push();
    p.translate(x, y, zb);
    const cut = (a: number): P2 => [w * Math.cos(a), mid + 0.707 * RL * Math.sin(a) - s * Math.cos(a)];
    const side: P2[] = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI; side.push([w * Math.cos(a), 0.707 * RL * Math.sin(a)]); }
    for (let i = 0; i <= 14; i++) side.push(cut((i / 14) * Math.PI));
    p.face(side.map(B), 0.11, 0);
    const tip = Array.from({ length: 28 }, (_, i) => cut((i / 28) * Math.PI * 2));
    p.face(tip.map(B), 0.3, 0);
    p.line([...tip, tip[0]].map(B), SH.edge, 0.7);
    p.pop();
    seam(p, x, y, zb, RL);
    // a sparkle by the tip
    const k = Math.max(0, (h - 0.55) / 0.45);
    if (k > 0) {
      const [sx, sy] = p.pt([x + 9, y - 9, zb + hl + 4]), r = k * (3 + 0.8 * Math.sin(t * 3.4));
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, q = i % 2 ? r * 0.3 : r; g.lineTo(sx + Math.cos(a) * q, sy + Math.sin(a) * q); } g.closePath(); g.fill(); });
    }
  },
};
