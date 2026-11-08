// No files uploaded: a thick cloud over an empty tray. An arrow keeps rising out of the cloud and fading.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const BUMPS: [number, number, number][] = [[-8.5, 16.5, 5], [-2.5, 20.5, 7], [6, 19, 6], [10, 15.5, 4.2]]; // x, z, r
const BASE = { x0: -8.5, x1: 10, z0: 11.5, z1: 16 }; // the flat bottom

export const upload: Illustration = {
  k: "upload", name: "Upload cloud", title: "No files uploaded", body: "Drop files here or choose them from your computer to upload.",
  kind: "loop", period: 2.4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 2.4) / 2.4;
    p.translate(-1, 0, -17);
    p.shadow(0, 0, 22, 9, 0.1);
    // the tray: an open, empty box on the floor
    p.box(-11, -8, 0, 22, 16, 4, { open: true });

    const Y0 = -2.5, Y1 = 2.5, CZ = 0;
    p.push(); p.rotate("z", -0.62, [1, 0, 0]); // the cloud's depth and how high it floats
    const shape = (y: number, fill: number, edge: number, lw = 0.55) => {
      for (const [x, z, r] of BUMPS) p.ringV("y", [x, y, z + CZ], r, fill, edge, lw);
      p.face([[BASE.x0, y, BASE.z0 + CZ], [BASE.x1, y, BASE.z0 + CZ], [BASE.x1, y, BASE.z1 + CZ], [BASE.x0, y, BASE.z1 + CZ]], fill, edge, lw);
      // round off the bottom corners
      p.ringV("y", [BASE.x0, y, BASE.z0 + 4.5 / 2 + CZ], 2.25, fill, edge, lw);
    };
    // back of the slab: outline only where it sticks out, then the thickness
    shape(Y0, 0, SH.edge, 1.1);
    shape(Y0, SH.right, 0);
    // the arrow rises from inside the cloud and fades out above it
    const k = 1 - (1 - u) * (1 - u); // quick out of the cloud, slowing as it fades
    const az = 14 + k * 18;
    const fade = u < 0.45 ? 1 : Math.max(0, 1 - easeInOut(Math.min(1, (u - 0.45) / 0.45)));
    const ay = (Y0 + Y1) / 2;
    const arrow: V3[] = [[-1.7, ay, az], [1.7, ay, az], [1.7, ay, az + 5.5], [4.6, ay, az + 5.5], [0, ay, az + 10], [-4.6, ay, az + 5.5], [-1.7, ay, az + 5.5]];
    // the slab's thickness, back to front, with the arrow slotted in at mid depth
    let drawn = false;
    for (let y = Y0 + 0.5; y < Y1; y += 0.5) {
      if (!drawn && y > ay) { drawn = true; if (fade > 0.02) p.face(arrow, 0.95 * fade, fade, 0.5); }
      shape(y, 0.08, 0);
    }
    // the front face, with just the outer outline
    shape(Y1, 0, SH.edge, 1.1);
    shape(Y1, SH.left, 0);
    p.pop();
  },
};
