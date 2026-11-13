// No downtime recorded: a status bar of seven tall pills standing on a base, all lit but one short dim one. A wave of light runs along them from left to right, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const N = 7, PW = 4.6, GAP = 2.6, PH = 29, D = 3.6; // pills, pill width, gap, pill height, pill depth
const LOW = 4; // the one short, dim pill: a brief outage

// a pill's outline in its own plane: flat foot, round top
const pill = (x0: number, z0: number, ht: number): [number, number][] => {
  const r = PW / 2, cx = x0 + r, out: [number, number][] = [[x0, z0], [x0 + PW, z0]];
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; out.push([cx + Math.cos(a) * r, z0 + ht - r + Math.sin(a) * r]); }
  return out;
};

export const uptime: Illustration = {
  k: "uptime", name: "Uptime", title: "No downtime recorded", body: "Your service has stayed up. Any outage will be logged here with its length.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 32, 11, 0.11);
    p.rotate("z", -0.785);
    const L = (N * PW + (N - 1) * GAP) / 2;
    // the base: a long lit slab
    p.box(-L - 2.5, -D / 2 - 3, 0, 2 * L + 5, D + 6, 2.4, { top: 0.2, left: 0.09, right: 0.065, edge: 0 });
    for (let i = 0; i < N; i++) {
      const x0 = -L + i * (PW + GAP);
      const low = i === LOW;
      const d = Math.abs(((u * 1.3 - 0.15 - i / (N - 1)) + 1) % 1);
      const w = Math.max(0, 1 - Math.min(d, 1 - d) / 0.14);
      const k = low ? 0 : w * w * (3 - 2 * w);
      const ht = (low ? 11 : PH) + 1.6 * k;
      const q = pill(x0, 2.4, ht);
      const at = (y: number): V3[] => q.map(([x, z]) => [x, y, z] as V3);
      // depth: a dense rim over the top, then the lit front
      for (let y = -D / 2; y < D / 2; y += 0.5) p.face(at(y), low ? 0.05 : 0.12, 0);
      p.face(at(D / 2), low ? 0.1 : 0.24 + 0.2 * k, 0);
    }
  },
};
