// Nothing to compare: a balance scale tipped by a weight. A coin drops onto the other pan, the beam swings and settles level, then the coin lifts away.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const PZ = 26, L = 13.5, A = 0.24; // pivot height, half beam length, resting tilt
const DROP = 9.5; // how far the pans hang under the beam's ends
const PR = 5.2; // pan radius

/** a pan hanging under (x, z): three thin hangers, then a shallow open bowl */
function pan(p: Pen, x: number, z: number) {
  const zb = z - DROP;
  for (const a of [Math.PI * 0.75, Math.PI * 0.05, Math.PI * 1.45]) {
    const bx = x + Math.cos(a) * (PR - 0.6), by = Math.sin(a) * (PR - 0.6);
    p.face([[x - 0.25, 0, z], [x + 0.25, 0, z], [bx + 0.25, by, zb + 1.2], [bx - 0.25, by, zb + 1.2]], 0.2, 0);
  }
  p.cylinder(x, 0, zb, PR, 1.2, { side: 0.2, top: 0.03 });
  p.cylinder(x, 0, zb - 0.6, PR - 1.6, 0.6, { side: 0.12, top: 0.12 });
  p.dot([x, 0, z], 0.9, 0.9);
}

export const scale: Illustration = {
  k: "scale", name: "Balance scale", title: "Nothing to compare yet", body: "Pick two plans or periods and we will weigh them up side by side here.",
  kind: "loop", period: 4.6, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 4.6) / 4.6;
    // the beam's tilt: resting tipped left, swinging to level after the drop, easing back once the coin lifts
    let b: number, cz: number;
    const top = 16;
    if (u < 0.14) { b = -A; cz = top * (1 - (u / 0.14) ** 2); }
    else if (u < 0.68) { const s = (u - 0.14) / 0.54; b = -A * Math.exp(-4.2 * s) * Math.cos(s * Math.PI * 3.2); cz = 0; }
    else if (u < 0.8) { b = 0; cz = 0; }
    else { const s = easeInOut((u - 0.8) / 0.2); b = -A * s; cz = top * s; }
    p.translate(0, 0, -15);
    p.shadow(0, 0, 32, 14, 0.12);
    // the base and the post
    p.box(-6, -5, 0, 12, 10, 2.2, { top: 0.22, left: 0.13, right: 0.065 });
    p.box(-3.5, -3, 2.2, 7, 6, 1.4, { top: 0.24, left: 0.14, right: 0.07 });
    p.cylinder(0, 0, 3.6, 1.5, PZ - 4.6, { side: 0.14, top: 0.22 });
    // the ends of the beam, where the pans hang
    const lx = -L * Math.cos(b), lz = PZ + L * Math.sin(b);
    const rx = L * Math.cos(b), rz = PZ - L * Math.sin(b);
    // the left pan (back) and its weight first, then the beam, then the right pan
    pan(p, lx, lz);
    p.box(lx - 2, -2, lz - DROP + 0.6, 4, 4, 3.6, { top: 0.22, left: 0.13, right: 0.065 });
    p.box(lx - 0.8, -0.8, lz - DROP + 4.2, 1.6, 1.6, 1, { top: 0.24 });
    p.push(); p.rotate("y", b, [0, 0, PZ]);
    p.box(-L - 1, -1, PZ - 0.9, 2 * L + 2, 2, 1.8, { top: 0.24, left: 0.14, right: 0.07 });
    p.pop();
    // the needle over the pivot, and the pivot cap
    p.push(); p.rotate("y", b, [0, 0, PZ]);
    p.face([[-0.5, 1.05, PZ + 0.9], [0.5, 1.05, PZ + 0.9], [0, 1.05, PZ + 5.5]], 0.34, SH.edge, 0.45);
    p.pop();
    p.ringV("y", [0, 1.1, PZ], 1.6, 0.3, SH.edge, 0.5);
    // the level mark the needle points at
    p.guide([[0, 0.9, PZ + 6.2], [0, 0.9, PZ + 8.6]], true);
    pan(p, rx, rz);
    // the coin on the right pan: falls in, sits, then lifts away
    const zc = rz - DROP + 1.2 + cz;
    if (cz > 0.3) p.guide([[rx, 0, rz - DROP + 1.3], [rx, 0, zc]]);
    p.cylinder(rx, 0, zc, 2.6, 1, { side: 0.14, top: 0.34 });
    p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [rx + Math.cos(a) * 1.5, Math.sin(a) * 1.5, zc + 1.03] as V3; }), SH.edge, 0.5);
  },
};
