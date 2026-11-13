// All clear for now: a chunky rainbow arch resting on two clouds. Hover and the bands lift one after another, the clouds puff up and sparkles appear under the arch.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const D = 2; // thickness
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const at = (q: P2[], y = 0): V3[] => q.map(([x, z]) => [x, y, z] as V3);
const arc = (r0: number, r1: number, n = 30): P2[] => [
  ...Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI; return [Math.cos(a) * r1, Math.sin(a) * r1] as P2; }),
  ...Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI - (i / n) * Math.PI; return [Math.cos(a) * r0, Math.sin(a) * r0] as P2; }),
];
const circle = (cx: number, cz: number, r: number, n = 28): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
const BANDS: [number, number][] = [[20.5, 0.3], [16.7, 0.13], [12.9, 0.3], [9.1, 0.13]];

/** a cloud: three lumps on a flat foot, with a dark rim so it stands off the arch */
function cloud(p: Pen, cx: number, k: number) {
  const lumps: [number, number, number][] = [[cx - 4.2, 1.6, 3.4 * k], [cx + 0.6, 3.6, 4.6 * k], [cx + 4.8, 1.4, 3.2 * k]];
  const foot: P2[] = [[cx - 7.4 * k, -1.8], [cx + 7.8 * k, -1.8], [cx + 7.8 * k, 1.4], [cx - 7.4 * k, 1.4]];
  const all = (y: number, f: number, grow: number) => {
    for (const [x, z, r] of lumps) p.face(at(circle(x, z, r + grow), y), f, 0);
    p.face(at(foot.map(([x, z]) => [x + Math.sign(x - cx) * grow, z - grow] as P2), y), f, 0);
  };
  for (let y = -D; y < 0; y += 0.45) all(y + 1.5, 0.1, 0);
  all(1.5, 0.02, 0.9);
  all(1.5, 0.3, 0);
}

export const rainbow: Illustration = {
  k: "rainbow", name: "Rainbow", title: "All clear for now", body: "There is nothing that needs you right now. New items will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.push(); p.translate(0, 0, -5); p.shadow(0, 0, 22, 8, 0.1); p.pop();
    p.rotate("z", -0.6); // turned to face us
    // the bands, outer first, each lifting a little in turn
    BANDS.forEach(([r, f], i) => {
      const k = clamp((h - i * 0.12) / 0.5);
      const lift = 2.2 * Math.sin(Math.PI * ease(k)) + 0.6 * ease(k);
      const q = arc(r - 3, r).map(([x, z]) => [x, z + lift] as P2);
      for (let y = -D; y < 0; y += 0.45) p.face(at(q, y), 0.06, 0);
      p.face(at(arc(r - 3.6, r + 0.5).map(([x, z]) => [x, z + lift] as P2), 0.02), 0.02, 0); // a dark gap around each band
      p.face(at(q, 0.04), f, 0);
    });
    // a cloud at each foot
    const puff = 1 + 0.12 * Math.sin(Math.PI * clamp(h * 1.4)) + h * Math.sin(t * 2.6) * 0.02;
    cloud(p, -14.5, puff);
    cloud(p, 14.5, puff);
    // sparkles under the arch
    const s = clamp((h - 0.5) / 0.5);
    if (s > 0) ([[-1.2, 2.6, 0], [2.4, 0.4, 2.1]] as [number, number, number][]).forEach(([x, z, k]) => {
      const r = s * (2.2 + 0.5 * Math.sin(t * 3.4 + k));
      const [sx, sy] = p.pt([x, 0.5, z]);
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, q = i % 2 ? r * 0.3 : r; g.lineTo(sx + Math.cos(a) * q, sy + Math.sin(a) * q); } g.closePath(); g.fill(); });
    });
  },
};
