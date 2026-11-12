// Basketball: a basketball dribbling on the spot. It drops, squashes on the floor and springs back up, rocking as it goes, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop: two bounces
const RW = 11, RS = RW * 1.2247;
const TAU = Math.PI * 2;
const VIEW: V3 = [0.4082, 0.4082, 0.8165];
const AX: V3 = [0.7071, -0.7071, 0]; // screen right
const UP: V3 = [-0.5774, -0.5774, 0.5774]; // the screen's upright
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const turn = (v: V3, k: V3, a: number): V3 => {
  const c = Math.cos(a), s = Math.sin(a), kv = dot(k, v), x = cross(k, v);
  return [v[0] * c + x[0] * s + k[0] * kv * (1 - c), v[1] * c + x[1] * s + k[1] * kv * (1 - c), v[2] * c + x[2] * s + k[2] * kv * (1 - c)];
};
// the seams in the ball's own frame: two great circles and a curved one on each side
const N = 64;
const SEAMS: V3[][] = [
  Array.from({ length: N + 1 }, (_, i) => { const a = (i / N) * TAU; return [0, Math.cos(a), Math.sin(a)] as V3; }),
  Array.from({ length: N + 1 }, (_, i) => { const a = (i / N) * TAU; return [Math.cos(a), Math.sin(a), 0] as V3; }),
  ...[1, -1].map((s) => Array.from({ length: N + 1 }, (_, i) => { const a = (i / N) * TAU; return [s * 0.62, 0.785 * Math.cos(a), 0.785 * Math.sin(a)] as V3; })),
];

export const basketball: Illustration = {
  k: "basketball", name: "Basketball", title: "No pickup games yet", body: "Start a game or join one nearby and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, b = (ph * 2) % 1;
    const up = 4 * b * (1 - b); // 0 on the floor, 1 at the top
    const sq = Math.max(0, 1 - Math.min(b, 1 - b) / 0.07); // the squash as it meets the floor
    const rock = 0.5 * Math.sin(ph * TAU);
    p.translate(0, 0, -22);
    p.shadow(0, 0, 24 - 8 * up, 12 - 4 * up, 0.14 - 0.07 * up);
    const kv = 1 - 0.13 * sq, ku = 1 + 0.07 * sq;
    const C: V3 = [0, 0, RW * kv + 14 * up];
    const at = (n: V3, r = RW): V3 => {
      // squashed along the screen's upright, a touch wider across
      const u = dot(n, AX), w: V3 = [n[0] - AX[0] * u, n[1] - AX[1] * u, n[2]];
      return [C[0] + (AX[0] * u * ku + w[0] * kv) * r, C[1] + (AX[1] * u * ku + w[1] * kv) * r, C[2] + w[2] * kv * r];
    };
    const disc = (r: number, du: number, dv: number): V3[] => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * TAU, u = (Math.cos(a) * r + du) * ku; return [C[0] + u * 0.5774, C[1] - u * 0.5774, C[2] + (Math.sin(a) * r + dv) * kv] as V3; });
    p.face(disc(RS, 0, 0), 0.1, 0);
    p.face(disc(RS * 0.86, -RS * 0.1, RS * 0.1), 0.22, 0);
    // the seams, drawn only where they face us
    for (const seam of SEAMS) {
      let run: V3[] = [];
      const flush = () => { if (run.length > 1) p.line(run, SH.edge, 0.8); run = []; };
      for (const v of seam) {
        // the ball's own frame, turned a little to the side and rocking as it bounces
        const w: V3 = [AX[0] * v[0] + VIEW[0] * v[1] + UP[0] * v[2], AX[1] * v[0] + VIEW[1] * v[1] + UP[1] * v[2], AX[2] * v[0] + VIEW[2] * v[1] + UP[2] * v[2]];
        const n = turn(turn(w, UP, 0.55), AX, rock - 0.2);
        if (dot(n, VIEW) > 0.03) run.push(at(n, RW + 0.02)); else flush();
      }
      flush();
    }
    p.line([...disc(RS, 0, 0), disc(RS, 0, 0)[0]], SH.edge, 0.6);
  },
};
