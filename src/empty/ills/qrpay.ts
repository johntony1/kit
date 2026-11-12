// No QR payments yet: a counter stand showing a QR code. A scan line sweeps up and down it, and the code lights up below the line.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 3.2, M = 2, N = 9; // seconds per loop, module size, modules per side
const F = 0.83, X0 = -9, Z0 = 6.5; // the face of the panel, the code's bottom left corner
const on = (i: number, j: number) => ((i * 7 + j * 13 + ((i * j) % 5) * 3 + (i ^ j)) % 3) !== 0;
const quad = (x: number, z: number, w: number, hgt: number, y = F): V3[] => [[x, y, z], [x + w, y, z], [x + w, y, z + hgt], [x, y, z + hgt]];

// a finder square: a bright frame, a dark gap, a bright core
function finder(p: Pen, i: number, j: number) {
  const x = X0 + i * M, z = Z0 + j * M;
  p.face(quad(x, z, 3 * M, 3 * M, F + 0.02), 0.9, SH.edge, 0.4);
  p.face(quad(x + 1.1, z + 1.1, 3 * M - 2.2, 3 * M - 2.2, F + 0.04), 0.03, 0);
  p.face(quad(x + 2.1, z + 2.1, 3 * M - 4.2, 3 * M - 4.2, F + 0.06), 0.9, 0);
}

export const qrpay: Illustration = {
  k: "qrpay", name: "QR payment", title: "No QR payments yet", body: "Show your code at the counter and payments scanned from it will appear here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -15);
    p.shadow(0, 1, 24, 12, 0.1);
    p.rotate("z", -0.58);
    // the stand: a foot and an upright panel
    p.box(-12.5, -4, 0, 25, 9.5, 2.6);
    p.box(-11.5, -0.8, 2.6, 23, 1.6, 26, { top: 0.2, left: 0.035, right: 0.065, lw: 0.6 });
    // the scan line's height
    const zs = Z0 - 1 + (N * M + 2) * (0.5 - 0.5 * Math.cos(u * Math.PI * 2));
    // the code: lit below the line, faint above it
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      if ((i < 3 && j < 3) || (i < 3 && j > N - 4) || (i > N - 4 && j > N - 4)) continue;
      if (!on(i, j)) continue;
      const lit = Z0 + j * M + M / 2 < zs;
      p.face(quad(X0 + i * M + 0.15, Z0 + j * M + 0.15, M - 0.3, M - 0.3, F + 0.02), lit ? 0.9 : 0.065, 0);
    }
    finder(p, 0, 0); finder(p, 0, N - 3); finder(p, N - 3, N - 3);
    // the line itself, a bright bar reaching past the code, with a marker at each end
    p.face(quad(-11.5, zs - 0.35, 23, 0.7, F + 0.1), 1, 0);
    p.face([[-11.5, F + 0.1, zs], [-13.4, F + 0.1, zs + 1.2], [-13.4, F + 0.1, zs - 1.2]], 1, 0);
    p.face([[11.5, F + 0.1, zs], [13.4, F + 0.1, zs + 1.2], [13.4, F + 0.1, zs - 1.2]], 1, 0);
  },
};
