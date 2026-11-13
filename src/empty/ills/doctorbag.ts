// No visits yet: a classic doctor's bag with a metal frame along its top, a handle on the frame and a big dark cross on its lit front. Hover and the bag gives a little hop and a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const X = 13.5; // half length of the bag
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const doctorbag: Illustration = {
  k: "doctorbag", name: "Doctor bag", title: "No visits yet", body: "Book your first appointment and your visits will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const hop = 2.4 * Math.sin(cl(h / 0.5) * Math.PI), sway = h * Math.sin(t * 3) * 0.06;
    p.translate(0, 0, -14);
    p.shadow(0, 0, 30, 12, 0.12);
    p.rotate("z", -0.62); // the long front faces us
    p.translate(0, 0, hop);
    // the bag's cross section across y: a flat base, near upright walls, a roof up to the frame
    const prof: [number, number][] = [[-7.5, 0], [7.5, 0], [6.8, 14], [4, 17.4], [0, 18.4], [-4, 17.4], [-6.8, 14]];
    const side = (a: number, b: number, fill: number) => { const [ya, za] = prof[a], [yb, zb] = prof[b]; p.face([[-X, ya, za], [X, ya, za], [X, yb, zb], [-X, yb, zb]], fill, 0); };
    side(4, 5, 0.03); // the back of the roof
    side(3, 4, 0.065); // the front of the roof
    side(2, 3, 0.3); // the frame band, brightest
    side(1, 2, 0.25); // the front wall, lit to carry the cross
    p.face(prof.map(([y, z]) => [X, y, z] as V3), 0.065, 0); // the end
    // the frame: cuts where the roof meets the wall and along the ridge
    p.line([[-X, 7.15, 13.6], [X, 7.15, 13.6]], 1, 1.1);
    p.line([[-X, 4.05, 17.3], [X, 4.05, 17.3]], 1, 0.9);
    p.line([[X + 0.05, -6.8, 14], [X + 0.05, 6.8, 14]], 1, 0.9);
    // the clasp, bright
    p.box(-1.8, 6.9, 11.4, 3.6, 1, 3.4, { top: 0.4, left: 0.4, right: 0.2, edge: 0 });
    // the big dark cross on the front wall
    const cz = 6.2, A = 2, B = 5, yw = (z: number) => 7.5 - (0.7 * z) / 14 + 0.06;
    const W = (x: number, z: number): V3 => [x, yw(z), z];
    p.face([W(-A, cz - B), W(A, cz - B), W(A, cz - A), W(B, cz - A), W(B, cz + A), W(A, cz + A), W(A, cz + B), W(-A, cz + B), W(-A, cz + A), W(-B, cz + A), W(-B, cz - A), W(-A, cz - A)], 0.02, 0);
    // the handle: a thick lit arch on the ridge, with a dark gap under it
    p.push();
    p.rotate("x", sway, [0, 0, 18]);
    const arch = (r: number, yy: number): V3[] => Array.from({ length: 19 }, (_, i) => { const a = (i / 18) * Math.PI; return [Math.cos(a) * r * 1.35, yy, 18 + Math.sin(a) * r] as V3; });
    for (let yy = -1.2; yy <= 1.2; yy += 0.4) p.face([...arch(7.2, yy), ...arch(4.6, yy).reverse()], yy < 1.1 ? 0.14 : 0.32, 0);
    p.pop();
    // the badge pops in once the hop lands, tight to the handle
    const b = cl((h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ((b - 0.65) / 0.35);
      badge(p, [-X + 1, -2, 23], 4.4 * pop);
    }
  },
};
