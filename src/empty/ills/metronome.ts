// Metronome: the classic tall pyramid case seen front on, a scale of ticks cut into its face, a thick pendulum rod with its weight. The rod swings from side to side, out past the edge of the case, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4;
const B = 11.8, BD = 5, TW = 4.7, TD = 2.4, Z0 = 3.4, Z1 = 37; // base half width and depth, top half width and depth, body bottom and top
// a point on the leaning front: u across (-1..1), v up (0..1)
const fr = (u: number, v: number, lift = 0.03): V3 => [u * (B + (TW - B) * v), BD + (TD - BD) * v + lift, Z0 + (Z1 - Z0) * v];
// a bright stroke with a dark gap round it
function stroke(p: Pen, pts: V3[], lw: number, gap: number) {
  if (p.ink) { p.line(pts, SH.edge, 1); return; }
  const q = pts.map((a) => p.pt(a));
  const run = (g: CanvasRenderingContext2D, w: number, c: string) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = "butt"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
  p.screen((g) => { if (gap > 0) run(g, lw + gap, "#000"); run(g, lw, "#fff"); });
}

export const metronome: Illustration = {
  k: "metronome", name: "Metronome", title: "No tempo set", body: "Set a tempo to start the click and keep time.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const a = 0.36 * Math.sin(((t / P) % 1) * Math.PI * 2);
    p.translate(0, 0, -19);
    p.shadow(0, 3, 22, 9, 0.12);
    p.rotate("z", -Math.PI / 4);
    // the plinth, then the case: one tall solid face leaning back to a small flat top
    p.box(-B - 1.8, -BD - 1.4, 0, B * 2 + 3.6, BD * 2 + 2.8, Z0, { top: 0.3, left: 0.2, right: 0.05, edge: 0 });
    p.face([[-TW, TD, Z1], [TW, TD, Z1], [TW, -TD, Z1], [-TW, -TD, Z1]], 0.2, 0);
    p.face([fr(-1, 0, 0), fr(1, 0, 0), fr(1, 1, 0), fr(-1, 1, 0)], 0.3, 0);
    p.line([fr(-1, 0), fr(1, 0)], SH.edge, 0.8);
    // the scale: ticks cut down the middle
    for (let i = 0; i < 4; i++) { const m = fr(0, 0.5 + i * 0.12); p.line([[-2.2, m[1], m[2]], [2.2, m[1], m[2]]], SH.edge, 0.9); }
    // the rod swings about a pivot low on the face, out past the edge of the case, its weight riding on it
    const piv = fr(0, 0.13, 0.4), L = 30, lean = (TD - BD) / (Z1 - Z0);
    const at = (s: number, w = 0): V3 => [piv[0] + Math.sin(a) * s + Math.cos(a) * w, piv[1] + Math.cos(a) * s * lean, piv[2] + Math.cos(a) * s - Math.sin(a) * w];
    stroke(p, [at(0), at(L)], 2.2, 3);
    const wt = [at(7.4, -3.5), at(7.4, 3.5), at(13.6, 2.6), at(13.6, -2.6)];
    p.line([...wt, wt[0]], SH.edge, 2.2);
    if (!p.ink) p.screen((g) => { g.fillStyle = "#000"; g.beginPath(); wt.map((q) => p.pt(q)).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.lineWidth = 3; g.lineJoin = "round"; g.strokeStyle = "#000"; g.stroke(); g.fill(); });
    p.face(wt, 0.3, 0);
    p.dot(piv, 2.3, 0);
    p.dot(piv, 1.6, 1);
  },
};
