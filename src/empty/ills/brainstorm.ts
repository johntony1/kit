// No ideas yet: a chunky storm cloud with a lightning bolt hanging under it. Every so often the bolt flashes bright twice and sparks fly off its tip, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
type Q = [number, number][];
const circ = (ca: number, cv: number, r: number, n = 32): Q => Array.from({ length: n }, (_, i) => { const s = (i / n) * Math.PI * 2; return [ca + Math.cos(s) * r, cv + Math.sin(s) * r]; });
const rrect = (a0: number, v0: number, a1: number, v1: number, r: number): Q => {
  const out: Q = [];
  const cs: [number, number, number][] = [[a1 - r, v1 - r, 0], [a0 + r, v1 - r, 1], [a0 + r, v0 + r, 2], [a1 - r, v0 + r, 3]];
  for (const [x, y, q] of cs) for (let i = 0; i <= 6; i++) { const s = ((q + i / 6) * Math.PI) / 2; out.push([x + Math.cos(s) * r, y + Math.sin(s) * r]); }
  return out;
};
const CLOUD: Q[] = [rrect(-16, 12, 16, 22, 5), circ(-8, 20, 6.5), circ(1, 24, 8.5), circ(9.5, 20, 6.5)];
const BOLT: Q = [[-1, 14], [-7, 1], [-1.6, 1], [-4.6, -10], [6, 4.4], [0.6, 4.4], [4.6, 14]];

export const brainstorm: Illustration = {
  k: "brainstorm", name: "Brainstorm", title: "No ideas yet", body: "Jot down your first idea and the rest will follow here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const flash = (u > 0.18 && u < 0.3) || (u > 0.38 && u < 0.47) ? 1 : 0;
    const bob = Math.sin(u * Math.PI * 2) * 0.8;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 24, 10, 0.12);
    p.rotate("z", -0.62);
    const put = (q: Q, y: number, dv = 0): V3[] => q.map(([a, v]) => [a, y, v + 2 + dv] as V3);
    // the bolt, behind the cloud's front: a dark rim, then dim, or bright in a flash
    for (let y = -2.5; y < 0; y += 0.5) p.face(put(BOLT, y), 0.065, 0);
    const big = BOLT.map(([a, v]) => [a + (a - 0.5) * 0.12, v + (v - 3) * 0.06] as [number, number]);
    p.face(put(big, 0.05), 0.03, 0);
    p.face(put(BOLT, 0.1), flash ? 0.45 : 0.1, 0);
    // the cloud: depth, then the lit face
    for (let y = -4; y < 0; y += 0.5) CLOUD.forEach((q) => p.face(put(q, y, bob), 0.065, 0));
    CLOUD.forEach((q) => p.face(put(q, 0, bob), 0.22, 0));
    p.line(put([[-12, 12.2], [12, 12.2]], 0.1, bob), 1, 0.7);
    // sparks off the tip in a flash
    if (flash) {
      const k = u < 0.3 ? (u - 0.18) / 0.12 : (u - 0.38) / 0.09;
      [[-1, 1], [1, 0.4], [0, -1]].forEach(([da, dv], i) => p.dot(put([[-4.6 + da * (2 + 4 * k), -10 + dv * (2 + 4 * k) + i * 0.3]], 0.3)[0], 1.2 - 0.5 * k, 1));
    }
  },
};
