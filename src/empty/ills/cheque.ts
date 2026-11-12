// No cheques yet: a cheque book lying open on its first cheque, a perforated stub at the spine. Hover and the top cheque tears away and lifts off.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X0 = -17, XP = -11.5, X1 = 17, D = 7.5; // spine, perforation, far end, half depth

// what is printed on a cheque, drawn at height z; k dims a cheque still in the book
function print(p: Pen, z: number, k: number, signed: boolean) {
  p.face([[XP + 2, -5.6, z], [XP + 4.6, -5.6, z], [XP + 4.6, -3.4, z], [XP + 2, -3.4, z]], 0.4 * k, SH.edge * k, 0.45); // the bank's mark
  p.line([[XP + 6.4, -4.5, z], [XP + 12, -4.5, z]], 0.7 * k, 0.6);
  p.face([[9, -5.8, z], [15, -5.8, z], [15, -2.6, z], [9, -2.6, z]], 0.34 * k, SH.edge * k, 0.5); // the amount
  p.line([[XP + 2, -0.4, z], [15, -0.4, z]], k, 0.55); // pay
  p.line([[XP + 2, 2.2, z], [3, 2.2, z]], 0.7 * k, 0.55);
  p.line([[5, 5.2, z], [15, 5.2, z]], k, 0.55); // sign here
  if (signed) p.line(Array.from({ length: 25 }, (_, i) => { const u = i / 24; return [6 + 8 * u, 4.2 - Math.sin(u * 14) * 1.2 * (1 - u * 0.6), z] as V3; }), SH.edge, 0.75);
}

export const cheque: Illustration = {
  k: "cheque", name: "Cheque book", title: "No cheques yet", body: "Cheques you write or pay in will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -5);
    p.shadow(0, 0, 30, 15, 0.1);
    // the book: a block of cheques, page lines on its sides, bound at the spine
    p.box(X0, -D, 0, X1 - X0, D * 2, 3);
    for (const z of [1, 2]) { p.line([[XP, D + 0.03, z], [X1, D + 0.03, z]], 0.5, 0.4); p.line([[X1 + 0.03, -D, z], [X1 + 0.03, D, z]], 0.5, 0.4); }
    p.box(X0, -D, 3, XP - X0, D * 2, 0.5, { top: 0.26, left: 0.16, right: 0.1 }); // the stubs, a little proud
    p.line([[X0 + 1.6, -4, 3.52], [XP - 1.4, -4, 3.52]], 0.8, 0.55);
    p.line([[X0 + 1.6, -1, 3.52], [XP - 1.4, -1, 3.52]], 0.8, 0.55);
    for (let y = -D + 0.5; y < D; y += 1.6) p.line([[XP, y, 3.04], [XP, y + 0.8, 3.04]], SH.edge, 0.6); // perforation
    // the next cheque, blank, shows once the top one has gone
    const k = ease(clamp(h / 0.8));
    print(p, 3.03, 0.55, false);
    // the top cheque: tears away from the stub, lifts and tilts
    p.push();
    p.translate(8 * k, 2 * k, 0.1 + 9 * k + (h > 0.8 ? Math.sin(t * 2.4) * 0.5 : 0));
    p.rotate("y", -0.22 * k, [XP, 0, 3]);
    p.rotate("x", 0.14 * k, [0, 0, 3]);
    p.face([[XP, -D, 3.1], [X1, -D, 3.1], [X1, D, 3.1], [XP, D, 3.1]], 0.24, SH.edge, 0.6);
    print(p, 3.14, 1, true);
    p.pop();
  },
};
