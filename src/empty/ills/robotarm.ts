// Robot arm: a jointed arm on a base, holding a small block in its gripper. It lifts the block, sets it back down and lets go, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 3.4, L1 = 14, L2 = 13;
const SX = -5, SZ = 9.5; // the shoulder
const TX = 9.5; // where the block sits

// a straight limb between two joints: a flat bar with its depth showing behind it
function limb(p: Pen, a: [number, number], b: [number, number], w: number) {
  const du = b[0] - a[0], dv = b[1] - a[1], n = Math.hypot(du, dv) || 1, nu = (-dv / n) * w, nv = (du / n) * w;
  const quad = (y: number): V3[] => [[a[0] + nu, y, a[1] + nv], [b[0] + nu, y, b[1] + nv], [b[0] - nu, y, b[1] - nv], [a[0] - nu, y, a[1] - nv]];
  p.face(quad(-1.6), SH.right, 0);
  p.face(quad(1.6), 0.24, SH.edge, 0.55);
}
function joint(p: Pen, c: [number, number], r: number) {
  p.ringV("y", [c[0], -1.6, c[1]], r, SH.right, 0);
  p.ringV("y", [c[0], 1.63, c[1]], r, 0.34, SH.edge, 0.55);
  p.ringV("y", [c[0], 1.66, c[1]], r * 0.36, 0.02, 0);
}

export const robotarm: Illustration = {
  k: "robotarm", name: "Robot arm", title: "No builds running", body: "Start a build and you can follow each step of it from here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    // up for the first two thirds, a pause on the floor with the gripper open for the rest
    const e = u < 0.7 ? 0.5 - 0.5 * Math.cos((u / 0.7) * Math.PI * 2) : 0;
    const open = u < 0.7 ? 0 : Math.sin(((u - 0.7) / 0.3) * Math.PI);
    p.translate(0, 0, -15);
    p.scale(1.12);
    p.shadow(-2, 1, 24, 11, 0.11);
    p.rotate("z", -0.5);
    // the base and the turret
    p.box(SX - 7, -5.5, 0, 14, 11, 3);
    p.cylinder(SX, 0, 3, 4.4, 3.4, { side: 0.14, top: 0.22 });
    // the block's place, and the pose that reaches it: two limbs, elbow up
    const bz = 12 * e, W: [number, number] = [TX, bz + 5 + 4.6];
    const dx = W[0] - SX, dz = W[1] - SZ, d = Math.hypot(dx, dz);
    const a1 = Math.atan2(dz, dx) + Math.acos(Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
    const E: [number, number] = [SX + Math.cos(a1) * L1, SZ + Math.sin(a1) * L1];
    limb(p, [SX, SZ], E, 2);
    limb(p, E, W, 1.6);
    joint(p, [SX, SZ], 3.2);
    joint(p, E, 2.7);
    // the gripper: a bar and two fingers, the block between them
    const g = 2.7 + 1.5 * open;
    p.box(TX - g - 0.9, -1.6, W[1] - 4.6, 1.3, 3.2, 3.6, { top: 0.3, left: 0.3, right: 0.1, lw: 0.45 });
    p.box(TX - 2.5, -2.5, bz, 5, 5, 5, { top: 0.9, left: 0.3, right: 0.14 });
    p.box(TX + g - 0.4, -1.6, W[1] - 4.6, 1.3, 3.2, 3.6, { top: 0.3, left: 0.3, right: 0.1, lw: 0.45 });
    p.box(TX - g - 0.9, -1.6, W[1] - 1, g * 2 + 1.8, 3.2, 1.4, { top: 0.3, left: 0.3, right: 0.1, lw: 0.45 });
    joint(p, [W[0], W[1] + 0.6], 1.9);
  },
};
