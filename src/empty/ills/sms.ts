// No texts: a phone lying on its back with a short conversation on screen. A new bubble pops up out of it, typing, then sinks back in.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 3.6; // seconds per loop

/** a rounded rectangle, counter clockwise as [u, v] pairs, with an optional tail under its left end */
function rrect(u0: number, v0: number, u1: number, v1: number, r: number, tail = false): P2[] {
  const pts: P2[] = [];
  const corner = (cu: number, cv: number, a0: number) => { for (let i = 0; i <= 5; i++) { const a = a0 + (Math.PI / 2) * (i / 5); pts.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); } };
  if (tail) pts.push([u0 - 0.6, v0 - 3.2], [u0 + r + 4, v0]);
  corner(u1 - r, v0 + r, -Math.PI / 2);
  corner(u1 - r, v1 - r, 0);
  corner(u0 + r, v1 - r, Math.PI / 2);
  corner(u0 + r, v0 + r, Math.PI);
  return pts;
}

/** a flat shape in the floor plane, extruded up from z by th: the walls that face us, then the top */
function slab(p: Pen, pts: P2[], z: number, th: number, top = SH.top) {
  const n = pts.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n]; a += x0 * y1 - x1 * y0; }
  const s = a > 0 ? 1 : -1;
  const walls: { d: number; f: V3[]; k: number; e: number }[] = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = ((y1 - y0) * s) / L, ny = (-(x1 - x0) * s) / L;
    if (nx + ny <= 0) continue;
    const k = SH.right + (SH.left - SH.right) * Math.max(0, Math.min(1, (ny - nx + 1) / 2));
    walls.push({ d: x0 + x1 + y0 + y1, f: [[x0, y0, z], [x1, y1, z], [x1, y1, z + th], [x0, y0, z + th]], k, e: L > 2.5 ? SH.edge : 0 });
  }
  walls.sort((u, v) => u.d - v.d);
  for (const w of walls) p.face(w.f, w.k, w.e, 0.5);
  p.face(pts.map(([x, y]) => [x, y, z + th] as V3), top, SH.edge, 0.6);
}

/** a standing bubble: its shape in the x-z plane, pushed from y = -d to y = 0, the front cap lit */
function standing(p: Pen, shape: P2[], d: number, front: number) {
  const n = shape.length;
  let a = 0;
  for (let i = 0; i < n; i++) { const [x0, z0] = shape[i], [x1, z1] = shape[(i + 1) % n]; a += x0 * z1 - x1 * z0; }
  const s = a > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [x0, z0] = shape[i], [x1, z1] = shape[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = ((z1 - z0) * s) / L, nz = (-(x1 - x0) * s) / L;
    if (nz < 0.3 && nx < 0.3) continue;
    p.face([[x0, -d, z0], [x1, -d, z1], [x1, 0, z1], [x0, 0, z0]], nz >= 0.3 ? 0.22 : SH.right, 0);
  }
  p.face(shape.map(([x, z]) => [x, 0, z] as V3), front, SH.edge, 0.6);
}

export const sms: Illustration = {
  k: "sms", name: "Text messages", title: "No texts yet", body: "Send a message and the conversation will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(-1, 0, -9);
    p.shadow(-6, 0, 22, 11, 0.12);
    p.shadow(6, 0, 22, 11, 0.12);
    // the phone, lying on its back with its top end to the back (-x)
    slab(p, rrect(-15, -8.5, 15, 8.5, 3.4), 0, 2.4, 0.22);
    const z = 2.42;
    // the screen, dark, with the conversation lit on it
    p.face([[-12, -7, z], [12, -7, z], [12, 7, z], [-12, 7, z]], 0.03, SH.edge, 0.55);
    p.line([[-13.6, -2, z], [-13.6, 2, z]], SH.edge, 0.7); // the speaker slot
    const msg = (x0: number, x1: number, y0: number, y1: number) => p.face(rrect(x0, y0, x1, y1, 1.3).map(([x, y]) => [x, y, z + 0.02] as V3), SH.top, SH.edge, 0.5);
    msg(-10.5, -6.5, -6, 0.5);
    msg(-5, -1.5, -1, 5.8);
    msg(0, 4.5, -6, -0.5);
    // the typing bar along the bottom of the screen
    p.face(rrect(7, -6, 10.5, 5.8, 1.6).map(([x, y]) => [x, y, z + 0.02] as V3), SH.left, SH.edge, 0.5);

    // the new bubble: pops out of the screen, bobs while it types, sinks back in
    const up = u < 0.12 ? 0 : u < 0.3 ? (u - 0.12) / 0.18 : 1;
    const down = u > 0.8 ? Math.min(1, (u - 0.8) / 0.12) : 0;
    const back = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
    const k = up > 0 ? back(up) * (1 - easeInOut(down)) : 0;
    if (k > 0.03) {
      const bob = Math.sin(u * Math.PI * 4) * 0.5 * (1 - down);
      const bz = z + 2 + 10 * Math.min(1, k) + bob;
      const bx = 3, by = 3; // where it rises from
      p.guide([[bx - 6.5, by, bz - 3], [bx - 6.5, by, z + 0.1]], true);
      p.guide([[bx + 7, by, bz], [bx + 7, by, z + 0.1]], true);
      p.push();
      p.translate(bx, by, bz);
      p.rotate("z", -0.6);
      p.scale(k, [-6.5, 0, -3]);
      standing(p, rrect(-8, 0, 8, 9.5, 3.2, true), 2.2, 0.32);
      // three dots typing, cut dark into the bubble
      for (let i = 0; i < 3; i++) {
        const w = (u * 4 - i * 0.18 + 4) % 1, hop = w < 0.4 ? Math.sin((w / 0.4) * Math.PI) : 0;
        p.dot([-3.6 + i * 3.6, 0.05, 4.6 + hop * 1.1], 1.05, 0);
      }
      p.pop();
    }
  },
};
