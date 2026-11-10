// No bookings yet: an empty parking bay with a P sign at its head. Hover and the barrier arm across its mouth lifts to let you in.
import { SH, type Illustration, type V3 } from "../dots";

const X0 = -12, X1 = 12, Y0 = -10, Y1 = 10, T = 1.2; // the pad and its thickness
const BY = 7.5; // the bay's side lines, at y = -BY and +BY

export const parking: Illustration = {
  k: "parking", name: "Parking bay", title: "No bookings yet", body: "Reserve a spot and your bookings will be waiting for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -7);
    p.shadow(0, 0, 27, 13, 0.12);
    // the pad: lit tarmac with the bay painted on it
    p.box(X0, Y0, 0, X1 - X0, Y1 - Y0, T, { top: SH.top, left: 0.12, right: SH.right });
    const z = T + 0.02;
    p.line([[8, -BY, z], [-9.5, -BY, z], [-9.5, BY, z], [8, BY, z]], SH.edge, 1.1);
    // a big P painted in the bay
    const P = (x: number, y: number): V3 => [x, y, z];
    p.line([P(4.5, 2.2), P(-4.5, 2.2)], SH.edge, 1.3);
    p.line([P(-4.5, 2.2), P(-4.5, -1.2), P(-3.6, -2.3), P(-1.8, -2.3), P(-0.9, -1.2), P(-0.9, 2.2)], SH.edge, 1.3);
    // a dashed car, the space it is waiting for
    p.guide([[-7.8, -4.6, z], [5.6, -4.6, z], [6.6, -3.4, z], [6.6, 3.4, z], [5.6, 4.6, z], [-7.8, 4.6, z], [-7.8, -4.6, z]], true);
    // the wheel stop at the head of the bay
    p.box(-9, -3.5, T, 1.4, 7, 0.9, { top: 0.26, left: 0.14, right: SH.right });
    // the sign: a post at the far corner with a lit P panel facing us
    p.box(-11, -9.2, T, 1, 1, 15, { top: 0.2, left: 0.14, right: SH.right });
    p.box(-13.4, -8.9, T + 10, 6, 0.6, 6, { top: 0.2, left: 0.3, right: SH.right });
    const s = (x: number, zz: number): V3 => [x, -8.27, T + zz];
    p.line([s(-12, 11.2), s(-12, 15)], SH.edge, 0.9);
    p.line([s(-12, 15), s(-10.2, 15), s(-9.4, 14.3), s(-9.4, 13.6), s(-10.2, 12.9), s(-12, 12.9)], SH.edge, 0.9);
    // the barrier: a post at the bay's mouth and an arm across it, hinged at the post
    p.box(9, BY + 0.6, T, 1.8, 1.8, 5.5, { top: 0.24, left: 0.14, right: SH.right });
    const pz = T + 4.6, py = BY + 1.5;
    p.push();
    p.rotate("x", -h * 1.35, [0, py, pz]);
    p.box(9.4, -BY - 1.5, pz - 0.5, 1, py - (-BY - 1.5), 1, { top: 0.26, left: 0.2, right: 0.1 });
    for (let k = 0; k < 4; k++) { const y0 = -BY + k * 4.2; p.line([[9.4, y0, pz + 0.52], [10.4, y0 + 1.6, pz + 0.52]], SH.edge, 0.7); }
    p.pop();
    p.dot([9.9, py + 0.95, pz], 0.55, h > 0.6 ? 1 : 0.05);
    // dashed: the arm's swing
    p.guide(Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * 1.35; return [10.6, py - Math.cos(a) * (BY * 2 + 1.5), pz + Math.sin(a) * (BY * 2 + 1.5)] as V3; }));
  },
};
