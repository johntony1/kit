// No withdrawals yet: a cash machine with a screen, a keypad shelf and a cash slot. Hover and a banknote feeds out of the slot; the screen shows a tick.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const F = 6.03; // the front wall

export const atm: Illustration = {
  k: "atm", name: "ATM", title: "No withdrawals yet", body: "Cash you take out at a machine will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(1, -3, -17);
    p.shadow(0, 4, 27, 13, 0.1);
    p.rotate("z", -0.32);
    // the cabinet, on a plinth
    p.box(-10.5, -7.5, 0, 21, 14.5, 1.6, { edge: 0 });
    p.box(-9.5, -7, 1.6, 19, 13, 31.4, { left: 0.085 });
    // the header strip
    p.line([[-9.5, F, 29.6], [9.5, F, 29.6]], SH.edge, 0.55);
    // the screen: lit, a couple of lines at rest, a tick once the cash is out
    const done = clamp((h - 0.7) / 0.3);
    p.face([[-6.5, F, 18], [6.5, F, 18], [6.5, F, 27.4], [-6.5, F, 27.4]], 0.36 + 0.1 * done, SH.edge, 0.6);
    if (done > 0.05) {
      const k = ease(done), a: V3 = [-3, F + 0.03, 22.6], b: V3 = [-0.8, F + 0.03, 20.4], c: V3 = [3.4, F + 0.03, 25.2];
      const k1 = Math.min(1, k / 0.4), k2 = clamp((k - 0.4) / 0.6);
      p.line([a, [a[0] + (b[0] - a[0]) * k1, a[1], a[2] + (b[2] - a[2]) * k1]], 0.02, 1.3);
      if (k2 > 0) p.line([b, [b[0] + (c[0] - b[0]) * k2, b[1], b[2] + (c[2] - b[2]) * k2]], 0.02, 1.3);
    } else {
      p.line([[-4.6, F + 0.03, 24.6], [1.5, F + 0.03, 24.6]], 0.02, 0.9);
      p.line([[-4.6, F + 0.03, 22.2], [3.6, F + 0.03, 22.2]], 0.02, 0.7);
      p.line([[-4.6, F + 0.03, 20.2], [-0.5, F + 0.03, 20.2]], 0.02, 0.7);
    }
    // the card slot and its light
    p.line([[2.6, F, 16.2], [7, F, 16.2]], SH.edge, 1.1);
    p.dot([-6, F + 0.05, 16.2], 0.7, h > 0.05 && h < 0.95 && Math.sin(t * 13) > 0 ? 1 : 0.4);
    // the cash slot, dark
    p.clear([[-7, F, 5.4], [7, F, 5.4], [7, F, 7.6], [-7, F, 7.6]]);
    p.line([[-7, F, 7.6], [7, F, 7.6]], SH.edge, 0.6);
    // the banknote feeding out
    const k = ease(clamp(h / 0.72)), L = 1.2 + 9.8 * k;
    if (k > 0.01) {
      const z = (y: number) => 6.3 - 0.022 * (y - 6) * (y - 6); // a slight droop
      const N = (x: number, y: number): V3 => [x, 6 + y, z(6 + y)];
      p.face([N(-5.4, 0), N(5.4, 0), N(5.4, L * 0.5), N(5.4, L), N(-5.4, L), N(-5.4, L * 0.5)], 0.3, SH.edge, 0.6);
      if (L > 7) {
        const cy = L - 5.2;
        p.line(Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return N(Math.cos(a) * 1.9, cy + Math.sin(a) * 1.9); }), SH.edge, 0.6);
        p.line([N(-4.3, L - 1.3), N(-2.6, L - 1.3)], SH.edge, 0.6);
        p.line([N(2.6, L - 1.3), N(4.3, L - 1.3)], SH.edge, 0.6);
      }
    }
    // the keypad shelf
    p.box(-9.5, 6, 10.4, 19, 4.6, 3.4);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) p.dot([-4.8 + i * 2.1, 7.1 + j * 1.25, 13.83], 0.42, 1);
    p.face([[4.4, 7, 13.83], [7.6, 7, 13.83], [7.6, 9.6, 13.83], [4.4, 9.6, 13.83]], 0.34, SH.edge, 0.45);
  },
};
