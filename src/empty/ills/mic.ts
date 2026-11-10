// No recordings: a studio microphone on a stand, a level meter beside it rising and falling.
import { pulse, SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const MZ = 15; // where the microphone's body starts

export const mic: Illustration = {
  k: "mic", name: "Microphone", title: "No recordings", body: "Press record and your takes will be saved here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(-4, 3, -15);
    p.scale(0.93, [0, 0, 15]);
    p.shadow(2, -2, 25, 11, 0.11);
    const w = (Math.PI * 2) / P;
    const lvl = pulse(t, P, 0.25); // the take swells and dies away

    // ── the stand: a round foot, a pole, a clip
    p.push(); p.translate(-7, -7, 0);
    p.cylinder(0, 0, 0, 6, 1.6, { top: 0.22, side: 0.12 });
    p.cylinder(0, 0, 1.6, 1, MZ - 3, { top: 0.2, side: 0.2 });
    p.cylinder(0, 0, MZ - 3.4, 2, 2, { top: 0.22, side: 0.12 });
    // ── the microphone: a body, a band, then a round grille head
    const R = 4.4;
    p.cylinder(0, 0, MZ - 1.4, R - 0.6, 1.4, { top: 0.2, side: 0.1 });
    p.cylinder(0, 0, MZ, R, 6.5, { top: 0.2, side: 0.17 });
    p.cylinder(0, 0, MZ + 6.5, R + 0.5, 1.4, { top: 0.24, side: 0.22 });
    const top = MZ + 7.9, col = 4.6;
    p.cylinder(0, 0, top, R, col, { top: 0.12, side: 0.12, edge: 0 });
    for (let i = 0; i < 8; i++) {
      const z0 = (i / 8) * R, z1 = ((i + 1) / 8) * R;
      p.cylinder(0, 0, top + col + z0, Math.sqrt(R * R - z0 * z0), z1 - z0 + 0.01, { top: 0.2 + 0.04 * (i / 8), side: 0.12, edge: 0 });
    }
    // the grille: rings cut round the front of the head
    for (let i = 0; i < 6; i++) {
      const z = top + 1 + i * 1.5, r = z <= top + col ? R : Math.sqrt(Math.max(0, R * R - (z - top - col) ** 2));
      p.line(Array.from({ length: 13 }, (_, j) => { const a = -Math.PI / 4 + (Math.PI * j) / 12; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; }), SH.edge, 0.55);
    }
    // a small light on the body: on while the level is up
    const S = Math.SQRT1_2;
    p.dot([-R * S * 0.2 + R * S * 0.8, R * S * 0.2 + R * S * 0.6, MZ + 3.2], 0.8, 0.3 + 0.7 * lvl);
    const [hx, hy] = p.pt([0, 0, top + col * 0.6]);
    p.pop();
    // sound coming off the head
    if (lvl > 0.05) p.screen((g) => {
      g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const a = lvl * (1 - i * 0.28) * (0.75 + 0.25 * Math.sin(t * w * 2 - i));
        if (a < 0.1) continue;
        const n = Math.round(255 * Math.min(1, a));
        g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 0.9;
        g.beginPath(); g.arc(hx, hy, 7.5 + i * 3, -0.5, 0.5); g.stroke();
      }
    });

    // ── the level meter: a little panel whose columns light up with the take
    const mx = 7, my = -1, mw = 15, mh = 12.5;
    p.box(mx, my - 3, 0, mw, 3, mh, { top: 0.22, left: 0.14, right: 0.07 });
    p.face([[mx + 1, my + 0.02, 1], [mx + mw - 1, my + 0.02, 1], [mx + mw - 1, my + 0.02, mh - 1], [mx + 1, my + 0.02, mh - 1]], 0.02, SH.edge, 0.5);
    const shape = [0.6, 1, 0.8, 0.5];
    for (let i = 0; i < 4; i++) {
      const wob = 0.8 + 0.2 * Math.sin(t * w * 3 + i * 1.7);
      const lit = lvl * shape[i] * wob * 5.2;
      for (let j = 0; j < 5; j++) {
        const on = Math.max(0, Math.min(1, lit - j));
        if (on < 0.05) continue;
        const x0 = mx + 1.6 + i * 3.1, z0 = 1.8 + j * 2;
        p.face([[x0, my + 0.04, z0], [x0 + 2.4, my + 0.04, z0], [x0 + 2.4, my + 0.04, z0 + 1.4], [x0, my + 0.04, z0 + 1.4]], 0.1 + 0.35 * on, 0);
      }
    }
  },
};
