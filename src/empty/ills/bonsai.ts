// Nothing pruned yet: a bonsai in a low tray pot, a twisting trunk carrying three round leaf pads. Hover and the pads puff up one after another and sway.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const back = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2));
// the leaf pads: centre x, centre z, half width, half height
const PADS: [number, number, number, number][] = [[-12, 21, 8.5, 4.6], [11.5, 26, 7.5, 4.2], [-1, 35, 10, 5.2]];

function pad(p: Pen, cx: number, cz: number, rx: number, rz: number) {
  const ell = (k: number, a0 = 0, a1 = Math.PI * 2, n = 36): P2[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * rx * k * (1 + 0.08 * Math.sin(a * 5)), cz + Math.sin(a) * rz * k] as P2; });
  for (let y = -2; y < 0; y += 0.5) p.face(at(ell(1), y), 0.08, 0);
  p.face(at(ell(1), 0), 0.26, 0);
  // the underside in shade
  const lo = ell(1, Math.PI * 1.05, Math.PI * 1.95, 14);
  p.face(at([...lo, ...lo.slice().reverse().map(([x, z]) => [x, z + rz * 0.75] as P2)], 0.02), 0.07, 0);
  p.line(at(ell(1), 0.03), SH.edge, 0.6);
}

export const bonsai: Illustration = {
  k: "bonsai", name: "Bonsai", title: "Nothing pruned yet", body: "Add your first item and you can start shaping it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -20);
    p.shadow(0, 0, 26, 12, 0.12);
    p.rotate("z", -0.6);
    // the pot: a low tray on small feet, dark soil on top
    for (const [x, y] of [[-12, -6], [9.6, -6], [-12, 4.4], [9.6, 4.4]]) p.box(x, y, 0, 2.4, 1.6, 1.4, { edge: 0 });
    p.box(-14, -7, 1.4, 28, 14, 7, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    p.box(-12.6, -5.6, 8.39, 25.2, 11.2, 0.02, { top: 0.04, left: 0.04, right: 0.04, edge: 0 });
    p.face([[-14, 7.03, 7], [14, 7.03, 7], [14, 7.03, 8.4], [-14, 7.03, 8.4]], 0.3, 0);
    p.line([[-14, 7.03, 7], [14, 7.03, 7]], SH.edge, 0.6);
    // the trunk: twisting up from the soil, branching to each pad
    const trunk: P2[] = [[-3.4, 8.4], [3.6, 8.4], [2.4, 11], [5.8, 16], [10.5, 23], [8.6, 24], [4, 19], [1.2, 22], [0.4, 33], [-1.8, 33], [-2, 24], [-6, 19.5], [-11, 19], [-10.6, 17.2], [-4.6, 16.8], [-1.4, 12.6]];
    p.face(at(trunk, 0.4), 0.22, 0);
    p.face(at([[0.4, 8.4], [3.6, 8.4], [2.4, 11], [5.8, 16], [10.5, 23], [9.6, 23.6], [4.6, 17], [1, 12]], 0.45), 0.07, 0);
    p.line(at([...trunk, trunk[0]], 0.5), SH.edge, 0.55);
    // the pads puff up one after another, swaying while hovered
    PADS.forEach(([x, z, rx, rz], i) => {
      const k = 1 + 0.12 * back(clamp((h - i * 0.2) / 0.5));
      const s = h * Math.sin(t * 2.2 + i) * 0.5;
      p.push(); p.translate(0, 0.6 + i * 0.1, 0);
      pad(p, x + s, z, rx * k, rz * k);
      p.pop();
    });
  },
};
