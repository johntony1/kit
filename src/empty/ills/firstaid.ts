// No emergency contacts: a first aid case with a cross on its front. Hover and the lid swings open, a plaster floats out and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 14, D = 7.5, HB = 11, HL = 4.6; // half width, half depth, body height, lid height
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a box that may be turned any way: all six faces, only the ones looking at us drawn */
function rbox(p: Pen, x: number, y: number, z: number, w: number, d: number, hh: number, inside: number) {
  const X = x + w, Y = y + d, Z = z + hh;
  const fs: [V3[], number][] = [
    [[[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], 0.2],
    [[[x, Y, z], [X, Y, z], [X, y, z], [x, y, z]], inside],
    [[[x, Y, Z], [X, Y, Z], [X, Y, z], [x, Y, z]], 0.13],
    [[[x, y, z], [X, y, z], [X, y, Z], [x, y, Z]], 0.05],
    [[[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], 0.065],
    [[[x, y, Z], [x, Y, Z], [x, Y, z], [x, y, z]], 0.05],
  ];
  for (const [f, fill] of fs) if (facing(p, f) > 0) p.face(f, fill, SH.edge, 0.55);
}
const plus = (cx: number, y: number, cz: number, a: number, b: number): V3[] =>
  ([[-b, a], [b, a], [b, b], [a, b], [a, -b], [b, -b], [b, -a], [-b, -a], [-b, -b], [-a, -b], [-a, b], [-b, b]] as [number, number][]).map(([u, v]) => [cx + u, y, cz + v] as V3);

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const firstaid: Illustration = {
  k: "firstaid", name: "First aid", title: "No emergency contacts", body: "Add someone we can reach for you if something goes wrong.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(clamp(h / 0.55)), a = 1.2 * e;
    p.translate(0, 0, -10);
    p.shadow(0, 1, 30, 14, 0.11);
    p.rotate("z", -0.3);
    // the body, with a bright cross on a dark front
    p.box(-W, -D, 0, 2 * W, 2 * D, HB, { top: 0.2, left: 0.12, right: 0.065, open: a > 0.04, lw: 0.6 });
    p.ringV("y", [0, D + 0.03, HB / 2], 4.7, 0.03, SH.soft, 0.45);
    p.face(plus(0, D + 0.05, HB / 2, 3.3, 1.15), 0.38, SH.edge, 0.5);
    if (a < 0.04) p.line([[-W, D + 0.04, HB], [W, D + 0.04, HB], [W + 0.04, -D, HB]], SH.edge, 0.8);
    // the lid, hinged along the back, with a handle
    p.push();
    p.rotate("x", a, [0, -D, HB]);
    rbox(p, -W, -D, HB, 2 * W, 2 * D, HL, 0.04);
    if (a < 0.6) {
      p.box(-4.5, -1, HB + HL, 9, 2, 1.3, { top: 0.28, left: 0.16, right: 0.08, lw: 0.5 });
      for (const x of [-9, 9]) p.face([[x - 1.3, D + 0.04, HB - 1.6], [x + 1.3, D + 0.04, HB - 1.6], [x + 1.3, D + 0.04, HB + 1.6], [x - 1.3, D + 0.04, HB + 1.6]], 0.3, SH.edge, 0.45);
    }
    p.pop();
    // the plaster: rises out of the open case and hangs there
    const k = clamp((h - 0.3) / 0.5);
    if (k > 0) {
      const c: V3 = [0, 1, HB + 2 + 9 * ease(k) + h * Math.sin(t * 2.2) * 0.6], s = Math.min(1, k * 2), co = Math.cos(0.5), si = Math.sin(0.5);
      const f = (u: number, v: number): V3 => { const U = (u * co - v * si) * s, V = (u * si + v * co) * s; return [c[0] + 0.5774 * U, c[1] - 0.5774 * U, c[2] + V]; };
      const L = 5.2, r = 2.3;
      const end = (sx: number): V3[] => Array.from({ length: 11 }, (_, i) => { const q = -Math.PI / 2 + (i / 10) * Math.PI; return f(sx * (L + Math.cos(q) * r), sx * Math.sin(q) * r); });
      p.face([...end(1), ...end(-1)], 0.3, SH.edge, 0.55);
      p.face([f(-2.3, -r), f(2.3, -r), f(2.3, r), f(-2.3, r)], 0.1, SH.edge, 0.5);
      for (const u of [-5.2, 5.2]) p.dot(f(u, 0), 0.55 * s, 0);
    }
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) badge(p, [16, 2, 27], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
