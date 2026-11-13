// Nothing to buy: a vending machine with a tall glass window and a side panel. Hover and a coin drops into the slot, the display wakes and the lights come on over the empty shelves.
import { SH, type Illustration } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 9, D = 6.5, H = 31; // half width, half depth, height
const Y = D + 0.03; // just in front of the face

export const vendingmachine: Illustration = {
  k: "vendingmachine", name: "Vending machine", title: "Nothing to buy", body: "When products are stocked they will show up here, ready to pick.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.5)), lit = ease(Math.max(0, Math.min(1, (h - 0.45) / 0.4)));
    p.translate(0, 0, -16);
    p.shadow(0, 0, 24, 12, 0.12);
    p.rotate("z", -0.5); // turned so its front faces us
    // the cabinet: a lit top, a bright front, a sparse side
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.22, right: SH.right, edge: 0 });
    // the window: dark glass, shelves inside that brighten when the lights come on
    const x0 = -W + 1.6, x1 = 2.6;
    p.clear([[x0, Y, 9], [x1, Y, 9], [x1, Y, H - 2], [x0, Y, H - 2]]);
    for (const z of [12, 17.5, 23]) {
      p.face([[x0, Y + 0.01, z], [x1, Y + 0.01, z], [x1, Y + 0.01, z + 1], [x0, Y + 0.01, z + 1]], 0.14 + 0.3 * lit, 0);
      // the coils under each shelf: a row of small marks
      for (let i = 0; i < 4; i++) p.dot([x0 + 1.4 + i * 2.6, Y + 0.02, z + 2], 0.45, 0.25 + 0.6 * lit);
    }
    // a glint on the glass
    p.face([[x0 + 1, Y + 0.02, H - 4], [x0 + 2.2, Y + 0.02, H - 4], [x0 + 0.6, Y + 0.02, H - 9], [x0 - 0.6, Y + 0.02, H - 9]].map(([a, b, c]) => [Math.max(x0 + 0.2, a), b, c] as [number, number, number]), 0.12 + 0.3 * lit, 0);
    // the side panel: display, keypad and coin slot
    const px = 4.4;
    p.face([[px, Y, H - 6], [W - 1.4, Y, H - 6], [W - 1.4, Y, H - 3], [px, Y, H - 3]], 0.03 + 0.5 * lit, 0);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) p.dot([px + 0.8 + c * 1.4, Y + 0.02, H - 9 - r * 1.8], 0.45, 0);
    p.face([[px + 1.4, Y + 0.02, 13.4], [px + 2.4, Y + 0.02, 13.4], [px + 2.4, Y + 0.02, 16.4], [px + 1.4, Y + 0.02, 16.4]], 0.02, 0);
    // the pickup tray at the bottom, dark, with a lit flap
    p.clear([[x0, Y, 2.4], [W - 1.6, Y, 2.4], [W - 1.6, Y, 6.6], [x0, Y, 6.6]]);
    p.face([[x0, Y + 0.02, 4.6], [W - 1.6, Y + 0.02, 4.6], [W - 1.6, Y + 0.02, 6.6], [x0, Y + 0.02, 6.6]], 0.34, 0);
    // a coin drops into the slot
    if (k > 0 && k < 1) {
      const [cx, cy] = p.pt([px + 1.9, Y + 0.4, 15 + 9 * (1 - k)]);
      p.screen((g) => {
        g.globalAlpha = Math.min(1, (1 - k) * 4);
        g.beginPath(); g.ellipse(cx, cy, 1.4, 2.4, 0, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
      });
    }
    // the display blinks while the lights are on
    if (lit > 0.9) p.dot([px + 1.2, Y + 0.03, H - 4.5], 0.6, Math.sin(t * 6) > 0 ? 0 : 0.5);
  },
};
