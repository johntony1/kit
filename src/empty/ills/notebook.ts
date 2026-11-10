// No entries yet: a spiral notebook. Hover and the cover swings over on its rings to show a fresh ruled page.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 9, Y = 12, H = 2.6, C = 0.7; // half width, half depth, page block height, cover thickness
const RINGS = 12;

/** ruled lines and a margin on a page lying in the plane z, from x0 to x1 */
function ruled(p: Pen, x0: number, x1: number, z: number) {
  for (let i = 0; i < 6; i++) { const y = -Y + 4.5 + i * 3.2; p.line([[x0 + 2.8, y, z], [x1 - 1.6, y, z]], SH.edge, 0.55); }
}

export const notebook: Illustration = {
  k: "notebook", name: "Spiral notebook", title: "No entries yet", body: "Write your first entry and it will be kept here, page by page.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h / 0.85));
    const a = -k * Math.PI * 0.985; // the cover's swing
    p.translate(X, -1, -6);
    p.shadow(0, 0, 24, 12, 0.12);
    p.shadow(-X * 2 - 0.8, 0, 24, 12, 0.12 * k);
    const hinge: V3 = [-X - 0.4, 0, H + C / 2];
    // where the cover will land, and the path its free edge swings along
    if (k < 0.97) {
      p.guide([[-X - 1, -Y, H], [-X * 3 - 1, -Y, H], [-X * 3 - 1, Y, H], [-X - 1, Y, H]]);
      const arc: V3[] = Array.from({ length: 16 }, (_, i) => { const b = (i / 15) * Math.PI; return [hinge[0] + Math.cos(b) * X * 2, Y, hinge[2] + Math.sin(b) * X * 2]; });
      p.guide(arc, true);
    }

    const cover = () => {
      p.push(); p.rotate("y", a, hinge);
      const z0 = H, z1 = H + C, up = Math.cos(a) > 0;
      // the front edge, the free edge, then the outside or the inside of the cover
      p.face([[-X, Y, z0], [X, Y, z0], [X, Y, z1], [-X, Y, z1]], SH.left, SH.edge, 0.5);
      if (Math.cos(a) - Math.sin(a) > 0) p.face([[X, -Y, z0], [X, Y, z0], [X, Y, z1], [X, -Y, z1]], SH.right, SH.edge, 0.5);
      if (up) {
        p.face([[-X, -Y, z1], [X, -Y, z1], [X, Y, z1], [-X, Y, z1]], 0.2, SH.edge, 0.55);
        // a label on the cover
        p.face([[-3, -6, z1 + 0.03], [6, -6, z1 + 0.03], [6, 0, z1 + 0.03], [-3, 0, z1 + 0.03]], 0.24, SH.edge, 0.6);
        p.line([[-1.6, -4.4, z1 + 0.05], [4.6, -4.4, z1 + 0.05]], SH.edge, 0.6);
        p.line([[-1.6, -1.8, z1 + 0.05], [2, -1.8, z1 + 0.05]], SH.edge, 0.6);
      } else {
        p.face([[-X, -Y, z0], [X, -Y, z0], [X, Y, z0], [-X, Y, z0]], 0.22, SH.edge, 0.55);
        ruled(p, -X + 1, X, z0 - 0.03);
      }
      p.pop();
    };

    if (a < -Math.PI / 2) cover();
    // the pages, ruled, and a ribbon hanging down the front
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.22, left: 0.13, right: 0.065 });
    for (let z = 0.85; z < H; z += 0.85) p.line([[X + 0.03, -Y, z], [X + 0.03, Y, z]], SH.edge, 0.45);
    ruled(p, -X + 1, X, H + 0.03);
    p.line([[-X + 3.4, -Y + 1, H + 0.03], [-X + 3.4, Y - 1, H + 0.03]], SH.edge, 0.55);
    p.face([[4.5, Y + 0.03, H], [6.3, Y + 0.03, H], [6.3, Y + 0.03, -0.2], [5.4, Y + 0.03, 0.6], [4.5, Y + 0.03, -0.2]], 0.34, SH.edge, 0.5);
    if (a >= -Math.PI / 2) cover();

    // the spiral: a row of rings through the punched edge
    for (let i = 0; i < RINGS; i++) {
      const y = -Y + 1.4 + (i * (Y * 2 - 2.8)) / (RINGS - 1);
      p.ringV("y", [-X - 0.4, y, H + C / 2], 1.7, 0.24, SH.edge, 0.45);
      p.ringV("y", [-X - 0.4, y + 0.02, H + C / 2], 0.85, 0.02, 0);
    }
  },
};
