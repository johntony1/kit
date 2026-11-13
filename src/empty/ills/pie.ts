// No desserts yet: a round pie in its fluted dish, a crimped crust and vents cut in the top. Hover and a slice slides out toward you, the filling showing in the gap.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 16, H = 7; // radius and height of the pie
const A0 = Math.PI / 4 - 0.45, A1 = Math.PI / 4 + 0.45; // the slice, centred on the side facing us
const arc = (r: number, z: number, a0: number, a1: number, n = 16): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
const at = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];

/** a sector of the pie from a0 to a1: its fluted side, its lit crust top with vents, its crimped rim */
function sector(p: Pen, a0: number, a1: number) {
  for (const o of [0, Math.PI * 2]) {
    const s0 = Math.max(a0, -Math.PI / 4 + o), s1 = Math.min(a1, (3 * Math.PI) / 4 + o);
    if (s1 <= s0) continue;
    p.face([...arc(R - 1.2, 0, s0, s1, 30), ...arc(R, H - 1.4, s0, s1, 30).reverse()], 0.07, 0);
    for (let a = s0 + 0.12; a < s1; a += 0.22) p.line([at(a, R - 1.1, 0.4), at(a, R + 0.05, H - 1.8)], SH.edge, 0.55);
  }
  const full = a1 - a0 > 6;
  p.face(full ? arc(R, H, 0, Math.PI * 2, 60) : [[0, 0, H], ...arc(R, H, a0, a1, 30)], 0.2, 0);
  // the crimped rim: a bright band cut with short notches
  p.face([...arc(R + 0.4, H - 1.4, a0, a1, 40), ...arc(R + 0.4, H + 0.2, a0, a1, 40).reverse()], 0.3, 0);
  for (let a = a0 + 0.1; a < a1 - 0.05; a += 0.2) p.line([at(a, R + 0.45, H - 1.2), at(a, R + 0.45, H + 0.1)], SH.edge, 0.6);
  p.line(arc(R - 2.6, H + 0.03, a0, a1, 40), SH.edge, 0.6);
  // short slits, one per slice, pointing to the middle
  for (let i = 0; i < 7; i++) {
    const a = Math.PI / 4 + (i * Math.PI * 2) / 7, w = a > a1 ? a - Math.PI * 2 : a;
    if ((a > a0 && a < a1) || (w > a0 && w < a1) || (a + Math.PI * 2 > a0 && a + Math.PI * 2 < a1)) p.line([at(a, 4.5, H + 0.05), at(a, 8.5, H + 0.05)], SH.edge, 0.9);
  }
}

export const pie: Illustration = {
  k: "pie", name: "Pie", title: "No desserts yet", body: "Add a dessert to the menu and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h), out = 10 * k, lift = 5 * k + (h > 0.5 ? Math.sin(t * 2.6) * 0.5 * h : 0);
    p.translate(-1.5, -1.5, -5);
    p.scale(1.1);
    p.shadow(0, 0, 30, 15, 0.1);
    if (h < 0.01) { sector(p, 0, Math.PI * 2); return; }
    // the rest of the pie, and the gap the slice leaves: dark filling walls
    sector(p, A1, A0 + Math.PI * 2);
    const c0 = at(A0, R - 1, 0), c1 = at(A1, R - 1, 0);
    p.face([[0, 0, 0.3], ...arc(R - 1.2, 0.3, A0, A1)], 0.03, 0);
    p.face([[0, 0, 0], c1, [c1[0], c1[1], H], [0, 0, H]], 0.065, 0);
    p.face([[0, 0, 0], c0, [c0[0], c0[1], H], [0, 0, H]], 0.1, 0);
    p.line([[0, 0, H - 0.8], [c0[0], c0[1], H - 0.8]], SH.edge, 0.6);
    // the slice, slid out toward us
    p.push();
    p.translate(out * Math.SQRT1_2, out * Math.SQRT1_2, lift);
    sector(p, A0, A1);
    p.pop();
  },
};
