// Nothing packed: a tall canvas tote bag seen from the front, two long strap loops over its open top and a two tone base and a pocket on the front. Hover and it lifts and sways on its straps; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10, D = 3.4, H = 20, WB = 8.6; // WB: half width at the base // half width, half depth, height of the body
const FX = 5.6, FZ = H - 4.5, TOP = H + 12; // strap feet across, where they are sewn, top of the loop

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// a strap: a tall loop in the plane y = yy, a band of solid canvas, leaning out by `lean` around its feet
function strap(p: Pen, yy: number, z0: number, lean: number, fill: number) {
  const r1 = FX + 0.55, r0 = FX - 0.55, zc = TOP - FX, out: V3[] = [[r1, yy, z0]], inn: V3[] = [[r0, yy, z0]];
  for (let i = 0; i <= 20; i++) {
    const a = (Math.PI * i) / 20;
    out.push([Math.cos(a) * r1, yy, zc + Math.sin(a) * r1]);
    inn.push([Math.cos(a) * r0, yy, zc + Math.sin(a) * r0]);
  }
  out.push([-r1, yy, z0]); inn.push([-r0, yy, z0]);
  p.push();
  p.rotate("x", lean, [0, yy, z0]);
  p.face([...out, ...inn.reverse()], fill, 0);
  p.pop();
}

export const tote: Illustration = {
  k: "tote", name: "Tote bag", title: "Nothing packed", body: "Pick out a few things you like and they will be packed in here for you.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22 - 4 * k, 9 - 2 * k, 0.12 - 0.04 * k);
    p.rotate("z", -0.48); // turned so its front faces us and its side shows
    p.push();
    p.translate(0, 0, 3 * k);
    p.rotate("y", k * 0.08 * Math.sin(t * 3.2), [0, 0, TOP]);
    strap(p, -D + 0.4, H - 1, 0.22, 0.2); // the back strap, leaning back behind the mouth
    // the body: dark mouth, lit front, sparse narrow side
    p.face([[-W, -D, H], [W, -D, H], [W, D, H], [-W, D, H]], 0.02, 0);
    p.face([[WB, -D, 0], [WB, D, 0], [W, D, H], [W, -D, H]], SH.right, 0);
    p.face([[-WB, D, 0], [WB, D, 0], [W, D, H], [-W, D, H]], 0.24, 0);
    // the hem fold along the top, and a seam at the base
    p.line([[-W, D + 0.03, H - 2.4], [W, D + 0.03, H - 2.4]], SH.edge, 0.7);
    p.line([[W + 0.03, -D, H - 2.4], [W + 0.03, D, H - 2.4]], SH.edge, 0.5);
    // a two tone base band, and a patch pocket stitched on the front
    const wAt = (z: number) => WB + ((W - WB) * z) / H;
    p.face([[-WB, D + 0.04, 0], [WB, D + 0.04, 0], [wAt(5), D + 0.04, 5], [-wAt(5), D + 0.04, 5]], 0.07, 0);
    p.face([[WB + 0.03, -D, 0], [WB + 0.03, D, 0], [wAt(5) + 0.03, D, 5], [wAt(5) + 0.03, -D, 5]], 0.03, 0);
    p.line([[-3.6, D + 0.06, 13], [-3.6, D + 0.06, 7.4], [3.6, D + 0.06, 7.4], [3.6, D + 0.06, 13]], SH.edge, 0.7);
    strap(p, D + 0.1, FZ, -0.12, 0.4); // the front strap, sewn on below the hem, leaning toward us
    for (const s of [-1, 1]) p.line([[s * FX - 1.2, D + 0.1, FZ + 0.4], [s * FX + 1.2, D + 0.1, FZ + 0.4]], SH.edge, 0.6);
    p.pop();
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [W, D, H + 1], 4.2 * pop);
    }
  },
};
