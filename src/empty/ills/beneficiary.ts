// Payee book: an address book standing up, a person on its cover and index tabs down its side. Hover and a payee card slides up out of the pages; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10, H = 26, Y0 = -3.6, Y1 = 3.6; // the book: half width, height, back and front

// a round bright badge with a dark plus, flat to the screen
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
// a head and shoulders on a plane facing +y, in a given fill
function person(p: Pen, x: number, y: number, z: number, s: number, fill: number) {
  p.ringV("y", [x, y, z + 6.2 * s], 2.9 * s, fill, 0);
  p.face(Array.from({ length: 17 }, (_, i) => { const b = (i / 16) * Math.PI; return [x + Math.cos(b) * 5.2 * s, y, z - 3.6 * s + Math.sin(b) * 5.4 * s] as V3; }), fill, 0);
}

export const beneficiary: Illustration = {
  k: "beneficiary", name: "Payee book", title: "No payees yet", body: "Add someone you pay often and their details will be saved here for next time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const up = 12 * ease(clamp(h / 0.66));
    p.translate(-1, 0, -17);
    p.shadow(0, 0, 20, 10, 0.12);
    p.rotate("z", -0.5); // turned to face us
    // the back half of the book
    p.box(-W, Y0, 0, W * 2, -Y0, H, { top: 0.2, left: 0.1, right: 0.065 });
    // the payee card, rising out of the middle
    p.box(-6.5, -0.2, H - 13 + up, 13, 0.6, 14, { top: 0.3, left: 0.26, right: 0.1 });
    person(p, -2.6, 0.45, H - 5.4 + up, 0.5, 0.03);
    p.line([[1.4, 0.45, H - 3.4 + up], [5, 0.45, H - 3.4 + up]], SH.edge, 0.9);
    p.line([[1.4, 0.45, H - 5.8 + up], [4, 0.45, H - 5.8 + up]], SH.edge, 0.7);
    // the front half and its cover
    p.box(-W, 0.5, 0, W * 2, Y1 - 0.5, H, { top: 0.2, left: 0.2, right: 0.065 });
    for (const y of [-2.4, -1.2, 1.6, 2.6]) p.line([[W + 0.03, y, 0.5], [W + 0.03, y, H]], SH.edge, 0.4); // page edges
    p.line([[-W, 0.2, H + 0.02], [W, 0.2, H + 0.02]], SH.edge, 0.7);
    const y = Y1 + 0.04;
    p.line([[-W + 2.6, y, 0], [-W + 2.6, y, H]], SH.edge, 0.8); // the spine's fold
    person(p, 1.3, y, 12.4, 1, 0.03);
    // the index tabs down the open side
    [19, 12.6, 6.2].forEach((z, i) => {
      p.box(W, -2.6 + i * 1.5, z, 2.2, 2.8, 4.6, { top: 0.22, left: 0.2, right: 0.13, lw: 0.5 });
      p.line([[W + 0.02, -2.6 + i * 1.5, z], [W + 0.02, 0.2 + i * 1.5, z], [W + 0.02, 0.2 + i * 1.5, z + 4.6]], SH.edge, 0.5);
    });
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) badge(p, [7.5, 0.5, H + up + 1.5], 4.8 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
