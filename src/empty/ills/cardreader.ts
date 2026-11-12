// Hand and card: a chunky payment terminal seen from the front, a dark display over twelve keys, a bank card standing in the slot on top. Hover and the card pushes in, then a tick shows on the display.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 12.4, D = 3.6, H = 33, F = D + 0.03; // half width, half depth, height, the front plane
const CW = 8.6; // half the card's width

export const cardreader: Illustration = {
  k: "cardreader", name: "Hand and card", title: "No cards on file", body: "Add a card to pay faster next time. It will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h * 1.6));
    p.translate(0, 0, -21);
    p.shadow(0, 0, 22, 10, 0.11);
    p.rotate("z", -0.62); // turned so its front faces us
    // the body: a tall block, lit front, a slot along its top
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.065, left: 0.22, right: 0.065, edge: 0 });
    p.clear([[-CW - 1, -0.9, H + 0.02], [CW + 1, -0.9, H + 0.02], [CW + 1, 0.9, H + 0.02], [-CW - 1, 0.9, H + 0.02]]);
    // the card in the slot: a bright card with a dark chip; it pushes in on hover
    const top = H + 16 - 5.5 * k;
    const card: V3[] = [[-CW, 0, H], [CW, 0, H], [CW, 0, top - 1.4], [CW - 1.4, 0, top], [-CW + 1.4, 0, top], [-CW, 0, top - 1.4]];
    p.face(card, 0.3, 0);
    p.clear([[-5.8, 0.02, top - 7.4], [-1.6, 0.02, top - 7.4], [-1.6, 0.02, top - 3.6], [-5.8, 0.02, top - 3.6]]);
    // the display
    p.clear([[-8.6, F, 23.5], [8.6, F, 23.5], [8.6, F, 30.5], [-8.6, F, 30.5]]);
    // the keypad: a dark well with twelve separate bright keys
    p.clear([[-9.4, F, 2.2], [9.4, F, 2.2], [9.4, F, 20.8], [-9.4, F, 20.8]]);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const x = -8.2 + c * 5.9, z = 3.3 + r * 4.3;
      p.face([[x, F + 0.02, z], [x + 4.6, F + 0.02, z], [x + 4.6, F + 0.02, z + 3.1], [x, F + 0.02, z + 3.1]], 0.3, 0);
    }
    // on the display: a waiting bar at rest, a tick once the card is in
    const b = Math.max(0, (h - 0.55) / 0.45);
    const q = ([[-6, 27], [0, 27], [-3.6, 27.2], [-1, 24.9], [4, 29.3]] as [number, number][]).map(([x, z]) => p.pt([x, F + 0.03, z]));
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 1.5;
      if (b < 1) { g.strokeStyle = `rgba(255,255,255,${1 - b})`; g.beginPath(); g.moveTo(q[0][0], q[0][1]); g.lineTo(q[1][0], q[1][1]); g.stroke(); }
      if (b > 0) { g.strokeStyle = `rgba(255,255,255,${b})`; g.lineWidth = 1.7; g.beginPath(); g.moveTo(q[2][0], q[2][1]); g.lineTo(q[3][0], q[3][1]); g.lineTo(q[4][0], q[4][1]); g.stroke(); }
    });
  },
};
