// Nothing assigned: a big open box with a bold x on its front, empty. Hover and a value, a bright ball, drops into it with a bounce; an equals badge pops in.
import { type Illustration } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 12, H = 16; // half width, height

/** the ball's height above its rest: a drop, a bounce, a smaller bounce */
function drop(k: number) {
  if (k < 0.4) return 15 * (1 - Math.pow(k / 0.4, 2));
  if (k < 0.65) { const v = (k - 0.4) / 0.25; return 4.5 * 4 * v * (1 - v); }
  if (k < 0.82) { const v = (k - 0.65) / 0.17; return 1.4 * 4 * v * (1 - v); }
  return 0;
}

export const variable: Illustration = {
  k: "variable", name: "Variable", title: "Nothing assigned", body: "Give this variable a value and it will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 30, 14, 0.11);
    // the open box: dark inside, then a lit front, a shaded side and a bright rim round the top
    const R = 2.2, w = W - R;
    p.clear([[-w, -w, H], [w, -w, H], [w, w, H], [-w, w, H]]);
    p.face([[-w, -w, H - 7], [w, -w, H - 7], [w, -w, H], [-w, -w, H]], 0.045, 0);
    p.face([[-w, -w, H - 7], [-w, w, H - 7], [-w, w, H], [-w, -w, H]], 0.03, 0);
    p.face([[-W, W, 0], [W, W, 0], [W, W, H], [-W, W, H]], 0.3, 0);
    p.face([[W, -W, 0], [W, W, 0], [W, W, H], [W, -W, H]], 0.065, 0);
    const ring: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = ring[i], [c2, d2] = ring[(i + 1) % 4];
      p.face([[a * W, b * W, H], [c2 * W, d2 * W, H], [c2 * w, d2 * w, H], [a * w, b * w, H]], 0.3, 0);
    }
    // a bold x on the front, cut in dark
    const c = [p.pt([-6, W + 0.05, 3.2]), p.pt([5, W + 0.05, 12.8]), p.pt([5, W + 0.05, 3.2]), p.pt([-6, W + 0.05, 12.8])];
    p.screen((g) => {
      g.strokeStyle = "#000"; g.lineWidth = 3.4; g.lineCap = "round";
      g.beginPath(); g.moveTo(c[0][0], c[0][1]); g.lineTo(c[1][0], c[1][1]); g.moveTo(c[2][0], c[2][1]); g.lineTo(c[3][0], c[3][1]); g.stroke();
    });
    // the value drops in: drawn over the box until it sinks below the rim, then clipped to the opening
    const k = Math.min(1, h * 1.3);
    if (k > 0.01) {
      const r = 5.4, z = H - 3.5 + r + drop(k), a = Math.min(1, k / 0.12);
      const [x, y] = p.pt([0, 0, z]);
      const rim = [p.pt([-w, -w, H]), p.pt([w, -w, H]), p.pt([w, w, H]), p.pt([-w, w, H])];
      p.screen((g) => {
        g.beginPath();
        g.moveTo(rim[3][0], rim[3][1]); g.lineTo(rim[3][0], -999); g.lineTo(rim[1][0], -999); g.lineTo(rim[1][0], rim[1][1]); g.lineTo(rim[2][0], rim[2][1]); g.closePath();
        g.clip();
        g.beginPath(); g.arc(x, y, r * 1.2 * a, 0, Math.PI * 2); g.fillStyle = "rgb(118,118,118)"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = 0.8; g.stroke();
        g.beginPath(); g.arc(x - r * 0.4 * a, y - r * 0.4 * a, r * 0.34 * a, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
      });
    }
    // an equals badge, tight on the box's top left corner
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      const [x, y] = p.pt([-W, W, H + 5]);
      const r = 4.6 * pop;
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.24; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.45, y - r * 0.22); g.lineTo(x + r * 0.45, y - r * 0.22); g.moveTo(x - r * 0.45, y + r * 0.22); g.lineTo(x + r * 0.45, y + r * 0.22); g.stroke();
      });
    }
  },
};
