// No messages have washed up: a corked bottle with a rolled note inside, afloat on the sea. It bobs and rocks as the waves roll past, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
/** a point in the plane that faces us: u to the right, v up, d toward the viewer */
const F = (u: number, v: number, d = 0): V3 => [u * 0.577 + d, -u * 0.577 + d, v];
// the bottle as [distance along its axis, radius], base to lip
const PROF: [number, number][] = [[-14, 4.6], [-13, 5.6], [3, 5.6], [5.5, 4.8], [8.5, 2.3], [14, 2.1], [14, 2.9], [15.6, 2.9]];

/** a wave: a ribbon with a rolling top, thinning to nothing at both ends */
function wave(p: Pen, u0: number, u1: number, v: number, ph: number, fill: number, thick: number) {
  const n = 40, top: V3[] = [], bot: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, u = u0 + (u1 - u0) * f, y = v + Math.sin(u * 0.42 + ph) * 1.3;
    top.push(F(u, y)); bot.push(F(u, y - thick * Math.sqrt(Math.sin(f * Math.PI))));
  }
  p.face([...top, ...bot.reverse()], fill, 0);
}
const level = (u: number, ph: number) => -5.5 + Math.sin(u * 0.42 + ph) * 1.3;

export const bottle: Illustration = {
  k: "bottle", name: "Message in a bottle", title: "No messages have washed up", body: "Nothing has reached you yet. Messages will appear here when they arrive.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -3);
    p.scale(1.15);
    p.push(); p.translate(0, 0, -14); p.shadow(0, 0, 26, 12, 0.1); p.pop();
    // far water behind the bottle
    wave(p, -20, 22, 0.5, -ph + 1, 0.09, 2.2);
    // the bottle bobs and rocks, lagging the swell a little
    const bob = Math.sin(ph - 0.9) * 1.3, tilt = 0.5 + Math.sin(ph - 1.7) * 0.1;
    const c = Math.cos(tilt), s = Math.sin(tilt);
    const B = (a: number, r: number, d = 0) => F(a * c - r * s, 3.2 + bob + a * s + r * c, d);
    const strip = (f0: number, f1: number, fill: number, pr = PROF) => p.face([...pr.map(([a, r]) => B(a, r * f0)), ...pr.map(([a, r]) => B(a, r * f1)).reverse()], fill, 0);
    p.screen((g) => {
      // only what is above the water shows
      g.beginPath();
      const [x0, y0] = p.pt(F(-45, 40)), [x1] = p.pt(F(45, 40));
      g.moveTo(x0, y0);
      for (let u = -45; u <= 45; u += 1.5) { const [x, y] = p.pt(F(u, level(u, ph))); g.lineTo(x, y); }
      g.lineTo(x1, y0); g.closePath(); g.clip();
      // the cork
      p.face([B(15.6, 2), B(19, 1.7), B(19, -1.7), B(15.6, -2)], 0.36, SH.edge, 0.5);
      // the glass: lit along the top, dense in the middle, sparse underneath
      strip(1, 0.3, 0.2); strip(0.3, -0.45, 0.12); strip(-0.45, -1, 0.065);
      p.line([...PROF.map(([a, r]) => B(a, r)), ...PROF.map(([a, r]) => B(a, -r)).reverse(), B(PROF[0][0], PROF[0][1])], SH.edge, 0.55);
      // the note: a bright roll with a band round its middle
      p.face([B(-10, 3.1, 0.1), B(1.5, 3.1, 0.1), B(1.5, -3.1, 0.1), B(-10, -3.1, 0.1)], 0.42, SH.edge, 0.5);
      p.line([B(-4.8, 3.1, 0.2), B(-4.8, -3.1, 0.2)], SH.edge, 0.8);
      p.line([B(-3.7, 3.1, 0.2), B(-3.7, -3.1, 0.2)], SH.edge, 0.8);
      // a glint along the shoulder
      p.line([B(-11, 4.3, 0.2), B(-6, 4.3, 0.2)], SH.edge, 0.5);
    });
    // the water in front: the swell the bottle sits in, and two more rows nearer us
    wave(p, -24, 24, -5.5, ph, 0.3, 2.6);
    wave(p, -19, 21, -10.5, -ph + 2.4, 0.16, 2.4);
    wave(p, -12, 15, -15, ph + 4, 0.09, 2);
  },
};
