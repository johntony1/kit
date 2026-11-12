// Hard drive: an opened drive facing us, one big bright platter with its hub and the read arm across it, in a rounded case. The platter spins and the arm sweeps over it.
import { type Illustration, type V3 } from "../dots";

const PER = 3.2, WX = 14, HZ = 39, T = 2.4, F = T + 0.03; // loop seconds, half width, height, half thickness, the front plane
const CZ = 24.6, R = 11.4; // the platter's centre height and radius
const circ = (cx: number, cz: number, r: number, y: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });
// the case's outline: a rounded rectangle standing in the plane y
function shell(y: number): V3[] {
  const r = 3.6, o: V3[] = [];
  const cs: [number, number, number][] = [[WX - r, HZ - r, 0], [-WX + r, HZ - r, 0.5], [-WX + r, r, 1], [WX - r, r, 1.5]];
  for (const [x, z, q] of cs) for (let i = 0; i <= 6; i++) { const a = (q + i / 12) * Math.PI; o.push([x + Math.cos(a) * r, y, z + Math.sin(a) * r]); }
  return o;
}

export const harddrive: Illustration = {
  k: "harddrive", name: "Hard drive", title: "No drives mounted", body: "Mount a drive and it will be listed here with its free space.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / PER) % 1, spin = ph * Math.PI * 2;
    p.translate(0, 0, -19);
    p.shadow(0, 0, 24, 10, 0.11);
    p.rotate("z", -0.62); // turned so its open side faces us
    // the case: a bright rim round a shaded inside
    for (let y = -T; y < T; y += p.ink ? T * 2 : 0.4) p.face(shell(y), 0.3, 0);
    p.face(shell(T), 0.3, 0);
    const inner = shell(F).map(([x, y, z]) => [x * 0.9, y, HZ / 2 + (z - HZ / 2) * 0.93] as V3);
    p.face(inner, 0.1, 0);
    // the platter: a dark gap round it, two marks that turn, a hub
    p.clear(circ(0, CZ, R + 1.1, F + 0.01));
    p.face(circ(0, CZ, R, F + 0.02), 0.3, 0);
    for (const a of [spin, spin + Math.PI]) p.line([[Math.cos(a) * 5, F + 0.03, CZ + Math.sin(a) * 5], [Math.cos(a) * 9.6, F + 0.03, CZ + Math.sin(a) * 9.6]], 1, 0.9);
    p.clear(circ(0, CZ, 3.6, F + 0.03));
    p.face(circ(0, CZ, 2, F + 0.04), 0.3, 0);
    // the arm: a bold wedge from its pivot in the lower corner, reaching over the platter
    const px = 8, pz = 6.6, th = Math.atan2(13, -8.5) + 0.2 * Math.sin(spin), L = 16;
    const dx = Math.cos(th), dz = Math.sin(th), nx = -dz, nz = dx;
    const at = (d: number, n: number): V3 => [px + dx * d + nx * n, F + 0.05, pz + dz * d + nz * n];
    const arm = [at(-3.2, 2.6), at(0, 3.2), at(L, 1), at(L, -1), at(0, -3.2), at(-3.2, -2.6)];
    p.face(arm, 0.3, 0);
    p.line([...arm, arm[0]], 1, 1);
    p.dot(at(0, 0), 1.3, 0);
    // a screw in the far lower corner
    p.dot([-9, F + 0.05, 4.6], 1.1, 1);
  },
};
