// Camera tripod: a tripod on three thick legs with a clear camera on top, its lens to us. Hover and the centre column raises the camera, then the flash fires.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const AZ = 21, FR = 13.5; // the apex height, how far the feet stand out
// a leg from the apex to its foot: a thick upper tube, a thinner lower one, a collar between
function leg(p: Pen, dir: number, tone: number) {
  const f: V3 = [Math.cos(dir) * FR, Math.sin(dir) * FR, 0];
  const at = (k: number, w: number): V3 => [f[0] * k + w * 0.58, f[1] * k - w * 0.58, AZ * (1 - k)];
  p.face([at(0, -2.2), at(0, 2.2), at(0.56, 2.2), at(0.56, -2.2)], tone, 0);
  p.face([at(0.56, -1.5), at(0.56, 1.5), at(1, 1.5), at(1, -1.5)], tone, 0);
  p.line([at(0.56, -2.4), at(0.56, 2.4)], SH.edge, 0.9);
  p.disc(f[0], f[1], 0.05, 2.6, tone, 0);
}

export const tripod: Illustration = {
  k: "tripod", name: "Camera tripod", title: "No shoots planned", body: "Plan a shoot and it will be listed here with its date and place.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const up = 3 * ease(clamp(h / 0.55)), fl = clamp((h - 0.62) / 0.38);
    p.translate(0, 0, -15);
    p.scale(0.92);
    p.shadow(0, 0, 18, 9, 0.12);
    // the two back legs, then the head, the column and the front leg
    leg(p, Math.PI * 0.25 + (Math.PI * 2) / 3, 0.3);
    leg(p, Math.PI * 0.25 - (Math.PI * 2) / 3, 0.2);
    p.box(-0.9, -0.9, AZ, 1.8, 1.8, 4.6 + up, { top: 0.2, left: 0.3, right: 0.1, edge: 0 });
    leg(p, Math.PI * 0.25, 0.3);
    p.box(-2.3, -2.3, AZ - 0.6, 4.6, 4.6, 2.6, { top: 0.2, left: 0.3, right: 0.1, edge: 0 });
    p.line([[-2.3, 2.33, AZ - 0.6], [2.33, 2.33, AZ - 0.6], [2.33, -2.3, AZ - 0.6]], SH.edge, 0.7);
    // the camera, turned to face us
    p.translate(0, 0, AZ + 4.6 + up);
    p.rotate("z", -0.62);
    const W = 9, D = 3.4, H = 11;
    p.box(-4.4, -D, H, 7, D * 2, 2.6, { top: 0.14, left: 0.3, right: 0.05, edge: 0 }); // the viewfinder hump
    p.box(4.6, -1.4, H, 2.4, 2.8, 1.2, { top: 0.3, left: 0.3, right: 0.1, edge: 0 }); // the shutter button
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.13, left: 0.3, right: 0.05, edge: 0 });
    p.line([[-W, D + 0.03, H], [W, D + 0.03, H]], SH.edge, 0.6);
    p.line([[-W, D + 0.03, 0], [W, D + 0.03, 0]], SH.edge, 0.6);
    // the lens: a dark mount, a barrel toward us, a bright rim round dark glass
    const ring = (y: number, r: number): V3[] => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [-1 + Math.cos(a) * r, y, 5.3 + Math.sin(a) * r] as V3; });
    p.clear(ring(D + 0.05, 5));
    for (let y = D + 0.4; y < D + 3.4; y += 0.4) p.face(ring(y, 4.2), 0.1, 0);
    p.face(ring(D + 3.4, 4.2), 0.3, 0);
    p.clear(ring(D + 3.43, 2.7));
    p.dot([-2, D + 3.5, 6.3], 0.8, 1);
    // the flash window, and the flash
    p.clear([[4.6, D + 0.03, 7.4], [7.6, D + 0.03, 7.4], [7.6, D + 0.03, 9.4], [4.6, D + 0.03, 9.4]]);
    if (fl > 0) {
      const [x, y] = p.pt([6.1, D + 0.1, 8.4]), r = 7 * Math.sin(fl * Math.PI), al = Math.sin(fl * Math.PI);
      p.screen((g) => {
        g.strokeStyle = `rgba(255,255,255,${al})`; g.fillStyle = `rgba(255,255,255,${al})`; g.lineWidth = 1.2; g.lineCap = "round";
        g.beginPath(); g.arc(x, y, r * 0.3, 0, Math.PI * 2); g.fill();
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }
      });
    }
  },
};
