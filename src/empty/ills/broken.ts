// Page did not load: three broken tiles tumble out of a hole above and fall through a hole below, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const HR = 9, ZT = 34; // hole radius, height of the top hole
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
const ring = (z: number, r = HR, n = 48): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
/** the front half of a hole's rim, from its left end to its right end on screen */
const front = (z: number, r = HR): V3[] => Array.from({ length: 25 }, (_, i) => { const a = (3 * Math.PI) / 4 - (i / 24) * Math.PI; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

/** a square tile, centred on the origin, with a mark on its face */
const tile = (p: Pen, mark: number) => {
  const s = 5.2, th = 0.8;
  const top: V3[] = [[-s, -s, th], [s, -s, th], [s, s, th], [-s, s, th]];
  const bot: V3[] = top.map(([x, y]) => [x, y, -th] as V3).reverse();
  const sides: V3[][] = top.map((a, i) => { const b = top[(i + 1) % 4]; return [a, [a[0], a[1], -th], [b[0], b[1], -th], b] as V3[]; });
  for (const f of sides) if (facing(p, f) > 0) p.face(f, 0.1, SH.edge, 0.5);
  if (facing(p, bot) > 0) { p.face(bot, 0.08, SH.edge, 0.55); return; }
  p.face(top, 0.2, SH.edge, 0.6);
  const z = th + 0.05, lw = 0.8;
  if (mark === 0) { // a cross
    p.line([[-2.2, -2.2, z], [2.2, 2.2, z]], 1, lw); p.line([[2.2, -2.2, z], [-2.2, 2.2, z]], 1, lw);
  } else if (mark === 1) { // a warning triangle
    p.line([[2.8, -2.6, z], [2.8, 2.6, z], [-2.8, 0, z], [2.8, -2.6, z]], 1, lw);
    p.line([[-0.6, 0, z], [1.2, 0, z]], 1, lw); p.dot([2, 0, z], 0.4, 1);
  } else { // a sad face
    p.dot([-1.5, -1.4, z], 0.6, 1); p.dot([-1.5, 1.4, z], 0.6, 1);
    p.line(Array.from({ length: 9 }, (_, i) => { const a = -0.9 + (i / 8) * 1.8; return [2.7 - Math.cos(a) * 1.6, Math.sin(a) * 2, z] as V3; }), 1, lw);
  }
};

export const broken: Illustration = {
  k: "broken", name: "Broken tiles", title: "This page didn't load", body: "Something went wrong on our side. Refresh the page or try again in a moment.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -ZT / 2 + 1);
    // the two holes: dark openings in a thin lip, rims bright
    const hole = (z: number) => {
      const o = ring(z, HR + 2.2), i = ring(z, HR);
      p.face([...o, o[0], i[0], ...i.slice().reverse()], 0.16, 0);
      p.line([...o, o[0]], SH.edge, 0.6);
      p.line([...i, i[0]], SH.edge, 0.7);
      p.line(ring(z - 2.4, HR).slice(19, 42), 0.35, 0.45); // the inner wall, far side
    };
    hole(0);
    hole(ZT);
    // the falling tiles, seen only between the top hole's front rim and the bottom hole's front rim
    p.screen((c) => {
      const up = front(ZT, HR + 2.2).map((v) => p.pt(v)), dn = front(0).map((v) => p.pt(v));
      c.beginPath();
      up.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      dn.slice().reverse().forEach(([x, y]) => c.lineTo(x, y));
      c.closePath(); c.clip();
      // higher tiles first, lower ones over them
      const tiles = [0, 1, 2].map((i) => {
        const u = ((t / P) + i / 3) % 1;
        return { i, u, z: ZT + 6 - (ZT + 22) * Math.pow(u, 1.6) };
      }).sort((a, b) => b.z - a.z);
      for (const { i, u, z } of tiles) {
        p.push();
        p.translate(Math.sin(i * 2.1) * 1.2, Math.cos(i * 1.7) * 1.2, z);
        // turned to face us, wobbling, spinning in its own plane as it falls
        const w = u * Math.PI * 2 + i * 2.1;
        p.rotate("x", -Math.PI / 4 + 0.55 * Math.sin(w));
        p.rotate("y", 0.62 + 0.4 * Math.sin(w * 0.5 + 1));
        p.rotate("z", i ? 1.05 + 0.45 * Math.sin(w * 1.5) * (i === 1 ? 1 : -1) : 0.4 + u * 2.4); // the marked tiles stay roughly upright
        tile(p, i);
        p.pop();
      }
    });
    // redraw the front rims so the cut reads crisp
    p.line(front(0), SH.edge, 0.7);
    p.line(front(ZT, HR + 2.2), SH.edge, 0.6);
  },
};
