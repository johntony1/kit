// No stars earned: a big chunky star standing up, two small stars beside it. Hover and the big star spins round once and the small ones pop.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
/** screen winding of a polygon, its sign telling which way it faces */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

/** a five point star standing in the x z plane, centred on (0, 0, cz), with a thickness t along y */
function star(p: Pen, cz: number, R: number, r: number, t: number, lit: number, cut = true) {
  const pts = (y: number, k = 1): V3[] => Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = (i % 2 ? r : R) * k; return [Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });
  const F = pts(t), B = pts(-t);
  // the edges round it, then whichever big face looks at us
  for (let i = 0; i < 10; i++) {
    const j = (i + 1) % 10, q: V3[] = [F[i], B[i], B[j], F[j]];
    if (facing(p, q) > 0) p.face(q, 0.12, 0);
  }
  const front = facing(p, F) < 0;
  const face = front ? F : B.slice().reverse();
  p.face(face, front ? lit : 0.12, 0);
  // a smaller star cut inside the face
  if (!cut) return;
  const yy = front ? t + 0.05 : -t - 0.05;
  const inner = pts(yy, 0.55);
  p.line([...inner, inner[0]], SH.edge, 0.8);
}

export const goldstars: Illustration = {
  k: "goldstars", name: "Gold stars", title: "No stars earned", body: "Finish a lesson to earn your first gold star.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 24, 10, 0.12);
    // a small star behind on the right
    const pop = (k: number) => (k <= 0 ? 0 : k < 0.6 ? ease(k / 0.6) * 1.25 : 1.25 - 0.25 * ease((k - 0.6) / 0.4));
    const s1 = 1 + 0.3 * pop(clamp((h - 0.55) / 0.45)) - 0.3 * clamp((h - 0.55) / 0.45);
    p.push(); p.translate(10, -12, 22); p.rotate("z", -0.5 - 0.6 * h + h * Math.sin(t * 2) * 0.1); p.scale(s1); star(p, 0, 6.5, 2.8, 1.2, 0.3, false); p.pop();
    // the big star: turned to face us, spinning one turn on hover, rocking gently while hovered
    p.push();
    p.rotate("z", -0.5 + ease(clamp(h / 0.75)) * Math.PI * 2 + h * Math.sin(t * 2.2) * 0.12);
    star(p, 15.5, 16, 7, 2.2, 0.3, false);
    p.pop();
    // a small star in front on the left
    const s2 = 1 + 0.3 * pop(clamp((h - 0.7) / 0.3)) - 0.3 * clamp((h - 0.7) / 0.3);
    p.push(); p.translate(-12, 9, 3); p.rotate("z", -0.4 + 0.25 * h); p.scale(s2); star(p, 0, 5.5, 2.4, 1, 0.3, false); p.pop();
  },
};
