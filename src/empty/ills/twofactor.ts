// No authenticator set up: a phone showing a padlock over four empty code cells. Hover and the cells fill one by one, the lock springs open and a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 10.6, Y = 1.2, Z = 33, F = Y + 0.03;

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.36); g.lineTo(x + r * 0.48, y - r * 0.32); g.stroke();
  });
}

export const twofactor: Illustration = {
  k: "twofactor", name: "Two factor", title: "No authenticator set up", body: "Add an authenticator app to protect your account with a second step.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 2, 20, 8, 0.12);
    p.push();
    p.rotate("z", -0.42);
    const at = (x: number, z: number, d = 0): V3 => [x, F + d, z];
    const rect = (x0: number, z0: number, x1: number, z1: number, d = 0): V3[] => [at(x0, z0, d), at(x1, z0, d), at(x1, z1, d), at(x0, z1, d)];
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.3, left: 0.2, right: 0.065, lw: 0.7 });
    p.clear(rect(-X + 1.3, 1.6, X - 1.3, Z - 1.6));
    p.face(rect(-2.2, Z - 3.5, 2.2, Z - 2.8, 0.01), 0.2, 0); // the speaker
    // the padlock: its shackle swings open once the code is in
    const open = ease(cl((h - 0.62) / 0.2)), lz = 20.5;
    const arc = (r: number, dz: number): V3[] => Array.from({ length: 13 }, (_, i) => { const a = (Math.PI * i) / 12; return at(Math.cos(a) * r - open * 1.2, lz + 4.6 + dz + Math.sin(a) * (r + 0.6), 0.02); });
    const up = open * 1.5;
    p.face([at(3.3 - open * 1.2, lz + 3.6 + up, 0.02), ...arc(3.3, up), at(-3.3 - open * 1.2, lz + 3.6 + up, 0.02), at(-1.7 - open * 1.2, lz + 3.6 + up, 0.02), ...arc(1.7, up).reverse(), at(1.7 - open * 1.2, lz + 3.6 + up, 0.02)], 0.9, 0);
    p.face(rect(-4.4, lz - 2.6, 4.4, lz + 3.6, 0.03), 0.9, 0);
    p.dot(at(0, lz + 0.9, 0.05), 1.1, 0);
    p.line([at(0, lz + 0.9, 0.05), at(0, lz - 1, 0.05)], SH.edge, 0.9);
    // four code cells: hollow at rest, filling in turn
    for (let i = 0; i < 4; i++) {
      const x = -8.1 + i * 4.2, k = cl((h - 0.08 - i * 0.13) / 0.1);
      p.face(rect(x, 5.6, x + 3.6, 11.4, 0.02), 0.9, 0);
      if (k < 0.5) p.clear(rect(x + 0.8, 6.4, x + 2.8, 10.6, 0.03));
    }
    p.pop();
    const b = cl((h - 0.76) / 0.24);
    if (b > 0) tick(p, [10, -7, Z - 1], 4.8 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
