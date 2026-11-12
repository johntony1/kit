// Violin: a big violin facing us, a pinched waist, two f holes, a neck and a scroll. Hover and a bow draws across the strings while two notes drift up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const T = 1.8; // half thickness of the body
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** half width of the body at height v: a wide lower bout, a pinched waist with corners, a smaller upper bout */
const half = (v: number) => v < 13.6 ? Math.sqrt(Math.max(0, 81 - (v - 8.6) * (v - 8.6))) * 1.02 : v < 19 ? 4.3 + 0.24 * (v - 16.3) * (v - 16.3) : Math.sqrt(Math.max(0, 47.6 - (v - 22.6) * (v - 22.6)));
const TOP = 29.4;
const OUT: [number, number][] = (() => {
  const r: [number, number][] = [], N = 48;
  for (let i = 0; i <= N; i++) { const v = TOP * (0.5 - 0.5 * Math.cos((i / N) * Math.PI)); r.push([half(v), v]); }
  for (let i = N - 1; i > 0; i--) { const v = TOP * (0.5 - 0.5 * Math.cos((i / N) * Math.PI)); r.push([-half(v), v]); }
  return r;
})();
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };
function note(p: Pen, at: V3, s: number, a: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 0.9 * s; g.lineCap = "round";
    g.beginPath(); g.ellipse(x, y, 1.7 * s, 1.3 * s, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x + 1.5 * s, y - 0.2 * s); g.lineTo(x + 1.5 * s, y - 5.4 * s); g.lineTo(x + 3.8 * s, y - 4.2 * s); g.stroke();
  });
}

export const violin: Illustration = {
  k: "violin", name: "Violin", title: "No recordings yet", body: "Record a take and it will be saved here to play back.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -19);
    p.shadow(-3, 0, 20, 9, 0.1);
    p.translate(0, 0, 19);
    p.rotate("z", -0.62);
    p.rotate("y", 0.42 + h * Math.sin(t * 2.6) * 0.02);
    p.scale(0.94);
    p.translate(0, 0, -22);
    // the body: the rim that shows, then the lit top
    const front: V3[] = OUT.map(([u, v]) => [u, T, v]), back: V3[] = OUT.map(([u, v]) => [u, -T, v]);
    const sign = area(p, front);
    for (let i = 0; i < OUT.length; i++) {
      const j = (i + 1) % OUT.length, q = [front[i], front[j], back[j], back[i]];
      if (area(p, q) * sign < 0) p.face(q, 0.07, 0);
    }
    p.face(front, 0.3, 0);
    const y = T + 0.03;
    // the neck, the pegbox with its pegs, and the scroll
    p.box(-1.5, T - 1.8, TOP - 0.5, 3, 1.8, 10.5, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
    p.box(-2, T - 1.8, TOP + 10, 4, 1.8, 4.4, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
    for (const z of [TOP + 11, TOP + 13.2]) p.box(-3.8, T - 1.4, z, 7.6, 1, 1, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
    p.ringV("y", [0.6, T, TOP + 16.2], 2.8, 0.3, 0);
    p.dot([0.6, T + 0.05, TOP + 16.2], 0.9, 0);
    // the fingerboard and the tailpiece: dark on the lit top
    p.clear([[-1.3, y, 18], [1.3, y, 18], [1.1, y, TOP + 0.5], [-1.1, y, TOP + 0.5]]);
    p.clear([[-0.8, y, 8], [0.8, y, 8], [1.4, y, 2.4], [-1.4, y, 2.4]]);
    // the two f holes and the bridge, as cuts
    for (const s of [-1, 1]) {
      p.line([[s * 3.5, y, 16.6], [s * 4.6, y, 15.2], [s * 4.2, y, 12.2], [s * 5.4, y, 10.8]], SH.edge, 0.8);
    }
    p.line([[-2.4, y, 12.6], [2.4, y, 12.6]], SH.edge, 0.7);
    // the bow: slides in across the strings and draws back and forth
    const k = clamp(h / 0.5);
    if (k > 0) {
      const s = -5 * (1 - ease(k)) + h * Math.sin(t * 2.6) * 2.5, yb = T + 1.6;
      const q = ([[s - 12.5, yb, 13.6], [s + 12.5, yb, 15.4]] as V3[]).map((v) => p.pt(v));
      const stroke = (lw: number, col: string) => p.screen((g) => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); g.moveTo(q[0][0], q[0][1]); g.lineTo(q[1][0], q[1][1]); g.stroke(); });
      if (p.ink) p.line([[s - 12.5, yb, 13.6], [s + 12.5, yb, 15.4]], SH.edge, 1);
      else { stroke(2.6, `rgba(0,0,0,${k})`); stroke(1.3, `rgba(255,255,255,${k})`); }
    }
    // the notes, in the open corner beside the neck
    for (let i = 0; i < 2; i++) {
      const n = clamp((h - 0.35 - i * 0.2) / 0.45);
      if (n <= 0) continue;
      note(p, [-11 + i * 4, y, 28 + i * 7 + 3 * n + Math.sin(t * 2.2 + i * 2) * 0.6], 1 + 0.25 * n, Math.min(1, n * 2));
    }
  },
};
