// Nobody invited yet: three big round avatars in a row, overlapping, each with a head and shoulders cut in. Hover and they hop one after another, and a plus badge pops in against the last.
import { type Illustration, type Pen, type V3 } from "../dots";

const facing = (p: Pen, q: V3[]) => {
  const s = q.map((v) => p.pt(v));
  let a = 0;
  for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; }
  return a;
};
const depth = (q: V3[]) => q.reduce((s, v) => s + v[0] + v[1] + v[2], 0) / q.length;
/** a slab: the outline B pushed along d. The sides it shows are shaded by where they face, then the cap */
function prism(p: Pen, B: V3[], d: V3, cap: number) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < B.length; i++) {
    const a = B[i], b = B[(i + 1) % B.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  if (nx * d[0] + ny * d[1] + nz * d[2] < 0) B = B.slice().reverse();
  const F = B.map(([x, y, z]) => [x + d[0], y + d[1], z + d[2]] as V3);
  const sides = B.map((b, i) => [b, B[(i + 1) % B.length], F[(i + 1) % B.length], F[i]] as V3[]).filter((q) => facing(p, q) > 0).sort((a, b) => depth(a) - depth(b));
  for (const q of sides) {
    const e = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]];
    const n = [e[1] * d[2] - e[2] * d[1], e[2] * d[0] - e[0] * d[2], e[0] * d[1] - e[1] * d[0]], l = Math.hypot(n[0], n[1], n[2]) || 1;
    p.face(q, n[2] / l > 0.55 ? 0.2 : n[1] > n[0] ? 0.12 : 0.065, 0);
  }
  if (facing(p, F) > 0) p.face(F, cap, 0);
}
const back = (x: number) => 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2);
const S = 0.82, R = 12, T = 3; // x squeeze so circles stay round, avatar radius, thickness
const circ = (cx: number, cz: number, r: number, y: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r * S, y, cz + Math.sin(a) * r] as V3; });

function avatar(p: Pen, cx: number, cz: number, y: number, tone: number) {
  // a dark ring round it, so it parts from the one behind
  p.clear(circ(cx, cz, R + 1.5, y + T + 0.02));
  prism(p, circ(cx, cz, R, y), [0, T, 0], tone);
  const f = y + T + 0.04;
  p.clear(circ(cx, cz + 3, 4.3, f, 28)); // the head
  // the shoulders: the top of an oval, cut off by the rim
  const rr = R - 1.8, sh: [number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI, x = Math.cos(a) * 8, z = -11 + Math.sin(a) * 8.6;
    if (Math.hypot(x, z) < rr) sh.push([x, z]);
  }
  const a0 = Math.atan2(sh[sh.length - 1][1], sh[sh.length - 1][0]), a1 = Math.atan2(sh[0][1], sh[0][0]);
  for (let i = 1; i < 14; i++) { const a = a0 + (a1 - a0) * (i / 14); sh.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  p.clear(sh.map(([x, z]) => [cx + x * S, f, cz + z] as V3));
}

export const avatarstack: Illustration = {
  k: "avatarstack", name: "Avatar stack", title: "Nobody invited yet", body: "Invite people to join and their faces will line up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 32, 10, 0.12);
    p.rotate("z", -0.7);
    const hop = (i: number) => { const x = h * 1.7 - i * 0.24; return x > 0 && x < 1 ? Math.sin(x * Math.PI) * 3.4 : 0; };
    // the right one sits at the back, the left one in front
    const tones = [0.3, 0.22, 0.3];
    for (let i = 2; i >= 0; i--) avatar(p, (i - 1) * 13.5 * S, R + 0.5 + hop(i), -2.4 * i, tones[i]);
    // the plus badge, tight on the last one's shoulder
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const cx = (13.5 + R * 0.74) * S, cz = R + 0.5 + R * 0.74, y = 1;
      p.push();
      p.scale(Math.max(0.01, back(b)), [cx, y, cz]);
      p.clear(circ(cx, cz, 6.6, y + 2.6));
      prism(p, circ(cx, cz, 5.4, y), [0, 2.5, 0], 0.45);
      const f = y + 2.54;
      p.line([[cx - 2.9 * S, f, cz], [cx + 2.9 * S, f, cz]], 1, 1.3);
      p.line([[cx, f, cz - 2.9], [cx, f, cz + 2.9]], 1, 1.3);
      p.pop();
    }
  },
};
