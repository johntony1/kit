// No PIN set: an upright PIN entry pad seen from the front, a dark screen with four empty dot rings over a 3 by 4 grid of round keys. Hover and four keys press in turn, a dot fills on the screen for each, then a tick badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const W = 12.6, D = 3.4, H = 38, F = D + 0.03; // half width, half depth, height, the front plane
const PRESS = [[0, 3], [2, 2], [1, 1], [1, 2]]; // the keys pressed, [col, row from the top]

function tickBadge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.32); g.stroke();
  });
}

export const pinpad: Illustration = {
  k: "pinpad", name: "PIN pad", title: "No PIN set", body: "Choose a four digit PIN to keep your account and your payments secure.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -21);
    p.shadow(0, 0, 22, 10, 0.11);
    p.rotate("z", -0.62); // turned so its front faces us
    // the body: a tall block with a lit front
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
    // the screen: a dark window with four dot rings
    p.clear([[-10, F, 29], [10, F, 29], [10, F, 35.4], [-10, F, 35.4]]);
    const ring = (x: number) => p.pt([x, F, 32.2]);
    const typed = PRESS.map((_, i) => clamp((h - 0.08 - i * 0.15) / 0.12));
    p.screen((g) => {
      [-5.4, -1.8, 1.8, 5.4].forEach((x, i) => {
        const [sx, sy] = ring(x);
        g.beginPath(); g.arc(sx, sy, 1.75, 0, Math.PI * 2);
        g.strokeStyle = "#fff"; g.lineWidth = 0.9; g.stroke();
        if (typed[i] > 0) { g.beginPath(); g.arc(sx, sy, 1.75 * ease(typed[i]), 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill(); }
      });
    });
    // the keys: twelve round dark keys; a pressed key lights up for a moment
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const cx = -7.2 + c * 7.2, cz = 23.5 - r * 6.4;
      const i = PRESS.findIndex(([pc, pr]) => pc === c && pr === r);
      const k = i < 0 ? 0 : clamp((h - 0.08 - i * 0.15) / 0.12);
      const down = Math.sin(k * Math.PI);
      p.ringV("y", [cx, F + 0.05, cz], 2.6, 0.02, 0);
      if (down > 0.05) p.ringV("y", [cx, F + 0.07, cz], 2.2 * down, 0.45, 0);
    }
    const b = clamp((h - 0.72) / 0.28);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      tickBadge(p, [W - 1, F, H + 1], 4.6 * pop);
    }
  },
};
