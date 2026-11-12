// Your portfolio is empty: a thick pie chart cut into four slices of different heights. Hover and the nearest slice slides out and lifts.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 15, DEG = Math.PI / 180;

// one slice from angle a0 to a1 (degrees), standing hgt tall, moved out by (ox, oy) and up by oz
function slice(p: Pen, a0: number, a1: number, hgt: number, top: number, ox = 0, oy = 0, oz = 0) {
  const n = Math.max(2, Math.round((a1 - a0) / 6));
  const at = (a: number, z: number, r = R): V3 => [ox + Math.cos(a * DEG) * r, oy + Math.sin(a * DEG) * r, oz + z];
  const c0: V3 = [ox, oy, oz], c1: V3 = [ox, oy, oz + hgt];
  // the two cut faces
  for (const [a, s] of [[a0, 1], [a1, -1]] as [number, number][]) {
    const nx = Math.sin(a * DEG) * s, ny = -Math.cos(a * DEG) * s; // the cut's outward normal
    if (nx + ny > 0.02) p.face([c0, at(a, 0), at(a, hgt), c1], ny > nx ? 0.12 : 0.065, SH.edge, 0.5);
  }
  // the round wall, where it looks at us
  for (let i = 0; i < n; i++) {
    const b0 = a0 + ((a1 - a0) * i) / n, b1 = a0 + ((a1 - a0) * (i + 1)) / n, m = ((b0 + b1) / 2) * DEG;
    if (Math.cos(m) + Math.sin(m) <= 0) continue;
    const s = clamp((Math.sin(m) - Math.cos(m)) * 0.6 + 0.5);
    p.face([at(b0, 0), at(b1, 0), at(b1, hgt), at(b0, hgt)], 0.065 + 0.06 * s, 0);
    p.line([at(b0, 0), at(b1, 0)], SH.edge, 0.55);
  }
  for (const a of [a0, a1]) if (Math.cos(a * DEG) + Math.sin(a * DEG) > 0) p.line([at(a, 0), at(a, hgt)], SH.edge, 0.5);
  p.face([c1, ...Array.from({ length: n + 1 }, (_, i) => at(a0 + ((a1 - a0) * i) / n, hgt))], top, SH.edge, 0.6);
}

export const portfolio: Illustration = {
  k: "portfolio", name: "Pie portfolio", title: "Your portfolio is empty", body: "Add your first holding to see how your money is spread.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-3, -3, -5);
    p.shadow(3, 3, 32, 16, 0.1);
    const k = ease(clamp(h / 0.75));
    const bob = h > 0.75 ? Math.sin(t * 2.4) * 0.5 : 0;
    // back to front
    const G = 1.5; // the gap that keeps the slices apart
    const apart = (a0: number, a1: number, hgt: number, top: number) => { const c = ((a0 + a1) / 2) * DEG; slice(p, a0, a1, hgt, top, Math.cos(c) * G, Math.sin(c) * G); };
    apart(190, 280, 10, 0.2);
    apart(280, 365, 4.5, 0.15);
    apart(85, 190, 6.5, 0.24);
    const m = 45 * DEG, out = G + 8 * k;
    p.guide([[Math.cos(m) * (R + 3), Math.sin(m) * (R + 3), 0], [Math.cos(m) * (R + 12), Math.sin(m) * (R + 12), 0]], true);
    slice(p, 5, 85, 7.5, 0.32 + 0.2 * k, Math.cos(m) * out, Math.sin(m) * out, bob * k);
  },
};
