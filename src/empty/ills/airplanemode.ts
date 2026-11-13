// Airplane mode is on: a big plane mark standing upright, nose up, cut thick like an icon. Hover and it lifts off and banks gently from side to side.
import { SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const YAW = -0.42, KX = Math.cos(YAW) + Math.sin(YAW);
// the right half of the mark, nose to tail, in [x, z]
const HALF: P2[] = [[0, 35], [1.8, 33.4], [2.5, 30], [2.5, 22], [15.5, 13.5], [15.5, 10.4], [2.5, 15], [2.2, 6.5], [7, 2.6], [7, 0.2], [0, 1.8]];
const PROF: P2[] = [...HALF, ...HALF.slice(1, -1).reverse().map(([x, z]) => [-x, z] as P2)];

export const airplanemode: Illustration = {
  k: "airplanemode", name: "Airplane mode", title: "Airplane mode is on", body: "Turn off airplane mode to connect again and sync your latest changes.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h / 0.6), lift = 3 * k + h * Math.sin(t * 2) * 0.5;
    p.translate(0, 0, -18);
    p.shadow(0, 0, 26 - 3 * k, 9, 0.12);
    p.rotate("z", YAW);
    p.translate(0, 0, lift);
    p.rotate("y", h * Math.sin(t * 1.6) * 0.12 + 0.1 * k, [0, 0, 17]);
    // the edge going back: lit where it faces up, shaded where it faces the side
    const T = 2.6, n = PROF.length;
    for (let i = 0; i < n; i++) {
      const [x0, z0] = PROF[i], [x1, z1] = PROF[(i + 1) % n];
      const L = Math.hypot(x1 - x0, z1 - z0) || 1, nx = (z1 - z0) / L, nz = -(x1 - x0) / L;
      if (nx * KX + nz <= 0.001) continue;
      p.face([[x0, 0, z0], [x1, 0, z1], [x1, -T, z1], [x0, -T, z0]], nz > 0.3 ? 0.24 : 0.065, 0);
    }
    p.face(PROF.map(([x, z]) => [x, 0, z] as V3), 0.22, SH.edge, 0.6);
    // a window line down the body
    p.line([[0, 0.05, 30], [0, 0.05, 17]], SH.edge, 0.9);
  },
};
