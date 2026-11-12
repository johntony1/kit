// No unread messages: a small stack of sealed envelopes lying flat. Hover and the top one lifts off the stack and a tick pops in.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 14, Y = 9.5, T = 1.5; // half width, half depth, thickness of one envelope
const cl = (x: number) => Math.max(0, Math.min(1, x));

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.38); g.lineTo(x + r * 0.48, y - r * 0.32); g.stroke();
  });
}

// one envelope, its flap folded shut on top
function env(p: Pen, z: number, rot: number, top: number) {
  p.push();
  p.rotate("z", rot);
  p.box(-X, -Y, z, X * 2, Y * 2, T, { top, left: 0.12, right: 0.065 });
  const Z = z + T + 0.03;
  p.line([[-X, -Y, Z], [0, 2.2, Z], [X, -Y, Z]], SH.edge, 0.75);
  p.line([[-X, Y, Z], [-3.4, -0.2, Z]], SH.edge, 0.5);
  p.line([[X, Y, Z], [3.4, -0.2, Z]], SH.edge, 0.5);
  p.pop();
}

export const unread: Illustration = {
  k: "unread", name: "Unread", title: "No unread messages", body: "You have read everything. New messages will wait for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(cl(h / 0.7));
    p.translate(0, 0, -7);
    p.shadow(0, 0, 30, 15, 0.11);
    env(p, 0, 0.13, 0.17);
    env(p, T + 0.5, -0.1, 0.18);
    const bob = h > 0.9 ? Math.sin(t * 2.4) * 0.5 : 0;
    const z = (T + 0.5) * 2 + k * 9 + bob;
    if (k > 0.05) p.guide([[0, 0, z], [0, 0, (T + 0.5) * 2]], true);
    env(p, z, 0.02 + k * 0.1, 0.22);
    const b = cl((h - 0.62) / 0.38);
    if (b > 0) {
      const pop = b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35);
      tick(p, [X - 1, -Y + 1, z + T + 4], 4.8 * pop);
    }
  },
};
