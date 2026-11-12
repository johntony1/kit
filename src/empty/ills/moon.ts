// Nothing tonight: a thick crescent moon with three stars in its hollow. It rocks gently while the stars twinkle in turn.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const R = 13.5, RI = 11.2, D = 6.4, TH = 0.62; // outer radius, inner radius, how far and which way the bite sits
const ZC = 16;
/** the crescent's outline in [x, z]: the long outer arc, then back along the bite */
const CRESCENT: [number, number][] = (() => {
  const f = Math.acos((R * R + D * D - RI * RI) / (2 * R * D)), g = Math.acos((R * R - D * D - RI * RI) / (2 * D * RI));
  const out: [number, number][] = [];
  for (let i = 0; i <= 44; i++) { const a = TH + f + ((Math.PI * 2 - 2 * f) * i) / 44; out.push([Math.cos(a) * R, ZC + Math.sin(a) * R]); }
  for (let i = 1; i < 30; i++) { const a = TH - g - ((Math.PI * 2 - 2 * g) * i) / 30; out.push([D * Math.cos(TH) + Math.cos(a) * RI, ZC + D * Math.sin(TH) + Math.sin(a) * RI]); }
  return out;
})();

// a four point star standing in the plane that faces us
function star(p: Pen, x: number, z: number, r: number, shade: number) {
  if (r < 0.3) return;
  p.face(Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4, q = i % 2 ? r * 0.42 : r; return [x + Math.cos(a) * q, 0, z + Math.sin(a) * q] as V3; }), shade, 0);
}

export const moon: Illustration = {
  k: "moon", name: "Moon", title: "Nothing tonight", body: "Nothing is planned for tonight. Anything you schedule will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -17);
    p.shadow(0, 1, 21 - Math.sin(w), 10, 0.1);
    p.rotate("z", -0.6); // turned to face us
    p.push();
    p.translate(-3.5, 0, Math.sin(w) * 1.2);
    p.rotate("y", Math.sin(w) * 0.07, [0, 0, ZC]);
    const at = (y: number) => CRESCENT.map(([x, z]) => [x, y, z] as V3);
    // the back of the moon a step behind, then the lit front
    p.face(at(-2.6), SH.right, SH.edge, 0.5);
    p.face(at(-1.3), 0.1, 0);
    p.face(at(0), 0.26, SH.edge, 0.6);
    // craters: three shallow dark rounds
    for (const [x, z, r] of [[-8.2, 13, 1.7], [-4.6, 5.6, 1.2], [-7.6, 21.5, 1]]) p.dot([x, 0.04, z], r, 0.1);
    p.pop();
    // the stars in the hollow, each swelling and shrinking in its own time
    const tw = (k: number) => 0.62 + 0.38 * Math.sin(w + k);
    star(p, 5.5, 20.5, 6 * tw(0), 0.6);
    star(p, 13, 11, 4.2 * tw(2.1), 0.5);
    star(p, 12.5, 29, 3.4 * tw(4.2), 0.5);
  },
};
