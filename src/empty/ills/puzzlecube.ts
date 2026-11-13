// Nothing solved yet: a three by three puzzle cube. Its top layer turns a quarter, rests, and turns again, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 3, S = 12, L = 8; // seconds per loop, half size, layer height

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** screen winding: > 0 when an outward face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** a layer of the cube from z0 to z1, turned by a, with the stickers' gaps cut on every face we see */
function layer(p: Pen, z0: number, z1: number, a: number, top: boolean) {
  p.push();
  p.rotate("z", a);
  const c = [[-S, -S], [S, -S], [S, S], [-S, S]];
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = c[i], [bx, by] = c[(i + 1) % 4];
    const f: V3[] = [[ax, ay, z0], [ax, ay, z1], [bx, by, z1], [bx, by, z0]];
    if (facing(p, f) >= 0) continue;
    // its outward direction in the world, for the shade: the left wall dense, the right wall sparse
    const nx = (ax + bx) / (2 * S), ny = (ay + by) / (2 * S);
    const wx = nx * Math.cos(a) - ny * Math.sin(a), wy = nx * Math.sin(a) + ny * Math.cos(a);
    p.face(f, 0.1075 + 0.0225 * (wy - wx), 0);
    for (const k of [1 / 3, 2 / 3]) p.line([mix(f[0], f[3], k), mix(f[1], f[2], k)], SH.edge, 0.8);
    if (!top) p.line([mix(f[0], f[1], 0.5), mix(f[3], f[2], 0.5)], SH.edge, 0.8);
  }
  if (top) {
    const T: V3[] = c.map(([x, y]) => [x, y, z1] as V3);
    p.face(T, 0.22, 0);
    for (const k of [1 / 3, 2 / 3]) { p.line([mix(T[0], T[1], k), mix(T[3], T[2], k)], SH.edge, 0.8); p.line([mix(T[0], T[3], k), mix(T[1], T[2], k)], SH.edge, 0.8); }
  }
  p.pop();
}

export const puzzlecube: Illustration = {
  k: "puzzlecube", name: "Puzzle cube", title: "Nothing solved yet", body: "Pick a puzzle to start. The ones you solve will be listed here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    const turn = u < 0.15 ? 0 : u < 0.85 ? ease((u - 0.15) / 0.7) : 1;
    p.translate(0, 0, -12);
    p.scale(0.9);
    p.shadow(0, 0, 30, 14, 0.12);
    // the bottom two layers as one block, the gap between them cut
    p.box(-S, -S, 0, S * 2, S * 2, L * 2, { top: 0.2, edge: 0 });
    layer(p, 0, L * 2, 0, false);
    // a dark gap under the turning layer
    if (turn > 0 && turn < 1) p.face([[-S, -S, L * 2 + 0.02], [S, -S, L * 2 + 0.02], [S, S, L * 2 + 0.02], [-S, S, L * 2 + 0.02]], 0.16, 0);
    layer(p, L * 2 + 0.4, L * 3 + 0.4, (turn * Math.PI) / 2, true);
  },
};
