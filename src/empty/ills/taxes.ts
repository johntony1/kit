// No tax documents: a tax form standing on a small stand, a percent mark at its head and three unticked boxes. Hover and the boxes tick one by one, then a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const F = 0.63; // the face of the sheet

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}

export const taxes: Illustration = {
  k: "taxes", name: "Tax form", title: "No tax documents", body: "Your tax forms and statements will be filed here as they are issued.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 1, 24, 12, 0.1);
    p.rotate("z", -0.55);
    // the stand
    p.box(-13, -3.5, 0, 26, 8, 2.6);
    // the sheet, its top right corner folded over
    const W = 11, Z0 = 2.6, Z1 = 34, C = 4.5;
    p.box(-W, -0.6, Z0, W * 2, 1.2, Z1 - Z0 - C, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
    p.face([[-W, F, Z0], [W, F, Z0], [W, F, Z1 - C], [W - C, F, Z1], [-W, F, Z1]], 0.2, SH.edge, 0.6);
    p.face([[W, F + 0.03, Z1 - C], [W - C, F + 0.03, Z1], [W - C, F + 0.03, Z1 - C]], 0.1, SH.edge, 0.55);
    // the percent mark
    const cx = -5.8, cz = 28.2;
    p.ringV("y", [cx, F + 0.03, cz], 3.9, 0.04, SH.edge, 0.6);
    p.line([[cx - 1.7, F + 0.06, cz - 2.2], [cx + 1.7, F + 0.06, cz + 2.2]], SH.edge, 0.8);
    p.dot([cx - 1.5, F + 0.06, cz + 1.3], 0.8, 1); p.dot([cx + 1.5, F + 0.06, cz - 1.3], 0.8, 1);
    // the heading beside it
    p.line([[0, F + 0.03, 29.6], [5, F + 0.03, 29.6]], 0.03, 1);
    p.line([[0, F + 0.03, 27.2], [7.6, F + 0.03, 27.2]], 0.03, 0.6);
    // three rows: a box and a line each; the boxes tick in turn
    for (let i = 0; i < 3; i++) {
      const z = 20.6 - i * 5, on = ease(clamp((h - 0.08 - i * 0.2) / 0.2));
      p.face([[-8.4, F + 0.03, z - 1.6], [-5.2, F + 0.03, z - 1.6], [-5.2, F + 0.03, z + 1.6], [-8.4, F + 0.03, z + 1.6]], on > 0.5 ? 0.9 : 0.03, SH.edge, 0.55);
      if (on > 0.5) p.line([[-7.7, F + 0.06, z], [-7, F + 0.06, z - 0.8], [-5.8, F + 0.06, z + 0.9]], 0.02, 0.7);
      p.line([[-3, F + 0.03, z + 0.7], [8, F + 0.03, z + 0.7]], 0.03, 0.75);
      p.line([[-3, F + 0.03, z - 1], [i === 1 ? 2 : 5, F + 0.03, z - 1]], 0.03, 0.5);
    }
    // the total
    p.face([[1, F + 0.03, 4.4], [8.4, F + 0.03, 4.4], [8.4, F + 0.03, 7.6], [1, F + 0.03, 7.6]], 0.4, SH.edge, 0.5);
    const b = clamp((h - 0.74) / 0.26);
    if (b > 0) badge(p, [W - 1, F + 1, 6], 4.8 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
