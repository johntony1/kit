// No voicemail: an answering machine. Its message light blinks while the tape reels turn in their window.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2; // seconds per loop: two blinks
const X = 15, Y = 10, H = 7; // half width, half depth, height of the body

const ring = (cx: number, cy: number, z: number, r: number, n = 28): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const voicemail: Illustration = {
  k: "voicemail", name: "Answering machine", title: "No voicemail", body: "When someone leaves you a message, you can play it back here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const on = u % 0.5 < 0.26; // the light: on, then off, twice a loop
    p.translate(0, -1, -5);
    p.shadow(-6, 0, 24, 12, 0.12);
    p.shadow(6, 0, 24, 12, 0.12);
    // the body: a low wedge, lit on top
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.22, left: 0.13, right: 0.065 });
    // a seam round the base and a display on the front
    p.line([[-X, Y + 0.03, 2], [X, Y + 0.03, 2], [X + 0.03, -Y, 2]], SH.edge, 0.55);
    p.face([[3, Y + 0.04, 3], [12, Y + 0.04, 3], [12, Y + 0.04, 5.8], [3, Y + 0.04, 5.8]], 0.02, SH.edge, 0.5);
    // the message count, a bright one in the display, blinking with the light
    if (on) p.line([[7.6, Y + 0.08, 3.6], [7.6, Y + 0.08, 5.2], [7.1, Y + 0.08, 4.8]], 1, 0.6);

    // the cassette window: a recess with two reels turning in it
    const z = H + 0.02;
    p.face([[-12, -7.5, z], [1, -7.5, z], [1, 1.5, z], [-12, 1.5, z]], 0.03, SH.edge, 0.6);
    // the tape strung between the reels
    p.face([[-9.5, 0, z + 0.02], [-1.5, 0, z + 0.02], [-1.5, -0.8, z + 0.02], [-9.5, -0.8, z + 0.02]], SH.left, 0);
    const spin = (u * Math.PI * 2) / 3 * 2; // a third of a turn per blink: the spokes match at the seam
    for (const cx of [-8.5, -2.5]) {
      const cy = -3;
      p.face(ring(cx, cy, z + 0.04, 2.9), SH.top, SH.edge, 0.5);
      p.face(ring(cx, cy, z + 0.06, 1.1, 16), 0.02, 0);
      for (let k = 0; k < 3; k++) {
        const a = spin + (k / 3) * Math.PI * 2;
        p.line([[cx + Math.cos(a) * 1.3, cy + Math.sin(a) * 1.3, z + 0.08], [cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6, z + 0.08]], SH.edge, 0.6);
      }
    }
    // the speaker grille: slots cut into the lit top
    for (let i = 0; i < 5; i++) p.line([[4 + i * 2, -7.5, z + 0.02], [4 + i * 2, 1, z + 0.02]], SH.edge, 0.7);

    // a row of keys along the front edge, set in a dark strip
    p.face([[-12.8, 3.4, H + 0.02], [4.6, 3.4, H + 0.02], [4.6, 8.2, H + 0.02], [-12.8, 8.2, H + 0.02]], 0.03, SH.edge, 0.5);
    for (let i = 0; i < 4; i++) p.box(-12 + i * 4.2, 4, H, 3, 3.6, 1, { top: 0.24, left: 0.13, right: 0.07 });
    // the play key carries a triangle
    p.line([[-11.1, 5, H + 1.04], [-11.1, 6.8, H + 1.04], [-9.6, 5.9, H + 1.04], [-11.1, 5, H + 1.04]], SH.edge, 0.5);
    // the message light: the one accent, with a glow when it is on
    p.cylinder(9.5, 5.8, H, 1.8, 0.8, { top: on ? 0.34 : 0.04, side: 0.12 });
    if (on) {
      p.dot([9.5, 5.8, H + 2.8], 0.5, 1);
      p.dot([7.4, 5.8, H + 2.2], 0.4, 1);
      p.dot([11.6, 5.8, H + 2.2], 0.4, 1);
      p.guide([[9.5, 5.8, H + 0.8], [9.5, 5.8, H + 6]], true);
    }
  },
};
