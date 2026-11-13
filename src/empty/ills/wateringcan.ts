// Nothing to water: a round watering can with a long spout and a top handle. It tips forward, pours a few drops from the rose and rights itself, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const wateringcan: Illustration = {
  k: "wateringcan", name: "Watering can", title: "Nothing to water", body: "Add your first plant and its watering days will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // tip forward, hold, come back
    const tip = u < 0.3 ? ease(u / 0.3) : u < 0.62 ? 1 : u < 0.9 ? 1 - ease((u - 0.62) / 0.28) : 0;
    p.translate(-5, 0, -13);
    p.shadow(0, 0, 24, 11, 0.12);
    // the drops: falling from the rose while the can is tipped (drawn in the flat plane, before the can turns)
    const R = 9, H = 14; // body radius, height
    p.push();
    p.rotate("z", -Math.PI / 4); // local x runs right on screen, y toward us, z up
    const pivot: V3 = [R, 0, 0];
    const a = 0.42 * tip;
    const rose = (lx: number, lz: number): [number, number] => {
      const dx = lx - pivot[0], dz = lz - pivot[2];
      return [pivot[0] + dx * Math.cos(a) + dz * Math.sin(a), pivot[2] - dx * Math.sin(a) + dz * Math.cos(a)];
    };
    const [rx, rz] = rose(24.4, 16);
    for (let i = 0; i < 4; i++) {
      const k = (u * 3 + i / 4) % 1, on = u > 0.22 && u < 0.78 ? 1 : 0;
      if (!on) continue;
      p.dot([rx + 1.2 + (i % 2) * 1.4 + k * 1.2, 2, rz - 2 - k * (rz - 1)], 1.3 - 0.4 * k, 1);
    }
    p.rotate("y", a, pivot);
    // the spout: a tapered tube out of the lower front, rising to the rose
    const sp: P2[] = [[5, 2], [19.4, 16.4], [22.2, 13.6], [8, 1.2]];
    p.face(sp.map(([x, z]) => [x, 1, z] as V3), 0.2, 0);
    p.line([[8.6, 1.05, 4.2], [20.8, 1.05, 15]] as V3[], SH.edge, 0.55);
    // the rose: a flared head on the spout's end
    p.face(([[18.2, 17.4], [22.6, 22.4], [27.4, 17.6], [22.4, 12.6]] as P2[]).map(([x, z]) => [x, 1.1, z] as V3), 0.28, SH.edge, 0.6);
    p.rotate("z", Math.PI / 4);
    // the body, then the top: a lid opening at the back, the handle arching over
    p.cylinder(0, 0, 0, R, H, { side: 0.12, top: 0.2, edge: 0 });
    p.line(Array.from({ length: 21 }, (_, i) => { const b = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(b) * (R + 0.02), Math.sin(b) * (R + 0.02), H * 0.28] as V3; }), SH.edge, 0.55);
    // a shaded flank on the right of the body
    p.face([...Array.from({ length: 11 }, (_, i) => { const b = -Math.PI / 4 + (i / 10) * 0.9; return [Math.cos(b) * (R + 0.04), Math.sin(b) * (R + 0.04), 0] as V3; }), ...Array.from({ length: 11 }, (_, i) => { const b = -Math.PI / 4 + ((10 - i) / 10) * 0.9; return [Math.cos(b) * (R + 0.04), Math.sin(b) * (R + 0.04), H] as V3; })], 0.065, 0);
    p.disc(-3, -3, H + 0.02, 3.4, 0.03);
    p.rotate("z", -Math.PI / 4);
    // the handle: a thick arch from the back of the top to the front
    const arch: V3[] = [];
    for (let i = 0; i <= 16; i++) { const b = (i / 16) * Math.PI; arch.push([Math.cos(b) * 7.5 - 1, 0, H + Math.sin(b) * 9]); }
    for (let i = 16; i >= 0; i--) { const b = (i / 16) * Math.PI; arch.push([Math.cos(b) * 5.4 - 1, 0, H + Math.sin(b) * 6.9]); }
    p.face(arch, 0.22, SH.edge, 0.6);
    p.pop();
  },
};
