// No lessons yet: one big alphabet block, a bold letter cut into each lit side. Hover and it hops, rolls a quarter turn to show the next letter and lands with a bounce.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = 24; // block size
type L = [number, number][][]; // a letter: strokes in face coords, 0..1 across and up
const GL: Record<string, L> = {
  A: [[[0.18, 0.12], [0.5, 0.88], [0.82, 0.12]], [[0.31, 0.4], [0.69, 0.4]]],
  B: [[[0.26, 0.12], [0.26, 0.88], [0.58, 0.88], [0.7, 0.78], [0.7, 0.6], [0.58, 0.51], [0.26, 0.51]], [[0.58, 0.51], [0.74, 0.41], [0.74, 0.22], [0.6, 0.12], [0.26, 0.12]]],
  C: [[[0.76, 0.76], [0.6, 0.88], [0.4, 0.88], [0.24, 0.72], [0.24, 0.28], [0.4, 0.12], [0.6, 0.12], [0.76, 0.24]]],
  D: [[[0.26, 0.12], [0.26, 0.88], [0.52, 0.88], [0.74, 0.68], [0.74, 0.32], [0.52, 0.12], [0.26, 0.12]]],
};

/** twice the screen area of a polygon, positive when it faces us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

/** the block centred on the origin from z = 0 up: every face that looks at us, a letter on each side */
function block(p: Pen, letters: string[]) {
  const h = S / 2;
  const sides: [V3, V3, V3, V3][] = [
    [[-h, h, 0], [S, 0, 0], [0, 0, S], [0, 1, 0]],
    [[h, h, 0], [0, -S, 0], [0, 0, S], [1, 0, 0]],
    [[h, -h, 0], [-S, 0, 0], [0, 0, S], [0, -1, 0]],
    [[-h, -h, 0], [0, S, 0], [0, 0, S], [-1, 0, 0]],
  ];
  const top: V3[] = [[-h, -h, S], [h, -h, S], [h, h, S], [-h, h, S]];
  p.face(top, 0.28, 0);
  sides.forEach(([o, a, u, n], i) => {
    const at = (s: number, v: number, lift = 0): V3 => [o[0] + a[0] * s + u[0] * v + n[0] * lift, o[1] + a[1] * s + u[1] * v + n[1] * lift, o[2] + a[2] * s + u[2] * v + n[2] * lift];
    const f = [at(0, 0), at(0, 1), at(1, 1), at(1, 0)];
    if (facing(p, f) <= 0) return;
    // tone by where the side points on screen: toward the left is lit, toward the right in shade
    const c0 = p.pt(at(0.5, 0.5)), c1 = p.pt(at(0.5, 0.5, 1));
    const lit = c1[0] < c0[0];
    p.face(f, lit ? 0.24 : 0.15, 0);
    // the letter cut in bold
    p.line([at(0, 1, 0.05), at(1, 1, 0.05)], 0, 0.6); // the top edge, a cut so the top reads apart
    for (const st of GL[letters[i]]) p.line(st.map(([s, v]) => at(s, v, 0.05)), 0, 2.4);
  });
}

export const alphabet: Illustration = {
  k: "alphabet", name: "Alphabet blocks", title: "No lessons yet", body: "Pick a course to begin. Your lessons will be lined up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = Math.min(1, h * 1.15);
    // the hop: up, a quarter roll at the top, down with a small bounce
    const hop = k < 0.72 ? 5 * Math.sin((k / 0.72) * Math.PI) : 1.1 * Math.sin(((k - 0.72) / 0.28) * Math.PI);
    const turn = (Math.PI / 2) * ease(Math.min(1, k / 0.68));
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26 - hop, 12 - hop * 0.4, 0.12);
    p.rotate("z", -0.08 + turn);
    p.translate(0, 0, hop);
    block(p, ["A", "B", "C", "D"]);
  },
};
