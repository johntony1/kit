// No brands followed: a tailor's dress form on its stand. Hover and the form swivels round on its pole; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
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
/** a turned shape with an oval section: rings of [height, half width across, half width near] from the bottom up */
function turned(out: Q[], c: V3, rough: [number, number, number][], yaw = 0, tone: (n: V3) => number = tone3, nu = 40) {
  const prof = [rough[0]];
  for (let j = 1; j < rough.length; j++) {
    const a = rough[j - 1], b = rough[j], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], Math.max(Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]))) / 1.3));
    for (let s = 1; s <= n; s++) prof.push([a[0] + ((b[0] - a[0]) * s) / n, a[1] + ((b[1] - a[1]) * s) / n, a[2] + ((b[2] - a[2]) * s) / n]);
  }
  const cs = Math.cos(yaw), sn = Math.sin(yaw);
  const turn = (a: number, b: number, z: number) => at(a * cs - b * sn, a * sn + b * cs, z);
  const P = (u: number, k: number): V3 => { const q = turn(Math.cos(u) * prof[k][1], Math.sin(u) * prof[k][2], prof[k][0]); return [c[0] + q[0], c[1] + q[1], c[2] + q[2]]; };
  for (let k = 0; k < prof.length - 1; k++) for (let i = 0; i < nu; i++) {
    const u0 = (i / nu) * Math.PI * 2, u1 = ((i + 1) / nu) * Math.PI * 2, um = (u0 + u1) / 2, lo = prof[k], hi = prof[k + 1];
    const hx = Math.cos(um) * (lo[2] + hi[2]), hy = Math.sin(um) * (lo[1] + hi[1]), hl = Math.hypot(hx, hy) || 1;
    const dr = (hi[1] - lo[1]) * Math.cos(um) ** 2 + (hi[2] - lo[2]) * Math.sin(um) ** 2, dz = hi[0] - lo[0], L = Math.hypot(dz, dr) || 1;
    const n = turn((hx / hl) * (dz / L), (hy / hl) * (dz / L), -dr / L);
    if (n[0] + n[1] + n[2] < -0.3) continue; // faces away from us
    const pts = [P(u0, k), P(u1, k), P(u1, k + 1), P(u0, k + 1)];
    const m = [0, 1, 2].map((e) => (pts[0][e] + pts[1][e] + pts[2][e] + pts[3][e]) / 4);
    out.push({ d: m[0] + m[1] + m[2], f: tone(n), pts: pts.map((q) => q.map((x, e) => m[e] + (x - m[e]) * 1.12) as V3) });
  }
}
const paint = (p: Pen, qs: Q[]) => qs.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));

const ZT = 12; // where the form starts on its pole
// the form from the hips up to the neck: [height, half width, half depth]
const FORM: [number, number, number][] = [[0, 6.6, 4.4], [0.8, 7.8, 5], [3, 8.4, 5.3], [7.5, 6, 4.2], [12, 8.2, 5.4], [15.4, 9.4, 4.8], [17.2, 8.6, 4.2], [18.4, 3.6, 3], [19.4, 2.6, 2.5], [21.6, 2.5, 2.5]];
const cloth = (n: V3) => (n[2] > 0.45 ? 0.28 : n[1] >= n[0] ? 0.22 : 0.13);

export const mannequin: Illustration = {
  k: "mannequin", name: "Mannequin", title: "No brands followed", body: "Follow a brand and its latest pieces will be shown here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.3)), yaw = 0.3 - 0.75 * k + h * Math.sin(t * 2.2) * 0.05;
    p.translate(0, 0, -17.5);
    p.shadow(0, 0, 20, 10, 0.12);
    // the stand: a round foot and a pole
    p.cylinder(0, 0, 0, 7, 1.5, { side: 0.12, top: SH.top });
    p.cylinder(0, 0, 1.5, 1.1, ZT - 1, { side: 0.26, top: 0.2, edge: 0 });
    const q: Q[] = [];
    turned(q, [0, 0, ZT], FORM, yaw, cloth, 44);
    paint(p, q);
    // the seam down the front, turning with the form
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    p.line(FORM.slice(1, 8).map(([z, , d]) => at(-(d + 0.06) * sn, (d + 0.06) * cs, ZT + z)), SH.edge, 0.7);
    // the neck cap and its knob
    const top = ZT + 21.6;
    p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return at(Math.cos(a) * 2.4, Math.sin(a) * 2.4, top); }), 0.36, SH.edge, 0.5);
    const knob: Q[] = [];
    blob(knob, [0, 0, top + 1.3], [1.5, 1.5, 1.5], cloth, 14, 7);
    paint(p, knob);
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, at(15.5, 0, 33), 4.6 * pop);
    }
  },
};
