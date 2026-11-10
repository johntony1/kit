// No refunds: a coin pops out of the till, rides back along a curved arrow and drops into the dish.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];

/** a flat (x,z) shape extruded along y from y0 to y1; its cap at y1 faces us on the left */
function ext(p: Pen, shape: P2[], y0: number, y1: number, cap: number, top = SH.top, right = SH.right, side = SH.edge) {
  let A = 0;
  shape.forEach((a, i) => { const b = shape[(i + 1) % shape.length]; A += a[0] * b[1] - b[0] * a[1]; });
  const s = A > 0 ? 1 : -1;
  const sides: { d: number; pts: V3[]; fill: number }[] = [];
  shape.forEach((a, i) => {
    const b = shape[(i + 1) % shape.length], du = b[0] - a[0], dv = b[1] - a[1], L = Math.hypot(du, dv) || 1;
    const nx = (s * dv) / L, nz = (-s * du) / L;
    if (nx + nz <= 0.01) return;
    sides.push({ d: a[0] + b[0] + a[1] + b[1], pts: [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], fill: nz > nx ? top : right });
  });
  sides.sort((x, y) => x.d - y.d).forEach((q) => p.face(q.pts, q.fill, side, 0.5));
  p.face(shape.map(([u, v]) => [u, y1, v] as V3), cap, SH.edge, 0.6);
}

const CX = 0, CZ = 10, R = 12.5, W = 1.3; // the arc's centre, radius and half width
const A0 = 0.12, AH = Math.PI - 0.42; // where the band starts and where the head begins
const TX = 12.5; // the till's centre

export const refund: Illustration = {
  k: "refund", name: "Refund", title: "No refunds", body: "When you send money back to a customer, the refund will be listed here.",
  kind: "loop", period: 3.4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 3.4) / 3.4;
    p.translate(0, 0, -12);
    p.shadow(TX, 0, 15, 8, 0.12);
    p.shadow(-14, 0, 13, 7, 0.12);
    // the dish on the left: an open tray with two coins already in it
    p.box(-18.5, -4, 0, 9, 8, 2.6, { open: true, left: 0.14, right: 0.08 });
    for (const [x, y] of [[-15.5, -1], [-12.6, 0.8]]) {
      p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [x + Math.cos(a) * 1.8, y + Math.sin(a) * 1.8, 1.2] as V3; }), 0.24, SH.edge, 0.5);
    }
    // the till on the right: a box with a dark screen and keys, and a slot on top
    p.box(TX - 4.5, -4.5, 0, 9, 9, 8, { top: 0.22, left: 0.13, right: 0.065 });
    p.face([[TX - 3.5, 4.53, 4.4], [TX + 3.5, 4.53, 4.4], [TX + 3.5, 4.53, 7], [TX - 3.5, 4.53, 7]], 0.03, SH.edge, 0.5);
    for (let i = 0; i < 3; i++) p.face([[TX - 3.5 + i * 2.5, 4.53, 1.3], [TX - 1.7 + i * 2.5, 4.53, 1.3], [TX - 1.7 + i * 2.5, 4.53, 3], [TX - 3.5 + i * 2.5, 4.53, 3]], 0.24, SH.edge, 0.4);
    p.face([[CX + R - 2.4, -0.5, 8.02], [CX + R + 2.4, -0.5, 8.02], [CX + R + 2.4, 0.5, 8.02], [CX + R - 2.4, 0.5, 8.02]], 0.02, SH.edge, 0.5);
    // the arrow: a band over the top, from the till round to the dish, its head pointing down
    const band: P2[] = [];
    for (let i = 0; i <= 30; i++) { const a = A0 + ((AH - A0) * i) / 30; band.push([CX + Math.cos(a) * (R + W), CZ + Math.sin(a) * (R + W)]); }
    band.push([CX + Math.cos(AH) * (R + W * 2.6), CZ + Math.sin(AH) * (R + W * 2.6)]);
    band.push([CX + Math.cos(AH + 0.36) * R, CZ + Math.sin(AH + 0.36) * R]);
    band.push([CX + Math.cos(AH) * (R - W * 2.6), CZ + Math.sin(AH) * (R - W * 2.6)]);
    for (let i = 30; i >= 0; i--) { const a = A0 + ((AH - A0) * i) / 30; band.push([CX + Math.cos(a) * (R - W), CZ + Math.sin(a) * (R - W)]); }
    ext(p, band, -1.2, 1.2, 0.22, 0.24, SH.right, 0);
    // dashed drop line from the head into the dish
    p.guide([[CX + Math.cos(AH + 0.36) * R, 0, CZ + Math.sin(AH + 0.36) * R - 0.5], [CX + Math.cos(AH + 0.36) * R, 0, 3]], true);
    // the coin: up out of the slot, along the arrow, then down into the dish
    let cx: number, cz: number, floor = -Infinity, roll: number;
    if (u < 0.14) { const s = easeInOut(u / 0.14); cx = CX + Math.cos(A0) * R; cz = 5 + (CZ + Math.sin(A0) * R - 5) * s; floor = 8; roll = 0; }
    else if (u < 0.7) { const s = easeInOut((u - 0.14) / 0.56), a = A0 + (AH + 0.36 - A0) * s; cx = CX + Math.cos(a) * R; cz = CZ + Math.sin(a) * R; roll = s * Math.PI * 4; }
    else if (u < 0.86) { const s = (u - 0.7) / 0.16; cx = CX + Math.cos(AH + 0.36) * R; cz = CZ + Math.sin(AH + 0.36) * R - (CZ + Math.sin(AH + 0.36) * R - 0.5) * s * s; floor = 2.6; roll = Math.PI * 4; }
    else { cx = 0; cz = -99; roll = 0; }
    if (cz > floor - 3) {
      const cr = 3.1, yb = 1.8;
      const disc = (y: number, r: number): V3[] => Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2;
        return [cx + Math.cos(a) * r, y, Math.max(floor, cz + Math.sin(a) * r)] as V3;
      });
      for (let k = 0; k < 3; k++) p.face(disc(yb + k * 0.35, cr), 0.12, 0);
      p.face(disc(yb + 1.05, cr), 0.34, SH.edge, 0.55);
      if (cz - 2 > floor) {
        // a ring and a mark that rolls with it
        p.line([...disc(yb + 1.1, 2), disc(yb + 1.1, 2)[0]], SH.edge, 0.55);
        p.line([[cx + Math.cos(roll) * 1.1, yb + 1.12, cz + Math.sin(roll) * 1.1], [cx - Math.cos(roll) * 1.1, yb + 1.12, cz - Math.sin(roll) * 1.1]], SH.edge, 0.6);
      }
    }
  },
};
