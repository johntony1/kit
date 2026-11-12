// Film projector: a projector on a stand, two reels turning on top and a beam of light flickering out of its lens.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per loop
const Y1 = 4.5; // the side that faces us
const ROT = -0.42;
const circle = (x: number, y: number, z: number, r: number): V3[] => Array.from({ length: 28 }, (_, i) => [x + Math.cos((i / 28) * Math.PI * 2) * r, y, z + Math.sin((i / 28) * Math.PI * 2) * r] as V3);

/** a surface turned round an axis along x: lit above, dense toward us, sparse underneath */
function lathe(p: Pen, cz: number, prof: [number, number][], N = 24) {
  const c = Math.cos(ROT), sn = Math.sin(ROT);
  for (let k = 0; k < prof.length - 1; k++) {
    const [x0, r0] = prof[k], [x1, r1] = prof[k + 1], s = (r1 - r0) / Math.max(0.01, x1 - x0), l = Math.hypot(1, s);
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
      const nx = -s / l, ny = Math.cos(am) / l, nz = Math.sin(am) / l;
      const wx = nx * c - ny * sn, wy = nx * sn + ny * c; // the normal, turned with the pen
      if (wx + wy + nz <= 0) continue;
      const fill = nz > 0.45 ? 0.24 : wy > wx ? SH.left : SH.right;
      p.face([[x0, Math.cos(a0) * r0, cz + Math.sin(a0) * r0], [x0, Math.cos(a1) * r0, cz + Math.sin(a1) * r0], [x1, Math.cos(a1) * r1, cz + Math.sin(a1) * r1], [x1, Math.cos(a0) * r1, cz + Math.sin(a0) * r1]], fill, 0);
    }
  }
}
// a reel standing on its edge: a rim behind for thickness, a lit face, three holes that turn
function reel(p: Pen, x: number, z: number, r: number, spin: number) {
  p.clear(circle(x, Y1 - 0.05, z, r + 1.1));
  p.face(circle(x, Y1, z, r), 0.22, SH.edge, 0.6);
  for (let i = 0; i < 3; i++) { const a = spin + (i / 3) * Math.PI * 2; p.clear(circle(x + Math.cos(a) * r * 0.52, Y1 + 0.03, z + Math.sin(a) * r * 0.52, r * 0.27)); }
  p.dot([x, Y1 + 0.05, z], 0.9, 0);
}

export const projector: Illustration = {
  k: "projector", name: "Film projector", title: "No screenings yet", body: "Schedule a screening and it will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, spin = -u * Math.PI * 2 * (2 / 3);
    p.translate(-6, 0, -17);
    p.shadow(4, 0, 34, 14, 0.1);
    p.rotate("z", ROT);
    // the stand
    p.box(-11, -4, 0, 14, 8, 1.4, { top: 0.2, left: 0.14, right: 0.08 });
    p.box(-6, -1.5, 1.4, 4, 3, 5.6, { top: 0.2, left: 0.14, right: 0.065 });
    // the body, a dark gate on its side, then the lens
    p.box(-13, -Y1, 7, 18, Y1 * 2, 10, { top: 0.2, left: 0.12, right: 0.065 });
    p.clear([[-10.5, Y1 + 0.02, 9.5], [-5, Y1 + 0.02, 9.5], [-5, Y1 + 0.02, 13], [-10.5, Y1 + 0.02, 13]]);
    p.dot([1, Y1 + 0.03, 11], 1.3, 0);
    lathe(p, 12, [[5, 3.6], [10, 3.6]]);
    p.ringV("x", [10, 0, 12], 3.6, 0.34, SH.edge, 0.5);
    p.ringV("x", [10.05, 0, 12], 2.2, 0.03, 0);
    // the beam: a wedge of light that flickers
    const fl = 0.8 + 0.12 * Math.sin(u * Math.PI * 2 * 6) + 0.08 * Math.sin(u * Math.PI * 2 * 11);
    const q = ([[10.4, 0, 13.4], [29, 0, 23], [29, 0, 2], [10.4, 0, 10.6]] as V3[]).map((v) => p.pt(v));
    p.screen((g) => {
      const n = Math.round(150 * fl);
      g.fillStyle = `rgb(${n},${n},${n})`;
      g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
    });
    // the arms and the two reels on top
    p.box(-10.2, Y1 - 1.2, 17, 1.6, 1.2, 9, { top: 0.3, left: 0.3, right: 0.12, edge: 0 });
    p.box(3.4, Y1 - 1.2, 17, 1.6, 1.2, 9, { top: 0.3, left: 0.3, right: 0.12, edge: 0 });
    reel(p, -9.4, 27, 7, spin);
    reel(p, 5.6, 27, 7, spin + 0.5);
  },
};
