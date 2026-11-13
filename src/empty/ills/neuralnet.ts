// No model trained: a neural net, one big node in the middle and six around it, all joined by bright threads. A signal runs out along each thread in turn and lights the node it reaches, round and round.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const RING = 18, N = 6;
const at = (c: V3, a: number, b: number): V3 => [c[0] + a * 0.577, c[1] - a * 0.577, c[2] + b];
const circle = (c: V3, r: number): V3[] => Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return at(c, Math.cos(a) * r, Math.sin(a) * r); });

/** a ball facing us: a dark disc, a lit disc up and to the left, a bright cap; g lights it */
function ball(p: Pen, c: V3, r: number, g: number) {
  p.face(circle(c, r), 0.07 + 0.08 * g, SH.edge, 0.55);
  p.face(circle(at(c, -0.16 * r, 0.16 * r), r * 0.76), 0.13 + 0.12 * g, 0);
  p.face(circle(at(c, -0.32 * r, 0.32 * r), r * 0.38), 0.24 + 0.5 * g, 0);
}

export const neuralnet: Illustration = {
  k: "neuralnet", name: "Neural net", title: "No model trained", body: "Add some training data and start a run. Your model will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -18);
    p.shadow(0, 0, 26, 11, 0.12);
    const C: V3 = [0, 0, 19];
    const nodes = Array.from({ length: N }, (_, i) => { const a = Math.PI / 2 + (i / N) * Math.PI * 2; return at(C, Math.cos(a) * RING, Math.sin(a) * RING * 0.92); });
    // signal i leaves the centre at i / N and reaches node i a little later
    const prog = (i: number) => (((u - i / N) % 1) + 1) % 1 / 0.22;
    const glow = (i: number) => { const k = prog(i); return k < 1 ? 0 : Math.max(0, 1 - (k - 1) / 1.4); };
    // the threads: the ring and the spokes, then the signal dots on them
    p.screen((g) => {
      const c = p.pt(C), q = nodes.map((n) => p.pt(n));
      g.lineCap = "round";
      g.strokeStyle = "#fff"; g.lineWidth = 1.8;
      g.beginPath();
      q.forEach(([x, y], i) => { const [x2, y2] = q[(i + 1) % N]; g.moveTo(x, y); g.lineTo(x2, y2); g.moveTo(c[0], c[1]); g.lineTo(x, y); });
      g.stroke();
      q.forEach(([x, y], i) => {
        const k = prog(i);
        if (k >= 1) return;
        g.fillStyle = "#fff";
        g.beginPath(); g.arc(c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k, 1.6, 0, Math.PI * 2); g.fill();
      });
    });
    // back nodes first (the top ones are further away), the centre, then the front ones
    const order = nodes.map((n, i) => ({ n, i })).sort((a, b) => b.n[2] - a.n[2]);
    for (const { n, i } of order.slice(0, 3)) ball(p, n, 5.4, glow(i));
    ball(p, C, 8, 0.25 + 0.25 * Math.max(...nodes.map((_, i) => (prog(i) < 0.3 ? 1 - prog(i) / 0.3 : 0))));
    for (const { n, i } of order.slice(3)) ball(p, n, 5.4, glow(i));
  },
};
