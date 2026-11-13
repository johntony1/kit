// Nothing to tighten: a big screwdriver held on a slant just above a screw standing proud in a block of wood. Hover and it pushes onto the screw and turns it home, and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
type P2 = [number, number];
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s > 0;
};
/** a flat shape in the x z plane (counter clockwise), made y0..y1 thick: lit walls on top, shaded walls to the side, then its front */
function prism(p: Pen, prof: P2[], y0: number, y1: number, front: number, top: number, side: number) {
  for (let i = 0; i < prof.length; i++) {
    const [ax, az] = prof[i], [bx, bz] = prof[(i + 1) % prof.length];
    const q: V3[] = [[ax, y0, az], [ax, y1, az], [bx, y1, bz], [bx, y0, bz]];
    if (facing(p, q)) p.face(q, bx < ax ? top : side, 0);
  }
  p.face(prof.map(([x, z]) => [x, y1, z] as V3).reverse(), front, 0);
}
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}
// the handle: a fat grip with a rounded butt, tapering to a collar; the shaft runs from it to the tip along +x
const HANDLE: P2[] = [[-14, -3.4], [-3, -3.8], [-1.5, -2.2], [0, -1.6], [0, 1.6], [-1.5, 2.2], [-3, 3.8], [-14, 3.4], [-15.6, 2.2], [-16, 0], [-15.6, -2.2]];
const SHAFT: P2[] = [[0, -0.8], [11.5, -0.8], [13.5, -0.35], [13.5, 0.35], [11.5, 0.8], [0, 0.8]];

export const screwdriver: Illustration = {
  k: "screwdriver", name: "Screwdriver", title: "Nothing to tighten", body: "Everything is snug. Anything that needs fixing will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -10);
    p.shadow(2, 0, 26, 11, 0.1);
    p.rotate("z", -0.62);
    // the block of wood, a grain line on its face
    p.box(-4, -7, -6, 22, 14, 6, { top: 0.22, left: 0.13, right: 0.065, edge: 0 });
    p.line([[-4, 7.03, -3.6], [18, 7.03, -2.9]], SH.edge, 0.6);
    // the screw: a head standing proud that sinks home as it is turned
    const k = ease(Math.max(0, Math.min(1, (h - 0.3) / 0.55)));
    const proud = 3.5 * (1 - k), spin = k * Math.PI * 3;
    if (proud > 0.2) p.cylinder(10, 0, 0, 1, proud, { side: 0.26, top: 0.26, edge: 0 });
    p.cylinder(10, 0, proud, 2.6, 1, { side: 0.2, top: 0.3, edge: 0 });
    p.line([[10 - Math.cos(spin) * 2, -Math.sin(spin) * 2, proud + 1.05], [10 + Math.cos(spin) * 2, Math.sin(spin) * 2, proud + 1.05]], SH.edge, 0.9);
    // the screwdriver: held on a slant just off the screw; on hover it pushes in and drives it
    const d = ease(Math.min(1, h / 0.32));
    p.push();
    p.translate(10, 0, proud + 1.2);
    p.rotate("y", Math.PI / 2 - 0.72 + h * Math.sin(t * 2) * 0.01);
    p.translate(-13.6 - 4 * (1 - d), 0, 0);
    prism(p, SHAFT, -0.8, 0.8, 0.3, 0.3, 0.12);
    prism(p, HANDLE, -3.4, 3.4, 0.22, 0.3, 0.07);
    // grip flutes cut into the handle's face; they slide round as it turns
    const f = (spin / (Math.PI * 2)) % 1;
    for (const z of [-2.6, -0.9, 0.8, 2.5]) { const zz = -3.1 + ((z + 3.1 + f * 1.7) % 6.2); p.line([[-13.2, 3.43, zz], [-4.2, 3.43, zz]], SH.edge, 0.75); }
    p.line([[-3, 3.43, -3.8], [-3, 3.43, 3.8]], SH.edge, 0.6);
    p.pop();
    const b = Math.max(0, (h - 0.82) / 0.18);
    if (b > 0) tick(p, [14, -10, 16], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
