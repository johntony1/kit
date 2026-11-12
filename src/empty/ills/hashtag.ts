// No trending topics: a big chunky hash sign standing upright. Hover and it hops and leans, and a rising arrow badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const HT = 36, S = 0.17, D = 5; // height, slant, depth
const sk = (x: number, z: number): P2 => [x + (z - HT / 2) * S, z];
const quad = (x0: number, x1: number, z0: number, z1: number): P2[] => [sk(x0, z0), sk(x1, z0), sk(x1, z1), sk(x0, z1)];
const BARS: P2[][] = [quad(-9.6, -4.4, 0, HT), quad(4.4, 9.6, 0, HT), quad(-17, 17, 8.2, 13.4), quad(-17, 17, 22.6, 27.8)];
const at = (pts: P2[], y: number): V3[] => pts.map(([x, z]) => [x, y, z]);

// a round bright badge with a dark arrow rising to the right
function badge(p: Pen, pos: V3, r: number) {
  const [x, y] = p.pt(pos);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.42, y + r * 0.42); g.lineTo(x + r * 0.42, y - r * 0.42);
    g.moveTo(x - r * 0.1, y - r * 0.45); g.lineTo(x + r * 0.45, y - r * 0.45); g.lineTo(x + r * 0.45, y + r * 0.1); g.stroke();
  });
}

export const hashtag: Illustration = {
  k: "hashtag", name: "Hashtag", title: "No trending topics", body: "Nothing is trending right now. Popular topics will show up here as they take off.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const side = p.ink ? 0.065 : 0.045;
    const k = clamp(h * 1.25);
    const hop = Math.sin(k * Math.PI) * 5 + h * Math.sin(t * 3) * 0.5;
    p.translate(0, 0, -18);
    p.shadow(0, 0, 25 - hop, 11 - hop * 0.4, 0.12);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 2, hop);
    p.rotate("y", Math.sin(k * Math.PI) * 0.14, [0, 0, 0]);
    // the depth: the sign again and again, stepping back
    const step = p.ink ? D : 0.4;
    for (let y = -D; y < -0.05; y += step) for (const b of BARS) p.face(at(b, y), side, 0);
    // lit tops: the two posts, and the cross bars where they show between the posts
    for (const [x0, x1] of [[-9.6, -4.4], [4.4, 9.6]]) { const a = sk(x0, HT)[0], b = sk(x1, HT)[0]; p.face([[a, -D, HT], [b, -D, HT], [b, 0, HT], [a, 0, HT]], 0.2, 0); }
    for (const z of [13.4, 27.8]) for (const [x0, x1] of [[-17, -9.6], [-4.4, 4.4], [9.6, 17]]) {
      const a = sk(x0, z)[0], b = sk(x1, z)[0];
      p.face([[a, -D, z], [b, -D, z], [b, 0, z], [a, 0, z]], 0.2, 0);
    }
    // the front
    for (const b of BARS) p.face(at(b, 0), 0.3, 0);
    const q = clamp((h - 0.62) / 0.38);
    if (q > 0) {
      const pop = q < 0.65 ? ease(q / 0.65) * 1.18 : 1.18 - 0.18 * ease((q - 0.65) / 0.35);
      badge(p, [21, 0, 37], 5 * pop);
    }
  },
};
