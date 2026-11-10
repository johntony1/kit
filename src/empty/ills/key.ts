// No API keys: a key in a small lock plate. Hover and the key turns a quarter, the bolt slides back and a light comes on.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ZK = 15; // height of the keyhole
const YF = 0; // the front of the plate
const BY = 15.5, BR = 5, BH = 2.1; // the bow: where it sits along the key, its radius, its hole

// turn a point about the key's axis (parallel to y, through x = 0, z = ZK); a positive angle takes +x up towards +z
const turn = ([x, y, z]: V3, c: number, s: number): V3 => [x * c - (z - ZK) * s, y, ZK + x * s + (z - ZK) * c];
const tone = (n: V3) => (n[2] > 0.5 ? SH.top : n[1] >= n[0] ? SH.left : SH.right);

/** an axis aligned block in the key's own frame, turned with it; only the faces towards us are drawn */
function block(p: Pen, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: number, s: number, halo = 0) {
  if (halo) { x0 -= halo; z0 -= halo; x1 += halo; z1 += halo; y1 += halo; }
  const faces: [V3, V3[]][] = [
    [[1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
    [[-1, 0, 0], [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]]],
    [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    [[0, 0, -1], [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]],
    [[0, 1, 0], [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]],
  ];
  for (const [n, q] of faces) {
    const m: V3 = [n[0] * c - n[2] * s, n[1], n[0] * s + n[2] * c];
    if (m[0] + m[1] + m[2] <= 0.01) continue;
    if (halo) p.clear(q.map((v) => turn(v, c, s))); else p.face(q.map((v) => turn(v, c, s)), tone(m), 0);
  }
}
const circle = (y: number, r: number, x: number, c: number, s: number, n = 36): V3[] =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return turn([x, y + Math.cos(a) * r, ZK + Math.sin(a) * r], c, s); });

export const key: Illustration = {
  k: "key", name: "Key", title: "No API keys", body: "Create a key to connect your apps, and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, -4, -14);
    p.shadow(0, 4, 24, 11, 0.1);
    // the lock plate: a lit front, a lit top, a sparse side
    p.box(-10, -6, 0, 20, 6, 28, { top: 0.2, left: 0.12, right: 0.065 });
    p.line([[-10, YF, 28], [10, YF, 28]], SH.edge, 0.7);
    // screws in the corners
    for (const [x, z] of [[-7.5, 25.5], [7.5, 25.5], [-7.5, 2.8], [7.5, 2.8]]) p.dot([x, YF + 0.02, z], 0.9, 0);
    // the bolt on the side: out while locked, slides back as the key turns
    const bolt = 5 * (1 - h);
    if (bolt > 0.2) p.box(10, -4.2, 9, bolt, 2.6, 3, { top: 0.2, left: 0.12, right: 0.12 });
    // the light above the keyhole: dark, then on
    p.dot([0, YF + 0.03, 23], 1.6, 0);
    if (h > 0.5) p.dot([0, YF + 0.04, 23], 1.3 * Math.min(1, (h - 0.5) * 3), 1);
    // the keyhole: a round hole and a slot
    p.clear(Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return [Math.cos(a) * 2.8, YF + 0.02, ZK + Math.sin(a) * 2.8] as V3; }));
    p.clear([[-1.1, YF + 0.02, ZK], [1.1, YF + 0.02, ZK], [1.6, YF + 0.02, ZK - 6.5], [-1.6, YF + 0.02, ZK - 6.5]]);

    // the key, turning a quarter on hover
    const a = h * Math.PI * 0.5, c = Math.cos(a), s = Math.sin(a);
    // teeth sit under the blade; once turned they face away from us, so draw them first then
    const teeth = () => { block(p, -0.5, 0.2, ZK - 2.8, 0.5, 2.2, ZK - 1, c, s); block(p, -0.5, 3.4, ZK - 2.2, 0.5, 4.8, ZK - 1, c, s); block(p, -0.5, 6, ZK - 3, 0.5, 7.6, ZK - 1, c, s); };
    const blade = () => block(p, -0.6, 0, ZK - 1, 0.6, BY - BR + 0.6, ZK + 1, c, s);
    // a dark halo first, so the key stands clear of the plate
    block(p, -0.6, 0, ZK - 3, 0.6, BY - BR + 0.6, ZK + 1, c, s, 0.8);
    p.clear(circle(BY, BR + 0.8, 0.9, c, s)); p.clear(circle(BY, BR + 0.8, -0.9, c, s));
    if (a > 0.6) { teeth(); blade(); } else { blade(); teeth(); }
    // the bow: a thick ring with a hole, stepped from its back face to its front
    const ringFace = (x: number) => [...circle(BY, BR, x, c, s), ...circle(BY, BH, x, c, s).reverse()];
    for (let x = -0.9; x < 0.9; x += 0.2) p.face(ringFace(x), SH.right, 0);
    p.face(ringFace(0.9), SH.top, 0);
    // a notch line on the bow, so the turn reads
    p.line([turn([0.92, BY + BH + 0.6, ZK], c, s), turn([0.92, BY + BR - 0.7, ZK], c, s)], SH.edge, 0.7);
  },
};
