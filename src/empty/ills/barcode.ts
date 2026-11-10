// Nothing scanned: a handheld scanner hovering over a parcel, its beam sweeping back and forth across the barcode label.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const BW = 10, BD = 8, BH = 10; // the parcel: half width, half depth, height
const LX = 7, LY = 5; // the label on its lid: half width, half depth
// the barcode's bars across the label: x position and weight
const BARS: [number, number][] = [[-4.8, 0.9], [-2.2, 0.55], [0.4, 0.9], [2.8, 0.55], [5, 0.8]];
// the scanner gun in profile (x along the barrel, z up), nose at the left, grip hanging under
const GUN: [number, number][] = [[-7, -1.2], [-4.2, 0], [0.6, 0], [2.4, -8.6], [6.4, -8.6], [5, -0.2], [6.6, 0.8], [6.6, 4], [5.2, 5], [-4.2, 4.6], [-7, 5.6]];
const GT = 2.2; // half thickness of the gun

// the gun as a thick profile in the plane y = 0, turned by a around y (nose dipping as a < 0)
function gun(p: Pen, a: number) {
  const c = Math.cos(a), s = Math.sin(a), n = GUN.length;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = GUN[i], [x1, z1] = GUN[(i + 1) % n];
    let nx = z1 - z0, nz = -(x1 - x0); // outward: the outline runs counter clockwise
    const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    const wx = c * nx + s * nz, wz = -s * nx + c * nz;
    if (wx + wz <= 0.02) continue;
    p.face([[x0, -GT, z0], [x1, -GT, z1], [x1, GT, z1], [x0, GT, z0]], wz > wx ? 0.22 : SH.right, 0);
  }
  p.face(GUN.map(([x, z]) => [x, GT, z] as V3), 0.25, 0);
  const f = GT + 0.04;
  p.line([[-6.2, f, -0.4], [-6.2, f, 4.8]], SH.edge, 0.9); // the window at the nose
  p.line([[-3, f, 2.4], [3.6, f, 2.4]], SH.edge, 0.6); // a seam down the barrel
  p.line([[1.8, f, -2.2], [3.2, f, -3]], SH.edge, 0.75); // the trigger
  p.line([[3.4, f, -5.4], [5.4, f, -5.4]], SH.edge, 0.55); // grip ridges
  p.line([[3.2, f, -6.8], [5.2, f, -6.8]], SH.edge, 0.55);
}

export const barcode: Illustration = {
  k: "barcode", name: "Barcode scanner", title: "Nothing scanned", body: "Scan an item's barcode and it will be added to the list here.",
  kind: "loop", period: 2.4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const s = Math.sin((Math.PI * 2 * t) / 2.4);
    const ys = s * (LY - 1.2); // where the beam crosses the label
    p.translate(-1, 0, -14);
    p.shadow(0, 0, 24, 12, 0.12);
    // the parcel, a strip of tape and the label on its lid
    p.box(-BW, -BD, 0, BW * 2, BD * 2, BH, { top: SH.right, left: 0.2, right: 0.11 });
    p.line([[-BW, BD, BH], [BW, BD, BH], [BW, -BD, BH]], SH.edge, 0.55);
    p.line([[-BW, 0, BH + 0.02], [-LX - 0.8, 0, BH + 0.02]], SH.edge, 0.6);
    p.line([[LX + 0.8, 0, BH + 0.02], [BW, 0, BH + 0.02], [BW, 0, BH - 4]], SH.edge, 0.6);
    p.line([[-LX - 0.6, -LY - 0.6, BH + 0.03], [LX + 0.6, -LY - 0.6, BH + 0.03], [LX + 0.6, LY + 0.6, BH + 0.03], [-LX - 0.6, LY + 0.6, BH + 0.03], [-LX - 0.6, -LY - 0.6, BH + 0.03]], SH.edge, 0.55);
    p.face([[-LX, -LY, BH + 0.04], [LX, -LY, BH + 0.04], [LX, LY, BH + 0.04], [-LX, LY, BH + 0.04]], 0.3, 0);
    for (const [x, w] of BARS) p.line([[x, -LY + 0.9, BH + 0.05], [x, LY - 0.9, BH + 0.05]], SH.edge, w);
    // where the scanner sits, and where its nose window points from
    const g: V3 = [6, -4, 27];
    const tilt = -0.95 + 0.06 * s;
    p.push(); p.translate(g[0], g[1], g[2]); p.rotate("y", tilt);
    const [nx, ny] = p.pt([-6.9, GT * 0.2, 2]);
    p.pop();
    // the beam: a faint fan from the nose to a bright line across the label
    const a = p.pt([-LX - 0.4, ys, BH + 0.06]), b = p.pt([LX + 0.4, ys, BH + 0.06]);
    p.screen((c) => {
      const gr = c.createLinearGradient(nx, ny, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      gr.addColorStop(0, "rgba(255,255,255,0.85)"); gr.addColorStop(0.75, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0.3)");
      c.fillStyle = gr;
      c.beginPath(); c.moveTo(nx - 1.2, ny - 1); c.lineTo(nx + 1.2, ny + 1); c.lineTo(b[0], b[1]); c.lineTo(a[0], a[1]); c.closePath(); c.fill();
    });
    // where the beam lands it cuts a crisp line across the bars, running out past the label
    p.line([[-LX - 1.4, ys, BH + 0.07], [LX + 1.4, ys, BH + 0.07]], SH.edge, 1.15);
    // the scanner, rocking a little with its sweep
    p.push(); p.translate(g[0], g[1], g[2]); p.rotate("y", tilt);
    gun(p, tilt);
    // its light, blinking: still looking
    if (s > 0.5) p.dot([1.4, GT + 0.1, 3.6], 0.7, 1);
    p.pop();
  },
};
