// Nothing has bloomed yet: a daisy on a tall stem with two leaves. Its bud opens into a full bloom, holds, then folds back up.
import { SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const P = 4; // seconds per loop
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const HZ = 21; // height of the flower head
/** an oval petal from (cx, cz) pointing along a, len long and w wide */
const petal = (cx: number, cz: number, a: number, len: number, w: number, n = 20): P2[] => Array.from({ length: n }, (_, i) => {
  const b = (i / n) * Math.PI * 2, u = (1 - Math.cos(b)) / 2 * len, v = Math.sin(b) * w;
  return [cx + Math.cos(a) * u - Math.sin(a) * v, cz + Math.sin(a) * u + Math.cos(a) * v];
});
const circle = (cx: number, cz: number, r: number, n = 28): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });

export const flower: Illustration = {
  k: "flower", name: "Flower", title: "Nothing has bloomed yet", body: "Give it a little time. What you plant today will bloom here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const open = ease(clamp((u - 0.04) / 0.32)) * (1 - ease(clamp((u - 0.74) / 0.22)));
    const sway = Math.sin(u * Math.PI * 2) * 0.8;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 12, 5, 0.1);
    p.rotate("z", -0.6); // turned to face us
    const hx = sway, hz = HZ;
    // the stem: a bright stalk, bending a little with the head
    const stem = Array.from({ length: 12 }, (_, i) => { const k = i / 11; return [hx * k * k, hz * k] as P2; });
    const sp = stem.map(([x, z]) => p.pt([x, 0, z]));
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 2.4; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); sp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
    // two leaves on the stem, a lit one and a shaded one
    p.face(at(petal(0.2, 4, 0.5, 10, 3.2), 0.2), 0.28, 0);
    p.face(at(petal(0.2, 6.5, Math.PI - 0.55, 9, 2.8), -0.2), 0.12, 0);
    p.line(at([[0.6, 4.2], [8.6, 8.7]], 0.25), SH.edge, 0.6);
    // the petals: shut tight in a bud, they spread out and grow into a ring
    const n = 6, len = 4.6 + 8.4 * open, w = 2.2 + 2.6 * open;
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => Math.sin(((b + 0.5) / n) * Math.PI * 2) - Math.sin(((a + 0.5) / n) * Math.PI * 2));
    for (const i of order) {
      const a0 = ((i + 0.5) / n) * Math.PI * 2, a = Math.PI / 2 + Math.atan2(Math.sin(a0 - Math.PI / 2), Math.cos(a0 - Math.PI / 2)) * (0.22 + 0.78 * open);
      p.face(at(petal(hx, hz, a, len + 0.7, w + 0.7), 0.33), 0.02, 0);
      p.face(at(petal(hx, hz, a, len, w), 0.35), 0.3, 0);
    }
    // the middle of the flower
    const r = 2.4 + 3 * open;
    p.face(at(circle(hx, hz, r + 0.8), 0.4), 0.02, 0);
    p.face(at(circle(hx, hz, r), 0.45), 0.12, 0);
    if (open > 0.3) p.dot([hx - r * 0.3, 0.5, hz + r * 0.3], r * 0.35, 0.4);
  },
};
