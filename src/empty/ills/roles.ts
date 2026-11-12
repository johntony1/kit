// No roles defined: three hats on three stands, a top hat, a crown and a graduation cap, one for each kind of role. Hover and they hop in turn, and the crown stays up with a sparkle.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const HZ = 1.2; // the top of a low stand

function stand(p: Pen, tall: number) {
  p.cylinder(0, 0, 0, 5.6, 1.2 + tall, { side: 0.065, top: 0.045 });
}
function topHat(p: Pen, z: number) {
  p.cylinder(0, 0, z, 6, 0.7, { side: 0.12, top: 0.22 }); // brim
  p.cylinder(0, 0, z + 0.7, 3.8, 1.8, { side: 0.04, top: 0.2 }); // band
  p.cylinder(0, 0, z + 2.5, 3.8, 6.3, { side: 0.13, top: 0.22, lw: 0.6 });
}
function crown(p: Pen, z: number) {
  const R = 5.4, H = 5.4, B = 3;
  // the points: a zigzag wall, the far half first
  const wall = (a0: number, a1: number, fill: number) => {
    const n = 40, lo: V3[] = [], hi: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n, w = (((a * 6) / (Math.PI * 2) + 0.25) % 1 + 1) % 1;
      lo.push([Math.cos(a) * R, Math.sin(a) * R, z + B]);
      hi.push([Math.cos(a) * R, Math.sin(a) * R, z + B + H * (0.3 + 0.7 * Math.abs(w - 0.5) * 2)]);
    }
    p.face([...lo, ...hi.reverse()], fill, SH.edge, 0.55);
  };
  wall(Math.PI * 0.75, Math.PI * 1.75, 0.045);
  wall(-Math.PI * 0.25, Math.PI * 0.75, 0.3);
  p.cylinder(0, 0, z, R, B, { side: 0.3, top: 0, edge: 0 });
  p.cylinder(0, 0, z + B * 0.3, R + 0.02, B * 0.4, { side: 0.03, top: 0, edge: 0 }); // a dark band of stones
  const rim: V3[] = Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(a) * R, Math.sin(a) * R, z + B] as V3; });
  p.line(rim, SH.edge, 0.6);
  for (let i = 0; i < 6; i++) { const a = ((i + 0.25) / 6) * Math.PI * 2; if (Math.cos(a) + Math.sin(a) > -0.2) p.dot([Math.cos(a) * R, Math.sin(a) * R, z + B + H + 0.7], 0.9, 1); }
}
function cap(p: Pen, z: number) {
  p.cylinder(0, 0, z, 3.9, 3.2, { side: 0.12, top: 0.2 });
  p.box(-6.6, -6.6, z + 3.2, 13.2, 13.2, 0.9, { top: 0.22, left: 0.045, right: 0.045, lw: 0.6 });
  // the button and the tassel, hanging off the right corner
  p.dot([0, 0, z + 4.15], 1, 0);
  p.line([[0, 0, z + 4.15], [6, -6, z + 4.15]], SH.edge, 0.7);
  p.box(6.2, -6.7, z + 0.6, 0.9, 0.9, 3.5, { top: 0.3, left: 0.3, right: 0.3, edge: 0 });
  p.box(5.8, -7.1, z - 1, 1.7, 1.7, 1.8, { top: 0.3, left: 0.3, right: 0.2, edge: 0 });
}

export const roles: Illustration = {
  k: "roles", name: "Roles", title: "No roles defined", body: "Create a role to decide what each group of people can see and do.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-3.5, -3.5, -10);
    p.scale(1.32);
    const hop = (i: number) => Math.sin(Math.max(0, Math.min(1, (h - i * 0.22) / 0.45)) * Math.PI) * 4.5;
    const up = ease(Math.max(0, Math.min(1, (h - 0.25) / 0.6))) * 4.5 + h * Math.sin(t * 2.6) * 0.5;
    const spots: [number, number, (z: number) => void][] = [
      [-5, -5, (z) => crown(p, z + 7 + up)],
      [-3, 11, (z) => topHat(p, z + hop(0))],
      [11, -3, (z) => cap(p, z + hop(2))],
    ];
    p.shadow(1, 1, 30, 15, 0.1);
    for (const [x, y, hat] of spots) {
      p.push(); p.translate(x, y, 0);
      stand(p, x < -4 ? 7 : 0);
      hat(HZ + 0.8);
      p.pop();
    }
    const k = Math.max(0, (h - 0.6) / 0.4);
    if (k > 0) ([[-13, -3, 20], [2, -10, 21], [-6, -6, 26]] as V3[]).forEach((q, i) => p.dot(q, 0.75 + 0.35 * Math.sin(t * 3.2 + i * 2.1), k));
  },
};
