// No plans yet: a closed wicker picnic hamper with two lid flaps, two arched handles on top and a checked cloth corner peeking out. Hover and the front flap lifts to show the cloth inside.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 15, D = 9, H = 13; // half length, half depth, body height

// an arched handle standing in the x z plane at y, between x0 and x1, on the lid top at z
function handle(p: Pen, x0: number, x1: number, y: number, z: number) {
  const cx = (x0 + x1) / 2, r = (x1 - x0) / 2;
  const arch = (ro: number, ri: number, hz: number): V3[] => {
    const o: V3[] = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; o.push([cx + Math.cos(a) * ro, y, z + Math.sin(a) * ro * hz]); }
    for (let i = 16; i >= 0; i--) { const a = (i / 16) * Math.PI; o.push([cx + Math.cos(a) * ri, y, z + Math.sin(a) * ri * hz]); }
    return o;
  };
  p.clear(arch(r + 0.9, r - 2.6, 1.5));
  p.face(arch(r, r - 1.8, 1.5), 0.34, 0);
}

export const picnic: Illustration = {
  k: "picnic", name: "Picnic basket", title: "No plans yet", body: "Make your first plan and it will be waiting for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = easeInOut(h);
    p.translate(0, 0, -13);
    p.shadow(0, 0, 30, 14, 0.12);
    p.rotate("z", -0.55);
    // the hamper: a lit woven front, a sparse end, bands of weave cut across them
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.04, left: 0.2, right: 0.065, edge: 0 });
    for (const z of [3.4, 6.8, 10.2]) p.line([[-W, D + 0.03, z], [W, D + 0.03, z], [W + 0.03, -D, z]], SH.edge, 0.8);
    // two leather straps down the front, bright, edged with cuts
    for (const x of [-8.5, 8.5]) {
      p.face([[x - 1.3, D + 0.06, H], [x + 1.3, D + 0.06, H], [x + 1.3, D + 0.06, 5], [x - 1.3, D + 0.06, 5]], 0.34, 0);
      p.line([[x - 1.3, D + 0.08, 7], [x + 1.3, D + 0.08, 7]], SH.edge, 0.8);
    }
    // inside under the front flap: the checked cloth
    if (e > 0.02) {
      const n = 5, sx = (2 * W - 2) / n, sy = (D - 1) / 2;
      for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
        const x = -W + 1 + i * sx, y = 0.3 + j * sy;
        p.face([[x, y, H - 1], [x + sx, y, H - 1], [x + sx, y + sy, H - 1], [x, y + sy, H - 1]], (i + j) % 2 ? 0.32 : 0.04, 0);
      }
    }
    // the back flap
    p.box(-W - 0.6, -D - 0.6, H, 2 * W + 1.2, D + 0.4, 1.6, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    // the front flap, lifting on its hinge
    p.push();
    p.rotate("x", 0.55 * e + h * Math.sin(t * 4) * 0.04, [0, -0.2, H + 1.6]);
    p.box(-W - 0.6, -0.2, H, 2 * W + 1.2, D + 0.8, 1.6, { top: 0.26, left: 0.12, right: 0.065, edge: 0 });
    p.pop();
    // the handles stand on the hinge between the flaps
    handle(p, -12.5, -1.5, -0.2, H + 1.6);
    handle(p, 1.5, 12.5, -0.2, H + 1.6);
    // a checked cloth corner hanging out under the front flap, on the left
    const cy = D + 0.08, tri: V3[] = [[-W + 1, cy, H], [-W + 10, cy, H], [-W + 3, cy, H - 8]];
    p.face(tri, 0.32, 0);
    const L = (a: V3, c: V3, k: number): V3 => [a[0] + (c[0] - a[0]) * k, cy + 0.04, a[2] + (c[2] - a[2]) * k];
    const [A, B, C] = tri;
    for (const k of [0.34, 0.67]) {
      p.line([L(A, C, k), L(B, C, k)], SH.edge, 0.8);
      p.line([L(A, B, k), L(C, B, k)], SH.edge, 0.8);
    }
  },
};
