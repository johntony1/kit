// Whistle: a coach's whistle on its cord. Hover and it lifts, tips back and blows: three sharp marks burst from its slot.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const TAU = Math.PI * 2;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** a flat shape standing in the plane y = y0 (facing +y), thickness T going back: rim then front */
function slab(p: Pen, pts: P2[], y0: number, T: number, front: number) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; }
  const sg = a > 0 ? 1 : -1;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const nx = (z1 - z0) * sg, nz = -(x1 - x0) * sg;
    if (nx + nz <= 0.001) continue;
    p.face([[x0, y0, z0], [x1, y0, z1], [x1, y0 - T, z1], [x0, y0 - T, z0]], nz > Math.abs(nx) ? 0.3 : SH.right, 0);
  }
  p.face(pts.map(([x, z]) => [x, y0, z] as V3), front, SH.edge, 0.6);
}
const CX = -6, CZ = 10, R = 10, T = 8, Y = T / 2; // the drum, the thickness
// the side view: a round drum with the mouthpiece running off its top
const BODY: P2[] = [[20, 20], [CX, 20], ...Array.from({ length: 33 }, (_, i) => { const a = Math.PI / 2 + (i / 32) * (TAU - Math.PI / 2 + 0.305); return [CX + Math.cos(a) * R, CZ + Math.sin(a) * R] as P2; }), [20, 13]];

export const whistle: Illustration = {
  k: "whistle", name: "Whistle", title: "No coaches yet", body: "Invite a coach and they will appear here, ready to run a session.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(-1, 0, -12);
    p.shadow(0, 0, 27, 12, 0.12);
    p.rotate("z", -0.5);
    p.translate(0, 0, 4 * e + h * Math.sin(t * 9) * 0.25);
    p.rotate("y", 0.16 * e, [CX, 0, CZ]);
    // the cord: a bright loop from the ring at the back, lying on the floor
    const cord = [[-19, 0, 10], [-25, 0, 4], [-24, 4, -4 * e], [-14, 9, -4 * e - 0.5], [-4, 12, -4 * e]].map((v) => p.pt(v as V3));
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath();
      g.moveTo(cord[0][0], cord[0][1]);
      g.quadraticCurveTo(cord[1][0], cord[1][1], cord[2][0], cord[2][1]);
      g.quadraticCurveTo(cord[3][0], cord[3][1], cord[4][0], cord[4][1]);
      g.stroke();
    });
    // the ring it hangs from
    slab(p, Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * TAU; return [CX - R - 2.2 + Math.cos(a) * 3.4, CZ + Math.sin(a) * 3.4] as P2; }), 1, 2, 0.3);
    p.dot([CX - R - 2.6, 1.05, CZ], 1.5, 0);
    // the body
    slab(p, BODY, Y, T, 0.22);
    // the slot: cut into the top where the mouthpiece meets the drum
    p.clear([[0.5, Y - 1, 20.02], [4.5, Y - 1, 20.02], [4.5, -Y + 1, 20.02], [0.5, -Y + 1, 20.02]]);
    p.clear([[0.5, Y + 0.03, 20], [4.5, Y + 0.03, 20], [2.5, Y + 0.03, 17.4]]);
    // the chamber, pressed into the side
    p.line(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * TAU; return [CX + Math.cos(a) * 5.4, Y + 0.03, CZ + Math.sin(a) * 5.4] as V3; }), SH.edge, 0.5);
    // the blast: three marks bursting up from the slot
    const k = Math.max(0, (h - 0.35) / 0.65);
    if (k > 0) {
      const pulse = 0.8 + 0.2 * Math.sin(t * 9);
      const [sx, sy] = p.pt([2.5, 0, 22]);
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round";
        for (const a of [-0.75, 0, 0.75]) {
          const r0 = 3.5, r1 = 3.5 + 7.5 * k * pulse;
          g.beginPath(); g.moveTo(sx + Math.sin(a) * r0, sy - Math.cos(a) * r0); g.lineTo(sx + Math.sin(a) * r1, sy - Math.cos(a) * r1); g.stroke();
        }
      });
    }
  },
};
