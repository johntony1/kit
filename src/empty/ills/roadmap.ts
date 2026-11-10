// No roadmap yet: a winding road across a board with milestone flags. A marker travels the road and each flag runs up as it passes.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 6.5; // seconds per loop
const T = 2.6; // thickness of the board
// the road's control points, from the near left corner to the far right one
const CP: [number, number][] = [[-14, 13], [-9, 9], [-8, 3], [-3, -1], [4, 1], [8, -4], [9, -10], [15, -14]];
// sample a smooth curve through the control points
const ROAD: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let i = 0; i < CP.length - 1; i++) {
    const p0 = CP[Math.max(0, i - 1)], p1 = CP[i], p2 = CP[i + 1], p3 = CP[Math.min(CP.length - 1, i + 2)];
    for (let k = 0; k < 8; k++) {
      const u = k / 8, u2 = u * u, u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(CP[CP.length - 1]);
  return out;
})();
// cumulative length, so places along the road go by distance
const LEN = ROAD.reduce<number[]>((a, q, i) => (a.push(i ? a[i - 1] + Math.hypot(q[0] - ROAD[i - 1][0], q[1] - ROAD[i - 1][1]) : 0), a), []);
const TOTAL = LEN[LEN.length - 1];
// a point and its direction at s (0..1) along the road
function along(s: number): { x: number; y: number; nx: number; ny: number } {
  const d = Math.max(0, Math.min(1, s)) * TOTAL;
  let i = 1;
  while (i < LEN.length - 1 && LEN[i] < d) i++;
  const a = ROAD[i - 1], b = ROAD[i], f = (d - LEN[i - 1]) / (LEN[i] - LEN[i - 1] || 1);
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  return { x: a[0] + dx * f, y: a[1] + dy * f, nx: -dy / l, ny: dx / l };
}
// the road between s0 and s1 as one strip of width w
function strip(s0: number, s1: number, w: number, z: number): V3[] {
  const n = Math.max(2, Math.round((s1 - s0) * 60));
  const l: V3[] = [], r: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const q = along(s0 + ((s1 - s0) * i) / n);
    l.push([q.x + q.nx * w, q.y + q.ny * w, z]); r.push([q.x - q.nx * w, q.y - q.ny * w, z]);
  }
  return [...l, ...r.reverse()];
}
const FLAGS = [0.2, 0.52, 0.82]; // where the milestones stand
const GOAL = 0.82;

function flag(p: Pen, s: number, z: number, up: number, goal: boolean) {
  const q = along(s), side = goal ? -1 : 1;
  const x = q.x + q.nx * 3.6 * side, y = q.y + q.ny * 3.6 * side;
  p.cylinder(x, y, z, 1.3, 0.8, { side: SH.left, top: 0.2 });
  p.box(x - 0.5, y - 0.5, z + 0.8, 1, 1, 12, { top: 0.2, left: 0.16 });
  const fz = z + 5 + up * 7.6; // the top of the flag
  p.face([[x + 0.5, y, fz], [x + 7.5, y, fz - 2.2], [x + 0.5, y, fz - 4.6]], goal ? 0.32 : 0.21, SH.edge, 0.5);
}

export const roadmap: Illustration = {
  k: "roadmap", name: "Roadmap", title: "No roadmap yet", body: "Plan your milestones and see the road ahead at a glance.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const go = easeInOut(Math.min(1, u / 0.72)) * GOAL; // how far along the marker is
    const fade = u > 0.86 ? (u - 0.86) / 0.14 : 0; // flags lower and the marker leaves before the loop restarts
    p.translate(0, 0, -6);
    p.shadow(0, 0, 38, 19, 0.11);
    // the board
    p.box(-17, -15.5, 0, 34, 31, T, { top: 0.04, left: 0.14, right: SH.right });
    const z = T + 0.02;
    // the road so far, and the dashed stretch still to be planned past the goal
    p.face(strip(0, GOAL + 0.03, 2.3, z), 0.24, SH.edge, 0.9);
    for (let i = 0; i < 14; i++) {
      const a = (i + 0.3) / 14 * (GOAL + 0.02), b = a + 0.025;
      p.line(strip(a, b, 0.01, z + 0.02).slice(0, 2), SH.edge, 0.55);
    }
    const rest = strip(GOAL + 0.03, 1, 2, z);
    p.guide([...rest, rest[0]]);
    // the flags and the marker, back to front
    const items: { d: number; fn: () => void }[] = FLAGS.map((s, i) => {
      const q = along(s), raised = Math.max(0, Math.min(1, (go - s + 0.04) / 0.08)) * (1 - easeInOut(fade));
      return { d: q.x + q.y, fn: () => flag(p, s, z, raised, i === FLAGS.length - 1) };
    });
    const m = along(go), k = Math.min(1, u / 0.06) * (1 - fade);
    if (k > 0.02) items.push({ d: m.x + m.y + 0.5, fn: () => {
      p.push(); p.scale(k, [m.x, m.y, z]);
      p.cylinder(m.x, m.y, z, 2.2, 3, { side: SH.left, top: 0.24 });
      p.pop();
    } });
    items.sort((a, b) => a.d - b.d).forEach((it) => it.fn());
    // where the goal flag will fly
    const g = along(GOAL);
    p.guide([[g.x - g.nx * 3.6 + 7.5, g.y - g.ny * 3.6, z + 10.4], [g.x - g.nx * 3.6 + 7.5, g.y - g.ny * 3.6, z]], true);
  },
};
