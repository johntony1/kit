// Nothing dug up yet: a big spiral ammonite set into a stone slab, its ribs and whorls cut in. Hover and the shell lifts out of its hollow and a glint flashes on it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const T = 3, R = 15.5, CZ = 18, K = -Math.log(0.6) / (Math.PI * 2); // slab half depth, shell radius, its centre height, spiral rate
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const SLAB: [number, number][] = [[-20, 0], [20, 0], [21.5, 11], [20, 30], [14, 36], [-11, 37], [-19, 32], [-21.5, 13]];

/** the shell's outline: one turn of the spiral, closed by the step at its mouth */
const rOf = (a: number) => R * Math.exp(-K * a);
const at = (a: number, r: number, y: number, dz: number): V3 => [Math.cos(a + 0.4) * r, y, CZ + dz + Math.sin(a + 0.4) * r];

function slab(p: Pen) {
  // the sides that look up or right, then the face
  for (let i = 0; i < SLAB.length; i++) {
    const [ax, az] = SLAB[i], [bx, bz] = SLAB[(i + 1) % SLAB.length], nx = bz - az, nz = ax - bx;
    if (nz <= 0 && nx <= 0) continue;
    p.face([[ax, -T, az], [bx, -T, bz], [bx, T, bz], [ax, T, az]], nz > Math.abs(nx) ? 0.22 : 0.065, 0);
  }
  p.face(SLAB.map(([x, z]) => [x, T, z] as V3), 0.065, 0);
}

export const fossil: Illustration = {
  k: "fossil", name: "Fossil", title: "Nothing dug up yet", body: "Start digging through your finds and they will be laid out here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 32, 12, 0.12);
    p.rotate("z", -Math.PI / 4 + 0.35); // the slab faces us, turned a little
    slab(p);
    const outline = (y: number, dz: number, grow = 0) => Array.from({ length: 61 }, (_, i) => { const a = (i / 60) * Math.PI * 2; return at(a, rOf(a) + grow, y, dz); });
    // the dark hollow the shell sits in
    p.clear(outline(T + 0.03, 0, 0.6));
    // the shell lifts out of it and forward
    const k = back(Math.min(1, h * 1.25)), dz = 9 * k, y0 = T + 0.06 + 1.5 * k;
    p.face(outline(y0, dz), 0.12, 0); // its back edge, in shade
    p.face(outline(y0 + 1.6, dz), 0.28, 0);
    const y = y0 + 1.65;
    // the spiral between the whorls, closing in on a dark centre
    p.line(Array.from({ length: 90 }, (_, i) => { const a = Math.PI * 2 + (i / 89) * Math.PI * 4.4; return at(a, rOf(a), y, dz); }), SH.edge, 1.4);
    p.line([at(0, R, y, dz), at(0, rOf(Math.PI * 2), y, dz)], SH.edge, 1);
    p.dot(at(0, 0, y, dz), 1.2, 0);
    // ribs across the outer whorl
    for (let a = 0.5; a < Math.PI * 2 - 0.2; a += 0.62) p.line([at(a, rOf(a) * 0.97, y, dz), at(a, rOf(a + Math.PI * 2) * 1.03, y, dz)], SH.edge, 0.85);
    // a glint once it is out
    const g = Math.max(0, (h - 0.7) / 0.3);
    if (g > 0) {
      const [x, yy] = p.pt(at(2.1, R * 0.62, y + 0.1, dz));
      const r = 3.6 * Math.sin(g * Math.PI * 0.5) * (1 + 0.12 * Math.sin(t * 4));
      p.screen((c) => {
        c.fillStyle = "#000"; c.beginPath(); c.arc(x, yy, r * 0.75, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#fff"; c.beginPath();
        c.moveTo(x, yy - r); c.quadraticCurveTo(x, yy, x + r, yy); c.quadraticCurveTo(x, yy, x, yy + r); c.quadraticCurveTo(x, yy, x - r, yy); c.quadraticCurveTo(x, yy, x, yy - r); c.fill();
      });
    }
  },
};
