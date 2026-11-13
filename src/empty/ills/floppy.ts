// Nothing saved yet: a floppy disk standing up, a metal shutter at its top and a bright label below. Hover and the shutter slides across to show the disc inside.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const S = 16, C = 4.5, T = 2; // half size, clipped corner, thickness

export const floppy: Illustration = {
  k: "floppy", name: "Floppy disk", title: "Nothing saved yet", body: "Save your work and it will be kept here, safe until you need it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -1);
    p.push(); p.translate(0, 0, -S - 1); p.shadow(0, 0, 24, 9, 0.11); p.pop();
    p.translate(0, 0, h > 0.9 ? Math.sin(t * 2.4) * 0.4 : 0);
    p.rotate("z", -0.5);
    // the body: a square with its top right corner clipped
    const outline: [number, number][] = [[-S, -S], [S, -S], [S, S - C], [S - C, S], [-S, S]];
    const at = (y: number) => outline.map(([u, v]) => [u, y, v] as V3);
    p.face(at(-T), SH.right, SH.edge, 0.55);
    for (let y = -T + 0.4; y < 0; y += 0.4) p.face(at(y), 0.08, 0);
    p.face(at(0), 0.12, SH.edge, 0.65);
    const y = 0.08;
    // the label: a big bright panel on the lower part, two lines cut into it
    p.clear([[-S + 2.6, y - 0.02, -S], [S - 2.6, y - 0.02, -S], [S - 2.6, y - 0.02, -0.1], [-S + 2.6, y - 0.02, -0.1]]);
    p.face([[-S + 3.5, y, -S], [S - 3.5, y, -S], [S - 3.5, y, -1], [-S + 3.5, y, -1]], 0.3, SH.edge, 0.6);
    p.line([[-S + 7, y + 0.03, -5.5], [S - 7, y + 0.03, -5.5]], SH.edge, 0.9);
    p.line([[-S + 7, y + 0.03, -10], [S - 11, y + 0.03, -10]], SH.edge, 0.9);
    // the window under the shutter: dark, the disc inside
    const k = easeInOut(Math.min(1, h * 1.2));
    const z0 = S - 11.5, z1 = S - 2;
    p.clear([[-5, y, z0], [2, y, z0], [2, y, z1], [-5, y, z1]]);
    // the shutter: a bright metal plate across the top, sliding right on hover
    const sx = -8 + 10 * k;
    p.clear([[sx - 0.9, y + 0.01, S - 14.4], [sx + 13.9, y + 0.01, S - 14.4], [sx + 13.9, y + 0.01, S], [sx - 0.9, y + 0.01, S]]);
    p.box(sx, 0.1, S - 13.5, 13, 0.8, 13.5, { top: 0.3, left: 0.26, right: 0.1, lw: 0.55 });
    p.line([[sx + 10.5, 0.95, S - 11], [sx + 10.5, 0.95, S - 3]], SH.edge, 0.9);
  },
};
