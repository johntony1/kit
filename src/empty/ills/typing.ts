// Typing dots: a speech bubble facing us with three bold dots inside. The dots hop one after another, a wave that runs from left to right and starts again.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4, T = 2.2; // loop seconds, half thickness of the bubble
// the bubble's outline: a rounded box with a tail at the bottom left
const OUT: [number, number][] = (() => {
  const x0 = -17.5, x1 = 17.5, z0 = 9, z1 = 32, r = 7.5, o: [number, number][] = [[-11.5, z0], [-14.5, 1.6], [-3.5, z0]];
  const arc = (cx: number, cz: number, a0: number) => { for (let i = 0; i <= 8; i++) { const a = a0 + (i / 8) * Math.PI / 2; o.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  arc(x1 - r, z0 + r, -Math.PI / 2); arc(x1 - r, z1 - r, 0); arc(x0 + r, z1 - r, Math.PI / 2); arc(x0 + r, z0 + r, Math.PI);
  return o;
})();
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };

export const typing: Illustration = {
  k: "typing", name: "Typing dots", title: "No replies yet", body: "Replies to your message will appear here as soon as someone writes back.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 2, 27, 12, 0.12);
    p.rotate("z", -0.62);
    p.scale(0.86);
    // the bubble: the rim that shows, then the lit front
    const front: V3[] = OUT.map(([x, z]) => [x, T, z]), back: V3[] = OUT.map(([x, z]) => [x, -T, z]);
    const sign = area(p, front);
    for (let i = 0; i < OUT.length; i++) {
      const j = (i + 1) % OUT.length, q = [front[i], front[j], back[j], back[i]];
      if (area(p, q) * sign >= 0) continue;
      p.face(q, Math.abs(OUT[j][0] - OUT[i][0]) > Math.abs(OUT[j][1] - OUT[i][1]) ? 0.12 : 0.05, 0);
    }
    p.face(front, 0.3, 0);
    // three dots cut into it, each hopping in turn
    for (let i = 0; i < 3; i++) {
      const v = (u - i * 0.2 + 1) % 1, up = v < 0.4 ? Math.sin((v / 0.4) * Math.PI) * 5 : 0;
      const x = (i - 1) * 9.4, z = 19 + up, r = 3.1;
      p.clear(Array.from({ length: 24 }, (_, n) => { const a = (n / 24) * Math.PI * 2; return [x + Math.cos(a) * r, T + 0.03, z + Math.sin(a) * r] as V3; }));
    }
  },
};
