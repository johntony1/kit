// Nothing to see outside: a four pane window in a thick frame with a deep sill. A cloud drifts slowly past behind the glass, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4; // seconds per loop
const W = 13, Z0 = 4, Z1 = 30, F = 2.6; // half width, bottom, top, frame width
const Y = 1.5; // the front of the frame

export const windowpane: Illustration = {
  k: "windowpane", name: "Window", title: "Nothing to see outside", body: "When something happens out there, you will see it from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -16);
    p.shadow(0, 3, 28, 10, 0.1);
    p.rotate("z", -0.58);
    // the frame: a deep box, lit top, sparse end
    p.box(-W, -1.5, Z0, W * 2, Y + 1.5, Z1 - Z0, { top: 0.26, left: 0.2, right: 0.065, edge: 0 });
    const o = (x: number, z: number, d = 0.03): V3 => [x, Y + d, z];
    const x0 = -W + F, x1 = W - F, z0 = Z0 + F, z1 = Z1 - F, zm = (z0 + z1) / 2;
    // the sky, dark, seen through the glass
    const glass: V3[] = [o(x0, z0), o(x1, z0), o(x1, z1), o(x0, z1)];
    p.face(glass, 0.04, 0);
    // the cloud: three puffs and a flat base, drifting left to right and wrapping round, clipped to the glass
    const cx = x0 - 9 + (x1 - x0 + 18) * u, cz = zm + 3.5;
    const pts = glass.map((v) => p.pt(v));
    p.screen((g) => {
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
      for (const dx of [0, -(x1 - x0 + 18)]) {
        const c = cx + dx;
        p.ringV("y", [c - 3.6, Y + 0.05, cz], 3, 0.3, 0);
        p.ringV("y", [c + 3.8, Y + 0.05, cz - 0.3], 2.8, 0.3, 0);
        p.ringV("y", [c, Y + 0.05, cz + 2.2], 4, 0.3, 0);
        p.face([o(c - 6.4, cz - 3, 0.05), o(c + 6.4, cz - 3, 0.05), o(c + 6.4, cz, 0.05), o(c - 6.4, cz, 0.05)], 0.3, 0);
      }
      // a glint across the lower right pane
      p.line([o(4, z0 + 2, 0.06), o(x1 - 2, zm - 3, 0.06)], 0.6, 0.9);
    });
    // the glazing bars: a bright cross, cut along its edges
    p.face([o(-1, z0, 0.08), o(1, z0, 0.08), o(1, z1, 0.08), o(-1, z1, 0.08)], 0.26, 0);
    p.face([o(x0, zm - 1, 0.1), o(x1, zm - 1, 0.1), o(x1, zm + 1, 0.1), o(x0, zm + 1, 0.1)], 0.26, 0);
    p.line([...glass, glass[0]], SH.edge, 0.7);
    // the sill: a lit slab reaching out under the window
    p.box(-W - 1.8, -1.5, Z0 - 2.4, W * 2 + 3.6, Y + 6, 2.4, { top: 0.3, left: 0.14, right: 0.07, edge: 0 });
  },
};
