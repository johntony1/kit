// No skincare routine: a squeeze tube of sunscreen standing on its cap, a big sun cut into its lit front. Hover and the tube gets a squeeze while the sun's rays stretch out and turn.
import { type Illustration, type V3 } from "../dots";

const Z0 = 7, LEN = 33; // where the body starts above the cap, body length
const cl = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export const sunscreen: Illustration = {
  k: "sunscreen", name: "Sunscreen", title: "No skincare routine", body: "Build a routine and your morning and evening steps will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(cl(h / 0.6)), sq = Math.sin(cl(h / 0.6) * Math.PI) * 0.7 + 0.3 * k;
    p.translate(0, 0, -21);
    p.shadow(0, 0, 18, 8, 0.12);
    p.rotate("z", -0.66); // the broad front faces us
    // the cap at the bottom, the tube stands on it
    p.cylinder(0, 0, 0, 5, Z0 - 0.6, { side: 0.16, top: 0.2, edge: 0 });
    // the body: a shoulder from the cap, widening to the flat crimped end at the top; pinched in the middle when squeezed
    const f = (z: number) => cl((z - Z0) / LEN);
    const hw = (z: number) => { const v = f(z), s = Math.min(1, v / 0.14); return 4.6 + 4.8 * Math.sin((s * Math.PI) / 2) + 1.6 * v - sq * 1.6 * Math.exp(-Math.pow((v - 0.42) / 0.16, 2)); };
    const dp = (z: number) => { const v = f(z), s = Math.min(1, v / 0.14); return (4.6 + 0.4 * Math.sin((s * Math.PI) / 2)) * (1 - Math.pow(v, 2.2) * 0.8); };
    const zs = Array.from({ length: 31 }, (_, i) => Z0 + (i / 30) * (LEN - 3.5));
    // the narrow right side, in shade
    p.face([...zs.map((z): V3 => [hw(z), -dp(z), z]), ...zs.slice().reverse().map((z): V3 => [hw(z), dp(z), z])], 0.065, 0);
    // the broad front, lit
    p.face([...zs.map((z): V3 => [-hw(z), dp(z), z]), ...zs.slice().reverse().map((z): V3 => [hw(z), dp(z), z])], 0.26, 0);
    // the crimped end: a flat band with ridges cut across it
    const zt = Z0 + LEN - 3.5, wt = hw(zt) + 0.3, yt = dp(zt);
    p.face([[-wt, yt + 0.1, zt - 0.4], [wt, yt + 0.1, zt - 0.4], [wt, yt + 0.1, zt + 3.5], [-wt, yt + 0.1, zt + 3.5]], 0.3, 0);
    p.face([[wt, -yt, zt - 0.4], [wt, yt + 0.1, zt - 0.4], [wt, yt + 0.1, zt + 3.5], [wt, -yt, zt + 3.5]], 0.1, 0);
    p.line([[-wt, yt + 0.2, zt - 0.2], [wt, yt + 0.2, zt - 0.2]], 1, 1.1);
    // the seam between the cap and the shoulder
    p.line([[-5, 5.05, Z0 - 0.5], [5, 5.05, Z0 - 0.5]], 1, 0.9);
    // the sun: a dark disc with eight dark rays, cut into the lit front
    const cz = Z0 + LEN * 0.52, F = (x: number, z: number): V3 => [x, dp(z) + 0.15, z];
    p.face(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return F(Math.cos(a) * 3.4, cz + Math.sin(a) * 3.4); }), 0.02, 0);
    const rot = k * 0.5 + h * t * 0.5, r0 = 4.7, r1 = 7 + 1.4 * k, wd = 0.75;
    for (let i = 0; i < 8; i++) {
      const a = rot + (i * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a), nx = -s * wd, nz = c * wd;
      p.face([F(c * r0 - nx, cz + s * r0 - nz), F(c * r1 - nx, cz + s * r1 - nz), F(c * r1 + nx, cz + s * r1 + nz), F(c * r0 + nx, cz + s * r0 + nz)], 0.02, 0);
    }
  },
};
