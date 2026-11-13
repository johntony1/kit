// No long trips yet: a fat U shaped travel pillow seen from the front and a little above, its opening at the top and a strap with a button on one end. Hover and it puffs up, bounces and settles.
import { type Illustration, type V3 } from "../dots";

type Q = { q: V3[]; f: number; d: number };
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
// the frame that faces the viewer: a runs right on screen, b runs up, c comes toward us
const U = unit([1, -1, 0]), V = unit([-1, -1, 2]), N = unit([1, 1, 1]);
const TILT = -0.28; // tip the top away so we look down on it a little
const W = ([a, b, c]: V3): V3 => {
  const b2 = b * Math.cos(TILT) - c * Math.sin(TILT), c2 = b * Math.sin(TILT) + c * Math.cos(TILT);
  return [a * U[0] + b2 * V[0] + c2 * N[0], a * U[1] + b2 * V[1] + c2 * N[1], a * U[2] + b2 * V[2] + c2 * N[2]];
};
const L = unit([-0.45, 0.8, 0.55]); // light from the upper left, in the a b c frame
const RX = 10.5, RY = 11, G = 0.72; // the centre line's radii, and half the gap at the top (radians)

export const neckpillow: Illustration = {
  k: "neckpillow", name: "Neck pillow", title: "No long trips yet", body: "Book a long haul flight or an overnight train and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = seg(h, 0, 1), puff = k < 0.4 ? Math.sin((k / 0.4) * Math.PI / 2) * 1.25 : k < 0.7 ? 1.25 - 0.4 * Math.sin(((k - 0.4) / 0.3) * Math.PI / 2) : 0.85 + 0.15 * Math.sin(((k - 0.7) / 0.3) * Math.PI / 2);
    const r = 5.4 * (1 + 0.1 * puff), lift = 2.4 * Math.sin(Math.PI * Math.min(1, k / 0.55));
    p.translate(0, 0, -2 + lift);
    p.push(); p.translate(0, 0, -15 - lift); p.shadow(0, 0, 26, 12, 0.11); p.pop();
    // the centre line runs from one end, down round the bottom, up to the other end
    const t0 = Math.PI / 2 + G, t1 = Math.PI / 2 - G + Math.PI * 2;
    const C = (t: number): V3 => [RX * Math.cos(t), RY * Math.sin(t), 0];
    const T = (t: number): V3 => unit([-RX * Math.sin(t), RY * Math.cos(t), 0]);
    const M = 22, rings: { o: V3; pts: V3[] }[] = [];
    const ring = (o: V3, tan: V3, rr: number) => {
      const n = unit(cross(tan, [0, 0, 1]));
      return { o, pts: Array.from({ length: M }, (_, j) => { const f = (j / M) * Math.PI * 2; return [o[0] + (n[0] * Math.cos(f)) * rr, o[1] + (n[1] * Math.cos(f)) * rr, Math.sin(f) * rr] as V3; }) };
    };
    const cap = (t: number, sgn: number, i: number) => { const s = (i / 5) * r * 0.98, o = C(t), tn = T(t); return ring([o[0] + tn[0] * s * sgn, o[1] + tn[1] * s * sgn, 0], tn, Math.sqrt(r * r - s * s)); };
    for (let i = 5; i >= 1; i--) rings.push(cap(t0, -1, i));
    const S = 48;
    for (let i = 0; i <= S; i++) { const t = t0 + ((t1 - t0) * i) / S; rings.push(ring(C(t), T(t), r)); }
    for (let i = 1; i <= 5; i++) rings.push(cap(t1, 1, i));
    const qs: Q[] = [];
    for (let i = 0; i + 1 < rings.length; i++) {
      const A = rings[i].pts, B = rings[i + 1].pts, o: V3 = [(rings[i].o[0] + rings[i + 1].o[0]) / 2, (rings[i].o[1] + rings[i + 1].o[1]) / 2, 0];
      for (let j = 0; j < M; j++) {
        const jj = (j + 1) % M, q: V3[] = [A[j], B[j], B[jj], A[jj]];
        const c: V3 = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, (q[0][2] + q[2][2]) / 2];
        let n = cross(sub(B[j], A[j]), sub(A[jj], A[j]));
        if (dot(n, sub(c, o)) < 0) n = [-n[0], -n[1], -n[2]];
        n = unit(n);
        // facing us after the tilt
        if (n[1] * Math.sin(TILT) + n[2] * Math.cos(TILT) <= 0.02) continue;
        const d = dot(n, L);
        qs.push({ q: q.map(W), f: d > 0.6 ? 0.32 : d > 0.12 ? 0.2 : 0.1, d: c[1] * Math.sin(TILT) + c[2] * Math.cos(TILT) });
      }
    }
    qs.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.f, 0));
    // a strap round the left end, with a bright button on it
    const ts = t0 + 0.3, so = C(ts), sn = unit(cross(T(ts), [0, 0, 1])), tn = T(ts);
    const band = (w: number) => Array.from({ length: 13 }, (_, j) => { const f = -Math.PI / 2 + (j / 12) * Math.PI; return W([so[0] + sn[0] * Math.sin(f) * (r + 0.1) + tn[0] * w, so[1] + sn[1] * Math.sin(f) * (r + 0.1) + tn[1] * w, Math.cos(f) * (r + 0.1)]); });
    p.line(band(-0.9), 1, 0.7);
    p.line(band(0.9), 1, 0.7);
    const bt = W([so[0] - sn[0] * r * 0.15, so[1] - sn[1] * r * 0.15, r * 0.98]);
    p.dot(bt, 2.6, 0.02);
    p.dot(bt, 1.8, 0.5);
  },
};
