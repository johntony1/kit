// No addresses saved: an address book standing upright, index tabs down its edge and a map pin on the cover. Hover and the pin lifts off the cover and hovers; a plus pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 9, D = 3, H = 25, F = D + 0.03;

/** a map pin's outline in the plane y: a round head and a point below it */
const pin = (cx: number, y: number, cz: number, r: number): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= 20; i++) { const a = -0.5 + (i / 20) * (Math.PI + 1); pts.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  pts.push([cx, y, cz - r * 2.15]);
  return pts;
};

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const address: Illustration = {
  k: "address", name: "Address book", title: "No addresses saved", body: "Save an address and it will be ready to pick at checkout.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1, 0, -13.5);
    p.shadow(0, 1, 22, 11, 0.11);
    // the book: cover toward us, pages on the fore edge
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.06, right: 0.12, lw: 0.6 });
    for (const y of [-1.5, 0, 1.5]) p.line([[W + 0.03, y, 0.8], [W + 0.03, y, H - 0.8]], 0.4, 0.4);
    p.line([[-W + 1.2, -1, H + 0.02], [W, -1, H + 0.02]], 0.4, 0.4);
    p.line([[-W + 1.2, 1, H + 0.02], [W, 1, H + 0.02]], 0.4, 0.4);
    p.line([[-W + 2.6, F, 0], [-W + 2.6, F, H]], SH.edge, 0.5); // the spine fold
    // index tabs stepping down the fore edge
    for (let i = 0; i < 4; i++) p.box(W, -1.7, H - 5.4 - i * 5.3, 2, 3.4, 3.7, { top: 0.32, left: 0.26, right: 0.1 });
    // two address lines under the pin
    p.line([[-3.6, F, 5.2], [6.4, F, 5.2]], SH.edge, 0.8);
    p.line([[-3.6, F, 3], [3, F, 3]], SH.edge, 0.6);
    // the pin: printed on the cover at rest, lifting off on hover and leaving its outline
    const k = ease(clamp(h / 0.6));
    const cx = 1.4, cz = 16.4, r = 4.3;
    if (k > 0.02) { const o = pin(cx, F, cz, r); p.line([...o, o[0]], 0.5, 0.45); }
    const lift = 4.5 * k + h * Math.sin(t * 3) * 0.6;
    const body = pin(cx, F + 0.02 + 3.5 * k, cz + lift, r);
    p.face(body, 0.42, SH.edge, 0.7);
    p.dot([cx, F + 0.05 + 3.5 * k, cz + lift], 1.25, 0.02);
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [W + 3, -D, H + 2], 4.4 * pop);
    }
  },
};
