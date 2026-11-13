// No breakpoints set: a code panel standing on its edge, a gutter down its left side. Hover and a bright marker pops into an empty spot in the gutter and its line lights up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function rr(x0: number, v0: number, x1: number, v1: number, r: number): P2[] {
  const out: P2[] = [];
  const cs: [number, number, number][] = [[x1 - r, v1 - r, 0], [x0 + r, v1 - r, 0.5], [x0 + r, v0 + r, 1], [x1 - r, v0 + r, 1.5]];
  for (const [cx, cv, q] of cs) for (let i = 0; i <= 5; i++) { const a = (q + i / 10) * Math.PI; out.push([cx + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  return out;
}
const circ = (cx: number, cv: number, r: number): P2[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + Math.cos(a) * r, cv + Math.sin(a) * r] as P2; });
const on = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
const bar = (x0: number, x1: number, v: number, w = 1.3): V3[] => [[x0, 0.05, v - w], [x1, 0.05, v - w], [x1, 0.05, v + w], [x0, 0.05, v + w]];

export const breakpoint: Illustration = {
  k: "breakpoint", name: "Breakpoint", title: "No breakpoints set", body: "Click beside a line of code to pause there the next time it runs.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 27, 10, 0.1);
    p.rotate("z", -0.6);
    // the panel, deep and lit, with a darker gutter strip down the left
    const panel = rr(-18, 0, 18, 30, 3.5);
    for (let y = -4; y < 0; y += 0.6) p.face(on(panel, y), y < -2 ? SH.right : 0.1, 0);
    p.face(on(panel, 0), 0.24, SH.edge, 0.6);
    p.face(on(rr(-18, 0, -8, 30, 3.5), 0.03).map(([x, y, z]) => [Math.min(x, -8), y, z] as V3), 0.13, 0);
    p.line([[-8, 0.04, 0.2], [-8, 0.04, 29.8]], SH.edge, 0.7);
    // lines of code; on hover the third one turns into a dark band with its code lit
    const k = ease(Math.min(1, h * 1.3));
    const rows: [number, number][] = [[24, 11], [19.2, 16], [14.5, 8], [9.8, 13], [5, 6]];
    rows.forEach(([v, len], i) => {
      if (i === 2 && k > 0.02) {
        p.face(bar(-7.6, -7.6 + 25 * k, v, 2.4), 0.06, 0);
        p.face(bar(-5, -5 + len, v).map(([x, y, z]) => [x, y + 0.02, z] as V3), 0.3, 0);
      } else p.clear(bar(-5, -5 + len, v));
    });
    // the gutter spot: an empty ring at rest; on hover a bright marker pops into it
    p.line(on(circ(-13, 14.5, 3.4), 0.05).concat(on([[-9.6, 14.5]], 0.05)), SH.edge, 0.7);
    const b = Math.max(0, (h - 0.15) / 0.5);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.2 : 1.2 - 0.2 * ease(Math.min(1, (b - 0.65) / 0.35));
      const r = 4.4 * pop + h * Math.sin(t * 3) * 0.12, [x, y] = p.pt([-13, 0.1, 14.5]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r + 1.1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
      });
    }
  },
};
