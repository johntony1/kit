// Nothing on the beach yet: a sandcastle of three bucket shaped towers, a tall one in the middle with an arched door and two short ones beside it, square merlons round every rim and a flag on a thin pole. Hover and the flag runs up the pole and waves.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const K = 0.57735;
const arc = (cx: number, cy: number, r: number, z: number, a0: number, a1: number, n = 20): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });
const F0 = -Math.PI / 4, F1 = (3 * Math.PI) / 4; // the visible half of a round wall

// a bucket shaped tower: a wall wider at its foot, a shaded flank on the right, a ridge, a dark top ringed by merlons
function tower(p: Pen, cx: number, cy: number, r0: number, r1: number, hgt: number) {
  p.face([...arc(cx, cy, r0, 0, F0, F1), ...arc(cx, cy, r1, hgt, F0, F1).reverse()], 0.2, 0);
  p.face([...arc(cx, cy, r0 + 0.03, 0, F0, F0 + 0.75, 8), ...arc(cx, cy, r1 + 0.03, hgt, F0, F0 + 0.75, 8).reverse()], 0.065, 0);
  // one ridge round the bucket, a dark cut
  const zr = hgt * 0.32, rr = r0 + (r1 - r0) * 0.32 + 0.05;
  p.line(arc(cx, cy, rr, zr, F0, F1), SH.edge, 0.9);
  p.disc(cx, cy, hgt, r1, 0.2);
  p.disc(cx, cy, hgt + 0.02, r1 - 1.6, 0.03);
  // merlons round the rim, far ones first
  const N = 5;
  const ms = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2 + Math.PI / 4).sort((a, b) => Math.sin(a + Math.PI / 4) - Math.sin(b + Math.PI / 4));
  for (const a of ms) {
    p.push();
    p.translate(cx + Math.cos(a) * (r1 - 1.4), cy + Math.sin(a) * (r1 - 1.4), hgt);
    p.rotate("z", a);
    p.box(-1.5, -1.9, 0, 3, 3.8, 3.4, { top: 0.26, left: 0.16, right: 0.065, edge: 0 });
    p.pop();
  }
}

export const sandcastle: Illustration = {
  k: "sandcastle", name: "Sandcastle", title: "Nothing on the beach yet", body: "Plan your first trip and your beach days will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = easeInOut(h);
    p.translate(0, 0, -16);
    p.shadow(0, 0, 32, 13, 0.12);
    // the two short towers, left and right, then the tall one in the middle (it stands a little in front)
    tower(p, -10.5, 10.5, 7, 5.6, 12);
    tower(p, 10.5, -10.5, 7, 5.6, 12);
    tower(p, 1.5, 1.5, 8.6, 6.8, 20);
    // the arched door on the tall tower's front
    const dc: V3 = [1.5 + Math.cos(Math.PI / 4) * 8.4, 1.5 + Math.sin(Math.PI / 4) * 8.4, 0];
    const door: V3[] = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; door.push([dc[0] + Math.cos(a) * 3.2 * 0.707, dc[1] - Math.cos(a) * 3.2 * 0.707, 6.5 + Math.sin(a) * 3.2]); }
    door.push([dc[0] - 2.26, dc[1] + 2.26, 0.2], [dc[0] + 2.26, dc[1] - 2.26, 0.2]);
    p.clear(door);
    // the flag: a thin bright pole from the tall tower, the flag runs up it and waves
    const base: V3 = [1.5, 1.5, 20], top: V3 = [1.5, 1.5, 33];
    const [bx, by] = p.pt(base), [tx, ty] = p.pt(top);
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.beginPath(); g.moveTo(bx, by); g.lineTo(tx, ty); g.stroke(); });
    const fz = 28 + 5 * e, w = Math.sin(t * 6) * h;
    const f = (u: number, v: number): V3 => [1.5 + 0.4 + u * K, 1.5 - u * K, fz + v + Math.sin(u * 0.7 + t * 6) * 0.5 * h];
    p.face([f(0, 0), f(4.5, -0.4 + w * 0.3), f(9, -2), f(4.5, -3.6 - w * 0.3), f(0, -5)], 0.4, 0);
  },
};
