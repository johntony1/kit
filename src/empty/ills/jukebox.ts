// Pick a song: a round topped jukebox, a record turning in its window. The lights round its arch chase each other, over and over.
import { type Illustration, type Pen, type V3 } from "../dots";

const PER = 2.4, W = 11, D = 6, ZA = 21; // seconds per loop, half width, half depth, where the arch starts
const NL = 14; // lights round the arch

/** screen winding: < 0 when a face listed anticlockwise from outside looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** the cabinet's outline in x z: up the right side, round the arch, down the left */
const outline = (r: number, z0 = 0): [number, number][] => {
  const pts: [number, number][] = [[r, z0]];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; pts.push([Math.cos(a) * r, ZA + Math.sin(a) * r]); }
  pts.push([-r, z0]);
  return pts;
};

export const jukebox: Illustration = {
  k: "jukebox", name: "Jukebox", title: "Pick a song", body: "Choose a song to start playing. Your queue will show up here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 11, 0.12);
    p.rotate("z", -0.55); // its face towards us
    // the cabinet: strips round the curved top and the sides, then the face
    const o = outline(W);
    for (let i = 0; i < o.length - 1; i++) {
      const [ax, az] = o[i], [bx, bz] = o[i + 1];
      const q: V3[] = [[ax, -D, az], [bx, -D, bz], [bx, D, bz], [ax, D, az]];
      if (facing(p, q) > 0) continue;
      const nz = (az + bz) / 2 - ZA, nx = (ax + bx) / 2;
      p.face(q, nz > 4 ? 0.22 : nx > 0 ? 0.065 : 0.12, 0);
    }
    const y = D + 0.03, F = (pts: [number, number][], fill: number, dy = 0) => p.face(pts.map(([x, z]) => [x, y + dy, z] as V3), fill, 0);
    F(o, 0.12);
    // the lit band round the arch, its lights chasing
    F([...outline(W - 1.2, 9), ...outline(W - 3.6, 9).reverse()], 0.24, 0.01);
    for (let i = 0; i < NL; i++) {
      const s = i / (NL - 1), a = s * Math.PI, on = (s * 2 + u * 2) % 1 < 0.5;
      const r = W - 2.4;
      const z = a <= Math.PI ? ZA + Math.sin(a) * r : 0;
      p.dot([Math.cos(a) * r, y + 0.03, z], 0.75, on ? 1 : 0);
    }
    // the window: dark, a record turning in it
    F(outline(W - 3.6, 13), 0.02, 0.02);
    const rz = ZA - 1;
    p.ringV("y", [0, y + 0.04, rz], 6, 0.2, 0);
    p.ringV("y", [0, y + 0.05, rz], 2, 0.4, 0);
    const a = -u * Math.PI * 2;
    p.line([[Math.cos(a) * 3, y + 0.06, rz + Math.sin(a) * 3], [Math.cos(a) * 5.2, y + 0.06, rz + Math.sin(a) * 5.2]], 1, 1);
    // the speaker grille and a row of buttons below
    F([[-W + 2, 2], [W - 2, 2], [W - 2, 9.4], [-W + 2, 9.4]], 0.24, 0.02);
    for (let i = 1; i < 5; i++) p.line([[-W + 3, y + 0.04, 2 + i * 1.5], [W - 3, y + 0.04, 2 + i * 1.5]], 1, 0.7);
    for (let i = 0; i < 5; i++) p.dot([-6 + i * 3, y + 0.04, 11.2], 0.75, 0.9);
  },
};
