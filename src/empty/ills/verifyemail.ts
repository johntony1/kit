// Check your inbox: a sealed envelope with an unread dot on its corner. Hover and it hops, and the dot grows into a tick badge.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 15, Y = 1.3, Z = 20, F = Y + 0.03;

// a round bright badge, flat to the screen; its dark tick shows once it is big enough
function badge(p: Pen, at: V3, r: number, mark: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 1.1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    if (mark <= 0) return;
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.45 + r * 0.33 * Math.min(1, mark * 2), y + r * 0.02 + r * 0.34 * Math.min(1, mark * 2));
    if (mark > 0.5) g.lineTo(x - r * 0.12 + r * 0.6 * (mark - 0.5) * 2, y + r * 0.36 - r * 0.68 * (mark - 0.5) * 2);
    g.stroke();
  });
}

export const verifyemail: Illustration = {
  k: "verifyemail", name: "Verify email", title: "Check your inbox", body: "We sent you a link. Open it to confirm your email address.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = cl(h / 0.5), hop = Math.sin(k * Math.PI) * 5 + h * (1 + Math.sin(t * 2.4) * 0.7);
    p.translate(0, 0, -12);
    p.shadow(0, 2, 25 - hop, 9, 0.12);
    p.rotate("z", -0.42);
    p.translate(0, 0, hop);
    p.rotate("y", 0.1 * Math.sin(k * Math.PI * 2), [0, 0, 0]);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.3, left: 0.2, right: 0.065, lw: 0.7 });
    // the flap's fold and the two seams running up from the bottom corners
    p.line([[-X, F, Z - 0.2], [0, F, Z - 11.5], [X, F, Z - 0.2]], SH.edge, 1.2);
    p.line([[-X, F, 0.2], [-4.2, F, Z - 8.4]], SH.edge, 0.9);
    p.line([[X, F, 0.2], [4.2, F, Z - 8.4]], SH.edge, 0.9);
    // the unread dot on the corner, growing into a tick badge
    const b = cl((h - 0.4) / 0.5), pop = b < 0.65 ? ease(b / 0.65) * 1.16 : 1.16 - 0.16 * ease((b - 0.65) / 0.35);
    badge(p, [X - 0.5, F + 0.6, Z - 0.5], 2.5 + 3.3 * pop, cl((b - 0.35) / 0.5));
    // sparks once it is verified
    const s = cl((h - 0.8) / 0.2);
    if (s > 0) ([[-X - 3, 0, Z + 5], [X + 6, 0, Z - 9], [X - 7, 0, Z + 9]] as V3[]).forEach((q, i) => p.dot(q, 0.8 + 0.4 * Math.sin(t * 3.2 + i * 2.1), s));
  },
};
