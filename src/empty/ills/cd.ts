// Nothing burned yet: a disc standing on its edge with a bright hub. It spins, a pair of light sheens sweeping round its face, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3, R = 18, RH = 5.2, RI = 2.4, T = 1.4; // seconds per turn of the sheen, outer, hub and hole radius, thickness

export const cd: Illustration = {
  k: "cd", name: "Disc", title: "Nothing burned yet", body: "Burn files to a disc and the finished ones will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t % P) / P;
    p.translate(0, 0, -1);
    p.push(); p.translate(0, 0, -R); p.shadow(0, 0, 22, 8, 0.11); p.pop();
    p.translate(0, 0, Math.sin(ph * Math.PI * 4) * 0.3);
    p.rotate("z", -0.55);
    const C: V3 = [0, 0, 0];
    // the rim: the back face and the thickness, then the face
    p.ringV("y", [0, -T, 0], R, SH.right, SH.edge, 0.55);
    for (let y = -T + 0.35; y < 0; y += 0.35) p.ringV("y", [0, y, 0], R, 0.08, 0);
    p.ringV("y", C, R, 0.07, SH.edge, 0.65);
    // two opposite sheens: bright wedges sweeping round (a half turn repeats the picture)
    const y = 0.06;
    const wedge = (a0: number, w: number): V3[] => {
      const pts: V3[] = [];
      for (let i = 0; i <= 10; i++) { const a = a0 + (w * i) / 10; pts.push([Math.cos(a) * (R - 1.2), y, Math.sin(a) * (R - 1.2)]); }
      for (let i = 10; i >= 0; i--) { const a = a0 + (w * i) / 10; pts.push([Math.cos(a) * (RH + 1.5), y, Math.sin(a) * (RH + 1.5)]); }
      return pts;
    };
    const a = -ph * Math.PI;
    p.face(wedge(a, 0.75), 0.32, 0);
    p.face(wedge(a + Math.PI, 0.75), 0.32, 0);
    // the hub: a dark ring, a bright collar, the hole
    p.ringV("y", [0, y + 0.02, 0], RH + 1.2, 0, SH.edge, 0.9);
    p.ringV("y", [0, y + 0.03, 0], RH, 0.3, 0);
    p.ringV("y", [0, y + 0.04, 0], RI, 0.02, SH.edge, 0.6);
  },
};
