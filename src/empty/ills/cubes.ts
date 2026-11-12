// No apps yet: three plain cubes, two side by side with a gap and one resting on top. Hover and the top cube lifts off and floats; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = 12.5; // the side of a cube

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// one plain cube centred on (cx, cy): a solid top, a dense left face, a sparse right face, and a dark cut along every edge
function cube(p: Pen, cx: number, cy: number, z: number) {
  const x = cx - S / 2, y = cy - S / 2, X = x + S, Y = y + S, Z = z + S;
  p.box(x, y, z, S, S, S, { top: 0.3, left: 0.12, right: 0.055, edge: 0 });
  p.line([[x, Y, Z], [X, Y, Z], [X, y, Z]], SH.edge, 0.8);
  p.line([[X, Y, Z], [X, Y, z]], SH.edge, 0.8);
  p.line([[x, Y, z], [x, Y, Z], [x, y, Z], [X, y, Z], [X, y, z], [X, Y, z], [x, Y, z]], SH.edge, 0.9);
}

export const cubes: Illustration = {
  k: "cubes", name: "Stacked cubes", title: "No apps yet", body: "Add your first app and it will stack up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 28, 13, 0.12);
    // the two below sit side by side as we see them, a clear gap between
    const c = 7.4;
    cube(p, -c, c, 0);
    cube(p, c, -c, 0);
    // the top cube lifts off and floats while hovered
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 5 * back(Math.min(1, h * 1.25)) + h * Math.sin(t * 3) * 0.7;
    cube(p, 0, 0, S + lift);
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [15, -15, 27], 4.4 * pop);
    }
  },
};
