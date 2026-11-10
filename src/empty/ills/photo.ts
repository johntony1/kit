// No photos: a picture frame on a stand, mountains inside. Hover and the sun rises over them, rays and all.
import { SH, type Illustration, type V3 } from "../dots";

const W = 13, FH = 21, B = 2.4, FY = 1.1; // half width, frame height, border, half depth
const Z0 = 2.2; // the frame sits in its stand

export const photo: Illustration = {
  k: "photo", name: "Picture frame", title: "No photos", body: "Upload a photo and it will appear here, ready to share.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 25, 11, 0.12);
    // the stand: a low block with a groove the frame sits in
    p.box(-W - 1.5, -3.6, 0, W * 2 + 3, 7.2, Z0, { top: 0.2, left: 0.12, right: 0.065 });
    p.push();
    p.rotate("x", 0.1, [0, 0, Z0]); // leaning back a little
    p.box(-W, -FY, Z0, W * 2, FY * 2, FH, { top: 0.2, left: 0.22, right: 0.065 });
    const fy = FY + 0.03, x0 = -W + B, x1 = W - B, z0 = Z0 + B, z1 = Z0 + FH - B;
    const win: V3[] = [[x0, fy, z0], [x1, fy, z0], [x1, fy, z1], [x0, fy, z1]];
    // a bevel line round the frame, then the picture: a night dark sky
    p.line([[-W + 0.9, fy, Z0 + 0.9], [W - 0.9, fy, Z0 + 0.9], [W - 0.9, fy, Z0 + FH - 0.9], [-W + 0.9, fy, Z0 + FH - 0.9], [-W + 0.9, fy, Z0 + 0.9]], SH.edge, 0.5);
    p.face(win, 0.02 + 0.015 * h, 0);
    const pic = win.map((v) => p.pt(v));
    p.screen((c) => {
      c.beginPath(); pic.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      // the sun, down behind the hills at rest, high in the sky when hovered
      const sz = z0 + 0.6 + h * 10.5, sx = 4.4;
      if (h > 0.3) {
        const k = Math.min(1, (h - 0.3) / 0.5), [ox, oy] = p.pt([sx, fy, sz]);
        const n = Math.round(255 * k);
        c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.4; c.lineCap = "round";
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 * i) / 8 + t * 0.35;
          c.beginPath(); c.moveTo(ox + Math.cos(a) * 5, oy + Math.sin(a) * 5); c.lineTo(ox + Math.cos(a) * (5 + 2.6 * k), oy + Math.sin(a) * (5 + 2.6 * k)); c.stroke();
        }
      }
      p.ringV("y", [sx, fy + 0.02, sz], 3.2, 0.3, 0);
      // the far peak, sparse, with a lit snow cap and a cut zigzag where the snow ends
      const pk: [number, number] = [-3.6, z1 - 2.2];
      p.face([[x0, fy + 0.04, z0], [x0, fy + 0.04, z0 + 3], [pk[0], fy + 0.04, pk[1]], [6.5, fy + 0.04, z0]], SH.right, 0);
      const cap: V3[] = [[-6.4, fy + 0.05, pk[1] - 4.6], [pk[0], fy + 0.05, pk[1]], [-0.6, fy + 0.05, pk[1] - 4.3], [-1.8, fy + 0.05, pk[1] - 3.4], [-3, fy + 0.05, pk[1] - 4.6], [-4.4, fy + 0.05, pk[1] - 3.4]];
      p.face(cap, 0.3, 0);
      p.line(cap.slice(2).concat([cap[0]]), SH.edge, 0.55);
      // the near hill, lit, its ridge cut out against the far peak
      const hill: V3[] = [[-2, fy + 0.06, z0], [6.4, fy + 0.06, z0 + 6.2], [x1, fy + 0.06, z0 + 3.8], [x1, fy + 0.06, z0]];
      p.face(hill, 0.24, 0);
      p.line(hill.slice(0, 3), SH.edge, 0.7);
    });
    p.line([...win, win[0]], SH.edge, 0.6);
    p.pop();
  },
};
