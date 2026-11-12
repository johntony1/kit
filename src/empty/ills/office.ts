// Office building: a tower with a grid of windows and a door. Hover and the windows on the shaded side light up, then a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 9.5, D = 8, H = 27, Z = 1.2; // half width, half depth, height, where the tower starts

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const office: Illustration = {
  k: "office", name: "Office building", title: "No companies yet", body: "Add a company to keep its people, deals and notes in one place.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.scale(0.95);
    p.shadow(0, 0, 24, 12, 0.11);
    // a low step and the tower
    p.box(-W - 1.5, -D - 1.5, 0, 2 * W + 3, 2 * D + 3, Z, { top: 0.12, left: 0.085, right: 0.05, edge: 0 });
    p.box(-W, -D, Z, 2 * W, 2 * D, H, { top: 0.2, left: 0.2, right: 0.075, edge: 0 });
    p.line([[-W, D + 0.03, Z + H], [W + 0.03, D + 0.03, Z + H], [W + 0.03, -D, Z + H]], 1, 0.95);
    // the lit wall: three columns of dark windows over a door with a canopy
    const rows = [0, 1, 2, 3].map((r) => Z + 8.6 + r * 4.6);
    for (const z of rows) for (const x of [-5.8, 0, 5.8]) p.clear([[x - 1.8, D + 0.03, z], [x + 1.8, D + 0.03, z], [x + 1.8, D + 0.03, z + 3.2], [x - 1.8, D + 0.03, z + 3.2]]);
    p.clear([[-2.6, D + 0.03, Z], [2.6, D + 0.03, Z], [2.6, D + 0.03, Z + 6], [-2.6, D + 0.03, Z + 6]]);
    p.box(-3.8, D, Z + 6.2, 7.6, 2.4, 0.9, { top: 0.3, left: 0.22, right: 0.1, edge: 0 });
    // the shaded wall is plain at rest: its windows light up one by one on hover
    let i = 0;
    for (const z of [Z + 2.8, ...rows]) for (const y of [4.6, 0, -4.6]) {
      const q: V3[] = [[W + 0.03, y - 1.5, z], [W + 0.03, y + 1.5, z], [W + 0.03, y + 1.5, z + 3.2], [W + 0.03, y - 1.5, z + 3.2]];
      if (h * 22 - i > 0.5) p.face(q, 0.3, 0);
      i++;
    }
    // a roof unit
    p.box(-4, -4, Z + H, 6.5, 6, 2.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the plus badge pops in at the end
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) badge(p, [13, -11, Z + H + 3], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
