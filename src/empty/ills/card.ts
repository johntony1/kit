// Add a card: a new card slides out from under another and settles; the plus badge pulses.
import { type Illustration, type Pen, type V3 } from "../dots";

const PER = 3.2, CW = 11.5, CD = 7, CT = 1.3, RR = 1.8; // loop, half width, half depth, thickness

const backOut = (x: number) => { const c = 1.5; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function slide(u: number) {
  if (u < 0.06) return 0;
  if (u < 0.4) return backOut((u - 0.06) / 0.34);
  if (u < 0.8) return 1;
  if (u < 0.97) return 1 - ease((u - 0.8) / 0.17);
  return 0;
}

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number, halo: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    if (halo > 0) { g.beginPath(); g.arc(x, y, r + 1.2 + halo * 2.2, 0, Math.PI * 2); g.strokeStyle = `rgba(255,255,255,${0.55 * (1 - halo)})`; g.lineWidth = 0.7; g.stroke(); }
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// a rounded rectangle at height z
const rr = (cx: number, cy: number, z: number): V3[] => {
  const pts: V3[] = [];
  const corners: [number, number, number][] = [[cx + CW - RR, cy + CD - RR, 0], [cx - CW + RR, cy + CD - RR, 1], [cx - CW + RR, cy - CD + RR, 2], [cx + CW - RR, cy - CD + RR, 3]];
  for (const [x, y, q] of corners) for (let i = 0; i <= 4; i++) { const a = (q + i / 4) * Math.PI / 2; pts.push([x + Math.cos(a) * RR, y + Math.sin(a) * RR, z]); }
  return pts;
};

function plate(p: Pen, cx: number, cy: number, z: number, top: number) {
  // the slab: the bottom outline as the card's edge, then the top
  p.face(rr(cx, cy, z), 0.22, 1, 0.55);
  p.face(rr(cx, cy, z + CT), top, 1, 0.6);
  const zt = z + CT + 0.02;
  // chip
  p.face([[cx - CW + 2.6, cy - 4.4, zt], [cx - CW + 6.8, cy - 4.4, zt], [cx - CW + 6.8, cy - 1.2, zt], [cx - CW + 2.6, cy - 1.2, zt]], 0.5, 1, 0.45);
  // number groups and the name line
  for (let i = 0; i < 4; i++) p.line([[cx - CW + 2.6 + i * 4.8, cy + 1.8, zt], [cx - CW + 5.8 + i * 4.8, cy + 1.8, zt]], 0.75, 0.7);
  p.line([[cx - CW + 2.6, cy + 4.4, zt], [cx - CW + 9.5, cy + 4.4, zt]], 0.45, 0.6);
}

export const card: Illustration = {
  k: "card", name: "Add card", title: "No cards yet", body: "Add a debit or credit card to pay faster next time.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PER) / PER;
    const s = slide(u);
    p.translate(-2, -4, -4);
    p.shadow(2, 4, 26, 13, 0.1);
    // the new card: starts tucked under the first and slides out toward us
    const nx = 4 * s, ny = 10 * s;
    plate(p, nx, ny, 0, 0.2);
    // the card already there, raised a little
    plate(p, -1, -2, 5, 0.15);
    // the plus badge sits on the new card's corner, pops in, then pulses
    const on = Math.min(1, Math.max(0, (s - 0.55) / 0.45));
    if (on > 0) {
      const v = u > 0.42 && u < 0.8 ? ((u - 0.42) / 0.19) % 1 : 0; // two pulses while it rests
      const beat = Math.sin(v * Math.PI);
      badge(p, [nx + CW - 2, ny + CD - 1, CT + 5], 4.4 * on * (1 + 0.12 * beat), v);
    }
  },
};
