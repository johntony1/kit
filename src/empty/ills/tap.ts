// No contactless payments yet: a bank card standing on its edge, the contactless mark on its face. Hover and waves ripple out from it one after another, then a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const HW = 13, HH = 8.5, CZ = 14, SX = 5.5; // half width, half height, centre height, the mark's centre

const rrect = (y: number, r = 2): V3[] => {
  const pts: V3[] = [];
  const corners: [number, number, number][] = [[HW - r, HH - r, 0], [-HW + r, HH - r, 1], [-HW + r, -HH + r, 2], [HW - r, -HH + r, 3]];
  for (const [x, z, q] of corners) for (let i = 0; i <= 5; i++) { const a = ((q + i / 5) * Math.PI) / 2; pts.push([x + Math.cos(a) * r, y, CZ + z + Math.sin(a) * r]); }
  return pts;
};
const arc = (r: number, y: number, half: number, n = 12): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -half + (i / n) * half * 2; return [SX + Math.cos(a) * r, y, CZ + 1 + Math.sin(a) * r] as V3; });
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}

export const tap: Illustration = {
  k: "tap", name: "Contactless card", title: "No contactless payments yet", body: "Tap your card to pay and each payment will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-4, 0, -13);
    p.shadow(0, 0, 24, 11, 0.1);
    p.rotate("z", -0.58);
    p.push();
    p.translate(0, 0, h * (1.2 + Math.sin(t * 2.4) * 0.5));
    p.rotate("y", 0.1 - 0.06 * h, [0, 0, CZ]);
    // the card: its back edge, then its face
    p.face(rrect(-1.3), 0.1, SH.edge, 0.55);
    p.face(rrect(0), 0.2, SH.edge, 0.6);
    // chip, number and name
    p.face([[-9.5, 0.03, CZ + 0.5], [-5.3, 0.03, CZ + 0.5], [-5.3, 0.03, CZ + 3.8], [-9.5, 0.03, CZ + 3.8]], 0.5, SH.edge, 0.45);
    p.line([[-9.5, 0.06, CZ + 2.15], [-5.3, 0.06, CZ + 2.15]], SH.edge, 0.4);
    for (let i = 0; i < 4; i++) p.line([[-9.5 + i * 4.6, 0.03, CZ - 2.6], [-6.5 + i * 4.6, 0.03, CZ - 2.6]], SH.edge, 0.75);
    p.line([[-9.5, 0.03, CZ - 5.4], [-2.5, 0.03, CZ - 5.4]], SH.edge, 0.55);
    // the contactless mark
    for (const r of [1.5, 3, 4.5]) p.line(arc(r, 0.03, 0.85, 8), SH.edge, 0.75);
    // the waves leaving the card
    for (let i = 0; i < 3; i++) {
      const on = clamp((h - 0.12 - i * 0.18) / 0.2);
      if (on <= 0) continue;
      const r = 12.5 + i * 4.6 + (h > 0.9 ? Math.sin(t * 5 - i * 1.1) * 0.35 : 0) - (1 - ease(on)) * 3, w = 1.5 * ease(on);
      p.face([...arc(r, 0.4, 0.55), ...arc(r + w, 0.4, 0.55).reverse()], 0.9, 0);
    }
    p.pop();
    const b = clamp((h - 0.72) / 0.28);
    if (b > 0) badge(p, [HW - 1, 1, CZ - HH + 1], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
