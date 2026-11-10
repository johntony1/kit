// No threads: a message with a thread rail running down from it. Replies drop in one by one, then the thread clears and starts again.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 5; // seconds per loop

/** a rounded rectangle in the floor plane, counter clockwise */
function rrect(x0: number, y0: number, x1: number, y1: number, r: number): P2[] {
  const pts: P2[] = [];
  const corner = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 5; i++) { const a = a0 + (Math.PI / 2) * (i / 5); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return pts;
}

/** a flat shape extruded up from z by th: the walls that face us, then a lit top */
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

const ring = (cx: number, cy: number, z: number, r: number): V3[] => Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

// where the replies land: stacked toward us down the right (+x), each joined to a rail in front
const RY = 11.5; // the rail runs along x at this y, in front of the replies
const REPLY = [0, 1, 2].map((i) => ({ x0: -3 + i * 7, x1: 2.5 + i * 7, y0: -6, y1: 8 }));

export const threads: Illustration = {
  k: "threads", name: "Threads", title: "No threads yet", body: "Reply to a message to start a thread, and it will live here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(-1, 0, -6);
    p.shadow(-12, -1, 26, 13, 0.1);
    p.shadow(6, 1, 24, 12, 0.1);
    // the parent message
    slab(p, rrect(-19, -12, -6, 11, 4), 0, 3);
    p.face(ring(-15, -7.5, 3.02, 2.4), SH.right, SH.edge, 0.55);
    p.line([[-16.5, -3, 3.05], [-16.5, 8, 3.05]], SH.edge, 0.9);
    p.line([[-13.5, -3, 3.05], [-13.5, 4, 3.05]], SH.edge, 0.9);
    p.line([[-10.5, -9, 3.05], [-10.5, 8, 3.05]], SH.edge, 0.9);
    // the rail: a raised strip running out of the parent, with a short branch to each reply
    for (const r of REPLY) p.box((r.x0 + r.x1) / 2 - 0.8, r.y1 - 0.5, 0, 1.6, RY - r.y1, 1.2, { top: 0.22 });
    p.box(-8, RY - 0.8, 0, 24, 1.6, 1.2, { top: 0.22 });

    // each reply drops in on its turn; at the end of the loop all of them sink away together
    const out = u > 0.86 ? easeInOut(Math.min(1, (u - 0.86) / 0.1)) : 0;
    let next = -1;
    REPLY.forEach((r, i) => {
      const t0 = 0.08 + i * 0.22, v = (u - t0) / 0.16;
      if (v < 0) { if (next < 0) next = i; return; }
      const f = Math.min(1, v);
      // fall with a small bounce at the end
      const drop = f < 0.75 ? 1 - Math.pow(f / 0.75, 2) : Math.sin(((f - 0.75) / 0.25) * Math.PI) * 0.12;
      const z = drop * 14;
      const k = Math.min(1, f * 3) * (1 - out);
      if (k < 0.05) return;
      const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2;
      if (z > 0.5) { p.guide([[r.x0, r.y1, z], [r.x0, r.y1, 0]], true); p.guide([[r.x1, r.y1, z], [r.x1, r.y1, 0]], true); }
      p.push();
      p.translate(0, 0, z);
      p.scale(k, [cx, cy, 0]);
      slab(p, rrect(r.x0, r.y0, r.x1, r.y1, 2.2), 0, 2.4);
      // the newest reply wears the accent
      const newest = i === 2 || u < 0.08 + (i + 1) * 0.22;
      p.face(ring(cx, r.y0 + 3, 2.42, 1.8), newest ? 0.32 : SH.right, SH.edge, 0.5);
      p.line([[cx - 1.1, r.y0 + 6.5, 2.45], [cx - 1.1, r.y1 - 2, 2.45]], SH.edge, 0.85);
      p.line([[cx + 1.3, r.y0 + 6.5, 2.45], [cx + 1.3, r.y1 - 5 + i * 1.5, 2.45]], SH.edge, 0.85);
      p.pop();
    });
    // the next slot waits as a dashed outline
    if (next >= 0) {
      const r = REPLY[next];
      p.guide([...rrect(r.x0, r.y0, r.x1, r.y1, 2.6), rrect(r.x0, r.y0, r.x1, r.y1, 2.6)[0]].map(([x, y]) => [x, y, 0.05] as V3));
    }
  },
};
