// No tools added: a classic metal toolbox, closed, a sloped lid with a bar handle on top, a bright latch at the front and a drawer below. Hover and the lid lifts on its hinge with a little bounce; a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

const L = 16, D = 7, H = 13, LH = 6; // half length, half depth, body height, lid height

export const toolbox: Illustration = {
  k: "toolbox", name: "Toolbox", title: "No tools added", body: "Add your first tool and it will be kept here, ready to use.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 32, 13, 0.12);
    p.rotate("z", -0.66);
    // the body: a dense front, a sparse end, the open top dark inside
    p.box(-L, -D, 0, L * 2, D * 2, H, { open: true, left: 0.065, right: 0.04, edge: 0 });
    // the drawer: a cut round it and a dark pull slot, low on the front
    p.face([[-L + 1.6, D + 0.03, 1.6], [L - 1.6, D + 0.03, 1.6], [L - 1.6, D + 0.03, 7], [-L + 1.6, D + 0.03, 7]], 0.26, 0);
    p.clear([[-3.5, D + 0.04, 3.4], [3.5, D + 0.04, 3.4], [3.5, D + 0.04, 4.6], [-3.5, D + 0.04, 4.6]]);
    // the lid hinges at the back top edge
    const a = 0.42 * back(Math.min(1, h * 1.1)) * Math.min(1, h * 3);
    p.push();
    p.rotate("x", a, [0, -D, H]);
    const T = H + LH, d = 3.6; // lid top, how far the lid's top is inset front and back
    // the lid: a sloped front, a flat lit top, two trapezoid ends
    p.face([[L, -D, H], [L, D, H], [L, D - d, T], [L, -D + d, T]], 0.065, 0);
    p.face([[-L, D, H], [L, D, H], [L, D - d, T], [-L, D - d, T]], 0.24, 0);
    p.face([[-L, -D + d, T], [L, -D + d, T], [L, D - d, T], [-L, D - d, T]], 0.065, 0);
    p.line([[-L, D - d, T], [L, D - d, T]], 1, 0.6);
    // the handle: two posts and a thick lit bar along the top
    for (const x of [-7, 5.6]) p.box(x, -0.7, T, 1.4, 1.4, 4, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    p.box(-8.5, -1.2, T + 4, 17, 2.4, 2.2, { top: 0.34, left: 0.3, right: 0.1, edge: 0 });
    p.pop();
    // the seam and the latch, bright on the front where lid meets body
    p.line([[-L, D + 0.05, H], [L, D + 0.05, H]], 1, 1);
    p.box(-2.2, D, H - 3.8, 4.4, 1, 5.2, { top: 0.3, left: 0.4, right: 0.12, edge: 0 });
    p.line([[-1.1, D + 1.05, H - 1.2], [1.1, D + 1.05, H - 1.2]], 1, 0.7);
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [L - 1, -D + 2, T + 6], 4.4 * pop);
    }
  },
};
