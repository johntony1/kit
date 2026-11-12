// No catalogue yet: a catalogue lying open, a picture on one page and four empty product frames on the other. Hover and a product rises out of each frame in turn.
import { SH, type Illustration } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const out = (x: number) => 1 - Math.pow(1 - x, 3);
const Z = 1.82;
// the four frames on the right page: corner (x, y), what rises from it and how tall
const CELLS: [number, number, "box" | "can", number][] = [[2, -8.2, "box", 5.5], [8.3, -8.2, "can", 3.6], [2, -0.4, "can", 6.2], [8.3, -0.4, "box", 4.2]];

export const catalog: Illustration = {
  k: "catalog", name: "Catalogue", title: "No catalogue yet", body: "Add your products and they will fill these pages.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -5);
    p.shadow(0, 0, 32, 15, 0.1);
    // the cover under the pages, then the two blocks of pages
    p.box(-15.7, -10.7, 0, 31.4, 21.4, 0.6, { top: 0.1, left: 0.22, right: 0.1 });
    p.box(-15, -10, 0.6, 15, 20, 1.2, { lw: 0.6 });
    p.box(0, -10, 0.6, 15, 20, 1.2, { lw: 0.6 });
    p.line([[0, -10, Z], [0, 10, Z]], SH.edge, 0.7); // the gutter
    // left page: a picture and three lines of text
    p.face([[-13, -8.2, Z], [-2, -8.2, Z], [-2, 0.6, Z], [-13, 0.6, Z]], 0.035, SH.edge, 0.5);
    p.line([[-12.4, -0.2, Z + 0.01], [-9.2, -4.4, Z + 0.01], [-6.8, -1.8, Z + 0.01], [-5, -3.8, Z + 0.01], [-2.6, -0.4, Z + 0.01]], 0.6, 0.5);
    p.dot([-4.6, -6.2, Z + 0.01], 0.9, 0.7);
    p.line([[-13, 3.2, Z], [-2.4, 3.2, Z]], SH.edge, 0.9);
    p.line([[-13, 5.6, Z], [-4, 5.6, Z]], 0.6, 0.55);
    p.line([[-13, 7.6, Z], [-6.5, 7.6, Z]], 0.6, 0.55);
    // right page: four product frames with a price line under each
    for (const [x, y] of CELLS) {
      p.face([[x, y, Z], [x + 5, y, Z], [x + 5, y + 5.4, Z], [x, y + 5.4, Z]], 0.035, SH.edge, 0.5);
      p.line([[x, y + 6.8, Z], [x + 3.2, y + 6.8, Z]], 0.6, 0.55);
    }
    // the products, back to front
    CELLS.forEach(([x, y, kind, hgt], i) => {
      const k = out(clamp((h - 0.14 * i) / 0.5));
      if (k < 0.03) return;
      if (kind === "box") p.box(x + 0.6, y + 0.7, Z, 3.8, 4, hgt * k, { top: 0.34, left: 0.24, right: 0.11 });
      else p.cylinder(x + 2.5, y + 2.7, Z, 2, hgt * k, { side: 0.22, top: 0.34 });
    });
  },
};
