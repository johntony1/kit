// No orders yet: a hot dog seen from the side and a little above, a fat sausage lying in a soft split bun, its ends poking out. Hover and a bright zigzag of mustard squeezes along the top.
import { type Illustration, type V3 } from "../dots";

type Q = { q: V3[]; f: number; d: number };
const TAU = Math.PI * 2;
/** a gridded surface P(u, v); O(u, v) lies inside it so normals point out. Quads facing us go into L */
function surf(L: Q[], nu: number, nv: number, P: (u: number, v: number) => V3, O: (u: number, v: number) => V3, tone: (n: V3) => number) {
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = i / nu, u1 = (i + 1) / nu, v0 = j / nv, v1 = (j + 1) / nv;
    const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
    const e = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], g = [d[0] - b[0], d[1] - b[1], d[2] - b[2]];
    const n: V3 = [e[1] * g[2] - e[2] * g[1], e[2] * g[0] - e[0] * g[2], e[0] * g[1] - e[1] * g[0]];
    const m: V3 = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4], o = O((u0 + u1) / 2, (v0 + v1) / 2);
    const l = Math.hypot(n[0], n[1], n[2]) || 1, s = ((m[0] - o[0]) * n[0] + (m[1] - o[1]) * n[1] + (m[2] - o[2]) * n[2] < 0 ? -1 : 1) / l;
    const k: V3 = [n[0] * s, n[1] * s, n[2] * s];
    if (k[0] + k[1] + k[2] <= 0.01) continue;
    const grow = (v: V3): V3 => [m[0] + (v[0] - m[0]) * 1.1, m[1] + (v[1] - m[1]) * 1.1, m[2] + (v[2] - m[2]) * 1.1];
    L.push({ q: [a, b, c, d].map(grow), f: tone(k), d: m[0] + m[1] + m[2] });
  }
}
const flush = (p: { face: (q: V3[], f: number, e?: number) => void }, L: Q[]) => { L.sort((x, y) => x.d - y.d).forEach((k) => p.face(k.q, k.f, 0)); L.length = 0; };
/** u along the hot dog (to the right, a little down), f across it (toward us on the left), z up */
const CA = Math.cos(-0.22), SA = Math.sin(-0.22), FY = (CA - SA) * 0.5; // FY: how far down the screen one step of f goes
const at = (u: number, f: number, z: number): V3 => [u * CA - f * SA, u * SA + f * CA, z];
const side = (n: V3) => n[0] * CA + n[1] * SA, front = (n: V3) => -n[0] * SA + n[1] * CA;
// the bun: a lit crust on top, a dense face toward us, the right end in shade
const bun = (n: V3) => (n[2] > 0.55 ? 0.2 : side(n) > 0.55 ? 0.065 : front(n) > -0.1 ? 0.12 : 0.065);
// the sausage: brighter than the bun so it stands out, its right end in shade
const meat = (n: V3) => (side(n) > 0.6 ? 0.1 : n[2] > 0.35 ? 0.3 : 0.2);
/** a long rounded loaf with blunt ends, centred on (f0, z0) */
function loaf(L: Q[], ra: number, rf: number, rz: number, f0: number, z0: number, tone: (n: V3) => number, blunt = 0.45) {
  surf(L, 30, 40, (u, v) => {
    const b = (u - 0.5) * Math.PI, w = v * TAU, c = Math.pow(Math.abs(Math.cos(b)), blunt);
    return at(Math.sign(b) * Math.pow(Math.abs(Math.sin(b)), 0.8) * ra, f0 + Math.cos(w) * rf * c, z0 + Math.sin(w) * rz * c);
  }, (u) => at(Math.sin((u - 0.5) * Math.PI) * ra * 0.5, f0, z0), tone);
}

const SR = 4.6, SZ = 8.8; // sausage radius and the height of its axis
const NF = 4.4, NR = 4.2, NZ = 4.4; // the near half of the bun: its offset toward us, depth and height

export const hotdog: Illustration = {
  k: "hotdog", name: "Hot dog", title: "No orders yet", body: "When someone places an order it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const L: Q[] = [];
    p.translate(0, 0, -8);
    p.scale(1.25);
    p.shadow(0, 0, 30, 11, 0.12);
    // the far half of the bun, the sausage lying in the split, then the near half
    loaf(L, 12.5, 4.2, 4.6, -4.2, 4.6, bun); flush(p, L);
    loaf(L, 19.5, SR, SR, 0.3, SZ, meat, 0.5); flush(p, L);
    loaf(L, 12.5, NR, NZ, NF, NZ, bun); flush(p, L);
    // a dark cut along the near half's top, where it meets the sausage
    const w = Math.PI - Math.atan(NZ / (FY * NR));
    p.line(Array.from({ length: 25 }, (_, i) => { const b = (i / 24 - 0.5) * Math.PI * 0.86, c = Math.pow(Math.cos(b), 0.45); return at(Math.sin(b) * 12.5, NF + Math.cos(w) * NR * c, NZ + Math.sin(w) * NZ * c); }), 1, 0.8);
    // the mustard: a bright zigzag that squeezes on from the left end
    const k = Math.min(1, Math.max(0, (h - 0.05) / 0.8));
    if (k > 0) {
      const n = 120, m = Math.max(2, Math.round(n * k));
      const pts = Array.from({ length: m }, (_, i) => {
        const s = i / (n - 1), u = -13 + s * 26, f = 0.4 + Math.sin(s * Math.PI * 6.5) * 2.8;
        return p.pt(at(u, f, SZ + SR * Math.sqrt(Math.max(0, 1 - ((f - 0.4) / SR) ** 2)) + 0.3));
      });
      p.screen((g) => {
        g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.strokeStyle = "#000"; g.lineWidth = 3.6; g.stroke();
        g.strokeStyle = "#fff"; g.lineWidth = 2; g.stroke();
        if (k < 1) { const [x, y] = pts[pts.length - 1]; g.beginPath(); g.arc(x, y, 1.7 + 0.3 * Math.sin(t * 12), 0, TAU); g.fillStyle = "#fff"; g.fill(); }
      });
    }
  },
};
