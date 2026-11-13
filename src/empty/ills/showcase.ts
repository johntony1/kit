// Nothing on display: a glass display cube on a solid plinth, a big diamond inside. Hover and the glass lifts off and the diamond turns; a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const B = 10, BH = 8; // half size and height of the plinth
const G = 8.8, GH = 21; // half size and height of the glass cube

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// a cut diamond standing up and facing us: a crown of three facets over a point of three, each a different tone, a dark cut round the girdle
const CROWN: [number, number][][] = [[[-8, 0], [-4.6, 4.2], [-2.2, 0]], [[-4.6, 4.2], [4.6, 4.2], [2.2, 0], [-2.2, 0]], [[2.2, 0], [4.6, 4.2], [8, 0]]];
const POINT: [number, number][][] = [[[-8, 0], [-2.2, 0], [0, -10]], [[-2.2, 0], [2.2, 0], [0, -10]], [[2.2, 0], [8, 0], [0, -10]]];
function diamond(p: Pen, cz: number, turn: number) {
  p.push();
  p.rotate("z", -Math.PI / 4 + turn);
  const at = (q: [number, number][], y = 0) => q.map(([u, v]) => [u * 1.3, y, cz + v * 1.3] as V3);
  [0.24, 0.4, 0.12].forEach((f, i) => p.face(at(CROWN[i]), f, 0));
  [0.3, 0.2, 0.12].forEach((f, i) => p.face(at(POINT[i]), f, 0));
  p.line(at([[-8, 0], [8, 0]], 0.05), 1, 0.8);
  p.pop();
}

export const showcase: Illustration = {
  k: "showcase", name: "Display case", title: "Nothing on display", body: "Pick the products you want to feature and they will be shown off here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h / 0.7));
    p.translate(0, 0, -19);
    p.shadow(0, 0, 26, 13, 0.12);
    // the plinth, with a lit lip round its top and a dark velvet top so the diamond stands out
    p.box(-B, -B, 0, B * 2, B * 2, BH - 1.4, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    p.box(-B - 0.8, -B - 0.8, BH - 1.4, B * 2 + 1.6, B * 2 + 1.6, 1.4, { top: 0.22, left: 0.3, right: 0.1, edge: 0 });
    p.face([[-B + 1, -B + 1, BH + 0.02], [B - 1, -B + 1, BH + 0.02], [B - 1, B - 1, BH + 0.02], [-B + 1, B - 1, BH + 0.02]], 0.03, 0);
    // the glass, lifted on hover: corners of the cube
    const z0 = BH + 5 * k, z1 = z0 + GH;
    const c = (x: number, y: number, z: number): [number, number] => p.pt([x * G, y * G, z]);
    const stroke = (g: CanvasRenderingContext2D, w: number, pts: [number, number][]) => {
      g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    };
    // the back edges, thin, behind the diamond
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round";
      stroke(g, 1, [c(-1, 1, z0), c(-1, -1, z0), c(1, -1, z0)]);
      stroke(g, 1, [c(-1, -1, z0), c(-1, -1, z1)]);
      stroke(g, 1.3, [c(1, 1, z0), c(1, 1, z1)]); // the near corner too: it would split the diamond, so the diamond hides it
    });
    // a slim post and the diamond standing on its point, turning while hovered
    p.disc(0, 0, BH + 0.04, 2.4, 0.2, 0);
    p.cylinder(0, 0, BH, 0.8, 1.6, { side: 0.3, top: 0.3, edge: 0 });
    diamond(p, BH + 1.2 + 13 + 1.2 * k, k * Math.PI);
    // the front edges of the glass, bright, and one short glare high on the left pane
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineJoin = "round";
      stroke(g, 1.3, [c(-1, 1, z0), c(1, 1, z0), c(1, -1, z0)]);
      stroke(g, 1.3, [c(-1, 1, z0), c(-1, 1, z1)]);
      stroke(g, 1.3, [c(1, -1, z0), c(1, -1, z1)]);
      stroke(g, 1.3, [c(-1, -1, z1), c(1, -1, z1), c(1, 1, z1), c(-1, 1, z1), c(-1, -1, z1)]);
      stroke(g, 1.2, [p.pt([-G * 0.85, G, z1 - 2.5]), p.pt([-G * 0.45, G, z1 - 9])]);
    });
    const bb = Math.max(0, (h - 0.68) / 0.32);
    if (bb > 0) {
      const pop = bb < 0.65 ? ease(bb / 0.65) * 1.18 : 1.18 - 0.18 * ease((bb - 0.65) / 0.35);
      badge(p, [-G, G, z1 + 1], 4.4 * pop);
    }
  },
};
