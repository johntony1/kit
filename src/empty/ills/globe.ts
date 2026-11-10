// No locations yet: a desk globe on its stand, turning slowly on a tilted axis inside its meridian ring.
import { SH, type Illustration, type V3 } from "../dots";

const P = 10; // seconds per turn
const R = 10, C: V3 = [0, 0, 19]; // the globe's radius and centre
const TILT = 0.41;
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
/** the centre plus a mix of two directions */
const mix = (a: V3, ka: number, b: V3, kb: number): V3 => [C[0] + a[0] * ka + b[0] * kb, C[1] + a[1] * ka + b[1] * kb, C[2] + a[2] * ka + b[2] * kb];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const E: V3 = norm([1, -1, 0]); // screen right
const AX: V3 = norm([Math.sin(TILT) * E[0], Math.sin(TILT) * E[1], Math.cos(TILT)]); // the axis, leaning right
const U1: V3 = norm(cross(AX, [1, 1, 0])), U2: V3 = cross(AX, U1);
const BX: V3 = norm(add(E, AX, -dot(E, AX))); // in the ring's plane, square to the axis
const VIEW: V3 = norm([1, 1, 1]);
// the land: soft blobs on the sphere, as [latitude, longitude, size]
const LAND: [number, number, number][] = [
  [0.75, 0.2, 0.5], [0.35, 0.5, 0.45], [-0.25, 0.75, 0.42], [-0.65, 0.6, 0.28],
  [0.6, 2.3, 0.62], [0.2, 2.9, 0.4], [-0.3, 2.5, 0.3],
  [0.45, 4.2, 0.4], [-0.15, 4.6, 0.5], [-0.6, 5.3, 0.3],
];
const unit = (la: number, lo: number): V3 => [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];

export const globe: Illustration = {
  k: "globe", name: "Globe", title: "No locations yet", body: "Add a place and it will be pinned here, wherever in the world it is.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const spin = ((t % P) / P) * Math.PI * 2;
    // a point on the globe, by latitude and longitude, turned by the spin
    const at = (la: number, lo: number, r = R): V3 => {
      const c = Math.cos(la) * r, a = lo + spin;
      return add(mix(U1, Math.cos(a) * c, U2, Math.sin(a) * c), AX, Math.sin(la) * r);
    };
    const RR = R + 3.4; // the ring's radius
    const foot = add(C, AX, -RR); // the bottom of the ring
    p.translate(-foot[0] * 0.4, -foot[1] * 0.4, -14.5);
    p.shadow(foot[0], foot[1], 18, 9, 0.12);
    p.shadow(C[0], C[1], 16, 8, 0.06); // under the globe too, so the stage reaches under it
    // the stand: a round base and a short neck up to the ring
    p.cylinder(foot[0], foot[1], 0, 6.5, 1.8, { side: 0.12, top: SH.top });
    p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [foot[0] + Math.cos(a) * 4.6, foot[1] + Math.sin(a) * 4.6, 1.82] as V3; }), SH.edge, 0.55);
    p.cylinder(foot[0], foot[1], 1.8, 1, foot[2] - 1.8, { side: 0.16, top: 0.2 });
    // dashed: the axis, carried on past both poles
    p.guide([add(C, AX, -R - 6), add(C, AX, R + 6)]);
    // the sphere: a disc facing us, shaded by nested discs pulled towards the light
    const W2: V3 = norm(cross(VIEW, E));
    const disc = (r: number, dx: number, dz: number): V3[] => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return mix(E, Math.cos(a) * r + dx, W2, Math.sin(a) * r + dz); });
    if (p.ink) p.face(disc(R, 0, 0), 0.2, 0);
    else {
      p.face(disc(R, 0, 0), 0.05, 0);
      p.face(disc(R * 0.84, -R * 0.13, R * 0.13), 0.075, 0);
    }
    // the land: soft blobs on the surface; any part round the back is pressed onto the rim, so each blob is cut by the edge
    for (const [la, lo, sz] of LAND) {
      const c = unit(la, lo), t1 = norm(cross(c, Math.abs(c[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), t2 = cross(c, t1);
      const pts: V3[] = [];
      let any = false;
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2, w = sz * (1 + 0.18 * Math.sin(a * 3 + la * 5) + 0.1 * Math.cos(a * 5 + lo));
        const v = norm(add(add(c, t1, Math.cos(a) * Math.tan(w)), t2, Math.sin(a) * Math.tan(w)));
        const pt = at(Math.asin(v[2]), Math.atan2(v[1], v[0]));
        let d = add(pt, C, -1);
        const k = dot(d, VIEW);
        if (k > 0) any = true;
        else d = norm(add(d, VIEW, -k)).map((x) => x * R) as V3;
        pts.push(add(C, d));
      }
      if (any) p.face(pts, p.ink ? 0.12 : 0.3, 0);
    }
    // a few meridians and the equator, cut across the face so the turn shows
    for (let m = 0; m < 4; m++) {
      const lo = (m * Math.PI) / 2 + 0.3;
      const pts: V3[] = [];
      for (let k = 0; k <= 24; k++) {
        const la = -Math.PI / 2 + (Math.PI * k) / 24;
        if (dot(norm(add(at(la, lo), C, -1)), VIEW) > 0.05) pts.push(at(la, lo, R + 0.02));
        else if (pts.length) break;
      }
      if (pts.length > 1) p.line(pts, SH.edge, 0.5);
    }
    const eq: V3[] = [];
    for (let k = 0; k <= 48; k++) { const v = at(0, (Math.PI * 2 * k) / 48, R + 0.02); if (dot(norm(add(v, C, -1)), VIEW) > 0.05) eq.push(v); }
    if (eq.length > 1) {
      // the visible run of the equator is one arc: start it where it comes round the edge
      const ang = (v: V3) => Math.atan2(dot(add(v, C, -1), U2), dot(add(v, C, -1), U1));
      eq.sort((a, b) => ((ang(a) - ang(eq[0]) + Math.PI * 4) % (Math.PI * 2)) - ((ang(b) - ang(eq[0]) + Math.PI * 4) % (Math.PI * 2)));
      p.line(eq, SH.edge, 0.5);
    }
    // a pin standing on one spot, carried round as the globe turns
    const pinAt = at(0.42, 0.55), pn = norm(add(pinAt, C, -1));
    if (dot(pn, VIEW) > 0.15) {
      p.line([pinAt, add(pinAt, pn, 2.6)], SH.edge, 0.6);
      p.dot(add(pinAt, pn, 3.2), 1.05, 1);
    }
    // the outline of the sphere
    p.line(Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return mix(E, Math.cos(a) * R, W2, Math.sin(a) * R); }), SH.edge, 0.6);
    // the meridian ring: a lit half hoop from pole to pole on the right
    const ring = (r: number, a: number) => mix(AX, Math.cos(a) * r, BX, Math.sin(a) * r);
    const N = 30, out: V3[] = [], inn: V3[] = [];
    for (let i = 0; i <= N; i++) { const a = (Math.PI * i) / N; out.push(ring(RR + 0.8, a)); inn.push(ring(RR - 0.8, a)); }
    p.face([...out, ...inn.reverse()], SH.top, 0);
    // its pins into the poles
    for (const s of [1, -1]) p.face([add(add(C, AX, s * (R - 0.4)), BX, -0.45), add(add(C, AX, s * (R - 0.4)), BX, 0.45), add(add(C, AX, s * RR), BX, 0.45), add(add(C, AX, s * RR), BX, -0.45)], 0.24, 0);
    // the ring's foot joins the neck
    p.dot(foot, 1.1, 0.25);
  },
};
