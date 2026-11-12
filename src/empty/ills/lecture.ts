// No lectures yet: a lectern with notes on its sloped top and a microphone on a bent neck. Rings of sound spread from the microphone, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const S2 = Math.SQRT1_2;
/** a ball, as a circle that faces the screen */
function ball(p: Pen, c: V3, r: number, fill: number) {
  const k = (r / 1.2247) * S2;
  p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [c[0] + Math.cos(a) * k, c[1] - Math.cos(a) * k, c[2] + Math.sin(a) * r] as V3; }), fill, SH.edge, 0.6);
}

export const lecture: Illustration = {
  k: "lecture", name: "Lecture", title: "No lectures yet", body: "Recorded and upcoming lectures will be listed here once they are scheduled.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(1, -1, -15);
    p.scale(1.08);
    p.shadow(0, 0, 24, 12, 0.12);
    // the lectern: a foot, a column with a panel, a sloped top that overhangs
    p.box(-8.5, -6.5, 0, 17, 13, 1.8);
    p.box(-6.5, -4.5, 1.8, 13, 9, 15.4);
    p.face([[-4.2, 4.53, 5], [4.2, 4.53, 5], [4.2, 4.53, 14], [-4.2, 4.53, 14]], 0.26, SH.edge, 0.5);
    p.ringV("y", [0, 4.56, 9.5], 2, 0.06, SH.edge, 0.5);
    const X = 9.5, Yf = 6.5, Yb = -6.5, zl = 17.2, zf = 21.6, zb = 18.4;
    p.face([[X, Yb, zl], [X, Yf, zl], [X, Yf, zf], [X, Yb, zb]], SH.right, SH.edge, 0.6);
    p.face([[-X, Yf, zl], [X, Yf, zl], [X, Yf, zf], [-X, Yf, zf]], SH.left, SH.edge, 0.6);
    p.face([[-X, Yb, zb], [X, Yb, zb], [X, Yf, zf], [-X, Yf, zf]], SH.top, SH.edge, 0.6);
    // the notes on it
    const on = (x: number, y: number): V3 => [x, y, zb + ((y - Yb) / (Yf - Yb)) * (zf - zb) + 0.04];
    p.face([on(-6.5, -4.6), on(1.5, -4.6), on(1.5, 4.8), on(-6.5, 4.8)], 0.36, SH.edge, 0.5);
    for (const x of [-4.8, -2.8, -0.8]) p.line([on(x, -3.2), on(x, x < -1 ? 3.4 : 0.6)], SH.edge, 0.5);
    // the microphone: a bent neck of beads and a round head
    const a: V3 = on(6, -2), c: V3 = [8.5, -6, 29], b: V3 = [5, -1, 30.5];
    for (let i = 0; i <= 14; i++) { const k = i / 14, m = 1 - k; p.dot([m * m * a[0] + 2 * m * k * c[0] + k * k * b[0], m * m * a[1] + 2 * m * k * c[1] + k * k * b[1], m * m * a[2] + 2 * m * k * c[2] + k * k * b[2]], 0.55, 1); }
    ball(p, b, 2.3, 0.36);
    p.line([[b[0] - 1.1, b[1] + 1.1, b[2] + 0.4], [b[0] + 1.1, b[1] - 1.1, b[2] + 0.4]], SH.edge, 0.4);
    p.line([[b[0] - 1.1, b[1] + 1.1, b[2] - 0.6], [b[0] + 1.1, b[1] - 1.1, b[2] - 0.6]], SH.edge, 0.4);
    // sound: arcs on both sides that grow and fade
    const [sx, sy] = p.pt(b);
    p.screen((g) => {
      g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const k = (u + i / 3) % 1, n = Math.round(255 * Math.sin(k * Math.PI)), r = 4 + k * 9;
        if (n < 20) continue;
        g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 1;
        g.beginPath(); g.arc(sx, sy, r, -0.75, 0.75); g.stroke();
        g.beginPath(); g.arc(sx, sy, r, Math.PI - 0.75, Math.PI + 0.75); g.stroke();
      }
    });
  },
};
