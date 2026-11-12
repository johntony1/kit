// Nothing to sign: a signature slip with a cross and a line, and a pen. The pen writes a signature along the line, lifts away, and the ink runs out again from the start.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const P = 3.8;
const Z = 1.83;
/** the signature, s 0..1 along it */
const sig = (s: number): V3 => [-9.5 + s * 21 + Math.sin(s * 17) * 1.1, 1.6 - Math.sin(s * 12.5 + 0.4) * 3 * (1 - 0.5 * s) - 0.8, Z];

export const esign: Illustration = {
  k: "esign", name: "Signature", title: "Nothing to sign", body: "Documents that need your signature will be waiting for you here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // written up to k1; then wiped from the start up to k0 while the pen goes home
    const k1 = Math.min(1, u / 0.58), k0 = easeInOut(Math.max(0, (u - 0.78) / 0.2));
    const home = easeInOut(Math.max(0, Math.min(1, (u - 0.64) / 0.34)));
    p.translate(0, 0, -9);
    p.shadow(0, 0, 40, 19, 0.11);
    // the slip
    p.box(-18, -10, 0, 36, 20, 1.8, { top: 0.21, left: 0.13, right: 0.065, lw: 0.6 });
    p.line([[-14.5, 5.4, Z], [14.5, 5.4, Z]], SH.edge, 0.6);
    p.line([[-15, 0.4, Z], [-12.6, 3.2, Z]], SH.edge, 0.8); p.line([[-12.6, 0.4, Z], [-15, 3.2, Z]], SH.edge, 0.8);
    if (k1 > k0 + 0.01) {
      const n = Math.max(2, Math.round((k1 - k0) * 70));
      p.line(Array.from({ length: n + 1 }, (_, i) => sig(k0 + ((k1 - k0) * i) / n)), SH.edge, 1.1);
    }
    // the pen: flat to the screen, leaning away to the right, its nib on the line while it writes
    const a = sig(k1), b = sig(0);
    const tip: V3 = [a[0] + (b[0] - a[0]) * home, a[1] + (b[1] - a[1]) * home, Z + Math.sin(home * Math.PI) * 7];
    const [tx, ty] = p.pt(tip), [ex, ey] = p.pt([tip[0] + 6.5, tip[1] - 6.5, tip[2] + 15.5]);
    const len = Math.hypot(ex - tx, ey - ty), dx = (ex - tx) / len, dy = (ey - ty) / len, nx = -dy, ny = dx, w = 2.3;
    const at = (d: number, s: number): [number, number] => [tx + dx * d + nx * s, ty + dy * d + ny * s];
    p.screen((c) => {
      const poly = (pts: [number, number][]) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
      c.lineJoin = "round";
      // the barrel
      poly([at(5.4, -w), at(len - 1, -w), at(len, -w * 0.5), at(len, w * 0.5), at(len - 1, w), at(5.4, w)]);
      c.fillStyle = "#fff"; c.fill(); c.strokeStyle = "#000"; c.lineWidth = 0.5; c.stroke();
      // the nib
      poly([at(0, 0), at(5.4, -w * 0.8), at(5.4, w * 0.8)]);
      c.fillStyle = "#000"; c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 0.7; c.stroke();
      // a band and the clip
      c.strokeStyle = "#000"; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(...at(len * 0.62, -w)); c.lineTo(...at(len * 0.62, w)); c.stroke();
      c.beginPath(); c.moveTo(...at(len * 0.66, w * 0.3)); c.lineTo(...at(len - 2, w * 0.3)); c.stroke();
    });
  },
};
