// No rides yet: a bicycle side on, rolling on the spot, its wheels and pedals turning while the road marks slide by underneath.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2; // seconds per wheel turn
const R = 6.2; // wheel radius
const RW: [number, number] = [-9.5, R], FW: [number, number] = [9.5, R], BB: [number, number] = [-0.6, R - 0.4];
const SEAT: [number, number] = [-3.4, 15.8], HEAD: [number, number] = [6.6, 15.4], HEADLO: [number, number] = [7.3, 12.6];

/** a flat strip in the bike's plane (y = 0) between two points */
function tube(p: Pen, a: [number, number], b: [number, number], w: number, fill: number, y = 0) {
  const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = (-dz / l) * w / 2, nz = (dx / l) * w / 2;
  p.face([[a[0] + nx, y, a[1] + nz], [b[0] + nx, y, b[1] + nz], [b[0] - nx, y, b[1] - nz], [a[0] - nx, y, a[1] - nz]], fill, 0);
}
function wheel(p: Pen, c: [number, number], spin: number, y: number, near: boolean) {
  const at = (r: number, a: number): V3 => [c[0] + Math.cos(a) * r, y, c[1] + Math.sin(a) * r];
  // the tyre: a ring of small slices, so it reads as one band
  const N = 48, ro = R, ri = R - 1.5;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, b = ((i + 1) / N) * Math.PI * 2;
    p.face([at(ro, a), at(ro, b), at(ri, b), at(ri, a)], near ? SH.top : SH.right, 0);
  }
  if (p.ink) for (const r of [ro, ri]) p.line(Array.from({ length: N + 1 }, (_, i) => at(r, (i / N) * Math.PI * 2)), SH.edge, 0.5);
  if (!near) return;
  // three broad spokes, so the turn is easy to see
  for (let k = 0; k < 3; k++) {
    const a = spin + (k / 3) * Math.PI * 2;
    const e: [number, number] = [c[0] + Math.cos(a) * (ri + 0.2), c[1] + Math.sin(a) * (ri + 0.2)];
    if (p.ink) p.line([[c[0], y + 0.02, c[1]], [e[0], y + 0.02, e[1]]], SH.edge, 1);
    else tube(p, c, e, 0.9, 0.2, y + 0.02);
  }
  p.ringV("y", [c[0], y + 0.04, c[1]], 1.1, 0.26, SH.edge, 0.5);
}

export const bike: Illustration = {
  k: "bike", name: "Bicycle", title: "No rides yet", body: "Your rides will show up here once you head out on your first one.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const spin = -u * Math.PI * 2; // rolling towards +x: the top of each wheel moves forward
    p.translate(0, 0, -9);
    p.shadow(0, 0, 26, 7, 0.12);
    // road marks sliding back under the wheels: two dash steps per loop, so it repeats cleanly
    for (let k = -2; k < 4; k++) {
      const x = 15 - ((k + u * 2) * 7.5);
      if (x < -13 || x > 13) continue;
      const a = Math.max(-12.5, x - 2.2), b = Math.min(12.5, x + 2.2);
      p.face([[a, 4, 0.02], [b, 4, 0.02], [b, 5.2, 0.02], [a, 5.2, 0.02]], p.ink ? 0.12 : 0.24, 0);
    }
    p.guide([[-13, -1.6, 0], [13, -1.6, 0]]);
    // the far crank arm and pedal, behind the frame
    const ca = -spin * 0.75 + Math.PI; // the cranks turn slower than the wheels
    const fp: [number, number] = [BB[0] + Math.cos(ca) * 3, BB[1] + Math.sin(ca) * 3];
    tube(p, BB, fp, 0.9, SH.right, -1.4);
    p.box(fp[0] - 1, -2.6, fp[1] - 0.35, 2, 1.6, 0.7, { top: 0.12, left: 0.1, right: SH.right });
    // the far wheel edges peek out behind the near ones
    wheel(p, RW, spin, -1.4, false);
    wheel(p, FW, spin, -1.4, false);
    wheel(p, RW, spin, 0, true);
    wheel(p, FW, spin, 0, true);
    // the frame: stays, seat tube, top tube, down tube, fork
    const F = 0.24;
    tube(p, RW, BB, 0.9, F, 0.06);
    tube(p, RW, [SEAT[0] + 0.3, SEAT[1] - 2.2], 0.8, F, 0.06);
    tube(p, BB, [SEAT[0] + 0.15, SEAT[1] - 1], 1.1, F, 0.06);
    tube(p, [SEAT[0] + 0.3, SEAT[1] - 2.2], [HEAD[0] - 0.1, HEAD[1] - 1.2], 1.1, F, 0.06);
    tube(p, BB, HEADLO, 1.25, F, 0.06);
    tube(p, HEAD, HEADLO, 1.5, F, 0.06);
    tube(p, HEADLO, FW, 0.9, F, 0.06);
    // the chain ring and the chain
    p.ringV("y", [BB[0], 0.1, BB[1]], 2.2, 0.12, SH.edge, 0.5);
    p.line([[BB[0], 0.12, BB[1] + 2.2], [RW[0], 0.12, RW[1] + 1.1]], SH.edge, 0.5);
    p.line([[BB[0], 0.12, BB[1] - 2.2], [RW[0], 0.12, RW[1] - 1.1]], SH.edge, 0.5);
    // the saddle on its post
    tube(p, [SEAT[0] + 0.15, SEAT[1] - 1], [SEAT[0] - 0.1, SEAT[1] + 0.6], 0.7, 0.16, 0.06);
    p.box(SEAT[0] - 2.6, -1.1, SEAT[1] + 0.6, 4.6, 2.2, 1, { top: SH.top, left: 0.13, right: SH.right });
    // the stem and the bars, across the bike, with grips
    tube(p, HEAD, [HEAD[0] - 0.6, HEAD[1] + 2], 0.8, 0.16, 0.06);
    p.box(HEAD[0] - 1.1, -3.2, HEAD[1] + 2, 1, 6.4, 0.9, { top: SH.top, left: 0.14, right: SH.right });
    p.box(HEAD[0] - 1.2, 2.4, HEAD[1] + 1.9, 1.2, 1.6, 1.1, { top: 0.26, left: 0.16, right: SH.right });
    // a lamp on the front, lit
    p.dot([HEAD[0] + 0.9, 0.3, HEAD[1] - 1.2], 0.7, 1);
    // the near crank and pedal, in front of everything
    const np: [number, number] = [BB[0] + Math.cos(ca + Math.PI) * 3, BB[1] + Math.sin(ca + Math.PI) * 3];
    tube(p, BB, np, 0.9, 0.2, 1);
    p.ringV("y", [BB[0], 1.05, BB[1]], 0.7, 0.26, SH.edge, 0.4);
    p.box(np[0] - 1, 1, np[1] - 0.35, 2, 1.8, 0.7, { top: 0.26, left: 0.14, right: SH.right });
  },
};
