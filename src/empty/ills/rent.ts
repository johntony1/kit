// No rent due: a little house with a round currency plaque in its gable. Hover and the front door swings open and a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 10, Y = 7, HW = 11, RZ = 19; // half width, half depth (front at +Y), wall height, ridge height

// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.36); g.lineTo(x + r * 0.48, y - r * 0.32); g.stroke();
  });
}

export const rent: Illustration = {
  k: "rent", name: "Rent", title: "No rent due", body: "When rent is set up, the next payment and its due date will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const open = ease(clamp(h / 0.6)) * 1.35 + h * Math.sin(t * 2.4) * 0.04;
    p.translate(0, 0, -11);
    p.scale(1.08);
    p.shadow(0, 1, 27, 13.5, 0.12);
    p.rotate("z", -0.5);
    // the walls: a dense front, a sparse end
    p.box(-X, -Y, 0, X * 2, Y * 2, HW, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    const f = Y + 0.03;
    // a window on the left: lit panes with a cross of bars
    p.face([[-8, f, 4], [-3.4, f, 4], [-3.4, f, 8.6], [-8, f, 8.6]], 0.3, SH.edge, 0.6);
    p.line([[-5.7, f + 0.02, 4], [-5.7, f + 0.02, 8.6]], SH.edge, 0.7);
    p.line([[-8, f + 0.02, 6.3], [-3.4, f + 0.02, 6.3]], SH.edge, 0.7);
    // the doorway, dark, and the door swinging out on its right hinge
    const D0 = 0.6, D1 = 5.6, DZ = 8.4;
    p.clear([[D0, f, 0], [D1, f, 0], [D1, f, DZ], [D0, f, DZ]]);
    p.push();
    p.rotate("z", -open, [D1, f, 0]);
    p.face([[D0, f, 0], [D1, f, 0], [D1, f, DZ], [D0, f, DZ]], 0.24, SH.edge, 0.6);
    p.dot([D0 + 1.1, f + 0.05, 4.2], 0.7, 0);
    p.pop();
    // the roof: a lit slope, a shaded slope, the gable in front
    const B = -Y - 1.4, F = Y + 1.4, Zb = HW - 0.4;
    p.face([[-X - 1.6, B, Zb], [0, B, RZ], [0, F, RZ], [-X - 1.6, F, Zb]], 0.2, 0);
    p.face([[0, B, RZ], [0, F, RZ], [X + 1.6, F, Zb], [X + 1.6, B, Zb]], 0.075, 0);
    p.line([[0, B, RZ], [0, F, RZ]], SH.edge, 0.6);
    p.face([[-X, Y, HW], [X, Y, HW], [0, Y, RZ - 1.4]], 0.05, 0);
    p.line([[-X - 1.6, F + 0.03, Zb], [0, F + 0.03, RZ], [X + 1.6, F + 0.03, Zb], [-X - 1.6, F + 0.03, Zb]], SH.edge, 0.7);
    // the plaque in the gable: a bright disc with a dollar mark cut in it
    const cz = HW + 3.2, y = Y + 0.06;
    p.ringV("y", [0, y, cz], 3, 0.42, SH.edge, 0.7);
    const S: [number, number][] = [[0.8, 0.75], [0.35, 1], [-0.4, 1], [-0.8, 0.6], [-0.6, 0.15], [0.6, -0.15], [0.8, -0.6], [0.4, -1], [-0.35, -1], [-0.8, -0.75]];
    p.line(S.map(([u, v]) => [u * 1.5, y + 0.03, cz + v * 1.6] as V3), SH.edge, 0.75);
    p.line([[0, y + 0.03, cz + 2.2], [0, y + 0.03, cz - 2.2]], SH.edge, 0.75);
    const b = clamp((h - 0.62) / 0.38);
    if (b > 0) tick(p, [-10, -8, 22], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
