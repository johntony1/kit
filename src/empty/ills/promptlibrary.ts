// No saved prompts: three thick books standing upright in a row, spines toward us, a sparkle on the spine of the tall one in the middle. Hover and the middle book slides up out of the row and a bright sparkle pops in over it.
import { easeInOut, type Illustration, type V3 } from "../dots";


const star = (cx: number, y: number, cz: number, r: number): V3[] => Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, q = i % 2 ? r * 0.3 : r; return [cx + Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });

export const promptlibrary: Illustration = {
  k: "promptlibrary", name: "Prompt library", title: "No saved prompts", body: "Save a prompt you like and it will be kept here, ready to use again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.3));
    p.translate(0, 7, -17);
    p.shadow(0, -7, 28, 13, 0.12);
    p.rotate("z", -0.75);
    // spines bright, the page tops dark, a dark gap between the books
    const books = [{ x: -15.5, H: 27 }, { x: -5, H: 31 }, { x: 5.5, H: 27 }], w = 9.6;
    books.forEach((b, i) => {
      const y = 0.05;
      p.push();
      p.translate(0, 0, i === 1 ? 8 * k : 0);
      if (i === 2) p.rotate("y", 0.36, [b.x + w, 0, 0]); // the last book leans away
      p.box(b.x, -15, 0, w, 15, b.H, { top: 0.12, left: 0.3, right: 0.065, edge: 0 });
      p.face([[b.x, -1.4, b.H + 0.03], [b.x + w, -1.4, b.H + 0.03], [b.x + w, 0, b.H + 0.03], [b.x, 0, b.H + 0.03]], 0.3, 0); // the cover's edge
      p.face([[b.x, -15, b.H + 0.03], [b.x + 0.9, -15, b.H + 0.03], [b.x + 0.9, 0, b.H + 0.03], [b.x, 0, b.H + 0.03]], 0.3, 0);
      // two bands across the spine near each end
      for (const z of [3.2, b.H - 3.2]) p.clear([[b.x, y, z - 0.55], [b.x + w, y, z - 0.55], [b.x + w, y, z + 0.55], [b.x, y, z + 0.55]]);
      if (i === 1) p.clear(star(b.x + w / 2, y, b.H * 0.52, 3.8));
      p.line([[b.x + 0.05, y, 0], [b.x + 0.05, y, b.H]], 1, 0.8);
      p.pop();
    });
    // the bright sparkle over the risen book
    const s = Math.max(0, (h - 0.55) / 0.45);
    if (s > 0) {
      const r = 4.6 * Math.min(1, s * 1.6) + h * Math.sin(t * 5) * 0.4, c: [number, number, number] = [6, 1, 33 + 8 * k];
      p.clear(star(c[0], c[1], c[2], r + 1.3));
      p.face(star(c[0], c[1], c[2], r), 0.45, 0);
    }
  },
};
