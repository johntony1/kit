// No temperature set: a round thermostat, a thick puck with a dark screen showing two dashes. Hover and the ring of light sweeps round and a reading of 21 comes up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a flat outline pushed back by `off`: the visible walls (toned by where they point), then the face */
function ext(p: Pen, f: V3[], off: V3, front: number, edge = SH.edge) {
  const n = f.length;
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < n; i++) { const a = f[i], b = f[(i + 1) % n]; nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]); }
  if (nx * off[0] + ny * off[1] + nz * off[2] > 0) f = f.slice().reverse();
  const g = f.map(([x, y, z]) => [x + off[0], y + off[1], z + off[2]] as V3);
  const back = g.slice().reverse();
  if (facing(p, back) > 0) p.face(back, front * 0.5, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = f[i], b = f[j], q: V3[] = [g[i], g[j], b, a];
    if (facing(p, q) <= 0) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const wx = dz * off[1] - dy * off[2], wy = dx * off[2] - dz * off[0], wz = dy * off[0] - dx * off[1];
    p.face(q, wz / (Math.hypot(wx, wy, wz) || 1) > 0.5 ? 0.22 : wy > wx ? 0.12 : 0.065, 0);
  }
  if (facing(p, f) > 0) p.face(f, front, edge, 0.6);
}
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const ZC = 17, R = 15; // dial centre height, dial radius
const circ = (r: number): P2[] => Array.from({ length: 44 }, (_, i) => { const a = (i / 44) * Math.PI * 2; return [Math.cos(a) * r, ZC + Math.sin(a) * r] as P2; });
const at = (pts: P2[], y: number): V3[] => pts.map(([u, v]) => [u, y, v] as V3);
// seven segment digits: which of a,b,c,d,e,f,g are lit
const SEG: Record<string, string> = { "-": "g", "2": "abged", "1": "bc" };
function digit(p: Pen, ch: string, cx: number, y: number) {
  const w = 2.4, hh = 3.8, s = 0.7;
  const bars: Record<string, [number, number, number, number]> = {
    a: [cx - w, ZC + hh - s, cx + w, ZC + hh + s], g: [cx - w, ZC - s, cx + w, ZC + s], d: [cx - w, ZC - hh - s, cx + w, ZC - hh + s],
    f: [cx - w - s, ZC, cx - w + s, ZC + hh], b: [cx + w - s, ZC, cx + w + s, ZC + hh],
    e: [cx - w - s, ZC - hh, cx - w + s, ZC], c: [cx + w - s, ZC - hh, cx + w + s, ZC],
  };
  for (const k of SEG[ch]) { const [a, b, c, d] = bars[k]; p.face(at([[a, b], [c, b], [c, d], [a, d]], y), 0.9, 0); }
}

export const thermostat: Illustration = {
  k: "thermostat", name: "Thermostat", title: "No temperature set", body: "Set a temperature and the schedule for your space will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(cl(h / 0.75));
    p.translate(0, 0, -ZC);
    p.shadow(0, 0, 24, 11, 0.11);
    p.rotate("z", -0.42);
    // the dial: a thick lit puck with a dark screen
    ext(p, at(circ(R), 4), [0, -7, 0], 0.26);
    p.face(at(circ(R - 2.6), 4.03), 0.035, SH.edge, 0.6);
    // the ring: a dim track, lit from its start round as far as the setting
    const y = 4.06, a0 = Math.PI * 1.25, sweep = Math.PI * 1.5 * 0.72 * k;
    const ring = (a1: number, rr0: number, rr1: number): V3[] => {
      const o: P2[] = [], n = 24;
      for (let i = 0; i <= n; i++) { const a = a0 - ((a0 - a1) * i) / n; o.push([Math.cos(a) * rr1, ZC + Math.sin(a) * rr1]); }
      for (let i = n; i >= 0; i--) { const a = a0 - ((a0 - a1) * i) / n; o.push([Math.cos(a) * rr0, ZC + Math.sin(a) * rr0]); }
      return at(o, y);
    };
    p.face(ring(a0 - Math.PI * 1.5, R - 5.4, R - 4.2), 0.14, 0);
    if (sweep > 0.02) {
      p.face(ring(a0 - sweep, R - 5.9, R - 3.7), 0.9, 0);
      const e = a0 - sweep;
      p.dot([Math.cos(e) * (R - 4.8), y + 0.02, ZC + Math.sin(e) * (R - 4.8)], 1.9, SH.glow);
    }
    // the reading: two dashes at rest, 21 once it is set
    const show = h > 0.6 ? "21" : "--";
    digit(p, show[0], -3.6, y + 0.04);
    digit(p, show[1], 3.6, y + 0.04);
  },
};
