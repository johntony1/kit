// Nothing to hold yet: a teddy bear sitting and facing us. Hover and it lifts both arms for a hug; a small heart pops up beside it.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
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

export const teddy: Illustration = {
  k: "teddy", name: "Teddy bear", title: "Nothing to hold yet", body: "Items you put on hold will wait for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.35)), wig = h * Math.sin(t * 3.4) * 0.8;
    p.translate(0, 0, -15.5);
    p.shadow(0, 0, 25, 12, 0.12);
    const q: Q[] = [];
    const pale = () => 0.34;
    // ears, behind the head
    for (const s of [-1, 1]) blob(q, at(s * 6.4, -0.5, 28.6), [3.4, 2.6, 3.4], tone3, 20, 10);
    blob(q, at(0, 0, 9.5), [9, 7.6, 9.3], tone3, 40, 20); // body
    blob(q, at(0, 6, 8.6), [4.6, 2.2, 5], pale, 28, 14); // tummy patch
    blob(q, at(0, 0.5, 22.6), [8.2, 7.2, 7.2], tone3, 36, 18); // head
    blob(q, at(0, 6.4, 20.6), [3.5, 2.4, 2.7], pale, 22, 11); // muzzle
    // legs, pointing at us
    for (const s of [-1, 1]) blob(q, at(s * 6, 6, 3.4), [3.7, 5.2, 3.5], tone3, 24, 12);
    // arms: three rounds from the shoulder to the paw, swinging up on hover
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const f = i / 2, e = 8.4 + f * (2.6 + 2.4 * k), z = 15.5 + f * (-6.5 + 13 * k + wig * k);
      blob(q, at(s * e, 2.5, z), [3.1, 3.1, 3.1], tone3, 18, 9);
    }
    paint(p, q);
    // the face and the paw pads, cut dark into the fur
    for (const s of [-1, 1]) {
      p.dot(at(s * 3.2, 7, 24.6), 1.05, 0);
      p.dot(at(s * 6.4, 2, 28.9), 1.3, 0.05);
      p.dot(at(s * 6, 11.3, 3.6), 1.7, 0.04);
    }
    p.dot(at(0, 8.9, 21.6), 1.15, 0);
    // the heart pops in once the arms are up
    const b = Math.max(0, (h - 0.55) / 0.45);
    if (b > 0) {
      const r = 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35));
      const [x, y] = p.pt(at(15, 0, 31 + wig * 0.5));
      p.screen((g) => {
        g.fillStyle = "#fff"; g.beginPath(); g.moveTo(x, y + r);
        g.bezierCurveTo(x - r * 1.9, y - r * 0.2, x - r * 0.9, y - r * 1.5, x, y - r * 0.45);
        g.bezierCurveTo(x + r * 0.9, y - r * 1.5, x + r * 1.9, y - r * 0.2, x, y + r);
        g.fill();
      });
    }
  },
};
