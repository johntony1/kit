// Nothing on the grill: a round kettle barbecue on three legs, its domed lid shut. Hover and the lid swings up and back on its hinge, showing the bright grate with the coals glowing under it.
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
const back = (x: number) => { const v = Math.min(1, Math.max(0, x)); return 1 + 2.2 * Math.pow(v - 1, 3) + 1.2 * Math.pow(v - 1, 2); };
const S2 = Math.SQRT1_2, R = 13.5, ZR = 21, LH = 10; // bowl radius, rim height, lid height
/** u across the screen, f toward us, z up */
const at = (u: number, f: number, z: number): V3 => [u * S2 + f * S2, -u * S2 + f * S2, z];
/** the lid's own points (rim centre at the origin) turned up and back by a about the hinge at the far edge of the rim */
const lift = (v: V3, a: number): V3 => {
  const f = (v[0] + v[1]) * S2 + R, u = (v[0] - v[1]) * S2, c = Math.cos(a), s = Math.sin(a);
  return at(u, f * c - v[2] * s - R, ZR + 0.4 + f * s + v[2] * c);
};
const circ = (r: number, z: number, n = 64): V3[] => Array.from({ length: n }, (_, i) => { const w = (i / n) * TAU; return [Math.cos(w) * r, Math.sin(w) * r, z]; });

