// Nothing due: a tear off calendar block showing the 30th under two binder rings. Hover and a ring is drawn round the date, then a tick badge pops in.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const W = 11, D = 4, H = 24, HB = 6; // half width, half depth, height, header band height
/** number glyphs as strokes in [u, v], about 2.4 wide and 3.6 tall, centred */
const GLYPH: Record<string, [number, number][][]> = {
  "3": [[[-1.1, 1.5], [-0.3, 1.8], [0.8, 1.6], [1.1, 0.9], [0.4, 0.1], [-0.2, 0.1]], [[0.4, 0.1], [1.2, -0.7], [0.9, -1.6], [-0.2, -1.8], [-1.2, -1.4]]],
  "0": [[[0, 1.8], [0.9, 1.4], [1.2, 0], [0.9, -1.4], [0, -1.8], [-0.9, -1.4], [-1.2, 0], [-0.9, 1.4], [0, 1.8]]],
};

export const duedate: Illustration = {
  k: "duedate", name: "Due date", title: "Nothing due", body: "When a bill or a payment has a due date, it will be marked here so nothing slips.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 24, 11, 0.12);
    p.rotate("z", -0.42);
    // the block: a stack of pages, its sides cut into leaves
    p.box(-W, -D, 0, 2 * W, 2 * D, H, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
    for (let y = -D + 1.1; y < D; y += 1.1) p.line([[W + 0.03, y, 0.4], [W + 0.03, y, H - HB]], SH.edge, 0.4);
    const y = D + 0.04;
    // the header band, dark, with two binder rings standing out of the top
    p.face([[-W, y, H - HB], [W, y, H - HB], [W, y, H], [-W, y, H]], 0.06, 0);
    for (const x of [-5.5, 5.5]) {
      const ring: V3[] = Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (i / 12); return [x - Math.cos(a) * 1.6, 0.4, H - 2.4 + Math.sin(a) * 5] as V3; });
      const q = ring.map((v) => p.pt(v));
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.7; g.lineCap = "round"; g.beginPath(); q.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); });
    }
    // the date: two big cut digits
    const zc = (H - HB) / 2 + 0.4;
    for (const [n, cx] of [["3", -3.2], ["0", 3.2]] as [string, number][]) {
      for (const s of GLYPH[n]) p.line(s.map(([u, v]) => [cx + u * 2.2, y + 0.03, zc + v * 2.6] as V3), SH.edge, 1.4);
    }
    // the ring drawn round the date
    const k = ease(clamp(h / 0.6));
    if (k > 0) {
      const n = Math.max(2, Math.round(40 * k));
      p.line(Array.from({ length: n }, (_, i) => { const a = Math.PI * 0.6 + (i / 39) * Math.PI * 2.08; return [Math.cos(a) * 9, y + 0.05, zc + Math.sin(a) * 7.4] as V3; }), SH.edge, 1.1);
    }
    // the tick badge, tight on the block's top corner
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) {
      const r = (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)) * 4.4 + h * Math.sin(t * 3) * 0.1;
      const [x, yy] = p.pt([W, D, H + 1]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, yy, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - r * 0.48, yy + r * 0.02); g.lineTo(x - r * 0.12, yy + r * 0.38); g.lineTo(x + r * 0.5, yy - r * 0.34); g.stroke();
      });
    }
  },
};
