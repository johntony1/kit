// Nobody on stage: a stage spotlight on a stand, its barrel tipped down toward the floor. Hover and it switches on: the lens blazes and a pool of light opens on the floor in front of it.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
type Q = { d: number; pts: V3[]; f: number };
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a: V3): V3 => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
const crs = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const tone = (n: V3) => (n[2] > 0.5 ? 0.22 : n[1] >= n[0] ? 0.13 : 0.065);

/** a round barrel from c along the axis A, radius r0 at the back growing to r1 at the front, painted back to front */
function barrel(p: Pen, c: V3, A: V3, len: number, r0: number, r1: number) {
  const U = norm(crs(A, [0, 0, 1])), V = crs(U, A), N = 40, qs: Q[] = [];
  const at = (s: number, a: number): V3 => { const r = r0 + (r1 - r0) * s; return add(add(c, A, s * len), add([0, 0, 0], add(U, V, 0), 0), 0).map((v, e) => v + (U[e] * Math.cos(a) + V[e] * Math.sin(a)) * r) as V3; };
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
    const n = norm(add([U[0] * Math.cos(am) + V[0] * Math.sin(am), U[1] * Math.cos(am) + V[1] * Math.sin(am), U[2] * Math.cos(am) + V[2] * Math.sin(am)], A, -(r1 - r0) / len));
    if (n[0] + n[1] + n[2] < -0.1) continue;
    const pts = [at(0, a0), at(1, a0), at(1, a1), at(0, a1)];
    const m = pts.reduce((s, q) => add(s, q, 0.25), [0, 0, 0] as V3);
    qs.push({ d: m[0] + m[1] + m[2], f: tone(n), pts: pts.map((q) => q.map((v, e) => m[e] + (v - m[e]) * 1.12) as V3) });
  }
  qs.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
  return { front: Array.from({ length: 40 }, (_, i) => at(1, (i / 40) * Math.PI * 2)), back: Array.from({ length: 40 }, (_, i) => at(0, (i / 40) * Math.PI * 2)), U, V };
}

export const spotlight: Illustration = {
  k: "spotlight", name: "Spotlight", title: "Nobody on stage", body: "Invite your first guest or speaker and they will take the stage here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const on = ease(Math.min(1, h * 1.5)), flick = h > 0.95 ? 0.04 * Math.sin(t * 9) : 0;
    p.translate(-3, -1, -15);
    p.shadow(0, 0, 26, 12, 0.12);
    // the barrel's axis: across to the right and down, lifting a little as it comes on
    const tilt = 0.36 - 0.1 * on;
    const A = norm([0.86, -0.36, -Math.tan(tilt)]);
    const pivot: V3 = [-1, 1, 21];
    const back = add(pivot, A, -9);
    // the pool of light on the floor where it points
    if (on > 0.01) {
      const r = 9 * on, c = add([pivot[0], pivot[1], 0], [A[0], A[1], 0], 15);
      p.face(Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.9, 0.05] as V3; }), 0.3, 0);
    }
    // the stand: a round foot, a post, a bracket
    p.cylinder(-1, 1, 0, 6.5, 1.4, { side: 0.12, top: 0.2, edge: 0 });
    p.box(-2.1, -0.1, 1.4, 2.2, 2.2, 13.6, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(-3, -0.9, 15, 4, 3.8, 1.6, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    // the barrel, its fins as dark rings, then the lens
    const b = barrel(p, back, A, 18, 6.2, 6.8);
    for (const k of [0.18, 0.3]) {
      const r = 6.2 + 0.6 * k, c = add(back, A, 18 * k);
      p.line(Array.from({ length: 21 }, (_, i) => { const a = Math.PI * 0.05 + (i / 20) * Math.PI * 1.1; return c.map((v, e) => v + (b.U[e] * Math.cos(a) * -1 + b.V[e] * Math.sin(a)) * r * 1.01) as V3; }), 0, 0.8);
    }
    p.face(b.front, 0.3, 0);
    const lensC = add(back, A, 18.05);
    const lens = b.front.map((q) => q.map((v, e) => lensC[e] + (v - lensC[e]) * 0.78) as V3);
    p.face(lens, 0.015 + (1 - 0.015) * Math.min(1, on + flick), 0);
    // rays out of the lens when lit
    if (on > 0.3) {
      const [cx, cy] = p.pt(add(lensC, A, 1));
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineCap = "round"; c.lineWidth = 1.4;
        for (let i = 0; i < 5; i++) {
          const a = -0.55 + i * 0.36, r0 = 8.5, r1 = 8.5 + 4.5 * (on - 0.3) / 0.7;
          c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke();
        }
      });
    }
  },
};
