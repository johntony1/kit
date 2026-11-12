// No bills to split: a receipt with a dashed cut down its middle. Hover and it parts into two halves that drift apart, a person popping up over each.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 9.5, Z0 = 3, Z1 = 34;

// one half of the receipt: s is -1 for the left half, 1 for the right
function half(p: Pen, s: number) {
  const teeth: V3[] = [];
  for (let i = 0; i <= 5; i++) teeth.push([s * W * (1 - i / 5), 0, i % 2 ? Z0 + 1.1 : Z0]);
  p.face([[0, 0, Z1], [s * W, 0, Z1], ...teeth], 0.2, SH.edge, 0.6);
  const y = 0.03, x = (v: number) => s * v;
  p.line([[x(0.2), y, 30.4], [x(4.2), y, 30.4]], SH.edge, 1.1); // the heading runs across both
  for (let i = 0; i < 4; i++) {
    const z = 26 - i * 3.3;
    if (s < 0) p.line([[-7.2, y, z], [i % 2 ? -3.4 : -2.2, y, z]], SH.edge, 0.55); // what was ordered
    else p.line([[4.6, y, z], [7.4, y, z]], SH.edge, 0.55); // what it cost
  }
  for (let v = 1; v < 8; v += 1.9) p.line([[x(v), y, 12.6], [x(v + 0.9), y, 12.6]], SH.edge, 0.5);
  if (s < 0) p.line([[-7.2, y, 8.6], [-3.6, y, 8.6]], SH.edge, 1); else p.line([[3.4, y, 8.6], [7.4, y, 8.6]], SH.edge, 1);
}
// a small person: a head over shoulders, flat to the screen
function person(p: Pen, at: V3, r: number) {
  if (r < 0.2) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = "#fff";
    g.beginPath(); g.arc(x, y - r * 0.95, r * 0.62, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x, y + r * 0.95, r * 1.1, Math.PI, 0); g.closePath(); g.fill();
  });
}

export const splitbill: Illustration = {
  k: "splitbill", name: "Split bill", title: "No bills to split", body: "Add a bill and share it out between the people who owe a part.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -19);
    p.shadow(0, 0, 24, 11, 0.1);
    p.rotate("z", -0.58);
    const k = ease(clamp(h / 0.7));
    const bob = h > 0.7 ? Math.sin(t * 2.2) * 0.4 : 0;
    for (const s of [-1, 1]) {
      p.push();
      p.translate(s * 4.2 * k, 0, s * (-1.4 * k + bob));
      p.rotate("y", s * 0.13 * k, [0, 0, 18]);
      half(p, s);
      p.pop();
    }
    // the cut, before it parts
    if (k < 0.08) for (let z = Z0 + 1; z < Z1 - 0.5; z += 2.2) p.line([[0, 0.05, z], [0, 0.05, z + 1.1]], SH.edge, 0.7);
    // a person over each half
    const b = clamp((h - 0.62) / 0.38), pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
    person(p, [-9.6, 0, Z1 + 5.5], 3 * pop);
    person(p, [9.6, 0, Z1 + 3], 3 * pop);
  },
};
