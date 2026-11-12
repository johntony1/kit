// No stock yet: a warehouse with a wide roller door. Hover and the door rolls up on crates stacked inside; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

const W = 15, D = 10, H = 13, R = 20; // half width, half depth, wall height, ridge height

export const warehouse: Illustration = {
  k: "warehouse", name: "Warehouse", title: "No stock yet", body: "Add your first stock and it will be counted and stored here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h * 1.25));
    p.translate(0, 0, -11);
    p.shadow(0, 2, 30, 15, 0.11);
    p.rotate("z", -0.5); // turned so the door faces us
    // the walls: the long side in shade with ribbed sheeting, the front lit
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0, left: 0.13, right: 0.06, edge: 0 });
    for (let y = -D + 2.5; y < D; y += 2.5) p.line([[W + 0.03, y, 0.5], [W + 0.03, y, H]], 0.45, 0.4);
    // the roof: two shallow slopes and the gable over the front
    const O = 1.2; // overhang
    p.face([[0, -D, R], [0, D + O, R], [W + O, D + O, H - 0.5], [W + O, -D, H - 0.5]], 0.085, SH.edge, 0.55);
    p.face([[-W - O, -D, H - 0.5], [0, -D, R], [0, D + O, R], [-W - O, D + O, H - 0.5]], 0.22, SH.edge, 0.55);
    p.face([[-W, D, H], [W, D, H], [0, D, R - 0.6]], 0.13, 0);
    for (let x = -W + 3; x < 0; x += 3) p.line([[x, -D, H - 0.5 + ((x + W + O) / (W + O)) * (R - H + 0.5)], [x, D + O, H - 0.5 + ((x + W + O) / (W + O)) * (R - H + 0.5)]], 0.5, 0.4);
    p.dot([0, D + 0.05, H + 2.6], 1.3, 0); // a round vent
    p.line([[-W, D + 0.03, 0], [-W, D + 0.03, H]], SH.edge, 0.5); p.line([[W, D + 0.03, 0], [W, D + 0.03, H]], SH.edge, 0.5);
    // the doorway: dark inside, crates waiting in it
    const X = 9, T = 10.5, Y = D + 0.03;
    p.clear([[-X, Y, 0], [X, Y, 0], [X, Y, T], [-X, Y, T]]);
    if (k > 0.05) {
      const s = { top: 0.4 * k, left: 0.3 * k, right: 0.16 * k, edge: k };
      p.box(-7.4, 4, 0, 6, 5, 5, s); p.box(-0.8, 4, 0, 5.4, 5, 4.4, s);
      p.box(-5, 4.4, 5, 5.4, 4.6, 4, s);
    }
    // the roller door: slats, rolling up into the head of the frame
    const b = k * (T - 2.2);
    p.face([[-X, Y, b], [X, Y, b], [X, Y, T], [-X, Y, T]], 0.2, SH.edge, 0.55);
    for (let z = T - 1.5 + ((k * 6) % 1.5); z > b + 0.4; z -= 1.5) p.line([[-X, Y + 0.02, z], [X, Y + 0.02, z]], 0.7, 0.45);
    p.line([[-X, Y + 0.02, b], [X, Y + 0.02, b]], SH.edge, 0.9);
    p.line([[-X, Y, 0], [-X, Y, T], [X, Y, T], [X, Y, 0]], SH.edge, 0.7);
    // the plus badge pops in once the door is up
    const q = Math.max(0, (h - 0.7) / 0.3);
    if (q > 0) {
      const pop = q < 0.65 ? ease(q / 0.65) * 1.18 : 1.18 - 0.18 * ease((q - 0.65) / 0.35);
      badge(p, [17, -8, 24], 4.6 * pop);
    }
  },
};