export const grill: Illustration = {
  k: "grill", name: "Grill", title: "Nothing on the grill", body: "Orders you start will show up here once they hit the grill.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const L: Q[] = [], open = back(h / 0.75) * 1.3;
    p.translate(0, 0, -21);
    p.shadow(0, 0, 26, 13, 0.12);
    // three fat legs splayed out to the floor; the far one first
    const leg = (a: number) => {
      const top = at(Math.cos(a) * 6, Math.sin(a) * 6, ZR - 13), bot = at(Math.cos(a) * 14.5, Math.sin(a) * 14.5, 0);
      const C = (u: number): V3 => [top[0] + (bot[0] - top[0]) * u, top[1] + (bot[1] - top[1]) * u, top[2] + (bot[2] - top[2]) * u];
      surf(L, 8, 12, (u, v) => { const c = C(u), w = v * TAU; return [c[0] + Math.cos(w) * 1.4, c[1] + Math.sin(w) * 1.4, c[2]]; }, (u) => C(u), (n) => (n[1] > n[0] ? 0.24 : 0.12));
      flush(p, L);
    };
    leg(-Math.PI / 2 - 0.3);
    // the lid: a dome with a bar handle on top, a bright lip round its edge
    const lid = () => {
      surf(L, 1, 64, (u, v) => { const w = v * TAU; return lift([Math.cos(w) * (R + 0.3), Math.sin(w) * (R + 0.3), -0.4 + u * 1.6], open); }, () => lift([0, 0, 0.4], open), () => 0.3);
      flush(p, L);
      const dome = (u: number, v: number) => { const b = (u * Math.PI) / 2, w = v * TAU; return lift([Math.cos(w) * R * Math.cos(b), Math.sin(w) * R * Math.cos(b), 1.2 + LH * Math.sin(b)], open); };
      // the inside of the dome, once it turns toward us: a dense dish
      if (open > 0.1) { surf(L, 12, 64, dome, (u, v) => { const b = (u * Math.PI) / 2, w = v * TAU; return lift([Math.cos(w) * R * 2 * Math.cos(b), Math.sin(w) * R * 2 * Math.cos(b), 1.2 + LH * 2 * Math.sin(b)], open); }, () => 0.12); flush(p, L); }
      surf(L, 12, 64, dome,
        (u) => lift([0, 0, LH * Math.sin((u * Math.PI) / 2) - 2], open), (n) => (n[2] > 0.6 ? 0.24 : n[1] > n[0] ? 0.13 : 0.065));
      flush(p, L);
      for (const s of [-3.4, 3.4]) {
        const a = lift(at(s, 0, LH + 0.8), open), b = lift(at(s, 0, LH + 3.4), open);
        surf(L, 2, 8, (u, v) => { const w = v * TAU; return [a[0] + (b[0] - a[0]) * u + Math.cos(w) * 0.6, a[1] + (b[1] - a[1]) * u + Math.sin(w) * 0.6, a[2] + (b[2] - a[2]) * u]; }, (u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u], () => 0.15);
      }
      surf(L, 10, 12, (u, v) => { const w = v * TAU; return lift(at(-4.4 + 8.8 * u, Math.cos(w) * 1.3, LH + 3.6 + Math.sin(w) * 1.3), open); }, (u) => lift(at(-4.4 + 8.8 * u, 0, LH + 3.6), open), (n) => (n[2] > 0.5 ? 0.32 : 0.15));
      flush(p, L);
      // a vent on its face while it is shut
      if (open < 0.3) p.line(Array.from({ length: 9 }, (_, i) => lift(at(-2.4 + i * 0.6, 8.6, 7.6), open)), 1, 0.9);
    };
    if (open > 0.9) lid(); // swung up behind the bowl
    // the bowl: the lower half of a ball, lit on the left
    surf(L, 12, 64, (u, v) => { const b = (u * Math.PI) / 2, w = v * TAU; return [Math.cos(w) * R * Math.sin(b), Math.sin(w) * R * Math.sin(b), ZR - 14 * Math.cos(b)]; }, (u) => [0, 0, ZR - 14 * Math.cos((u * Math.PI) / 2) + 2], (n) => (n[1] > n[0] - 0.2 ? 0.16 : 0.075));
    flush(p, L);
    leg(Math.PI / 2 - 0.95); leg(Math.PI / 2 + 0.95);
    if (open > 0.05) {
      // the inside: dark, glowing coals, then the bright grate across it
      p.face([...circ(R + 0.3, ZR), ...circ(R - 1.2, ZR).reverse()], 0.3, 0); // the rim all round
      p.face(circ(R - 1.2, ZR), 0.03, 0);
      const glow = Math.min(1, open / 1.3);
      p.screen((g) => {
        for (let i = 0; i < 9; i++) {
          const a = i * 2.4, r = 2 + (i % 3) * 3.6, [x, y] = p.pt([Math.cos(a) * r, Math.sin(a) * r, ZR - 0.5]);
          const n = Math.round(110 + 145 * glow * (0.65 + 0.35 * Math.sin(t * 4 + i * 2)));
          g.beginPath(); g.arc(x, y, 1.5 + 0.25 * Math.sin(t * 5 + i), 0, TAU); g.fillStyle = `rgb(${n},${n},${n})`; g.fill();
        }
        g.lineCap = "round";
        for (let k = -4; k <= 4; k++) {
          const u = k * 2.9, f = Math.sqrt(Math.max(0, (R - 1) ** 2 - u * u));
          const [x0, y0] = p.pt(at(u, -f, ZR + 0.3)), [x1, y1] = p.pt(at(u, f, ZR + 0.3));
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1);
          g.strokeStyle = "#000"; g.lineWidth = 2.6; g.stroke();
          g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.stroke();
        }
      });
    }
    // the rim: a bright band
    surf(L, 1, 64, (u, v) => { const w = v * TAU; return [Math.cos(w) * (R + 0.3), Math.sin(w) * (R + 0.3), ZR - 1.3 + u * 1.5]; }, () => [0, 0, ZR], () => 0.3);
    flush(p, L);
    // a dark cut under the rim
    p.line(Array.from({ length: 33 }, (_, i) => { const w = -Math.PI / 4 + (i / 32) * Math.PI; return [Math.cos(w) * (R + 0.05), Math.sin(w) * (R + 0.05), ZR - 1.5] as V3; }), 1, 0.8);
    if (open <= 0.9) lid();
  },
};
