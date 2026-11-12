// No activity today: a jump rope turning in the air between its two handles. The rope sweeps round twice a loop, brushing the floor each time.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop: two turns of the rope
const HZ = 17, RR = 16.2, HX = 12; // the handles' height, the rope's reach, half the gap between the handles
function tube(p: Pen, pts: V3[], w: number, shade = 1) {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    const n = Math.round(255 * shade);
    g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}
/** the rope at one angle of its turn: 0 is straight down */
const rope = (a: number): V3[] => Array.from({ length: 33 }, (_, i) => {
  const s = i / 32, r = RR * Math.pow(Math.sin(s * Math.PI), 0.7);
  return [-HX + 2 * HX * s, r * Math.sin(a), HZ - r * Math.cos(a)] as V3;
});

export const jumprope: Illustration = {
  k: "jumprope", name: "Jump rope", title: "No activity today", body: "Get moving and today's activity will start to fill in here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const a = ((t / P) % 1) * Math.PI * 4;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 26, 9, 0.11);
    p.rotate("z", -0.3);
    const behind = Math.sin(a) < 0;
    const drawRope = () => {
      tube(p, rope(a - 0.75), 0.7, 0.22);
      tube(p, rope(a - 0.4), 0.9, 0.42);
      tube(p, rope(a), 1.5, 1);
    };
    const handle = (x0: number, cap: number) => {
      p.box(x0, -1.3, HZ - 1.3, 8, 2.6, 2.6, { top: 0.22, left: 0.13, right: 0.065, lw: 0.55 });
      for (const dx of [2.4, 4, 5.6]) p.line([[x0 + dx, 1.33, HZ - 1.3], [x0 + dx, 1.33, HZ + 1.33], [x0 + dx, -1.3, HZ + 1.33]], SH.edge, 0.5);
      p.box(cap, -1.7, HZ - 1.7, 1.4, 3.4, 3.4, { top: 0.26, left: 0.16, right: 0.08, lw: 0.5 });
    };
    if (behind) drawRope();
    handle(-HX - 8, -HX - 9.2);
    if (!behind) drawRope();
    handle(HX, HX + 7.8);
    // a scuff of dust where the rope brushes the floor
    const near = Math.max(0, Math.cos(a) - 0.75) / 0.25;
    if (near > 0) for (const [dx, dy] of [[-3, 2.4], [1, -2.6], [4, 2]]) p.dot([dx, dy + Math.sin(a) * 4, 0.6], 0.6, near * 0.9);
  },
};
