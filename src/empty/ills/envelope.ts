// No messages: an open envelope standing up. Hover and the letter slides up out of it, with a little sparkle.
import { SH, type Illustration, type V3 } from "../dots";

const X = 14, Y = 1.3, Z = 18; // half width, half thickness, height

export const envelope: Illustration = {
  k: "envelope", name: "Envelope", title: "No messages", body: "When someone writes to you, their message will land right here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 2, 24, 9, 0.12);
    p.push();
    p.rotate("z", -0.42);
    const fy = Y + 0.03; // just in front of the front face
    // the flap, folded open: a triangle standing up from the back top edge, its inside toward us
    p.face([[-X, -Y, Z], [X, -Y, Z], [X - 1.5, -Y, Z + 2], [1.4, -Y, Z + 11], [-1.4, -Y, Z + 11], [-X + 1.5, -Y, Z + 2]], 0.13, SH.edge, 0.55);
    // the dark inside of the open top
    p.face([[-X, -Y, Z], [X, -Y, Z], [X, Y, Z], [-X, Y, Z]], 0.03, SH.edge, 0.5);
    // the letter, sliding up
    const up = h * 10.5;
    const L = 10.5, z0 = 3 + up, z1 = Z + 4.2 + up;
    p.box(-L, -0.25, z0, L * 2, 0.5, z1 - z0, { top: 0.3, left: 0.24, right: 0.1 });
    const ly = 0.28;
    p.line([[-L + 2.5, ly, z1 - 2.6], [-L + 9, ly, z1 - 2.6]], SH.edge, 0.9);
    for (let i = 0; i < 3; i++) p.line([[-L + 2.5, ly, z1 - 5.2 - i * 2.2], [L - 2.5 - (i === 2 ? 8 : 0), ly, z1 - 5.2 - i * 2.2]], SH.edge, 0.6);
    // the pocket: the front of the envelope covers the letter's lower part
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, Z], [-X, Y, Z]], 0.065, SH.edge, 0.55);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, Z], [X, -Y, Z]], 0.13, SH.edge, 0.5);
    // the bottom flap, lit, folded up over the side flaps
    p.face([[-X, fy, 0], [X, fy, 0], [1.6, fy, 10.4], [-1.6, fy, 10.4]], 0.22, SH.edge, 0.55);
    // the side flaps' seams, from the top corners to the middle
    p.line([[-X + 0.3, fy + 0.02, Z - 0.3], [-2.2, fy + 0.02, 10.2]], SH.edge, 0.6);
    p.line([[X - 0.3, fy + 0.02, Z - 0.3], [2.2, fy + 0.02, 10.2]], SH.edge, 0.6);
    // the wax seal on the bottom flap's tip
    p.ringV("y", [0, fy + 0.04, 8], 2.1, 0, SH.edge, 0.7);
    p.line([[-0.8, fy + 0.05, 8], [0.8, fy + 0.05, 8]], SH.edge, 0.6);
    p.pop();
    // a little sparkle once the letter is out
    const k = Math.max(0, (h - 0.6) / 0.4);
    if (k > 0) {
      const sp: V3[] = [[-14, 3, 31], [10, -7, 35], [16, 1, 26]];
      sp.forEach((q, i) => {
        const s = 0.5 + 0.5 * Math.sin(t * 3 + i * 2.1);
        p.dot(q, 0.9 + 0.5 * s, k);
      });
    }
  },
};
