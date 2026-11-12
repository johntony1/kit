// No degrees yet: a framed diploma standing on its easel foot. Hover and a ribboned seal stamps on in the corner and the frame glints.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export const diploma: Illustration = {
  k: "diploma", name: "Diploma", title: "No degrees yet", body: "Add a degree or qualification and it will hang here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 2, -14);
    p.shadow(0, -1, 27, 12, 0.1);
    p.rotate("z", -0.38);
    const X = 17, Z0 = 1.5, Z1 = 27.5, Y = 1.4;
    // the easel foot behind, then the frame
    p.box(-3, -9, 0, 6, 8, 1.2, { lw: 0.5 });
    p.line([[0, -8, 1.2], [0, -Y, 20]], 0.6, 0.6);
    p.box(-X, -Y, Z0, X * 2, Y * 2, Z1 - Z0, { top: 0.24, left: 0.07, right: 0.08, lw: 0.65 });
    const y = Y + 0.03;
    const rect = (a: number, f: number, e: number) => p.face([[-X + a, y, Z0 + a], [X - a, y, Z0 + a], [X - a, y, Z1 - a], [-X + a, y, Z1 - a]], f, e, 0.5);
    rect(2.2, 0.03, SH.edge); // the dark mat
    rect(3.6, 0.3, 0); // the sheet
    // a heading, three lines and a signature
    const zc = (Z0 + Z1) / 2;
    p.line([[-6, y, zc + 6.2], [6, y, zc + 6.2]], SH.edge, 1.1);
    p.line([[-9.5, y, zc + 2.8], [9.5, y, zc + 2.8]], 0.6, 0.5);
    p.line([[-8, y, zc + 0.4], [8, y, zc + 0.4]], 0.6, 0.5);
    p.line([[-9.5, y, zc - 2], [1, y, zc - 2]], 0.6, 0.5);
    p.line(Array.from({ length: 13 }, (_, i) => [-10 + i * 0.6, y, zc - 6 + Math.sin(i * 1.4) * 0.9 + (i === 12 ? -0.6 : 0)] as V3), SH.edge, 0.6);
    // the seal: a rosette with two ribbon tails, dropping in and settling
    const k = Math.min(1, h / 0.6);
    if (k > 0.01) {
      const e = ease(k), s = (k < 0.7 ? 1.5 - 0.5 * ease(k / 0.7) : 1) * (0.4 + 0.6 * e);
      const cx = 8, cz = zc - 4.6, yy = y + 0.4 + (1 - e) * 9;
      const R = 5 * s;
      p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [cx + Math.cos(a) * (R + 1.2), yy - 0.02, cz + Math.sin(a) * (R + 1.2)] as V3; }));
      p.face([[cx - 2.2, yy, cz - 1], [cx - 3, yy, cz - 7 * s], [cx - 1.4, yy, cz - 6 * s], [cx - 0.2, yy, cz - 7 * s], [cx, yy, cz - 1]], 0.45, SH.edge, 0.5);
      p.face([[cx + 0.2, yy, cz - 1], [cx + 0.6, yy, cz - 7 * s], [cx + 1.8, yy, cz - 6 * s], [cx + 3, yy, cz - 7 * s], [cx + 2.2, yy, cz - 1]], 0.45, SH.edge, 0.5);
      p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2, r = i % 2 ? R : R * 0.82; return [cx + Math.cos(a) * r, yy, cz + Math.sin(a) * r] as V3; }), 0.42, SH.edge, 0.55);
      p.ringV("y", [cx, yy + 0.03, cz], R * 0.48, 0, SH.edge, 0.7);
    }
    // a glint and sparkles once it lands
    const g = Math.max(0, (h - 0.6) / 0.4);
    if (g > 0) ([[-X - 2, 3, Z1 + 3], [X + 3, 2, Z1 - 4], [X - 6, 2, Z1 + 5]] as V3[]).forEach((q, i) => p.dot(q, 0.75 + 0.35 * Math.sin(t * 3.2 + i * 2.1), g));
  },
};
