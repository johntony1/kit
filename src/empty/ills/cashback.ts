// No cashback yet: a shopping bag with a percent sticker and an empty spot on the floor in front of it. Hover and a coin jumps out of the bag and lands on the spot with a bounce.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const BW = 8.5, BD = 5.5, BH = 19, CR = 4.4; // bag half width, half depth, height; coin radius
const LAND: V3 = [5, 16, 0];

// a handle: a band arching over the bag's rim in the plane y
function handle(p: Pen, y: number, fill: number) {
  const arc = (r: number): V3[] => Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI; return [Math.cos(a) * r, y, BH + Math.sin(a) * r * 1.25] as V3; });
  p.face([...arc(4.9), ...arc(3.7).reverse()], fill, SH.edge, 0.45);
}
function coin(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x + r * 0.16, y + r * 0.1, r, 0, Math.PI * 2); g.fillStyle = "rgb(70,70,70)"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineCap = "round"; g.lineWidth = 0.5;
    g.beginPath(); g.arc(x, y, r * 0.78, 0, Math.PI * 2); g.stroke();
    const s = r * 0.4;
    g.lineWidth = r * 0.15; g.beginPath();
    g.arc(x, y - s * 0.5, s * 0.5, -0.3, Math.PI * 0.5, true);
    g.arc(x, y + s * 0.5, s * 0.5, -Math.PI * 0.5, Math.PI - 0.3, false);
    g.moveTo(x, y - s * 1.35); g.lineTo(x, y + s * 1.35); g.stroke();
  });
}
// where the coin is at s (0 leaving the bag, 1 landed): an arc from the bag's mouth to the spot
const path = (s: number): V3 => [1 + (LAND[0] - 1) * s, LAND[1] * s, BH + 1 + (CR - BH - 1) * s + 15 * 4 * s * (1 - s) * (1 - 0.35 * s)];

export const cashback: Illustration = {
  k: "cashback", name: "Cashback", title: "No cashback yet", body: "Shop with your card and the money you earn back will land here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-2, -7, -9);
    p.shadow(1, 5, 28, 14, 0.1);
    // the spot the coin will land on
    p.disc(LAND[0], LAND[1], 0.02, CR + 0.6, 0.065, SH.edge);
    // the bag, open at the top, a handle behind and one in front
    handle(p, -BD, 0.1);
    p.box(-BW, -BD, 0, BW * 2, BD * 2, BH, { open: true });
    p.line([[BW + 0.03, 0, 0], [BW + 0.03, 0, BH]], SH.edge, 0.4); // the side fold
    handle(p, BD + 0.03, 0.3);
    // the sticker
    p.ringV("y", [0, BD + 0.04, 8.6], 4, 0.3, SH.edge, 0.55);
    p.line([[-1.6, BD + 0.07, 6.6], [1.6, BD + 0.07, 10.6]], SH.edge, 0.8);
    p.ringV("y", [-1.5, BD + 0.07, 10], 0.8, 0, SH.edge, 0.6); p.ringV("y", [1.5, BD + 0.07, 7.2], 0.8, 0, SH.edge, 0.6);
    // the coin: out of the bag, over in an arc, a bounce on the spot
    const k = clamp(h / 0.9);
    if (k > 0.02) {
      const s = Math.min(1, k / 0.62);
      // the trail it leaves
      for (let i = 1; i <= 9; i++) { const q = i / 10; if (q < s - 0.08) p.dot(path(q), 0.55, 1); }
      const at = path(s);
      if (k > 0.62) { const v = (k - 0.62) / 0.38; at[2] += v < 0.6 ? 3.6 * 4 * (v / 0.6) * (1 - v / 0.6) : 1 * 4 * ((v - 0.6) / 0.4) * (1 - (v - 0.6) / 0.4); }
      coin(p, at, CR * Math.min(1, 0.4 + s * 2));
    }
  },
};
