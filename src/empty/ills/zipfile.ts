// Nothing compressed: a folder standing up with a checked zipper strip down its middle and a pull tab on it. Hover and the slider runs on down, more teeth zipping shut above it, and its pull tab swings to a stop.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const X = 16, ZT = 27; // half width and height of the folder
// the folder outline: a tab on the top left
const FOLDER: P2[] = [[-X, 0], [X, 0], [X, ZT], [-3, ZT], [-5, ZT + 3.4], [-X, ZT + 3.4]];

/** screen winding of a polygon */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** the folder profile at y = 0 pushed back by d: its visible top and right walls, then its face */
function slab(p: Pen, d: number, front: number) {
  const n = FOLDER.length;
  for (let i = 0; i < n; i++) {
    const [u0, v0] = FOLDER[i], [u1, v1] = FOLDER[(i + 1) % n], L = Math.hypot(u1 - u0, v1 - v0);
    const nu = (v1 - v0) / L, nv = -(u1 - u0) / L;
    const q: V3[] = [[u0, 0, v0], [u1, 0, v1], [u1, -d, v1], [u0, -d, v0]];
    if (facing(p, q) !== 0 && (nv > 0.3 || nu > 0.3)) p.face(q, nv > 0.3 ? 0.22 : 0.065, 0);
  }
  p.face(FOLDER.map(([u, v]) => [u, 0, v] as V3), front, SH.edge, 0.6);
}

export const zipfile: Illustration = {
  k: "zipfile", name: "Zip file", title: "Nothing compressed", body: "Pick files and compress them into one archive. It will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 10, 0.11);
    p.rotate("z", -0.5);
    slab(p, 3, 0.2);
    const y = 0.06, S = 3.2;
    // the zipper: a checked strip of teeth from the top down, two squares wide, growing as it zips
    const k = easeInOut(Math.min(1, h * 1.15));
    const zs = ZT - 1 - S * (3.5 + 1.5 * k); // where the strip ends and the slider sits
    for (let r = 0; ZT - 1 - (r + 1) * S >= zs - 0.01; r++) for (let c = 0; c < 2; c++) {
      if ((r + c) % 2) continue;
      const x = (c - 1) * S, z = ZT - 1 - (r + 1) * S;
      p.clear([[x, y, z], [x + S, y, z], [x + S, y, z + S], [x, y, z + S]]);
    }
    // the slider at the end of the strip, its pull tab hanging and swinging as it stops
    const sw = h > 0.85 ? Math.sin(t * 4) * 0.07 : 0;
    p.box(-3.8, -0.4, zs - 2.6, 7.6, 1.6, 2.8, { top: 0.4, left: 0.34, right: 0.12, edge: 0 });
    p.line([[-3.8, 1.23, zs - 2.6], [3.8, 1.23, zs - 2.6], [3.83, -0.4, zs - 2.6]], SH.edge, 0.9);
    p.push();
    p.rotate("y", sw, [0, 1.3, zs - 2.6]);
    const tab: V3[] = [[-2.2, 1.3, zs - 2.6], [2.2, 1.3, zs - 2.6], [3.2, 1.3, zs - 8.4], [2.2, 1.3, zs - 9.6], [-2.2, 1.3, zs - 9.6], [-3.2, 1.3, zs - 8.4]];
    p.face(tab, 0.3, 0);
    p.line([...tab, tab[0]], SH.edge, 0.9);
    p.clear([[-1.4, 1.35, zs - 6], [1.4, 1.35, zs - 6], [1.4, 1.35, zs - 8], [-1.4, 1.35, zs - 8]]);
    p.pop();
  },
};
