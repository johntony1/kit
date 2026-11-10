// No signal: a lattice radio tower. Waves ripple out from its beacon, then break apart and fade before they get far.
import { type Illustration, type V3 } from "../dots";

const PERIOD = 3.2, ZT = 34, B = 7.5, T = 1.8; // tower height, half width at the foot and at the top
const half = (z: number) => B + (T - B) * (z / ZT);
const BAYS = [0, 13, 24, ZT];
const ramp = (u: number, a: number, b: number) => Math.max(0, Math.min(1, (u - a) / (b - a)));
const shrink = (tri: V3[], k: number): V3[] => {
  const c = [0, 1, 2].map((i) => (tri[0][i] + tri[1][i] + tri[2][i]) / 3);
  return tri.map((v) => v.map((x, i) => c[i] + (x - c[i]) * k) as V3);
};

export const tower: Illustration = {
  k: "tower", name: "Radio tower", title: "No signal", body: "We can't find a signal right now. We will reconnect as soon as one is back.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -23);
    p.scale(0.82, [0, 0, 22]);
    p.shadow(0, 0, 22, 10, 0.12);
    // the concrete pad
    p.box(-10.5, -10.5, 0, 21, 21, 2, { top: 0.2 });
    p.translate(0, 0, 2);
    // the two faces we see: the +y face (dense) and the +x face (sparse), each with its X bracing cut out
    const faceY = (s: number, z: number): V3 => [s * half(z), half(z), z];
    const faceX = (s: number, z: number): V3 => [half(z), -s * half(z), z];
    for (const [on, fill] of [[faceX, 0.065], [faceY, 0.14]] as const) {
      p.face([on(-1, 0), on(1, 0), on(1, ZT), on(-1, ZT)], fill, 0);
      for (let i = 0; i < BAYS.length - 1; i++) {
        const z0 = BAYS[i], z1 = BAYS[i + 1], zm = (z0 + z1) / 2;
        const bl = on(-1, z0), br = on(1, z0), tl = on(-1, z1), tr = on(1, z1), c = on(0, zm);
        for (const tri of [[bl, br, c], [br, tr, c], [tr, tl, c], [tl, bl, c]]) p.clear(shrink(tri, 0.5));
      }
    }
    // the platform and the mast with its beacon
    p.box(-3, -3, ZT, 6, 6, 1.6, { top: 0.24 });
    p.box(-0.8, -0.8, ZT + 1.6, 1.6, 1.6, 7, { top: 0.3, left: 0.16, right: 0.08 });
    const beacon = Math.sin(u * Math.PI * 2 * 2) > -0.3 ? 1 : 0.4;
    p.dot([0, 0, ZT + 9.6], 1.25, beacon);

    // the waves: arcs either side of the beacon. They grow out, then break into dashes, sag and fade
    const [cx, cy] = p.pt([0, 0, ZT + 9.6]);
    p.screen((c) => {
      c.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const s = ramp(u, 0.04 + i * 0.13, 0.2 + i * 0.13); // this arc's life starts
        if (s <= 0) continue;
        const brk = ramp(u, 0.5 + i * 0.07, 0.78 + i * 0.07); // and how far it has broken
        const a = (1 - brk) * Math.min(1, s * 2);
        if (a < 0.03) continue;
        const r = 5 + i * 4.4 + s * 1.4 + brk * 2;
        const n = Math.round(255 * Math.min(1, a + 0.15));
        c.strokeStyle = `rgb(${n},${n},${n})`;
        c.lineWidth = 1.5;
        // break: dashes open up, and the arc splits into pieces that drift down
        const pieces = brk > 0.02 ? 4 : 1;
        for (const side of [-1, 1]) {
          const mid = side > 0 ? 0 : Math.PI, span = 0.62;
          for (let k = 0; k < pieces; k++) {
            const a0 = mid - span + (2 * span * k) / pieces, a1 = a0 + (2 * span) / pieces;
            const gap = brk * 0.12;
            const sag = brk * brk * (3 + k * 1.5);
            c.beginPath();
            c.arc(cx + side * brk * 1.5, cy + sag, r, a0 + gap, a1 - gap);
            c.stroke();
          }
        }
      }
    });
  },
};
