// No graduations yet: a mortarboard with its tassel hanging over the edge. Hover and the cap is tossed up with a quarter turn, the tassel swinging, and a star pops in over it once it lands.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const B = 14, BZ = 11, BH = 1.8; // half width of the board, its height off the floor, its thickness

/** a thick bright stroke through 3D points, drawn flat to the screen */
function stroke(p: Pen, pts: V3[], w: number) {
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.lineCap = "round"; c.lineJoin = "round"; c.lineWidth = w; c.strokeStyle = "#fff";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

function star(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((c) => {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.strokeStyle = "#000"; c.lineWidth = 1.6; c.lineJoin = "round"; c.stroke(); c.fillStyle = "#fff"; c.fill();
  });
}

export const gradcap: Illustration = {
  k: "gradcap", name: "Graduation cap", title: "No graduations yet", body: "Finish a course and your graduation will be celebrated here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = Math.min(1, h * 1.25);
    const lift = 5 * Math.sin(Math.PI * k), turn = (Math.PI / 2) * ease(k);
    p.translate(0, 0, -6);
    p.scale(1.1);
    p.shadow(0, 0, 24, 11, 0.12 * (1 - lift / 12));
    p.translate(0, 0, lift);
    p.rotate("z", turn);
    p.rotate("x", 0.12 * Math.sin(Math.PI * k));
    // the skull cap under the board
    p.rotate("y", -0.16, [0, 0, BZ]);
    p.cylinder(0, 0, 0, 8.6, BZ, { side: 0.13, top: 0.13, edge: 0 });
    p.cylinder(0, 0, 0, 8.6, 1.4, { side: 0.26, top: 0.13, edge: 0 }); // the lit hem
    // the board: a lit top, a dense near wall, a sparse far wall
    p.box(-B, -B, BZ, B * 2, B * 2, BH, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    const Z = BZ + BH + 0.03;
    // the button and the cord to the edge
    p.cylinder(0, 0, Z, 1.4, 0.8, { side: 0.3, top: 0.5, edge: 0 });
    const E: V3 = [B, 4, Z];
    // the cord across the lit top is a dark cut; where it hangs in the air it is bright
    p.line([[0, 0, Z + 0.8], [B * 0.55, 2.4, Z + 0.1], E], 0, 1.3);
    p.line([[-B, B, Z], [B, B, Z], [B, -B, Z]], 1, 0.6);
    // the tassel hangs from the edge and swings while the cap flies
    const sw = (0.5 * Math.sin(Math.PI * k) + h * 0.12 * Math.sin(t * 4)) * (1 - 0.3 * k);
    const L = 8, dir: V3 = [Math.sin(sw), 0, -Math.cos(sw)];
    const at = (s: number): V3 => [E[0] + dir[0] * s, E[1], E[2] + dir[2] * s];
    stroke(p, [E, at(L)], 1.3);
    const [a0, a1] = [p.pt(at(L - 0.6)), p.pt(at(L + 5))];
    p.screen((c) => {
      const dx = a1[0] - a0[0], dy = a1[1] - a0[1], n = Math.hypot(dx, dy) || 1, ox = (-dy / n), oy = dx / n;
      c.beginPath();
      c.moveTo(a0[0] + ox * 0.9, a0[1] + oy * 0.9); c.lineTo(a1[0] + ox * 2.2, a1[1] + oy * 2.2);
      c.lineTo(a1[0] - ox * 2.2, a1[1] - oy * 2.2); c.lineTo(a0[0] - ox * 0.9, a0[1] - oy * 0.9);
      c.closePath(); c.fillStyle = "#fff"; c.fill();
    });
    // a star once it has landed
    const s = Math.max(0, (h - 0.78) / 0.22);
    if (s > 0) star(p, [0, 0, Z + 7.5], 4 * (s < 0.6 ? ease(s / 0.6) * 1.15 : 1.15 - 0.15 * ease((s - 0.6) / 0.4)));
  },
};
