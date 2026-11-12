// TV remote: a slim remote lying down, a power button, a round pad and rows of keys. Hover and it tips up to aim, the power button lights and a signal goes out.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const L = 17, W = 5.4, TH = 3; // half length, half width, thickness
const disc = (x: number, y: number, z: number, r: number): V3[] => Array.from({ length: 24 }, (_, i) => [x + Math.cos((i / 24) * Math.PI * 2) * r, y + Math.sin((i / 24) * Math.PI * 2) * r, z] as V3);

export const remote: Illustration = {
  k: "remote", name: "TV remote", title: "Nothing to watch", body: "Add a show or a film to your list and it will be ready to play here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h / 0.6));
    p.translate(2, 0, -7);
    p.shadow(0, 0, 30, 13, 0.11);
    p.scale(1.18);
    p.push();
    p.rotate("y", 0.1 + 0.3 * k, [L, 0, 0]); // the far end lifts, hinged on the near end
    p.box(-L, -W, 0, L * 2, W * 2, TH, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    const z = TH + 0.03;
    // the power button: dark at rest, lit once it is aimed
    const on = h > 0.6;
    p.clear(disc(-13, 0, z, 2.1));
    if (on) p.face(disc(-13, 0, z + 0.02, 1.4), 0.4, 1, 0.5);
    // the round pad: a dark ring with a lit middle
    p.clear(disc(-5.4, 0, z, 4.1));
    p.face(disc(-5.4, 0, z + 0.02, 2.2), 0.24, 0);
    // rows of keys
    for (let i = 0; i < 4; i++) for (const y of [-2.5, 2.5]) p.clear(disc(2.4 + i * 3.6, y, z, 1.25));
    const tip = p.pt([-L, 0, TH / 2]), far = p.pt([-L - 10, 0, TH / 2]);
    p.pop();
    // the signal: arcs leaving the far end
    const s = Math.max(0, (h - 0.6) / 0.4);
    if (s > 0.03) {
      const ang = Math.atan2(far[1] - tip[1], far[0] - tip[0]);
      p.screen((g) => {
        g.lineCap = "round"; g.lineWidth = 1.2;
        for (let i = 0; i < 3; i++) {
          const a = s * (1 - i * 0.22) * (0.75 + 0.25 * Math.sin(t * 6 - i * 1.2));
          if (a < 0.1) continue;
          const n = Math.round(255 * Math.min(1, a));
          g.strokeStyle = `rgb(${n},${n},${n})`;
          g.beginPath(); g.arc(tip[0], tip[1], 4 + i * 3.4, ang - 0.6, ang + 0.6); g.stroke();
        }
      });
    }
  },
};
