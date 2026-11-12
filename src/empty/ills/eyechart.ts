// Eye chart: a standing chart of tumbling E marks that shrink row by row. Hover and a reading frame steps down the rows, then a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const YF = 0.83; // the chart's face
// the E mark as strokes in a unit square, and its four turns
const E: [number, number][][] = [[[0.8, 1], [-0.8, 1], [-0.8, -1], [0.8, -1]], [[-0.8, 0], [0.6, 0]]];
const turn = (r: number, [u, v]: [number, number]): [number, number] => (r === 0 ? [u, v] : r === 1 ? [-v, u] : r === 2 ? [-u, -v] : [v, -u]);
const ROWS = [
  { z: 26.4, s: 4.4, xs: [0], lw: 1.7 },
  { z: 15.6, s: 2.9, xs: [-5.2, 5.2], lw: 1.4 },
  { z: 8.6, s: 0.6, xs: [], lw: 1 },
];

// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}

export const eyechart: Illustration = {
  k: "eyechart", name: "Eye chart", title: "No eye tests yet", body: "Book an eye test and your results will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -18);
    p.scale(1.06);
    p.shadow(0, 1, 24, 11, 0.11);
    p.rotate("z", -0.4);
    // the stand: two feet and two legs
    for (const x of [-8.6, 7.4]) {
      p.box(x - 0.4, -2.6, 0, 2, 5.2, 0.9, { top: 0.22, left: 0.12, right: 0.07, lw: 0.5 });
      p.box(x, -0.6, 0.9, 1.2, 1.2, 4.6, { top: 0.2, left: 0.2, right: 0.1, edge: 0 });
    }
    // the board
    p.box(-11.5, -0.8, 5, 23, 1.6, 28.5, { top: 0.3, left: 0.3, right: 0.08, lw: 0.6 });
    // the rows of marks, each smaller than the last
    ROWS.forEach((row, ri) => row.xs.forEach((cx, i) => {
      for (const st of E) p.line(st.map((q) => { const [u, v] = turn((ri + i * 2) % 4, q); return [cx + u * row.s, YF + 0.03, row.z + v * row.s] as V3; }), SH.edge, row.lw);
    }));
    for (const [z, w] of [[9.6, 8.6], [7.4, 6]]) p.line([[-w, YF + 0.03, z], [w, YF + 0.03, z]], SH.edge, 1.1);
    // the reading frame steps down the rows
    if (h > 0.03) {
      const q = ease(clamp(h / 0.8)) * 2, i = Math.min(1, Math.floor(q)), m = ease(q - i), a = ROWS[i], b = ROWS[i + 1];
      const z = a.z + (b.z - a.z) * m, s = a.s + (b.s - a.s) * m + 1.5, fr: V3[] = [[-10.2, YF + 0.05, z - s], [10.2, YF + 0.05, z - s], [10.2, YF + 0.05, z + s], [-10.2, YF + 0.05, z + s], [-10.2, YF + 0.05, z - s]];
      if (p.ink) p.guide(fr, true); else glow(p, fr, 0.9, clamp(h * 4));
    }
    const b = clamp((h - 0.75) / 0.25);
    if (b > 0) badge(p, [12, 0, 34], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
