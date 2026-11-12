// Under construction: a tower crane with a crate on its hook. The trolley runs out along the jib and back while the crate is lowered and lifted, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 4; // seconds per loop
const MZ = 36; // height of the mast, where the jib sits

// a free standing stroke, flat to the screen (pen lines only show as cuts in a face)
const wire = (p: Pen, pts: V3[], w = 1, v = 255) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((c) => {
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.stroke();
  });
};
export const construction: Illustration = {
  k: "construction", name: "Crane", title: "Under construction", body: "We are still building this. Check back soon.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = Math.PI * 2 * ((t / P) % 1);
    p.translate(0, 0, -22);
    p.shadow(-8, 0, 15, 8, 0.12);
    p.rotate("z", -0.36);
    p.translate(-3, 0, 0);
    const tx = 15 + 5.5 * Math.sin(w), lz = 9 + 6.5 * Math.cos(w); // the trolley along the jib, the crate's height
    p.shadow(tx, 0, 9, 5, 0.1);
    // the foot and the mast, braced
    p.box(-14, -5, 0, 10, 10, 2, { top: 0.22, lw: 0.6 });
    p.box(-11, -2, 2, 4, 4, MZ - 2, { top: 0.2, left: 0.1, right: 0.05, lw: 0.6 });
    for (let z = 2; z < MZ - 3; z += 4) {
      const up = (z / 4) % 1 < 0.5;
      p.line([[up ? -11 : -7, 2.03, z], [up ? -7 : -11, 2.03, z + 4]], SH.edge, 0.6);
      p.line([[-6.97, up ? 2 : -2, z], [-6.97, up ? -2 : 2, z + 4]], 0.7, 0.5);
    }
    // the stays from the tower head to both ends of the jib
    const head: V3 = [-9, 0, MZ + 10];
    wire(p, [[-20, 0, MZ + 2.4], head, [22, 0, MZ + 2.4]], 0.9, 200);
    // the cable, the hook block and the crate
    wire(p, [[tx, 0, MZ], [tx, 0, lz + 9.6]], 1.1);
    wire(p, [[tx - 3.2, 0, lz + 6.5], [tx, 0, lz + 9.6], [tx + 3.2, 0, lz + 6.5]], 1);
    p.box(tx - 3.6, -3.6, lz, 7.2, 7.2, 6.5, { top: 0.28, left: 0.16, right: 0.08, lw: 0.7 });
    p.line([[tx - 3.6, 3.63, lz + 3.2], [tx + 3.6, 3.63, lz + 3.2]], SH.edge, 0.5);
    // the counterweight, the jib and the tower head
    p.box(-21, -2.2, MZ - 3.4, 6, 4.4, 3.4, { top: 0.24, left: 0.2, right: 0.1, lw: 0.7 });
    p.box(-21, -1.5, MZ, 44, 3, 2.4, { top: 0.26, left: 0.13, right: 0.065, lw: 0.7 });
    for (let x = -4; x < 22; x += 4) p.line([[x, 1.53, MZ], [x + 2, 1.53, MZ + 2.4], [x + 4, 1.53, MZ]], SH.edge, 0.45);
    p.box(tx - 2, -2, MZ - 1.2, 4, 4, 1.2, { top: 0.3, left: 0.3, right: 0.14, lw: 0.6 });
    p.box(-10.5, -1.5, MZ + 2.4, 3, 3, 7.6, { top: 0.24, left: 0.12, right: 0.06, lw: 0.6 });
    // the cab beside the mast, its window dark
    p.box(-7, -2, MZ - 5.4, 4.6, 4.6, 5.4, { top: 0.26, left: 0.14, right: 0.07, lw: 0.6 });
    p.clear([[-6.2, 2.63, MZ - 3.6], [-3.2, 2.63, MZ - 3.6], [-3.2, 2.63, MZ - 1], [-6.2, 2.63, MZ - 1]]);
  },
};
