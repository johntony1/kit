// No premium items: a cut diamond floating on its point. It turns slowly so its facets catch the light, and a glint flashes on its edge.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop: one facet's worth of turn
const N = 8;
const ZT = 28, ZG = 22.5, ZC = 4, RT = 7.8, RG = 13.2; // table, girdle and point heights; table and girdle radii
const CT = Math.cos(0.42), ST = Math.sin(0.42);
const L: V3 = [-0.42, 0.72, 0.55]; // where the light comes from
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export const diamond: Illustration = {
  k: "diamond", name: "Diamond", title: "No premium items", body: "Premium items you add will be kept here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, spin = (u * Math.PI * 2) / N + 0.2, bob = Math.sin(u * Math.PI * 2) * 1.1;
    p.translate(0, 0, -16.5);
    p.shadow(0, 0, 17 - bob, 8.5 - bob * 0.5, 0.12);
    p.translate(0, 0, bob + 1);
    const ring = (r: number, z: number): V3[] => Array.from({ length: N }, (_, i) => { const a = spin + (i / N) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
    // tipped back a little, so the long point shows as much as the crown
    const lean = ([x, y, z]: V3): V3 => { const f = (x + y) * 0.7071, e = (x - y) * 0.7071, g = f * CT - (z - 18) * ST; return [(g + e) * 0.7071, (g - e) * 0.7071, 18 + f * ST + (z - 18) * CT]; };
    const tb = ring(RT, ZT).map(lean), gd = ring(RG, ZG).map(lean), tip = lean([0, 0, ZC]);
    const faces: V3[][] = [];
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      faces.push([tip, gd[j], gd[i]], [gd[i], gd[j], tb[j], tb[i]]);
    }
    const lit: { d: number; pts: V3[]; f: number }[] = [];
    for (const f of faces) {
      let n = cross(sub(f[1], f[0]), sub(f[2], f[0]));
      const c = f.reduce((s, q) => [s[0] + q[0] / f.length, s[1] + q[1] / f.length, s[2] + q[2] / f.length] as V3, [0, 0, 0] as V3);
      if (n[0] * c[0] + n[1] * c[1] + n[2] * (c[2] - 18) < 0) n = [-n[0], -n[1], -n[2]];
      const len = Math.hypot(...n);
      if (n[0] + n[1] + n[2] <= 0) continue; // faces away
      const k = Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / len);
      // each facet drawn a touch small, so dark seams part it from its neighbours
      lit.push({ d: c[0] + c[1] + c[2], pts: f.map((q) => [c[0] + (q[0] - c[0]) * 0.93, c[1] + (q[1] - c[1]) * 0.93, c[2] + (q[2] - c[2]) * 0.93] as V3), f: 0.075 + 0.27 * Math.pow(k, 1.4) });
    }
    lit.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, SH.edge, 0.5));
    p.face(tb.map((q) => [q[0] * 0.92, q[1] * 0.92, q[2]] as V3), 0.3, SH.edge, 0.6);
    // the glint: a four point flash on the girdle that swells and fades once per loop
    const g = Math.pow(Math.max(0, Math.sin(u * Math.PI)), 3);
    const [x, y] = p.pt([-RG * 0.66, RG * 0.66, ZG + 1]);
    if (g > 0.03) p.screen((c) => {
      const r = 6.5 * g;
      c.fillStyle = "#fff"; c.beginPath();
      for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, q = i % 2 ? r * 0.24 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
      c.closePath(); c.fill();
    });
  },
};
