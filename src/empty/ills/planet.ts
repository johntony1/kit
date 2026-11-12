// No worlds yet: a banded planet inside a tilted ring. A small moon circles it, passing behind and in front.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 4; // seconds per loop
const R = 9.6, C: V3 = [0, 0, 15.5], T = 0.36; // the planet's radius and centre, the tilt of the ring
const S = Math.SQRT1_2;
const A: V3 = [S * Math.cos(T), -S * Math.cos(T), Math.sin(T)]; // across the ring, rising to the right
const F: V3 = [S, S, 0]; // across the ring, towards us
const AX: V3 = [-S * Math.sin(T), S * Math.sin(T), Math.cos(T)]; // the planet's axis
const on = (r: number, a: number): V3 => [C[0] + r * (Math.cos(a) * A[0] + Math.sin(a) * F[0]), C[1] + r * (Math.cos(a) * A[1] + Math.sin(a) * F[1]), C[2] + r * Math.cos(a) * A[2]];

/** a sphere as small quads, back to front; bands across the axis are a tone darker */
function ball(p: Pen) {
  const nu = 44, nv = 22, quads: { d: number; pts: V3[]; f: number }[] = [];
  const at = (u: number, v: number): V3 => [C[0] + R * Math.cos(v) * Math.cos(u), C[1] + R * Math.cos(v) * Math.sin(u), C[2] + R * Math.sin(v)];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = (i / nu) * Math.PI * 2, u1 = ((i + 1) / nu) * Math.PI * 2, v0 = -Math.PI / 2 + (j / nv) * Math.PI, v1 = v0 + Math.PI / nv;
    const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    const n: V3 = [Math.cos(vm) * Math.cos(um), Math.cos(vm) * Math.sin(um), Math.sin(vm)];
    if (n[0] + n[1] + n[2] < -0.05) continue;
    const m = at(um, vm), k = n[0] * AX[0] + n[1] * AX[1] + n[2] * AX[2];
    const band = (k > 0.34 && k < 0.6) || (k > -0.3 && k < -0.02);
    const f = (n[2] > 0.45 ? 0.24 : n[1] >= n[0] ? 0.15 : 0.08) * (band ? 0.45 : 1);
    quads.push({ d: m[0] + m[1] + m[2], f, pts: [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map((q) => q.map((x, e) => m[e] + (x - m[e]) * 1.12) as V3) });
  }
  quads.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
}

// half of the ring, as a flat band from angle a0 to a1
function ring(p: Pen, a0: number, a1: number, fill: number) {
  const o: V3[] = [], i: V3[] = [], m: V3[] = [];
  for (let k = 0; k <= 30; k++) { const a = a0 + ((a1 - a0) * k) / 30; o.push(on(18.6, a)); i.push(on(13.4, a)); m.push(on(15.6, a)); }
  p.face([...o, ...i.reverse()], fill, SH.edge, 0.5);
  p.line(m, SH.edge, 0.6); // the gap in the ring
}

export const planet: Illustration = {
  k: "planet", name: "Planet", title: "No worlds yet", body: "Create your first world and it will appear here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, a = u * Math.PI * 2;
    p.translate(0, 0, -15.5 + Math.sin(a * 2) * 0.5);
    p.shadow(0, 0, 22, 11, 0.1);
    const sat = () => p.dot(on(22.5, a), 2.3, 0.95);
    ring(p, Math.PI, Math.PI * 2, 0.13);
    if (Math.sin(a) < 0) sat();
    ball(p);
    ring(p, 0, Math.PI, 0.3);
    if (Math.sin(a) >= 0) sat();
  },
};
