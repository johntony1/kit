// No videos: a screen with a play button. Hover and the button presses into the screen and a ripple runs out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 18, Y0 = -2.6, Z0 = 9, Z1 = 33; // half width, back of the screen, bottom and top

/** a bright ring standing in the screen's plane (+y), drawn straight on the canvas */
function glowRing(p: Pen, c: V3, r: number, a: number, lw = 0.9) {
  if (a < 0.04) return;
  const q = Array.from({ length: 49 }, (_, i) => { const u = (i / 48) * Math.PI * 2; return p.pt([c[0] + Math.cos(u) * r, c[1], c[2] + Math.sin(u) * r]); });
  p.screen((g) => {
    const n = Math.round(255 * Math.min(1, a));
    g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw;
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  });
}

export const video: Illustration = {
  k: "video", name: "Video screen", title: "No videos", body: "Upload or record a video and it will play right here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -18.5);
    p.shadow(0, 0, 25, 12, 0.12);
    // the foot and the neck behind the screen
    p.box(-8, -6, 0, 16, 9, 2, { top: 0.22, left: 0.13, right: 0.07 });
    p.box(-2, -4.6, 2, 4, 2, Z0 - 1, { top: 0.2, left: 0.12, right: 0.07 });
    // the screen: a thin slab whose front faces +y
    p.box(-X, Y0, Z0, X * 2, -Y0, Z1 - Z0, { top: 0.22, left: 0.13, right: 0.07 });
    // the glass, dark inside the bezel
    const gy = 0.03;
    p.face([[-X + 2, gy, Z0 + 3.2], [X - 2, gy, Z0 + 3.2], [X - 2, gy, Z1 - 2], [-X + 2, gy, Z1 - 2]], 0.02, SH.edge, 0.5);
    // a little light on the chin
    p.dot([X - 3.4, gy, Z0 + 1.5], 0.6, 0.9);
    // the progress bar, empty, with its knob at the start
    p.face([[-X + 4.5, gy, Z0 + 5.4], [X - 4.5, gy, Z0 + 5.4], [X - 4.5, gy, Z0 + 6.6], [-X + 4.5, gy, Z0 + 6.6]], 0.24, 0, 0.4);
    p.ringV("y", [-X + 5, gy + 0.02, Z0 + 6], 1.5, 0.4, 0, 0.4);

    // the play button: a raised triangle that presses into the glass on hover
    const cz = 22, cx = 0.6;
    const d = 2.8 * (1 - 0.85 * h); // how far it stands out
    const k = 1 - 0.08 * h; // it shrinks a touch as it goes in
    const A: [number, number] = [cx - 4.6 * k, cz - 6 * k], B: [number, number] = [cx - 4.6 * k, cz + 6 * k], C: [number, number] = [cx + 6 * k, cz];
    const at = ([x, z]: [number, number], y: number): V3 => [x, y, z];
    const yf = gy + d;
    // the sides that face us: the upper slope catches the light, the lower one sits in shade
    p.face([at(A, gy), at(C, gy), at(C, yf), at(A, yf)], 0.07, SH.edge, 0.5);
    p.face([at(B, gy), at(C, gy), at(C, yf), at(B, yf)], 0.2, SH.edge, 0.5);
    p.face([at(A, yf), at(B, yf), at(C, yf)], 0.32, SH.edge, 0.55);

    // ripples run out from the button once it is pressed
    const r = Math.max(0, (h - 0.6) / 0.4);
    if (r > 0) for (let i = 0; i < 3; i++) {
      const u = (t * 0.6 + i / 3) % 1;
      glowRing(p, [cx - 0.6, gy + 0.05, cz], 7.5 + u * 5.5, r * Math.min(1, Math.sin(u * Math.PI) * 1.6), 2 - u);
    }
  },
};
