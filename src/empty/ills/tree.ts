// Your tree is empty: a round leafy tree on a forked trunk. Hover and three fruits pop onto its crown one after another.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const D = 2.4; // thickness of the crown
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
const circle = (cx: number, cz: number, r: number, n = 36): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
// the crown: one big round with smaller rounds bulging out of it
const LUMPS: [number, number, number][] = [[0, 24, 12.5], [-9, 19.5, 8.2], [9, 20, 8.4], [-6, 31, 8], [6.5, 31.5, 7.8]];
const overshoot = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2));

function fruit(p: Pen, x: number, z: number, k: number) {
  if (k <= 0.02) return;
  const [sx, sy] = p.pt([x, 0.6, z]), r = 2.5 * k;
  p.screen((g) => {
    g.fillStyle = "#000"; g.beginPath(); g.arc(sx, sy, r + 0.9, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#000"; g.lineWidth = 0.7; g.beginPath(); g.arc(sx, sy, r * 0.55, 3.6, 4.6); g.stroke();
  });
}

export const tree: Illustration = {
  k: "tree", name: "Tree", title: "Your tree is empty", body: "Add the first branch and it will start to grow from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -20);
    p.shadow(0, 0, 16, 7, 0.1);
    p.rotate("z", -0.6); // turned to face us
    // the trunk with a fork, in front of the shade under the crown
    p.face(at([[-2.8, 0], [2.8, 0], [2, 11], [6, 16], [4.2, 17.6], [0.4, 13.4], [-3.8, 17.8], [-5.6, 16.2], [-2, 11]], 0.4), 0.22, 0);
    p.face(at([[0.6, 0], [2.8, 0], [2, 11], [0.8, 12.4]], 0.45), 0.07, 0);
    // the crown: a shaded rim behind, a dark outline, then the lit lumps
    const sway = h * Math.sin(t * 2) * 0.4;
    const crown = (y: number, f: number, grow: number) => { for (const [x, z, r] of LUMPS) p.face(at(circle(x + sway * (z / 20), z + 3, r + grow), y), f, 0); };
    for (let y = -D; y < 0; y += 0.45) crown(y, 0.08, 0);
    crown(0, 0.02, 0.8);
    crown(0, 0.28, 0);
    // a shaded underside on the lower right of the lumps
    for (const [x, z, r] of LUMPS.slice(0, 3)) {
      const q: P2[] = [];
      for (let i = 0; i <= 14; i++) { const a = -2.2 + (i / 14) * 2.2; q.push([x + sway * (z / 20) + Math.cos(a) * r, z + 3 + Math.sin(a) * r]); }
      for (let i = 14; i >= 0; i--) { const a = -2.2 + (i / 14) * 2.2; q.push([x + sway * (z / 20) + Math.cos(a) * r * 0.7 - 1.6, z + 3 + Math.sin(a) * r * 0.7 + 1.6]); }
      p.face(at(q, 0.03), 0.1, 0);
    }
    // the fruits pop in one after another
    ([[-7, 29], [6, 34], [3, 21]] as P2[]).forEach(([x, z], i) => fruit(p, x + sway, z + 3, overshoot(clamp((h - 0.15 - i * 0.22) / 0.35))));
  },
};
