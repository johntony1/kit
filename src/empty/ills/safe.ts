// Nothing stored yet: a safe. Hover and the dial spins, then the heavy door swings open on an empty shelf.
import { SH, type Illustration, type V3 } from "../dots";

const X = 8, Y = 7, Z0 = 2, Z1 = 22; // half width, half depth (front at +Y), bottom and top of the body
const DX = 7, DT = 2.2, DZ0 = 3.4, DZ1 = 20.6; // door half width, thickness, bottom and top
const OX = 6.4, OZ0 = 4.2, OZ1 = 19.8, BACK = -5; // the opening and the inside's back wall

export const safe: Illustration = {
  k: "safe", name: "Safe", title: "Nothing stored yet", body: "Keep your important files and keys here. Everything you save is locked away safely.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(4, -4, -12);
    p.shadow(0, 0, 25, 12, 0.12);
    const spin = Math.min(1, h / 0.35);
    const open = Math.max(0, Math.min(1, (h - 0.3) / 0.7));
    const a = open * 1.32;
    // feet
    for (const [x, y] of [[-7, 4.5], [5, 4.5], [5, -6.5]]) p.box(x, y, 0, 2, 2, Z0, { top: 0.2 });
    // the inside, drawn first and then framed by the front so only the opening shows it
    if (open > 0) {
      p.face([[-OX, BACK, OZ0], [OX, BACK, OZ0], [OX, BACK, OZ1], [-OX, BACK, OZ1]], 0.03, SH.edge, 0.5);
      p.face([[-OX, BACK, OZ0], [-OX, Y, OZ0], [-OX, Y, OZ1], [-OX, BACK, OZ1]], SH.right, SH.edge, 0.5);
      p.face([[-OX, BACK, OZ0], [OX, BACK, OZ0], [OX, Y, OZ0], [-OX, Y, OZ0]], 0.13, SH.edge, 0.5);
      // an empty shelf
      p.box(-OX, BACK, 12, OX * 2, Y - BACK - 1, 0.8, { top: 0.22, left: 0.14, right: 0.08 });
    }
    // the body: top, right wall, and the front (whole when shut, a frame round the opening when open)
    const fy = Y;
    p.face([[-X, -Y, Z1], [X, -Y, Z1], [X, Y, Z1], [-X, Y, Z1]], 0.22, SH.edge, 0.55);
    p.face([[X, -Y, Z0], [X, Y, Z0], [X, Y, Z1], [X, -Y, Z1]], SH.right, SH.edge, 0.55);
    if (open > 0) {
      const f = (pts: [number, number][]) => p.face(pts.map(([x, z]) => [x, fy, z] as V3), 0.13, 0);
      f([[-X, Z0], [-OX, Z0], [-OX, Z1], [-X, Z1]]); f([[OX, Z0], [X, Z0], [X, Z1], [OX, Z1]]);
      f([[-X, Z0], [X, Z0], [X, OZ0], [-X, OZ0]]); f([[-X, OZ1], [X, OZ1], [X, Z1], [-X, Z1]]);
      p.line([[-X, fy, Z0], [X, fy, Z0], [X, fy, Z1], [-X, fy, Z1], [-X, fy, Z0]], SH.edge, 0.55);
      p.line([[-OX, fy, OZ0], [OX, fy, OZ0], [OX, fy, OZ1], [-OX, fy, OZ1], [-OX, fy, OZ0]], SH.edge, 0.55);
      // the door's dashed outline, where it sits when shut
      p.guide([[-DX, fy + DT, DZ0], [DX, fy + DT, DZ0], [DX, fy + DT, DZ1]]);
    } else {
      p.face([[-X, fy, Z0], [X, fy, Z0], [X, fy, Z1], [-X, fy, Z1]], 0.13, SH.edge, 0.55);
    }
    // a little sparkle in the empty safe
    if (open > 0.7) {
      const k = (open - 0.7) / 0.3;
      p.dot([-2, 6, 16 + Math.sin(t * 3) * 0.5], 0.9, k);
      p.dot([2.5, 6, 8 + Math.sin(t * 2.4 + 1) * 0.5], 0.7, k);
    }
    // the door: hinged on its left edge, swinging out toward us
    const c = Math.cos(a), s = Math.sin(a);
    p.push(); p.rotate("z", a, [-DX, fy, 0]);
    const y0 = fy, y1 = fy + DT;
    // hinge knuckles
    for (const z of [6, 16]) p.cylinder(-DX - 0.4, fy + 0.4, z, 0.9, 2.6, { top: 0.24, side: 0.13 });
    // top edge, then the free edge, then whichever big face looks at us
    p.face([[-DX, y0, DZ1], [DX, y0, DZ1], [DX, y1, DZ1], [-DX, y1, DZ1]], 0.22, SH.edge, 0.55);
    p.face([[DX, y0, DZ0], [DX, y1, DZ0], [DX, y1, DZ1], [DX, y0, DZ1]], SH.right, SH.edge, 0.55);
    if (c > s) {
      // the outside: a lit panel with the dial and the handle
      p.face([[-DX, y1, DZ0], [DX, y1, DZ0], [DX, y1, DZ1], [-DX, y1, DZ1]], 0.2, SH.edge, 0.6);
      p.line([[-DX + 1.3, y1 + 0.03, DZ0 + 1.3], [DX - 1.3, y1 + 0.03, DZ0 + 1.3], [DX - 1.3, y1 + 0.03, DZ1 - 1.3], [-DX + 1.3, y1 + 0.03, DZ1 - 1.3], [-DX + 1.3, y1 + 0.03, DZ0 + 1.3]], SH.edge, 0.55);
      const cx = -0.6, cz = 13.6, r = 3.6, sp = spin * Math.PI * 3;
      p.ringV("y", [cx, y1 + 0.05, cz], r, 0.34, SH.edge, 0.6);
      p.ringV("y", [cx, y1 + 0.1, cz], 1.1, 0.12, SH.edge, 0.5);
      // a cut ring round the dial so it reads in the dot styles too
      p.line(Array.from({ length: 33 }, (_, i) => { const q = (i / 32) * Math.PI * 2; return [cx + Math.cos(q) * r, y1 + 0.12, cz + Math.sin(q) * r] as V3; }), SH.edge, 0.9);
      for (let i = 0; i < 8; i++) {
        const q = sp + (i * Math.PI) / 4, r0 = i % 2 ? 2.7 : 2.2;
        p.line([[cx + Math.cos(q) * r0, y1 + 0.1, cz + Math.sin(q) * r0], [cx + Math.cos(q) * 3.4, y1 + 0.1, cz + Math.sin(q) * 3.4]], SH.edge, 0.55);
      }
      // the handle: a bar with two posts
      p.box(-3.6, y1, 6.8, 6.4, 1.2, 1.3, { top: 0.26, left: 0.2, right: 0.08 });
      p.box(-3.4, y1, 6.9, 1, 1.1, 1.1, { top: 0.26 }); p.box(1.8, y1, 6.9, 1, 1.1, 1.1, { top: 0.26 });
    } else {
      // the inside of the door: bolts along the free edge and a plate
      p.face([[-DX, y0, DZ0], [DX, y0, DZ0], [DX, y0, DZ1], [-DX, y0, DZ1]], 0.12, SH.edge, 0.55);
      p.face([[-DX + 1.5, y0 - 0.03, DZ0 + 1.5], [DX - 2.6, y0 - 0.03, DZ0 + 1.5], [DX - 2.6, y0 - 0.03, DZ1 - 1.5], [-DX + 1.5, y0 - 0.03, DZ1 - 1.5]], 0.2, SH.edge, 0.5);
      for (const z of [6, 12, 18]) p.box(DX - 1.6, y0 - 1.4, z - 0.6, 1.2, 1.4, 1.2, { top: 0.26, left: 0.16, right: 0.08 });
    }
    p.pop();
  },
};
