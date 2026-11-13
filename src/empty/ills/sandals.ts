// No beach days: a pair of flip flops side by side. Hover and they take a step, one and then the other.
import { type Illustration, type Pen, type V3 } from "../dots";

type Q = { q: V3[]; f: number; d: number };
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const tone = (n: V3, T: number, L: number, R: number) => {
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  if (n[2] / l > 0.55) return T;
  return R + (L - R) * Math.max(0, Math.min(1, Math.atan2(n[1], n[0]) / (Math.PI / 2)));
};
const HL = 12; // half length of a sole
// the sole's outline, toe toward +x; m mirrors it for the other foot
const sole = (m: number): [number, number][] => Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  const w = 3.9 + 0.9 * c - (s * m < 0 ? 0.9 * Math.exp(-(((c + 0.1) / 0.35) ** 2)) : 0); // wide at the ball, an arch on the inside
  return [HL * c, s * w];
});
const YAW = (-3 * Math.PI) / 4;

function flipflop(p: Pen, ox: number, oy: number, m: number, lift: number, tip: number) {
  const X = ([x, y, z]: V3): V3 => {
    const z1 = z + Math.max(0, x + HL) * Math.sin(tip); // the toe tips up as it steps
    return [ox + x * Math.cos(YAW) - y * Math.sin(YAW), oy + x * Math.sin(YAW) + y * Math.cos(YAW), z1 + lift];
  };
  const base = sole(m).map(([x, y]) => X([x, y, 0])), top = sole(m).map(([x, y]) => X([x, y, 2.2]));
  let N: V3 = [0, 0, 0];
  base.forEach((a, i) => { const b = base[(i + 1) % base.length]; N = [N[0] + (a[1] - b[1]) * (a[2] + b[2]), N[1] + (a[2] - b[2]) * (a[0] + b[0]), N[2] + (a[0] - b[0]) * (a[1] + b[1])]; });
  const qs: Q[] = [];
  base.forEach((a, i) => {
    const j = (i + 1) % base.length, n = cross(sub(base[j], a), N);
    if (n[0] + n[1] + n[2] > 1e-6) qs.push({ q: [a, base[j], top[j], top[i]], f: tone(n, 0.2, 0.12, 0.065), d: a[0] + a[1] + a[2] });
  });
  qs.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.f, 0));
  p.face(top, 0.26, 1, 0.6);
  // the strap: a Y from the toe post to both sides at the arch, raised off the sole
  const post = X([6.5, -0.9 * m, 2.2]);
  for (const sd of [-1, 1]) {
    p.line(Array.from({ length: 11 }, (_, i) => { const u = i / 10, x = 6.5 + (-1.5 - 6.5) * u, y = -0.9 * m + (sd * 3.9 + 0.9 * m) * u; return X([x, y, 2.25 + 2.2 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.4)]); }), 1, 1.2);
  }
  p.dot(post, 1.1, 0);
}

export const sandals: Illustration = {
  k: "sandals", name: "Sandals", title: "No beach days", body: "Plan a trip to the coast and your beach days will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const a = ease(seg(h, 0, 0.5)), b = ease(seg(h, 0.45, 0.95)), step = 5;
    const dir: [number, number] = [Math.cos(YAW), Math.sin(YAW)], side: [number, number] = [-Math.sin(YAW) * 5.4, Math.cos(YAW) * 5.4];
    p.translate(2.5, 2.5, -1);
    p.scale(1.4);
    p.shadow(-2.5, -2.5, 30, 15, 0.12);
    // the far one (the left foot) steps second, the near one first
    const s2 = b * step - 2.5;
    flipflop(p, dir[0] * s2 - side[0], dir[1] * s2 - side[1], -1, 4 * Math.sin(Math.PI * b), 0.18 * Math.sin(Math.PI * b));
    const s1 = a * step;
    flipflop(p, dir[0] * s1 + side[0], dir[1] * s1 + side[1], 1, 4 * Math.sin(Math.PI * a), 0.18 * Math.sin(Math.PI * a));
  },
};
