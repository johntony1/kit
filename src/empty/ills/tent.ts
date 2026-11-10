// No campsites booked: a ridge tent with a mat out front. Hover and the door flap rolls up on an empty tent lit by a little lantern; the pennant flutters.
import { SH, type Illustration, type V3 } from "../dots";

const L = 10, D = 8, H = 11.5; // half length along the ridge (x), half width (y), ridge height
const DW = 5, DH = 8.8; // door: half width at the ground, height

export const tent: Illustration = {
  k: "tent", name: "Tent", title: "No campsites booked", body: "Book a pitch and your stays will be set up here, ready for the trip.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-2.5, 0, -8);
    p.shadow(2.5, 0, 28, 14, 0.12);
    // guy ropes, drawn as dashed construction lines, out to where the pegs go
    p.guide([[-L, 0, H], [-L - 4.5, 0, 0]]);
    p.guide([[-L * 0.3, D * 0.55, H * 0.45], [-L * 0.3, D + 4, 0]]);
    p.guide([[L * 0.5, D * 0.55, H * 0.45], [L * 0.5, D + 4, 0]]);
    // the near slope: lit, with seams running down it
    const sl = (x: number, u: number): V3 => [x, D * u, H * (1 - u)];
    p.face([sl(-L, 0), sl(L, 0), sl(L, 1), sl(-L, 1)], SH.top, SH.edge, 0.6);
    for (const x of [-3.4, 3.4]) p.line([sl(x, 0.04), sl(x, 0.96)], SH.edge, 0.6);
    p.line([sl(-L + 0.4, 0.86), sl(L - 0.4, 0.86)], SH.edge, 0.55); // the hem
    // the front end, facing right, with its doorway dark inside
    const g = (y: number, z: number): V3 => [L, y, z];
    p.face([g(-D, 0), g(D, 0), g(0, H)], p.ink ? 0.12 : SH.right, SH.edge, 0.6); // sparse in dots, so the flap stands out
    p.face([g(-DW, 0), g(DW, 0), g(0, DH)], 0.02, SH.edge, 0.6);
    // a lantern glowing inside once the door is open
    if (h > 0.45) {
      p.box(L - 4.2, -0.7, 0, 1.4, 1.4, 0.6, { top: 0.12, left: 0.1, right: 0.06 });
      p.dot([L - 3.5, 0, 1.9], 1.1, 1);
    }
    // the flap rolls up from the ground: what is left of it hangs above the roll
    const zc = h * (DH - 2.6);
    const yc = DW * (1 - zc / DH);
    const f = (y: number, z: number): V3 => [L + 0.04, y, z];
    p.face([f(-yc, zc), f(yc, zc), f(0, DH)], 0.3, SH.edge, 0.6);
    if (p.ink) p.line([f(0, DH - 0.6), f(0, zc + 0.3)], SH.edge, 0.7); // the zip, too fine for the dots
    if (h > 0.04) {
      // the roll and its two ties
      p.face([f(-yc - 0.4, zc - 0.7), f(yc + 0.4, zc - 0.7), f(yc + 0.2, zc + 0.7), f(-yc - 0.2, zc + 0.7)], 0.26, SH.edge, 0.55);
      p.line([f(-yc * 0.45, zc + 1.3), f(-yc * 0.45, zc - 0.9)], SH.edge, 0.5);
      p.line([f(yc * 0.45, zc + 1.3), f(yc * 0.45, zc - 0.9)], SH.edge, 0.5);
    }
    // a short pole at the peak and its pennant
    p.box(L - 0.35, -0.35, H - 0.4, 0.7, 0.7, 4.6, { top: 0.24, left: 0.2, right: 0.1 });
    const fl = h * Math.sin(t * 7) * 0.9;
    p.face([[L, -0.35, H + 4], [L + fl, -4.8, H + 3 + fl * 0.3], [L, -0.35, H + 1.9]], 0.24, SH.edge, 0.5);
    // the mat out front
    p.face([[L + 1.2, -5, 0.02], [L + 6.5, -5, 0.02], [L + 6.5, 5, 0.02], [L + 1.2, 5, 0.02]], 0.2, SH.edge, 0.55);
    for (const x of [L + 3, L + 4.7]) p.line([[x, -4, 0.04], [x, 4, 0.04]], SH.edge, 0.55);
  },
};
