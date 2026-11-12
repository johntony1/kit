// Helicopter: a small helicopter hovering over its shadow, bubble nose, tail boom and skids. Its rotors spin and it bobs gently in the air.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const HY = 4.6; // half width of the cabin
// the cabin's side, nose to the right: [x, z]
const SIDE: [number, number][] = [[-7, 7.6], [-7, 16.4], [2, 17], [7, 14.4], [9.6, 11], [9, 8.4], [6, 7.2]];

export const helicopter: Illustration = {
  k: "helicopter", name: "Helicopter", title: "No flights nearby", body: "Flights in your area will appear here when one is scheduled.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, bob = Math.sin(u * Math.PI * 2) * 1.2, spin = u * Math.PI * 4;
    p.translate(2, 0, -17);
    p.shadow(-2, 0, 26 - bob, 11, 0.11);
    p.rotate("z", -0.45);
    p.translate(0, 0, 6 + bob);
    p.rotate("y", 0.05 * Math.cos(u * Math.PI * 2), [0, 0, 12]);
    // the far skid, then the tail boom, the fin and the tail rotor
    p.box(-6, -HY, 1.4, 15, 1, 1, { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
    p.face([[-7, -1.1, 15.4], [-7, 1.1, 15.4], [-23, 0.7, 14.6], [-23, -0.7, 14.6]], 0.2, 0);
    p.face([[-7, 1.1, 11.4], [-7, 1.1, 15.4], [-23, 0.7, 14.6], [-23, 0.7, 13]], 0.12, 0);
    p.face([[-20, 0.7, 14], [-23.4, 0.7, 21], [-25.2, 0.7, 21], [-24, 0.7, 12.4]], 0.3, SH.edge, 0.5);
    const tr: V3 = [-23.6, 1.3, 17.2], ta = spin * 2;
    p.ringV("y", tr, 3.4, 0, SH.edge, 0.4);
    p.face([[tr[0] + Math.cos(ta) * 3.4, tr[1], tr[2] + Math.sin(ta) * 3.4 + 0.5], [tr[0] - Math.cos(ta) * 3.4, tr[1], tr[2] - Math.sin(ta) * 3.4 + 0.5], [tr[0] - Math.cos(ta) * 3.4, tr[1], tr[2] - Math.sin(ta) * 3.4 - 0.5], [tr[0] + Math.cos(ta) * 3.4, tr[1], tr[2] + Math.sin(ta) * 3.4 - 0.5]], 0.5, 0);
    // the cabin: lit roof and windscreen, the side toward us with a big window
    const q = (i: number, y: number): V3 => [SIDE[i][0], y, SIDE[i][1]];
    const span = (i: number, f: number) => p.face([q(i, -HY), q(i + 1, -HY), q(i + 1, HY), q(i, HY)], f, 0);
    span(1, 0.2); span(2, 0.3); span(3, 0.12); span(4, 0.065);
    p.face(SIDE.map((_, i) => q(i, HY)), 0.14, SH.edge, 0.65);
    p.clear([[0.6, HY + 0.03, 15.6], [6.2, HY + 0.03, 13.6], [8.2, HY + 0.03, 10.8], [0.6, HY + 0.03, 10.8]]);
    p.clear([[-5, HY + 0.03, 11.4], [-1, HY + 0.03, 11.4], [-1, HY + 0.03, 14.8], [-5, HY + 0.03, 14.8]]);
    // the near skid on its two struts
    for (const x of [-3.5, 4.5]) p.box(x, HY - 0.9, 2.2, 0.9, 0.9, 5.4, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.box(-6, HY - 1, 1.4, 15, 1, 1, { top: 0.4, left: 0.34, right: 0.14, edge: 0 });
    // the mast and the main rotor: a faint disc of blur with two bright blades
    p.box(-0.7, -0.7, 16.8, 1.4, 1.4, 3.4, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    const Z = 20.4, RR = 20;
    const ring: V3[] = Array.from({ length: 41 }, (_, i) => [Math.cos((i / 40) * Math.PI * 2) * RR, Math.sin((i / 40) * Math.PI * 2) * RR, Z]);
    p.guide(ring);
    const c = Math.cos(spin), s = Math.sin(spin), w = 1.3;
    p.face([[c * RR + s * w, s * RR - c * w, Z], [c * RR - s * w, s * RR + c * w, Z], [-c * RR - s * w, -s * RR + c * w, Z], [-c * RR + s * w, -s * RR - c * w, Z]], 0.5, 0);
    p.cylinder(0, 0, Z - 0.2, 1.6, 0.9, { side: 0.3, top: 0.4 });
  },
};
