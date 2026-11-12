// All quiet for now: a padded sleep mask with two closed eyes cut into it, its strap looping behind. Hover and it floats up as three z marks drift off.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
// the mask's outline in its own plane: a rounded band with a notch for the nose
const outline = (k = 1): [number, number][] => Array.from({ length: 56 }, (_, i) => {
  const a = (i / 56) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  const u = 14.5 * Math.sign(c) * Math.pow(Math.abs(c), 0.6), v0 = 7 * Math.sign(s) * Math.pow(Math.abs(s), 0.8);
  return [u * k, (s < 0 ? v0 + 3.6 * Math.exp(-(u * u) / 9) * Math.min(1, -s * 3) : v0) * k] as [number, number];
});
// a z mark, flat to the screen
const zed = (p: Pen, at: V3, s: number, v: number) => {
  if (v <= 0.02 || s <= 0.1) return;
  const [x, y] = p.pt(at), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = Math.max(0.7, s * 0.32); g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y - s); g.lineTo(x - s, y + s); g.lineTo(x + s, y + s); g.stroke(); });
};

export const sleepmask: Illustration = {
  k: "sleepmask", name: "Sleep mask", title: "All quiet for now", body: "Nothing needs you right now. New activity will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(-2, -2, -9);
    p.shadow(0, 0, 25, 11, 0.11);
    p.rotate("z", -Math.PI / 4); // turned to face us: x runs across the screen
    const ZC = 9 + 4 * e + h * Math.sin(t * 1.8) * 0.6;
    p.push();
    p.rotate("x", 0.3 - 0.1 * e, [0, 0, ZC]);
    p.rotate("y", h * Math.sin(t * 1.3) * 0.05, [0, 0, ZC]);
    // the strap: a band looping round behind
    const strap = (z: number): V3[] => Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI; return [14 * Math.cos(a), -24 * Math.sin(a), ZC + z] as V3; });
    p.face([...strap(-1.6), ...strap(1.6).reverse()], 0.16, SH.edge, 0.6);
    // the mask: a padded edge, then the lit front
    const o = outline();
    for (let d = 4; d >= 1; d--) p.face(o.map(([u, v]) => [u, -d * 0.45, ZC + v] as V3), 0.08, 0);
    p.face(o.map(([u, v]) => [u, 0, ZC + v] as V3), 0.25, SH.edge, 0.6);
    const st = outline(0.85).map(([u, v]) => [u, 0.03, ZC + v] as V3);
    p.line([...st, st[0]], SH.edge, 0.4);
    // two closed eyes
    for (const s of [-1, 1]) {
      const cx = s * 6.8, cz = ZC + 3.6, on = (a: number, r: number): V3 => [cx + Math.cos(a) * r, 0.03, cz + Math.sin(a) * r];
      p.line(Array.from({ length: 11 }, (_, i) => on(Math.PI * (1.12 + (i / 10) * 0.76), 3.8)), SH.edge, 1.2);
    }
    p.pop();
    // the z marks, one after another
    for (let i = 0; i < 3; i++) {
      const k = ease(clamp((h - 0.25 - 0.2 * i) / 0.35));
      zed(p, [9 + 4.5 * i + Math.sin(t * 1.6 + i) * 0.5 * h, 0, ZC + 10 + 5.2 * i + 2 * k], (1.5 + 0.7 * i) * k, k);
    }
  },
};
