// No car added: a fat car key fob seen face on, with three buttons (a padlock on the first), its metal blade out and a key ring. Hover and the lock button presses in and the light on the fob blinks.
import { type Illustration, type Pen, type V3 } from "../dots";

type Q = { q: V3[]; f: number; d: number };
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const unit = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mix = (a: V3, b: V3, ka: number, kb: number): V3 => [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
// a frame facing the viewer, tipped back so the top wall shows and turned so the right wall shows
const N0 = unit([1, 1, 1]), U0 = unit([1, -1, 0]), V0 = unit([-1, -1, 2]);
const TB = 0.42, YW = 0.3;
const V1 = mix(V0, N0, Math.cos(TB), Math.sin(TB)), N1 = mix(N0, V0, Math.cos(TB), -Math.sin(TB));
const U = mix(U0, N1, Math.cos(YW), Math.sin(YW)), N = mix(N1, U0, Math.cos(YW), -Math.sin(YW)), V = V1;
const W = (a: number, b: number, c: number): V3 => [a * U[0] + b * V[0] + c * N[0], a * U[1] + b * V[1] + c * N[1], a * U[2] + b * V[2] + c * N[2]];
const tone = (n: V3, T: number, L: number, R: number) => (n[2] > 0.5 ? T : R + (L - R) * Math.max(0, Math.min(1, Math.atan2(n[1], n[0]) / (Math.PI / 2))));
/** a flat outline (a, b) extruded from c0 back to c1: the walls that face us, then the front */
function slab(p: Pen, out: [number, number][], c0: number, c1: number, T: number, L: number, R: number, front: number) {
  const qs: Q[] = [];
  out.forEach(([a, b], i) => {
    const [a2, b2] = out[(i + 1) % out.length], na = b2 - b, nb = -(a2 - a); // outward for a clockwise outline
    const n = unit(mix(U, V, na, nb));
    if (n[0] + n[1] + n[2] > 1e-6) qs.push({ q: [W(a, b, c0), W(a2, b2, c0), W(a2, b2, c1), W(a, b, c1)], f: tone(n, T, L, R), d: (n[0] + n[1] + n[2]) * 0 + (a + a2) * 0.01 + (b + b2) * -0.01 });
  });
  qs.forEach((s) => p.face(s.q, s.f, 0));
  p.face(out.map(([a, b]) => W(a, b, c0)), front, 1, 0.6);
}
const pill = (a0: number, a1: number, hb: number, r: number): [number, number][] => {
  const pts: [number, number][] = [];
  const corner = (ca: number, cb: number, s: number) => { for (let i = 0; i <= 6; i++) { const t = s - (i / 6) * (Math.PI / 2); pts.push([ca + Math.cos(t) * r, cb + Math.sin(t) * r]); } };
  corner(a0 + r, hb - r, Math.PI); corner(a1 - r, hb - r, Math.PI / 2); corner(a1 - r, -hb + r, 0); corner(a0 + r, -hb + r, -Math.PI / 2);
  return pts;
};
const circ = (a: number, b: number, r: number, c: number, n = 24): V3[] => Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return W(a + Math.cos(t) * r, b + Math.sin(t) * r, c); });

export const carkey: Illustration = {
  k: "carkey", name: "Car key", title: "No car added", body: "Add your car and its details and reminders will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const press = Math.sin(Math.PI * seg(h, 0.05, 0.45)), L = seg(h, 0.45, 0.65);
    p.translate(0, 0, -2);
    p.push(); p.translate(0, 0, -14); p.shadow(1, 0, 30, 12, 0.12); p.pop();
    // the key ring, behind, through the hole at the left end
    const ringPts = (from: number, to: number) => Array.from({ length: 31 }, (_, i) => { const a = from + ((to - from) * i) / 30; return p.pt(W(-14 + Math.cos(a) * 5, 7.5 + Math.sin(a) * 5, -2)); });
    const ring = (from: number, to: number) => { const q = ringPts(from, to); p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 2; g.lineCap = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }); };
    ring(-0.1, Math.PI * 2 - 1.1);
    // the metal blade out of the right end, with its teeth along the bottom
    const bl: [number, number][] = [[8, 2.4], [17.5, 2.4], [20.5, 0.2], [20.5, -1.4], [19, -1.4], [18, -2.6], [16.8, -1.4], [15.6, -2.6], [14.4, -1.4], [13.2, -2.6], [12, -1.4], [8, -1.4]];
    slab(p, bl, -1.2, -2.8, 0.34, 0.26, 0.16, 0.36);
    p.line([W(10, 0.5, -1.17), W(17.5, 0.5, -1.17)], 1, 0.6);
    // the fob
    slab(p, pill(-13, 11, 9, 7), 0, -4.4, 0.28, 0.15, 0.065, 0.22);
    p.clear(circ(-10, 4.6, 1.5, 0.03));
    ring(-1.1, -0.1);
    // three buttons in a row; the first carries a padlock and presses in
    const B: [number, number][] = [[-4.2, 0], [1.6, 0], [7, 0]];
    B.forEach(([a, b], i) => {
      const d = i === 0 ? press * 0.5 : 0, r = i === 2 ? 2.2 : 2.6;
      p.face(circ(a, b, r + 0.9, 0.04), 0.03, 0);
      p.face(circ(a, b, r, 0.5 - d), i === 0 ? 0.42 + 0.3 * L : 0.36, 0);
    });
    // a closed padlock on the first, an open one on the second, a dot on the third
    const lock = (a: number, open: number) => {
      p.face([W(a - 1.1, -1.3, 0.55), W(a + 1.1, -1.3, 0.55), W(a + 1.1, 0.3, 0.55), W(a - 1.1, 0.3, 0.55)], 0.03, 0);
      p.line(Array.from({ length: 9 }, (_, i) => { const t = (i / 8) * Math.PI; return W(a + open + Math.cos(t) * 0.75, 0.3 + Math.sin(t) * 1.1, 0.55); }), 1, 0.55);
    };
    lock(-4.2 - press * 0.05, 0);
    lock(1.6, 0.6);
    p.dot(W(7, 0, 0.55), 0.7, 0.03);
    // the light at the top, blinking on hover
    const [lx, ly] = p.pt(W(1.6, 5.4, 0.05)), blink = L * (0.7 + 0.3 * Math.sin(t * 8));
    p.screen((g) => { g.fillStyle = "#000"; g.beginPath(); g.arc(lx, ly, 1.4, 0, Math.PI * 2); g.fill(); if (blink > 0) { g.fillStyle = `rgba(255,255,255,${blink.toFixed(3)})`; g.beginPath(); g.arc(lx, ly, 1.1, 0, Math.PI * 2); g.fill(); } });
  },
};
