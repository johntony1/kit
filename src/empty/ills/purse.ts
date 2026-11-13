// Your purse is empty: a round coin purse with a metal frame and a kiss lock clasp on top. Hover and the clasp pops apart, the purse yawns open and a lone coin peeks out and drops back in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const TURN = -0.4, Y0 = -2.2, Y1 = 2.2; // turned a little toward us, back and front planes
const TOP = 16; // height of the frame at its ends
/** the frame's arch, left to right: [x, z] */
const arch = (n = 16): [number, number][] => Array.from({ length: n + 1 }, (_, i) => { const x = -9.6 + (19.2 * i) / n; return [x, TOP + 1.8 * (1 - (x / 9.6) ** 2)]; });
/** the body's outline, clockwise: the arch, then down round the plump bottom */
const A0 = Math.asin((TOP - 6.5) / 11.5);
const BODY: [number, number][] = [
  ...arch(),
  ...Array.from({ length: 29 }, (_, i) => { const a = A0 - (i / 28) * (Math.PI + 2 * A0); return [Math.cos(a) * 13.2, 6.5 + Math.sin(a) * 11.5] as [number, number]; }),
];

function slab(p: Pen, out: [number, number][], y0: number, y1: number, front: number) {
  const c = Math.cos(TURN), s = Math.sin(TURN);
  for (let i = 0; i < out.length; i++) {
    const [ax, az] = out[i], [bx, bz] = out[(i + 1) % out.length];
    const L = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / L, nz = (bx - ax) / L;
    if (nx * (c + s) + nz <= 0) continue;
    p.face([[ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]], nz > 0.45 ? 0.1 : nx < 0 ? SH.left : SH.right, 0);
  }
  p.face(out.map(([x, z]) => [x, y1, z] as V3), front, 0);
}

export const purse: Illustration = {
  k: "purse", name: "Purse", title: "Your purse is empty", body: "Add money to your purse and your balance will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 22, 10, 0.1);
    p.rotate("z", TURN);
    const open = ease(clamp(h / 0.45));
    const A = arch();
    // the back half of the frame, rising as the purse opens
    const back = A.map(([x, z]) => [x, Y0 + 0.6, z + 4 * open] as V3);
    if (open > 0.01) p.face([...back, ...back.slice().reverse().map(([x, y, z]) => [x, y, z - 1.8] as V3)], 0.3, 0);
    slab(p, BODY, Y0, Y1, 0.09);
    // the open mouth: dark, between the back frame and the front frame
    if (open > 0.01) p.face([...A.map(([x, z]) => [x, Y1, z] as V3), ...back.slice().reverse()], 0.02, 0);
    // a coin peeks up out of the mouth and drops back
    const c = clamp((h - 0.4) / 0.6);
    if (c > 0) {
      const up = Math.sin(Math.PI * Math.min(1, c * 1.25)) * 5 + h * Math.sin(t * 3) * 0.3;
      const [x, y] = p.pt([0, 0, TOP + 1.6 + up]), [, ym] = p.pt([0, Y1, TOP + 2.2]);
      p.screen((g) => {
        g.beginPath(); g.rect(x - 8, y - 9, 16, ym - y + 9); g.clip();
        g.beginPath(); g.arc(x, y, 3.6, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = 0.6; g.beginPath(); g.arc(x, y, 2.3, 0, Math.PI * 2); g.stroke();
      });
    }
    // the front frame: a bright band along the top edge, with a cut under it
    const y = Y1 + 0.04;
    p.face([...A.map(([x, z]) => [x, y, z + 0.4] as V3), ...A.slice().reverse().map(([x, z]) => [x, y, z - 3] as V3)], 0.4, 0);
    p.line(A.map(([x, z]) => [x, y + 0.02, z - 3.2] as V3), SH.edge, 1.2);
    for (const s of [-1, 1]) p.dot([s * 9.8, y + 0.1, TOP - 1.1], 1.6, 1); // the frame's hinge knobs
    // the kiss lock: two bright balls on stalks, meeting at rest, parted and tipped when open
    const zc = TOP + 2.2;
    for (const s of [-1, 1]) {
      const bx = s * (2.2 + 2.6 * open), bz = zc + 3.2 - 0.8 * open;
      const by = Y1 - 0.2;
      const [x0, y0] = p.pt([s * 1.2, Y1, zc]), [x1, y1] = p.pt([bx, by, bz]);
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
      p.dot([bx, by, bz], 3.6, 0);
      p.dot([bx, by, bz], 2.9, 1);
    }
  },
};
