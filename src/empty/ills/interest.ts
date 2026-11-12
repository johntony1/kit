// Interest growth: three stacks of coins, each taller than the last. Hover and more coins drop onto every stack in turn; a percent badge pops in over the tallest.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 5.6, CH = 2.5; // coin radius and thickness
const K = 9.2; // the stacks stand in a row across the screen, this far apart

// the front half of a coin's rim, the half facing us: the cut between two coins
const front = (cx: number, cy: number, z: number): V3[] =>
  Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R, z] as V3; });
const ring = (cx: number, cy: number, z: number, r: number): V3[] =>
  Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

// a round bright badge with a dark percent mark, flat to the screen
function percent(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.22; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.36, y + r * 0.48); g.lineTo(x + r * 0.36, y - r * 0.48); g.stroke();
    g.fillStyle = "#000";
    g.beginPath(); g.arc(x - r * 0.4, y - r * 0.3, r * 0.18, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + r * 0.4, y + r * 0.3, r * 0.18, 0, Math.PI * 2); g.fill();
  });
}

const STACKS = [{ x: -K, y: K, n: 2, m: 1 }, { x: 0, y: 0, n: 3, m: 2 }, { x: K, y: -K, n: 4, m: 3 }];

export const interest: Illustration = {
  k: "interest", name: "Interest growth", title: "No interest earned yet", body: "Keep money in your account and the interest it earns will add up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -10);
    p.scale(1.05);
    for (const s of STACKS) p.shadow(s.x, s.y, 10, 5.5, 0.1);
    STACKS.forEach((s, i) => {
      const coin = (j: number, z: number, a = 1) => {
        const x = s.x + (j % 2 ? 0.35 : -0.25);
        p.cylinder(x, s.y, z, R, CH, { side: 0.12 * a, top: 0.22 * a, edge: a });
        p.line(front(x, s.y, z), SH.edge, 0.5);
        p.line(ring(x, s.y, z + CH + 0.02, R - 1.5), SH.edge, 0.6);
      };
      for (let j = 0; j < s.n; j++) coin(j, j * CH);
      // the interest: extra coins falling onto the stack, one after another
      for (let j = 0; j < s.m; j++) {
        const k = clamp((h - (0.04 + i * 0.12 + j * 0.14)) / 0.3);
        if (k <= 0) continue;
        const z = (s.n + j) * CH + 24 * (1 - k * k), a = Math.min(1, k * 3);
        coin(s.n + j, z, a);
      }
    });
    // the percent badge, over the tallest stack once it is full
    const b = clamp((h - 0.74) / 0.26);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      percent(p, [K, -K, 7 * CH + 7.5], 4.8 * pop);
    }
  },
};
