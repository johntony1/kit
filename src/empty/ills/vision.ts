// No images to read: a thick picture frame standing up, a mountain and a sun inside. Hover and detection boxes draw in around the sun and the peak, and a small tag pops onto the bigger one.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const W = 15, D = 2, H = 25; // half width, half depth, height of the frame
const B = 3; // the frame's border

export const vision: Illustration = {
  k: "vision", name: "Vision", title: "No images to read", body: "Add an image and we will describe what is in it and pick out the details.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 25, 10, 0.12);
    p.rotate("z", -0.62);
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.3, left: 0.26, right: 0.065, lw: 0.6 });
    const y = D + 0.04;
    const q = (pts: [number, number][], f: number, yy = y) => p.face(pts.map(([x, z]) => [x, yy, z] as V3), f, 0);
    // the picture: a black sky, one bold peak, a bright sun
    p.clear([[-W + B, y, B], [W - B, y, B], [W - B, y, H - B], [-W + B, y, H - B]]);
    q([[-W + B, B], [W - B, B], [W - B, 6.5], [-1, 17.5], [-W + B, 7]], 0.3, y + 0.03);
    p.line([[-W + B, y + 0.06, 7], [-1, y + 0.06, 17.5], [W - B, y + 0.06, 6.5]], SH.edge, 0.6);
    p.ringV("y", [6.5, y + 0.06, H - 8], 3, 0.4, 0);
    // detection boxes: white strokes that draw round from one corner
    const frame = (x0: number, z0: number, x1: number, z1: number, k: number) => {
      if (k <= 0) return;
      const pts = [p.pt([x0, y + 0.1, z0]), p.pt([x1, y + 0.1, z0]), p.pt([x1, y + 0.1, z1]), p.pt([x0, y + 0.1, z1])];
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineJoin = "round"; g.lineCap = "round";
        const order = [[3, 0], [0, 1], [1, 2], [2, 3]];
        const len = order.reduce((s, [a, b]) => s + Math.hypot(pts[b][0] - pts[a][0], pts[b][1] - pts[a][1]), 0);
        let left = len * k;
        g.beginPath(); g.moveTo(pts[3][0], pts[3][1]);
        for (const [a, b] of order) {
          const l = Math.hypot(pts[b][0] - pts[a][0], pts[b][1] - pts[a][1]), f = Math.min(1, left / l);
          if (f <= 0) break;
          g.lineTo(pts[a][0] + (pts[b][0] - pts[a][0]) * f, pts[a][1] + (pts[b][1] - pts[a][1]) * f);
          left -= l;
        }
        g.stroke();
      });
    };
    frame(-7.5, 12, 5, 20, ease(h * 1.6));
    frame(2.2, H - 12.5, 10.8, H - 3.8, ease((h - 0.3) * 2));
    // the tag on the peak's box: a bright chip with a dark mark
    const tg = ease((h - 0.65) / 0.3);
    if (tg > 0) {
      const x = -7.5, z = 20;
      p.face([[x, y + 0.12, z], [x + 6.5 * tg, y + 0.12, z], [x + 6.5 * tg, y + 0.12, z + 3.2], [x, y + 0.12, z + 3.2]], 1, 0);
      if (tg > 0.8) p.line([[x + 1.4, y + 0.14, z + 1.6], [x + 5, y + 0.14, z + 1.6]], SH.edge, 0.9);
    }
  },
};
