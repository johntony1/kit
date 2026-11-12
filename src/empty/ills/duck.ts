// Nothing afloat: a rubber duck on the water. It bobs up and down while rings spread out from under it.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
type Q = { d: number; pts: V3[]; f: number };
const S = Math.SQRT1_2;
/** a place given as across (screen right), near (towards us) and up */
const at = (e: number, n: number, z: number): V3 => [(e + n) * S, (n - e) * S, z];
const tone3 = (n: V3) => (n[2] > 0.45 ? 0.22 : n[1] >= n[0] ? 0.13 : 0.065);
/** an ellipsoid as small quads, its radii given across, near and up; each quad takes a face tone from its normal */
function blob(out: Q[], c: V3, r: V3, tone: (n: V3) => number = tone3, nu = 26, nv = 13) {
  const P = (u: number, v: number): V3 => { const q = at(r[0] * Math.cos(v) * Math.cos(u), r[1] * Math.cos(v) * Math.sin(u), r[2] * Math.sin(v)); return [c[0] + q[0], c[1] + q[1], c[2] + q[2]]; };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = (i / nu) * Math.PI * 2, u1 = ((i + 1) / nu) * Math.PI * 2, v0 = -Math.PI / 2 + (j / nv) * Math.PI, v1 = v0 + Math.PI / nv;
    const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    const a = (Math.cos(vm) * Math.cos(um)) / r[0], b = (Math.cos(vm) * Math.sin(um)) / r[1], e = Math.sin(vm) / r[2], L = Math.hypot(a, b, e);
    const n = at(a / L, b / L, e / L);
    if (n[0] + n[1] + n[2] < -0.3) continue; // faces away from us
    const m = P(um, vm);
    out.push({ d: m[0] + m[1] + m[2], f: tone(n), pts: [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)].map((q) => q.map((x, k) => m[k] + (x - m[k]) * 1.12) as V3) });
  }
}
const paint = (p: Pen, qs: Q[]) => qs.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));

// part of a ring on the water, from angle a0 to a1
function ripple(p: Pen, r: number, a0: number, a1: number, fill: number) {
  const o: V3[] = [], i: V3[] = [];
  for (let k = 0; k <= 24; k++) { const a = a0 + ((a1 - a0) * k) / 24; o.push([Math.cos(a) * (r + 0.9), Math.sin(a) * (r + 0.9), 0]); i.push([Math.cos(a) * (r - 0.9), Math.sin(a) * (r - 0.9), 0]); }
  p.face([...o, ...i.reverse()], fill, 0);
}

export const duck: Illustration = {
  k: "duck", name: "Rubber duck", title: "Nothing afloat", body: "Nothing is in progress right now. Start something and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2, bob = Math.sin(w) * 0.9;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 27, 13.5, 0.1);
    // two rings spreading over the water, each fading in and out; the far halves go under the duck
    const rings = [0, 0.5].map((o) => { const v = (u + o) % 1; return { r: 12.5 + v * 9.5, f: 0.3 * Math.sin(v * Math.PI) }; });
    for (const g of rings) if (g.f > 0.02) ripple(p, g.r, Math.PI * 0.75, Math.PI * 1.75, g.f);
    const q: Q[] = [];
    const bright = () => 0.42;
    const z = bob - 1.6; // it sits a little way into the water
    blob(q, at(-10, 0, z + 11.4), [3.8, 3.4, 3], tone3, 20, 10); // tail
    blob(q, at(-0.5, 0, z + 7.6), [11.6, 8.2, 7.4], tone3, 46, 22); // body
    blob(q, at(-1.8, 7, z + 8.6), [5.4, 1.6, 3.2], (n) => (n[2] > 0.45 ? 0.3 : 0.2), 28, 12); // wing
    blob(q, at(6.6, 0, z + 19), [6.2, 6.2, 6.2], tone3, 32, 16); // head
    blob(q, at(13.2, 1.5, z + 17.6), [3.6, 3.2, 1.6], bright, 22, 10); // beak
    // only what is above the water shows
    p.screen((c) => {
      const [x, y] = p.pt([0, 0, 0]);
      c.beginPath(); c.rect(x - 60, y - 80, 120, 80);
      c.ellipse(x, y, 12.5 * 1.2247, 12.5 * 0.7071, 0, 0, Math.PI * 2); c.clip();
      paint(p, q);
    });
    p.dot(at(9.2, 4.9, z + 20.6), 1.1, 0); // eye
    for (const g of rings) if (g.f > 0.02) ripple(p, g.r, -Math.PI * 0.25, Math.PI * 0.75, g.f);
  },
};
