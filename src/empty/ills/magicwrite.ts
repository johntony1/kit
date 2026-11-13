// Nothing drafted yet: a big pencil leaning over a sheet of paper, a sparkle at its tip and a bold line started behind it. Hover and the pencil writes the line on across the page while the sparkle twinkles.
import { easeInOut, type Illustration, type V3 } from "../dots";


const star = (cx: number, cy: number, cz: number, r: number): V3[] => Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, q = i % 2 ? r * 0.3 : r; return [cx + Math.cos(a) * q * 0.7, cy - Math.cos(a) * q * 0.7, cz + Math.sin(a) * q] as V3; });
const wave = (x: number) => 4 + Math.sin(x * 0.55) * 1.8;

export const magicwrite: Illustration = {
  k: "magicwrite", name: "Magic write", title: "Nothing drafted yet", body: "Tell us what you need and a first draft will be written for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.2));
    p.translate(-3, 0, -14);
    p.shadow(0, 0, 30, 15, 0.12);
    p.rotate("z", -0.2);
    // the sheet lying flat, with a ruled line it has not reached yet
    p.box(-17, -13, 0, 34, 26, 1.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    const z = 1.45;
    p.line([[-13, -6, z], [9, -6, z]], 1, 0.5);
    // the bold line written so far
    const x1 = -13 + 8 + 18 * k;
    const pts: V3[] = [];
    for (let x = -13; x <= x1 + 0.01; x += 0.5) pts.push([x, wave(x), z]);
    p.line(pts, 1, 1.7);
    // the pencil, its point on the end of the line, leaning up and away to the right
    p.push();
    p.translate(x1, wave(x1), z);
    p.rotate("x", 0.62);
    const s = 2.9;
    p.face([[-s, s, 7.5], [s, s, 7.5], [0, 0, 0]], 0.26, 0);
    p.face([[s, -s, 7.5], [s, s, 7.5], [0, 0, 0]], 0.12, 0);
    p.face([[-s * 0.35, s * 0.35, 2.6], [s * 0.35, s * 0.35, 2.6], [0, 0, 0]], 0.03, 0);
    p.face([[s * 0.35, -s * 0.35, 2.6], [s * 0.35, s * 0.35, 2.6], [0, 0, 0]], 0.03, 0);
    p.box(-s, -s, 7.5, s * 2, s * 2, 26, { top: 0.2, left: 0.24, right: 0.09, edge: 0 });
    p.line([[0, s + 0.05, 7.6], [0, s + 0.05, 33.5]], 1, 0.6);
    p.box(-s - 0.2, -s - 0.2, 33.5, s * 2 + 0.4, s * 2 + 0.4, 3.6, { top: 0.2, left: 0.3, right: 0.12, edge: 0 });
    p.line([[-s - 0.2, s + 0.25, 35.3], [s + 0.2, s + 0.25, 35.3], [s + 0.25, -s - 0.2, 35.3]], 1, 0.7);
    p.box(-s, -s, 37.1, s * 2, s * 2, 3.6, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.pop();
    // the sparkle by the point
    const r = 4.2 + 1.4 * k + h * Math.sin(t * 6) * 0.6;
    const c: [number, number, number] = [x1 + 2, wave(x1) + 9, 9];
    p.clear(star(c[0], c[1], c[2], r + 1.3));
    p.face(star(c[0], c[1], c[2], r), 0.45, 0);
  },
};
