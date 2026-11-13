// No replies yet: a thick curved reply arrow standing up. Hover and it pulls back and springs forward, then a small speech bubble badge pops in.
import { type Illustration, type V3 } from "../dots";

type Q = [number, number][];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// the shaft: a band that runs right from the head and curls down, between two arcs round (3, 4)
const SHAFT: Q = (() => {
  const out: Q = [[-6, 20]], N = 18, end = Math.PI / 2 + 0.45;
  for (let i = 0; i <= N; i++) { const a = Math.PI / 2 - (i / N) * end; out.push([3 + Math.cos(a) * 16, 4 + Math.sin(a) * 16]); }
  for (let i = N; i >= 0; i--) { const a = Math.PI / 2 - (i / N) * end; out.push([3 + Math.cos(a) * 8, 4 + Math.sin(a) * 8]); }
  out.push([-6, 12]);
  return out;
})();
const HEAD: Q = [[-18, 16], [-5, 28.5], [-5, 3.5]];

export const reply: Illustration = {
  k: "reply", name: "Reply", title: "No replies yet", body: "When someone answers one of your messages, their reply will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 11, 0.12);
    p.rotate("z", -0.62);
    // pulls back to the left and springs forward
    const k = Math.min(1, h * 1.6);
    const dx = -1 - 3.5 * Math.sin(k * Math.PI) * (1 - 0.3 * k);
    const lift = 2 + h * Math.sin(t * 3) * 0.6;
    const put = (q: Q, y: number): V3[] => q.map(([a, v]) => [a + dx, y, v + lift] as V3);
    for (let y = -3.5; y < 0; y += 0.5) { p.face(put(SHAFT, y), 0.065, 0); p.face(put(HEAD, y), 0.065, 0); }
    p.face(put(SHAFT, 0), 0.22, 0);
    p.face(put(HEAD, 0), 0.22, 0);
    // a cut where the head meets the shaft
    p.line(put([[-5, 12.4], [-5, 19.6]], 0.05), 1, 0.6);
    // the speech bubble badge pops in at the end
    const b = Math.max(0, (h - 0.62) / 0.38);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const r = 4.8 * pop, ca = 12 + dx, cv = 25 + lift;
      const ring = (rr: number, y: number): V3[] => Array.from({ length: 28 }, (_, i) => { const s = (i / 28) * Math.PI * 2; return [ca + Math.cos(s) * rr, y, cv + Math.sin(s) * rr] as V3; });
      const tail = (g: number, y: number): V3[] => [[ca - r * 0.8 - g, y, cv - r * 0.3], [ca - r * 1.15 - g, y, cv - r * 1.2 - g], [ca - r * 0.1, y, cv - r * 0.9 - g]];
      p.face(ring(r + 0.7, 0.4), 0.03, 0); p.face(tail(0.7, 0.4), 0.03, 0);
      p.face(ring(r, 0.6), 0.45, 0); p.face(tail(0, 0.6), 0.45, 0);
      for (const o of [-1, 0, 1]) p.dot([ca + o * r * 0.42, 0.7, cv], r * 0.16, 0);
    }
  },
};
