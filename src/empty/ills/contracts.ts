// No contracts yet: a contract leaning on its stand, a folded corner and two empty signature lines at the foot. Hover and both parties sign, one after the other, and a tick pops on the corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const BX = 11.5, BY = 15;

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}
/** a signature: a looping scribble from x0, drawn as far as k */
function sign(p: Pen, x0: number, y: number, z: number, len: number, k: number) {
  if (k <= 0) return;
  const n = Math.max(2, Math.round(26 * k));
  p.line(Array.from({ length: n }, (_, i) => { const s = i / 25; return [x0 + s * len + Math.sin(s * 15) * 0.5, y - 1.5 - Math.sin(s * 11 + 0.6) * 1.2 * (1 - s * 0.5), z] as V3; }), SH.edge, 0.8);
}

export const contracts: Illustration = {
  k: "contracts", name: "Contract", title: "No contracts yet", body: "Draft a contract or upload one, and it will be kept here with its signatures.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 2, -12);
    p.shadow(0, 0.5, 28, 14, 0.12);
    // a stand behind, then the pages leaning back on it
    p.box(-6, -BY * 0.86 - 1.5, 0, 12, 1.5, 10.4, { top: 0.2, left: 0.12, right: 0.065 });
    p.rotate("x", -0.42, [0, BY, 0]);
    p.push(); p.rotate("z", 0.07);
    p.box(-BX + 0.6, -BY + 0.8, 0, BX * 2, BY * 2, 0.5, { top: 0.1, left: 0.12, right: 0.065 });
    p.pop();
    p.box(-BX, -BY, 0.5, BX * 2, BY * 2, 0.6, { top: 0.21, left: 0.13, right: 0.065, lw: 0.6 });
    const z = 1.14;
    // the folded corner
    p.face([[BX - 5, -BY, z], [BX, -BY, z], [BX, -BY + 5, z]], 0.03, 0);
    p.face([[BX - 5, -BY, z + 0.02], [BX, -BY + 5, z + 0.02], [BX - 5, -BY + 5, z + 0.02]], 0.32, SH.edge, 0.5);
    // the title and the clauses
    p.line([[-8, -10.6, z], [1.5, -10.6, z]], SH.edge, 1.4);
    [-6.4, -3.8, -1.2, 1.4].forEach((y, i) => p.line([[-8, y, z], [i === 3 ? 2 : 8, y, z]], SH.edge, 0.55));
    // two signature lines, a cross to sign at on each
    for (const x of [-8.4, 1.6]) {
      p.line([[x, 9.6, z], [x + 6.8, 9.6, z]], SH.edge, 0.6);
      p.line([[x, 11.2, z], [x + 3, 11.2, z]], SH.edge, 0.45);
    }
    sign(p, -8, 9.6, z, 6, ease(Math.min(1, h / 0.42)));
    sign(p, 2, 9.6, z, 6, ease(Math.max(0, Math.min(1, (h - 0.36) / 0.42))));
    const b = Math.max(0, (h - 0.74) / 0.26);
    if (b > 0) tick(p, [BX + 1, 3, z + 2.5], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
